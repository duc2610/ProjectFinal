using ToeicGenius.Domains.Enums;

namespace ToeicGenius.Domains.DTOs.Responses.QuestionGroup
{
    public class QuestionGroupListItemDto
    {
        public int QuestionGroupId { get; set; }
        public int PartId { get; set; }
        public string PartName { get; set; } = null!;
        public QuestionSkill Skill { get; set; }
        public string? AudioUrl { get; set; }
        public string? ImageUrl { get; set; }
        public string? PassageContent { get; set; }
        public int OrderIndex { get; set; }
        public int QuestionCount { get; set; }
		public CommonStatus Status{ get; set; }
    }
}