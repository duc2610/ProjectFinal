using Microsoft.AspNetCore.Http;

namespace ToeicGenius.Domains.DTOs.Requests.Test;

public class ExcelImportDto
{
    public IFormFile ExcelFile { get; set; } = null!;
}
