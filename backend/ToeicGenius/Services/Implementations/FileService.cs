using CG.Web.MegaApiClient;
using ToeicGenius.Services.Interfaces;

namespace ToeicGenius.Services.Implementations
{
	public class FileService : IFileService
	{
		private readonly IMegaApiClient _megaClient;
		private readonly string _uploadsFolderName;
		public FileService(IConfiguration configuration)
		{
			// Đọc credentials từ appsettings
			var email = configuration["MEGA:Email"];
			var password = configuration["MEGA:Password"];
			if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(password))
			{
				throw new ArgumentException("MEGA credentials are missing in configuration.");
			}

			_megaClient = new MegaApiClient();
			try
			{
				_megaClient.LoginAsync(email, password).GetAwaiter().GetResult(); // Sync login cho đơn giản
			}
			catch (Exception ex)
			{
				throw new ArgumentException($"MEGA login failed: {ex.Message}");
			}

			_uploadsFolderName = configuration["MEGA:UploadsFolder"] ?? "Uploads";
		}

		public async Task<string> SaveFileToMEGAAsync(IFormFile file, string fileType)
		{
			// Validation
			var extension = Path.GetExtension(file.FileName).ToLower();
			var validExtensions = fileType == "audio"
				? new[] { ".mp3", ".wav" }
				: new[] { ".jpg", ".jpeg", ".png" };

			if (!validExtensions.Contains(extension))
			{
				throw new ArgumentException($"Invalid file extension for {fileType}. Allowed: {string.Join(", ", validExtensions)}");
			}

			var maxSize = fileType == "audio" ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
			if (file.Length > maxSize)
			{
				throw new ArgumentException($"File too large for {fileType}. Max size: {maxSize / 1024 / 1024}MB");
			}

			try
			{
				// Lấy toàn bộ nodes
				var nodes = _megaClient.GetNodes();
				var root = nodes.First(n => n.Type == NodeType.Root);

				// Tìm hoặc tạo folder Uploads
				var uploadsFolder = nodes.FirstOrDefault(n => n.Type == NodeType.Directory && n.Name == _uploadsFolderName);
				if (uploadsFolder == null)
				{
					uploadsFolder = _megaClient.CreateFolder(_uploadsFolderName, root);
					nodes = _megaClient.GetNodes(); // refresh lại danh sách node
				}

				// Tìm hoặc tạo sub-folder
				var subFolderName = fileType == "audio" ? "Audio" : "Images";
				var subFolder = nodes.FirstOrDefault(n => n.Type == NodeType.Directory && n.Name == subFolderName);
				if (subFolder == null)
				{
					subFolder = _megaClient.CreateFolder(subFolderName, uploadsFolder);
					nodes = _megaClient.GetNodes();
				}

				// Unique file name
				var uniqueFileName = $"{Guid.NewGuid()}{extension}";

				// Upload
				using var stream = file.OpenReadStream();
				var uploadedNode = _megaClient.Upload(stream, uniqueFileName, subFolder);

				// Tạo public link
				var publicLink = _megaClient.GetDownloadLink(uploadedNode);

				return publicLink.ToString(); // https://mega.nz/file/xxx#yyy
			}
			catch (Exception ex)
			{
				throw new InvalidOperationException($"MEGA upload failed: {ex.Message}", ex);
			}
		}

		public void Dispose()
		{
			if (_megaClient != null && _megaClient.IsLoggedIn)
			{
				_megaClient.Logout();
			}
		}
	}
}
