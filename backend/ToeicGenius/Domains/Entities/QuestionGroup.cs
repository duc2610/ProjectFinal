using System.ComponentModel.DataAnnotations;
using ToeicGenius.Domains.Enums;

namespace ToeicGenius.Domains.Entities
{
	public class QuestionGroup
	{
		[Key]
		public int QuestionGroupId { get; set; }
		[Required]
		public int PartId { get; set; }
		public Part Part { get; set; } = null!;
		public string? AudioUrl { get; set; }
		public string? Image { get; set; }
		public string? PassageContent { get; set; }
		public string? PassageType { get; set; }
		public int OrderIndex { get; set; }
		public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
		public DateTime? UpdatedAt { get; set; }
		public CommonStatus Status { get; set; } = CommonStatus.Active;
		public ICollection<Question> Questions { get; set; } = new List<Question>();
	}
}


