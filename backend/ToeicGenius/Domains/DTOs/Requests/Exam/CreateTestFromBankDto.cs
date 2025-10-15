using System.ComponentModel.DataAnnotations;
using ToeicGenius.Domains.Enums;

namespace ToeicGenius.Domains.DTOs.Requests.Exam
{
	public class CreateTestFromBankDto
	{
		[Required]
		public string Title { get; set; }
		public string TestMode { get; set; }
		public TestSkill TestSkill { get; set; }
		public string Description { get; set; }
		public int Duration { get; set; }
		public List<CreatePartFromBankDto> Parts { get; set; } = new List<CreatePartFromBankDto>();
	}
	public class CreatePartFromBankDto
	{
		[Required]
		public int PartId { get; set; } // Reference to existing Part (1–15)
		public List<int> QuestionGroupIds { get; set; } = new List<int>();
		public List<int> QuestionIds { get; set; } = new List<int>();
	}
}
