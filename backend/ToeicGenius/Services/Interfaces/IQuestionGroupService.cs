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
		Task<Result<QuestionGroupResponseDto?>> GetDetailAsync(int id);
		Task<Result<string>> CreateAsync(QuestionGroupRequestDto request);
		Task<Result<PaginationResponse<QuestionListItemDto>>> FilterQuestionGroupAsync(int? partId, string? keyWord, int? skill, string sortOrder, int page, int pageSize, CommonStatus status);
		Task<Result<string>> UpdateAsync(int questionGroupId, UpdateQuestionGroupDto request);
	}
}