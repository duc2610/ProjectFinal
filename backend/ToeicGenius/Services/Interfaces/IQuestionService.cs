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
		Task<Result<string>> CreateAsync(CreateQuestionDto question, Guid creatorId);
		Task<Result<string>> UpdateAsync(int questionId, UpdateQuestionDto dto, Guid userId, bool isAdmin = false);
		Task<Result<string>> UpdateStatusAsync(int id, bool isGroupQuestion, bool isRestore, Guid userId, bool isAdmin = false);
		Task<QuestionResponseDto?> GetQuestionResponseByIdAsync(int id, Guid? userId = null, bool isAdmin = false);
		Task<Result<PaginationResponse<QuestionListItemDto>>> FilterSingleQuestionAsync(
			int? partId, int? questionTypeId, string? keyWord, int? skill, string sortOrder, int page, int pageSize, CommonStatus status, Guid? creatorId = null);
	}
}