using System.ComponentModel.DataAnnotations;
using ToeicGenius.Shared.Constants;

namespace ToeicGenius.Domains.DTOs.Requests.Auth
{
	public class ResetPasswordRequestDto
	{
		[Required(ErrorMessage = ErrorMessages.EmailRequired)]
		[EmailAddress(ErrorMessage = ErrorMessages.EmailInvalid)]
		public string Email { get; set; }
	}
}
