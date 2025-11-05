using Microsoft.AspNetCore.Http;
using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.DTOs.Requests.Exam;

namespace ToeicGenius.Services.Interfaces;

public interface IExcelService
{
    // L&R Test (2 skills - 200 questions)
    Task<Result<CreateTestManualDto>> ParseExcelToTestAsync(IFormFile excelFile);
    Task<Result<byte[]>> GenerateTemplateAsync();

    // Full Test (4 skills - 219 questions: L+R+W+S)
    Task<Result<CreateTestManualDto>> ParseExcelToTest4SkillsAsync(IFormFile excelFile);
    Task<Result<byte[]>> GenerateTemplate4SkillsAsync();
}
