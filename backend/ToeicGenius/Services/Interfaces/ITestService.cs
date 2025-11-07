using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.DTOs.Requests.Exam;
using ToeicGenius.Domains.DTOs.Requests.Test;
using ToeicGenius.Domains.DTOs.Responses.Test;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Domains.Enums;

namespace ToeicGenius.Services.Interfaces
{
	public interface ITestService
	{
		#region Test Creator
		Task<Result<string>> CreateManualAsync(CreateTestManualDto request);
		Task<Result<string>> CreateFromBankAsync(CreateTestFromBankDto request);
		Task<Result<string>> CreateFromBankRandomAsync(CreateTestFromBankRandomDto request);
		Task<Result<PaginationResponse<TestListResponseDto>>> FilterAllAsync(TestFilterDto request);
		Task<Result<string>> UpdateStatusAsync(UpdateTestStatusDto request);
		Task<Result<TestDetailDto>> GetDetailAsync(int id);
		Task<Result<string>> UpdateManualTestAsync(int id, UpdateManualTestDto dto);
		Task<Result<string>> UpdateTestFromBankAsync(int id, UpdateTestFromBank dto);
		Task<Test> CloneTestAsync(int sourceTestId);
		Task<Result<List<TestVersionDto>>> GetVersionsByParentIdAsync(int parentTestId);
		#endregion

		#region Examinee
		Task<Result<List<TestListResponseDto>>> GetTestsByTypeAsync(TestType testType);
		Task<Result<TestStartResponseDto>> GetTestStartAsync(TestStartRequestDto request, Guid userId);
		Task<Result<GeneralLRResultDto>> SubmitLRTestAsync(Guid userId, SubmitLRTestRequestDto request);
		Task<Result<List<TestHistoryDto>>> GetTestHistoryAsync(Guid userId);
		Task<Result<TestResultDetailDto?>> GetListeningReadingResultDetailAsync(int testResultId, Guid userId);
		Task<Result<StatisticResultDto>> GetDashboardStatisticAsync(Guid examineeId, TestSkill skill, string range);
		#endregion
	}
}
