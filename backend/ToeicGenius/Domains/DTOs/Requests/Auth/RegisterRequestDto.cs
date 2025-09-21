using System.ComponentModel.DataAnnotations;
using ToeicGenius.Shared.Constants;

namespace ToeicGenius.Domains.DTOs.Requests.Auth
{
	public class RegisterRequestDto
	{
		[Required(ErrorMessage = ErrorMessages.FullNameRequired)]
		[MaxLength(NumberConstants.MaxPasswordLength, ErrorMessage = ErrorMessages.FullNameMaxLength)]
		public string FullName { get; set; }

		[Required(ErrorMessage = ErrorMessages.EmailRequired)]
		[EmailAddress(ErrorMessage = ErrorMessages.EmailInvalid)]
		public string Email { get; set; }

		[Required(ErrorMessage = ErrorMessages.PasswordRequired)]
		[MinLength(NumberConstants.MinPasswordLength, ErrorMessage = ErrorMessages.PasswordMinLength)]
		[MaxLength(NumberConstants.MaxPasswordLength, ErrorMessage = ErrorMessages.PasswordMaxLength)]
		[RegularExpression(@"^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$", ErrorMessage = ErrorMessages.PasswordInvalidRegex)]
		public string Password { get; set; }
	}
}
