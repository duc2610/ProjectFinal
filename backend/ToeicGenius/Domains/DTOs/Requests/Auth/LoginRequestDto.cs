using System.ComponentModel.DataAnnotations;
using ToeicGenius.Shared.Constants;

namespace ToeicGenius.Domains.DTOs.Requests.Auth
{
	public class LoginRequestDto
	{
		[Required(ErrorMessage = ErrorMessages.EmailRequired)]
		[EmailAddress(ErrorMessage = ErrorMessages.EmailInvalid)]
		public string Email { get; set; }

		[Required(ErrorMessage = ErrorMessages.PasswordRequired)]
		public string Password { get; set; }
	}
}
