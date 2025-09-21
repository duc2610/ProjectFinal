using System.ComponentModel.DataAnnotations;
using ToeicGenius.Shared.Constants;

namespace ToeicGenius.Domains.DTOs.Requests.Auth
{
	public class ResetPasswordConfirmDto
	{
		[Required(ErrorMessage = ErrorMessages.EmailRequired)]
		[EmailAddress(ErrorMessage = ErrorMessages.EmailInvalid)]
		public string Email { get; set; }

		[Required(ErrorMessage = ErrorMessages.OtpRequired)]
		public string OtpCode { get; set; }

		[Required(ErrorMessage = ErrorMessages.NewPasswordRequired)]
		[MinLength(NumberConstants.MinPasswordLength, ErrorMessage = ErrorMessages.PasswordMinLength)]
		[MaxLength(NumberConstants.MaxPasswordLength, ErrorMessage = ErrorMessages.PasswordMinLength)]
		public string NewPassword { get; set; }

		[Required(ErrorMessage = "Confirm new password is required")]
		[Compare("NewPassword", ErrorMessage = "Passwords do not match")]
		public string ConfirmNewPassword { get; set; }
	}
}
