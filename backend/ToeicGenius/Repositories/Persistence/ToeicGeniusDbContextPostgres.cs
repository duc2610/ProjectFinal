using Microsoft.EntityFrameworkCore;

namespace ToeicGenius.Repositories.Persistence
{
    /// <summary>
    /// DbContext for PostgreSQL - used for production (Render)
    /// </summary>
    public class ToeicGeniusDbContextPostgres : ToeicGeniusDbContext
    {
        public ToeicGeniusDbContextPostgres(DbContextOptions<ToeicGeniusDbContext> options, IConfiguration configuration)
            : base(options, configuration)
        {
        }
    }
}
