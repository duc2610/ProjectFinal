using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.DTOs.Requests.Question;
using ToeicGenius.Domains.DTOs.Responses.Question;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Domains.Enums;

namespace ToeicGenius.Services.Interfaces
{
	public interface IQuestionService
	{
		Task<QuestionResponseDto> GetByIdAsync(int id);
		Task<IEnumerable<Question>> GetAllAsync();
		Task<Result<string>> CreateAsync(CreateQuestionDto question);
		Task<Result<string>> UpdateAsync(int questionId, UpdateQuestionDto dto);
		Task<Result<string>> UpdateStatusAsync(int id, bool isGroupQuestion, bool isRestore);
		Task<QuestionResponseDto?> GetQuestionResponseByIdAsync(int id);
		Task<Result<PaginationResponse<QuestionResponseDto>>> FilterQuestionsAsync(
			int? partId, int? questionTypeId, string? keyWord, int? skill, int page, int pageSize, CommonStatus status);
		Task<Result<PaginationResponse<QuestionListItemDto>>> FilterAllAsync(
			int? partId, int? questionTypeId, string? keyWord, int? skill, string sortOrder, int page, int pageSize, CommonStatus status);

	}
}