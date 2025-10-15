using System.ComponentModel.DataAnnotations;
using ToeicGenius.Domains.DTOs.Requests.GroupQuestion;
using ToeicGenius.Domains.DTOs.Requests.Question;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Domains.Enums;

namespace ToeicGenius.Domains.DTOs.Requests.Exam
{
	public class CreateTestManualDto
	{
		[Required] 
		public string Title { get; set; }
		public string TestMode { get; set; }
		[Required]
		public TestSkill TestSkill { get; set; }
		public string Description { get; set; }
		[Required]
		public int Duration { get; set; }
		public List<Part> Parts { get; set; }

	}

	public class CreatePartContentDto
	{
		[Required]
		public int PartId { get; set; } // Reference to existing Part (1–15)
		public List<QuestionGroupRequestDto> QuestionGroups { get; set; } = new List<QuestionGroupRequestDto>();
		public List<CreateQuestionDto> Questions { get; set; } = new List<CreateQuestionDto>();
	}
}
