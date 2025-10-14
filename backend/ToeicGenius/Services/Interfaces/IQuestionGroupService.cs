using ToeicGenius.Domains.DTOs.Responses.QuestionGroup;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.DTOs.Requests.GroupQuestion;
using ToeicGenius.Domains.DTOs.Requests.Question;
using ToeicGenius.Domains.DTOs.Requests.QuestionGroup;

namespace ToeicGenius.Services.Interfaces
{
	public interface IQuestionGroupService
	{
		Task<QuestionGroupResponseDto?> GetQuestionGroupResponseByIdAsync(int id);
		Task<Result<string>> CreateQuestionGroupAsync(QuestionGroupRequestDto request);
		Task<Result<PaginationResponse<QuestionGroupListItemDto>>> FilterGroupsAsync(int? part, int page, int pageSize);
		Task<Result<string>> UpdateAsync(int questionGroupId, UpdateQuestionGroupDto request);
		Task<Result<string>> DeleteQuestionGroupAsync(int id);
	}
}