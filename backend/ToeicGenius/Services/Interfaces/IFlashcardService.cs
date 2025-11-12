using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.DTOs.Requests.Flashcard;
using ToeicGenius.Domains.DTOs.Responses.Flashcard;

namespace ToeicGenius.Services.Interfaces
{
	public interface IFlashcardService
	{
		// FlashcardSet operations
		Task<Result<FlashcardSetResponseDto>> CreateSetAsync(CreateFlashcardSetDto dto, Guid userId);
		Task<Result<IEnumerable<FlashcardSetResponseDto>>> GetUserSetsAsync(Guid userId);
		Task<Result<FlashcardSetResponseDto>> GetSetByIdAsync(int setId, Guid userId);
		Task<Result<FlashcardSetResponseDto>> UpdateSetAsync(int setId, UpdateFlashcardSetDto dto, Guid userId);
		Task<Result<bool>> DeleteSetAsync(int setId, Guid userId);

		// Flashcard operations
		Task<Result<FlashcardResponseDto>> AddCardAsync(CreateFlashcardDto dto, Guid userId);
		Task<Result<FlashcardResponseDto>> AddCardFromTestAsync(AddFlashcardFromTestDto dto, Guid userId);
		Task<Result<IEnumerable<FlashcardResponseDto>>> GetCardsBySetIdAsync(int setId, Guid userId);
		Task<Result<FlashcardResponseDto>> UpdateCardAsync(int cardId, UpdateFlashcardDto dto, Guid userId);
		Task<Result<bool>> DeleteCardAsync(int cardId, Guid userId);
		Task<Result<IEnumerable<FlashcardResponseDto>>> BulkAddCardsAsync(CreateBulkFlashcardsDto dto, Guid userId);
	}
}
