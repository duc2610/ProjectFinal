using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace ToeicGenius.Domains.DTOs.Requests.Question
{
	public class CreateQuestionDto
	{
		[Required(ErrorMessage = "Question ID is required.")]
		public int QuestionId { get; set; }

		[Required(ErrorMessage = "Question Type ID is required.")]
		[Range(1, int.MaxValue, ErrorMessage = "Question Type ID must be a positive integer.")]
		public int QuestionTypeId { get; set; }

		[Required(ErrorMessage = "Part ID is required.")]
		[Range(1, int.MaxValue, ErrorMessage = "Part ID must be a positive integer.")]
		public int PartId { get; set; }

		[Required(ErrorMessage = "Question content is required.")]
		[StringLength(1000, ErrorMessage = "Content cannot exceed 1000 characters.")]
		public string Content { get; set; } = string.Empty;

		[Required(ErrorMessage = "Question number is required.")]
		[Range(1, 200, ErrorMessage = "Question number must be between 1 and 200.")]
		public int Number { get; set; }

		// File âm thanh (nullable, không bắt buộc)
		public IFormFile? Audio { get; set; }

		// File hình ảnh (nullable, không bắt buộc)
		public IFormFile? Image { get; set; }

		// Danh sách đáp án (nếu cần)
		public List<AnswerOptionDto>? AnswerOptions { get; set; }
		public string? Solution { get; set; }
	}

	// DTO cho đáp án (nếu câu hỏi có nhiều lựa chọn)
	public class AnswerOptionDto
	{
		[Required(ErrorMessage = "Answer content is required.")]
		[StringLength(500, ErrorMessage = "Answer content cannot exceed 500 characters.")]
		public string Content { get; set; } = string.Empty;

		[Required(ErrorMessage = "Label is required.")]
		[StringLength(3, ErrorMessage = "Label content cannot exceed 3 characters.")]
		public string Label { get; set; } = string.Empty;

		[Required(ErrorMessage = "IsCorrect flag is required.")]
		public bool IsCorrect { get; set; }

		public int OptionOrder { get; set; }
	}
}