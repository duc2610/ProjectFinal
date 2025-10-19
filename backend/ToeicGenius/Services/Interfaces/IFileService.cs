using ToeicGenius.Domains.DTOs.Common;

namespace ToeicGenius.Services.Interfaces
{
	public interface IFileService
	{
		Task<Result<string>> UploadFileAsync(IFormFile file, string fileType);
		Task<Result<string>> DeleteFileAsync(string fileUrl);
		Task RollbackAndCleanupAsync(List<string> uploadedFiles);
	}
}
