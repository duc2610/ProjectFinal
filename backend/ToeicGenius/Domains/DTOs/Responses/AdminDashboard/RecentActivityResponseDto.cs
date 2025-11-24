namespace ToeicGenius.Domains.DTOs.Responses.AdminDashboard;

public class RecentActivityResponseDto
{
    public string ActivityType { get; set; } = string.Empty; // "Đăng ký mới", "Hoàn thành bài thi", "Bị cấm", "Tạo bài thi mới"
    public string UserName { get; set; } = string.Empty;
    public string Details { get; set; } = string.Empty; // e.g., "Bài thi: TOEIC Practice Test #45"
    public string Status { get; set; } = string.Empty; // "success", "error", "info"
    public DateTime Timestamp { get; set; }
    public string TimeAgo { get; set; } = string.Empty; // "12 phút trước", "2 giờ trước", "3 ngày trước"
}
