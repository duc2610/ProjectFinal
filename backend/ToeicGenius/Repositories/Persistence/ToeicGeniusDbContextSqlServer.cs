using Microsoft.EntityFrameworkCore;

namespace ToeicGenius.Repositories.Persistence
{
    /// <summary>
    /// DbContext for SQL Server - used for local development
    /// </summary>
    public class ToeicGeniusDbContextSqlServer : ToeicGeniusDbContext
    {
        public ToeicGeniusDbContextSqlServer(DbContextOptions<ToeicGeniusDbContext> options, IConfiguration configuration)
            : base(options, configuration)
        {
        }
    }
}
