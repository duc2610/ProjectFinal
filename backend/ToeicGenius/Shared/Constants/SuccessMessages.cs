namespace ToeicGenius.Shared.Constants
{
	public static class SuccessMessages
	{
		// Auth
		public const string UserRegistered = "Đăng ký tài khoản thành công.";
		public const string UserLoggedIn = "Đăng nhập thành công.";
		public const string UserLoggedOut = "Đăng xuất thành công.";
		public const string PasswordChanged = "Đổi mật khẩu thành công.";
		public const string TokenRefreshed = "Làm mới token thành công.";

		// User
		public const string UserProfileUpdated = "Cập nhật thông tin người dùng thành công.";
		public const string UserDeleted = "Xóa người dùng thành công.";
		public const string UserStatusUpdated = "Cập nhật trạng thái tài khoản thành công";

		// Exam
		public const string ExamCreated = "Tạo bài thi thành công.";
		public const string ExamSubmitted = "Nộp bài thành công.";
		public const string ExamUpdated = "Cập nhật bài thi thành công.";
		public const string ExamDeleted = "Xóa bài thi thành công.";

		// Practice
		public const string PracticeSessionSaved = "Lưu buổi luyện tập thành công.";

		// System
		public const string OperationSuccess = "Thao tác thành công.";

		// Test Operations (with placeholders)
		public const string TestCreatedWithId = "Tạo bài thi thành công (testId: {0})";
		public const string TestCreatedFromBank = "Tạo thành công (testId: {0}) với {1} câu hỏi được chọn ngẫu nhiên từ ngân hàng";
		public const string TestCreatedWithQuestions = "Tạo thành công TestId = {0} với {1} câu hỏi";
		public const string TestFinalized = "Bài kiểm tra {0} đã hoàn tất thành công!";
		public const string PartSaved = "Đã lưu Part {0} thành công";
		public const string TestStatusChanged = "Bài test {0} đã đổi trạng thái thành {1}.";
		public const string TestCloned = "Đã sao chép thành công bài test {0} thành bản nháp mới (testId: {1})";
		public const string ProgressSaved = "Tiến trình đã được lưu thành công.";
	}
}
