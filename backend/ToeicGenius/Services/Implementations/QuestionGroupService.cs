using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.DTOs.Requests.GroupQuestion;
using ToeicGenius.Domains.DTOs.Requests.QuestionGroup;
using ToeicGenius.Domains.DTOs.Responses.Question;
using ToeicGenius.Domains.DTOs.Responses.QuestionGroup;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Domains.Enums;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Services.Interfaces;
using ToeicGenius.Shared.Constants;
using static ToeicGenius.Shared.Helpers.DateTimeHelper;
using ToeicGenius.Shared.Validators;
using ToeicGenius.Domains.DTOs.Requests.Exam;
using Azure.Core;

namespace ToeicGenius.Services.Implementations
{
	public class QuestionGroupService : IQuestionGroupService
	{

		private readonly IQuestionService _questionService;
		private readonly IFileService _fileService;
		private readonly IUnitOfWork _uow;

		public QuestionGroupService(
			IQuestionService questionService,
			IFileService fileService,
			IUnitOfWork unitOfWork)
		{
			_questionService = questionService;
			_fileService = fileService;
			_uow = unitOfWork;
		}


		public async Task<Result<QuestionGroupResponseDto?>> GetDetailAsync(int id)
		{
			try
			{
				var result = await _uow.QuestionGroups.GetGroupWithQuestionsAsync(id);
				return Result<QuestionGroupResponseDto?>.Success(result);
			}
			catch (Exception ex)
			{
				return Result<QuestionGroupResponseDto?>.Failure(ex.Message);
			}
		}

		/// <summary>
		/// CREATE QUESTION GROUP
		/// Tạo mới một nhóm câu hỏi (e.g. Part 6, Part 7,...) kèm các câu hỏi con 
		/// Xử lý upload file và rollback file nếu có lỗi
		/// </summary>
		public async Task<Result<string>> CreateAsync(QuestionGroupRequestDto request)
		{
			var validationResult = await ValidateQuestions(request);
			if (!validationResult.IsSuccess)
				return validationResult;

			await _uow.BeginTransactionAsync();
			var uploadedFiles = new List<string>(); // Danh sách lưu trữ các URL file đã upload

			try
			{
				// Upload files audio (nếu có)
				var audioUrl = "";
				if (request.Audio != null)
				{
					// Check valid file
					var (isValid, errorMessage) = FileValidator.ValidateFile(request.Audio, "audio");
					if (!isValid) { return Result<string>.Failure(errorMessage); }

					// Upload
					var result = await _fileService.UploadFileAsync(request.Audio, "audio");
					audioUrl = result.IsSuccess ? result.Data : "";
					uploadedFiles.Add(audioUrl);
				}

				// Upload files image (nếu có)
				var imageUrl = "";
				if (request.Image != null)
				{
					// Check valid file
					var (isValid, errorMessage) = FileValidator.ValidateFile(request.Image, "image");
					if (!isValid) { return Result<string>.Failure(errorMessage); }

					// Upload
					var result = await _fileService.UploadFileAsync(request.Image, "image");
					imageUrl = result.IsSuccess ? result.Data : "";
					uploadedFiles.Add(imageUrl);
				}

				// Entity question group
				var group = new QuestionGroup
				{
					PartId = request.PartId,
					AudioUrl = audioUrl,
					ImageUrl = imageUrl,
					PassageContent = request.PassageContent,
				};

				await _uow.QuestionGroups.AddAsync(group);

				foreach (var q in request.Questions)
				{
					var question = new Question
					{
						QuestionGroup = group,
						QuestionTypeId = q.QuestionTypeId,
						PartId = request.PartId,
						Content = q.Content,
						Explanation = q.Solution,
						Status = CommonStatus.Active
					};

					var options = q.AnswerOptions.Select(opt => new Option
					{
						Content = opt.Content,
						Label = opt.Label,
						IsCorrect = opt.IsCorrect,
						Question = question
					}).ToList();
					await _uow.Questions.AddAsync(question);
					await _uow.Options.AddRangeAsync(options);
					group.Questions.Add(question);
				}

				await _uow.SaveChangesAsync();
				await _uow.CommitTransactionAsync();
				return Result<string>.Success(SuccessMessages.OperationSuccess);
			}
			catch (Exception ex)
			{
				// Rollback transaction & delete files
				await _fileService.RollbackAndCleanupAsync(uploadedFiles);
				return Result<string>.Failure(ErrorMessages.OperationFailed + $": {ex.Message}");
			}
		}

		public async Task<Result<PaginationResponse<QuestionListItemDto>>> FilterQuestionGroupAsync(int? partId, string? keyWord, int? skill, string sortOrder, int page, int pageSize, CommonStatus status)
		{
			var result = await _uow.QuestionGroups.FilterGroupAsync(partId, keyWord, skill, sortOrder, page, pageSize, status);
			return Result<PaginationResponse<QuestionListItemDto>>.Success(result);
		}

		public async Task<Result<string>> UpdateAsync(int questionGroupId, UpdateQuestionGroupDto dto)
		{
			// Check exist question
			var currentQuestionGroup = await _uow.QuestionGroups.GetByIdAndStatusAsync(questionGroupId, CommonStatus.Active);
			if (currentQuestionGroup == null) return Result<string>.Failure("Không tìm thấy nhóm câu hỏi");

			var validationResult = await ValidateQuestions(dto);
			if (!validationResult.IsSuccess)
				return validationResult;

			await _uow.BeginTransactionAsync();
			var uploadedFiles = new List<string>(); // Danh sách lưu trữ các URL file đã upload
			var filesToDelete = new List<string>(); // Danh sách file cũ cần xóa

			try
			{
				string? newImageUrl = null, newAudioUrl = null;

				// Image: If have
				if (dto.Image is { Length: > 0 })
				{
					// Check valid file
					var (ok, err) = FileValidator.ValidateFile(dto.Image, "image");
					if (!ok) { return Result<string>.Failure(err); }

					// Upload
					var upload = await _fileService.UploadFileAsync(dto.Image, "image");
					if (!upload.IsSuccess) { return Result<string>.Failure($"Failed to upload image file."); }

					newImageUrl = upload.Data;
					uploadedFiles.Add(newImageUrl);

					if (!string.IsNullOrEmpty(currentQuestionGroup.ImageUrl))
						filesToDelete.Add(currentQuestionGroup.ImageUrl);
				}

				// Audio: If have
				if (dto.Audio is { Length: > 0 })
				{
					// Check valid file
					var (ok, err) = FileValidator.ValidateFile(dto.Audio, "audio");
					if (!ok) { return Result<string>.Failure(err); }

					// Upload
					var upload = await _fileService.UploadFileAsync(dto.Audio, "audio");
					if (!upload.IsSuccess) { return Result<string>.Failure($"Failed to upload audio file."); }

					newAudioUrl = upload.Data;
					uploadedFiles.Add(newAudioUrl);

					if (!string.IsNullOrEmpty(currentQuestionGroup.AudioUrl))
						filesToDelete.Add(currentQuestionGroup.AudioUrl);
				}

				// Update question 
				currentQuestionGroup.PartId = dto.PartId;
				currentQuestionGroup.PassageContent = dto.PassageContent;
				currentQuestionGroup.UpdatedAt = Now;

				// Chỉ thay khi có file mới
				if (!string.IsNullOrEmpty(newAudioUrl)) currentQuestionGroup.AudioUrl = newAudioUrl;
				if (!string.IsNullOrEmpty(newImageUrl)) currentQuestionGroup.ImageUrl = newImageUrl;

				var existingQuestions = currentQuestionGroup.Questions.ToDictionary(q => q.QuestionId, q => q);

				foreach (var qDto in dto.Questions)
				{
					if (qDto.QuestionId.HasValue && existingQuestions.TryGetValue(qDto.QuestionId.Value, out var q))
					{
						q.Content = qDto.Content;
						q.Explanation = qDto.Solution;
						q.QuestionTypeId = qDto.QuestionTypeId;
						q.UpdatedAt = Now;

						// Xử lý option
						// Update options
						var existingOpts = q.Options.ToDictionary(o => o.OptionId, o => o);
						// build keepIds from DTO but only positive ids (ids <= 0 are treated as "new")
						var keepIds = new HashSet<int>(qDto.AnswerOptions
							.Where(d => d.Id.HasValue && d.Id.Value > 0)
							.Select(d => d.Id!.Value));

						// Soft delete removed
						foreach (var old in q.Options.Where(o => !keepIds.Contains(o.OptionId)))
						{
							old.Status = CommonStatus.Inactive;
							old.UpdatedAt = Now;
						}

						// Upsert
						foreach (var oDto in qDto.AnswerOptions)
						{
							if (oDto.Id.HasValue && existingOpts.TryGetValue(oDto.Id.Value, out var opt))
							{
								opt.Label = oDto.Label;
								opt.Content = oDto.Content;
								opt.IsCorrect = oDto.IsCorrect;
								opt.Status = CommonStatus.Active;
								opt.UpdatedAt = Now;
							}
							else
							{
								q.Options.Add(new Option
								{
									Label = oDto.Label,
									Content = oDto.Content,
									IsCorrect = oDto.IsCorrect,
									Status = CommonStatus.Active,
									CreatedAt = Now
								});
							}
						}
						// Validate
						var validOpts = q.Options.Where(o => o.Status == CommonStatus.Active).ToList();
						var (ok, err) = OptionValidator.IsValid(validOpts, NumberConstants.MaxQuantityOption);
						if (!ok)
						{
							// Rollback transaction & delete files
							await _fileService.RollbackAndCleanupAsync(uploadedFiles);
							return Result<string>.Failure(err);
						}

					}
					else
					{
						// Create new question
						var newQ = new Question
						{
							PartId = dto.PartId,
							QuestionGroup = currentQuestionGroup,
							QuestionTypeId = qDto.QuestionTypeId,
							Content = qDto.Content,
							Explanation = qDto.Solution,
							Status = CommonStatus.Active,
							CreatedAt = Now,
							Options = qDto.AnswerOptions.Select(o => new Option
							{
								Label = o.Label,
								Content = o.Content,
								IsCorrect = o.IsCorrect,
								Status = CommonStatus.Active,
								CreatedAt = Now
							}).ToList()
						};

						var newQuestionOptions = newQ.Options
							.Where(o => o.Status != CommonStatus.Inactive)
							.ToList();
						var (ok, err) = OptionValidator.IsValid(newQuestionOptions, NumberConstants.MaxQuantityOption);
						if (!ok)
						{
							// Rollback transaction & delete files
							await _fileService.RollbackAndCleanupAsync(uploadedFiles);
							return Result<string>.Failure(err);
						}
						currentQuestionGroup.Questions.Add(newQ);
					}
				}
				await _uow.SaveChangesAsync(); // Commit tất cả: group, questions, options
				await _uow.CommitTransactionAsync();

				// Delete old files
				foreach (var file in filesToDelete)
				{
					if (!string.IsNullOrEmpty(file)) await _fileService.DeleteFileAsync(file);
				}
				return Result<string>.Success($"QuestionGroup {questionGroupId} updated successfully.");
			}
			catch (Exception ex)
			{
				// Rollback transaction & delete files
				await _fileService.RollbackAndCleanupAsync(uploadedFiles);
				return Result<string>.Failure($"Operation failed: {ex.Message}");
			}
		}

		private async Task<Result<string>> ValidateQuestions(QuestionGroupRequestDto request)
		{
			// Check valid quantity
			var quantityQuestion = request.Questions.Count();
			if (quantityQuestion > NumberConstants.MaxQuantityQuestionInGroup
				|| quantityQuestion < NumberConstants.MinQuantityQuestionInGroup)
			{
				return Result<string>.Failure("Một nhóm câu hỏi phải có từ 2 đến 5 câu hỏi đơn.");
			}

			// check valid listening part
			var part = await _uow.Parts.GetByIdAsync(request.PartId);
			if (part != null && part.Skill == QuestionSkill.Listening)
			{
				if (request.Audio == null || request.Audio.Length == 0)
				{
					return Result<string>.Failure("Phần Listening part yêu cầu phải có file âm thanh.");
				}
			}
			// check part 1,2 Listening
			bool isLRPart12 = part != null && part.Skill == QuestionSkill.Listening && (part.PartNumber == 1 || part.PartNumber == 2);

			foreach (var q in request.Questions)
			{
				if (!isLRPart12 && string.IsNullOrWhiteSpace(q.Content))
				{
					return Result<string>.Failure("Content của câu hỏi không được để trống.");
				}
				// Nếu có đáp án
				if (q.AnswerOptions != null && q.AnswerOptions.Any())
				{
					foreach (var opt in q.AnswerOptions)
					{
						if (!isLRPart12 && string.IsNullOrWhiteSpace(opt.Content))
						{
							return Result<string>.Failure("Content của option không được để trống.");
						}
					}
					var options = q.AnswerOptions.Select(opt => new Option
					{
						Content = opt.Content,
						Label = opt.Label,
						IsCorrect = opt.IsCorrect,
					}).ToList();

					// Validate option
					var (isValid, errorMessage) = OptionValidator.IsValid(options, NumberConstants.MaxQuantityOption);
					if (!isValid)
						return Result<string>.Failure(errorMessage);
				}
			}

			return Result<string>.Success("Validation passed");
		}
		private async Task<Result<string>> ValidateQuestions(UpdateQuestionGroupDto request)
		{
			// Check valid quantity
			var quantityQuestion = request.Questions.Count();
			if (quantityQuestion > NumberConstants.MaxQuantityQuestionInGroup
				|| quantityQuestion < NumberConstants.MinQuantityQuestionInGroup)
			{
				return Result<string>.Failure("Một nhóm câu hỏi phải có từ 2 đến 5 câu hỏi đơn.");
			}

			// check valid listening part
			var part = await _uow.Parts.GetByIdAsync(request.PartId);
			if (part != null && part.Skill == QuestionSkill.Listening)
			{
				if (request.Audio == null || request.Audio.Length == 0)
				{
					return Result<string>.Failure("Phần Listening part yêu cầu phải có file âm thanh.");
				}
			}
			// check part 1,2 Listening
			bool isLRPart12 = part != null && part.Skill == QuestionSkill.Listening && (part.PartNumber == 1 || part.PartNumber == 2);

			foreach (var q in request.Questions)
			{
				if (!isLRPart12 && string.IsNullOrWhiteSpace(q.Content))
				{
					return Result<string>.Failure("Content của câu hỏi không được để trống.");
				}
				// Nếu có đáp án
				if (q.AnswerOptions != null && q.AnswerOptions.Any())
				{
					foreach (var opt in q.AnswerOptions)
					{
						if (!isLRPart12 && string.IsNullOrWhiteSpace(opt.Content))
						{
							return Result<string>.Failure("Content của option không được để trống.");
						}
					}
					var options = q.AnswerOptions.Select(opt => new Option
					{
						Content = opt.Content,
						Label = opt.Label,
						IsCorrect = opt.IsCorrect,
					}).ToList();

					// Validate option
					var (isValid, errorMessage) = OptionValidator.IsValid(options, NumberConstants.MaxQuantityOption);
					if (!isValid)
						return Result<string>.Failure(errorMessage);
				}
			}

			return Result<string>.Success("Validation passed");
		}
	}
}