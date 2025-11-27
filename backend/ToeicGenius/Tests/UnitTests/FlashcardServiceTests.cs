using FluentAssertions;
using Moq;
using System.Text.Json;
using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.DTOs.Requests.Flashcard;
using ToeicGenius.Domains.DTOs.Responses.Flashcard;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Domains.Enums;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Services.Implementations;
using Xunit;

namespace ToeicGenius.Tests.UnitTests
{
	public class FlashcardServiceTests
	{
		private readonly Mock<IUnitOfWork> _uowMock = new();
		private readonly Mock<IFlashcardSetRepository> _setRepoMock = new();
		private readonly Mock<IFlashcardRepository> _cardRepoMock = new();
		private readonly Mock<IFlashcardProgressRepository> _progressRepoMock = new();
		private readonly Guid _userId = Guid.NewGuid();
		private readonly Guid _otherUserId = Guid.NewGuid();

		public FlashcardServiceTests()
		{
			_uowMock.SetupGet(u => u.FlashcardSets).Returns(_setRepoMock.Object);
			_uowMock.SetupGet(u => u.Flashcards).Returns(_cardRepoMock.Object);
			_uowMock.SetupGet(u => u.FlashcardProgresses).Returns(_progressRepoMock.Object);
			_uowMock.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);
		}

		private FlashcardService CreateService() => new(_uowMock.Object);

		#region Helper Methods
		private FlashcardSet CreateSet(int setId = 1, Guid? ownerId = null, bool isPublic = true)
		{
			var owner = ownerId ?? _userId;
			return new FlashcardSet
			{
				SetId = setId,
				Title = $"Set {setId}",
				Description = "Description",
				Language = "en-US",
				IsPublic = isPublic,
				UserId = owner,
				User = new User
				{
					Id = owner,
					Email = "owner@example.com",
					FullName = "Owner"
				},
				TotalCards = 2
			};
		}

		private Flashcard CreateCard(int cardId = 1, int setId = 1, string term = "Term", string? examplesJson = null)
		{
			return new Flashcard
			{
				CardId = cardId,
				SetId = setId,
				Term = term,
				Definition = "Definition",
				Pronunciation = "Pron",
				ImageUrl = "img",
				WordType = "N",
				Examples = examplesJson,
				Notes = "Notes",
				AudioUrl = "audio.mp3",
				CreatedAt = DateTime.UtcNow
			};
		}

		private FlashcardProgress CreateProgress(int cardId, Guid userId, string status = "learning", int review = 1, int correct = 1, int incorrect = 0)
		{
			return new FlashcardProgress
			{
				CardId = cardId,
				UserId = userId,
				Status = status,
				ReviewCount = review,
				CorrectCount = correct,
				IncorrectCount = incorrect,
				Flashcard = new Flashcard { SetId = 1, CardId = cardId, Term = "t" }
			};
		}
		#endregion


		#region FlashcardSet Operations
		#region 1. FlashcardService_CreateSetAsync
		//UTCID01: CreateSetAsync tạo set thành công, IsPublic = false
		[Trait("Category", "FlashcardSet")]
		[Trait("TestCase", "UTCID01")]
		[Fact]
		public async Task CreateSetAsync_NotPublish_WhenValid_ReturnsSuccess()
		{
			_setRepoMock.Setup(r => r.AddAsync(It.IsAny<FlashcardSet>()))
				.ReturnsAsync((FlashcardSet set) => { set.SetId = 10; return set; });
			var dto = new CreateFlashcardSetDto { Title = "Sample title", Description = "Sample description", Language = "en-US", IsPublic = false };
			var service = CreateService();

			var result = await service.CreateSetAsync(dto, _userId);

			result.IsSuccess.Should().BeTrue();
			result.Data!.SetId.Should().Be(10);
			result.Data.Title.Should().Be("Sample title");
			result.Data.Description.Should().Be("Sample description");
			result.Data.Language.Should().Be("en-US");
			result.Data.IsPublic.Should().Be(false);
			_setRepoMock.Verify(r => r.AddAsync(It.Is<FlashcardSet>(s => s.UserId == _userId)), Times.Once);
			_uowMock.Verify(u => u.SaveChangesAsync(), Times.Once);
		}
		//UTCID02: CreateSetAsync tạo set thành công, IsPublic = true
		public async Task CreateSetAsync_Publish_WhenValid_ReturnsSuccess()
		{
			_setRepoMock.Setup(r => r.AddAsync(It.IsAny<FlashcardSet>()))
				.ReturnsAsync((FlashcardSet set) => { set.SetId = 10; return set; });
			var dto = new CreateFlashcardSetDto { Title = "Sample title", Description = "Sample description", Language = "en-US", IsPublic = true };
			var service = CreateService();

			var result = await service.CreateSetAsync(dto, _userId);

			result.IsSuccess.Should().BeTrue();
			result.Data!.SetId.Should().Be(10);
			result.Data.Title.Should().Be("Sample title");
			result.Data.Description.Should().Be("Sample description");
			result.Data.Language.Should().Be("en-US");
			result.Data.IsPublic.Should().Be(true);
			_setRepoMock.Verify(r => r.AddAsync(It.Is<FlashcardSet>(s => s.UserId == _userId)), Times.Once);
			_uowMock.Verify(u => u.SaveChangesAsync(), Times.Once);
		}
		#endregion
		#region 2. FlashcardService_GetUserSetsAsync
		//UTCID01: GetUserSetsAsync trả về danh sách set của user
		[Trait("Category", "FlashcardSet")]
		[Trait("TestCase", "UTCID02")]
		[Fact]
		public async Task GetUserSetsAsync_WhenUserHasSets_ReturnsMappedDtos()
		{
			var sets = new List<FlashcardSet>
			{
				CreateSet(1),
				CreateSet(2)
			};
			_setRepoMock.Setup(r => r.GetByUserIdAsync(_userId)).ReturnsAsync(sets);
			var service = CreateService();

			var result = await service.GetUserSetsAsync(_userId);

			result.IsSuccess.Should().BeTrue();
			result.Data!.Count().Should().Be(2);
			result.Data.First().SetId.Should().Be(1);
		}
		#endregion
		#region 3. FlashcardService_GetUserSetsPaginatedAsync
		//UTCID01: GetUserSetsPaginatedAsync ánh xạ dữ liệu phân trang đúng
		[Trait("Category", "FlashcardSet")]
		[Trait("TestCase", "UTCID03")]
		[Fact]
		public async Task GetUserSetsPaginatedAsync_WhenCalled_ReturnsPaginationResponse()
		{
			var sets = new List<FlashcardSet> { CreateSet(1) };
			var paginated = new PaginationResponse<FlashcardSet>(sets, totalCount: 5, currentPage: 2, pageSize: 1);
			_setRepoMock.Setup(r => r.GetByUserIdPaginatedAsync(_userId, "key", "desc", 2, 1))
				.ReturnsAsync(paginated);
			var service = CreateService();

			var result = await service.GetUserSetsPaginatedAsync(_userId, "key", "desc", 2, 1);

			result.IsSuccess.Should().BeTrue();
			result.Data!.TotalCount.Should().Be(5);
			result.Data.DataPaginated.Should().HaveCount(1);
			result.Data.DataPaginated.First().Title.Should().Be("Set 1");
		}
		#endregion
		#region 4. FlashcardService_GetSetByIdAsync
		//UTCID01: GetSetByIdAsync trả về lỗi khi không tìm thấy
		[Trait("Category", "FlashcardSet")]
		[Trait("TestCase", "UTCID04")]
		[Fact]
		public async Task GetSetByIdAsync_WhenNotFound_ReturnsFailure()
		{
			_setRepoMock.Setup(r => r.GetByIdAsync(5)).ReturnsAsync((FlashcardSet)null!);
			var service = CreateService();

			var result = await service.GetSetByIdAsync(5, _userId);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Flashcard set not found");
		}

		//UTCID02: GetSetByIdAsync trả về lỗi khi set private và user không có quyền
		[Trait("Category", "FlashcardSet")]
		[Trait("TestCase", "UTCID05")]
		[Fact]
		public async Task GetSetByIdAsync_WhenPrivateAndNotOwner_ReturnsFailure()
		{
			var set = CreateSet(5, _userId, isPublic: false);
			_setRepoMock.Setup(r => r.GetByIdAsync(5)).ReturnsAsync(set);
			var service = CreateService();

			var result = await service.GetSetByIdAsync(5, _otherUserId);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Access denied. This flashcard set is private.");
		}

		//UTCID03: GetSetByIdAsync trả về thành công khi user là owner
		[Trait("Category", "FlashcardSet")]
		[Trait("TestCase", "UTCID06")]
		[Fact]
		public async Task GetSetByIdAsync_WhenOwner_ReturnsSuccess()
		{
			var set = CreateSet(3, _userId, isPublic: false);
			_setRepoMock.Setup(r => r.GetByIdAsync(3)).ReturnsAsync(set);
			var service = CreateService();

			var result = await service.GetSetByIdAsync(3, _userId);

			result.IsSuccess.Should().BeTrue();
			result.Data!.SetId.Should().Be(3);
		}
		#endregion
		#region 5. FlashcardService_UpdateSetAsync
		//UTCID01: UpdateSetAsync trả về lỗi khi không phải owner
		[Trait("Category", "FlashcardSet")]
		[Trait("TestCase", "UTCID07")]
		[Fact]
		public async Task UpdateSetAsync_WhenNotOwner_ReturnsFailure()
		{
			_setRepoMock.Setup(r => r.IsOwnerAsync(1, _userId)).ReturnsAsync(false);
			var dto = new UpdateFlashcardSetDto { Title = "Updated" };
			var service = CreateService();

			var result = await service.UpdateSetAsync(1, dto, _userId);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Access denied");
		}

		//UTCID02: UpdateSetAsync trả về lỗi khi set không tồn tại
		[Trait("Category", "FlashcardSet")]
		[Trait("TestCase", "UTCID08")]
		[Fact]
		public async Task UpdateSetAsync_WhenSetMissing_ReturnsFailure()
		{
			_setRepoMock.Setup(r => r.IsOwnerAsync(1, _userId)).ReturnsAsync(true);
			_setRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync((FlashcardSet)null!);
			var dto = new UpdateFlashcardSetDto { Title = "Updated" };
			var service = CreateService();

			var result = await service.UpdateSetAsync(1, dto, _userId);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Flashcard set not found");
		}

		//UTCID03: UpdateSetAsync cập nhật thành công
		[Trait("Category", "FlashcardSet")]
		[Trait("TestCase", "UTCID09")]
		[Fact]
		public async Task UpdateSetAsync_WhenValid_UpdatesAndReturnsDto()
		{
			var set = CreateSet(1);
			_setRepoMock.Setup(r => r.IsOwnerAsync(1, _userId)).ReturnsAsync(true);
			_setRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(set);
			_setRepoMock.Setup(r => r.UpdateAsync(set)).ReturnsAsync(set);
			var dto = new UpdateFlashcardSetDto { Title = "Updated Title", Description = "New", Language = "vi-VN", IsPublic = true };
			var service = CreateService();

			var result = await service.UpdateSetAsync(1, dto, _userId);

			result.IsSuccess.Should().BeTrue();
			set.Title.Should().Be("Updated Title");
			_setRepoMock.Verify(r => r.UpdateAsync(It.Is<FlashcardSet>(s => s.Title == "Updated Title")), Times.Once);
			_uowMock.Verify(u => u.SaveChangesAsync(), Times.Once);
		}
#endregion
		#region 6. FlashcardService_DeleteSetAsync
		//UTCID01: DeleteSetAsync trả về lỗi khi không phải owner
		[Trait("Category", "FlashcardSet")]
		[Trait("TestCase", "UTCID10")]
		[Fact]
		public async Task DeleteSetAsync_WhenNotOwner_ReturnsFailure()
		{
			_setRepoMock.Setup(r => r.IsOwnerAsync(1, _userId)).ReturnsAsync(false);
			var service = CreateService();

			var result = await service.DeleteSetAsync(1, _userId);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Access denied");
		}

		//UTCID02: DeleteSetAsync trả về lỗi khi set không tồn tại
		[Trait("Category", "FlashcardSet")]
		[Trait("TestCase", "UTCID11")]
		[Fact]
		public async Task DeleteSetAsync_WhenSetMissing_ReturnsFailure()
		{
			_setRepoMock.Setup(r => r.IsOwnerAsync(1, _userId)).ReturnsAsync(true);
			_setRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync((FlashcardSet)null!);
			var service = CreateService();

			var result = await service.DeleteSetAsync(1, _userId);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Flashcard set not found");
		}

		//UTCID03: DeleteSetAsync xóa thành công
		[Trait("Category", "FlashcardSet")]
		[Trait("TestCase", "UTCID12")]
		[Fact]
		public async Task DeleteSetAsync_WhenValid_DeletesSetAndCards()
		{
			var set = CreateSet(1);
			_setRepoMock.Setup(r => r.IsOwnerAsync(1, _userId)).ReturnsAsync(true);
			_setRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(set);
			_cardRepoMock.Setup(r => r.DeleteBySetIdAsync(1)).Returns(Task.CompletedTask);
			_setRepoMock.Setup(r => r.DeleteAsync(set)).Returns(Task.CompletedTask);
			var service = CreateService();

			var result = await service.DeleteSetAsync(1, _userId);

			result.IsSuccess.Should().BeTrue();
			_cardRepoMock.Verify(r => r.DeleteBySetIdAsync(1), Times.Once);
			_setRepoMock.Verify(r => r.DeleteAsync(set), Times.Once);
			_uowMock.Verify(u => u.SaveChangesAsync(), Times.Once);
		}
		#endregion
		#endregion

		#region Flashcard Operations

		//UTCID13: AddCardAsync trả về lỗi khi không phải owner
		[Trait("Category", "Flashcard")]
		[Trait("TestCase", "UTCID13")]
		[Fact]
		public async Task AddCardAsync_WhenNotOwner_ReturnsFailure()
		{
			_setRepoMock.Setup(r => r.IsOwnerAsync(1, _userId)).ReturnsAsync(false);
			var dto = new CreateFlashcardDto { SetId = 1, Term = "term" };
			var service = CreateService();

			var result = await service.AddCardAsync(dto, _userId);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Access denied");
		}

		//UTCID14: AddCardAsync thêm card thành công và cập nhật tổng số thẻ
		[Trait("Category", "Flashcard")]
		[Trait("TestCase", "UTCID14")]
		[Fact]
		public async Task AddCardAsync_WhenValid_AddsCardAndUpdatesTotal()
		{
			_setRepoMock.Setup(r => r.IsOwnerAsync(1, _userId)).ReturnsAsync(true);
			_cardRepoMock.Setup(r => r.AddAsync(It.IsAny<Flashcard>()))
				.ReturnsAsync((Flashcard c) => { c.CardId = 5; return c; });
			var dto = new CreateFlashcardDto { SetId = 1, Term = "hello", Examples = new List<string> { "ex" } };
			var service = CreateService();

			var result = await service.AddCardAsync(dto, _userId);

			result.IsSuccess.Should().BeTrue();
			result.Data!.CardId.Should().Be(5);
			_setRepoMock.Verify(r => r.UpdateTotalCardsAsync(1), Times.Once);
			_uowMock.Verify(u => u.SaveChangesAsync(), Times.Exactly(2));
		}

		//UTCID15: AddCardFromTestAsync trả về lỗi khi thiếu thông tin set mới
		[Trait("Category", "Flashcard")]
		[Trait("TestCase", "UTCID15")]
		[Fact]
		public async Task AddCardFromTestAsync_WhenSetIdNullAndNewSetMissing_ReturnsFailure()
		{
			var dto = new AddFlashcardFromTestDto { Term = "term" };
			var service = CreateService();

			var result = await service.AddCardFromTestAsync(dto, _userId);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("NewSet is required when SetId is null");
		}

		//UTCID16: AddCardFromTestAsync trả về lỗi khi không sở hữu set hiện có
		[Trait("Category", "Flashcard")]
		[Trait("TestCase", "UTCID16")]
		[Fact]
		public async Task AddCardFromTestAsync_WhenExistingSetNotOwned_ReturnsFailure()
		{
			_setRepoMock.Setup(r => r.IsOwnerAsync(2, _userId)).ReturnsAsync(false);
			var dto = new AddFlashcardFromTestDto { SetId = 2, Term = "term" };
			var service = CreateService();

			var result = await service.AddCardFromTestAsync(dto, _userId);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Access denied");
		}

		//UTCID17: AddCardFromTestAsync tạo set mới và thêm card
		[Trait("Category", "Flashcard")]
		[Trait("TestCase", "UTCID17")]
		[Fact]
		public async Task AddCardFromTestAsync_WhenCreatingNewSet_AddsCard()
		{
			_setRepoMock.Setup(r => r.AddAsync(It.IsAny<FlashcardSet>()))
				.ReturnsAsync((FlashcardSet s) => { s.SetId = 7; return s; });
			_cardRepoMock.Setup(r => r.AddAsync(It.IsAny<Flashcard>()))
				.ReturnsAsync((Flashcard c) => { c.CardId = 11; return c; });
			var dto = new AddFlashcardFromTestDto
			{
				Term = "term",
				NewSet = new CreateFlashcardSetDto { Title = "new" }
			};
			var service = CreateService();

			var result = await service.AddCardFromTestAsync(dto, _userId);

			result.IsSuccess.Should().BeTrue();
			result.Data!.SetId.Should().Be(7);
			_setRepoMock.Verify(r => r.AddAsync(It.IsAny<FlashcardSet>()), Times.Once);
			_setRepoMock.Verify(r => r.UpdateTotalCardsAsync(7), Times.Once);
		}

		//UTCID18: AddCardFromTestAsync thêm card vào set hiện có
		[Trait("Category", "Flashcard")]
		[Trait("TestCase", "UTCID18")]
		[Fact]
		public async Task AddCardFromTestAsync_WhenExistingSetOwned_AddsCard()
		{
			_setRepoMock.Setup(r => r.IsOwnerAsync(3, _userId)).ReturnsAsync(true);
			_cardRepoMock.Setup(r => r.AddAsync(It.IsAny<Flashcard>()))
				.ReturnsAsync((Flashcard c) => c);
			var dto = new AddFlashcardFromTestDto { SetId = 3, Term = "term" };
			var service = CreateService();

			var result = await service.AddCardFromTestAsync(dto, _userId);

			result.IsSuccess.Should().BeTrue();
			_setRepoMock.Verify(r => r.UpdateTotalCardsAsync(3), Times.Once);
			_uowMock.Verify(u => u.SaveChangesAsync(), Times.Exactly(2));
		}

		//UTCID19: GetCardsBySetIdAsync trả về lỗi khi không tìm thấy set
		[Trait("Category", "Flashcard")]
		[Trait("TestCase", "UTCID19")]
		[Fact]
		public async Task GetCardsBySetIdAsync_WhenSetMissing_ReturnsFailure()
		{
			_setRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync((FlashcardSet)null!);
			var service = CreateService();

			var result = await service.GetCardsBySetIdAsync(1, _userId);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Flashcard set not found");
		}

		//UTCID20: GetCardsBySetIdAsync trả về lỗi khi set private và user không có quyền
		[Trait("Category", "Flashcard")]
		[Trait("TestCase", "UTCID20")]
		[Fact]
		public async Task GetCardsBySetIdAsync_WhenPrivateAndUnauthorized_ReturnsFailure()
		{
			var set = CreateSet(1, _userId, isPublic: false);
			_setRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(set);
			var service = CreateService();

			var result = await service.GetCardsBySetIdAsync(1, _otherUserId);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Access denied. This flashcard set is private.");
		}

		//UTCID21: GetCardsBySetIdAsync trả về danh sách cards khi hợp lệ
		[Trait("Category", "Flashcard")]
		[Trait("TestCase", "UTCID21")]
		[Fact]
		public async Task GetCardsBySetIdAsync_WhenAuthorized_ReturnsCards()
		{
			var set = CreateSet(1, _userId, isPublic: true);
			_setRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(set);
			var cards = new List<Flashcard> { CreateCard(1), CreateCard(2) };
			_cardRepoMock.Setup(r => r.GetBySetIdAsync(1)).ReturnsAsync(cards);
			var service = CreateService();

			var result = await service.GetCardsBySetIdAsync(1, null);

			result.IsSuccess.Should().BeTrue();
			result.Data!.Count().Should().Be(2);
		}

		//UTCID22: UpdateCardAsync trả về lỗi khi không tìm thấy card
		[Trait("Category", "Flashcard")]
		[Trait("TestCase", "UTCID22")]
		[Fact]
		public async Task UpdateCardAsync_WhenCardMissing_ReturnsFailure()
		{
			_cardRepoMock.Setup(r => r.GetByIdAsync(5)).ReturnsAsync((Flashcard)null!);
			var dto = new UpdateFlashcardDto { Term = "term" };
			var service = CreateService();

			var result = await service.UpdateCardAsync(5, dto, _userId);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Flashcard not found");
		}

		//UTCID23: UpdateCardAsync trả về lỗi khi không phải owner
		[Trait("Category", "Flashcard")]
		[Trait("TestCase", "UTCID23")]
		[Fact]
		public async Task UpdateCardAsync_WhenNotOwner_ReturnsFailure()
		{
			var card = CreateCard(5, setId: 1);
			_cardRepoMock.Setup(r => r.GetByIdAsync(5)).ReturnsAsync(card);
			_setRepoMock.Setup(r => r.IsOwnerAsync(1, _userId)).ReturnsAsync(false);
			var dto = new UpdateFlashcardDto { Term = "term" };
			var service = CreateService();

			var result = await service.UpdateCardAsync(5, dto, _userId);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Access denied");
		}

		//UTCID24: UpdateCardAsync cập nhật card thành công
		[Trait("Category", "Flashcard")]
		[Trait("TestCase", "UTCID24")]
		[Fact]
		public async Task UpdateCardAsync_WhenValid_UpdatesCard()
		{
			var card = CreateCard(5, 1);
			_cardRepoMock.Setup(r => r.GetByIdAsync(5)).ReturnsAsync(card);
			_setRepoMock.Setup(r => r.IsOwnerAsync(1, _userId)).ReturnsAsync(true);
			_cardRepoMock.Setup(r => r.UpdateAsync(card)).ReturnsAsync(card);
			var dto = new UpdateFlashcardDto { Term = "updated", Examples = new List<string> { "ex" } };
			var service = CreateService();

			var result = await service.UpdateCardAsync(5, dto, _userId);

			result.IsSuccess.Should().BeTrue();
			card.Term.Should().Be("updated");
			_cardRepoMock.Verify(r => r.UpdateAsync(card), Times.Once);
			_uowMock.Verify(u => u.SaveChangesAsync(), Times.Once);
		}

		//UTCID25: DeleteCardAsync trả về lỗi khi không tìm thấy card
		[Trait("Category", "Flashcard")]
		[Trait("TestCase", "UTCID25")]
		[Fact]
		public async Task DeleteCardAsync_WhenCardMissing_ReturnsFailure()
		{
			_cardRepoMock.Setup(r => r.GetByIdAsync(5)).ReturnsAsync((Flashcard)null!);
			var service = CreateService();

			var result = await service.DeleteCardAsync(5, _userId);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Flashcard not found");
		}

		//UTCID26: DeleteCardAsync trả về lỗi khi không phải owner
		[Trait("Category", "Flashcard")]
		[Trait("TestCase", "UTCID26")]
		[Fact]
		public async Task DeleteCardAsync_WhenNotOwner_ReturnsFailure()
		{
			var card = CreateCard(5, 1);
			_cardRepoMock.Setup(r => r.GetByIdAsync(5)).ReturnsAsync(card);
			_setRepoMock.Setup(r => r.IsOwnerAsync(1, _userId)).ReturnsAsync(false);
			var service = CreateService();

			var result = await service.DeleteCardAsync(5, _userId);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Access denied");
		}

		//UTCID27: DeleteCardAsync xóa card thành công và cập nhật tổng số thẻ
		[Trait("Category", "Flashcard")]
		[Trait("TestCase", "UTCID27")]
		[Fact]
		public async Task DeleteCardAsync_WhenValid_DeletesCard()
		{
			var card = CreateCard(5, 1);
			_cardRepoMock.Setup(r => r.GetByIdAsync(5)).ReturnsAsync(card);
			_setRepoMock.Setup(r => r.IsOwnerAsync(1, _userId)).ReturnsAsync(true);
			_cardRepoMock.Setup(r => r.DeleteAsync(card)).Returns(Task.CompletedTask);
			var service = CreateService();

			var result = await service.DeleteCardAsync(5, _userId);

			result.IsSuccess.Should().BeTrue();
			_cardRepoMock.Verify(r => r.DeleteAsync(card), Times.Once);
			_setRepoMock.Verify(r => r.UpdateTotalCardsAsync(1), Times.Once);
			_uowMock.Verify(u => u.SaveChangesAsync(), Times.Exactly(2));
		}

		//UTCID28: BulkAddCardsAsync trả về lỗi khi không sở hữu set
		[Trait("Category", "Flashcard")]
		[Trait("TestCase", "UTCID28")]
		[Fact]
		public async Task BulkAddCardsAsync_WhenNotOwner_ReturnsFailure()
		{
			_setRepoMock.Setup(r => r.IsOwnerAsync(1, _userId)).ReturnsAsync(false);
			var dto = new CreateBulkFlashcardsDto
			{
				SetId = 1,
				Flashcards = new List<BulkFlashcardItemDto> { new() { Term = "t1" } }
			};
			var service = CreateService();

			var result = await service.BulkAddCardsAsync(dto, _userId);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Access denied");
		}

		//UTCID29: BulkAddCardsAsync thêm nhiều card thành công
		[Trait("Category", "Flashcard")]
		[Trait("TestCase", "UTCID29")]
		[Fact]
		public async Task BulkAddCardsAsync_WhenValid_AddsCards()
		{
			_setRepoMock.Setup(r => r.IsOwnerAsync(1, _userId)).ReturnsAsync(true);
			_cardRepoMock.Setup(r => r.AddRangeAsync(It.IsAny<IEnumerable<Flashcard>>()))
				.Returns(Task.CompletedTask);
			var dto = new CreateBulkFlashcardsDto
			{
				SetId = 1,
				Flashcards = new List<BulkFlashcardItemDto>
				{
					new() { Term = "A", Example1 = "ex1", Example2 = "ex2" },
					new() { Term = "B" }
				}
			};
			var service = CreateService();

			var result = await service.BulkAddCardsAsync(dto, _userId);

			result.IsSuccess.Should().BeTrue();
			result.Data!.Count().Should().Be(2);
			_cardRepoMock.Verify(r => r.AddRangeAsync(It.Is<IEnumerable<Flashcard>>(f => f.Count() == 2)), Times.Once);
			_setRepoMock.Verify(r => r.UpdateTotalCardsAsync(1), Times.Once);
		}

		#endregion

		#region Study Mode Operations

		//UTCID30: GetPublicSetsAsync trả về danh sách khi user chưa đăng nhập
		[Trait("Category", "Study")]
		[Trait("TestCase", "UTCID30")]
		[Fact]
		public async Task GetPublicSetsAsync_WhenAnonymous_ReturnsSetsWithoutProgress()
		{
			var sets = new List<FlashcardSet> { CreateSet(1, _userId, isPublic: true) };
			_setRepoMock.Setup(r => r.GetPublicSetsAsync()).ReturnsAsync(sets);
			var service = CreateService();

			var result = await service.GetPublicSetsAsync(null);

			result.IsSuccess.Should().BeTrue();
			result.Data!.Single().IsStudying.Should().BeFalse();
			_progressRepoMock.Verify(p => p.GetByUserIdAsync(It.IsAny<Guid>()), Times.Never);
		}

		//UTCID31: GetPublicSetsAsync đánh dấu IsStudying khi user có progress
		[Trait("Category", "Study")]
		[Trait("TestCase", "UTCID31")]
		[Fact]
		public async Task GetPublicSetsAsync_WhenUserHasProgress_MarksStudying()
		{
			var sets = new List<FlashcardSet> { CreateSet(1, _userId, true), CreateSet(2, _userId, true) };
			_setRepoMock.Setup(r => r.GetPublicSetsAsync()).ReturnsAsync(sets);
			var progress = new List<FlashcardProgress>
			{
				new FlashcardProgress { CardId = 1, UserId = _userId, Flashcard = new Flashcard { SetId = 2, Term = "t" } }
			};
			_progressRepoMock.Setup(p => p.GetByUserIdAsync(_userId)).ReturnsAsync(progress);
			var service = CreateService();

			var result = await service.GetPublicSetsAsync(_userId);

			result.IsSuccess.Should().BeTrue();
			result.Data!.Single(s => s.SetId == 2).IsStudying.Should().BeTrue();
		}

		//UTCID32: StartStudySessionAsync trả về lỗi khi không tìm thấy set
		[Trait("Category", "Study")]
		[Trait("TestCase", "UTCID32")]
		[Fact]
		public async Task StartStudySessionAsync_WhenSetMissing_ReturnsFailure()
		{
			_setRepoMock.Setup(r => r.GetByIdWithCardsAndProgressAsync(1, _userId)).ReturnsAsync((FlashcardSet)null!);
			var service = CreateService();

			var result = await service.StartStudySessionAsync(1, _userId);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Flashcard set not found");
		}

		//UTCID33: StartStudySessionAsync trả về lỗi khi không có quyền truy cập
		[Trait("Category", "Study")]
		[Trait("TestCase", "UTCID33")]
		[Fact]
		public async Task StartStudySessionAsync_WhenAccessDenied_ReturnsFailure()
		{
			var set = CreateSet(1, _otherUserId, isPublic: false);
			_setRepoMock.Setup(r => r.GetByIdWithCardsAndProgressAsync(1, _userId)).ReturnsAsync(set);
			var service = CreateService();

			var result = await service.StartStudySessionAsync(1, _userId);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Access denied. This flashcard set is private.");
		}

		//UTCID34: StartStudySessionAsync trả về danh sách cards với progress
		[Trait("Category", "Study")]
		[Trait("TestCase", "UTCID34")]
		[Fact]
		public async Task StartStudySessionAsync_WhenValid_ReturnsStudySession()
		{
			var flashcard = CreateCard(1, setId: 1, term: "hello", examplesJson: JsonSerializer.Serialize(new List<string> { "ex" }));
			flashcard.Progresses.Add(new FlashcardProgress
			{
				Status = "learning",
				ReviewCount = 2,
				CorrectCount = 1,
				IncorrectCount = 1,
				LastReviewedAt = DateTime.UtcNow.AddDays(-1),
				NextReviewAt = DateTime.UtcNow.AddDays(1)
			});
			var set = CreateSet(1, _userId, isPublic: true);
			set.Flashcards = new List<Flashcard> { flashcard };
			_setRepoMock.Setup(r => r.GetByIdWithCardsAndProgressAsync(1, _userId)).ReturnsAsync(set);
			var service = CreateService();

			var result = await service.StartStudySessionAsync(1, _userId);

			result.IsSuccess.Should().BeTrue();
			result.Data!.Cards.Should().HaveCount(1);
			result.Data.Cards[0].Status.Should().Be("learning");
			result.Data.Cards[0].Examples.Should().Contain("ex");
		}

		//UTCID35: MarkCardKnowledgeAsync trả về lỗi khi không tìm thấy card
		[Trait("Category", "Study")]
		[Trait("TestCase", "UTCID35")]
		[Fact]
		public async Task MarkCardKnowledgeAsync_WhenCardMissing_ReturnsFailure()
		{
			_cardRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync((Flashcard)null!);
			var dto = new MarkCardKnowledgeDto { CardId = 1, IsKnown = true };
			var service = CreateService();

			var result = await service.MarkCardKnowledgeAsync(dto, _userId);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Flashcard not found");
		}

		//UTCID36: MarkCardKnowledgeAsync trả về lỗi khi set không tồn tại
		[Trait("Category", "Study")]
		[Trait("TestCase", "UTCID36")]
		[Fact]
		public async Task MarkCardKnowledgeAsync_WhenSetMissing_ReturnsFailure()
		{
			var card = CreateCard(1, 1);
			_cardRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(card);
			_setRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync((FlashcardSet)null!);
			var dto = new MarkCardKnowledgeDto { CardId = 1, IsKnown = true };
			var service = CreateService();

			var result = await service.MarkCardKnowledgeAsync(dto, _userId);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Flashcard set not found");
		}

		//UTCID37: MarkCardKnowledgeAsync trả về lỗi khi không có quyền
		[Trait("Category", "Study")]
		[Trait("TestCase", "UTCID37")]
		[Fact]
		public async Task MarkCardKnowledgeAsync_WhenAccessDenied_ReturnsFailure()
		{
			var card = CreateCard(1, 1);
			var set = CreateSet(1, _otherUserId, isPublic: false);
			_cardRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(card);
			_setRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(set);
			var dto = new MarkCardKnowledgeDto { CardId = 1, IsKnown = true };
			var service = CreateService();

			var result = await service.MarkCardKnowledgeAsync(dto, _userId);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Access denied");
		}

		//UTCID38: MarkCardKnowledgeAsync tạo mới progress khi chưa có
		[Trait("Category", "Study")]
		[Trait("TestCase", "UTCID38")]
		[Fact]
		public async Task MarkCardKnowledgeAsync_WhenNoProgress_AddsNew()
		{
			var card = CreateCard(1, 1);
			var set = CreateSet(1, _userId, isPublic: true);
			_cardRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(card);
			_setRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(set);
			_progressRepoMock.Setup(p => p.GetByCardAndUserAsync(1, _userId)).ReturnsAsync((FlashcardProgress)null!);
			var dto = new MarkCardKnowledgeDto { CardId = 1, IsKnown = true };
			var service = CreateService();

			var result = await service.MarkCardKnowledgeAsync(dto, _userId);

			result.IsSuccess.Should().BeTrue();
			_progressRepoMock.Verify(p => p.AddAsync(It.Is<FlashcardProgress>(pr => pr.CorrectCount == 1)), Times.Once);
			_uowMock.Verify(u => u.SaveChangesAsync(), Times.Once);
		}

		//UTCID39: MarkCardKnowledgeAsync cập nhật progress khi đã tồn tại
		[Trait("Category", "Study")]
		[Trait("TestCase", "UTCID39")]
		[Fact]
		public async Task MarkCardKnowledgeAsync_WhenProgressExists_UpdatesCounts()
		{
			var card = CreateCard(1, 1);
			var set = CreateSet(1, _userId, isPublic: true);
			var progress = CreateProgress(1, _userId, status: "learning", review: 2, correct: 1, incorrect: 1);
			_cardRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(card);
			_setRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(set);
			_progressRepoMock.Setup(p => p.GetByCardAndUserAsync(1, _userId)).ReturnsAsync(progress);
			_progressRepoMock.Setup(p => p.UpdateAsync(progress)).ReturnsAsync(progress);
			var dto = new MarkCardKnowledgeDto { CardId = 1, IsKnown = false };
			var service = CreateService();

			var result = await service.MarkCardKnowledgeAsync(dto, _userId);

			result.IsSuccess.Should().BeTrue();
			progress.IncorrectCount.Should().Be(2);
			_progressRepoMock.Verify(p => p.UpdateAsync(progress), Times.Once);
			_uowMock.Verify(u => u.SaveChangesAsync(), Times.Once);
		}

		//UTCID40: GetStudyStatsAsync trả về lỗi khi không tìm thấy set
		[Trait("Category", "Study")]
		[Trait("TestCase", "UTCID40")]
		[Fact]
		public async Task GetStudyStatsAsync_WhenSetMissing_ReturnsFailure()
		{
			_setRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync((FlashcardSet)null!);
			var service = CreateService();

			var result = await service.GetStudyStatsAsync(1, _userId);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Flashcard set not found");
		}

		//UTCID41: GetStudyStatsAsync trả về lỗi khi không có quyền
		[Trait("Category", "Study")]
		[Trait("TestCase", "UTCID41")]
		[Fact]
		public async Task GetStudyStatsAsync_WhenAccessDenied_ReturnsFailure()
		{
			var set = CreateSet(1, _otherUserId, isPublic: false);
			_setRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(set);
			var service = CreateService();

			var result = await service.GetStudyStatsAsync(1, _userId);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Access denied");
		}

		//UTCID42: GetStudyStatsAsync tính toán thống kê chính xác
		[Trait("Category", "Study")]
		[Trait("TestCase", "UTCID42")]
		[Fact]
		public async Task GetStudyStatsAsync_WhenValid_ReturnsAggregatedStats()
		{
			var set = CreateSet(1, _userId, isPublic: true);
			var progresses = new List<FlashcardProgress>
			{
				new FlashcardProgress { CardId = 1, UserId = _userId, CorrectCount = 2, IncorrectCount = 1, Status = "learning" },
				new FlashcardProgress { CardId = 2, UserId = _userId, CorrectCount = 0, IncorrectCount = 3, Status = "new" }
			};
			_setRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(set);
			_progressRepoMock.Setup(p => p.GetBySetAndUserAsync(1, _userId)).ReturnsAsync(progresses);
			var service = CreateService();

			var result = await service.GetStudyStatsAsync(1, _userId);

			result.IsSuccess.Should().BeTrue();
			result.Data!.TotalCardsStudied.Should().Be(2);
			result.Data.CardsKnown.Should().Be(2);
			result.Data.CardsUnknown.Should().Be(4);
			result.Data.NewCardsLearned.Should().Be(1);
		}

		//UTCID43: ResetStudyProgressAsync trả về lỗi khi không tìm thấy set
		[Trait("Category", "Study")]
		[Trait("TestCase", "UTCID43")]
		[Fact]
		public async Task ResetStudyProgressAsync_WhenSetMissing_ReturnsFailure()
		{
			_setRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync((FlashcardSet)null!);
			var service = CreateService();

			var result = await service.ResetStudyProgressAsync(1, _userId);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Flashcard set not found");
		}

		//UTCID44: ResetStudyProgressAsync trả về lỗi khi không có quyền
		[Trait("Category", "Study")]
		[Trait("TestCase", "UTCID44")]
		[Fact]
		public async Task ResetStudyProgressAsync_WhenAccessDenied_ReturnsFailure()
		{
			var set = CreateSet(1, _otherUserId, isPublic: false);
			_setRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(set);
			var service = CreateService();

			var result = await service.ResetStudyProgressAsync(1, _userId);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Access denied");
		}

		//UTCID45: ResetStudyProgressAsync xóa progress thành công
		[Trait("Category", "Study")]
		[Trait("TestCase", "UTCID45")]
		[Fact]
		public async Task ResetStudyProgressAsync_WhenValid_DeletesProgress()
		{
			var set = CreateSet(1, _userId, isPublic: true);
			_setRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(set);
			_progressRepoMock.Setup(p => p.DeleteBySetAndUserAsync(1, _userId)).Returns(Task.CompletedTask);
			var service = CreateService();

			var result = await service.ResetStudyProgressAsync(1, _userId);

			result.IsSuccess.Should().BeTrue();
			_progressRepoMock.Verify(p => p.DeleteBySetAndUserAsync(1, _userId), Times.Once);
		}

		#endregion
	}
}

