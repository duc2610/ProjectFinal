using System.ComponentModel.DataAnnotations;

namespace ToeicGenius.Domains.DTOs.Requests.File
{
	public class FileUploadDto
	{
		[Required]
		public IFormFile File { get; set; }

		[Required]
		public string Type { get; set; }
	}
}
