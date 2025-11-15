using System.ComponentModel.DataAnnotations;
using ToeicGenius.Domains.Enums;
using static ToeicGenius.Shared.Helpers.DateTimeHelper;

namespace ToeicGenius.Domains.Entities
{
	public class Option
	{
		[Key]
		public int OptionId { get; set; }

		[Required]
		public int QuestionId { get; set; }
		public Question Question { get; set; } = null!;

		public string? Label { get; set; }
		public string? Content { get; set; }
		public bool IsCorrect { get; set; }
		public CommonStatus Status { get; set; } = CommonStatus.Active;
		public DateTime CreatedAt { get; set; } = Now;
		public DateTime? UpdatedAt { get; set; }
	}
}


