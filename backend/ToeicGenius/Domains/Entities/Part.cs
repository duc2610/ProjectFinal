using System.ComponentModel.DataAnnotations;
using ToeicGenius.Domains.Enums;

namespace ToeicGenius.Domains.Entities
{
	public class Part
	{
		[Key]
		public int PartId{ get; set; }

		public int PartNumber { get; set; }
		public TestSkill Skill {  get; set; }
		public string? Name { get; set; }
		public string? Description { get; set; }

		public ICollection<Test> Tests { get; set; } = new List<Test>();
		public ICollection<QuestionGroup> QuestionGroups { get; set; } = new List<QuestionGroup>();
		public ICollection<Question> Questions { get; set; } = new List<Question>();

	}
}


