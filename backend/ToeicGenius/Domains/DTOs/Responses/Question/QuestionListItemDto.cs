using ToeicGenius.Domains.Enums;

namespace ToeicGenius.Domains.DTOs.Responses.Question
{
	public class QuestionListItemDto
	{
		public int Id { get; set; }
		public bool IsGroupQuestion { get; set; } = false;
		public string? PartName { get; set; }
		public int? PartId { get; set; }
		public QuestionSkill? Skill { get; set; }
		public string? Content { get; set; }          
		public int? QuestionCount { get; set; }    
		public CommonStatus Status { get; set; }
		public DateTime? CreatedAt { get; set; }
	}
}
