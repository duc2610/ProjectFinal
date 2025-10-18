using System.ComponentModel.DataAnnotations;
using ToeicGenius.Domains.Enums;

namespace ToeicGenius.Domains.DTOs.Requests.Exam
{
	public class CreateTestFromBankDto
	{
		[Required]
		public string Title { get; set; }

		[Required]
		public TestType TestType { get; set; }

		[Required]
		public TestSkill TestSkill { get; set; }
		public string? Description { get; set; }
		[Required]	
		public int Duration { get; set; }
		public List<int>? SingleQuestionIds{ get; set; } = new List<int>();
		public List<int>? GroupQuestionIds{ get; set; } = new List<int>();
	}
}
