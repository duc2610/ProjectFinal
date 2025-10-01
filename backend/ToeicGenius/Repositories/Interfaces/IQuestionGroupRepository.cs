using ToeicGenius.Domains.DTOs.Responses.Question;
using ToeicGenius.Domains.DTOs.Responses.QuestionGroup;
using ToeicGenius.Domains.Entities;

namespace ToeicGenius.Repositories.Interfaces
{
	public interface IQuestionGroupRepository : IBaseRepository<QuestionGroup, int>
	{
    Task<QuestionGroupResponseDto?> GetGroupWithQuestionsAsync(int id);
	}
}


