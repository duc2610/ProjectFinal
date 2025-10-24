using System.ComponentModel.DataAnnotations;
using ToeicGenius.Domains.Enums;

namespace ToeicGenius.Domains.DTOs.Requests.Test
{
	public class CreateTestFromBankRandomDto
	{
		[Required]
		public string Title { get; set; }

		[Required]
		public TestSkill TestSkill { get; set; }

		public string? Description { get; set; }

		[Required]
		public int Duration { get; set; }

		/// <summary>
		/// Danh sách các phần thi cần random câu hỏi
		/// Ví dụ: Speaking/Writing có nhiều question range (Questions 1-5, Questions 6-7, etc.)
		/// </summary>
		[Required]
		public List<QuestionRangeDto> QuestionRanges { get; set; } = new List<QuestionRangeDto>();
	}

	public class QuestionRangeDto
	{
		/// <summary>
		/// ID của Part (từ bảng Part)
		/// Ví dụ: Speaking Part 1, Writing Part 1, etc.
		/// </summary>
		[Required]
		public int PartId { get; set; }

		/// <summary>
		/// ID của QuestionType (optional - nếu muốn filter theo loại câu hỏi cụ thể)
		/// Ví dụ: "Read a text aloud", "Describe a picture", etc.
		/// </summary>
		public int? QuestionTypeId { get; set; }

		/// <summary>
		/// Số lượng câu hỏi đơn cần random từ bank
		/// </summary>
		public int? SingleQuestionCount { get; set; } = 0;

		/// <summary>
		/// Số lượng nhóm câu hỏi cần random từ bank
		/// </summary>
		public int? GroupQuestionCount { get; set; } = 0;
	}
}
