using Amazon.S3;
using Amazon.S3.Model;
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
				var key = $"{folder}/{Guid.NewGuid()}_{file.FileName}"; // Thêm GUID để tránh trùng tên

				// Prepare S3 upload request
				var request = new PutObjectRequest
				{
					BucketName = _bucketName,
					Key = key,
					InputStream = file.OpenReadStream(),
					ContentType = file.ContentType,
					CannedACL = S3CannedACL.Private // Chỉ CloudFront truy cập
				};

				// Upload to S3
				await _s3Client.PutObjectAsync(request);

				// Generate file URL (S3 hoặc CloudFront)
				var fileUrl = string.IsNullOrEmpty(_cloudFrontDomain)
					? _s3Client.GetPreSignedURL(new GetPreSignedUrlRequest
					{
						BucketName = _bucketName,
						Key = key,
						Expires = DateTime.UtcNow.AddMinutes(30) // URL tạm thời
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

	}
}
