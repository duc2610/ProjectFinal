using System.Net.Mail;
using System.Net;
using ToeicGenius.Services.Interfaces;
using Castle.Core.Logging;
using SendGrid.Helpers.Mail;
using SendGrid;

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
			var apiKey = _configuration["SendGrid:ApiKey"];
			var client = new SendGridClient(apiKey);

			var from = new EmailAddress(_configuration["SendGrid:FromEmail"], _configuration["SendGrid:FromName"]);
			var to = new EmailAddress(toEmail);
			var msg = MailHelper.CreateSingleEmail(from, to, subject, null, body);

			var response = await client.SendEmailAsync(msg);

			if (!response.IsSuccessStatusCode)
			{
				// Logic xử lý khi lỗi (log error)
				var error = await response.Body.ReadAsStringAsync();
				throw new Exception($"SendGrid Error: {error}");
			}
		}
	}
}
