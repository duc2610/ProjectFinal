using System.Net.Mail;
using System.Net;
using ToeicGenius.Services.Interfaces;

namespace ToeicGenius.Services.Implementations
{
	public class EmailService : IEmailService
	{
		private readonly IConfiguration _configuration;
		private readonly ILogger<EmailService> _logger;

		public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
		{
			_configuration = configuration;
			_logger = logger;
		}
		public async Task SendMailAsync(string toEmail, string subject, string body)
		{
			try
			{
				var fromEmail = _configuration["MailSettings:From"] ?? "";
				var host = _configuration["MailSettings:Host"] ?? "";
				var port = int.Parse(_configuration["MailSettings:Port"] ?? "587");
				var userName = _configuration["MailSettings:UserName"] ?? "";
				var password = _configuration["MailSettings:Password"] ?? "";

				if (string.IsNullOrEmpty(fromEmail) || string.IsNullOrEmpty(host) || string.IsNullOrEmpty(userName) || string.IsNullOrEmpty(password))
				{
					_logger.LogError("MailSettings configuration is missing or incomplete");
					throw new Exception("MailSettings configuration is missing or incomplete");
				}

				MailMessage message = new MailMessage()
				{
					From = new MailAddress(fromEmail),
					Subject = subject,
					Body = body,
					IsBodyHtml = true,
					SubjectEncoding = System.Text.Encoding.UTF8,
					BodyEncoding = System.Text.Encoding.UTF8,
				};
				message.To.Add(toEmail);

				using var smtpClient = new SmtpClient();
				smtpClient.Host = host;
				smtpClient.Port = port;
				smtpClient.Credentials = new NetworkCredential(userName, password);
				smtpClient.EnableSsl = true;

				await smtpClient.SendMailAsync(message);
				_logger.LogInformation($"Email sent successfully to {toEmail}");
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, $"Failed to send email to {toEmail}: {ex.Message}");
				throw;
			}
		}
	}
}
