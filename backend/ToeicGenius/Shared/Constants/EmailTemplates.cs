using System;
using ToeicGenius.Domains.Entities;

namespace ToeicGenius.Shared.Constants
{
	public static class EmailTemplates
	{
		public static (string subject, string body) BuildAccountUpdatedEmail(string fullName, string email, string? updatedPassword, string roleName)
		{
			var subject = "ToeicGenius - Tài khoản của bạn đã được cập nhật";

			// Phần mật khẩu chỉ hiển thị khi thật sự có thay đổi
			var passwordSection = string.IsNullOrEmpty(updatedPassword)
				? ""
				: $@"<p style='margin:6px 0;'>
						 <b>Mật khẩu mới:</b>
						<span style='color:#d35400;'>{updatedPassword}</span>
					</p>";

			var body = $@"<div style='font-family: Arial, sans-serif; color:#2c3e50; line-height:1.6; max-width:600px; margin:0 auto; padding:24px; border:1px solid #e6e6e6; border-radius:10px; background-color:#fdfdfd;'>
        
							<h2 style='color:#1a2533; text-align:center; margin-bottom:20px;'>
								TTS – Cập nhật thông tin tài khoản
							</h2>

							<p>Xin chào <b>{fullName}</b>,</p>

							<p>
								Chúng tôi xin thông báo rằng thông tin tài khoản của bạn đã được 
								<b style='color:#1a2533;'>quản trị viên (Admin)</b> cập nhật trong hệ thống.
							</p>

							<div style='background:#ffffff; border:1px solid #dcdcdc; padding:18px; border-radius:8px; margin:20px 0;'>
								<p style='margin:6px 0;'>
									<b>Email đăng nhập:</b> 
									<span style='color:#2c7bd9;'>{email}</span>
								</p>

								<p style='margin:6px 0;'>
									<b>Vai trò hiện tại (Role):</b> 
									<span style='color:#16a085;'>{roleName}</span>
								</p>

								{passwordSection}
							</div>

							<p>
								Nếu bạn không yêu cầu hoặc không mong đợi sự thay đổi này, 
								vui lòng liên hệ ngay với bộ phận hỗ trợ hoặc quản trị viên để được kiểm tra và đảm bảo an toàn tài khoản.
							</p>

							<p style='margin-top:35px; font-size:12px; color:#7f8c8d;'>
								Đây là email được gửi tự động từ hệ thống. Vui lòng không phản hồi lại email này.
							</p>
						</div>";
			return (subject, body);
		}

		public static (string subject, string body) BuildAccountCreatedEmail(string fullName, string Email, string plainPassword)
		{
			var subject = $"ToeicGenius - Thông tin tài khoản";
			var body = $@"<div style='font-family: Arial, sans-serif; color:#333; line-height:1.6; max-width:600px; margin:0 auto; padding:20px; border:1px solid #eee; border-radius:8px; background-color:#fafafa;'>
							<h2 style='color:#2c3e50; text-align:center;'>TTS - Thông tin tài khoản</h2>
							<p>Xin chào <b>{fullName}</b>,</p>
							<p>Tài khoản của bạn đã được <b style='color:#2c3e50;'>admin</b> tạo thành công.</p>

							<div style='background:#fff; border:1px solid #ddd; padding:15px; border-radius:6px; margin:15px 0;'>
								<p style='margin:6px 0;'><b>Email:</b> <span style='color:#2980b9;'>{Email}</span></p>
								<p style='margin:6px 0;'><b>Mật khẩu:</b> <span style='color:#e74c3c;'>{plainPassword}</span></p>
							</div>

							<p style='margin-top:20px;'>Vui lòng <b>đăng nhập</b> và <b>đổi mật khẩu</b> ngay sau lần đăng nhập đầu tiên để đảm bảo an toàn.</p>
							<p style='margin-top:10px;'><b>Không chia sẻ thông tin này với bất kỳ ai.</b></p>

							<p style='margin-top:30px; font-size:12px; color:#777;'>Đây là email tự động, vui lòng không trả lời.</p>
						</div>";
			return (subject, body);
		}

		public static string BuildOtpEmail(string otpCode)
		{
			var body = $@"<!DOCTYPE html>
<html lang='vi'>
<head>
	<meta charset='UTF-8'>
	<meta name='viewport' content='width=device-width, initial-scale=1.0'>
</head>
<body style='margin:0; padding:0; background-color:#f4f4f4; font-family: -apple-system, BlinkMacSystemFont, ""Segoe UI"", Roboto, ""Helvetica Neue"", Arial, sans-serif;'>
	<table role='presentation' style='width:100%; border-collapse:collapse; background-color:#f4f4f4; padding:20px 0;'>
		<tr>
			<td align='center' style='padding:20px 0;'>
				<table role='presentation' style='width:600px; max-width:100%; border-collapse:collapse; background-color:#ffffff; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.1); overflow:hidden;'>
					<!-- Header -->
					<tr>
						<td style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding:30px 20px; text-align:center;'>
							<h1 style='margin:0; color:#ffffff; font-size:24px; font-weight:600; letter-spacing:1px;'>TTS - TOEIC GENIUS</h1>
							<p style='margin:8px 0 0 0; color:#ffffff; font-size:16px; opacity:0.9;'>Mã xác thực OTP</p>
						</td>
					</tr>
					
					<!-- Content -->
					<tr>
						<td style='padding:40px 30px;'>
							<p style='margin:0 0 20px 0; color:#333333; font-size:16px; line-height:1.6;'>
								Xin chào,
							</p>
							<p style='margin:0 0 30px 0; color:#555555; font-size:15px; line-height:1.6;'>
								Bạn đang thực hiện xác thực tài khoản. Vui lòng sử dụng mã OTP bên dưới để hoàn tất quá trình:
							</p>
							
							<!-- OTP Code Box -->
							<table role='presentation' style='width:100%; border-collapse:collapse; margin:30px 0;'>
								<tr>
									<td align='center' style='padding:0;'>
										<div style='background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); border:2px dashed #667eea; border-radius:12px; padding:25px 30px; display:inline-block;'>
											<div style='font-size:36px; font-weight:700; letter-spacing:8px; color:#667eea; font-family: ""Courier New"", monospace; text-align:center;'>
												{otpCode}
											</div>
										</div>
									</td>
								</tr>
							</table>
							
							<!-- Warning Box -->
							<div style='background-color:#fff3cd; border-left:4px solid #ffc107; padding:15px 20px; margin:25px 0; border-radius:6px;'>
								<p style='margin:0; color:#856404; font-size:14px; line-height:1.5;'>
									<strong>Lưu ý quan trọng:</strong><br>
									• Mã OTP có hiệu lực trong <strong>10 phút</strong><br>
									• Không chia sẻ mã này với bất kỳ ai<br>
									• Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email
								</p>
							</div>
							
							<p style='margin:30px 0 0 0; color:#888888; font-size:13px; line-height:1.5;'>
								Email này được gửi tự động từ hệ thống. Vui lòng không trả lời email này.
							</p>
						</td>
					</tr>
					
					<!-- Footer -->
					<tr>
						<td style='background-color:#f8f9fa; padding:20px 30px; text-align:center; border-top:1px solid #e9ecef;'>
							<p style='margin:0; color:#6c757d; font-size:12px; line-height:1.5;'>
								© {DateTime.Now.Year} TTS - TOEIC GENIUS. All rights reserved.
							</p>
							<p style='margin:8px 0 0 0; color:#adb5bd; font-size:11px;'>
								Hệ thống hỗ trợ luyện thi TOEIC trực tuyến
							</p>
						</td>
					</tr>
				</table>
			</td>
		</tr>
	</table>
</body>
</html>";

			return body;
		}

		public static string BuildAccountBannedEmail(string fullname, string banReason = null)
		{
			var body = $@"<div style='font-family: Arial, sans-serif; color:#333; line-height:1.6; max-width:600px; margin:0 auto; padding:20px; border:1px solid #eee; border-radius:8px; background-color:#fafafa;'>
							<h2 style='color:#c0392b; text-align:center;'>TTS - Tài khoản bị khóa</h2>

							<p>Xin chào <b>{fullname}</b>,</p>

							<p>Tài khoản của bạn đã <b>bị khóa</b> do vi phạm chính sách của hệ thống.</p>

							{(string.IsNullOrWhiteSpace(banReason) ? "" : $"<p><b>Lý do:</b> {banReason}</p>")}

							<p>Nếu bạn cho rằng đây là nhầm lẫn, vui lòng liên hệ bộ phận hỗ trợ: <a href='mailto:ttsgenius.official@gmail.com'>support@tts.com</a></p>

							<p style='margin-top:30px; font-size:12px; color:#777;'>Cảm ơn bạn đã sử dụng website TTS.</p>
						</div>";
			return body;
		}

		public static string BuildAccountUnbannedEmail(string fullname)
		{
			var body = $@"<div style='font-family: Arial, sans-serif; color:#333; line-height:1.6; max-width:600px; margin:0 auto; padding:20px; border:1px solid #eee; border-radius:8px; background-color:#fafafa;'>
						<h2 style='color:#27ae60; text-align:center;'>TTS - Tài khoản đã được mở khóa</h2>

						<p>Xin chào <b>{fullname}</b>,</p>

						<p>Tài khoản của bạn đã được <b>mở khóa</b>. Bạn có thể đăng nhập và tiếp tục sử dụng hệ thống như bình thường.</p>

						<p>Chúng tôi khuyến nghị bạn tuân thủ chính sách của hệ thống để tránh các trường hợp khóa tài khoản trong tương lai.</p>

						<p style='margin-top:30px; font-size:12px; color:#777;'>Cảm ơn bạn đã sử dụng website TTS.</p>
					</div>";
			return body;
		}

	}
}
