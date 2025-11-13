using System.ComponentModel.DataAnnotations;
using ToeicGenius.Domains.Enums;

namespace ToeicGenius.Domains.DTOs.Requests.Test
{
	public class UpdateTestVisibilityStatusDto
	{

		[Required]
		public int TestId { get; set; }

		[Required]
		public TestVisibilityStatus VisibilityStatus { get; set; } 
	}
}
