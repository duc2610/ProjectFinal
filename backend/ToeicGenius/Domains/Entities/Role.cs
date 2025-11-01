using System.ComponentModel.DataAnnotations;

namespace ToeicGenius.Domains.Entities
{
	public class Role
	{
		[Key]
		public int Id { get; set; }

		[Required, MaxLength(50)]
		public string RoleName { get; set; } = string.Empty;

		[MaxLength(200)]
		public string? Description { get; set; }
		public ICollection<User> Users { get; set; } = new List<User>();
	}
}
