using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ToeicGenius.Repositories.Persistence;

namespace ToeicGenius.Controllers
{
    [AllowAnonymous]
    [Route("api/health")]
    [ApiController]
    public class HealthCheckController : ControllerBase
    {
        private readonly ToeicGeniusDbContext _dbContext;

        public HealthCheckController(ToeicGeniusDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        /// <summary>
        /// Health check endpoint - returns API status
        /// </summary>
        /// <returns>API status</returns>
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> Health()
        {
            try
            {
                // Test database connection
                var canConnect = await _dbContext.Database.CanConnectAsync();
                
                if (!canConnect)
                {
                    return StatusCode(503, new
                    {
                        status = "unhealthy",
                        timestamp = DateTime.UtcNow,
                        message = "Database connection failed"
                    });
                }

                return Ok(new
                {
                    status = "healthy",
                    timestamp = DateTime.UtcNow,
                    database = "connected",
                    version = "1.0"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(503, new
                {
                    status = "unhealthy",
                    timestamp = DateTime.UtcNow,
                    message = ex.Message
                });
            }
        }

        /// <summary>
        /// Simple ping endpoint
        /// </summary>
        [HttpGet("ping")]
        [AllowAnonymous]
        public IActionResult Ping()
        {
            return Ok(new
            {
                message = "pong",
                timestamp = DateTime.UtcNow
            });
        }
    }
}
