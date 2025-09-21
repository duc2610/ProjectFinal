using ToeicGenius.Domains.Entities;

namespace ToeicGenius.Repositories.Interfaces
{
	public interface IUserOtpRepository : IBaseRepository<UserOtp,Guid>
	{
		Task<UserOtp?> GetOtpByEmailAsync(string email, int type);
	}
}
