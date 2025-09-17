namespace ToeicGenius.Shared.Constants
{
	public static class ErrorMessages
	{
		// AUTH - Start
		public const string UserNotFound = "Không tìm thấy người dùng.";
		public const string Unauthorized = "Bạn không có quyền truy cập.";
		public const string TokenExpired = "Token đã hết hạn.";
		public const string TokenInvalid = "Token không hợp lệ.";

		// Password change errors
		public const string OldPasswordRequired = "Mật khẩu cũ không được để trống";
		public const string OldPasswordMismatch = "Mật khẩu cũ không đúng";
		public const string NewPasswordRequired = "Mật khẩu mới không được để trống";
		public const string ConfirmNewPasswordRequired = "Xác nhận mật khẩu mới không được để trống";
		public const string ConfirmNewPasswordMismatch = "Xác nhận mật khẩu phải trùng với mật khẩu mới";

		// Login / registration errors
		public const string InvalidCredentials = "Email hoặc mật khẩu không đúng.";
		public const string EmailAlreadyExists = "Email đã được sử dụng.";
		public const string EmailRequired = "Email không được để trống";
		public const string EmailInvalid = "Định dạng email không hợp lệ";
		public const string PasswordRequired = "Mật khẩu không được để trống";
		public const string PasswordMinLength = "Mật khẩu phải có ít nhất 8 ký tự";
		public const string PasswordMaxLength = "Mật khẩu không được vượt quá 100 ký tự";
		public const string PasswordInvalidRegex = "Mật khẩu phải bao gồm chữ cái và số";
		public const string ConfirmPasswordRequired = "Xác nhận mật khẩu không được để trống";
		public const string ConfirmPasswordMismatch = "Xác nhận mật khẩu phải giống mật khẩu";
		public const string FullNameRequired = "Họ và tên không được để trống";
		public const string FullNameMaxLength = "Họ và tên không được vượt quá 100 ký tự";

		// OTP
		public const string OtpRequired = "Mã OTP không được để trống";
		public const string OtpInvalid = "Mã OTP không hợp lệ hoặc đã hết hạn";

		// AUTH - End

		// User
		public const string UserUpdateFailed = "Cập nhật thông tin người dùng thất bại.";
		public const string UserDeleteFailed = "Xóa người dùng thất bại.";

		// Exam
		public const string ExamNotFound = "Không tìm thấy bài thi.";
		public const string ExamCreateFailed = "Tạo bài thi thất bại.";
		public const string ExamSubmitFailed = "Nộp bài thất bại.";

		// Practice
		public const string PracticeSessionNotFound = "Không tìm thấy buổi luyện tập.";
		public const string PracticeSessionSaveFailed = "Lưu buổi luyện tập thất bại.";

		// Validation
		public const string InvalidRequest = "Yêu cầu không hợp lệ.";
		public const string MissingRequiredFields = "Thiếu thông tin bắt buộc.";
		public const string InvalidFormat = "Định dạng dữ liệu không hợp lệ.";

		// System
		public const string OperationFailed = "Thao tác thất bại.";
		public const string InternalServerError = "Lỗi hệ thống. Vui lòng thử lại sau.";


		public const string IdInvalid = "Id không hợp lệ";
	}
}
