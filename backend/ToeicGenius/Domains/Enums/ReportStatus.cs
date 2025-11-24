namespace ToeicGenius.Domains.Enums
{
	public enum ReportStatus
	{
		Pending = 0,      // Chưa xử lý
		Reviewing = 1,    // Đang xem xét
		Resolved = 2,     // Đã sửa
		Rejected = 3      // Từ chối (không phải lỗi)
	}
}
