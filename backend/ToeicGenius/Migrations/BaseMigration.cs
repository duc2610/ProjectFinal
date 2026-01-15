using System;
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
        public static void ExecuteIfProvider(MigrationBuilder migrationBuilder, string providerName, string sql, bool suppressTransaction = false)
        {
            var provider = migrationBuilder.ActiveProvider ?? "";
            if (provider.Contains(providerName))
            {
                migrationBuilder.Sql(sql, suppressTransaction);
            }
        }

        /// <summary>
        /// Executes SQL only if the active provider is PostgreSQL
        /// </summary>
        public static void ExecuteIfPostgres(MigrationBuilder migrationBuilder, string sql, bool suppressTransaction = false)
        {
            if (IsPostgreSQL(migrationBuilder))
            {
                migrationBuilder.Sql(sql, suppressTransaction);
            }
        }

        /// <summary>
        /// Executes SQL only if the active provider is SQL Server
        /// </summary>
        public static void ExecuteIfSqlServer(MigrationBuilder migrationBuilder, string sql, bool suppressTransaction = false)
        {
            if (IsSqlServer(migrationBuilder))
            {
                migrationBuilder.Sql(sql, suppressTransaction);
            }
        }

        /// <summary>
        /// Validates that the active provider is either PostgreSQL or SQL Server
        /// Throws NotSupportedException if provider is not supported
        /// </summary>
        public static void ValidateProvider(MigrationBuilder migrationBuilder)
        {
            var provider = migrationBuilder.ActiveProvider ?? "";
            if (!provider.Contains("Npgsql") && !provider.Contains("SqlServer"))
            {
                throw new NotSupportedException($"Unsupported database provider: {provider}. Only PostgreSQL (Npgsql) and SQL Server are supported.");
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
