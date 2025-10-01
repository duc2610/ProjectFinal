using System.ComponentModel.DataAnnotations;

namespace ToeicGenius.Domains.Entities
{
	public class UserAnswer
	{
		[Key]
		public int UserAnswerId { get; set; }

		[Required]
		public int UserTestId { get; set; }
		public UserTest UserTest { get; set; } = null!;

		[Required]
		public int QuestionId { get; set; }
		public Question Question { get; set; } = null!;

		public string? AnswerAudioUrl { get; set; }

		public int? OptionId { get; set; }
		public Option? Option { get; set; }
	}
}


