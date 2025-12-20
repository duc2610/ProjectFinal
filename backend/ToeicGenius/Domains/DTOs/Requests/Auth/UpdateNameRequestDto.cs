using System.ComponentModel.DataAnnotations;
using ToeicGenius.Shared.Constants;

namespace ToeicGenius.Domains.DTOs.Requests.Auth
{
    public class UpdateNameRequestDto
    {
        [Required(ErrorMessage = ErrorMessages.FullNameRequired)]
        [MaxLength(NumberConstants.MaxPasswordLength, ErrorMessage = ErrorMessages.FullNameMaxLength)]
        public string FullName { get; set; }
    }
}
