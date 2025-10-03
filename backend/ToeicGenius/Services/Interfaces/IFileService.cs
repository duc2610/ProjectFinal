namespace ToeicGenius.Services.Interfaces
{
	public interface IFileService
	{
		Task<string> SaveFileToMEGAAsync(IFormFile file, string fileType);
	}
}
