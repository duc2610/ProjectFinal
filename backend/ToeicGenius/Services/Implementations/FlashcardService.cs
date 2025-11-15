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

		public async Task<Result<FlashcardSetResponseDto>> GetSetByIdAsync(int setId, Guid? userId)
		{
			var set = await _uow.FlashcardSets.GetByIdAsync(setId);
			if (set == null)
				return Result<FlashcardSetResponseDto>.Failure("Flashcard set not found");

			// Nếu set PRIVATE + (user chưa đăng nhập HOẶC không phải owner) → Access denied
			if (!set.IsPublic && (!userId.HasValue || set.UserId != userId.Value))
				return Result<FlashcardSetResponseDto>.Failure("Access denied. This flashcard set is private.");

			// Nếu set PUBLIC hoặc user là owner → cho phép xem
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

		public async Task<Result<IEnumerable<FlashcardResponseDto>>> GetCardsBySetIdAsync(int setId, Guid? userId)
		{
			var set = await _uow.FlashcardSets.GetByIdAsync(setId);
			if (set == null)
				return Result<IEnumerable<FlashcardResponseDto>>.Failure("Flashcard set not found");

			// Nếu set PRIVATE + (user chưa đăng nhập HOẶC không phải owner) → Access denied
			if (!set.IsPublic && (!userId.HasValue || set.UserId != userId.Value))
				return Result<IEnumerable<FlashcardResponseDto>>.Failure("Access denied. This flashcard set is private.");

			// Nếu set PUBLIC hoặc user là owner → cho phép xem cards
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

		#region Study Mode Operations

		public async Task<Result<IEnumerable<PublicFlashcardSetDto>>> GetPublicSetsAsync(Guid? userId)
		{
			var publicSets = await _uow.FlashcardSets.GetPublicSetsAsync();

			// Nếu user KHÔNG đăng nhập, setIdsWithProgress = rỗng
			var setIdsWithProgress = new List<int>();
			if (userId.HasValue)
			{
				var userProgressSets = await _uow.FlashcardProgresses.GetByUserIdAsync(userId.Value);
				setIdsWithProgress = userProgressSets.Select(p => p.Flashcard.SetId).Distinct().ToList();
			}

			var response = publicSets.Select(set => new PublicFlashcardSetDto
			{
				SetId = set.SetId,
				Title = set.Title,
				Description = set.Description,
				Language = set.Language,
				TotalCards = set.TotalCards,
				UserId = set.UserId,
				CreatorName = set.User?.FullName ?? set.User?.Email ?? "Unknown",
				CreatedAt = set.CreatedAt,
				IsStudying = setIdsWithProgress.Contains(set.SetId)
			});

			return Result<IEnumerable<PublicFlashcardSetDto>>.Success(response);
		}

		public async Task<Result<StudySessionResponseDto>> StartStudySessionAsync(int setId, Guid userId)
		{
			var set = await _uow.FlashcardSets.GetByIdWithCardsAndProgressAsync(setId, userId);
			if (set == null)
				return Result<StudySessionResponseDto>.Failure("Flashcard set not found");

			// Check access: owner hoặc public
			if (set.UserId != userId && !set.IsPublic)
				return Result<StudySessionResponseDto>.Failure("Access denied. This flashcard set is private.");

			var cards = new List<StudyCardDto>();

			foreach (var flashcard in set.Flashcards)
			{
				var progress = flashcard.Progresses.FirstOrDefault();

				List<string>? examples = null;
				if (!string.IsNullOrEmpty(flashcard.Examples))
				{
					try
					{
						examples = JsonSerializer.Deserialize<List<string>>(flashcard.Examples);
					}
					catch { }
				}

				cards.Add(new StudyCardDto
				{
					CardId = flashcard.CardId,
					Term = flashcard.Term,
					Definition = flashcard.Definition,
					Pronunciation = flashcard.Pronunciation,
					ImageUrl = flashcard.ImageUrl,
					WordType = flashcard.WordType,
					Examples = examples,
					Notes = flashcard.Notes,
					AudioUrl = flashcard.AudioUrl,
					Status = progress?.Status ?? "new",
					ReviewCount = progress?.ReviewCount ?? 0,
					CorrectCount = progress?.CorrectCount ?? 0,
					IncorrectCount = progress?.IncorrectCount ?? 0,
					LastReviewedAt = progress?.LastReviewedAt,
					NextReviewAt = progress?.NextReviewAt
				});
			}

			var response = new StudySessionResponseDto
			{
				SetId = set.SetId,
				SetTitle = set.Title,
				TotalCards = set.TotalCards,
				Cards = cards
			};

			return Result<StudySessionResponseDto>.Success(response);
		}

		public async Task<Result<bool>> MarkCardKnowledgeAsync(MarkCardKnowledgeDto dto, Guid userId)
		{
			var card = await _uow.Flashcards.GetByIdAsync(dto.CardId);
			if (card == null)
				return Result<bool>.Failure("Flashcard not found");

			var set = await _uow.FlashcardSets.GetByIdAsync(card.SetId);
			if (set == null)
				return Result<bool>.Failure("Flashcard set not found");

			// Check access: owner hoặc public
			if (set.UserId != userId && !set.IsPublic)
				return Result<bool>.Failure("Access denied");

			var progress = await _uow.FlashcardProgresses.GetByCardAndUserAsync(dto.CardId, userId);

			if (progress == null)
			{
				// Tạo mới progress
				progress = new FlashcardProgress
				{
					CardId = dto.CardId,
					UserId = userId,
					ReviewCount = 1,
					CorrectCount = dto.IsKnown ? 1 : 0,
					IncorrectCount = dto.IsKnown ? 0 : 1,
					Status = dto.IsKnown ? "learning" : "new",
					LastReviewedAt = DateTime.UtcNow,
					NextReviewAt = CalculateNextReviewDate(1, dto.IsKnown),
					CreatedAt = DateTime.UtcNow
				};

				await _uow.FlashcardProgresses.AddAsync(progress);
			}
			else
			{
				// Update progress
				progress.ReviewCount++;
				if (dto.IsKnown)
					progress.CorrectCount++;
				else
					progress.IncorrectCount++;

				progress.LastReviewedAt = DateTime.UtcNow;
				progress.NextReviewAt = CalculateNextReviewDate(progress.ReviewCount, dto.IsKnown);

				// Update status based on performance
				if (progress.CorrectCount >= 5 && progress.IncorrectCount == 0)
					progress.Status = "learned";
				else if (progress.ReviewCount > 0)
					progress.Status = "learning";

				progress.UpdatedAt = DateTime.UtcNow;
				await _uow.FlashcardProgresses.UpdateAsync(progress);
			}

			await _uow.SaveChangesAsync();
			return Result<bool>.Success(true);
		}

		public async Task<Result<StudyStatsResponseDto>> GetStudyStatsAsync(int setId, Guid userId)
		{
			var set = await _uow.FlashcardSets.GetByIdAsync(setId);
			if (set == null)
				return Result<StudyStatsResponseDto>.Failure("Flashcard set not found");

			// Check access: owner hoặc public
			if (set.UserId != userId && !set.IsPublic)
				return Result<StudyStatsResponseDto>.Failure("Access denied");

			var progresses = await _uow.FlashcardProgresses.GetBySetAndUserAsync(setId, userId);
			var progressList = progresses.ToList();

			var totalStudied = progressList.Count;
			var totalCorrect = progressList.Sum(p => p.CorrectCount);
			var totalIncorrect = progressList.Sum(p => p.IncorrectCount);
			var newCardsLearned = progressList.Count(p => p.Status == "learning" || p.Status == "learned");

			var accuracyRate = (totalCorrect + totalIncorrect) > 0
				? (double)totalCorrect / (totalCorrect + totalIncorrect) * 100
				: 0;

			var response = new StudyStatsResponseDto
			{
				SetId = setId,
				TotalCardsStudied = totalStudied,
				CardsKnown = totalCorrect,
				CardsUnknown = totalIncorrect,
				NewCardsLearned = newCardsLearned,
				AccuracyRate = Math.Round(accuracyRate, 2),
				StudyDuration = TimeSpan.Zero // Frontend sẽ tính dựa trên session time
			};

			return Result<StudyStatsResponseDto>.Success(response);
		}

		/// <summary>
		/// Spaced Repetition Algorithm - tính ngày review tiếp theo
		/// </summary>
		private DateTime? CalculateNextReviewDate(int reviewCount, bool wasCorrect)
		{
			if (!wasCorrect)
			{
				// Nếu sai, review lại sớm hơn (1 giờ)
				return DateTime.UtcNow.AddHours(1);
			}

			// Nếu đúng, tăng khoảng cách review theo Spaced Repetition
			var intervals = new[] { 1, 3, 7, 14, 30, 60, 120 }; // days
			var dayIndex = Math.Min(reviewCount - 1, intervals.Length - 1);
			return DateTime.UtcNow.AddDays(intervals[dayIndex]);
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
