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
using Humanizer;

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


		public async Task<Result<QuestionGroupResponseDto?>> GetDetailAsync(int id, Guid? userId = null, bool isAdmin = false)
		{
			try
			{
				// Check ownership - only creator or admin can view
				if (!isAdmin && userId.HasValue)
				{
					var group = await _uow.QuestionGroups.GetByIdAndStatusAsync(id, CommonStatus.Active);
					if (group != null && group.CreatedById != userId.Value)
						return Result<QuestionGroupResponseDto?>.Failure("Bạn không có quyền xem nhóm câu hỏi này.");
				}

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
		public async Task<Result<string>> CreateAsync(QuestionGroupRequestDto request, Guid creatorId)
		{

			var validationResult = await ValidateCreateQuestionsGroup(request);
			if (!validationResult.IsSuccess)
				return validationResult;

			await _uow.BeginTransactionAsync();
			var uploadedFiles = new List<string>(); // Danh sách lưu trữ các URL file đã upload
			var part = await _uow.Parts.GetByIdAsync(request.PartId);
			bool isSpeakingOrWriting = part != null &&
				(part.Skill == QuestionSkill.Speaking || part.Skill == QuestionSkill.Writing);

			try
			{
				// Upload files audio (nếu có)
				string? audioUrl = null;
				if (request.Audio != null && request.Audio is { Length: > 0 })
				{
					// Check valid file
					var (ok, err) = FileValidator.ValidateFile(request.Audio, "audio");
					if (!ok) { return Result<string>.Failure(err); }

					// Upload
					var upload = await _fileService.UploadFileAsync(request.Audio, "audio");
					if (!upload.IsSuccess) { return Result<string>.Failure(ErrorMessages.UploadAudioFail); }

					audioUrl = upload.Data;
					uploadedFiles.Add(audioUrl);
				}

				// Upload files image (nếu có)
				string? imageUrl = null;
				if (request.Image != null && request.Image is { Length: > 0 })
				{
					// Check valid file
					var (ok, err) = FileValidator.ValidateFile(request.Image, "image");
					if (!ok) { return Result<string>.Failure(err); }

					// Upload
					var upload = await _fileService.UploadFileAsync(request.Image, "image");
					if (!upload.IsSuccess) { return Result<string>.Failure(ErrorMessages.UploadImageFail); }

					imageUrl = upload.Data;
					uploadedFiles.Add(imageUrl);
				}

				// Entity question group
				var group = new QuestionGroup
				{
					PartId = request.PartId,
					AudioUrl = audioUrl,
					ImageUrl = imageUrl,
					PassageContent = request.PassageContent,
					CreatedById = creatorId
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
						Status = CommonStatus.Active,
						CreatedById = creatorId
					};

					await _uow.Questions.AddAsync(question);

					// Bỏ qua option nếu là SPEAKING hoặc WRITING
					if (!isSpeakingOrWriting)
					{
						var options = q.AnswerOptions.Select(opt => new Option
						{
							Content = opt.Content,
							Label = opt.Label,
							IsCorrect = opt.IsCorrect,
							Question = question
						}).ToList();

						await _uow.Options.AddRangeAsync(options);
					}
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

		public async Task<Result<PaginationResponse<QuestionListItemDto>>> FilterQuestionGroupAsync(int? partId, string? keyWord, int? skill, string sortOrder, int page, int pageSize, CommonStatus status, Guid? creatorId = null)
		{
			try
			{
				var result = await _uow.QuestionGroups.FilterGroupAsync(partId, keyWord, skill, sortOrder, page, pageSize, status);
				return Result<PaginationResponse<QuestionListItemDto>>.Success(result);
			}
			catch (Exception ex)
			{
				return Result<PaginationResponse<QuestionListItemDto>>.Failure(ex.Message);
			}
		}

		public async Task<Result<string>> UpdateAsync(int questionGroupId, UpdateQuestionGroupDto dto, Guid userId, bool isAdmin = false)
		{
			// Check exist question
			var currentQuestionGroup = await _uow.QuestionGroups.GetByIdAndStatusAsync(questionGroupId, CommonStatus.Active);
			if (currentQuestionGroup == null) return Result<string>.Failure("Không tìm thấy nhóm câu hỏi");

			// Check ownership - only creator or admin can update
			if (!isAdmin && currentQuestionGroup.CreatedById != userId)
				return Result<string>.Failure("Bạn không có quyền sửa nhóm câu hỏi này.");

			// check valid listening part
			var part = await _uow.Parts.GetByIdAsync(dto.PartId);
			if (part != null && part.Skill == QuestionSkill.Listening)
			{
				// FIX: only require audio when neither new file is provided nor question already has audio
				var hasExistingAudio = !string.IsNullOrEmpty(currentQuestionGroup.AudioUrl);
				var hasNewAudio = dto.Audio != null && dto.Audio.Length > 0;
				if (!hasExistingAudio && !hasNewAudio)
				{
					return Result<string>.Failure("Phần Listening part yêu cầu phải có file âm thanh.");
				}
			}
			bool isSpeakingOrWriting = part != null && (part.Skill == QuestionSkill.Speaking || part.Skill == QuestionSkill.Writing);

			var validationResult = await ValidateUpdateQuestionsGroup(dto);
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
					if (!upload.IsSuccess) { return Result<string>.Failure(ErrorMessages.UploadImageFail); }

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
					if (!upload.IsSuccess) { return Result<string>.Failure(ErrorMessages.UploadAudioFail); }

					newAudioUrl = upload.Data;
					uploadedFiles.Add(newAudioUrl);

					if (!string.IsNullOrEmpty(currentQuestionGroup.AudioUrl))
						filesToDelete.Add(currentQuestionGroup.AudioUrl);
				}

				// Update question 
				currentQuestionGroup.PartId = dto.PartId;
				currentQuestionGroup.PassageContent = dto.PassageContent;
				currentQuestionGroup.UpdatedAt = UtcNow;

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
						q.UpdatedAt = UtcNow;

						// Speaking & Writing ko cần option
						if (isSpeakingOrWriting)
						{
							continue;
						}

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
							old.UpdatedAt = UtcNow;
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
								opt.UpdatedAt = UtcNow;
							}
							else
							{
								q.Options.Add(new Option
								{
									Label = oDto.Label,
									Content = oDto.Content,
									IsCorrect = oDto.IsCorrect,
									Status = CommonStatus.Active,
									CreatedAt = UtcNow
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
							CreatedAt = UtcNow
						};

						// SPEAKING/WRITING: không thêm option
						if (!isSpeakingOrWriting)
						{
							newQ.Options = qDto.AnswerOptions.Select(o => new Option
							{
								Label = o.Label,
								Content = o.Content,
								IsCorrect = o.IsCorrect,
								Status = CommonStatus.Active,
								CreatedAt = UtcNow
							}).ToList();

							var newQuestionOptions = newQ.Options
								.Where(o => o.Status != CommonStatus.Inactive)
								.ToList();

							var (ok, err) = OptionValidator.IsValid(newQuestionOptions, NumberConstants.MaxQuantityOption);
							if (!ok)
							{
								await _fileService.RollbackAndCleanupAsync(uploadedFiles);
								return Result<string>.Failure(err);
							}
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

		// validate update
		private async Task<Result<string>> ValidateUpdateQuestionsGroup(UpdateQuestionGroupDto request)
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
			// Identify skills
			bool isSpeakingOrWriting = part != null && (part.Skill == QuestionSkill.Speaking || part.Skill == QuestionSkill.Writing);
			// check part 1,2 Listening
			bool isLRPart12 = part != null && part.Skill == QuestionSkill.Listening && (part.PartNumber == 1 || part.PartNumber == 2);
			bool isLRPart6 = part != null && part.Skill == QuestionSkill.Reading && (part.PartNumber == 6);
			bool isLRPart34 = part != null && part.Skill == QuestionSkill.Listening && (part.PartNumber == 3 || part.PartNumber == 4);

			if (!isLRPart34 && string.IsNullOrWhiteSpace(request.PassageContent))
			{
				return Result<string>.Failure("Passage của nhóm câu hỏi không được để trống.");
			}

			foreach (var q in request.Questions)
			{
				if (!isLRPart6 && !isLRPart12 && string.IsNullOrWhiteSpace(q.Content))
				{
					return Result<string>.Failure("Content của câu hỏi không được để trống.");
				}
				// Bỏ validate option nếu Speaking hoặc Writing
				if (isSpeakingOrWriting)
					continue;

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

		// validate create 
		private async Task<Result<string>> ValidateCreateQuestionsGroup(QuestionGroupRequestDto request)
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
			// Listening part yêu cầu file audio
			if (part != null && part.Skill == QuestionSkill.Listening)
			{
				if (request.Audio == null || request.Audio.Length == 0)
				{
					return Result<string>.Failure("Phần Listening part yêu cầu phải có file âm thanh.");
				}
			}
			bool isSpeakingOrWriting = part != null && (part.Skill == QuestionSkill.Speaking || part.Skill == QuestionSkill.Writing);

			// check part 1,2 Listening
			bool isLRPart12 = part != null && part.Skill == QuestionSkill.Listening && (part.PartNumber == 1 || part.PartNumber == 2);
			bool isLRPart6 = part != null && part.Skill == QuestionSkill.Reading && (part.PartNumber == 6);
			bool isLRPart34 = part != null && part.Skill == QuestionSkill.Listening && (part.PartNumber == 3 || part.PartNumber == 4);

			if (!isLRPart34 && string.IsNullOrWhiteSpace(request.PassageContent))
			{
				return Result<string>.Failure("Passage của nhóm câu hỏi không được để trống.");
			}
			foreach (var q in request.Questions)
			{
				if (!isLRPart6 && !isLRPart12 && string.IsNullOrWhiteSpace(q.Content))
				{
					return Result<string>.Failure("Content của câu hỏi không được để trống.");
				}
				// Bỏ validate option nếu Speaking hoặc Writing
				if (isSpeakingOrWriting)
					continue;
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