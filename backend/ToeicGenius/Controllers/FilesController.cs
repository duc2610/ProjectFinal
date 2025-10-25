using Humanizer;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.DTOs.Requests.File;
using ToeicGenius.Services.Interfaces;
using ToeicGenius.Shared.Validators;

namespace ToeicGenius.Controllers
{
	[Route("api/files")]
	[ApiController]
	public class FilesController : ControllerBase
	{
		private readonly IFileService _fileService;
		public FilesController(IFileService fileService)
		{
			_fileService = fileService;
		}

		[HttpPost("upload")]
		public async Task<IActionResult> UploadFile([FromForm] FileUploadDto request)
		{
			if (request.File == null || request.File.Length == 0)
				return BadRequest(ApiResponse<string>.ErrorResponse("File is required."));

			var (ok, err) = FileValidator.ValidateFile(request.File, request.Type);
			if (!ok) return BadRequest(ApiResponse<string>.ErrorResponse(err));

			var upload = await _fileService.UploadFileAsync(request.File, request.Type);
			if (!upload.IsSuccess) return BadRequest(ApiResponse<string>.ErrorResponse(err));

			return Ok(ApiResponse<string>.SuccessResponse(upload.Data));
		}

		[HttpDelete("delete")]
		public async Task<IActionResult> DeleteFile([FromBody] List<string> fileUrls)
		{
			if (fileUrls == null || fileUrls.Count == 0)
				return BadRequest(ApiResponse<string>.ErrorResponse("File URLs are required."));

			foreach (var f in fileUrls)
			{
				if (!string.IsNullOrEmpty(f))
				{
					await _fileService.DeleteFileAsync(f);
				}
			}
			return Ok(ApiResponse<string>.SuccessResponse("Delete success"));
		}
	}
}
