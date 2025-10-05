using ToeicGenius.Domains.Entities;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Repositories.Persistence;

namespace ToeicGenius.Repositories.Implementations
{
	public class RefreshTokenRepository : BaseRepository<RefreshToken, Guid>, IRefreshTokenRepository
	{
		public RefreshTokenRepository(ToeicGeniusDbContext context) : base(context) { }
	}
}
