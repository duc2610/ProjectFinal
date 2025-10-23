using System.ComponentModel.DataAnnotations;

namespace ToeicGenius.Domains.DTOs.Requests.AI.Writing
{
    public class WritingSentenceRequestDto
    {
        [Required(ErrorMessage = "Text is required")]
        [StringLength(500, MinimumLength = 5)]
        public string Text { get; set; }

        [Required(ErrorMessage = "Question number is required")]
        [Range(1, 5, ErrorMessage = "Question number must be between 1 and 5")]
        public int QuestionNumber { get; set; }
        public int? QuestionId { get; set; }
    }
}
