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
		Task<PaginationResponse<QuestionGroupListItemDto>> FilterGroupsAsync(int? part, string? keyWord, int? skill, int page, int pageSize, CommonStatus status);
		Task<QuestionGroup> GetByIdAndStatusAsync(int? id, CommonStatus status);
	}
}


