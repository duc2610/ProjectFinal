using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.DTOs.Requests.AI.Speaking;
using ToeicGenius.Domains.DTOs.Requests.AI.Writing;
using ToeicGenius.Domains.DTOs.Responses;
using ToeicGenius.Domains.DTOs.Responses.AI;
using ToeicGenius.Services.Interfaces;

namespace ToeicGenius.Controllers
{
    /// <summary>
    /// AI Assessment endpoints for Writing and Speaking
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class AssessmentController : ControllerBase
    {
        private readonly IAssessmentService _assessmentService;
        private readonly ILogger<AssessmentController> _logger;

        public AssessmentController(
            IAssessmentService assessmentService,
            ILogger<AssessmentController> logger)
        {
            _assessmentService = assessmentService;
            _logger = logger;
        }

        #region WRITING

        /// <summary>
        /// Assess Writing Part 1 - Write a Sentence (Q1-5)
        /// </summary>
        [HttpPost("writing/sentence")]
        [Authorize]
        [ProducesResponseType(typeof(ApiResponse<AIFeedbackResponseDto>), 200)]
        [ProducesResponseType(typeof(ApiResponse<string>), 400)]
        [ProducesResponseType(typeof(ApiResponse<string>), 500)]
        public async Task<IActionResult> AssessWritingSentence([FromBody] WritingSentenceRequestDto request)
        {
            try
            {
                var userId = GetUserId();
                var result = await _assessmentService.AssessWritingSentenceAsync(request, userId);
                return Ok(ApiResponse<AIFeedbackResponseDto>.SuccessResponse(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in AssessWritingSentence");
                return StatusCode(500, ApiResponse<string>.ErrorResponse(ex.Message, 500));
            }
        }

        /// <summary>
        /// Assess Writing Part 2 - Respond to Email (Q6-7)
        /// </summary>
        [HttpPost("writing/email")]
        [Authorize]
        [ProducesResponseType(typeof(ApiResponse<AIFeedbackResponseDto>), 200)]
        public async Task<IActionResult> AssessWritingEmail([FromBody] WritingEmailRequestDto request)
        {
            try
            {
                var userId = GetUserId();
                var result = await _assessmentService.AssessWritingEmailAsync(request, userId);
                return Ok(ApiResponse<AIFeedbackResponseDto>.SuccessResponse(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in AssessWritingEmail");
                return StatusCode(500, ApiResponse<string>.ErrorResponse(ex.Message, 500));
            }
        }

        /// <summary>
        /// Assess Writing Part 3 - Opinion Essay (Q8)
        /// </summary>
        [HttpPost("writing/essay")]
        [Authorize]
        [ProducesResponseType(typeof(ApiResponse<AIFeedbackResponseDto>), 200)]
        public async Task<IActionResult> AssessWritingEssay([FromBody] WritingEssayRequestDto request)
        {
            try
            {
                var userId = GetUserId();
                var result = await _assessmentService.AssessWritingEssayAsync(request, userId);
                return Ok(ApiResponse<AIFeedbackResponseDto>.SuccessResponse(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in AssessWritingEssay");
                return StatusCode(500, ApiResponse<string>.ErrorResponse(ex.Message, 500));
            }
        }

        #endregion

        #region SPEAKING

        /// <summary>
        /// Assess Speaking Part 1 - Read Aloud (Q1-2)
        /// </summary>
        [HttpPost("speaking/read-aloud")]
        [Consumes("multipart/form-data")]
        [Authorize]
        [ProducesResponseType(typeof(ApiResponse<AIFeedbackResponseDto>), 200)]
        public async Task<IActionResult> AssessReadAloud([FromForm] SpeakingAssessmentRequestDto request)
        {
            try
            {
                var userId = GetUserId();
                var result = await _assessmentService.AssessSpeakingAsync(request, "read_aloud", userId);
                return Ok(ApiResponse<AIFeedbackResponseDto>.SuccessResponse(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in AssessReadAloud");
                return StatusCode(500, ApiResponse<string>.ErrorResponse(ex.Message, 500));
            }
        }

        /// <summary>
        /// Assess Speaking Part 2 - Describe Picture (Q3-4)
        /// </summary>
        [HttpPost("speaking/describe-picture")]
        [Consumes("multipart/form-data")]
        [Authorize]
        [ProducesResponseType(typeof(ApiResponse<AIFeedbackResponseDto>), 200)]
        public async Task<IActionResult> AssessDescribePicture([FromForm] SpeakingAssessmentRequestDto request)
        {
            try
            {
                var userId = GetUserId();
                var result = await _assessmentService.AssessSpeakingAsync(request, "describe_picture", userId);
                return Ok(ApiResponse<AIFeedbackResponseDto>.SuccessResponse(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in AssessDescribePicture");
                return StatusCode(500, ApiResponse<string>.ErrorResponse(ex.Message, 500));
            }
        }

        /// <summary>
        /// Assess Speaking Part 3 - Respond to Questions (Q5-7)
        /// </summary>
        [HttpPost("speaking/respond-questions")]
        [Consumes("multipart/form-data")]
        [Authorize]
        [ProducesResponseType(typeof(ApiResponse<AIFeedbackResponseDto>), 200)]
        public async Task<IActionResult> AssessRespondQuestions([FromForm] SpeakingAssessmentRequestDto request)
        {
            try
            {
                var userId = GetUserId();
                var result = await _assessmentService.AssessSpeakingAsync(request, "respond_questions", userId);
                return Ok(ApiResponse<AIFeedbackResponseDto>.SuccessResponse(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in AssessRespondQuestions");
                return StatusCode(500, ApiResponse<string>.ErrorResponse(ex.Message, 500));
            }
        }

        /// <summary>
        /// Assess Speaking Part 4 - Respond with Information (Q8-10)
        /// </summary>
        [HttpPost("speaking/respond-info")]
        [Consumes("multipart/form-data")]
        [Authorize]
        [ProducesResponseType(typeof(ApiResponse<AIFeedbackResponseDto>), 200)]
        public async Task<IActionResult> AssessRespondInfo([FromForm] SpeakingAssessmentRequestDto request)
        {
            try
            {
                var userId = GetUserId();
                var result = await _assessmentService.AssessSpeakingAsync(request, "respond_with_info", userId);
                return Ok(ApiResponse<AIFeedbackResponseDto>.SuccessResponse(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in AssessRespondInfo");
                return StatusCode(500, ApiResponse<string>.ErrorResponse(ex.Message, 500));
            }
        }

        /// <summary>
        /// Assess Speaking Part 5 - Express Opinion (Q11)
        /// </summary>
        [HttpPost("speaking/express-opinion")]
        [Consumes("multipart/form-data")]
        [Authorize]
        [ProducesResponseType(typeof(ApiResponse<AIFeedbackResponseDto>), 200)]
        public async Task<IActionResult> AssessExpressOpinion([FromForm] SpeakingAssessmentRequestDto request)
        {
            try
            {
                var userId = GetUserId();
                var result = await _assessmentService.AssessSpeakingAsync(request, "express_opinion", userId);
                return Ok(ApiResponse<AIFeedbackResponseDto>.SuccessResponse(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in AssessExpressOpinion");
                return StatusCode(500, ApiResponse<string>.ErrorResponse(ex.Message, 500));
            }
        }

        #endregion

        #region QUERIES

        /// <summary>
        /// Get specific feedback by ID
        /// </summary>
        [HttpGet("feedback/{feedbackId}")]
        [Authorize]
        [ProducesResponseType(typeof(ApiResponse<AIFeedbackResponseDto>), 200)]
        [ProducesResponseType(typeof(ApiResponse<string>), 401)]
        [ProducesResponseType(typeof(ApiResponse<string>), 404)]
        public async Task<IActionResult> GetFeedback(int feedbackId)
        {
            try
            {
                var userId = GetUserId();
                var result = await _assessmentService.GetFeedbackAsync(feedbackId, userId);
                return Ok(ApiResponse<AIFeedbackResponseDto>.SuccessResponse(result));
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(ApiResponse<string>.UnauthorizedResponse("Access denied"));
            }
            catch (Exception ex)
            {
                return NotFound(ApiResponse<string>.NotFoundResponse(ex.Message));
            }
        }

        /// <summary>
        /// Get user's feedback history
        /// </summary>
        /// <param name="aiScorer">Filter by type: "writing" or "speaking"</param>
        [HttpGet("history")]
        [Authorize]
        [ProducesResponseType(typeof(ApiResponse<object>), 200)]
        public async Task<IActionResult> GetHistory([FromQuery] string? aiScorer = null)
        {
            try
            {
                var userId = GetUserId();
                var history = await _assessmentService.GetUserHistoryAsync(userId, aiScorer);

                return Ok(ApiResponse<object>.SuccessResponse(new
                {
                    total = history.Count,
                    feedbacks = history
                }));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetHistory");
                return StatusCode(500, ApiResponse<string>.ErrorResponse(ex.Message, 500));
            }
        }

        /// <summary>
        /// Check health status of Python APIs
        /// </summary>
        [HttpGet("health")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(object), 200)]
        public async Task<IActionResult> CheckHealth()
        {
            var writingHealthy = await _assessmentService.CheckWritingApiHealthAsync();
            var speakingHealthy = await _assessmentService.CheckSpeakingApiHealthAsync();

            return Ok(new
            {
                success = true,
                timestamp = DateTime.UtcNow,
                services = new
                {
                    writing_api = new
                    {
                        status = writingHealthy ? "healthy" : "unhealthy",
                        url = "http://localhost:8002"
                    },
                    speaking_api = new
                    {
                        status = speakingHealthy ? "healthy" : "unhealthy",
                        url = "http://localhost:8001"
                    }
                },
                overall_status = writingHealthy && speakingHealthy ? "healthy" : "degraded"
            });
        }

        #endregion

        #region PRIVATE HELPERS

        private Guid GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                throw new UnauthorizedAccessException("Invalid or missing user token");
            }

            return userId;
        }

        #endregion
    }
}