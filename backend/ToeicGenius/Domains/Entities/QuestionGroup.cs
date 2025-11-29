using System.ComponentModel.DataAnnotations;
using ToeicGenius.Domains.Enums;
using static ToeicGenius.Shared.Helpers.DateTimeHelper;

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
		public string? ImageUrl { get; set; }
		public string? PassageContent { get; set; }
		public DateTime CreatedAt { get; set; } = Now;
		public DateTime? UpdatedAt { get; set; }
		public CommonStatus Status { get; set; } = CommonStatus.Active;

		// Creator tracking
		public Guid? CreatedById { get; set; }
		public User? CreatedBy { get; set; }

		public ICollection<Question> Questions { get; set; } = new List<Question>();
	}
}


