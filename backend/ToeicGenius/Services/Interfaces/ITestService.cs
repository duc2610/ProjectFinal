using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.DTOs.Requests.Exam;
using ToeicGenius.Domains.DTOs.Requests.Test;
using ToeicGenius.Domains.DTOs.Responses.Test;
using ToeicGenius.Domains.Entities;

namespace ToeicGenius.Services.Interfaces
{
    public interface ITestService
    {
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
        Task<Result<TestStartResponseDto>> GetTestStartAsync(TestStartRequestDto request, Guid userId);
        Task<Result<GeneralLRResultDto>> SubmitLRTestAsync(SubmitLRTestRequestDto request);
    }
}
