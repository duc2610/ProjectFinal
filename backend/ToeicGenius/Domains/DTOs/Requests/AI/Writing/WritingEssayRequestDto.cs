using System.ComponentModel.DataAnnotations;

namespace ToeicGenius.Domains.DTOs.Requests.AI.Writing
{
    public class WritingEssayRequestDto
    {
        [Required(ErrorMessage = "Essay text is required")]
        [MinLength(200, ErrorMessage = "Essay should be at least 200 characters")]
        public string Text { get; set; }

        [Required(ErrorMessage = "Question ID is required")]
        public int QuestionId { get; set; }
    }
}