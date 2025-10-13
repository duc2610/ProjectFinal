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
		Task<IEnumerable<QuestionGroupListItemDto>> FilterGroupsAsync(int? part);
		Task<Result<string>> UpdateAsync(UpdateQuestionGroupDto request);
		Task<Result<string>> DeleteQuestionGroupAsync(int id);
	}
}