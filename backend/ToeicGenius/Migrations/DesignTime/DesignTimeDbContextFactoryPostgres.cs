using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using ToeicGenius.Repositories.Persistence;
using System.IO;

namespace ToeicGenius.Migrations.DesignTime
{
    /// <summary>
    /// Design-time factory for PostgreSQL migrations
    /// Used when running: dotnet ef migrations add ... -c ToeicGeniusDbContextPostgres
    /// </summary>
    public class DesignTimeDbContextFactoryPostgres : IDesignTimeDbContextFactory<ToeicGeniusDbContextPostgres>
    {
        public ToeicGeniusDbContextPostgres CreateDbContext(string[] args)
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

            // Force PostgreSQL provider
            var optionsBuilder = new DbContextOptionsBuilder<ToeicGeniusDbContextPostgres>();
            optionsBuilder.UseNpgsql(connStr);

            return new ToeicGeniusDbContextPostgres(optionsBuilder.Options, configuration);
        }
    }
}
