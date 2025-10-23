using System.ComponentModel.DataAnnotations;

namespace ToeicGenius.Domains.DTOs.Requests.AI.Writing
{
    public class WritingSentenceRequestDto
    {
        [Required(ErrorMessage = "Text is required")]
        [StringLength(500, MinimumLength = 5, ErrorMessage = "Text must be between 5 and 500 characters")]
        public string Text { get; set; }

        [Required(ErrorMessage = "Question ID is required")]
        public int QuestionId { get; set; }
    }
}