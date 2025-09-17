using System.Net.Mail;
using System.Net;
using ToeicGenius.Services.Interfaces;

namespace ToeicGenius.Services.Implementations
{
	public class EmailService : IEmailService
	{
		private readonly IConfiguration _configuration;

		public EmailService(IConfiguration configuration)
		{
			_configuration = configuration;
		}
		public async Task SendMail(string toEmail, string subject, string body)
		{
			MailMessage message = new MailMessage()
			{
				From = new MailAddress(_configuration["MailSettings:From"] ?? ""),
				Subject = subject,
				Body = body,
				IsBodyHtml = true,
				SubjectEncoding = System.Text.Encoding.UTF8,
				BodyEncoding = System.Text.Encoding.UTF8,
			};
			message.To.Add(toEmail);

			using var smtpClient = new SmtpClient();
			smtpClient.Host = _configuration["MailSettings:Host"] ?? "";
			smtpClient.Port = int.Parse(_configuration["MailSettings:Port"] ?? "587");
			smtpClient.Credentials = new NetworkCredential(
				_configuration["MailSettings:UserName"],
				_configuration["MailSettings:Password"]
			);
			smtpClient.EnableSsl = true;

			await smtpClient.SendMailAsync(message);
		}
	}
}
