using System.ComponentModel.DataAnnotations;
using ToeicGenius.Shared.Constants;

namespace ToeicGenius.Domains.DTOs.Requests.User
{
	public class CreateUserDto
	{
		[Required(ErrorMessage = ErrorMessages.FullNameRequired)]
		[MaxLength(NumberConstants.MaxPasswordLength, ErrorMessage = ErrorMessages.FullNameMaxLength)]
		public string FullName { get; set; }

		[Required(ErrorMessage = ErrorMessages.EmailRequired)]
		[RegularExpression(@"^[\w\.-]+@[a-zA-Z\d\.-]+\.[a-zA-Z]{2,}$", ErrorMessage = ErrorMessages.EmailInvalid)]
		public string Email { get; set; }

		[Required(ErrorMessage = ErrorMessages.PasswordRequired)]
		[MinLength(NumberConstants.MinPasswordLength, ErrorMessage = ErrorMessages.PasswordMinLength)]
		[MaxLength(NumberConstants.MaxPasswordLength, ErrorMessage = ErrorMessages.PasswordMaxLength)]
		[RegularExpression(@"^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).+$", ErrorMessage = ErrorMessages.PasswordInvalidRegex)]
		public string Password { get; set; }

		public List<string>? Roles { get; set; }
	}
}


