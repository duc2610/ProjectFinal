using System.ComponentModel.DataAnnotations;

namespace ToeicGenius.Domains.DTOs.Requests.TestQuestion
{
	public class UpdateTestQuestionDto
	{
		/// <summary>
		/// Content of the question (for single questions)
		/// </summary>
		public string? Content { get; set; }

		/// <summary>
		/// Audio file to replace existing audio
		/// </summary>
		public IFormFile? Audio { get; set; }

		/// <summary>
		/// Image file to replace existing image
		/// </summary>
		public IFormFile? Image { get; set; }

		/// <summary>
		/// Updated answer options (for single questions)
		/// </summary>
		public List<UpdateTestQuestionOptionDto>? AnswerOptions { get; set; }

		/// <summary>
		/// Solution/Explanation
		/// </summary>
		public string? Solution { get; set; }

		/// <summary>
		/// Whether to also update the source Question/QuestionGroup in the bank
		/// Default: false (only update this test's snapshot)
		/// </summary>
		public bool AlsoUpdateSourceInBank { get; set; } = false;
	}

	public class UpdateTestQuestionOptionDto
	{
		[Required]
		public string Content { get; set; } = string.Empty;

		[Required]
		public string Label { get; set; } = string.Empty;

		[Required]
		public bool IsCorrect { get; set; }
	}
}
