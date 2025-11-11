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
					return (false, "Invalid audio file format. Only .mp3, .wav, .ogg and .m4a are allowed.");
				}

				if (file.Length > maxAudioSizeBytes)
				{
					return (false, "Audio file size exceeds 70MB.");
				}
			}
			else if (type.Equals("image", StringComparison.OrdinalIgnoreCase))
			{
				var allowedImageExtensions = new[] { ".jpg", ".jpeg", ".png", ".bmp", ".gif", ".webp" };
				var maxImageSizeBytes = 5 * 1024 * 1024;

				if (!allowedImageExtensions.Contains(extension))
				{
					return (false, "Invalid image file format. Only .jpg, .jpeg, .png, .bmp, .gif, .webp are allowed.");
				}

				if (file.Length > maxImageSizeBytes)
				{
					return (false, "Image file size exceeds 5MB.");
				}
			}
			else
			{
				return (false, "Unsupported file type.");
			}

			return (true, string.Empty);
		}
	}
}
