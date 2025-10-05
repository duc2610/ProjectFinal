using ToeicGenius.Domains.DTOs.Requests.Question;

namespace ToeicGenius.Domains.DTOs.Requests.GroupQuestion
{
	public class QuestionGroupRequestDto
	{
		public int PartId { get; set; }
		public string? GroupType { get; set; }
		// File âm thanh (nullable, không bắt buộc)
		public IFormFile? Audio { get; set; }

		// File hình ảnh (nullable, không bắt buộc)
		public IFormFile? Image { get; set; }
		public string? PassageContent { get; set; }
		public string? PassageType { get; set; }
		public int OrderIndex { get; set; }
		public List<CreateQuestionDto> Questions { get; set; } = new();
	}
}
