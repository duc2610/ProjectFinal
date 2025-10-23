using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace ToeicGenius.Domains.DTOs.Requests.AI.Speaking
{
    public class SpeakingAssessmentRequestDto
    {
        [Required(ErrorMessage = "Audio file is required")]
        public IFormFile AudioFile { get; set; }

        [Required(ErrorMessage = "Question ID is required")]
        public int QuestionId { get; set; }
    }
}