using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.DTOs.Requests.GroupQuestion;
using ToeicGenius.Domains.DTOs.Requests.QuestionGroup;
using ToeicGenius.Domains.DTOs.Responses.Question;
using ToeicGenius.Domains.DTOs.Responses.QuestionGroup;
using ToeicGenius.Domains.Enums;

namespace ToeicGenius.Services.Interfaces
{
	public interface IQuestionGroupService
	{
		Task<Result<QuestionGroupResponseDto?>> GetDetailAsync(int id, Guid? userId = null, bool isAdmin = false);
		Task<Result<string>> CreateAsync(QuestionGroupRequestDto request, Guid creatorId);
		Task<Result<PaginationResponse<QuestionListItemDto>>> FilterQuestionGroupAsync(int? partId, string? keyWord, int? skill, string sortOrder, int page, int pageSize, CommonStatus status, Guid? creatorId = null);
		Task<Result<string>> UpdateAsync(int questionGroupId, UpdateQuestionGroupDto request, Guid userId, bool isAdmin = false);
	}
}