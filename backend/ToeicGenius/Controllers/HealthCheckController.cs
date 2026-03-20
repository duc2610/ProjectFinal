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
        private readonly ILogger<HealthCheckController> _logger;

        public HealthCheckController(ILogger<HealthCheckController> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// Health check endpoint - returns API status
        /// </summary>
        /// <returns>API status</returns>
        [HttpGet]
        [AllowAnonymous]
        public IActionResult Health()
        {
            _logger.LogInformation("[HEALTH CHECK] Health check request received at {Timestamp}", DateTime.UtcNow);
            
            return Ok(new
            {
                status = "healthy",
                timestamp = DateTime.UtcNow,
                message = "API is running",
                version = "1.0"
            });
        }

        /// <summary>
        /// Simple ping endpoint
        /// </summary>
        [HttpGet("ping")]
        [AllowAnonymous]
        public IActionResult Ping()
        {
            _logger.LogInformation("[HEALTH CHECK] Ping request received at {Timestamp}", DateTime.UtcNow);
            return Ok(new
            {
                message = "pong",
                timestamp = DateTime.UtcNow
            });
        }
    }
}
