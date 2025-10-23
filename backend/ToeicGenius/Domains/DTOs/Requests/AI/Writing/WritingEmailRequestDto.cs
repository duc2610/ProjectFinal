using System.ComponentModel.DataAnnotations;

namespace ToeicGenius.Domains.DTOs.Requests.AI.Writing
{
    public class WritingEmailRequestDto
    {
        [Required(ErrorMessage = "Answer text is required")]
        [MinLength(50, ErrorMessage = "Response should be at least 50 words")]
        public string Text { get; set; }

        [Required(ErrorMessage = "Question number is required")]
        [Range(6, 7, ErrorMessage = "Question number must be 6 or 7")]
        public int QuestionNumber { get; set; }

        public int? QuestionId { get; set; }
    }
}
