using static System.Net.WebRequestMethods;

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
			if (DateTime.UtcNow > expiryTime) return false;
			return BCrypt.Net.BCrypt.Verify(inputOtp, storedOtp);
		}


	}
}
