using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Services.Interfaces;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Domains.DTOs.Responses.Question;
using ToeicGenius.Domains.DTOs.Requests.Question;
using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.DTOs.Responses.QuestionGroup;
using ToeicGenius.Shared.Constants;
using ToeicGenius.Shared.Validators;

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
					var (isValid, errorMessage) = OptionValidator.IsValid(options);
					if (!isValid) return Result<string>.Failure(errorMessage);
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

		public async Task<Result<string>> UpdateAsync(UpdateQuestionDto dto)
		{
			//var question = await _uow.Questions.GetByIdAsync(dto.Id);
			//if (question == null)
			//	return Result<string>.Failure("Question not found");

			//question.QuestionTypeId = dto.QuestionTypeId;
			//question.PartId = dto.PartId;
			//question.Content = dto.Content;
			//question.Number = dto.Number;
			//question.AudioUrl = dto.AudioUrl;
			//question.ImageUrl = dto.ImageUrl;

			//// Cập nhật các trường khác nếu có
			//await _uow.Questions.UpdateAsync(question);
			//await _uow.SaveChangesAsync();
			return Result<string>.Success(SuccessMessages.OperationSuccess);
		}

		public async Task<Result<string>> DeleteAsync(int id)
		{
			var question = await _uow.Questions.GetByIdAsync(id);
			if (question == null)
				return Result<string>.Failure("Question not found");

			question.Status = Domains.Enums.CommonStatus.Inactive;
			await _uow.SaveChangesAsync();
			return Result<string>.Success(SuccessMessages.OperationSuccess);
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