using Microsoft.AspNetCore.Http;

namespace ToeicGenius.Domains.DTOs.Requests.Test;

public class ExcelImportDto
{
    public IFormFile ExcelFile { get; set; } = null!;
    public IFormFile AudioFile { get; set; } = null!;
}

public class ExcelSWImportDto
{
    public IFormFile ExcelFile { get; set; } = null!;
    // No audio file needed for S&W test (Speaking & Writing only)
}
