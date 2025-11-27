using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore.Storage;
using Moq;
using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.DTOs.Requests.GroupQuestion;
using ToeicGenius.Domains.DTOs.Requests.Question;
using ToeicGenius.Domains.DTOs.Requests.QuestionGroup;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Domains.Enums;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Services.Implementations;
using ToeicGenius.Services.Interfaces;
using ToeicGenius.Shared.Constants;
using Xunit;

namespace ToeicGenius.Tests.UnitTests
{
	public class QuestionGroupServiceTests
	{
		private readonly Mock<IQuestionService> _questionService = new();
		private readonly Mock<IFileService> _fileService = new();
		private readonly Mock<IUnitOfWork> _uow = new();
		private readonly Mock<IQuestionGroupRepository> _questionGroupRepo = new();
		private readonly Mock<IQuestionRepository> _questionRepo = new();
		private readonly Mock<IOptionRepository> _optionRepo = new();
		private readonly Mock<IPartRepository> _partRepo = new();
		private QuestionGroupService CreateService()
		{
			_uow.SetupGet(u => u.QuestionGroups).Returns(_questionGroupRepo.Object);
			_uow.SetupGet(u => u.Questions).Returns(_questionRepo.Object);
			_uow.SetupGet(u => u.Options).Returns(_optionRepo.Object);
			_uow.SetupGet(u => u.Parts).Returns(_partRepo.Object);
			return new QuestionGroupService(
				_questionService.Object,
				_fileService.Object,
				_uow.Object
			);
		}

		#region 1. QuestionGroupService_GetDetailAsync
		// UTCID01: Expected: True -> data: null
		// Input: questionGroupId = -1 (non-existing ID)

		// UTCID02: Expected: True -> data: null
		// Input: questionGroupId = 0 (non-existing ID)

		// UTCID03: Expected: True -> data: valid QuestionGroupDetailDto
		// Input: questionGroupId = 1 (existing ID)

		// UTCID04: Expected: False -> ex.Message from exception
		// Input: questionGroupId = 2
		#endregion

		#region 2. QuestionGroupService_FilterQuestionGroupsAsync
		// UTCID01: Expected: True -> data: PaginationResponse<QuestionListItemDto> have 3 elements, all elements have IsGroupQuestion = true, status = "Active", skill = "Listening, PartName = "S-Part 1", Content contain "How old"
		// Input: QuestionGroupFilterDto with PartId=1, keyWord = "How old", skill = 3, sortOrder=desc, page=1,pageSize=6,status=Active
		
		// UTCID02: Expected: True -> data: PaginationResponse<QuestionListItemDto> have 6 elements, total 10 elements, IsGroupQuestion = true, order by CreatedAt desc
		// Input: QuestionGroupFilterDto with page=1,pageSize=6,status=Active
		
		// UTCID03: Expected: True -> data: PaginationResponse<QuestionListItemDto> with empty data
		// Input: QuestionGroupFilterDto with PartId=0, sortOrder=desc, page=1,pageSize=6,status=Active

		// UTCID04: Expected: True -> PaginationResponse<QuestionListItemDto> with empty data
		// Input: QuestionGroupFilterDto with PartId=0, sortOrder=desc, page=1,pageSize=6,status=Active

		// UTCID05: Expected: False -> PaginationResponse<QuestionListItemDto> with empty data
		// Input: QuestionGroupFilterDto with skill = 0, sortOrder=desc, page=1,pageSize=6,status=Active

		// UTCID06: Expected: False -> ex.Message from exception
		// Input: QuestionGroupFilterDto with page=0,pageSize=6,status=Active

		// UTCID07: Expected: True -> PaginationResponse<QuestionListItemDto> with empty data
		// Input: QuestionGroupFilterDto with page=1,pageSize=0,status=Active

		// UTCID08: Expected: True -> PaginationResponse<QuestionListItemDto> with empty data
		// Input: QuestionGroupFilterDto with partId =-1,sortOrder=desc, page=1,pageSize=6,status=Active

		// UTCID09: Expected: True -> PaginationResponse<QuestionListItemDto> with empty data
		// Input: QuestionGroupFilterDto with sortOrder=desc, page=1,pageSize=6,status=Active

		// UTCID10: Expected: True -> PaginationResponse<QuestionListItemDto> with empty data
		// Input: QuestionGroupFilterDto with skill=-1, sortOrder=desc, page=1,pageSize=6,status=Active

		// UTCID11: Expected: False -> ex.Message from exception
		// Input: QuestionGroupFilterDto with sortOrder=desc, page=-1,pageSize=6,status=Active
		
		// UTCID12: Expected: False -> ex.Message from exception
		// Input: QuestionGroupFilterDto with sortOrder=desc, page=1,pageSize=-1,status=Active
		#endregion

		#region 3. QuestionGroupService_CreateAsync
		private QuestionGroupRequestDto BuildRequest(
			int partId,
			int questionCount = 2,
			IFormFile? audio = null,
			IFormFile? image = null,
			Func<int, CreateQuestionDto>? questionFactory = null)
		{
			var questions = new List<CreateQuestionDto>();
			for (int i = 0; i < questionCount; i++)
			{
				if (questionFactory != null)
				{
					questions.Add(questionFactory(i));
				}
				else
				{
					questions.Add(new CreateQuestionDto
					{
						QuestionTypeId = 1,
						PartId = partId,
						Content = $"Question {i + 1}",
						Solution = "Solution",
						AnswerOptions = new List<AnswerOptionDto>
						{
							new() { Content = "Opt 1", Label = "A", IsCorrect = i % 2 == 0 },
							new() { Content = "Opt 2", Label = "B", IsCorrect = i % 2 != 0 },
							new() { Content = "Opt 3", Label = "C", IsCorrect = false },
							new() { Content = "Opt 4", Label = "D", IsCorrect = false },
						}
					});
				}
			}

			return new QuestionGroupRequestDto
			{
				PartId = partId,
				Audio = audio,
				Image = image,
				PassageContent = "Example passage content",
				Questions = questions
			};
		}

		private Mock<IFormFile> CreateMockFile(string fileName, string contentType, long length = 1024)
		{
			var file = new Mock<IFormFile>();
			file.Setup(f => f.FileName).Returns(fileName);
			file.Setup(f => f.ContentType).Returns(contentType);
			file.Setup(f => f.Length).Returns(length);
			return file;
		}

		private void SetupListeningPart(int partId)
		{
			_uow.Setup(u => u.Parts.GetByIdAsync(partId)).ReturnsAsync(new Part
			{
				PartId = partId,
				Skill = QuestionSkill.Listening
			});
		}

		private void SetupReadingPart(int partId)
		{
			_uow.Setup(u => u.Parts.GetByIdAsync(partId)).ReturnsAsync(new Part
			{
				PartId = partId,
				Skill = QuestionSkill.Reading
			});
		}

		private void SetupSuccessPersistence()
		{
			_uow.Setup(u => u.BeginTransactionAsync()).ReturnsAsync(Mock.Of<IDbContextTransaction>());
			_uow.Setup(u => u.QuestionGroups.AddAsync(It.IsAny<QuestionGroup>()))
				.ReturnsAsync((QuestionGroup g) => g);
			_uow.Setup(u => u.Questions.AddAsync(It.IsAny<Question>()))
				.ReturnsAsync((Question q) => q);
			_uow.Setup(u => u.Options.AddRangeAsync(It.IsAny<List<Option>>()))
				.Returns(Task.CompletedTask);
			_uow.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);
			_uow.Setup(u => u.CommitTransactionAsync()).Returns(Task.CompletedTask);
		}
		private void SetupUpdateTransaction()
		{
			_uow.Setup(u => u.BeginTransactionAsync()).ReturnsAsync(Mock.Of<IDbContextTransaction>());
			_uow.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);
			_uow.Setup(u => u.CommitTransactionAsync()).Returns(Task.CompletedTask);
		}

		private QuestionGroup CreateExistingGroup(int groupId, int partId, bool hasAudio = true, bool hasImage = false, int questionCount = 2)
		{
			var group = new QuestionGroup
			{
				QuestionGroupId = groupId,
				PartId = partId,
				AudioUrl = hasAudio ? "existing-audio.mp3" : string.Empty,
				ImageUrl = hasImage ? "existing-image.jpg" : string.Empty,
				Questions = new List<Question>()
			};

			for (int i = 0; i < questionCount; i++)
			{
				var question = new Question
				{
					QuestionId = groupId * 100 + i + 1,
					PartId = partId,
					QuestionTypeId = 1,
					Content = $"Existing question {i + 1}",
					Options = new List<Option>()
				};

				for (int j = 0; j < 4; j++)
				{
					question.Options.Add(new Option
					{
						OptionId = groupId * 1000 + i * 10 + j + 1,
						Label = ((char)('A' + j)).ToString(),
						Content = $"Existing option {j + 1}",
						IsCorrect = j == 0,
						Status = CommonStatus.Active
					});
				}

				group.Questions.Add(question);
			}

			return group;
		}

		private UpdateQuestionGroupDto BuildUpdateDto(
			int groupId,
			int partId,
			int questionCount = 2,
			IFormFile? audio = null,
			IFormFile? image = null,
			Func<int, UpdateSingleQuestionDto>? questionFactory = null)
		{
			var questions = new List<UpdateSingleQuestionDto>();
			for (int i = 0; i < questionCount; i++)
			{
				if (questionFactory != null)
				{
					questions.Add(questionFactory(i));
				}
				else
				{
					var questionId = groupId * 100 + i + 1;
					questions.Add(new UpdateSingleQuestionDto
					{
						QuestionId = questionId,
						QuestionTypeId = 1,
						PartId = partId,
						Content = $"Updated question {i + 1}",
						Solution = "Updated solution",
						AnswerOptions = new List<UpdateAnswerOptionDto>
						{
							new() { Id = questionId * 10 + 1, Label = "A", Content = "Opt 1", IsCorrect = true },
							new() { Id = questionId * 10 + 2, Label = "B", Content = "Opt 2", IsCorrect = false },
							new() { Id = questionId * 10 + 3, Label = "C", Content = "Opt 3", IsCorrect = false },
							new() { Id = questionId * 10 + 4, Label = "D", Content = "Opt 4", IsCorrect = false }
						}
					});
				}
			}

			return new UpdateQuestionGroupDto
			{
				QuestionGroupId = groupId,
				PartId = partId,
				Audio = audio,
				Image = image,
				PassageContent = "Updated passage content",
				QuestionsJson = "[]",
				Questions = questions
			};
		}

		private void SetupExistingGroup(int groupId, QuestionGroup group)
		{
			_questionGroupRepo.Setup(r => r.GetByIdAndStatusAsync(groupId, CommonStatus.Active))
				.ReturnsAsync(group);
		}
		// UTCID01: Expected: False -> "Một nhóm câu hỏi phải có từ 2 đến 5 câu hỏi đơn."
		// QuestionGroupRequestDto: PartId=4, Audio="validAudio.mp3", PassageContent="Example passage content", Questions (1 question with valid option)
		
		// UTCID02: Expected: True -> "Thao tác thành công."
		// QuestionGroupRequestDto: PartId=4, Audio="validAudio.mp3",Image="validImage.jpg", PassageContent="Example passage content", Questions (2 question with valid option)
		
		// UTCID03: Expected: True -> "Thao tác thành công."
		// QuestionGroupRequestDto: PartId=4, Audio="validAudio.mp3", PassageContent="Example passage content", Questions (5 question with valid option)
		
		// UTCID04: Expected: False -> "Một nhóm câu hỏi phải có từ 2 đến 5 câu hỏi đơn."
		// QuestionGroupRequestDto: PartId=4, Audio="validAudio.mp3", PassageContent="Example passage content", Questions (6 question with valid option)
		
		// UTCID05: Expected: False -> "Định dạng file âm thanh không hợp lệ. Chỉ chấp nhận .mp3, .wav, .ogg và .m4a."
		// QuestionGroupRequestDto: PartId=4, Audio="invalidType.zip", PassageContent="Example passage content", Questions (2 question with valid option)
		
		// UTCID06: Expected: False -> "Dung lượng file âm thanh vượt quá 70MB."
		// QuestionGroupRequestDto: PartId=4, Audio="invalidSize.mp3", PassageContent="Example passage content", Questions (2 question with valid option)
		
		// UTCID07: Expected: False -> "Phần Listening part yêu cầu phải có file âm thanh."
		// QuestionGroupRequestDto: PartId=4, Audio=null, PassageContent="Example passage content", Questions (2 question with valid option)
		
		// UTCID08: Expected: False -> "Định dạng file hình ảnh không hợp lệ. Chỉ chấp nhận .jpg, .jpeg, .png, .bmp, .gif, .webp."
		// QuestionGroupRequestDto: PartId=7, Image="invalidType.zip", PassageContent="Example passage content", Questions (2 question with valid option)
		
		// UTCID09: Expected: False -> "Dung lượng file hình ảnh vượt quá 5MB."
		// QuestionGroupRequestDto: PartId=7, Image="invalidSize.jpg", PassageContent="Example passage content", Questions (2 question with valid option)
		
		// UTCID10: Expected: True -> "Thao tác thành công."
		// QuestionGroupRequestDto: PartId=7, PassageContent="Example passage content", Questions (2 question with valid option)
		
		// UTCID11: Expected: False -> "Các nhãn (label) của đáp án phải là duy nhất, không được trùng nhau."
		// QuestionGroupRequestDto: PartId=7, PassageContent="Example passage content", Questions (2 question with invalid label option)
		
		// UTCID12: Expected: False -> "Số lượng đáp án phải đúng bằng 4."
		// QuestionGroupRequestDto: PartId=7, PassageContent="Example passage content", Questions (2 question with invalid quantity option)
		
		// UTCID13: Expected: False -> "Phải có ít nhất một đáp án được chọn là đúng."
		// QuestionGroupRequestDto: PartId=7, PassageContent="Example passage content", Questions (2 question with invalid quantity correct option)
		
		// UTCID14: Expected: False -> ex.Message from exception
		// QuestionGroupRequestDto: PartId=7, PassageContent="Example passage content", Questions (5 question with invalid option)
		
		// UTCID01: Expected: False -> "Một nhóm câu hỏi phải có từ 2 đến 5 câu hỏi đơn."
		// QuestionGroupRequestDto: PartId=4, Audio="validAudio.mp3", PassageContent="Example passage content", Questions (1 question with valid option)
		[Trait("Category", "QuestionGroupService_CreateAsync")]
		[Trait("TestCase", "UTCID01")]
		[Fact]
		public async Task CreateAsync_WithLessThanTwoQuestions_ReturnsFailure()
		{
			var request = BuildRequest(4, questionCount: 1);
			var service = CreateService();

			var result = await service.CreateAsync(request);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Một nhóm câu hỏi phải có từ 2 đến 5 câu hỏi đơn.");
			_uow.Verify(u => u.BeginTransactionAsync(), Times.Never);
		}

		// UTCID02: Expected: True -> "Thao tác thành công."
		// QuestionGroupRequestDto: PartId=4, Audio="validAudio.mp3",Image="validImage.jpg", PassageContent, Questions (2 question with valid option)
		[Trait("Category", "QuestionGroupService_CreateAsync")]
		[Trait("TestCase", "UTCID02")]
		[Fact]
		public async Task CreateAsync_ListeningPartWithValidAudioAndImage_ReturnsSuccess()
		{
			var audioFile = CreateMockFile("audio.mp3", "audio/mpeg").Object;
			var imageFile = CreateMockFile("picture.jpg", "image/jpeg").Object;
			var request = BuildRequest(4, questionCount: 2, audio: audioFile, image: imageFile);
			SetupListeningPart(4);
			SetupSuccessPersistence();
			_fileService.Setup(f => f.UploadFileAsync(audioFile, "audio"))
				.ReturnsAsync(Result<string>.Success("audio-url"));
			_fileService.Setup(f => f.UploadFileAsync(imageFile, "image"))
				.ReturnsAsync(Result<string>.Success("image-url"));

			var service = CreateService();

			var result = await service.CreateAsync(request);

			result.IsSuccess.Should().BeTrue();
			result.Data.Should().Be(SuccessMessages.OperationSuccess);
			_fileService.Verify(f => f.UploadFileAsync(audioFile, "audio"), Times.Once);
			_fileService.Verify(f => f.UploadFileAsync(imageFile, "image"), Times.Once);
			_uow.Verify(u => u.QuestionGroups.AddAsync(It.IsAny<QuestionGroup>()), Times.Once);
			_uow.Verify(u => u.SaveChangesAsync(), Times.Once);
		}

		// UTCID03: Expected: True -> "Thao tác thành công."
		// QuestionGroupRequestDto: PartId=4, Audio="validAudio.mp3", PassageContent, Questions (5 question with valid option)
		[Trait("Category", "QuestionGroupService_CreateAsync")]
		[Trait("TestCase", "UTCID03")]
		[Fact]
		public async Task CreateAsync_WithFiveQuestions_ReturnsSuccess()
		{
			var audioFile = CreateMockFile("audio.mp3", "audio/mpeg").Object;
			var request = BuildRequest(4, questionCount: 5, audio: audioFile);
			SetupListeningPart(4);
			SetupSuccessPersistence();
			_fileService.Setup(f => f.UploadFileAsync(audioFile, "audio"))
				.ReturnsAsync(Result<string>.Success("audio-url"));

			var service = CreateService();
			var result = await service.CreateAsync(request);

			result.IsSuccess.Should().BeTrue();
			result.Data.Should().Be(SuccessMessages.OperationSuccess);
			_uow.Verify(u => u.QuestionGroups.AddAsync(It.IsAny<QuestionGroup>()), Times.Once);
		}

		// UTCID04: Expected: False -> "Một nhóm câu hỏi phải có từ 2 đến 5 câu hỏi đơn."
		// QuestionGroupRequestDto: PartId=4, Audio="validAudio.mp3", Questions (6 question)
		[Trait("Category", "QuestionGroupService_CreateAsync")]
		[Trait("TestCase", "UTCID04")]
		[Fact]
		public async Task CreateAsync_WithMoreThanFiveQuestions_ReturnsFailure()
		{
			var request = BuildRequest(4, questionCount: 6);
			var service = CreateService();

			var result = await service.CreateAsync(request);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Một nhóm câu hỏi phải có từ 2 đến 5 câu hỏi đơn.");
			_uow.Verify(u => u.BeginTransactionAsync(), Times.Never);
		}

		// UTCID05: Expected: False -> "Định dạng file âm thanh không hợp lệ..."
		[Trait("Category", "QuestionGroupService_CreateAsync")]
		[Trait("TestCase", "UTCID05")]
		[Fact]
		public async Task CreateAsync_WithInvalidAudioFormat_ReturnsFailure()
		{
			var audioFile = CreateMockFile("invalid.zip", "application/zip").Object;
			var request = BuildRequest(4, questionCount: 2, audio: audioFile);
			SetupListeningPart(4);
			SetupSuccessPersistence();

			var service = CreateService();
			var result = await service.CreateAsync(request);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Contain("Định dạng file âm thanh không hợp lệ");
			_fileService.Verify(f => f.UploadFileAsync(It.IsAny<IFormFile>(), It.IsAny<string>()), Times.Never);
		}

		// UTCID06: Expected: False -> "Dung lượng file âm thanh vượt quá 70MB."
		[Trait("Category", "QuestionGroupService_CreateAsync")]
		[Trait("TestCase", "UTCID06")]
		[Fact]
		public async Task CreateAsync_WithOversizedAudio_ReturnsFailure()
		{
			var audioFile = CreateMockFile("audio.mp3", "audio/mpeg", length: 71 * 1024 * 1024).Object;
			var request = BuildRequest(4, questionCount: 2, audio: audioFile);
			SetupListeningPart(4);
			SetupSuccessPersistence();

			var service = CreateService();
			var result = await service.CreateAsync(request);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Contain("Dung lượng file âm thanh vượt quá 70MB.");
			_fileService.Verify(f => f.UploadFileAsync(It.IsAny<IFormFile>(), It.IsAny<string>()), Times.Never);
		}

		// UTCID07: Expected: False -> "Phần Listening part yêu cầu phải có file âm thanh."
		[Trait("Category", "QuestionGroupService_CreateAsync")]
		[Trait("TestCase", "UTCID07")]
		[Fact]
		public async Task CreateAsync_ListeningPartWithoutAudio_ReturnsFailure()
		{
			var request = BuildRequest(4, questionCount: 2, audio: null);
			SetupListeningPart(4);
			SetupSuccessPersistence();

			var service = CreateService();
			var result = await service.CreateAsync(request);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Phần Listening part yêu cầu phải có file âm thanh.");
			_fileService.Verify(f => f.UploadFileAsync(It.IsAny<IFormFile>(), It.IsAny<string>()), Times.Never);
		}

		// UTCID08: Expected: False -> "Định dạng file hình ảnh không hợp lệ..."
		[Trait("Category", "QuestionGroupService_CreateAsync")]
		[Trait("TestCase", "UTCID08")]
		[Fact]
		public async Task CreateAsync_WithInvalidImageFormat_ReturnsFailure()
		{
			var imageFile = CreateMockFile("invalid.zip", "application/zip").Object;
			var request = BuildRequest(7, questionCount: 2, image: imageFile);
			SetupReadingPart(7);
			SetupSuccessPersistence();

			var service = CreateService();
			var result = await service.CreateAsync(request);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Contain("Định dạng file hình ảnh không hợp lệ");
			_fileService.Verify(f => f.UploadFileAsync(It.IsAny<IFormFile>(), It.IsAny<string>()), Times.Never);
		}

		// UTCID09: Expected: False -> "Dung lượng file hình ảnh vượt quá 5MB."
		[Trait("Category", "QuestionGroupService_CreateAsync")]
		[Trait("TestCase", "UTCID09")]
		[Fact]
		public async Task CreateAsync_WithOversizedImage_ReturnsFailure()
		{
			var imageFile = CreateMockFile("image.jpg", "image/jpeg", length: 6 * 1024 * 1024).Object;
			var request = BuildRequest(7, questionCount: 2, image: imageFile);
			SetupReadingPart(7);
			SetupSuccessPersistence();

			var service = CreateService();
			var result = await service.CreateAsync(request);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Contain("Dung lượng file hình ảnh vượt quá 5MB.");
			_fileService.Verify(f => f.UploadFileAsync(It.IsAny<IFormFile>(), It.IsAny<string>()), Times.Never);
		}

		// UTCID10: Expected: True -> "Thao tác thành công."
		[Trait("Category", "QuestionGroupService_CreateAsync")]
		[Trait("TestCase", "UTCID10")]
		[Fact]
		public async Task CreateAsync_ReadingPartWithoutMedia_ReturnsSuccess()
		{
			var request = BuildRequest(7, questionCount: 2);
			SetupReadingPart(7);
			SetupSuccessPersistence();

			var service = CreateService();
			var result = await service.CreateAsync(request);

			result.IsSuccess.Should().BeTrue();
			result.Data.Should().Be(SuccessMessages.OperationSuccess);
			_fileService.Verify(f => f.UploadFileAsync(It.IsAny<IFormFile>(), It.IsAny<string>()), Times.Never);
		}

		// UTCID11: Expected: False -> "Các nhãn (label) của đáp án phải là duy nhất..."
		[Trait("Category", "QuestionGroupService_CreateAsync")]
		[Trait("TestCase", "UTCID11")]
		[Fact]
		public async Task CreateAsync_WithDuplicateLabels_ReturnsFailure()
		{
			var request = BuildRequest(7, questionCount: 2, questionFactory: _ =>
			{
				return new CreateQuestionDto
				{
					QuestionTypeId = 1,
					PartId = 7,
					Content = "Question",
					AnswerOptions = new List<AnswerOptionDto>
					{
						new() { Content = "Opt 1", Label = "A", IsCorrect = true },
						new() { Content = "Opt 2", Label = "A", IsCorrect = false },
						new() { Content = "Opt 3", Label = "C", IsCorrect = false },
						new() { Content = "Opt 4", Label = "D", IsCorrect = false },
					}
				};
			});
			SetupReadingPart(7);
			SetupSuccessPersistence();

			var service = CreateService();
			var result = await service.CreateAsync(request);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Các nhãn (label) của đáp án phải là duy nhất, không được trùng nhau.");
		}

		// UTCID12: Expected: False -> "Số lượng đáp án phải đúng bằng 4."
		[Trait("Category", "QuestionGroupService_CreateAsync")]
		[Trait("TestCase", "UTCID12")]
		[Fact]
		public async Task CreateAsync_WithInvalidOptionCount_ReturnsFailure()
		{
			var request = BuildRequest(7, questionCount: 2, questionFactory: _ =>
			{
				return new CreateQuestionDto
				{
					QuestionTypeId = 1,
					PartId = 7,
					Content = "Question",
					AnswerOptions = new List<AnswerOptionDto>
					{
						new() { Content = "Opt 1", Label = "A", IsCorrect = true },
						new() { Content = "Opt 2", Label = "B", IsCorrect = false },
						new() { Content = "Opt 3", Label = "C", IsCorrect = false },
					}
				};
			});
			SetupReadingPart(7);
			SetupSuccessPersistence();

			var service = CreateService();
			var result = await service.CreateAsync(request);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Số lượng đáp án phải đúng bằng 4.");
		}

		// UTCID13: Expected: False -> "Phải có ít nhất một đáp án được chọn là đúng."
		[Trait("Category", "QuestionGroupService_CreateAsync")]
		[Trait("TestCase", "UTCID13")]
		[Fact]
		public async Task CreateAsync_WithNoCorrectAnswer_ReturnsFailure()
		{
			var request = BuildRequest(7, questionCount: 2, questionFactory: _ =>
			{
				return new CreateQuestionDto
				{
					QuestionTypeId = 1,
					PartId = 7,
					Content = "Question",
					AnswerOptions = new List<AnswerOptionDto>
					{
						new() { Content = "Opt 1", Label = "A", IsCorrect = false },
						new() { Content = "Opt 2", Label = "B", IsCorrect = false },
						new() { Content = "Opt 3", Label = "C", IsCorrect = false },
						new() { Content = "Opt 4", Label = "D", IsCorrect = false },
					}
				};
			});
			SetupReadingPart(7);
			SetupSuccessPersistence();

			var service = CreateService();
			var result = await service.CreateAsync(request);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Cần có duy nhất một đáp án đúng.");
		}

		// UTCID14: Expected: False -> ex.Message from exception
		[Trait("Category", "QuestionGroupService_CreateAsync")]
		[Trait("TestCase", "UTCID14")]
		[Fact]
		public async Task CreateAsync_WhenRepositoryThrows_ReturnsFailureAndRollbackFiles()
		{
			var audioFile = CreateMockFile("audio.mp3", "audio/mpeg").Object;
			var request = BuildRequest(7, questionCount: 2, audio: audioFile);
			SetupReadingPart(7);
			_uow.Setup(u => u.BeginTransactionAsync()).ReturnsAsync(Mock.Of<Microsoft.EntityFrameworkCore.Storage.IDbContextTransaction>());
			_questionGroupRepo.Setup(r => r.AddAsync(It.IsAny<QuestionGroup>()))
				.ThrowsAsync(new Exception("DB error"));
			_fileService.Setup(f => f.UploadFileAsync(audioFile, "audio"))
				.ReturnsAsync(Result<string>.Success("audio-url"));

			var service = CreateService();
			var result = await service.CreateAsync(request);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Contain("DB error");
			_fileService.Verify(f => f.RollbackAndCleanupAsync(It.Is<List<string>>(l => l.Contains("audio-url"))), Times.Once);
			_uow.Verify(u => u.CommitTransactionAsync(), Times.Never);
		}

		#endregion

		#region 4. QuestionGroupService_UpdateAsync
		private (QuestionGroup group, UpdateQuestionGroupDto dto) PrepareUpdateContext(
			int groupId,
			int partId,
			int questionCount,
			bool existingHasAudio = true,
			bool existingHasImage = false,
			IFormFile? newAudio = null,
			IFormFile? newImage = null,
			Func<int, UpdateSingleQuestionDto>? questionFactory = null,
			int existingQuestionCount = 2)
		{
			var existingGroup = CreateExistingGroup(groupId, partId, existingHasAudio, existingHasImage, existingQuestionCount);
			SetupExistingGroup(groupId, existingGroup);
			var dto = BuildUpdateDto(groupId, partId, questionCount, newAudio, newImage, questionFactory);
			return (existingGroup, dto);
		}
		// UTCID01: Expected: False -> "Một nhóm câu hỏi phải có từ 2 đến 5 câu hỏi đơn."
		// QuestionGroupId = 1
		// QuestionGroupRequestDto: PartId=4, Audio="validAudio.mp3", PassageContent="Example passage content", Questions (1 question with valid option)
		[Trait("Category", "QuestionGroupService_UpdateAsync")]
		[Trait("TestCase", "UTCID01")]
		[Fact]
		public async Task UpdateAsync_WithLessThanTwoQuestions_ReturnsFailure()
		{
			var groupId = 1;
			var partId = 4;
			PrepareUpdateContext(groupId, partId, questionCount: 1);
			SetupListeningPart(partId);
			var dto = BuildUpdateDto(groupId, partId, questionCount: 1);
			var service = CreateService();

			var result = await service.UpdateAsync(groupId, dto);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Quantity of question in group must be between 2 and 5.");
			_uow.Verify(u => u.BeginTransactionAsync(), Times.Never);
		}

		// UTCID02: Expected: True -> "Thao tác thành công."
		// QuestionGroupId = 1
		// QuestionGroupRequestDto: PartId=4, Audio="validAudio.mp3",Image="validImage.jpg", PassageContent, Questions (2 question with valid option)
		[Trait("Category", "QuestionGroupService_UpdateAsync")]
		[Trait("TestCase", "UTCID02")]
		[Fact]
		public async Task UpdateAsync_ListeningPartWithValidAudioAndImage_ReturnsSuccess()
		{
			var groupId = 1;
			var partId = 4;
			var audioFile = CreateMockFile("audio.mp3", "audio/mpeg").Object;
			var imageFile = CreateMockFile("picture.jpg", "image/jpeg").Object;
			PrepareUpdateContext(groupId, partId, questionCount: 2, newAudio: audioFile, newImage: imageFile);
			SetupListeningPart(partId);
			SetupUpdateTransaction();
			_fileService.Setup(f => f.UploadFileAsync(audioFile, "audio")).ReturnsAsync(Result<string>.Success("audio-url"));
			_fileService.Setup(f => f.UploadFileAsync(imageFile, "image")).ReturnsAsync(Result<string>.Success("image-url"));

			var dto = BuildUpdateDto(groupId, partId, questionCount: 2, audio: audioFile, image: imageFile);
			var service = CreateService();

			var result = await service.UpdateAsync(groupId, dto);

			result.IsSuccess.Should().BeTrue();
			result.Data.Should().Be($"QuestionGroup {groupId} updated successfully.");
			_fileService.Verify(f => f.UploadFileAsync(audioFile, "audio"), Times.Once);
			_fileService.Verify(f => f.UploadFileAsync(imageFile, "image"), Times.Once);
			_uow.Verify(u => u.SaveChangesAsync(), Times.Once);
		}

		// UTCID03: Expected: True -> "Thao tác thành công."
		// QuestionGroupId = 1
		// QuestionGroupRequestDto: PartId=4, Audio="validAudio.mp3", PassageContent, Questions (5 question with valid option)
		[Trait("Category", "QuestionGroupService_UpdateAsync")]
		[Trait("TestCase", "UTCID03")]
		[Fact]
		public async Task UpdateAsync_WithFiveQuestions_ReturnsSuccess()
		{
			var groupId = 1;
			var partId = 4;
			var audioFile = CreateMockFile("audio.mp3", "audio/mpeg").Object;
			PrepareUpdateContext(groupId, partId, questionCount: 5, newAudio: audioFile, existingQuestionCount: 5);
			SetupListeningPart(partId);
			SetupUpdateTransaction();
			_fileService.Setup(f => f.UploadFileAsync(audioFile, "audio")).ReturnsAsync(Result<string>.Success("audio-url"));

			var dto = BuildUpdateDto(groupId, partId, questionCount: 5, audio: audioFile);
			var service = CreateService();
			var result = await service.UpdateAsync(groupId, dto);

			result.IsSuccess.Should().BeTrue();
			result.Data.Should().Be($"QuestionGroup {groupId} updated successfully.");
		}

		// UTCID04: Expected: False -> "Một nhóm câu hỏi phải có từ 2 đến 5 câu hỏi đơn."
		// QuestionGroupId = 1
		// QuestionGroupRequestDto: PartId=4, Audio="validAudio.mp3", Questions (6 question)
		[Trait("Category", "QuestionGroupService_UpdateAsync")]
		[Trait("TestCase", "UTCID04")]
		[Fact]
		public async Task UpdateAsync_WithMoreThanFiveQuestions_ReturnsFailure()
		{
			var groupId = 1;
			var partId = 4;
			PrepareUpdateContext(groupId, partId, questionCount: 6);
			SetupListeningPart(partId);
			var dto = BuildUpdateDto(groupId, partId, questionCount: 6);
			var service = CreateService();

			var result = await service.UpdateAsync(groupId, dto);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Quantity of question in group must be between 2 and 5.");
			_uow.Verify(u => u.BeginTransactionAsync(), Times.Never);
		}

		// UTCID05: Expected: False -> "Định dạng file âm thanh không hợp lệ..."
		// QuestionGroupId = 1
		[Trait("Category", "QuestionGroupService_UpdateAsync")]
		[Trait("TestCase", "UTCID05")]
		[Fact]
		public async Task UpdateAsync_WithInvalidAudioFormat_ReturnsFailure()
		{
			var groupId = 1;
			var partId = 4;
			var audioFile = CreateMockFile("invalid.zip", "application/zip").Object;
			PrepareUpdateContext(groupId, partId, questionCount: 2, newAudio: audioFile);
			SetupListeningPart(partId);
			var dto = BuildUpdateDto(groupId, partId, questionCount: 2, audio: audioFile);
			var service = CreateService();

			var result = await service.UpdateAsync(groupId, dto);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Contain("Định dạng file âm thanh không hợp lệ");
			_fileService.Verify(f => f.UploadFileAsync(It.IsAny<IFormFile>(), It.IsAny<string>()), Times.Never);
		}

		// UTCID06: Expected: False -> "Dung lượng file âm thanh vượt quá 70MB."
		// QuestionGroupId = 1
		[Trait("Category", "QuestionGroupService_UpdateAsync")]
		[Trait("TestCase", "UTCID06")]
		[Fact]
		public async Task UpdateAsync_WithOversizedAudio_ReturnsFailure()
		{
			var groupId = 1;
			var partId = 4;
			var audioFile = CreateMockFile("audio.mp3", "audio/mpeg", length: 71 * 1024 * 1024).Object;
			PrepareUpdateContext(groupId, partId, questionCount: 2, newAudio: audioFile);
			SetupListeningPart(partId);
			var dto = BuildUpdateDto(groupId, partId, questionCount: 2, audio: audioFile);
			var service = CreateService();

			var result = await service.UpdateAsync(groupId, dto);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Contain("Dung lượng file âm thanh vượt quá 70MB.");
			_fileService.Verify(f => f.UploadFileAsync(It.IsAny<IFormFile>(), It.IsAny<string>()), Times.Never);
		}

		// UTCID07: Expected: False -> "Phần Listening part yêu cầu phải có file âm thanh."
		// QuestionGroupId = 1
		[Trait("Category", "QuestionGroupService_UpdateAsync")]
		[Trait("TestCase", "UTCID07")]
		[Fact]
		public async Task UpdateAsync_ListeningPartWithoutAudio_ReturnsFailure()
		{
			var groupId = 1;
			var partId = 4;
			var existingGroup = CreateExistingGroup(groupId, partId, hasAudio: false);
			SetupExistingGroup(groupId, existingGroup);
			SetupListeningPart(partId);
			var dto = BuildUpdateDto(groupId, partId, questionCount: 2, audio: null);
			var service = CreateService();

			var result = await service.UpdateAsync(groupId, dto);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Audio file is required for Listening part.");
			_fileService.Verify(f => f.UploadFileAsync(It.IsAny<IFormFile>(), It.IsAny<string>()), Times.Never);
		}

		// UTCID08: Expected: False -> "Định dạng file hình ảnh không hợp lệ..."
		// QuestionGroupId = 1
		[Trait("Category", "QuestionGroupService_UpdateAsync")]
		[Trait("TestCase", "UTCID08")]
		[Fact]
		public async Task UpdateAsync_WithInvalidImageFormat_ReturnsFailure()
		{
			var groupId = 1;
			var partId = 7;
			var imageFile = CreateMockFile("invalid.zip", "application/zip").Object;
			PrepareUpdateContext(groupId, partId, questionCount: 2, newImage: imageFile);
			SetupReadingPart(partId);
			var dto = BuildUpdateDto(groupId, partId, questionCount: 2, image: imageFile);
			var service = CreateService();

			var result = await service.UpdateAsync(groupId, dto);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Contain("Định dạng file hình ảnh không hợp lệ");
			_fileService.Verify(f => f.UploadFileAsync(It.IsAny<IFormFile>(), It.IsAny<string>()), Times.Never);
		}

		// UTCID09: Expected: False -> "Dung lượng file hình ảnh vượt quá 5MB."
		// QuestionGroupId = 1
		[Trait("Category", "QuestionGroupService_UpdateAsync")]
		[Trait("TestCase", "UTCID09")]
		[Fact]
		public async Task UpdateAsync_WithOversizedImage_ReturnsFailure()
		{
			var groupId = 1;
			var partId = 7;
			var imageFile = CreateMockFile("image.jpg", "image/jpeg", length: 6 * 1024 * 1024).Object;
			PrepareUpdateContext(groupId, partId, questionCount: 2, newImage: imageFile);
			SetupReadingPart(partId);
			var dto = BuildUpdateDto(groupId, partId, questionCount: 2, image: imageFile);
			var service = CreateService();

			var result = await service.UpdateAsync(groupId, dto);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Contain("Dung lượng file hình ảnh vượt quá 5MB.");
			_fileService.Verify(f => f.UploadFileAsync(It.IsAny<IFormFile>(), It.IsAny<string>()), Times.Never);
		}

		// UTCID10: Expected: True -> "Thao tác thành công."
		// QuestionGroupId = 1
		[Trait("Category", "QuestionGroupService_UpdateAsync")]
		[Trait("TestCase", "UTCID10")]
		[Fact]
		public async Task UpdateAsync_ReadingPartWithoutMedia_ReturnsSuccess()
		{
			var groupId = 1;
			var partId = 7;
			PrepareUpdateContext(groupId, partId, questionCount: 2, existingHasAudio: false, existingHasImage: false);
			SetupReadingPart(partId);
			SetupUpdateTransaction();
			var dto = BuildUpdateDto(groupId, partId, questionCount: 2);
			var service = CreateService();

			var result = await service.UpdateAsync(groupId, dto);

			result.IsSuccess.Should().BeTrue();
			result.Data.Should().Be($"QuestionGroup {groupId} updated successfully.");
			_fileService.Verify(f => f.UploadFileAsync(It.IsAny<IFormFile>(), It.IsAny<string>()), Times.Never);
		}

		// UTCID11: Expected: False -> "Các nhãn (label) của đáp án phải là duy nhất..."
		// QuestionGroupId = 1
		[Trait("Category", "QuestionGroupService_UpdateAsync")]
		[Trait("TestCase", "UTCID11")]
		[Fact]
		public async Task UpdateAsync_WithDuplicateLabels_ReturnsFailure()
		{
			var groupId = 1;
			var partId = 7;
			PrepareUpdateContext(groupId, partId, questionCount: 2);
			SetupReadingPart(partId);
			var dto = BuildUpdateDto(groupId, partId, questionCount: 2, questionFactory: i =>
			{
				return new UpdateSingleQuestionDto
				{
					QuestionId = groupId * 100 + i + 1,
					QuestionTypeId = 1,
					PartId = partId,
					Content = "Duplicate label question",
					AnswerOptions = new List<UpdateAnswerOptionDto>
					{
						new() { Label = "A", Content = "Opt 1", IsCorrect = true },
						new() { Label = "A", Content = "Opt 2", IsCorrect = false },
						new() { Label = "C", Content = "Opt 3", IsCorrect = false },
						new() { Label = "D", Content = "Opt 4", IsCorrect = false },
					}
				};
			});
			var service = CreateService();

			var result = await service.UpdateAsync(groupId, dto);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Các nhãn (label) của đáp án phải là duy nhất, không được trùng nhau.");
		}

		// UTCID12: Expected: False -> "Số lượng đáp án phải đúng bằng 4."
		// QuestionGroupId = 1
		[Trait("Category", "QuestionGroupService_UpdateAsync")]
		[Trait("TestCase", "UTCID12")]
		[Fact]
		public async Task UpdateAsync_WithInvalidOptionCount_ReturnsFailure()
		{
			var groupId = 1;
			var partId = 7;
			PrepareUpdateContext(groupId, partId, questionCount: 2);
			SetupReadingPart(partId);
			var dto = BuildUpdateDto(groupId, partId, questionCount: 2, questionFactory: i =>
			{
				return new UpdateSingleQuestionDto
				{
					QuestionId = groupId * 100 + i + 1,
					QuestionTypeId = 1,
					PartId = partId,
					Content = "Invalid option count",
					AnswerOptions = new List<UpdateAnswerOptionDto>
					{
						new() { Label = "A", Content = "Opt 1", IsCorrect = true },
						new() { Label = "B", Content = "Opt 2", IsCorrect = false },
						new() { Label = "C", Content = "Opt 3", IsCorrect = false },
					}
				};
			});
			var service = CreateService();

			var result = await service.UpdateAsync(groupId, dto);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Số lượng đáp án phải đúng bằng 4.");
		}

		// UTCID13: Expected: False -> "Phải có ít nhất một đáp án được chọn là đúng."
		// QuestionGroupId = 1
		[Trait("Category", "QuestionGroupService_UpdateAsync")]
		[Trait("TestCase", "UTCID13")]
		[Fact]
		public async Task UpdateAsync_WithNoCorrectAnswer_ReturnsFailure()
		{
			var groupId = 1;
			var partId = 7;
			PrepareUpdateContext(groupId, partId, questionCount: 2);
			SetupReadingPart(partId);
			var dto = BuildUpdateDto(groupId, partId, questionCount: 2, questionFactory: i =>
			{
				return new UpdateSingleQuestionDto
				{
					QuestionId = groupId * 100 + i + 1,
					QuestionTypeId = 1,
					PartId = partId,
					Content = "No correct answer",
					AnswerOptions = new List<UpdateAnswerOptionDto>
					{
						new() { Label = "A", Content = "Opt 1", IsCorrect = false },
						new() { Label = "B", Content = "Opt 2", IsCorrect = false },
						new() { Label = "C", Content = "Opt 3", IsCorrect = false },
						new() { Label = "D", Content = "Opt 4", IsCorrect = false },
					}
				};
			});
			var service = CreateService();

			var result = await service.UpdateAsync(groupId, dto);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Cần có duy nhất một đáp án đúng.");
		}

		// UTCID14: Expected: False -> ex.Message from exception
		// QuestionGroupId = 1
		[Trait("Category", "QuestionGroupService_UpdateAsync")]
		[Trait("TestCase", "UTCID14")]
		[Fact]
		public async Task UpdateAsync_WhenRepositoryThrows_ReturnsFailureAndRollbackFiles()
		{
			var groupId = 1;
			var partId = 7;
			var audioFile = CreateMockFile("audio.mp3", "audio/mpeg").Object;
			PrepareUpdateContext(groupId, partId, questionCount: 2, newAudio: audioFile);
			SetupReadingPart(partId);
			_uow.Setup(u => u.BeginTransactionAsync()).ReturnsAsync(Mock.Of<IDbContextTransaction>());
			_uow.Setup(u => u.SaveChangesAsync()).ThrowsAsync(new Exception("DB error"));
			_fileService.Setup(f => f.UploadFileAsync(audioFile, "audio")).ReturnsAsync(Result<string>.Success("audio-url"));

			var dto = BuildUpdateDto(groupId, partId, questionCount: 2, audio: audioFile);
			var service = CreateService();
			var result = await service.UpdateAsync(groupId, dto);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Contain("DB error");
			_fileService.Verify(f => f.RollbackAndCleanupAsync(It.Is<List<string>>(l => l.Contains("audio-url"))), Times.Once);
			_uow.Verify(u => u.CommitTransactionAsync(), Times.Never);
		}

		// UTCID15: Expected: False -> "Không tìm thấy nhóm câu hỏi"
		[Trait("Category", "QuestionGroupService_UpdateAsync")]
		[Trait("TestCase", "UTCID15")]
		[Fact]
		public async Task UpdateAsync_WhenGroupNotFound_ReturnsFailure()
		{
			var groupId = 1;
			var partId = 7;
			_questionGroupRepo.Setup(r => r.GetByIdAndStatusAsync(groupId, CommonStatus.Active))
				.ReturnsAsync((QuestionGroup)null!);
			var dto = BuildUpdateDto(groupId, partId);
			var service = CreateService();

			var result = await service.UpdateAsync(groupId, dto);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Không tìm thấy nhóm câu hỏi");
		}

		#endregion
	}
}
