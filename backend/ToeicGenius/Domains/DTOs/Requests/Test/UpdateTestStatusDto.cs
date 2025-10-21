using System.ComponentModel.DataAnnotations;
using ToeicGenius.Domains.Enums;

namespace ToeicGenius.Domains.DTOs.Requests.Test
{
	public class UpdateTestStatusDto
	{

		[Required]
		public int TestId { get; set; }

		[Required]
		public CommonStatus Status { get; set; } 
	}
}
