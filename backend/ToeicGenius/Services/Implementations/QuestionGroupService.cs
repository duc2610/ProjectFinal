using Azure.Core;
using Humanizer;
using System.ComponentModel.DataAnnotations;
using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.DTOs.Requests.GroupQuestion;
using ToeicGenius.Domains.DTOs.Requests.Question;
using ToeicGenius.Domains.DTOs.Requests.QuestionGroup;
using ToeicGenius.Domains.DTOs.Responses.QuestionGroup;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Domains.Enums;
using ToeicGenius.Repositories.Implementations;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Services.Interfaces;
using ToeicGenius.Shared.Constants;
using ToeicGenius.Shared.Validators;

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


		public async Task<QuestionGroupResponseDto?> GetQuestionGroupResponseByIdAsync(int id)
		{
			return await _uow.QuestionGroups.GetGroupWithQuestionsAsync(id);
		}

		/// <summary>
		/// CREATE QUESTION GROUP
		/// Tạo mới một nhóm câu hỏi (e.g. Part 6, Part 7,...) kèm các câu hỏi con 
		/// Xử lý upload file và rollback file nếu có lỗi
		/// </summary>
		public async Task<Result<string>> CreateQuestionGroupAsync(QuestionGroupRequestDto request)
		{
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
					PassageType = request.PassageType,
					OrderIndex = request.OrderIndex,
				};

				await _uow.QuestionGroups.AddAsync(group);

				var questions = new List<Question>();
				var options = new List<Option>();

				// Thêm questions và gán vào group
				for (int i = 0; i < request.Questions.Count; i++)
				{
					var q = request.Questions[i];

					// Entity question
					var question = new Question
					{
						QuestionGroup = group,
						QuestionTypeId = q.QuestionTypeId,
						PartId = request.PartId,
						Content = q.Content,
						Number = q.Number,
						Explanation = q.Solution,
					};
					questions.Add(question);
					group.Questions.Add(question);

					// Option for question (nếu có)
					if (q.AnswerOptions != null && q.AnswerOptions.Any())
					{
						options.AddRange(q.AnswerOptions.Select(opt => new Option
						{
							Content = opt.Content,
							Label = opt.Label,
							IsCorrect = opt.IsCorrect,
							Question = question
						}));
					}
				}

				// Bulk insert 
				await _uow.Questions.AddRangeAsync(questions);

				// Check validate options
				if (options.Any())
				{
					// Check valid option for each part 
					// vd: L&R-Part 2: only 3 options for each question
					var (isValid, errorMessage) = OptionValidator.IsValid(options, NumberConstants.MaxQuantityOption);
					if (!isValid) throw new Exception(errorMessage);

					await _uow.Options.AddRangeAsync(options);
				}

				await _uow.SaveChangesAsync(); // Commit all: group, questions, options

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

		public async Task<Result<PaginationResponse<QuestionGroupListItemDto>>> FilterGroupsAsync(int? part, int page, int pageSize)
		{
			var result = await _uow.QuestionGroups.FilterGroupsAsync(part, page, pageSize);
			return Result<PaginationResponse<QuestionGroupListItemDto>>.Success(result);
		}

		public async Task<Result<string>> UpdateAsync(int questionGroupId, UpdateQuestionGroupDto request)
		{
			await _uow.BeginTransactionAsync();
			var uploadedFiles = new List<string>(); // Danh sách lưu trữ các URL file đã upload
			var filesToDelete = new List<string>(); // Danh sách file cũ cần xóa

			try
			{
				// Check exist question
				var currentQuestionGroup = await _uow.QuestionGroups.GetByIdAndStatusAsync(questionGroupId, CommonStatus.Active);
				if (currentQuestionGroup == null) return Result<string>.Failure("Not found question group to update");

				if (!string.IsNullOrEmpty(currentQuestionGroup.AudioUrl)) filesToDelete.Add(currentQuestionGroup.AudioUrl);
				if (!string.IsNullOrEmpty(currentQuestionGroup.ImageUrl)) filesToDelete.Add(currentQuestionGroup.ImageUrl);

				// Upload new file
				var imageUrl = "";
				var audioUrl = "";

				// Image: If have
				if (request.Image != null)
				{
					// Check valid file
					var (isValid, errorMessage) = FileValidator.ValidateFile(request.Image, "image");
					if (!isValid) { return Result<string>.Failure(errorMessage); }

					// Upload
					var result = await _fileService.UploadFileAsync(request.Image, "image");
					if (!result.IsSuccess) { return Result<string>.Failure($"Failed to upload image file."); }

					imageUrl = result.Data;
					uploadedFiles.Add(imageUrl);
				}

				// Audio: If have
				if (request.Audio != null)
				{
					// Check valid file
					var (isValid, errorMessage) = FileValidator.ValidateFile(request.Audio, "audio");
					if (!isValid) { return Result<string>.Failure(errorMessage); }

					// Upload
					var result = await _fileService.UploadFileAsync(request.Image, "audio");
					if (!result.IsSuccess) { return Result<string>.Failure($"Failed to upload audio file."); }

					audioUrl = result.Data;
					uploadedFiles.Add(audioUrl);
				}

				// Update question 
				currentQuestionGroup.PartId = request.PartId;
				currentQuestionGroup.PassageContent = request.PassageContent;
				currentQuestionGroup.PassageType = request.PassageType;
				currentQuestionGroup.OrderIndex = request.OrderIndex;
				currentQuestionGroup.AudioUrl = audioUrl;
				currentQuestionGroup.ImageUrl = imageUrl;
				currentQuestionGroup.UpdatedAt = DateTime.UtcNow;


				var questions = new List<Question>();
				var existingQuestion = currentQuestionGroup.Questions.ToDictionary(q => q.QuestionId, q => q);
				foreach (var qDto in request.Questions)
				{
					if (qDto.Id.HasValue && existingQuestion.ContainsKey(qDto.Id.Value))
					{
						var currentQuestion = existingQuestion[qDto.Id.Value];
						currentQuestion.PartId = request.PartId;
						currentQuestion.QuestionGroupId = questionGroupId;
						currentQuestion.QuestionTypeId = qDto.QuestionTypeId;
						currentQuestion.Content = qDto.Content;
						currentQuestion.Explanation = qDto.Solution;
						currentQuestion.Number = qDto.Number;
						currentQuestion.UpdatedAt = DateTime.UtcNow;

						// Xử lý option
						var existingOptions = currentQuestion.Options.ToDictionary(o => o.OptionId, o => o);
						var optionsToAdd = new List<Option>();
						foreach (var opt in qDto.AnswerOptions)
						{
							if (opt.Id.HasValue && existingOptions.ContainsKey(opt.Id.Value))
							{
								var option = existingOptions[opt.Id.Value];
								option.Content = opt.Content;
								option.Label = opt.Label;
								option.IsCorrect = opt.IsCorrect;
								option.UpdatedAt = DateTime.UtcNow;
							}
							else
							{
								optionsToAdd.Add(new Option
								{
									Content = opt.Content,
									Label = opt.Label,
									IsCorrect = opt.IsCorrect,
									Question = currentQuestion,
									Status = CommonStatus.Active
								});
							}
						}
						// Validate option
						if (optionsToAdd.Any())
						{
							var (isValid, errorMessage) = OptionValidator.IsValid(optionsToAdd, NumberConstants.MaxQuantityOption);
							if (!isValid) throw new Exception(errorMessage);

							await _uow.Options.AddRangeAsync(optionsToAdd);
						}
					}
					else
					{
						var newQuestion = new Question
						{
							PartId = request.PartId,
							QuestionGroup = currentQuestionGroup,
							QuestionTypeId = qDto.QuestionTypeId,
							Content = qDto.Content,
							Explanation = qDto.Solution,
							Number = qDto.Number,
							Status = CommonStatus.Active,
							CreatedAt = DateTime.UtcNow
						};

						// Add options cho question mới
						if (qDto.AnswerOptions != null && qDto.AnswerOptions.Any())
						{
							var options = qDto.AnswerOptions.Select(o => new Option
							{
								Content = o.Content,
								Label = o.Label,
								IsCorrect = o.IsCorrect,
								Question = newQuestion,
								Status = CommonStatus.Active
							}).ToList();

							var (isValid, errorMessage) = OptionValidator.IsValid(options, NumberConstants.MaxQuantityOption);
							if (!isValid) throw new Exception(errorMessage);

							newQuestion.Options = options;
						}

						questions.Add(newQuestion);

					}
				}
				// Add tất cả question mới
				if (questions.Any())
				{
					await _uow.Questions.AddRangeAsync(questions);
				}
				// Delete old files
				foreach (var file in filesToDelete)
				{
					if (!string.IsNullOrEmpty(file)) await _fileService.DeleteFileAsync(file);
				}

				await _uow.SaveChangesAsync(); // Commit tất cả: group, questions, options
				await _uow.CommitTransactionAsync();
				return Result<string>.Success($"QuestionGroup {questionGroupId} updated successfully.");
			}
			catch (Exception ex)
			{
				// Rollback transaction & delete files
				await _fileService.RollbackAndCleanupAsync(uploadedFiles);
				return Result<string>.Failure($"Operation failed: {ex.Message}");
			}
		}

		/// <summary>
		/// Soft delete a QuestionGroup, its Questions, and Options, marking associated files for deletion.
		/// </summary>
		public async Task<Result<string>> DeleteQuestionGroupAsync(int questionGroupId)
		{
			await _uow.BeginTransactionAsync();

			try
			{
				var questionGroup = await _uow.QuestionGroups.GetByIdAndStatusAsync(questionGroupId, CommonStatus.Active);

				if (questionGroup == null)
				{
					return Result<string>.Failure($"QuestionGroup with ID {questionGroupId} not found or already deleted.");
				}

				// Mark QuestionGroup as deleted
				questionGroup.Status = CommonStatus.Inactive;
				questionGroup.UpdatedAt = DateTime.UtcNow;

				// Mark all Questions and their Options as deleted
				foreach (var question in questionGroup.Questions)
				{
					question.Status = CommonStatus.Inactive;
					question.UpdatedAt = DateTime.UtcNow;

					foreach (var option in question.Options)
					{
						option.Status = CommonStatus.Inactive;
						option.UpdatedAt = DateTime.UtcNow;
					}
				}

				await _uow.SaveChangesAsync();
				await _uow.CommitTransactionAsync();
				return Result<string>.Success("");
			}
			catch (Exception ex)
			{
				await _uow.RollbackTransactionAsync();
				return Result<string>.Failure($"Operation failed: {ex.Message}");
			}
		}

	}
}