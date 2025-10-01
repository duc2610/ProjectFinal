using System.ComponentModel.DataAnnotations;

namespace ToeicGenius.Domains.Entities
{
	public class QuestionType
	{
		[Key]
		public int QuestionTypeId { get; set; }

		[Required]
		public string TypeName { get; set; } = string.Empty;

		public string? Description { get; set; }
		public string? Skill { get; set; }

		public ICollection<Question> Questions { get; set; } = new List<Question>();
	}
}


