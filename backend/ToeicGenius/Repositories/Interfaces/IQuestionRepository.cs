using System.Threading.Tasks;
using ToeicGenius.Domains.DTOs.Responses.Question;
using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Domains.Enums;

namespace ToeicGenius.Repositories.Interfaces
{
	public interface IQuestionRepository : IBaseRepository<Question, int>
	{
        Task<QuestionResponseDto?> GetQuestionResponseByIdAsync(int id);
        Task<PaginationResponse<QuestionResponseDto>> FilterQuestionsAsync(
            int? partId, int? questionTypeId, int? skill, int page, int pageSize);
		Task<List<Question>> GetQuestionsByGroupIdAsync(int groupId);
		Task<Question> GetQuestionByIdAndStatus(int questionId, CommonStatus status);

		Task<List<QuestionSnapshotDto>> GetByListIdAsync(List<int> questionIds);
	}
}


