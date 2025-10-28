using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace ToeicGenius.Domains.DTOs.Requests.AI.Speaking
{
    public class SpeakingAssessmentRequestDto
    {
        [Required(ErrorMessage = "Audio file is required")]
        public IFormFile AudioFile { get; set; }

        [Required(ErrorMessage = "TestQuestion ID is required")]
        public int TestQuestionId { get; set; }

        /// <summary>
        /// Optional: If provided, will use this TestResult instead of creating/finding one.
        /// </summary>
        public int? TestResultId { get; set; }
    }
}