using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Services.Interfaces;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Domains.DTOs.Responses.Question;
using ToeicGenius.Domains.DTOs.Requests.Question;
using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.DTOs.Responses.QuestionGroup;
using ToeicGenius.Shared.Constants;
using ToeicGenius.Shared.Validators;
using ToeicGenius.Domains.Enums;
using Azure.Core;
using Amazon.Runtime.Internal;

namespace ToeicGenius.Services.Implementations
{
	public class QuestionService : IQuestionService
	{
		private readonly IUnitOfWork _uow;
		private readonly IFileService _fileService;

		public QuestionService(IUnitOfWork unitOfWork, IFileService fileService)
		{
			_fileService = fileService;
			_uow = unitOfWork;
		}

		public async Task<QuestionResponseDto> GetByIdAsync(int id)
		{
			return await _uow.Questions.GetQuestionResponseByIdAsync(id);
		}

		public async Task<IEnumerable<Question>> GetAllAsync()
		{
			return await _uow.Questions.GetAllAsync();
		}

		public async Task<Result<string>> CreateAsync(CreateQuestionDto request)
		{
			await _uow.BeginTransactionAsync();
			var uploadedFiles = new List<string>(); // Danh sách lưu trữ các URL file đã upload
			try
			{
				// Upload audio file for question (nếu có)
				var audioUrl = "";
				if (request.Audio != null)
				{
					var (isValid, errorMessage) = FileValidator.ValidateFile(request.Audio, "audio");
					if (!isValid)
					{
						return Result<string>.Failure(errorMessage);
					}
					var result = await _fileService.UploadFileAsync(request.Audio, "audio");
					audioUrl = result.IsSuccess ? result.Data : "";
					uploadedFiles.Add(audioUrl);
				}

				// Upload image file for question (nếu có)
				var imageUrl = "";
				if (request.Image != null)
				{
					var (isValid, errorMessage) = FileValidator.ValidateFile(request.Image, "image");
					if (!isValid)
					{
						return Result<string>.Failure(errorMessage);
					}
					var result = await _fileService.UploadFileAsync(request.Image, "image");
					imageUrl = result.IsSuccess ? result.Data : "";
					uploadedFiles.Add(imageUrl);
				}

				// Entity question
				var question = new Question
				{
					QuestionGroupId = request.QuestionGroupId,
					QuestionTypeId = request.QuestionTypeId,
					PartId = request.PartId,
					Content = request.Content,
					Number = request.Number,
					AudioUrl = audioUrl,
					ImageUrl = imageUrl,
					Explanation = request.Solution
				};

				await _uow.Questions.AddAsync(question);
				var options = new List<Option>();

				var part = await _uow.Parts.GetByIdAsync(request.PartId);
				var requireQuantityOptions = (part.Skill ==(int)TestSkill.LR && part.PartNumber == 2) ? NumberConstants.MinQuantityOption : NumberConstants.MaxQuantityOption;

				// Options (nếu có)
				if (request.AnswerOptions != null && request.AnswerOptions.Any())
				{
					options.AddRange(request.AnswerOptions.Select(opt => new Option
					{
						Content = opt.Content,
						Label = opt.Label,
						IsCorrect = opt.IsCorrect,
						Question = question
					}));
				}

				// Check validate options
				if (options.Any())
				{
					var (isValid, errorMessage) = OptionValidator.IsValid(options, requireQuantityOptions);
					if (!isValid) throw new Exception(errorMessage);
					await _uow.Options.AddRangeAsync(options);
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

		public async Task<Result<string>> UpdateAsync(int questionId, UpdateQuestionDto dto)
		{
			await _uow.BeginTransactionAsync();
			var uploadedFiles = new List<string>();
			var filesToDelete = new List<string>();

			try
			{
				// Check exist question
				var currentQuestion = await _uow.Questions.GetQuestionByIdAndStatus(questionId, Domains.Enums.CommonStatus.Active);
				if (currentQuestion == null) return Result<string>.Failure("Not found question to update");

				if (!string.IsNullOrEmpty(currentQuestion.AudioUrl)) filesToDelete.Add(currentQuestion.AudioUrl);
				if (!string.IsNullOrEmpty(currentQuestion.ImageUrl)) filesToDelete.Add(currentQuestion.ImageUrl);

				// Upload new file
				var imageUrl = "";
				var audioUrl = "";

				// Image: If have
				if (dto.Image != null)
				{
					// Check valid file
					var (isValid, errorMessage) = FileValidator.ValidateFile(dto.Image, "image");
					if (!isValid) { return Result<string>.Failure(errorMessage); }

					// Upload
					var result = await _fileService.UploadFileAsync(dto.Image, "image");
					if (!result.IsSuccess) { return Result<string>.Failure($"Failed to upload image file."); }

					imageUrl = result.Data;
					uploadedFiles.Add(imageUrl);
				}

				// Audio: If have
				if (dto.Audio != null)
				{
					// Check valid file
					var (isValid, errorMessage) = FileValidator.ValidateFile(dto.Audio, "audio");
					if (!isValid) { return Result<string>.Failure(errorMessage); }

					// Upload
					var result = await _fileService.UploadFileAsync(dto.Image, "audio");
					if (!result.IsSuccess) { return Result<string>.Failure($"Failed to upload audio file."); }

					audioUrl = result.Data;
					uploadedFiles.Add(audioUrl);
				}

				// Update question 
				currentQuestion.PartId = dto.PartId;
				currentQuestion.QuestionTypeId = dto.QuestionTypeId;
				currentQuestion.Content = dto.Content;
				currentQuestion.Explanation = dto.Solution;
				currentQuestion.Number = dto.Number;
				currentQuestion.AudioUrl = audioUrl;
				currentQuestion.ImageUrl = imageUrl;
				currentQuestion.UpdatedAt = DateTime.UtcNow;

				var options = new List<Option>();
				var existingOptions = currentQuestion.Options.ToDictionary(o => o.OptionId, o => o);
				foreach (var opt in dto.AnswerOptions)
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
						options.Add(new Option
						{
							Content = opt.Content,
							Label = opt.Label,
							IsCorrect = opt.IsCorrect,
							Question = currentQuestion,
							Status = CommonStatus.Active
						});
					}
				}

				var part = await _uow.Parts.GetByIdAsync(dto.PartId);
				var requireQuantityOptions = (part.Skill == TestSkill.LR && part.PartNumber == 2) ? NumberConstants.MinQuantityOption : NumberConstants.MaxQuantityOption;

				if (options.Any())
				{
					var (isValid, errorMessage) = OptionValidator.IsValid(options, NumberConstants.MaxQuantityOption);
					if (!isValid) throw new Exception(errorMessage);
		
					await _uow.Options.AddRangeAsync(options);
				}

				// Delete old files
				foreach (var file in filesToDelete)
				{
					if (!string.IsNullOrEmpty(file))
					{
						await _fileService.DeleteFileAsync(file);
					}
				}
				await _uow.SaveChangesAsync(); // Commit tất cả: questions, options
				await _uow.CommitTransactionAsync();
				return Result<string>.Success($"Question {questionId} updated successfully.");

			}
			catch (Exception ex)
			{
				// Rollback transaction & delete files
				await _fileService.RollbackAndCleanupAsync(uploadedFiles);
				return Result<string>.Failure($"Operation failed: {ex.Message}");
			}
		}

		public async Task<Result<string>> DeleteAsync(int id)
		{
			await _uow.BeginTransactionAsync();

			try
			{
				var question = await _uow.Questions.GetQuestionByIdAndStatus(id, CommonStatus.Active);

				if (question == null)
				{
					return Result<string>.Failure($"Question with ID {id} not found or already deleted.");
				}

				// Mark QuestionGroup as deleted
				question.Status = CommonStatus.Inactive;
				question.UpdatedAt = DateTime.UtcNow;

				// Mark all Questions and their Options as deleted
				foreach (var option in question.Options)
				{
					option.Status = CommonStatus.Inactive;
					option.UpdatedAt = DateTime.UtcNow;
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

		public async Task<QuestionResponseDto?> GetQuestionResponseByIdAsync(int id)
		{
			return await _uow.Questions.GetQuestionResponseByIdAsync(id);
		}

		public async Task<Result<PaginationResponse<QuestionResponseDto>>> FilterQuestionsAsync(
	int? partId, int? questionTypeId, int? skill, int page, int pageSize)
		{
			var result = await _uow.Questions.FilterQuestionsAsync(partId, questionTypeId, skill, page, pageSize);
			return Result<PaginationResponse<QuestionResponseDto>>.Success(result);
		}
	}
}