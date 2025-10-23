using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace ToeicGenius.Domains.DTOs.Requests.AI.Speaking
{
    public class SpeakingAssessmentRequestDto
    {
        
        [Required(ErrorMessage = "Audio file is required")]
        public IFormFile AudioFile { get; set; }

        [Required(ErrorMessage = "Question number is required")]
        [Range(1, 11, ErrorMessage = "Question number must be between 1 and 11")]
        public int QuestionNumber { get; set; }

        public int? QuestionId { get; set; }
    }
}