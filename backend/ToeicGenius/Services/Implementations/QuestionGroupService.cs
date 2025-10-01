using System.Collections.Generic;
using System.Threading.Tasks;
using ToeicGenius.Domains.DTOs.Responses.Question;
using ToeicGenius.Domains.DTOs.Responses.QuestionGroup;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Services.Interfaces;

namespace ToeicGenius.Services.Implementations
{
    public class QuestionGroupService : IQuestionGroupService
    {
        private readonly IQuestionGroupRepository _questionGroupRepository;
        private readonly IQuestionRepository _questionRepository;

        public QuestionGroupService(
            IQuestionGroupRepository questionGroupRepository,
            IQuestionRepository questionRepository)
        {
            _questionGroupRepository = questionGroupRepository;
            _questionRepository = questionRepository;
        }

        public async Task<QuestionGroup> CreateAsync(QuestionGroup group)
        {
            return await _questionGroupRepository.AddAsync(group);
        }

		public async Task<QuestionGroupResponseDto?> GetQuestionGroupResponseByIdAsync(int id)
		{
			return await _questionGroupRepository.GetGroupWithQuestionsAsync(id);
		}
	}
}