using ToeicGenius.Domains.DTOs.Responses.QuestionGroup;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.DTOs.Requests.GroupQuestion;

namespace ToeicGenius.Services.Interfaces
{
    public interface IQuestionGroupService
    {
		Task<QuestionGroupResponseDto?> GetQuestionGroupResponseByIdAsync(int id);
        Task<Result<QuestionGroupResponseDto>> CreateQuestionGroupAsync(QuestionGroupRequestDto request);
		Task<IEnumerable<QuestionGroupListItemDto>> FilterGroupsAsync(int? part);
	}
}