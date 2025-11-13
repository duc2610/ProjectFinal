using Microsoft.AspNetCore.Http;
using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.DTOs.Requests.Exam;

namespace ToeicGenius.Services.Interfaces;

public interface IExcelService
{
    // L&R Test (Listening & Reading - 200 questions)
    Task<Result<CreateTestManualDto>> ParseExcelToTestAsync(IFormFile excelFile);
    Task<Result<byte[]>> GenerateTemplateAsync();

    // S&W Test (Speaking & Writing - 19 questions: W=8, S=11)
    Task<Result<CreateTestManualDto>> ParseExcelToTestSWAsync(IFormFile excelFile);
    Task<Result<byte[]>> GenerateTemplateSWAsync();
}
