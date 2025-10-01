using System.ComponentModel.DataAnnotations;
using ToeicGenius.Domains.Entities;

namespace ToeicGenius.Domains.DTOs.Requests.Question
{
	public class CreateQuestionDto
	{
		[Key]
		public int QuestionId { get; set; }

		[Required]
		public int QuestionTypeId { get; set; }
		public QuestionType QuestionType { get; set; } = null!;

		[Required]
		public int QuestionGroupId { get; set; }
		public QuestionGroup QuestionGroup { get; set; } = null!;

		[Required]
		public int PartId { get; set; }
		public Part Part { get; set; } = null!;

		public string? Content { get; set; }
		public int Number { get; set; }

	}
}
