using ToeicGenius.Domains.DTOs.Responses.QuestionGroup;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.DTOs.Requests.GroupQuestion;
using ToeicGenius.Domains.DTOs.Requests.Question;
using ToeicGenius.Domains.DTOs.Requests.QuestionGroup;
using ToeicGenius.Domains.Enums;

namespace ToeicGenius.Services.Interfaces
{
	public interface IQuestionGroupService
	{
		Task<QuestionGroupResponseDto?> GetDetailAsync(int id);
		Task<Result<string>> CreateAsync(QuestionGroupRequestDto request);
		Task<Result<PaginationResponse<QuestionGroupListItemDto>>> FilterAsync(int? part, string? keyWord, int? skill, int page, int pageSize, CommonStatus status);
		Task<Result<string>> UpdateAsync(int questionGroupId, UpdateQuestionGroupDto request);
	}
}