using System.ComponentModel.DataAnnotations;

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
        public int Number { get; set; }
		public string? AudioUrl { get; set; }
		public string? ImageUrl { get; set; }
		public ICollection<Option> Options { get; set; } = new List<Option>();

        // 1-1 relationship
        public SolutionDetail SolutionDetail { get; set; } = null!;
    }
}


