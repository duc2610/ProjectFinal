using ToeicGenius.Domains.DTOs.Responses.Question;
using ToeicGenius.Domains.DTOs.Responses.QuestionGroup;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Domains.Enums;

namespace ToeicGenius.Repositories.Interfaces
{
	public interface IQuestionGroupRepository : IBaseRepository<QuestionGroup, int>
	{
    Task<QuestionGroupResponseDto?> GetGroupWithQuestionsAsync(int id);
    Task<List<QuestionGroupListItemDto>> FilterGroupsAsync(int? part);
    Task<QuestionGroup> GetByIdAndStatusAsync(int? id, CommonStatus status);
	}
}


