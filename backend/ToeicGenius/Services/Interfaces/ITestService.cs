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
		Task<Result<string>> CreateManualAsync(Guid userId, CreateTestManualDto request);
		Task<Result<string>> CreateFromBankAsync(Guid userId,CreateTestFromBankDto request);
		Task<Result<string>> CreateFromBankRandomAsync(CreateTestFromBankRandomDto request);
		Task<Result<PaginationResponse<TestListResponseDto>>> FilterAllAsync(TestFilterDto request);
		Task<Result<string>> UpdateStatusAsync(UpdateTestVisibilityStatusDto request);
		Task<Result<TestDetailDto>> GetDetailAsync(int id);
		Task<Result<string>> UpdateManualTestAsync(int id, UpdateManualTestDto dto);
		Task<Result<string>> UpdateTestFromBankAsync(int id, UpdateTestFromBank dto);
		Task<Test> CloneTestAsync(int sourceTestId);
		Task<Result<List<TestVersionDto>>> GetVersionsByParentIdAsync(int parentTestId);
		Task<Result<string>> CreateDraftManualAsync(Guid userId, CreateTestManualDraftDto dto);
		Task<Result<string>> SavePartManualAsync(Guid userId, int testId, int partId, PartDto dto);
		Task<Result<string>> FinalizeTestAsync(Guid userId, int testId);
		#endregion

		#region Examinee
		Task<Result<List<TestListResponseDto>>> GetTestsByTypeAsync(TestType testType);
		Task<Result<TestStartResponseDto>> GetTestStartAsync(TestStartRequestDto request, Guid userId);
		Task<Result<GeneralLRResultDto>> SubmitLRTestAsync(Guid userId, SubmitLRTestRequestDto request);
		Task<Result<List<TestHistoryDto>>> GetTestHistoryAsync(Guid userId);
		Task<Result<TestResultDetailDto?>> GetListeningReadingResultDetailAsync(int testResultId, Guid userId);
		Task<Result<object>> GetUnifiedTestResultDetailAsync(int testResultId, Guid userId);
		Task<Result<StatisticResultDto>> GetDashboardStatisticAsync(Guid examineeId, TestSkill skill, string range);
		Task<Result<string>> SaveProgressAsync(Guid userId, SaveProgressRequestDto request);
		#endregion
	}
}
