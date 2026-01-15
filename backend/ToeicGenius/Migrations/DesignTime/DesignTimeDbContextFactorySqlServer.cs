using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using ToeicGenius.Repositories.Persistence;
using System.IO;

namespace ToeicGenius.Migrations.DesignTime
{
    /// <summary>
    /// Design-time factory for SQL Server migrations
    /// Used when running: dotnet ef migrations add ... -c ToeicGeniusDbContextSqlServer
    /// </summary>
    public class DesignTimeDbContextFactorySqlServer : IDesignTimeDbContextFactory<ToeicGeniusDbContextSqlServer>
    {
        public ToeicGeniusDbContextSqlServer CreateDbContext(string[] args)
        {
            // Get connection string from appsettings.json or environment variable
            var configuration = new ConfigurationBuilder()
                .SetBasePath(Path.Combine(Directory.GetCurrentDirectory(), "../.."))
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .AddJsonFile("appsettings.Development.json", optional: true, reloadOnChange: true)
                .AddEnvironmentVariables()
                .Build();

            var connStr = configuration.GetConnectionString("MyCnn") 
                ?? configuration["ConnectionStrings__MyCnn"]
                ?? throw new InvalidOperationException("Missing connection string 'MyCnn'. Set ConnectionStrings:MyCnn (or ConnectionStrings__MyCnn).");

            // Force SQL Server provider
            var optionsBuilder = new DbContextOptionsBuilder<ToeicGeniusDbContextSqlServer>();
            optionsBuilder.UseSqlServer(connStr);

            return new ToeicGeniusDbContextSqlServer(optionsBuilder.Options, configuration);
        }
    }
}
