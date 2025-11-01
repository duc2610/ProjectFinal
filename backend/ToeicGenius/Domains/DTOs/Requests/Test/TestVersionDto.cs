using ToeicGenius.Domains.Enums;

namespace ToeicGenius.Domains.DTOs.Requests.Test
{
	public class TestVersionDto
	{
		public int TestId { get; set; }
		public int Version { get; set; }
		public string Title { get; set; } = "";
		public CommonStatus Status { get; set; }
		public DateTime CreatedAt { get; set; }
		public DateTime? UpdatedAt { get; set; }
	}

}
