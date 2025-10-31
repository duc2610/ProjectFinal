using System.ComponentModel.DataAnnotations;
using ToeicGenius.Domains.Enums;
using ToeicGenius.Shared.Constants;

namespace ToeicGenius.Domains.DTOs.Requests.User
{
	public class UpdateUserDto
	{
		[Required(ErrorMessage = ErrorMessages.FullNameRequired)]
		[MaxLength(NumberConstants.MaxPasswordLength, ErrorMessage = ErrorMessages.FullNameMaxLength)]
		public string FullName { get; set; }

		public string? Password { get; set; }

		public List<string>? Roles { get; set; }
	}
}


