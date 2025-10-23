using System.ComponentModel.DataAnnotations;

namespace ToeicGenius.Domains.DTOs.Requests.AI.Writing
{
    public class WritingEmailRequestDto
    {
        [Required(ErrorMessage = "Answer text is required")]
        [MinLength(50, ErrorMessage = "Response should be at least 50 characters")]
        public string Text { get; set; }

        [Required(ErrorMessage = "Question ID is required")]
        public int QuestionId { get; set; }
    }
}