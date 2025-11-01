using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ToeicGenius.Domains.DTOs.Requests.Question;
using ToeicGenius.Shared.Constants;

namespace ToeicGenius.Domains.DTOs.Requests.GroupQuestion
{
	public class QuestionGroupRequestDto
	{
		[Required(ErrorMessage = "Part ID is required.")]
		[Range(1, int.MaxValue, ErrorMessage = "Part ID must be a positive integer.")]
		public int PartId { get; set; }
		// File âm thanh (nullable, không bắt buộc)
		public IFormFile? Audio { get; set; }

		// File hình ảnh (nullable, không bắt buộc)
		public IFormFile? Image { get; set; }
		public string? PassageContent { get; set; }

		[Required]
		public string QuestionsJson { get; set; } = string.Empty;

		[NotMapped]
		public List<CreateQuestionDto> Questions { get; set; } = new();
	}
}
