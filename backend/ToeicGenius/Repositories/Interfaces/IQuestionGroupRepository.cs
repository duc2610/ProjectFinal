using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.DTOs.Responses.Question;
using ToeicGenius.Domains.DTOs.Responses.QuestionGroup;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Domains.Enums;

namespace ToeicGenius.Repositories.Interfaces
{
	public interface IQuestionGroupRepository : IBaseRepository<QuestionGroup, int>
	{
		Task<QuestionGroupResponseDto?> GetGroupWithQuestionsAsync(int id);
		Task<PaginationResponse<QuestionListItemDto>> FilterGroupAsync(int? partId, string? keyWord, int? skill, string sortOrder, int page, int pageSize, CommonStatus status);
		Task<QuestionGroup> GetByIdAndStatusAsync(int? id, CommonStatus status);
		Task<List<QuestionGroupSnapshotDto>> GetByListIdAsync(List<int> questionGroupIds);
		Task<List<QuestionGroup>> GetRandomQuestionGroupsAsync(int partId, int? questionTypeId, int count);

	}
}


