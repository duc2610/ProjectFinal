using System.ComponentModel.DataAnnotations;

namespace ToeicGenius.Domains.DTOs.Requests.TestQuestion
{
	public class UpdateTestQuestionDto
	{
		// ==================== FOR SINGLE QUESTION ====================
		/// <summary>
		/// Content of the question (for single questions)
		/// </summary>
		public string? Content { get; set; }

		/// <summary>
		/// Updated answer options (for single questions)
		/// </summary>
		public List<UpdateTestQuestionOptionDto>? AnswerOptions { get; set; }

		/// <summary>
		/// Solution/Explanation (for single questions)
		/// </summary>
		public string? Solution { get; set; }

		// ==================== FOR QUESTION GROUP ====================
		/// <summary>
		/// Passage content (for question groups - Part 6, 7)
		/// </summary>
		public string? Passage { get; set; }

		/// <summary>
		/// Sub-questions in the group (for question groups)
		/// </summary>
		public List<UpdateTestSubQuestionDto>? Questions { get; set; }

		// ==================== SHARED ====================
		/// <summary>
		/// Audio file to replace existing audio
		/// </summary>
		public IFormFile? Audio { get; set; }

		/// <summary>
		/// Image file to replace existing image
		/// </summary>
		public IFormFile? Image { get; set; }

		/// <summary>
		/// Whether to also update the source Question/QuestionGroup in the bank
		/// Default: false (only update this test's snapshot)
		/// </summary>
		public bool AlsoUpdateSourceInBank { get; set; } = false;
	}

	/// <summary>
	/// DTO for updating a sub-question within a question group
	/// </summary>
	public class UpdateTestSubQuestionDto
	{
		/// <summary>
		/// QuestionId within the group snapshot
		/// </summary>
		public int? QuestionId { get; set; }

		/// <summary>
		/// Content of the sub-question
		/// </summary>
		public string? Content { get; set; }

		/// <summary>
		/// Solution/Explanation for this sub-question
		/// </summary>
		public string? Explanation { get; set; }

		/// <summary>
		/// Answer options for this sub-question
		/// </summary>
		public List<UpdateTestQuestionOptionDto>? Options { get; set; }
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
