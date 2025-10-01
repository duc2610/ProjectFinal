using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Services.Interfaces;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Domains.DTOs.Responses.Question;

namespace ToeicGenius.Services.Implementations
{
    public class QuestionService : IQuestionService
    {
        private readonly IQuestionRepository _questionRepository;

        public QuestionService(IQuestionRepository questionRepository)
        {
            _questionRepository = questionRepository;
        }

        public async Task<Question> GetByIdAsync(int id)
        {
            return await _questionRepository.GetByIdAsync(id);
        }

        public async Task<IEnumerable<Question>> GetAllAsync()
        {
            return await _questionRepository.GetAllAsync();
        }

        public async Task<Question> CreateAsync(Question question)
        {
            return await _questionRepository.AddAsync(question);
        }

        public async Task<Question> UpdateAsync(Question question)
        {
            return await _questionRepository.UpdateAsync(question);
        }

        public async Task DeleteAsync(int id)
        {
            var question = await _questionRepository.GetByIdAsync(id);
            if (question == null) return;
            await _questionRepository.DeleteAsync(question);
        }

        public async Task<QuestionResponseDto?> GetQuestionResponseByIdAsync(int id)
        {
            return await _questionRepository.GetQuestionResponseByIdAsync(id);
        }
    }
}