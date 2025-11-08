using Amazon.S3;
using Amazon.S3.Model;
using System.Globalization;
using System.Text.RegularExpressions;
using System.Text;
using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Services.Interfaces;

namespace ToeicGenius.Services.Implementations
{
	public class FileService : IFileService
	{
		private readonly IAmazonS3 _s3Client;
		private readonly string _bucketName;
		private readonly string _cloudFrontDomain;
		private readonly IUnitOfWork _uow;
		public FileService(IConfiguration configuration, IAmazonS3 s3Client, IUnitOfWork unitOfWork)
		{
			_s3Client = s3Client;
			_bucketName = configuration["AWS:S3BucketName"];
			_cloudFrontDomain = configuration.GetValue<string>("AWS:CloudFrontDomain", "");
			_uow = unitOfWork;
		}

        public async Task<Stream> DownloadFileAsync(string fileUrl)
        {
            try
            {
                // Extract key từ CloudFront hoặc S3 URL
                string key;

                if (!string.IsNullOrEmpty(_cloudFrontDomain) && fileUrl.Contains(_cloudFrontDomain))
                {
                    // CloudFront URL: https://d123abc.cloudfront.net/toeic-audio/abc.mp3
                    // Parse manually to preserve original filename (with spaces if any)
                    var domainWithProtocol = "https://" + _cloudFrontDomain;
                    key = fileUrl.Replace(domainWithProtocol + "/", "");
                    // URL decode to get actual filename stored on S3
                    key = Uri.UnescapeDataString(key);
                }
                else if (fileUrl.Contains(".s3"))
                {
                    // S3 URL: https://bucket.s3.amazonaws.com/toeic-audio/abc.mp3
                    var uri = new Uri(fileUrl.Replace(" ", "%20"));
                    key = uri.AbsolutePath.TrimStart('/');
                    // URL decode to get actual filename stored on S3
                    key = Uri.UnescapeDataString(key);
                }
                else
                {
                    throw new Exception("Invalid file URL format");
                }

                // Download từ S3
                var request = new GetObjectRequest
                {
                    BucketName = _bucketName,
                    Key = key
                };

                var response = await _s3Client.GetObjectAsync(request);
                return response.ResponseStream;
            }
            catch (Exception ex)
            {
                throw new Exception($"Failed to download file from AWS: {ex.Message}");
            }
        }
        public async Task<Result<string>> DeleteFileAsync(string fileUrl)
		{
			try
			{
				if (string.IsNullOrWhiteSpace(fileUrl))
					return Result<string>.Failure("File URL is required");

				// Tách key file từ URL (CloudFront hoặc S3)
				string key;
				if (!string.IsNullOrEmpty(_cloudFrontDomain) && fileUrl.Contains(_cloudFrontDomain))
				{
					// Example: https://d123abc.cloudfront.net/toeic-audio/abc.mp3
					key = fileUrl.Substring(fileUrl.IndexOf("/", 8) + 1); // Bỏ https://domain/
				}
				else if (fileUrl.Contains($".s3"))
				{
					// Example: https://bucket.s3.amazonaws.com/toeic-audio/abc.mp3
					var uri = new Uri(fileUrl);
					key = uri.AbsolutePath.TrimStart('/');
				}
				else
				{
					return Result<string>.Failure("Invalid file URL format");
				}

				// Gọi S3 delete request
				var deleteRequest = new DeleteObjectRequest
				{
					BucketName = _bucketName,
					Key = key
				};

				await _s3Client.DeleteObjectAsync(deleteRequest);

				return Result<string>.Success("File deleted successfully");
			}
			catch (AmazonS3Exception s3Ex)
			{
				return Result<string>.Failure($"AWS S3 error: {s3Ex.Message}");
			}
			catch (Exception ex)
			{
				return Result<string>.Failure($"Delete failed: {ex.Message}");
			}
		}

		public async Task RollbackAndCleanupAsync(List<string> uploadedFiles)
		{
			await _uow.RollbackTransactionAsync();
			foreach (var fileUrl in uploadedFiles)
			{
				if (!string.IsNullOrEmpty(fileUrl))
				{
					await DeleteFileAsync(fileUrl);
				}
			}
		}

		public async Task<Result<string>> UploadFileAsync(IFormFile file, string fileType)
		{
			try
			{
				// Determine folder based on file type
				var folder = fileType.ToLower() == "audio" ? "toeic-audio" : "toeic-images";

				// Làm sạch tên file gốc
				var safeFileName = GetSafeFileName(file.FileName);

				// Tạo key an toàn cho CloudFront
				var key = $"{folder}/{Guid.NewGuid()}_{safeFileName}";

				// Prepare S3 upload request
				var request = new PutObjectRequest
				{
					BucketName = _bucketName,
					Key = key,
					InputStream = file.OpenReadStream(),
					ContentType = file.ContentType,
					CannedACL = S3CannedACL.Private // Chỉ CloudFront truy cập
				};

				await _s3Client.PutObjectAsync(request);

				// Trả về CloudFront URL an toàn
				var fileUrl = string.IsNullOrEmpty(_cloudFrontDomain)
					? _s3Client.GetPreSignedURL(new GetPreSignedUrlRequest
					{
						BucketName = _bucketName,
						Key = key,
						Expires = DateTime.UtcNow.AddMinutes(30)
					})
					: $"https://{_cloudFrontDomain}/{key}";

				return Result<string>.Success(fileUrl);
			}
			catch (AmazonS3Exception s3Ex)
			{
				return Result<string>.Failure($"AWS S3 error: {s3Ex.Message}");
			}
			catch (Exception ex)
			{
				return Result<string>.Failure($"Upload failed: {ex.Message}");
			}
		}

		private string GetSafeFileName(string originalName)
		{
			if (string.IsNullOrWhiteSpace(originalName))
				return "file";

			// 1️.Bỏ dấu tiếng Việt
			string normalized = originalName.Normalize(NormalizationForm.FormD);
			var sb = new StringBuilder();
			foreach (char c in normalized)
			{
				var uc = CharUnicodeInfo.GetUnicodeCategory(c);
				if (uc != UnicodeCategory.NonSpacingMark)
					sb.Append(c);
			}
			string noAccent = sb.ToString().Normalize(NormalizationForm.FormC);

			// 2️.Chuyển thành chữ thường
			string lower = noAccent.ToLowerInvariant();

			// 3️.Thay khoảng trắng và ký tự đặc biệt bằng dấu '-'
			string safe = Regex.Replace(lower, @"[^a-z0-9\-_.]", "-");

			// 4️.Xóa trùng dấu '-'
			safe = Regex.Replace(safe, "-{2,}", "-").Trim('-');

			return safe;
		}

	}
}
