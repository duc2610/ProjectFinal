using Microsoft.EntityFrameworkCore.Migrations;

namespace ToeicGenius.Migrations
{
    /// <summary>
    /// Helper class for cross-database migration compatibility
    /// </summary>
    public static class MigrationHelper
    {
        /// <summary>
        /// Gets the appropriate column type for string columns based on the active provider
        /// </summary>
        public static string GetStringType(MigrationBuilder migrationBuilder, int? maxLength = null)
        {
            var provider = migrationBuilder.ActiveProvider ?? "";
            if (provider.Contains("Npgsql"))
            {
                return maxLength.HasValue ? $"varchar({maxLength})" : "text";
            }
            else // SQL Server
            {
                return maxLength.HasValue ? $"nvarchar({maxLength})" : "nvarchar(max)";
            }
        }

        /// <summary>
        /// Gets the appropriate column type for Guid columns based on the active provider
        /// </summary>
        public static string GetGuidType(MigrationBuilder migrationBuilder)
        {
            var provider = migrationBuilder.ActiveProvider ?? "";
            return provider.Contains("Npgsql") ? "uuid" : "uniqueidentifier";
        }

        /// <summary>
        /// Gets the appropriate column type for DateTime columns based on the active provider
        /// </summary>
        public static string GetDateTimeType(MigrationBuilder migrationBuilder)
        {
            var provider = migrationBuilder.ActiveProvider ?? "";
            return provider.Contains("Npgsql") ? "timestamp" : "datetime2";
        }

        /// <summary>
        /// Gets the appropriate column type for bool columns based on the active provider
        /// </summary>
        public static string GetBoolType(MigrationBuilder migrationBuilder)
        {
            var provider = migrationBuilder.ActiveProvider ?? "";
            return provider.Contains("Npgsql") ? "boolean" : "bit";
        }

        /// <summary>
        /// Executes SQL only if the active provider matches the specified provider
        /// </summary>
        public static void ExecuteIfProvider(MigrationBuilder migrationBuilder, string providerName, string sql)
        {
            var provider = migrationBuilder.ActiveProvider ?? "";
            if (provider.Contains(providerName))
            {
                migrationBuilder.Sql(sql, suppressTransaction: false);
            }
        }

        /// <summary>
        /// Checks if the active provider is PostgreSQL
        /// </summary>
        public static bool IsPostgreSQL(MigrationBuilder migrationBuilder)
        {
            var provider = migrationBuilder.ActiveProvider ?? "";
            return provider.Contains("Npgsql");
        }

        /// <summary>
        /// Checks if the active provider is SQL Server
        /// </summary>
        public static bool IsSqlServer(MigrationBuilder migrationBuilder)
        {
            var provider = migrationBuilder.ActiveProvider ?? "";
            return provider.Contains("SqlServer");
        }
    }
}
