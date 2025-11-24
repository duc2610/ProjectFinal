using System.ComponentModel.DataAnnotations;

namespace ToeicGenius.Domains.DTOs.Requests.AI.Writing
{
    public class WritingSentenceRequestDto
    {
        [Required(ErrorMessage = "Text is required")]
        [StringLength(500, MinimumLength = 5, ErrorMessage = "Text must be between 5 and 500 characters")]
        public string Text { get; set; }

        [Required(ErrorMessage = "TestQuestion ID is required")]
        public int TestQuestionId { get; set; }

        /// <summary>
        /// Optional: If provided, will use this TestResult instead of creating/finding one.
        /// Useful for bulk assessment flow where TestResult is created at test start.
        /// </summary>
        public int? TestResultId { get; set; }
    }
}