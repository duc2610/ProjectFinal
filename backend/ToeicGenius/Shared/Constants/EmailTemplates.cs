using ToeicGenius.Domains.Entities;

namespace ToeicGenius.Shared.Constants
{
	public static class EmailTemplates
	{
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

			var body = $@"<div style='font-family: Arial, sans-serif; color:#333; line-height:1.6; max-width:600px; margin:0 auto; padding:20px; border:1px solid #eee; border-radius:8px; background-color:#fafafa;'>
    
						<h2 style='color:#2c3e50; text-align:center;'>TTS - Xác thực OTP</h2>
    
						<p>Đây là mã OTP để xác thực tài khoản/hoạt động của bạn:</p>

						<div style='text-align:center; background:#fff; border:1px solid #ddd; padding:20px; border-radius:8px; margin:20px 0;'>
							<span style='font-size:28px; font-weight:bold; letter-spacing:4px; color:#e67e22;'>{otpCode}</span>
						</div>

						<p style='margin-top:10px;'>⏰ Mã này sẽ <b>hết hạn sau 10 phút</b>. Vui lòng không chia sẻ với bất kỳ ai.</p>

						<p style='margin-top:30px; font-size:12px; color:#777;'>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua.</p>
					</div>";

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
