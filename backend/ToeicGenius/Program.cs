using Amazon.Extensions.NETCore.Setup;
using Amazon.Runtime;
using Amazon;
using Amazon.S3;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using ToeicGenius.Configurations;
using ToeicGenius.Filters;
using ToeicGenius.Repositories.Persistence;
using Microsoft.AspNetCore.Http.Features;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers(options =>
{
    options.Filters.Add<ValidateModelAttribute>();

})
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

// DB Context - Tự động nhận diện provider và đăng ký đúng DbContext
var connStr = builder.Configuration.GetConnectionString("MyCnn");
if (string.IsNullOrWhiteSpace(connStr))
{
    connStr = builder.Configuration["ConnectionStrings__MyCnn"];
}

if (string.IsNullOrWhiteSpace(connStr))
{
    throw new InvalidOperationException("Missing database connection string. Set ConnectionStrings:MyCnn (or ConnectionStrings__MyCnn).");
}

var dbProvider = builder.Configuration["DbProvider"] ?? builder.Configuration["DB_PROVIDER"];
var usePostgres =
    string.Equals(dbProvider, "postgres", StringComparison.OrdinalIgnoreCase) ||
    connStr.Contains("Host=", StringComparison.OrdinalIgnoreCase) ||
    connStr.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase);

if (usePostgres)
{
    // PostgreSQL - Production (Render)
    // Đăng ký PostgreSQL context
    builder.Services.AddDbContext<ToeicGeniusDbContextPostgres>(options =>
    {
        options.UseNpgsql(connStr, x => x.MigrationsAssembly("ToeicGenius"));
    });
    
    // Đăng ký base context cho các service khác (dùng PostgreSQL context)
    builder.Services.AddScoped<ToeicGeniusDbContext>(sp => 
        sp.GetRequiredService<ToeicGeniusDbContextPostgres>());
}
else
{
    // SQL Server - Local Development
    // Đăng ký SQL Server context
    builder.Services.AddDbContext<ToeicGeniusDbContextSqlServer>(options =>
    {
        options.UseSqlServer(connStr, x => x.MigrationsAssembly("ToeicGenius"));
    });
    
    // Đăng ký base context cho các service khác (dùng SQL Server context)
    builder.Services.AddScoped<ToeicGeniusDbContext>(sp => 
        sp.GetRequiredService<ToeicGeniusDbContextSqlServer>());
}

builder.Services.AddEndpointsApiExplorer();

// Swagger
builder.Services.AddSwaggerGen();

// Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:SecretKey"]))
        };
    });

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        // Configure via ENV/config:
        // - Cors:AllowedOrigins="http://localhost:3000,https://your-frontend.onrender.com"
        // - or CORS_ALLOWED_ORIGINS="http://localhost:3000,https://your-frontend.onrender.com"
        var raw =
            builder.Configuration["Cors:AllowedOrigins"] ??
            builder.Configuration["CORS_ALLOWED_ORIGINS"];

        var origins = (raw ?? "http://localhost:3000")
            .Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        if (origins.Any(o => o == "*"))
        {
            policy.AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        }
        else
        {
            policy.WithOrigins(origins)
              .AllowAnyMethod()
                  .AllowAnyHeader();
        }
    });
});
// ============ CONFIGURATION SETTINGS ============
builder.Services.Configure<PythonApiSettings>(
    builder.Configuration.GetSection("PythonApiSettings"));
;

// ============ HTTP CLIENTS FOR PYTHON APIs ============
builder.Services.AddHttpClient("WritingApi", client =>
{
    var apiUrl = builder.Configuration["PythonApiSettings:WritingApiUrl"];
    var timeout = int.Parse(builder.Configuration["PythonApiSettings:TimeoutSeconds"]);

    client.BaseAddress = new Uri(apiUrl);
    client.Timeout = TimeSpan.FromSeconds(timeout);
});

builder.Services.AddHttpClient("SpeakingApi", client =>
{
    var apiUrl = builder.Configuration["PythonApiSettings:SpeakingApiUrl"];
    var timeout = int.Parse(builder.Configuration["PythonApiSettings:TimeoutSeconds"]);

    client.BaseAddress = new Uri(apiUrl);
    client.Timeout = TimeSpan.FromSeconds(timeout);
});

// HttpClient
builder.Services.AddHttpClient();

// DI
builder.Services.AddDependencyInjectionConfiguration(builder.Configuration);

// ============ BACKGROUND SERVICES ============
builder.Services.AddHostedService<ToeicGenius.BackgroundServices.AutoSubmitExpiredTestsService>();

// ============ FILE UPLOAD LIMITS ============
builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 104857600; // 100MB
});

builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = 104857600; // 100MB
});
builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.SuppressModelStateInvalidFilter = true;
});

//AWS 
var awsOptions = new AWSOptions
{
    Credentials = new BasicAWSCredentials(
        builder.Configuration["AWS:AccessKey"],
        builder.Configuration["AWS:SecretKey"]
    ),
    Region = RegionEndpoint.APSoutheast1
};
builder.Services.AddDefaultAWSOptions(awsOptions);
builder.Services.AddAWSService<IAmazonS3>();
var app = builder.Build();

// Forwarded headers (important when running behind a proxy like Render)
app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
});

// Auto-migrate database on startup
// Works for both SQL Server (local) and PostgreSQL (server deploy)
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        
        // Tự động chọn đúng DbContext dựa trên provider đã đăng ký
        // Thử lấy PostgreSQL context trước, nếu không có thì dùng SQL Server
        var postgresContext = services.GetService<ToeicGeniusDbContextPostgres>();
        if (postgresContext != null)
        {
            // Đang dùng PostgreSQL
            if (postgresContext.Database.CanConnect())
            {
                logger.LogInformation("Database connection successful (PostgreSQL). Checking migrations...");
                
                // Kiểm tra tất cả migrations có sẵn
                var allMigrations = postgresContext.Database.GetMigrations().ToList();
                logger.LogInformation($"Total migrations available: {allMigrations.Count}");
                if (allMigrations.Any())
                {
                    logger.LogInformation($"Available migrations: {string.Join(", ", allMigrations)}");
                }
                
                // Kiểm tra migrations đã được apply
                var appliedMigrations = postgresContext.Database.GetAppliedMigrations().ToList();
                logger.LogInformation($"Applied migrations: {appliedMigrations.Count}");
                if (appliedMigrations.Any())
                {
                    logger.LogInformation($"Applied migrations: {string.Join(", ", appliedMigrations)}");
                }
                
                // Kiểm tra migrations pending
                var pendingMigrations = postgresContext.Database.GetPendingMigrations().ToList();
                logger.LogInformation($"Pending migrations: {pendingMigrations.Count}");
                
                if (pendingMigrations.Any())
                {
                    logger.LogInformation($"Found {pendingMigrations.Count} pending migration(s): {string.Join(", ", pendingMigrations)}");
                    logger.LogInformation("Applying migrations...");
                    postgresContext.Database.Migrate();
                    logger.LogInformation("PostgreSQL migrations applied successfully.");
                }
                else
                {
                    // Nếu có migrations nhưng chưa được apply, force apply
                    if (allMigrations.Any() && appliedMigrations.Count == 0)
                    {
                        logger.LogWarning("Migrations exist but none have been applied. Attempting to apply all migrations...");
                        postgresContext.Database.Migrate();
                        logger.LogInformation("PostgreSQL migrations applied successfully.");
                    }
                    else
                    {
                        logger.LogInformation("No pending migrations. Database is up to date.");
                    }
                }
            }
            else
            {
                logger.LogWarning("PostgreSQL database connection failed. Please check connection string.");
            }
        }
        else
        {
            // Đang dùng SQL Server
            var sqlServerContext = services.GetRequiredService<ToeicGeniusDbContextSqlServer>();
            if (sqlServerContext.Database.CanConnect())
            {
                logger.LogInformation("Database connection successful (SQL Server). Checking for pending migrations...");
                
                // Kiểm tra migrations pending
                var pendingMigrations = sqlServerContext.Database.GetPendingMigrations().ToList();
                if (pendingMigrations.Any())
                {
                    logger.LogInformation($"Found {pendingMigrations.Count} pending migration(s): {string.Join(", ", pendingMigrations)}");
                    logger.LogInformation("Applying migrations...");
                    sqlServerContext.Database.Migrate();
                    logger.LogInformation("SQL Server migrations applied successfully.");
                }
                else
                {
                    logger.LogInformation("No pending migrations. Database is up to date.");
                }
            }
            else
            {
                logger.LogWarning("SQL Server database connection failed. Please check connection string.");
            }
        }
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while migrating the database. Application will continue, but database operations may fail.");
        // Don't throw - allow app to start even if migration fails
        // This is important for production where database might be managed separately
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();