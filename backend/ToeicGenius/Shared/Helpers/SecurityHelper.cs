using System.Text.RegularExpressions;
using ToeicGenius.Shared.Constants;
using static System.Net.WebRequestMethods;
using static ToeicGenius.Shared.Helpers.DateTimeHelper;

namespace ToeicGenius.Shared.Helpers
{
	public static class SecurityHelper
	{
		public static string HashPassword(string password)
		{
			return BCrypt.Net.BCrypt.HashPassword(password);
		}

		public static bool VerifyPassword(string password, string hashedPassword)
		{
			return BCrypt.Net.BCrypt.Verify(password, hashedPassword);
		}

		public static string GenerateOtp(int length = 6)
		{
			var random = new Random();
			return string.Concat(Enumerable.Range(0, length).Select(_ => random.Next(0, 10)));
		}

		public static string HashOtp(string Otp)
		{
			return BCrypt.Net.BCrypt.HashPassword(Otp);
		}

		public static bool ValidateOtp(string inputOtp, string storedOtp, DateTime expiryTime)
		{
			if (Now > expiryTime) return false;
			return BCrypt.Net.BCrypt.Verify(inputOtp, storedOtp);
		}
		public static (bool IsValid, string? ErrorMessage) ValidatePassword(string? password)
		{
			if (string.IsNullOrWhiteSpace(password))
				return (false, ErrorMessages.PasswordRequired);

			if (password.Length < NumberConstants.MinPasswordLength)
				return (false, ErrorMessages.PasswordMinLength);

			if (password.Length > NumberConstants.MaxPasswordLength)
				return (false, ErrorMessages.PasswordMaxLength);

			var regex = new Regex(@"^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$");
			if (!regex.IsMatch(password))
				return (false, ErrorMessages.PasswordInvalidRegex);

			return (true, null);
		}

	}
}
