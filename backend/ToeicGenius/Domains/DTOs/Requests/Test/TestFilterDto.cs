using System.ComponentModel.DataAnnotations;
using ToeicGenius.Domains.Enums;

namespace ToeicGenius.Domains.DTOs.Requests.Test
{
	public class TestFilterDto
	{
		public TestType? TestType { get; set; }
		public TestSkill? TestSkill { get; set; }
		public string? KeyWord { get; set; }
		public TestCreationStatus? CreationStatus { get; set; }
		public TestVisibilityStatus? VisibilityStatus { get; set; }
		public string? SortOrder { get; set; } 
		[Required]
		public int page { get; set; }
		[Required]
		public int pageSize { get; set; }
	}
}
