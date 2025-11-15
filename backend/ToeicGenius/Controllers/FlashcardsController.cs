using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.DTOs.Requests.Flashcard;
using ToeicGenius.Domains.DTOs.Responses.Flashcard;
using ToeicGenius.Services.Interfaces;

namespace ToeicGenius.Controllers
{
	[Route("api/flashcards")]
	[ApiController]
	[Authorize(Roles = "Examinee")]
	public class FlashcardsController : ControllerBase
	{
		private readonly IFlashcardService _flashcardService;

		public FlashcardsController(IFlashcardService flashcardService)
		{
			_flashcardService = flashcardService;
		}

		#region FlashcardSet APIs

		/// <summary>
		/// Create new flashcard set (list)
		/// </summary>
		[HttpPost("sets")]
		public async Task<IActionResult> CreateSet([FromBody] CreateFlashcardSetDto dto)
		{
			var userId = GetUserId();
			var result = await _flashcardService.CreateSetAsync(dto, userId);

			if (!result.IsSuccess)
				return BadRequest(ApiResponse<FlashcardSetResponseDto>.ErrorResponse(result.ErrorMessage!));

			return Ok(ApiResponse<FlashcardSetResponseDto>.SuccessResponse(result.Data!));
		}

		/// <summary>
		/// Get all flashcard sets of current user
		/// </summary>
		[HttpGet("sets")]
		public async Task<IActionResult> GetUserSets()
		{
			var userId = GetUserId();
			var result = await _flashcardService.GetUserSetsAsync(userId);

			if (!result.IsSuccess)
				return BadRequest(ApiResponse<IEnumerable<FlashcardSetResponseDto>>.ErrorResponse(result.ErrorMessage!));

			return Ok(ApiResponse<IEnumerable<FlashcardSetResponseDto>>.SuccessResponse(result.Data!));
		}

		/// <summary>
		/// Get flashcard set by ID with all cards
		/// Public sets can be viewed without authentication
		/// </summary>
		[HttpGet("sets/{setId}")]
		[AllowAnonymous]
		public async Task<IActionResult> GetSetById(int setId)
		{
			// Get userId if user is authenticated, otherwise null
			Guid? userId = null;
			var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
			if (!string.IsNullOrEmpty(userIdClaim) && Guid.TryParse(userIdClaim, out var parsedUserId))
			{
				userId = parsedUserId;
			}

			var result = await _flashcardService.GetSetByIdAsync(setId, userId);

			if (!result.IsSuccess)
				return NotFound(ApiResponse<FlashcardSetResponseDto>.ErrorResponse(result.ErrorMessage!));

			return Ok(ApiResponse<FlashcardSetResponseDto>.SuccessResponse(result.Data!));
		}

		/// <summary>
		/// Update flashcard set
		/// </summary>
		[HttpPut("sets/{setId}")]
		public async Task<IActionResult> UpdateSet(int setId, [FromBody] UpdateFlashcardSetDto dto)
		{
			var userId = GetUserId();
			var result = await _flashcardService.UpdateSetAsync(setId, dto, userId);

			if (!result.IsSuccess)
				return BadRequest(ApiResponse<FlashcardSetResponseDto>.ErrorResponse(result.ErrorMessage!));

			return Ok(ApiResponse<FlashcardSetResponseDto>.SuccessResponse(result.Data!));
		}

		/// <summary>
		/// Delete flashcard set
		/// </summary>
		[HttpDelete("sets/{setId}")]
		public async Task<IActionResult> DeleteSet(int setId)
		{
			var userId = GetUserId();
			var result = await _flashcardService.DeleteSetAsync(setId, userId);

			if (!result.IsSuccess)
				return BadRequest(ApiResponse<bool>.ErrorResponse(result.ErrorMessage!));

			return Ok(ApiResponse<bool>.SuccessResponse(true));
		}

		#endregion

		#region Flashcard APIs

		/// <summary>
		/// Add single flashcard to set
		/// </summary>
		[HttpPost("cards")]
		public async Task<IActionResult> AddCard([FromBody] CreateFlashcardDto dto)
		{
			var userId = GetUserId();
			var result = await _flashcardService.AddCardAsync(dto, userId);

			if (!result.IsSuccess)
				return BadRequest(ApiResponse<FlashcardResponseDto>.ErrorResponse(result.ErrorMessage!));

			return Ok(ApiResponse<FlashcardResponseDto>.SuccessResponse(result.Data!));
		}

		/// <summary>
		/// Add flashcard from test (when user highlights text during practice/simulator)
		/// </summary>
		[HttpPost("cards/from-test")]
		public async Task<IActionResult> AddCardFromTest([FromBody] AddFlashcardFromTestDto dto)
		{
			var userId = GetUserId();
			var result = await _flashcardService.AddCardFromTestAsync(dto, userId);

			if (!result.IsSuccess)
				return BadRequest(ApiResponse<FlashcardResponseDto>.ErrorResponse(result.ErrorMessage!));

			return Ok(ApiResponse<FlashcardResponseDto>.SuccessResponse(result.Data!));
		}

		/// <summary>
		/// Bulk add flashcards (from table view)
		/// </summary>
		[HttpPost("cards/bulk")]
		public async Task<IActionResult> BulkAddCards([FromBody] CreateBulkFlashcardsDto dto)
		{
			var userId = GetUserId();
			var result = await _flashcardService.BulkAddCardsAsync(dto, userId);

			if (!result.IsSuccess)
				return BadRequest(ApiResponse<IEnumerable<FlashcardResponseDto>>.ErrorResponse(result.ErrorMessage!));

			return Ok(ApiResponse<IEnumerable<FlashcardResponseDto>>.SuccessResponse(result.Data!));
		}

		/// <summary>
		/// Get all flashcards in a set
		/// Public sets can be viewed without authentication
		/// </summary>
		[HttpGet("sets/{setId}/cards")]
		[AllowAnonymous]
		public async Task<IActionResult> GetCardsBySetId(int setId)
		{
			// Get userId if user is authenticated, otherwise null
			Guid? userId = null;
			var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
			if (!string.IsNullOrEmpty(userIdClaim) && Guid.TryParse(userIdClaim, out var parsedUserId))
			{
				userId = parsedUserId;
			}

			var result = await _flashcardService.GetCardsBySetIdAsync(setId, userId);

			if (!result.IsSuccess)
				return NotFound(ApiResponse<IEnumerable<FlashcardResponseDto>>.ErrorResponse(result.ErrorMessage!));

			return Ok(ApiResponse<IEnumerable<FlashcardResponseDto>>.SuccessResponse(result.Data!));
		}

		/// <summary>
		/// Update flashcard
		/// </summary>
		[HttpPut("cards/{cardId}")]
		public async Task<IActionResult> UpdateCard(int cardId, [FromBody] UpdateFlashcardDto dto)
		{
			var userId = GetUserId();
			var result = await _flashcardService.UpdateCardAsync(cardId, dto, userId);

			if (!result.IsSuccess)
				return BadRequest(ApiResponse<FlashcardResponseDto>.ErrorResponse(result.ErrorMessage!));

			return Ok(ApiResponse<FlashcardResponseDto>.SuccessResponse(result.Data!));
		}

		/// <summary>
		/// Delete flashcard
		/// </summary>
		[HttpDelete("cards/{cardId}")]
		public async Task<IActionResult> DeleteCard(int cardId)
		{
			var userId = GetUserId();
			var result = await _flashcardService.DeleteCardAsync(cardId, userId);

			if (!result.IsSuccess)
				return BadRequest(ApiResponse<bool>.ErrorResponse(result.ErrorMessage!));

			return Ok(ApiResponse<bool>.SuccessResponse(true));
		}

		#endregion

		#region Study Mode APIs

		/// <summary>
		/// Get all public flashcard sets (for discovery/browse)
		/// No authentication required - anyone can view public sets
		/// </summary>
		[HttpGet("public")]
		[AllowAnonymous]
		public async Task<IActionResult> GetPublicSets()
		{
			// Get userId if user is authenticated, otherwise null
			Guid? userId = null;
			var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
			if (!string.IsNullOrEmpty(userIdClaim) && Guid.TryParse(userIdClaim, out var parsedUserId))
			{
				userId = parsedUserId;
			}

			var result = await _flashcardService.GetPublicSetsAsync(userId);

			if (!result.IsSuccess)
				return BadRequest(ApiResponse<IEnumerable<PublicFlashcardSetDto>>.ErrorResponse(result.ErrorMessage!));

			return Ok(ApiResponse<IEnumerable<PublicFlashcardSetDto>>.SuccessResponse(result.Data!));
		}

		/// <summary>
		/// Start study session for a flashcard set (with progress tracking)
		/// </summary>
		[HttpGet("study/{setId}")]
		public async Task<IActionResult> StartStudySession(int setId)
		{
			var userId = GetUserId();
			var result = await _flashcardService.StartStudySessionAsync(setId, userId);

			if (!result.IsSuccess)
				return BadRequest(ApiResponse<StudySessionResponseDto>.ErrorResponse(result.ErrorMessage!));

			return Ok(ApiResponse<StudySessionResponseDto>.SuccessResponse(result.Data!));
		}

		/// <summary>
		/// Mark flashcard as known/unknown during study
		/// </summary>
		[HttpPost("study/mark")]
		public async Task<IActionResult> MarkCardKnowledge([FromBody] MarkCardKnowledgeDto dto)
		{
			var userId = GetUserId();
			var result = await _flashcardService.MarkCardKnowledgeAsync(dto, userId);

			if (!result.IsSuccess)
				return BadRequest(ApiResponse<bool>.ErrorResponse(result.ErrorMessage!));

			return Ok(ApiResponse<bool>.SuccessResponse(true));
		}

		/// <summary>
		/// Get study statistics for a flashcard set
		/// </summary>
		[HttpGet("study/{setId}/stats")]
		public async Task<IActionResult> GetStudyStats(int setId)
		{
			var userId = GetUserId();
			var result = await _flashcardService.GetStudyStatsAsync(setId, userId);

			if (!result.IsSuccess)
				return BadRequest(ApiResponse<StudyStatsResponseDto>.ErrorResponse(result.ErrorMessage!));

			return Ok(ApiResponse<StudyStatsResponseDto>.SuccessResponse(result.Data!));
		}

		#endregion

		#region Helper Methods

		private Guid GetUserId()
		{
			var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
			if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
			{
				throw new UnauthorizedAccessException("Invalid user token");
			}
			return userId;
		}

		#endregion
	}
}
