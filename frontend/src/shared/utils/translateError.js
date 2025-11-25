// Hàm dịch thông báo lỗi từ backend sang tiếng Việt
export const translateErrorMessage = (message) => {
  if (!message) return "Đã xảy ra lỗi. Vui lòng thử lại.";
  
  const translations = {
    // API errors
    "No AI feedbacks found for this test": "Không tìm thấy phản hồi AI cho bài thi này",
    "No AI feedbacks found for this test.": "Không tìm thấy phản hồi AI cho bài thi này",
    "Test not found": "Không tìm thấy bài thi",
    "Test result not found": "Không tìm thấy kết quả bài thi",
    "Question not found": "Không tìm thấy câu hỏi",
    "User not found": "Không tìm thấy người dùng",
    
    // Authentication errors
    "Unauthorized": "Không có quyền truy cập",
    "Forbidden": "Truy cập bị từ chối",
    "Invalid token": "Token không hợp lệ",
    "Token expired": "Token đã hết hạn",
    "Invalid credentials": "Thông tin đăng nhập không đúng",
    "Old password is incorrect": "Mật khẩu cũ không đúng",
    "Current password is incorrect": "Mật khẩu hiện tại không đúng",
    "Incorrect password": "Mật khẩu không đúng",
    
    // HTTP errors
    "Internal server error": "Lỗi máy chủ nội bộ",
    "Bad request": "Yêu cầu không hợp lệ",
    "Not found": "Không tìm thấy",
    "Service unavailable": "Dịch vụ không khả dụng",
    
    // Validation errors
    "Invalid test ID": "ID bài thi không hợp lệ",
    "Invalid test result ID": "ID kết quả bài thi không hợp lệ",
    "Invalid request": "Yêu cầu không hợp lệ",
    "Validation failed": "Dữ liệu không hợp lệ",
    
    // Test-related errors
    "No questions found": "Không tìm thấy câu hỏi",
    "No answers found": "Không tìm thấy câu trả lời",
    "Test already submitted": "Bài thi đã được nộp",
    "Test expired": "Bài thi đã hết hạn",
    "Test is not available": "Bài thi không khả dụng",
    "Cannot start test": "Không thể bắt đầu bài thi",
    "Cannot submit test": "Không thể nộp bài thi",
    
    // Report-related errors
    "Already reported": "Đã báo cáo rồi",
    "Report not found": "Không tìm thấy báo cáo",
    "Cannot report this question": "Không thể báo cáo câu hỏi này",
    "You have already reported this question": "Bạn đã báo cáo câu hỏi này rồi",
    
    // File/Upload errors
    "File too large": "File quá lớn",
    "Invalid file type": "Loại file không hợp lệ",
    "Upload failed": "Tải lên thất bại",
    "Cannot upload file": "Không thể tải file lên",
    
    // Network errors
    "Network error": "Lỗi kết nối mạng",
    "Request timeout": "Yêu cầu hết thời gian",
    "Connection refused": "Kết nối bị từ chối",
    "Failed to fetch": "Không thể kết nối đến máy chủ",
  };
  
  // Kiểm tra xem message có trong danh sách dịch không (case insensitive)
  const lowerMessage = message.toLowerCase();
  for (const [eng, vn] of Object.entries(translations)) {
    if (lowerMessage.includes(eng.toLowerCase())) {
      return vn;
    }
  }
  
  // Nếu message đã là tiếng Việt thì giữ nguyên
  if (/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(message)) {
    return message;
  }
  
  // Trả về message gốc nếu không tìm thấy bản dịch
  return message;
};

export default translateErrorMessage;

