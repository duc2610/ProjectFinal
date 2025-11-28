using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.DTOs.Requests.Exam;
using ToeicGenius.Domains.DTOs.Requests.Test;
using ToeicGenius.Domains.DTOs.Requests.TestQuestion;
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
		Task<Result<PaginationResponse<TestListResponseDto>>> FilterAllAsync(TestFilterDto request, Guid? creatorId = null);
		Task<Result<string>> UpdateStatusAsync(UpdateTestVisibilityStatusDto request, Guid userId, bool isAdmin = false);
		Task<Result<TestDetailDto>> GetDetailAsync(int id, Guid? userId = null, bool isAdmin = false);
		Task<Result<string>> UpdateManualTestAsync(int id, UpdateManualTestDto dto, Guid userId, bool isAdmin = false);
		Task<Result<string>> UpdateTestFromBankAsync(int id, UpdateTestFromBank dto, Guid userId, bool isAdmin = false);
		Task<Test> CloneTestAsync(int sourceTestId);
		Task<Result<List<TestVersionDto>>> GetVersionsByParentIdAsync(int parentTestId);
		Task<Result<string>> CreateDraftManualAsync(Guid userId, CreateTestManualDraftDto dto);
		Task<Result<string>> SavePartManualAsync(Guid userId, int testId, int partId, PartDto dto);
		Task<Result<string>> FinalizeTestAsync(Guid userId, int testId);
		Task<Result<string>> UpdateTestQuestionAsync(int testQuestionId, UpdateTestQuestionDto dto, Guid userId, bool isAdmin = false);
		#endregion

		#region Examinee
		Task<Result<List<TestListResponseDto>>> GetTestsByTypeAsync(TestType testType, Guid? userId = null);
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
