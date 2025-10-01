using System.ComponentModel.DataAnnotations;

namespace ToeicGenius.Domains.Entities
{
	public class Test
	{
		[Key]
		public int TestId { get; set; }

		public string? TestMode { get; set; }
		public string? Title { get; set; }
		public string? Description { get; set; }
		public int Duration { get; set; }
		public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

		public ICollection<Part> Parts { get; set; } = new List<Part>();
		public ICollection<UserTest> UserTests { get; set; } = new List<UserTest>();
	}
}


