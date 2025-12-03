namespace ToeicGenius.Services.Interfaces
{
	public interface IEmailService
	{
		Task SendMailAsync(string toEmail, string subject, string body);

	}
}
