using System.ComponentModel.DataAnnotations;

namespace ToeicGenius.Domains.DTOs.Requests.AI.Writing
{
    public class WritingEssayRequestDto
    {
        [Required(ErrorMessage = "Essay text is required")]
        [MinLength(200, ErrorMessage = "Essay should be at least 200 words")]
        public string Text { get; set; }

        [Required(ErrorMessage = "Question number is required")]
        [Range(8, 8, ErrorMessage = "Question number must be 8")]
        public int QuestionNumber { get; set; }

        public int? QuestionId { get; set; }
    }
}
