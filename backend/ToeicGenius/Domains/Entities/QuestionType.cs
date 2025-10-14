using System.ComponentModel.DataAnnotations;
using ToeicGenius.Domains.Enums;

namespace ToeicGenius.Domains.Entities
{
	public class QuestionType
	{
		[Key]
		public int QuestionTypeId { get; set; }

		[Required]
		public string TypeName { get; set; } = string.Empty;

		[Required]
		public int PartId { get; set; }
		public Part Part { get; set; } = null!;
		public string? Description { get; set; }
		public TestSkill Skill { get; set; }

		public ICollection<Question> Questions { get; set; } = new List<Question>();
	}
}


