using System.ComponentModel.DataAnnotations;
using ToeicGenius.Shared.Constants;

namespace ToeicGenius.Domains.DTOs.Requests.Auth
{
	public class ChangePasswordDto
	{
		[Required(ErrorMessage = ErrorMessages.OldPasswordRequired)]
		public string OldPassword { get; set; }

		[Required(ErrorMessage = ErrorMessages.NewPasswordRequired)]
		[MinLength(NumberConstants.MinPasswordLength, ErrorMessage = ErrorMessages.PasswordMinLength)]
		[MaxLength(NumberConstants.MaxPasswordLength, ErrorMessage = ErrorMessages.PasswordMaxLength)]
		[RegularExpression(@"^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).+$", ErrorMessage = ErrorMessages.PasswordInvalidRegex)]
		public string NewPassword { get; set; }

		[Required(ErrorMessage = ErrorMessages.ConfirmNewPasswordRequired)]
		[Compare("NewPassword", ErrorMessage = ErrorMessages.ConfirmNewPasswordMismatch)]
		public string ConfirmNewPassword { get; set; }
	}
}
