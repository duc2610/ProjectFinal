using System;

namespace ToeicGenius.Shared.Helpers
{
	public static class DateTimeHelper
	{
		// Múi giờ Việt Nam (UTC+7)
		private static readonly TimeZoneInfo VietnamTimeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time") 
			?? TimeZoneInfo.CreateCustomTimeZone("Vietnam Time", TimeSpan.FromHours(7), "Vietnam Time", "Vietnam Time");

		/// <summary>
		/// Lấy thời gian hiện tại theo múi giờ Việt Nam (UTC+7)
		/// </summary>
		public static DateTime Now => TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, VietnamTimeZone);

		/// <summary>
		/// Lấy thời gian hiện tại theo múi giờ Việt Nam (UTC+7) - chỉ ngày (không có giờ)
		/// </summary>
		public static DateTime Today => Now.Date;

		/// <summary>
		/// Chuyển đổi DateTime UTC sang múi giờ Việt Nam
		/// </summary>
		public static DateTime ToVietnamTime(DateTime utcDateTime)
		{
			if (utcDateTime.Kind == DateTimeKind.Unspecified)
			{
				// Nếu không rõ loại, giả sử là UTC
				return TimeZoneInfo.ConvertTimeFromUtc(DateTime.SpecifyKind(utcDateTime, DateTimeKind.Utc), VietnamTimeZone);
			}
			
			if (utcDateTime.Kind == DateTimeKind.Utc)
			{
				return TimeZoneInfo.ConvertTimeFromUtc(utcDateTime, VietnamTimeZone);
			}

			// Nếu đã là Local, convert sang UTC rồi sang Vietnam time
			return TimeZoneInfo.ConvertTimeFromUtc(utcDateTime.ToUniversalTime(), VietnamTimeZone);
		}

		/// <summary>
		/// Chuyển đổi DateTime từ múi giờ Việt Nam sang UTC
		/// </summary>
		public static DateTime ToUtcTime(DateTime vietnamDateTime)
		{
			if (vietnamDateTime.Kind == DateTimeKind.Utc)
			{
				return vietnamDateTime;
			}

			if (vietnamDateTime.Kind == DateTimeKind.Unspecified)
			{
				// Giả sử là Vietnam time nếu không rõ
				return TimeZoneInfo.ConvertTimeToUtc(DateTime.SpecifyKind(vietnamDateTime, DateTimeKind.Unspecified), VietnamTimeZone);
			}

			return TimeZoneInfo.ConvertTimeToUtc(vietnamDateTime, VietnamTimeZone);
		}
	}
}

