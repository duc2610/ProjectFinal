using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.DTOs.Requests.AI;
using ToeicGenius.Domains.DTOs.Requests.AI.Speaking;
using ToeicGenius.Domains.DTOs.Requests.AI.Writing;
using ToeicGenius.Domains.DTOs.Responses.AI;
using ToeicGenius.Services.Interfaces;
using ToeicGenius.Shared.Constants;

namespace ToeicGenius.Controllers
{
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

        [HttpPost("writing/sentence")]
        [Authorize]
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

        [HttpPost("writing/email")]
        [Authorize]
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

        [HttpPost("writing/essay")]
        [Authorize]
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

        [HttpPost("speaking/read-aloud")]
        [Consumes("multipart/form-data")]
        [Authorize]
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

        [HttpPost("speaking/describe-picture")]
        [Consumes("multipart/form-data")]
        [Authorize]
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

        [HttpPost("speaking/respond-questions")]
        [Consumes("multipart/form-data")]
        [Authorize]
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

        [HttpPost("speaking/respond-info")]
        [Consumes("multipart/form-data")]
        [Authorize]
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

        [HttpPost("speaking/express-opinion")]
        [Consumes("multipart/form-data")]
        [Authorize]
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

        [HttpGet("feedback/{feedbackId}")]
        [Authorize]
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

        [HttpGet("history")]
        [Authorize]
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
        /// BULK SUBMISSION - Submit all answers at once (Writing + Speaking)
        /// User completes entire test/practice, then submits all answers together
        /// Backend assesses each part and returns complete results with total scores
        /// </summary>
        [HttpPost("submit-bulk")]
        [Consumes("multipart/form-data")]
        [Authorize]
        public async Task<IActionResult> BulkSubmit([FromForm] BulkAssessmentRequestDto request)
        {
            try
            {
                var userId = GetUserId();

                _logger.LogInformation("📦 Bulk submission received - User: {UserId}, TestResultId: {TestResultId}",
                    userId, request.TestResultId);

                // Log what we received
                _logger.LogInformation("📝 WritingAnswers count: {Count}", request.WritingAnswers?.Count ?? 0);
                _logger.LogInformation("🎤 SpeakingAnswers count: {Count}", request.SpeakingAnswers?.Count ?? 0);

                // Validate that at least one skill is provided
                bool hasWriting = request.WritingAnswers != null && request.WritingAnswers.Any();
                bool hasSpeaking = request.SpeakingAnswers != null && request.SpeakingAnswers.Any();

                if (!hasWriting && !hasSpeaking)
                {
                    return BadRequest(ApiResponse<string>.ErrorResponse(
                        "At least one skill (Writing or Speaking) must be provided", 400));
                }

                // Process bulk assessment
                var result = await _assessmentService.BulkAssessAsync(request, userId);

                return Ok(ApiResponse<BulkAssessmentResponseDto>.SuccessResponse(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error in BulkSubmit - Message: {Message}, Inner: {Inner}",
                    ex.Message, ex.InnerException?.Message ?? "None");
                return StatusCode(500, ApiResponse<string>.ErrorResponse(ex.Message, 500));
            }
        }

        [HttpGet("health")]
        [AllowAnonymous]
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