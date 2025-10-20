using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.DTOs.Requests.Exam;
using ToeicGenius.Domains.DTOs.Requests.Test;
using ToeicGenius.Domains.DTOs.Responses.Test;

namespace ToeicGenius.Services.Interfaces
{
	public interface ITestService
	{
		Task<Result<string>> CreateManualAsync(CreateTestManualDto request);
		Task<Result<string>> CreateFromBankAsync(CreateTestFromBankDto request);
		Task<Result<PaginationResponse<TestListResponseDto>>> FilterAllAsync(TestFilterDto request);
		Task<Result<string>> UpdateStatusAsync(UpdateTestStatusDto request);
		Task<Result<string>> UpdateTestAsync(int testId, UpdateTestDto request);
		Task<Result<TestDetailDto>> GetDetailAsync(int id);
	}
}
