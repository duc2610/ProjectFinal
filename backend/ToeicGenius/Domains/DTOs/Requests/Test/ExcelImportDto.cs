using Microsoft.AspNetCore.Http;

namespace ToeicGenius.Domains.DTOs.Requests.Test;

public class ExcelImportDto
{
    public IFormFile ExcelFile { get; set; } = null!;
    public IFormFile AudioFile { get; set; } = null!;
}

public class Excel4SkillsImportDto
{
    public IFormFile ExcelFile { get; set; } = null!;
    public IFormFile AudioFile { get; set; } = null!;
}
