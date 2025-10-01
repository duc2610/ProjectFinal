using ToeicGenius.Domains.DTOs.Responses.Question;
using ToeicGenius.Domains.Entities;

namespace ToeicGenius.Services.Interfaces
{
    public interface IQuestionService
    {
        Task<Question> GetByIdAsync(int id);
        Task<IEnumerable<Question>> GetAllAsync();
        Task<Question> CreateAsync(Question question);
        Task<Question> UpdateAsync(Question question);
        Task DeleteAsync(int id);
        Task<QuestionResponseDto?> GetQuestionResponseByIdAsync(int id);
    }
}