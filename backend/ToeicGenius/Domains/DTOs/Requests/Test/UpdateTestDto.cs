using System.ComponentModel.DataAnnotations;
using ToeicGenius.Domains.Enums;

namespace ToeicGenius.Domains.DTOs.Requests.Test
{
	public class UpdateTestDto
	{
		[Required]
		public string Title { get; set; } = string.Empty;
		public string? Description { get; set; }
		[Required]
		public int Duration { get; set; }
		public CommonStatus Status { get; set; }
	}
}
