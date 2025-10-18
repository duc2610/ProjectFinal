using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ToeicGenius.Domains.DTOs.Requests.Question;

namespace ToeicGenius.Domains.Entities
{
	public class TestQuestion
	{
		[Key]
		public int TestQuestionId { get; set; }
		[Required]
		public int TestId { get; set; }
		public Test Test { get; set; }
		[Required]
		public int OrderInTest { get; set; }
		public int? PartId { get; set; }
		public Part? Part { get; set; }	

		public int? OriginalQuestionId { get; set; }
		public int? OriginalQuestionGroupId { get; set;}

		[Required]
		public string SnapshotJson { get; set; } = string.Empty;

	}
}
