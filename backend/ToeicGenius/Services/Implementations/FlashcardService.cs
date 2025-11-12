using System.Text.Json;
using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.DTOs.Requests.Flashcard;
using ToeicGenius.Domains.DTOs.Responses.Flashcard;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Services.Interfaces;

namespace ToeicGenius.Services.Implementations
{
	public class FlashcardService : IFlashcardService
	{
		private readonly IUnitOfWork _uow;

		public FlashcardService(IUnitOfWork uow)
		{
			_uow = uow;
		}

		#region FlashcardSet Operations

		public async Task<Result<FlashcardSetResponseDto>> CreateSetAsync(CreateFlashcardSetDto dto, Guid userId)
		{
			var flashcardSet = new FlashcardSet
			{
				Title = dto.Title,
				Description = dto.Description,
				Language = dto.Language,
				IsPublic = dto.IsPublic,
				UserId = userId,
				CreatedAt = DateTime.UtcNow
			};

			await _uow.FlashcardSets.AddAsync(flashcardSet);
			await _uow.SaveChangesAsync();

			return Result<FlashcardSetResponseDto>.Success(MapToSetResponse(flashcardSet));
		}

		public async Task<Result<IEnumerable<FlashcardSetResponseDto>>> GetUserSetsAsync(Guid userId)
		{
			var sets = await _uow.FlashcardSets.GetByUserIdAsync(userId);
			var response = sets.Select(MapToSetResponse);
			return Result<IEnumerable<FlashcardSetResponseDto>>.Success(response);
		}

		public async Task<Result<FlashcardSetResponseDto>> GetSetByIdAsync(int setId, Guid userId)
		{
			var set = await _uow.FlashcardSets.GetByIdAsync(setId);
			if (set == null)
				return Result<FlashcardSetResponseDto>.Failure("Flashcard set not found");

			if (set.UserId != userId && !set.IsPublic)
				return Result<FlashcardSetResponseDto>.Failure("Access denied");

			return Result<FlashcardSetResponseDto>.Success(MapToSetResponse(set));
		}

		public async Task<Result<FlashcardSetResponseDto>> UpdateSetAsync(int setId, UpdateFlashcardSetDto dto, Guid userId)
		{
			if (!await _uow.FlashcardSets.IsOwnerAsync(setId, userId))
				return Result<FlashcardSetResponseDto>.Failure("Access denied");

			var set = await _uow.FlashcardSets.GetByIdAsync(setId);
			if (set == null)
				return Result<FlashcardSetResponseDto>.Failure("Flashcard set not found");

			set.Title = dto.Title;
			set.Description = dto.Description;
			set.Language = dto.Language;
			set.IsPublic = dto.IsPublic;
			set.UpdatedAt = DateTime.UtcNow;

			await _uow.FlashcardSets.UpdateAsync(set);
			await _uow.SaveChangesAsync();

			return Result<FlashcardSetResponseDto>.Success(MapToSetResponse(set));
		}

		public async Task<Result<bool>> DeleteSetAsync(int setId, Guid userId)
		{
			if (!await _uow.FlashcardSets.IsOwnerAsync(setId, userId))
				return Result<bool>.Failure("Access denied");

			var set = await _uow.FlashcardSets.GetByIdAsync(setId);
			if (set == null)
				return Result<bool>.Failure("Flashcard set not found");

			await _uow.Flashcards.DeleteBySetIdAsync(setId);
			await _uow.FlashcardSets.DeleteAsync(set);
			await _uow.SaveChangesAsync();

			return Result<bool>.Success(true);
		}

		#endregion

		#region Flashcard Operations

		public async Task<Result<FlashcardResponseDto>> AddCardAsync(CreateFlashcardDto dto, Guid userId)
		{
			if (!await _uow.FlashcardSets.IsOwnerAsync(dto.SetId, userId))
				return Result<FlashcardResponseDto>.Failure("Access denied");

			var flashcard = new Flashcard
			{
				SetId = dto.SetId,
				Term = dto.Term,
				Definition = dto.Definition,
				Pronunciation = dto.Pronunciation,
				ImageUrl = dto.ImageUrl,
				WordType = dto.WordType,
				Examples = dto.Examples != null ? JsonSerializer.Serialize(dto.Examples) : null,
				Notes = dto.Notes,
				AudioUrl = dto.AudioUrl,
				CreatedAt = DateTime.UtcNow
			};

			await _uow.Flashcards.AddAsync(flashcard);
			await _uow.SaveChangesAsync();
			await _uow.FlashcardSets.UpdateTotalCardsAsync(dto.SetId);
			await _uow.SaveChangesAsync();

			return Result<FlashcardResponseDto>.Success(MapToCardResponse(flashcard));
		}

		public async Task<Result<FlashcardResponseDto>> AddCardFromTestAsync(AddFlashcardFromTestDto dto, Guid userId)
		{
			int setId;

			// Nếu SetId null, tạo list mới
			if (!dto.SetId.HasValue)
			{
				if (dto.NewSet == null)
					return Result<FlashcardResponseDto>.Failure("NewSet is required when SetId is null");

				var newSet = new FlashcardSet
				{
					Title = dto.NewSet.Title,
					Description = dto.NewSet.Description,
					Language = dto.NewSet.Language,
					IsPublic = dto.NewSet.IsPublic,
					UserId = userId,
					CreatedAt = DateTime.UtcNow
				};

				await _uow.FlashcardSets.AddAsync(newSet);
				await _uow.SaveChangesAsync();
				setId = newSet.SetId;
			}
			else
			{
				// Check ownership
				if (!await _uow.FlashcardSets.IsOwnerAsync(dto.SetId.Value, userId))
					return Result<FlashcardResponseDto>.Failure("Access denied");
				setId = dto.SetId.Value;
			}

			var flashcard = new Flashcard
			{
				SetId = setId,
				Term = dto.Term,
				Definition = dto.Definition,
				Pronunciation = dto.Pronunciation,
				ImageUrl = dto.ImageUrl,
				WordType = dto.WordType,
				Examples = dto.Examples != null ? JsonSerializer.Serialize(dto.Examples) : null,
				Notes = dto.Notes,
				CreatedAt = DateTime.UtcNow
			};

			await _uow.Flashcards.AddAsync(flashcard);
			await _uow.SaveChangesAsync();
			await _uow.FlashcardSets.UpdateTotalCardsAsync(setId);
			await _uow.SaveChangesAsync();

			return Result<FlashcardResponseDto>.Success(MapToCardResponse(flashcard));
		}

		public async Task<Result<IEnumerable<FlashcardResponseDto>>> GetCardsBySetIdAsync(int setId, Guid userId)
		{
			var set = await _uow.FlashcardSets.GetByIdAsync(setId);
			if (set == null)
				return Result<IEnumerable<FlashcardResponseDto>>.Failure("Flashcard set not found");

			if (set.UserId != userId && !set.IsPublic)
				return Result<IEnumerable<FlashcardResponseDto>>.Failure("Access denied");

			var cards = await _uow.Flashcards.GetBySetIdAsync(setId);
			var response = cards.Select(MapToCardResponse);
			return Result<IEnumerable<FlashcardResponseDto>>.Success(response);
		}

		public async Task<Result<FlashcardResponseDto>> UpdateCardAsync(int cardId, UpdateFlashcardDto dto, Guid userId)
		{
			var card = await _uow.Flashcards.GetByIdAsync(cardId);
			if (card == null)
				return Result<FlashcardResponseDto>.Failure("Flashcard not found");

			if (!await _uow.FlashcardSets.IsOwnerAsync(card.SetId, userId))
				return Result<FlashcardResponseDto>.Failure("Access denied");

			card.Term = dto.Term;
			card.Definition = dto.Definition;
			card.Pronunciation = dto.Pronunciation;
			card.ImageUrl = dto.ImageUrl;
			card.WordType = dto.WordType;
			card.Examples = dto.Examples != null ? JsonSerializer.Serialize(dto.Examples) : null;
			card.Notes = dto.Notes;
			card.AudioUrl = dto.AudioUrl;
			card.UpdatedAt = DateTime.UtcNow;

			await _uow.Flashcards.UpdateAsync(card);
			await _uow.SaveChangesAsync();

			return Result<FlashcardResponseDto>.Success(MapToCardResponse(card));
		}

		public async Task<Result<bool>> DeleteCardAsync(int cardId, Guid userId)
		{
			var card = await _uow.Flashcards.GetByIdAsync(cardId);
			if (card == null)
				return Result<bool>.Failure("Flashcard not found");

			if (!await _uow.FlashcardSets.IsOwnerAsync(card.SetId, userId))
				return Result<bool>.Failure("Access denied");

			var setId = card.SetId;
			await _uow.Flashcards.DeleteAsync(card);
			await _uow.SaveChangesAsync();
			await _uow.FlashcardSets.UpdateTotalCardsAsync(setId);
			await _uow.SaveChangesAsync();

			return Result<bool>.Success(true);
		}

		public async Task<Result<IEnumerable<FlashcardResponseDto>>> BulkAddCardsAsync(CreateBulkFlashcardsDto dto, Guid userId)
		{
			if (!await _uow.FlashcardSets.IsOwnerAsync(dto.SetId, userId))
				return Result<IEnumerable<FlashcardResponseDto>>.Failure("Access denied");

			var flashcards = new List<Flashcard>();
			foreach (var item in dto.Flashcards)
			{
				var examples = new List<string>();
				if (!string.IsNullOrEmpty(item.Example1)) examples.Add(item.Example1);
				if (!string.IsNullOrEmpty(item.Example2)) examples.Add(item.Example2);

				flashcards.Add(new Flashcard
				{
					SetId = dto.SetId,
					Term = item.Term,
					Definition = item.Definition,
					Pronunciation = item.Pronunciation,
					Examples = examples.Count > 0 ? JsonSerializer.Serialize(examples) : null,
					Notes = item.Notes,
					CreatedAt = DateTime.UtcNow
				});
			}

			await _uow.Flashcards.AddRangeAsync(flashcards);
			await _uow.SaveChangesAsync();
			await _uow.FlashcardSets.UpdateTotalCardsAsync(dto.SetId);
			await _uow.SaveChangesAsync();

			var response = flashcards.Select(MapToCardResponse);
			return Result<IEnumerable<FlashcardResponseDto>>.Success(response);
		}

		#endregion

		#region Mapping

		private FlashcardSetResponseDto MapToSetResponse(FlashcardSet set)
		{
			return new FlashcardSetResponseDto
			{
				SetId = set.SetId,
				Title = set.Title,
				Description = set.Description,
				Language = set.Language,
				IsPublic = set.IsPublic,
				UserId = set.UserId,
				TotalCards = set.TotalCards,
				CreatedAt = set.CreatedAt,
				UpdatedAt = set.UpdatedAt
			};
		}

		private FlashcardResponseDto MapToCardResponse(Flashcard card)
		{
			List<string>? examples = null;
			if (!string.IsNullOrEmpty(card.Examples))
			{
				try
				{
					examples = JsonSerializer.Deserialize<List<string>>(card.Examples);
				}
				catch { }
			}

			return new FlashcardResponseDto
			{
				CardId = card.CardId,
				SetId = card.SetId,
				Term = card.Term,
				Definition = card.Definition,
				Pronunciation = card.Pronunciation,
				ImageUrl = card.ImageUrl,
				WordType = card.WordType,
				Examples = examples,
				Notes = card.Notes,
				AudioUrl = card.AudioUrl,
				CreatedAt = card.CreatedAt,
				UpdatedAt = card.UpdatedAt
			};
		}

		#endregion
	}
}
