using Amazon.Extensions.NETCore.Setup;
using Amazon.Runtime;
using Amazon;
using Amazon.S3;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
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

// DB Context
builder.Services.AddDbContext<ToeicGeniusDbContext>(options =>
{
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
        connStr.Contains("Host=", StringComparison.OrdinalIgnoreCase);

    if (usePostgres)
    {
        options.UseNpgsql(connStr);
    }
    else
    {
        options.UseSqlServer(connStr);
    }
});

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
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ToeicGeniusDbContext>();
        if (context.Database.IsSqlServer())
        {
            context.Database.Migrate(); // Apply pending migrations automatically (SQL Server)
        }
        else
        {
            // Provider-agnostic bootstrapping for PostgreSQL on fresh deployments (Render free tier).
            // Note: EnsureCreated is not a replacement for migrations.
            context.Database.EnsureCreated();
        }
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while migrating the database.");
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