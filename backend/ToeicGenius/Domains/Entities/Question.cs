using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using ToeicGenius.Domains.Enums;
using static ToeicGenius.Shared.Helpers.DateTimeHelper;

namespace ToeicGenius.Domains.Entities
{
    public class Question
    {
        [Key]
        public int QuestionId { get; set; }

        [Required]
        public int QuestionTypeId { get; set; }
        public QuestionType QuestionType { get; set; } = null!;

        public int? QuestionGroupId { get; set; }
		public QuestionGroup? QuestionGroup { get; set; }

        [Required]
        public int PartId { get; set; }
        public Part Part { get; set; } = null!;

        public string? Content { get; set; }
        public string? AudioUrl { get; set; }
		public string? ImageUrl { get; set; }
		public string? Explanation { get; set; }
		public DateTime CreatedAt { get; set; } = Now;
		public DateTime? UpdatedAt { get; set; }
		public CommonStatus Status { get; set; } = CommonStatus.Active;
		public ICollection<Option> Options { get; set; } = new List<Option>();

    }
}


