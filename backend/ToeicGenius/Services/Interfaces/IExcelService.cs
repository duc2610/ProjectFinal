using Microsoft.AspNetCore.Http;
using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.DTOs.Requests.Exam;

namespace ToeicGenius.Services.Interfaces;

public interface IExcelService
{
    Task<Result<CreateTestManualDto>> ParseExcelToTestAsync(IFormFile excelFile);
    Task<Result<byte[]>> GenerateTemplateAsync();
}
