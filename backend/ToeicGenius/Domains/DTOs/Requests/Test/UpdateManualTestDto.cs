using System.ComponentModel.DataAnnotations;
using ToeicGenius.Domains.DTOs.Requests.Exam;
using ToeicGenius.Domains.Enums;

namespace ToeicGenius.Domains.DTOs.Requests.Test
{
	public class UpdateManualTestDto
	{
		public string Title { get; set; } = null!;
		public string? Description { get; set; }
		public string? AudioUrl { get; set; }
		public TestSkill TestSkill { get; set; }     // enum: LR, Speaking, Writing
		public TestType TestType { get; set; }       // Manual or FromBank
		public List<PartDto> Parts { get; set; } = new();
	}
}
