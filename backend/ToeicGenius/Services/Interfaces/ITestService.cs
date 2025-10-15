using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.DTOs.Requests.Exam;

namespace ToeicGenius.Services.Interfaces
{
	public interface ITestService
	{
		Task<Result<string>> CreateTestManualAsync();
		Task<Result<string>> CreateTestFromBankAsync(CreateTestFromBankDto request);
	}
}
