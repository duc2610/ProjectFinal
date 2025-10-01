using System.ComponentModel.DataAnnotations;

namespace ToeicGenius.Domains.Entities
{
	public class Option
	{
		[Key]
		public int OptionId { get; set; }

		[Required]
		public int QuestionId { get; set; }
		public Question Question { get; set; } = null!;

		public string? OptionLabel { get; set; }
		public string? Content { get; set; }
		public bool IsCorrect { get; set; }
		public int OptionOrder { get; set; }
	}
}


