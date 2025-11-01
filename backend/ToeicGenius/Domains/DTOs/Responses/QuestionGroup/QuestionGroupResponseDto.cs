using ToeicGenius.Domains.DTOs.Responses.Question;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Domains.Enums;

namespace ToeicGenius.Domains.DTOs.Responses.QuestionGroup
{
	public class QuestionGroupResponseDto
	{
		public int QuestionGroupId { get; set; }
		public int PartId { get; set; }
		public string PartName { get; set; } = null!;
		public string? AudioUrl { get; set; }
		public string? ImageUrl { get; set; }
		public string? PassageContent { get; set; }
		public CommonStatus Status{ get; set; }

		public List<SingleQuestionDto> Questions { get; set; } = new List<SingleQuestionDto>();
	}
	public class SingleQuestionDto
	{
		public int QuestionId { get; set; }
		public int QuestionTypeId { get; set; }
		public string QuestionTypeName { get; set; } = null!;
		public int PartId { get; set; }
		public string PartName { get; set; } = null!;
		public string? Content { get; set; }
		public List<OptionDto> Options { get; set; } = new();
		public string? Solution { get; set; }
		public CommonStatus Status { get; set; }
	}
}
