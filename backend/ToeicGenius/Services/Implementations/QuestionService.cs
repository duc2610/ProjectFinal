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
        private readonly IQuestionRepository _questionRepository;
        private readonly IOptionRepository _optionRepository ;
        private readonly ISolutionDetailRepository _solutionDetailRepository;
        private readonly IFileService _fileService;

        public QuestionService(IQuestionRepository questionRepository, 
            IFileService fileService, 
            ISolutionDetailRepository solutionDetailRepository, 
            IOptionRepository optionRepository)
        {
            _questionRepository = questionRepository;
            _fileService = fileService;
            _solutionDetailRepository = solutionDetailRepository;
            _optionRepository = optionRepository;
        }

        public async Task<QuestionResponseDto> GetByIdAsync(int id)
        {
            return await _questionRepository.GetQuestionResponseByIdAsync(id);
        }

        public async Task<IEnumerable<Question>> GetAllAsync()
        {
            return await _questionRepository.GetAllAsync();
        }

        public async Task<Result<string>> CreateAsync(CreateQuestionDto request)
        {
			string? audioPath = null;
			//if (request.Audio != null)
			//{
			//	audioPath = await _fileService.SaveFileToMEGAAsync(request.Audio, "audio");
			//}

			string? imagePath = null;
            //if (request.Image != null)
            //{
            //	imagePath = await _fileService.SaveFileToMEGAAsync(request.Image, "image");
            //}


			var question = new Question
			{
				QuestionTypeId = request.QuestionTypeId,
				PartId = request.PartId,
				Content = request.Content,
				Number = request.Number,
				AudioUrl = audioPath,
				ImageUrl = imagePath,
			};

            await _questionRepository.AddAsync(question);

			// Add Options nếu có
			if (request.AnswerOptions != null && request.AnswerOptions.Any())
			{
				foreach (var optionDto in request.AnswerOptions)
				{
					var option = new Option
					{
						QuestionId = question.QuestionId,
						Content = optionDto.Content,
						OptionLabel = optionDto.Label,
						IsCorrect = optionDto.IsCorrect
					};
					await _optionRepository.AddAsync(option);
				}
			}

			// Add SolutionDetail nếu có
			if (!string.IsNullOrWhiteSpace(request.Solution))
			{
				var solution = new SolutionDetail
				{
					QuestionId = question.QuestionId,
					Explanation = request.Solution
				};
				await _solutionDetailRepository.AddAsync(solution);
			}

			return Result<string>.Success("Add question success");
		}

        public async Task<Result<string>> UpdateAsync(UpdateQuestionDto dto)
        {
            var question = await _questionRepository.GetByIdAsync(dto.QuestionId);
            if (question == null)
                return Result<string>.Failure("Question not found");

            question.QuestionTypeId = dto.QuestionTypeId;
            question.PartId = dto.PartId;
            question.Content = dto.Content;
            question.Number = dto.Number;
            question.AudioUrl = dto.AudioUrl;
            question.ImageUrl = dto.ImageUrl;
            // Cập nhật các trường khác nếu có

            await _questionRepository.UpdateAsync(question);
            return Result<string>.Success("Update question success");
        }

        public async Task<Result<string>> DeleteAsync(int id)
        {
            var question = await _questionRepository.GetByIdAsync(id);
            if (question == null)
                return Result<string>.Failure("Question not found");

            await _questionRepository.DeleteAsync(question);
            return Result<string>.Success("Delete question success");
        }

        public async Task<QuestionResponseDto?> GetQuestionResponseByIdAsync(int id)
        {
            return await _questionRepository.GetQuestionResponseByIdAsync(id);
        }

        public async Task<Result<PaginationResponse<QuestionResponseDto>>> FilterQuestionsAsync(
    int? partId, int? questionTypeId, int? skill, int page, int pageSize)
{
    var result = await _questionRepository.FilterQuestionsAsync(partId, questionTypeId, skill, page, pageSize);
    return Result<PaginationResponse<QuestionResponseDto>>.Success(result);
}
    }
}