using System.ComponentModel.DataAnnotations;
using ToeicGenius.Domains.DTOs.Requests.QuestionGroup;
using ToeicGenius.Shared.Constants;

namespace ToeicGenius.Domains.DTOs.Requests.Question
{
    public class UpdateQuestionDto
    {
		public int? Id { get; set; } 

		[Required]
		public string Content { get; set; } = string.Empty;
		[Required(ErrorMessage = "Question Type ID is required.")]
		[Range(1, int.MaxValue, ErrorMessage = "Question Type ID must be a positive integer.")]
		public int QuestionTypeId { get; set; }

		[Required(ErrorMessage = "Part ID is required.")]
		[Range(1, int.MaxValue, ErrorMessage = "Part ID must be a positive integer.")]
		public int PartId { get; set; }
		[Required]
		public int Number { get; set; }

		public IFormFile? Audio { get; set; }
		public IFormFile? Image { get; set; }
		public List<UpdateAnswerOptionDto>? AnswerOptions { get; set; }
		public string? Solution { get; set; }
	}
	public class UpdateAnswerOptionDto
	{
		public int? Id { get; set; } // Null for new options

		[Required]
		public string Content { get; set; } = string.Empty;

		[Required]
		public string Label { get; set; } = string.Empty;

		[Required]
		public bool IsCorrect { get; set; }

		public int OptionOrder { get; set; }
	}
}