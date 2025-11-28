using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore.Storage;
using Moq;
using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.DTOs.Requests.Question;
using ToeicGenius.Domains.DTOs.Responses.Question;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Domains.Enums;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Services.Implementations;
using ToeicGenius.Services.Interfaces;
using ToeicGenius.Shared.Constants;
using Xunit;

namespace ToeicGenius.Tests.UnitTests
{
	public class QuestionServiceTests
	{
		private readonly Mock<IFileService> _fileService = new();
		private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();
		private QuestionService CreateService()
		{
			return new QuestionService(
				_unitOfWorkMock.Object,
				_fileService.Object
			);
		}

		#region 1. QuestionService_GetByIdAsync Tests

		// UTCID01: Question tồn tại -> trả về QuestionResponseDto
		[Trait("Category", "GetByIdAsync")]
		[Trait("TestCase", "UTCID01")]
		[Fact]
		public async Task GetByIdAsync_QuestionExists_ReturnsQuestionResponseDto()
		{
			// Arrange
			var questionId = 1;
			var expectedResponse = new QuestionResponseDto
			{
				QuestionId = questionId,
				Content = "Test Question Content",
				PartId = 1,
				QuestionTypeId = 1
			};

			_unitOfWorkMock.Setup(u => u.Questions.GetQuestionResponseByIdAsync(questionId))
				.ReturnsAsync(expectedResponse);

			var service = CreateService();

			// Act
			var result = await service.GetByIdAsync(questionId);

			// Assert
			result.Should().NotBeNull();
			result.QuestionId.Should().Be(questionId);
			result.Content.Should().Be("Test Question Content");
			result.PartId.Should().Be(1);
			result.QuestionTypeId.Should().Be(1);

			_unitOfWorkMock.Verify(u => u.Questions.GetQuestionResponseByIdAsync(questionId), Times.Once);
		}

		// UTCID02: Question không tồn tại -> trả về null
		[Trait("Category", "GetByIdAsync")]
		[Trait("TestCase", "UTCID02")]
		[Fact]
		public async Task GetByIdAsync_QuestionNotFound_ReturnsNull()
		{
			// Arrange
			var questionId = 999;
			_unitOfWorkMock.Setup(u => u.Questions.GetQuestionResponseByIdAsync(questionId))
				.ReturnsAsync((QuestionResponseDto)null!);

			var service = CreateService();

			// Act
			var result = await service.GetByIdAsync(questionId);

			// Assert
			result.Should().BeNull();

			_unitOfWorkMock.Verify(u => u.Questions.GetQuestionResponseByIdAsync(questionId), Times.Once);
		}

		// UTCID03: Id = 0 -> trả về null
		[Trait("Category", "GetByIdAsync")]
		[Trait("TestCase", "UTCID03")]
		[Fact]
		public async Task GetByIdAsync_IdEqualZero_ReturnsNull()
		{
			// Arrange
			var questionId = 0;
			_unitOfWorkMock.Setup(u => u.Questions.GetQuestionResponseByIdAsync(questionId))
				.ReturnsAsync((QuestionResponseDto)null!);

			var service = CreateService();

			// Act
			var result = await service.GetByIdAsync(questionId);

			// Assert
			result.Should().BeNull();

			_unitOfWorkMock.Verify(u => u.Questions.GetQuestionResponseByIdAsync(questionId), Times.Once);
		}

		// UTCID04: Id = -1 -> trả về null
		[Trait("Category", "GetByIdAsync")]
		[Trait("TestCase", "UTCID04")]
		[Fact]
		public async Task GetByIdAsync_IdNegative_ReturnsNull()
		{
			// Arrange
			var questionId = -1;
			_unitOfWorkMock.Setup(u => u.Questions.GetQuestionResponseByIdAsync(questionId))
				.ReturnsAsync((QuestionResponseDto)null!);

			var service = CreateService();

			// Act
			var result = await service.GetByIdAsync(questionId);

			// Assert
			result.Should().BeNull();

			_unitOfWorkMock.Verify(u => u.Questions.GetQuestionResponseByIdAsync(questionId), Times.Once);
		}

		// UTCID05: Exception
		[Trait("Category", "GetByIdAsync")]
		[Trait("TestCase", "UTCID05")]
		[Fact]
		public async Task GetByIdAsync_WhenRepositoryThrows_ExceptionIsThrown()
		{
			// Arrange
			var questionId = -1;

			_unitOfWorkMock.Setup(u => u.Questions.GetQuestionResponseByIdAsync(questionId))
				.ThrowsAsync(new Exception("DB error"));

			var service = CreateService();

			// Act
			var act = () => service.GetByIdAsync(questionId);

			// Assert
			await act.Should().ThrowAsync<Exception>();

			_unitOfWorkMock.Verify(u => u.Questions.GetQuestionResponseByIdAsync(questionId), Times.Once);
		}
		#endregion

		#region 2. QuestionService_CreateAsync Tests

		// Helper method to create mock IFormFile
		private Mock<IFormFile> CreateMockFormFile(string fileName, string contentType, long length = 1024)
		{
			var fileMock = new Mock<IFormFile>();
			fileMock.Setup(f => f.FileName).Returns(fileName);
			fileMock.Setup(f => f.ContentType).Returns(contentType);
			fileMock.Setup(f => f.Length).Returns(length);
			return fileMock;
		}

		// Helper method to create CreateQuestionDto
		private CreateQuestionDto CreateQuestionDto(
			int partId = 1,
			int questionTypeId = 1,
			string content = "Test Question",
			IFormFile? audio = null,
			IFormFile? image = null,
			List<AnswerOptionDto>? options = null)
		{
			return new CreateQuestionDto
			{
				PartId = partId,
				QuestionTypeId = questionTypeId,
				Content = content,
				Audio = audio,
				Image = image,
				AnswerOptions = options,
				Solution = "Test solution"
			};
		}

		// Helper method to create Part
		private Part CreatePart(int partId, QuestionSkill skill, int partNumber = 1)
		{
			return new Part
			{
				PartId = partId,
				Skill = skill,
				PartNumber = partNumber,
				Name = $"Part {partNumber}"
			};
		}

		// Helper method to create answer options
		private List<AnswerOptionDto> CreateAnswerOptions(int count = 4, int correctIndex = 0)
		{
			var options = new List<AnswerOptionDto>();
			for (int i = 0; i < count; i++)
			{
				options.Add(new AnswerOptionDto
				{
					Label = ((char)('A' + i)).ToString(),
					Content = $"Option {i + 1}",
					IsCorrect = i == correctIndex
				});
			}
			return options;
		}

		//UTCID01: Thiếu file âm thanh cho phần Listening -> trả về ErrorMessage
		[Trait("Category", "CreateAsync")]
		[Trait("TestCase", "UTCID01")]
		[Fact]
		public async Task CreateAsync_ListeningPartWithoutAudio_ReturnsError()
		{
			// Arrange
			var part = CreatePart(1, QuestionSkill.Listening);
			var dto = CreateQuestionDto(partId: 1);

			_unitOfWorkMock.Setup(u => u.Parts.GetByIdAsync(1)).ReturnsAsync(part);

			var service = CreateService();

			// Act
			var result = await service.CreateAsync(dto, Guid.NewGuid());

			// Assert
			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Phần Listening part yêu cầu phải có file âm thanh.");

			_unitOfWorkMock.Verify(u => u.BeginTransactionAsync(), Times.Never);
		}

		//UTCID02: File âm thanh không hợp lệ định dạng .mp3, .wav, .ogg và .m4a
		[Trait("Category", "CreateAsync")]
		[Trait("TestCase", "UTCID02")]
		[Fact]
		public async Task CreateAsync_InvalidAudioFormat_ReturnsError()
		{
			// Arrange
			var part = CreatePart(1, QuestionSkill.Listening);
			var audioFile = CreateMockFormFile("test.txt", "text/plain").Object;
			var dto = CreateQuestionDto(partId: 1, audio: audioFile);
			var mockTransaction = new Mock<IDbContextTransaction>();
			_unitOfWorkMock.Setup(u => u.Parts.GetByIdAsync(1)).ReturnsAsync(part);

			_unitOfWorkMock
				.Setup(u => u.BeginTransactionAsync())
				.ReturnsAsync(mockTransaction.Object);

			var service = CreateService();

			// Act
			var result = await service.CreateAsync(dto, Guid.NewGuid());

			// Assert
			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().NotBeNullOrEmpty();

			_fileService.Verify(f => f.UploadFileAsync(It.IsAny<IFormFile>(), It.IsAny<string>()), Times.Never);
		}

		//UTCID03: File âm thanh vượt quá 70mb
		[Trait("Category", "CreateAsync")]
		[Trait("TestCase", "UTCID03")]
		[Fact]
		public async Task CreateAsync_AudioFileTooLarge_ReturnsError()
		{
			// Arrange
			var part = CreatePart(1, QuestionSkill.Listening);
			var audioFile = CreateMockFormFile("test.mp3", "audio/mpeg", 71 * 1024 * 1024).Object; // 71MB
			var dto = CreateQuestionDto(partId: 1, audio: audioFile);
			var mockTransaction = new Mock<IDbContextTransaction>();

			_unitOfWorkMock.Setup(u => u.Parts.GetByIdAsync(1)).ReturnsAsync(part);
			_unitOfWorkMock.Setup(u => u.BeginTransactionAsync()).ReturnsAsync(mockTransaction.Object);
			var service = CreateService();

			// Act
			var result = await service.CreateAsync(dto, Guid.NewGuid());

			// Assert
			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().NotBeNullOrEmpty();

			_fileService.Verify(f => f.UploadFileAsync(It.IsAny<IFormFile>(), It.IsAny<string>()), Times.Never);
		}

		//UTCID04: File ảnh không hơp lệ định dạng .jpg, .jpeg, .png, .bmp, .gif, .webp
		[Trait("Category", "CreateAsync")]
		[Trait("TestCase", "UTCID04")]
		[Fact]
		public async Task CreateAsync_InvalidImageFormat_ReturnsError()
		{
			// Arrange
			var part = CreatePart(1, QuestionSkill.Reading);
			var imageFile = CreateMockFormFile("test.txt", "text/plain").Object;
			var dto = CreateQuestionDto(partId: 1, image: imageFile);
			var mockTransaction = new Mock<IDbContextTransaction>();

			_unitOfWorkMock.Setup(u => u.Parts.GetByIdAsync(1)).ReturnsAsync(part);
			_unitOfWorkMock.Setup(u => u.BeginTransactionAsync()).ReturnsAsync(mockTransaction.Object);

			var service = CreateService();

			// Act
			var result = await service.CreateAsync(dto, Guid.NewGuid());

			// Assert
			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().NotBeNullOrEmpty();

			_fileService.Verify(f => f.UploadFileAsync(It.IsAny<IFormFile>(), It.IsAny<string>()), Times.Never);
		}

		//UTCID05: File ảnh vượt quá 5mb
		[Trait("Category", "CreateAsync")]
		[Trait("TestCase", "UTCID05")]
		[Fact]
		public async Task CreateAsync_ImageFileTooLarge_ReturnsError()
		{
			// Arrange
			var part = CreatePart(1, QuestionSkill.Reading);
			var imageFile = CreateMockFormFile("test.jpg", "image/jpeg", 6 * 1024 * 1024).Object; // 6MB
			var dto = CreateQuestionDto(partId: 1, image: imageFile);
			var mockTransaction = new Mock<IDbContextTransaction>();

			_unitOfWorkMock.Setup(u => u.Parts.GetByIdAsync(1)).ReturnsAsync(part);
			_unitOfWorkMock.Setup(u => u.BeginTransactionAsync()).ReturnsAsync(mockTransaction.Object);

			var service = CreateService();

			// Act
			var result = await service.CreateAsync(dto, Guid.NewGuid());

			// Assert
			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().NotBeNullOrEmpty();

			_fileService.Verify(f => f.UploadFileAsync(It.IsAny<IFormFile>(), It.IsAny<string>()), Times.Never);
		}

		//UTCID06: Tạo thành công câu hỏi mới part 1 (có 3 đáp án và 1 đáp án đúng)
		[Trait("Category", "CreateAsync")]
		[Trait("TestCase", "UTCID06")]
		[Fact]
		public async Task CreateAsync_Part1With3OptionsAnd1Correct_Success()
		{
			// Arrange
			var part = CreatePart(1, QuestionSkill.Listening, 2); // Part 2 requires 3 options
			var audioFile = CreateMockFormFile("test.mp3", "audio/mpeg").Object;
			var options = CreateAnswerOptions(3, 0); // 3 options, first is correct
			var dto = CreateQuestionDto(partId: 1, audio: audioFile, options: options);
			var mockTransaction = new Mock<IDbContextTransaction>();

			_unitOfWorkMock.Setup(u => u.Parts.GetByIdAsync(1)).ReturnsAsync(part);
			_unitOfWorkMock.Setup(u => u.BeginTransactionAsync()).ReturnsAsync(mockTransaction.Object);
			_fileService.Setup(f => f.UploadFileAsync(audioFile, "audio"))
				.ReturnsAsync(Result<string>.Success("https://example.com/audio.mp3"));
			_unitOfWorkMock.Setup(u => u.Questions.AddAsync(It.IsAny<Question>())).ReturnsAsync((Question q) => q);
			_unitOfWorkMock.Setup(u => u.Options.AddRangeAsync(It.IsAny<List<Option>>())).Returns(Task.CompletedTask);
			_unitOfWorkMock.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);
			_unitOfWorkMock.Setup(u => u.CommitTransactionAsync()).Returns(Task.CompletedTask);

			var service = CreateService();

			// Act
			var result = await service.CreateAsync(dto, Guid.NewGuid());

			// Assert
			result.IsSuccess.Should().BeTrue();
			result.Data.Should().Be(SuccessMessages.OperationSuccess);

			_unitOfWorkMock.Verify(u => u.Options.AddRangeAsync(It.Is<List<Option>>(o => o.Count == 3)), Times.Once);
			_unitOfWorkMock.Verify(u => u.CommitTransactionAsync(), Times.Once);
		}

		//UTCID07: Có 2 đáp án đúng -> trả về ErrorMessage
		[Trait("Category", "CreateAsync")]
		[Trait("TestCase", "UTCID07")]
		[Fact]
		public async Task CreateAsync_TwoCorrectAnswers_ReturnsError()
		{
			// Arrange
			var part = CreatePart(1, QuestionSkill.Reading, 5);
			var options = new List<AnswerOptionDto>
			{
				new AnswerOptionDto { Label = "A", Content = "Option 1", IsCorrect = true },
				new AnswerOptionDto { Label = "B", Content = "Option 2", IsCorrect = true }, // 2nd correct
				new AnswerOptionDto { Label = "C", Content = "Option 3", IsCorrect = false },
				new AnswerOptionDto { Label = "D", Content = "Option 4", IsCorrect = false }
			};
			var dto = CreateQuestionDto(partId: 1, options: options);

			var mockTransaction = new Mock<IDbContextTransaction>();

			_unitOfWorkMock.Setup(u => u.Parts.GetByIdAsync(1)).ReturnsAsync(part);
			_unitOfWorkMock.Setup(u => u.BeginTransactionAsync()).ReturnsAsync(mockTransaction.Object);
			_unitOfWorkMock.Setup(u => u.Questions.AddAsync(It.IsAny<Question>())).ReturnsAsync((Question q) => q);
			_fileService.Setup(f => f.RollbackAndCleanupAsync(It.IsAny<List<string>>())).Returns(Task.CompletedTask);

			var service = CreateService();

			// Act
			var result = await service.CreateAsync(dto, Guid.NewGuid());

			// Assert
			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Contain("Cần có duy nhất một đáp án đúng");

			_fileService.Verify(f => f.RollbackAndCleanupAsync(It.IsAny<List<string>>()), Times.Once);
		}

		//UTCID08: Không có đáp án đúng -> trả về ErrorMessage
		[Trait("Category", "CreateAsync")]
		[Trait("TestCase", "UTCID08")]
		[Fact]
		public async Task CreateAsync_NoCorrectAnswer_ReturnsError()
		{
			// Arrange
			var part = CreatePart(1, QuestionSkill.Reading, 5);
			var options = new List<AnswerOptionDto>
			{
				new AnswerOptionDto { Label = "A", Content = "Option 1", IsCorrect = false },
				new AnswerOptionDto { Label = "B", Content = "Option 2", IsCorrect = false },
				new AnswerOptionDto { Label = "C", Content = "Option 3", IsCorrect = false },
				new AnswerOptionDto { Label = "D", Content = "Option 4", IsCorrect = false }
			};
			var dto = CreateQuestionDto(partId: 1, options: options);

			var mockTransaction = new Mock<IDbContextTransaction>();

			_unitOfWorkMock.Setup(u => u.Parts.GetByIdAsync(1)).ReturnsAsync(part);
			_unitOfWorkMock.Setup(u => u.BeginTransactionAsync()).ReturnsAsync(mockTransaction.Object);
			_unitOfWorkMock.Setup(u => u.Questions.AddAsync(It.IsAny<Question>())).ReturnsAsync((Question q) => q);
			_fileService.Setup(f => f.RollbackAndCleanupAsync(It.IsAny<List<string>>())).Returns(Task.CompletedTask);

			var service = CreateService();

			// Act
			var result = await service.CreateAsync(dto, Guid.NewGuid());

			// Assert
			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Contain("Cần có duy nhất một đáp án đúng");

			_fileService.Verify(f => f.RollbackAndCleanupAsync(It.IsAny<List<string>>()), Times.Once);
		}

		//UTCID09: Số lượng đáp án phần part có Id = 1 bằng 2 -> trả về ErrorMessage
		[Trait("Category", "CreateAsync")]
		[Trait("TestCase", "UTCID09")]
		[Fact]
		public async Task CreateAsync_Part1WithOnly2Options_ReturnsError()
		{
			// Arrange
			var part = CreatePart(1, QuestionSkill.Listening, 2); // Part 2 requires 3 options
			var audioFile = CreateMockFormFile("test.mp3", "audio/mpeg").Object;
			var options = CreateAnswerOptions(2, 0); // Only 2 options
			var dto = CreateQuestionDto(partId: 1, audio: audioFile, options: options);

			var mockTransaction = new Mock<IDbContextTransaction>();

			_unitOfWorkMock.Setup(u => u.Parts.GetByIdAsync(1)).ReturnsAsync(part);
			_unitOfWorkMock.Setup(u => u.BeginTransactionAsync()).ReturnsAsync(mockTransaction.Object);
			_fileService.Setup(f => f.UploadFileAsync(audioFile, "audio"))
				.ReturnsAsync(Result<string>.Success("https://example.com/audio.mp3"));
			_unitOfWorkMock.Setup(u => u.Questions.AddAsync(It.IsAny<Question>())).ReturnsAsync((Question q) => q);
			_fileService.Setup(f => f.RollbackAndCleanupAsync(It.IsAny<List<string>>())).Returns(Task.CompletedTask);

			var service = CreateService();

			// Act
			var result = await service.CreateAsync(dto, Guid.NewGuid());

			// Assert
			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Contain("Số lượng đáp án phải đúng bằng 3");

			_fileService.Verify(f => f.RollbackAndCleanupAsync(It.IsAny<List<string>>()), Times.Once);
		}

		//UTCID10: Có 2 đáp án bị trùng label -> trả về ErrorMessage
		[Trait("Category", "CreateAsync")]
		[Trait("TestCase", "UTCID10")]
		[Fact]
		public async Task CreateAsync_DuplicateLabels_ReturnsError()
		{
			// Arrange
			var part = CreatePart(1, QuestionSkill.Reading, 5);
			var options = new List<AnswerOptionDto>
			{
				new AnswerOptionDto { Label = "A", Content = "Option 1", IsCorrect = true },
				new AnswerOptionDto { Label = "A", Content = "Option 2", IsCorrect = false }, // Duplicate label
				new AnswerOptionDto { Label = "C", Content = "Option 3", IsCorrect = false },
				new AnswerOptionDto { Label = "D", Content = "Option 4", IsCorrect = false }
			};
			var dto = CreateQuestionDto(partId: 1, options: options);

			var mockTransaction = new Mock<IDbContextTransaction>();

			_unitOfWorkMock.Setup(u => u.Parts.GetByIdAsync(1)).ReturnsAsync(part);
			_unitOfWorkMock.Setup(u => u.BeginTransactionAsync()).ReturnsAsync(mockTransaction.Object);
			_unitOfWorkMock.Setup(u => u.Questions.AddAsync(It.IsAny<Question>())).ReturnsAsync((Question q) => q);
			_fileService.Setup(f => f.RollbackAndCleanupAsync(It.IsAny<List<string>>())).Returns(Task.CompletedTask);

			var service = CreateService();

			// Act
			var result = await service.CreateAsync(dto, Guid.NewGuid());

			// Assert
			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Contain("Các nhãn (label) của đáp án phải là duy nhất");

			_fileService.Verify(f => f.RollbackAndCleanupAsync(It.IsAny<List<string>>()), Times.Once);
		}

		//UTCID11: Tạo thành công câu hỏi part 5 với 4 đáp án và có 1 đáp án đúng
		[Trait("Category", "CreateAsync")]
		[Trait("TestCase", "UTCID11")]
		[Fact]
		public async Task CreateAsync_Part5With4OptionsAnd1Correct_Success()
		{
			// Arrange
			var part = CreatePart(5, QuestionSkill.Reading, 5);
			var options = CreateAnswerOptions(4, 1); // 4 options, second is correct
			var dto = CreateQuestionDto(partId: 5, options: options);

			var mockTransaction = new Mock<IDbContextTransaction>();

			_unitOfWorkMock.Setup(u => u.Parts.GetByIdAsync(5)).ReturnsAsync(part);
			_unitOfWorkMock.Setup(u => u.BeginTransactionAsync()).ReturnsAsync(mockTransaction.Object);
			_unitOfWorkMock.Setup(u => u.Questions.AddAsync(It.IsAny<Question>())).ReturnsAsync((Question q) => q);
			_unitOfWorkMock.Setup(u => u.Options.AddRangeAsync(It.IsAny<List<Option>>())).Returns(Task.CompletedTask);
			_unitOfWorkMock.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);
			_unitOfWorkMock.Setup(u => u.CommitTransactionAsync()).Returns(Task.CompletedTask);

			var service = CreateService();

			// Act
			var result = await service.CreateAsync(dto, Guid.NewGuid());

			// Assert
			result.IsSuccess.Should().BeTrue();
			result.Data.Should().Be(SuccessMessages.OperationSuccess);

			_unitOfWorkMock.Verify(u => u.Options.AddRangeAsync(It.Is<List<Option>>(o => o.Count == 4)), Times.Once);
			_unitOfWorkMock.Verify(u => u.CommitTransactionAsync(), Times.Once);
		}

		//UTCID12: PartId = 5 yêu cầu 4 đáp án, nhưng chỉ cung cấp 3 đáp án -> trả về ErrorMessage
		[Trait("Category", "CreateAsync")]
		[Trait("TestCase", "UTCID12")]
		[Fact]
		public async Task CreateAsync_Part5WithOnly3Options_ReturnsError()
		{
			// Arrange
			var part = CreatePart(5, QuestionSkill.Reading, 5);
			var options = CreateAnswerOptions(3, 0); // Only 3 options, need 4
			var dto = CreateQuestionDto(partId: 5, options: options);

			var mockTransaction = new Mock<IDbContextTransaction>();

			_unitOfWorkMock.Setup(u => u.Parts.GetByIdAsync(5)).ReturnsAsync(part);
			_unitOfWorkMock.Setup(u => u.BeginTransactionAsync()).ReturnsAsync(mockTransaction.Object);
			_unitOfWorkMock.Setup(u => u.Questions.AddAsync(It.IsAny<Question>())).ReturnsAsync((Question q) => q);
			_fileService.Setup(f => f.RollbackAndCleanupAsync(It.IsAny<List<string>>())).Returns(Task.CompletedTask);

			var service = CreateService();

			// Act
			var result = await service.CreateAsync(dto, Guid.NewGuid());

			// Assert
			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Contain("Số lượng đáp án phải đúng bằng 4");

			_fileService.Verify(f => f.RollbackAndCleanupAsync(It.IsAny<List<string>>()), Times.Once);
		}

		//UTCID13: PartId = 8 không yêu cầu đáp án, tạo thành công câu hỏi	
		[Trait("Category", "CreateAsync")]
		[Trait("TestCase", "UTCID13")]
		[Fact]
		public async Task CreateAsync_Part8WithoutOptions_Success()
		{
			// Arrange
			var part = CreatePart(8, QuestionSkill.Writing, 8);
			var dto = CreateQuestionDto(partId: 8, options: null); // No options

			var mockTransaction = new Mock<IDbContextTransaction>();

			_unitOfWorkMock.Setup(u => u.Parts.GetByIdAsync(8)).ReturnsAsync(part);
			_unitOfWorkMock.Setup(u => u.BeginTransactionAsync()).ReturnsAsync(mockTransaction.Object);
			_unitOfWorkMock.Setup(u => u.Questions.AddAsync(It.IsAny<Question>())).ReturnsAsync((Question q) => q);
			_unitOfWorkMock.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);
			_unitOfWorkMock.Setup(u => u.CommitTransactionAsync()).Returns(Task.CompletedTask);

			var service = CreateService();

			// Act
			var result = await service.CreateAsync(dto, Guid.NewGuid());

			// Assert
			result.IsSuccess.Should().BeTrue();
			result.Data.Should().Be(SuccessMessages.OperationSuccess);

			_unitOfWorkMock.Verify(u => u.Options.AddRangeAsync(It.IsAny<List<Option>>()), Times.Never);
			_unitOfWorkMock.Verify(u => u.CommitTransactionAsync(), Times.Once);
		}

		//UTCID14: Exception trong quá trình tạo câu hỏi -> trả về ErrorMessage
		[Trait("Category", "CreateAsync")]
		[Trait("TestCase", "UTCID14")]
		[Fact]
		public async Task CreateAsync_ExceptionDuringProcess_ReturnsError()
		{
			// Arrange
			var part = CreatePart(8, QuestionSkill.Reading, 5);
			var dto = CreateQuestionDto(partId: 8, options: null);
			var exceptionMessage = "Database connection failed";

			var mockTransaction = new Mock<IDbContextTransaction>();

			_unitOfWorkMock.Setup(u => u.Parts.GetByIdAsync(8)).ReturnsAsync(part);
			_unitOfWorkMock.Setup(u => u.BeginTransactionAsync()).ReturnsAsync(mockTransaction.Object);
			_unitOfWorkMock.Setup(u => u.Questions.AddAsync(It.IsAny<Question>())).ReturnsAsync((Question q) => q);
			_unitOfWorkMock.Setup(u => u.SaveChangesAsync()).ThrowsAsync(new Exception(exceptionMessage));
			_fileService.Setup(f => f.RollbackAndCleanupAsync(It.IsAny<List<string>>())).Returns(Task.CompletedTask);

			var service = CreateService();

			// Act
			var result = await service.CreateAsync(dto, Guid.NewGuid());

			// Assert
			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Contain(exceptionMessage);

			_fileService.Verify(f => f.RollbackAndCleanupAsync(It.IsAny<List<string>>()), Times.Once);
			_unitOfWorkMock.Verify(u => u.CommitTransactionAsync(), Times.Never);
		}
		#endregion

		#region 3. QuestionService_UpdateAsync Tests
		//UTCID01: Không tìm thấy câu hỏi để cập nhật (id =999) -> trả về ErrorMessage

		//UTCID02: Phần Listening part yêu cầu phải có file âm thanh -> trả về ErrorMessage

		//UTCID03: Cập nhật thành công: OldAudio bị xóa, Audio mới được tải lên và cập nhật đúng đường dẫn

		//UTCID04: Cập nhật thành công: Audio cũ không có, cập nhật audio mới 

		//UTCID05: Cập nhật thành công: Giữ nguyên audio cũ, không cập nhật gì thêm

		//UTCID06: Định dạng file âm thanh không hợp lệ -> trả về ErrorMessage

		//UTCID07: File âm thanh vượt quá 70mb -> trả về ErrorMessage

		//UTCID08: Định dạng file ảnh không hơp lệ -> trả về ErrorMessage

		//UTCID09: File ảnh vượt quá 5mb -> trả về ErrorMessage

		//UTCID10: Lỗi khi tải lên file âm thanh mới -> trả về ErrorMessage

		//UTCID11: Lỗi khi tải lên file ảnh mới -> trả về ErrorMessage	

		//UTCID12: Exception trong quá trình cập nhật câu hỏi -> trả về ErrorMessage

		//UTCID13: Câu hỏi part 1 có 3 đáp án và 2 đáp án đúng -> trả về ErrorMessage

		//UTCID14: Câu hỏi part 1 có 3 đáp án và 0 đáp án đúng -> trả về ErrorMessage

		//UTCID15: Câu hỏi part 1 có 2 đáp án -> trả về lỗi không đủ đáp án

		//UTCID16: Câu hỏi part 5 cần 4 đáp án và 1 đáp án đúng nhưng chỉ có 3 đáp án -> trả về ErrorMessage

		//UTCID17: Câu hỏi part 1 có 3 đáp án và 1 đáp án đúng, nhưng có 2 label trùng -> trả về ErrorMessage

		//UTCID18: Câu hỏi part 5 có 4 đáp án và 1 đáp án đúng -> cập nhật thành công

		//UTCID19: Câu hỏi partid=8 không yêu cầu đáp án -> cập nhật thành công
		
		#endregion

		#region 4. QuestionService_UpdateStatusAsync Tests
		//UTCID01: Id=1, isQuestionGroup = false, isRestore = false -> Cập nhật trạng thái thành công từ Active sang Inactive
		//UTCID02: Id=1, isQuestionGroup = false, isRestore = true -> Cập nhật trạng thái thành công từ Inactive sang Active
		//UTCID03: Id=1, isQuestionGroup = true, isRestore = false -> Cập nhật trạng thái thành công từ Active sang Inactive
		//UTCID04: Id=1, isQuestionGroup = true, isRestore = true -> Cập nhật trạng thái thành công từ Inactive sang Active
		//UTCID05: Id=999, isQuestionGroup = false, isRestore = false -> Không tìm thấy câu hỏi -> trả về ErrorMessage
		//UTCID06: Id=999, isQuestionGroup = false, isRestore = true -> Không tìm thấy câu hỏi -> trả về ErrorMessage
		//UTCID07: Id=999, isQuestionGroup = true, isRestore = false -> Không tìm thấy câu hỏi -> trả về ErrorMessage
		//UTCID08: Id=999, isQuestionGroup = true, isRestore = true -> Không tìm thấy câu hỏi -> trả về ErrorMessage
		//UTCID09: Id=1, isQuestionGroup = true, isRestore = false -> Exception + ErrorMessage
		//UTCID10: Id=1, isQuestionGroup = true, isRestore = true -> Exception + ErrorMessage
		#endregion

		#region 5. QuestionService_FilterSingleQuestionAsync Tests
		//UTCID01: Lọc câu hỏi với full filter: PartId = 1, QuestionTypeId = 1,keyWord = "How old",skill=3, sortOrder = "desc",page=1, pageSize=6, status=Active
		// trả về danh sách câu hỏi phù hợp có 3 phần tử

		//UTCID02: Lọc câu hỏi với filter rỗng: PartId = null, QuestionTypeId = null,keyWord = null, sortOrder = null,page=1, pageSize=6, status=Active
		// trả về danh sách câu hỏi có 6 elements, total 10 elements, order by CreatedAt desc

		//UTCID03: Lọc câu hỏi với part id = 0: PartId = 0, QuestionTypeId = null,keyWord = null, sortOrder = null,page=1, pageSize=6, status=Active
		// trả về danh sách câu hỏi rỗng

		//UTCID04: Lọc câu hỏi với question type id = 0: PartId = null, QuestionTypeId = 0,keyWord = null, sortOrder = null,page=1, pageSize=6, status=Active
		// trả về danh sách câu hỏi rỗng

		//UTCID05: Lọc câu hỏi với skill = 0 : PartId = null, QuestionTypeId = null,keyWord = null,skill = 0,  sortOrder = null,page=1, pageSize=6, status=Active
		// trả về danh sách câu hỏi rỗng


		//UTCID06: Lọc câu hỏi với page = 0 : PartId = null, QuestionTypeId = null,keyWord = null, sortOrder = null,page=0, pageSize=6, status=Active
		// trả về danh sách câu hỏi rỗng


		//UTCID07: Lọc câu hỏi với pageSize = 0 : PartId = null, QuestionTypeId = null,keyWord = null, sortOrder = null,page=1, pageSize=0, status=Active
		// trả về danh sách câu hỏi rỗng

		//UTCID08: Lọc câu hỏi với Part ID = -1 : PartId = -1, QuestionTypeId = null,keyWord = null, sortOrder = null,page=1, pageSize=6, status=Active
		// trả về danh sách câu hỏi rỗng

		//UTCID09: Lọc câu hỏi với Question Type ID = -1 : PartId = null, QuestionTypeId = -1,keyWord = null, sortOrder = null,page=1, pageSize=6, status=Active
		// trả về danh sách câu hỏi rỗng

		//UTCID10: Lọc câu hỏi với skill = -1 : PartId = null, QuestionTypeId = null,keyWord = null,skill = -1,  sortOrder = null,page=1, pageSize=6, status=Active
		// trả về danh sách câu hỏi rỗng

		//UTCID11: Lọc câu hỏi với page = -1 : PartId = null, QuestionTypeId = null,keyWord = null, sortOrder = null,page=-1, pageSize=6, status=Active
		// trả về exception

		//UTCID12: Lọc câu hỏi với pageSize = -1 : PartId = null, QuestionTypeId = null,keyWord = null, sortOrder = null,page=1, pageSize=-1, status=Active
		// trả về exception
		#endregion
	}
}
