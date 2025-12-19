namespace ToeicGenius.Shared.Constants
{
	public static class ErrorMessages
	{
		// AUTH - Start
		public const string UserNotFound = "Không tìm thấy người dùng.";
		public const string Unauthorized = "Bạn không có quyền truy cập.";
		public const string TokenExpired = "Token đã hết hạn.";
		public const string TokenInvalid = "Token không hợp lệ.";
		public const string LoginSessionTimeOut = "Phiên đăng nhập đã hết hạn.";
		public const string InvalidOrMissingUserId = "Phiên đăng nhập đã hết hạn.";

		// Password change errors
		public const string OldPasswordRequired = "Mật khẩu cũ không được để trống";
		public const string OldPasswordMismatch = "Mật khẩu cũ không đúng";
		public const string NewPasswordRequired = "Mật khẩu mới không được để trống";
		public const string ConfirmNewPasswordRequired = "Xác nhận mật khẩu mới không được để trống";
		public const string ConfirmNewPasswordMismatch = "Xác nhận mật khẩu phải trùng với mật khẩu mới";

		// Login / registration errors
		public const string InvalidCredentials = "Email hoặc mật khẩu không đúng";
		public const string AccountBanned = "Tài khoản của bạn đã bị cấm! Liên hệ admin để biết thêm chi tiết";
		public const string AccountDeleted = "Tài khoản của bạn đã bị xóa";
		public const string EmailAlreadyExists = "Email đã được sử dụng.";
		public const string EmailRequired = "Email không được để trống";
		public const string EmailInvalid = "Định dạng email không hợp lệ";
		public const string PasswordRequired = "Mật khẩu không được để trống";
		public const string PasswordMinLength = "Mật khẩu phải có ít nhất 8 ký tự";
		public const string PasswordMaxLength = "Mật khẩu không được vượt quá 32 ký tự";
		public const string PasswordInvalidRegex = "Mật khẩu phải bao gồm chữ cái, số và kí tự đặc biệt";
		public const string ConfirmPasswordRequired = "Xác nhận mật khẩu không được để trống";
		public const string ConfirmPasswordMismatch = "Xác nhận mật khẩu phải giống mật khẩu";
		public const string FullNameRequired = "Họ và tên không được để trống";
		public const string FullNameMaxLength = "Họ và tên không được vượt quá 100 ký tự";

		// OTP
		public const string OtpRequired = "Mã OTP không được để trống";
		public const string OtpInvalid = "Mã OTP không hợp lệ hoặc đã hết hạn";
		public const string ResendOtpTooSoon = "Bạn vừa yêu cầu OTP, vui lòng chờ 30 giây trước khi gửi lại";

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
		public const string UploadAudioFail = "Lỗi khi tải lên tệp tin âm thanh";
		public const string UploadImageFail = "Lỗi khi tải lên ảnh";

		public const string IdInvalid = "Id không hợp lệ";
		public const string CannotChangeRootUserStatus = "Bạn không thể thay đổi trạng thái của người dùng Root";

		public const string CannotChangeOwnAccountStatus = "Bạn không được phép tự thay đổi trạng thái tài khoản của chính mình.";

		// Test
		public const string NoPermissionToActionTest = "Bạn không có quyền để thao tác trên bài kiểm tra này.";
		public const string NoQuestionsToSaveForThisPart = "Không có câu hỏi nào để lưu cho phần này.";
		public const string NoQuestionsToSaveForThisTest = "Không có câu hỏi nào để lưu cho test này.";
		public const string NoQuestionRange = "Bạn phải cung cấp phạm vi câu hỏi để thực hiện.";

		// Token and Authentication
		public const string InvalidOrMissingUserToken = "Token người dùng không hợp lệ hoặc bị thiếu.";

		// Request Validation
		public const string RequestCannotBeNull = "Yêu cầu không được để trống.";
		public const string ExcelFileRequired = "Tệp Excel là bắt buộc.";
		public const string AudioFileRequired = "Tệp âm thanh là bắt buộc.";

		// File Operations
		public const string FailedToUploadAudio = "Tải lên tệp âm thanh thất bại.";
		public const string FailedToParseExcel = "Phân tích tệp Excel thất bại.";
		public const string FailedToCreateTest = "Tạo bài kiểm tra thất bại.";
		public const string FailedToGenerateTemplate = "Tạo mẫu thất bại.";
		public const string FailedToGenerateSWTemplate = "Tạo mẫu S&W thất bại.";
		public const string FailedToParseSWExcel = "Phân tích tệp Excel S&W thất bại.";
		public const string FailedToCreateSWTest = "Tạo bài kiểm tra S&W thất bại.";

		// Test Operations
		public const string CannotEditPublishedTest = "Không thể chỉnh sửa bài kiểm tra đã xuất bản. Vui lòng sao chép để tạo phiên bản mới.";
		public const string UnauthorizedAccess = "Truy cập không được phép.";
		public const string InvalidTestOrQuestions = "Bài kiểm tra hoặc câu hỏi không hợp lệ.";
		public const string DuplicateTestName = "Tên bài thi đã tồn tại. Vui lòng chọn tên khác.";
	}
}
