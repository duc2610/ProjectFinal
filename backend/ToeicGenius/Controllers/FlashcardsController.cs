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
		/// </summary>
		[HttpGet("sets/{setId}")]
		public async Task<IActionResult> GetSetById(int setId)
		{
			var userId = GetUserId();
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
		/// </summary>
		[HttpGet("sets/{setId}/cards")]
		public async Task<IActionResult> GetCardsBySetId(int setId)
		{
			var userId = GetUserId();
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
