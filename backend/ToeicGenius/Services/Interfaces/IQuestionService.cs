using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.DTOs.Requests.Question;
using ToeicGenius.Domains.DTOs.Responses.Question;
using ToeicGenius.Domains.Entities;

namespace ToeicGenius.Services.Interfaces
{
    public interface IQuestionService
    {
        Task<QuestionResponseDto> GetByIdAsync(int id);
        Task<IEnumerable<Question>> GetAllAsync();
        Task<Result<string>> CreateAsync(CreateQuestionDto question);
        Task<Result<string>> UpdateAsync(int questionId, UpdateQuestionDto dto);
        Task<Result<string>> DeleteAsync(int id);
        Task<QuestionResponseDto?> GetQuestionResponseByIdAsync(int id);
        Task<Result<PaginationResponse<QuestionResponseDto>>> FilterQuestionsAsync(
            int? partId, int? questionTypeId, int? skill, int page, int pageSize);
    }
}