namespace ToeicGenius.Domains.DTOs.Responses.User
{
	public class UserStatisticsResponseDto
	{
		public int TotalUsers { get; set; }            // Tổng số user trong hệ thống
		public int ActiveUsers { get; set; }           // Số user đang hoạt động (active)
		public int BannedUsers { get; set; }           // Số user bị khóa
		public int NewUsersThisWeek { get; set; }      // User đăng ký mới trong tuần
		public int NewUsersThisMonth { get; set; }     // User đăng ký mới trong tháng
	}
}
