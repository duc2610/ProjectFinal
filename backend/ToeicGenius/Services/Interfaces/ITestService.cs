using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.DTOs.Requests.Exam;
using ToeicGenius.Domains.DTOs.Requests.Test;
using ToeicGenius.Domains.DTOs.Responses.Test;

namespace ToeicGenius.Services.Interfaces
{
	public interface ITestService
	{
		Task<Result<string>> CreateTestManualAsync(CreateTestManualDto request);
		Task<Result<string>> CreateTestFromBankAsync(CreateTestFromBankDto request);
		Task<Result<PaginationResponse<TestListResponseDto>>> FilterTestAsync(TestFilterDto request);
		Task<Result<string>> UpdateTestStatusAsync(UpdateTestStatusDto request);
		Task<Result<TestDetailDto>> GetTestDetailAsync(int id);
	}
}
