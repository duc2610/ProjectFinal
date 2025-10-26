using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.DTOs.Requests.Test;
using ToeicGenius.Domains.DTOs.Responses.Test;
using ToeicGenius.Domains.Entities;

namespace ToeicGenius.Repositories.Interfaces
{
	public interface ITestRepository : IBaseRepository<Test, int>
	{
		Task<PaginationResponse<TestListResponseDto>> FilterQuestionsAsync(TestFilterDto request);
		Task<Test> GetTestByIdAsync(int id);
		Task<List<Test>> GetVersionsByParentIdAsync(int parentTestId);
		Task<int> GetNextVersionAsync(int parentTestId);
		Task<int> GetTotalQuestionAsync(int testId);

	}
}


