using System.ComponentModel.DataAnnotations;

namespace ToeicGenius.Domains.Entities
{
	public class SolutionDetail
	{
		[Key]
		public int SolutionDetailId { get; set; }

		[Required]
		public int QuestionId { get; set; }
		public Question Question { get; set; } = null!;

		public string? Explanation { get; set; }
	}
}


