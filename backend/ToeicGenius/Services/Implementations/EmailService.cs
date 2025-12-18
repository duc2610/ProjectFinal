using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Mail;
using System.Net;
using System.Text;
using System.Text.Json;
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
			// Kiểm tra xem có ApiKey không để quyết định dùng Resend API hay SMTP
			var apiKey = _configuration["MailSettings:ApiKey"] ?? "";
			
			if (!string.IsNullOrEmpty(apiKey) && apiKey.StartsWith("re_"))
			{
				// Dùng Resend API (Production - Render)
				await SendViaResendAsync(toEmail, subject, body);
			}
			else
			{
				// Dùng SMTP (Local development)
				await SendViaSmtpAsync(toEmail, subject, body);
			}
		}

		private async Task SendViaResendAsync(string toEmail, string subject, string body)
		{
			try
			{
				var fromEmail = _configuration["MailSettings:From"] ?? "";
				var apiKey = _configuration["MailSettings:ApiKey"] ?? "";

				if (string.IsNullOrEmpty(fromEmail) || string.IsNullOrEmpty(apiKey))
				{
					_logger.LogError("MailSettings configuration for Resend is missing or incomplete");
					throw new Exception("MailSettings configuration for Resend is missing or incomplete");
				}

				using var httpClient = new HttpClient();
				httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

				var payload = new
				{
					from = fromEmail,
					to = new[] { toEmail },
					subject,
					html = body
				};

				var json = JsonSerializer.Serialize(payload);
				using var content = new StringContent(json, Encoding.UTF8, "application/json");

				var response = await httpClient.PostAsync("https://api.resend.com/emails", content);

				if (!response.IsSuccessStatusCode)
				{
					var respText = await response.Content.ReadAsStringAsync();
					_logger.LogError("Resend API error: {StatusCode} - {Response}", (int)response.StatusCode, respText);
					throw new Exception($"Resend API error: {(int)response.StatusCode} - {respText}");
				}

				_logger.LogInformation("Email sent successfully to {Email} via Resend", toEmail);
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Failed to send email to {Email} via Resend: {Message}", toEmail, ex.Message);
				throw;
			}
		}

		private async Task SendViaSmtpAsync(string toEmail, string subject, string body)
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
					_logger.LogError("MailSettings configuration for SMTP is missing or incomplete");
					throw new Exception("MailSettings configuration for SMTP is missing or incomplete");
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
				_logger.LogInformation("Email sent successfully to {Email} via SMTP", toEmail);
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Failed to send email to {Email} via SMTP: {Message}", toEmail, ex.Message);
				throw;
			}
		}
	}
}
