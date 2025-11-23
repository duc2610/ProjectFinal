using ToeicGenius.Domains.Enums;

namespace ToeicGenius.Domains.DTOs.Responses.Test
{
	public class ResultProgressDto
	{
		public bool IsSelectTime { get; set; }
		public TestResultStatus Status { get; set; }
		public DateTime CreatedAt { get; set; }
	}
}
