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
		public string? GroupType { get; set; }
		public string? AudioUrl { get; set; }
		public string? Image { get; set; }
		public string? PassageContent { get; set; }
		public string? PassageType { get; set; }
		public int OrderIndex { get; set; }
		public CommonStatus Status{ get; set; }

		public List<QuestionResponseDto> Questions { get; set; } = new List<QuestionResponseDto>();
	}
}
