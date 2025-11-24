namespace ToeicGenius.Domains.DTOs.Responses.TestCreatorDashboard;

public class TestCreatorRecentActivityResponseDto
{
    public string ActivityType { get; set; } = string.Empty; // "Tạo bài thi mới", "Thêm câu hỏi", "Xuất bản bài thi", "Cập nhật bài thi", "Xóa câu hỏi"
    public string Details { get; set; } = string.Empty; // e.g., "Bài thi: TOEIC Practice Test #45", "Số lượng: 5"
    public string Status { get; set; } = string.Empty; // "success", "error", "info"
    public DateTime Timestamp { get; set; }
    public string TimeAgo { get; set; } = string.Empty; // "10 phút trước", "2 giờ trước", "4 ngày trước"
}
