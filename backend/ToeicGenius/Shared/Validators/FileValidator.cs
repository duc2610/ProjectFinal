namespace ToeicGenius.Shared.Validators
{
	public static class FileValidator
	{
		public static (bool IsValid, string ErrorMessage) ValidateFile(IFormFile file, string type)
		{
			var extension = Path.GetExtension(file.FileName)?.ToLowerInvariant();
			if (type.Equals("audio", StringComparison.OrdinalIgnoreCase))
			{
				var allowedAudioExtensions = new[] { ".mp3", ".wav", ".ogg", ".m4a" };
				var maxAudioSizeBytes = 70 * 1024 * 1024;

				if (!allowedAudioExtensions.Contains(extension))
				{
					return (false, "Định dạng file âm thanh không hợp lệ. Chỉ chấp nhận .mp3, .wav, .ogg và .m4a.");
				}

				if (file.Length > maxAudioSizeBytes)
				{
					return (false, "Dung lượng file âm thanh vượt quá 70MB.");
				}
			}
			else if (type.Equals("image", StringComparison.OrdinalIgnoreCase))
			{
				var allowedImageExtensions = new[] { ".jpg", ".jpeg", ".png", ".bmp", ".gif", ".webp" };
				var maxImageSizeBytes = 5 * 1024 * 1024;

				if (!allowedImageExtensions.Contains(extension))
				{
					return (false, "Định dạng file hình ảnh không hợp lệ. Chỉ chấp nhận .jpg, .jpeg, .png, .bmp, .gif, .webp.");
				}

				if (file.Length > maxImageSizeBytes)
				{
					return (false, "Dung lượng file hình ảnh vượt quá 5MB.");
				}
			}
			else
			{
				return (false, "Loại file không được hỗ trợ.");
			}

			return (true, string.Empty);
		}

	}
}
