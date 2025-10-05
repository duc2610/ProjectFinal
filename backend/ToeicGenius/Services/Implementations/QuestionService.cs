using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Services.Interfaces;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Domains.DTOs.Responses.Question;
using ToeicGenius.Domains.DTOs.Requests.Question;
using ToeicGenius.Domains.DTOs.Common;

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

			// Upload file cho group nếu có
			var audioTask = request.Audio != null
				? _fileService.SaveFileToMEGAAsync(request.Audio, "audio")
				: Task.FromResult<string?>(null);

			var imageTask = request.Image != null
				? _fileService.SaveFileToMEGAAsync(request.Image, "image")
				: Task.FromResult<string?>(null);

			await Task.WhenAll(audioTask, imageTask);

			var question = new Question
			{
				QuestionGroupId = request.QuestionGroupId,
				QuestionTypeId = request.QuestionTypeId,
				PartId = request.PartId,
				Content = request.Content,
				Number = request.Number,
				AudioUrl = await audioTask,
				ImageUrl = await imageTask,
			};

			await _uow.Questions.AddAsync(question);
			var options = new List<Option>();
			// Add Options nếu có
			if (request.AnswerOptions != null && request.AnswerOptions.Any())
			{
				foreach (var optionDto in request.AnswerOptions)
				{
					var option = new Option
					{
						Question = question,
						Content = optionDto.Content,
						OptionLabel = optionDto.Label,
						IsCorrect = optionDto.IsCorrect
					};
					options.Add(option);
				}
			}
			if (options.Any())
			{
				await _uow.Options.AddRangeAsync(options);
			}
			// Add SolutionDetail nếu có
			if (!string.IsNullOrWhiteSpace(request.Solution))
			{
				var solution = new SolutionDetail
				{
					Question = question,
					Explanation = request.Solution
				};
				await _uow.Solutions.AddAsync(solution);
			}

			await _uow.SaveChangesAsync();

			return Result<string>.Success("Add question success");
		}

		public async Task<Result<string>> UpdateAsync(UpdateQuestionDto dto)
		{
			var question = await _uow.Questions.GetByIdAsync(dto.QuestionId);
			if (question == null)
				return Result<string>.Failure("Question not found");

			question.QuestionTypeId = dto.QuestionTypeId;
			question.PartId = dto.PartId;
			question.Content = dto.Content;
			question.Number = dto.Number;
			question.AudioUrl = dto.AudioUrl;
			question.ImageUrl = dto.ImageUrl;
			// Cập nhật các trường khác nếu có

			await _uow.Questions.UpdateAsync(question);
			await _uow.SaveChangesAsync();
			return Result<string>.Success("Update question success");
		}

		public async Task<Result<string>> DeleteAsync(int id)
		{
			var question = await _uow.Questions.GetByIdAsync(id);
			if (question == null)
				return Result<string>.Failure("Question not found");

			await _uow.Questions.DeleteAsync(question);
			await _uow.SaveChangesAsync();
			return Result<string>.Success("Delete question success");
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