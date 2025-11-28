using System;
using System.Collections.Generic;
using System.Linq;
using FluentAssertions;
using Microsoft.EntityFrameworkCore.Storage;
using Moq;
using Newtonsoft.Json;
using ToeicGenius.Domains.DTOs.Requests.Exam;
using ToeicGenius.Domains.DTOs.Requests.Test;
using ToeicGenius.Domains.DTOs.Responses.Question;
using ToeicGenius.Domains.DTOs.Responses.QuestionGroup;
using ToeicGenius.Domains.DTOs.Responses.Test;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Domains.Enums;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Services.Implementations;
using ToeicGenius.Services.Interfaces;
using ToeicGenius.Shared.Constants;
using ToeicGenius.Shared.Helpers;
using Xunit;

namespace ToeicGenius.Tests.UnitTests
{
	public class TestServiceUnitTests
	{
		private readonly Guid _userId = Guid.NewGuid();
		private readonly Guid _otherUserId = Guid.NewGuid();

		private TestService CreateService(
			out Mock<IUnitOfWork> uowMock,
			out Mock<ITestRepository> testRepoMock,
			out Mock<ITestResultRepository> testResultRepoMock,
			out Mock<IUserAnswerRepository> userAnswerRepoMock)
		{
			var fileServiceMock = new Mock<IFileService>();
			uowMock = new Mock<IUnitOfWork>();
			testRepoMock = new Mock<ITestRepository>();
			testResultRepoMock = new Mock<ITestResultRepository>();
			userAnswerRepoMock = new Mock<IUserAnswerRepository>();

			uowMock.SetupGet(u => u.Tests).Returns(testRepoMock.Object);
			uowMock.SetupGet(u => u.TestResults).Returns(testResultRepoMock.Object);
			uowMock.SetupGet(u => u.UserAnswers).Returns(userAnswerRepoMock.Object);
			uowMock.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);

			return new TestService(uowMock.Object, fileServiceMock.Object);
		}

		private Test CreateTest(
			int testId,
			TestType testType,
			TestSkill skill,
			bool published = true,
			int duration = 60,
			int totalQuestions = 100,
			List<TestQuestion>? questions = null)
		{
			var test = new Test
			{
				TestId = testId,
				Title = $"Test {testId}",
				TestType = testType,
				TestSkill = skill,
				Duration = duration,
				TotalQuestion = totalQuestions,
				VisibilityStatus = published ? TestVisibilityStatus.Published : TestVisibilityStatus.Hidden,
				AudioUrl = "test-audio.mp3",
				CreatedAt = DateTimeHelper.Now.AddDays(-1)
			};

			if (questions != null)
			{
				test.TestQuestions = questions;
				foreach (var question in questions)
				{
					question.TestId = testId;
					question.Test = test;
				}
			}

			return test;
		}

		private TestQuestion CreateSingleQuestion(int id, int partId, int order)
		{
			var snapshot = new QuestionSnapshotDto
			{
				QuestionId = id,
				PartId = partId,
				Content = $"Question {id}"
			};

			return new TestQuestion
			{
				TestQuestionId = id,
				OrderInTest = order,
				PartId = partId,
				Part = new Part { PartId = partId, Name = $"Part {partId}", Description = $"Description {partId}" },
				IsQuestionGroup = false,
				SnapshotJson = JsonConvert.SerializeObject(snapshot)
			};
		}

		private TestQuestion CreateGroupQuestion(int id, int partId, int order)
		{
			var snapshot = new QuestionGroupSnapshotDto
			{
				QuestionGroupId = id,
				PartId = partId,
				Passage = $"Passage {id}",
				QuestionSnapshots = new List<QuestionSnapshotDto>
				{
					new QuestionSnapshotDto { QuestionId = id * 10, PartId = partId, Content = "Grouped question" }
				}
			};

			return new TestQuestion
			{
				TestQuestionId = id,
				OrderInTest = order,
				PartId = partId,
				Part = new Part { PartId = partId, Name = $"Part {partId}", Description = $"Description {partId}" },
				IsQuestionGroup = true,
				SnapshotJson = JsonConvert.SerializeObject(snapshot)
			};
		}

		private TestResult CreateTestResult(int id, int testId, Guid userId, DateTime createdAt, TestResultStatus status = TestResultStatus.InProgress)
		{
			return new TestResult
			{
				TestResultId = id,
				TestId = testId,
				UserId = userId,
				Status = status,
				TestType = TestType.Practice,
				CreatedAt = createdAt,
				IsSelectTime = true
			};
		}

		private static void SetupTransactionMocks(Mock<IUnitOfWork> uowMock)
		{
			var transactionMock = new Mock<IDbContextTransaction>();
			uowMock.Setup(u => u.BeginTransactionAsync()).ReturnsAsync(transactionMock.Object);
			uowMock.Setup(u => u.CommitTransactionAsync()).Returns(Task.CompletedTask);
			uowMock.Setup(u => u.RollbackTransactionAsync()).Returns(Task.CompletedTask);
		}

		#region GetTestStartAsync Tests

		//UTCID01: Test hidden -> returns failure 'Test not found'
		[Trait("Category", "GetTestStartAsync")]
		[Trait("TestCase", "UTCID01")]
		[Fact]
		public async Task UTCID01_GetTestStartAsync_WhenTestNotPublished_ReturnsFailure()
		{
			var service = CreateService(out var uowMock, out var testRepoMock, out var testResultRepoMock, out var userAnswerRepoMock);
			var request = new TestStartRequestDto { Id = 99, IsSelectTime = true };
			testRepoMock.Setup(r => r.GetTestByIdAsync(request.Id))
				.ReturnsAsync(CreateTest(request.Id, TestType.Simulator, TestSkill.LR, published: false));

			var result = await service.GetTestStartAsync(request, _userId);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Test not found");
			testResultRepoMock.Verify(r => r.GetActiveTestByUserAndTestAsync(It.IsAny<Guid>(), It.IsAny<int>()), Times.Never);
			userAnswerRepoMock.Verify(r => r.GetByTestResultIdAsync(It.IsAny<int>()), Times.Never);
		}

		//UTCID02: Practice test without timer -> duration set to 0 and new session created
		[Trait("Category", "GetTestStartAsync")]
		[Trait("TestCase", "UTCID02")]
		[Fact]
		public async Task UTCID02_GetTestStartAsync_PracticeWithoutTimer_CreatesNewSessionWithZeroDuration()
		{
			var service = CreateService(out var uowMock, out var testRepoMock, out var testResultRepoMock, out var userAnswerRepoMock);
			var test = CreateTest(1, TestType.Practice, TestSkill.LR, published: true, totalQuestions: 25, questions: new List<TestQuestion>());
			testRepoMock.Setup(r => r.GetTestByIdAsync(test.TestId)).ReturnsAsync(test);
			testResultRepoMock.Setup(r => r.GetActiveTestByUserAndTestAsync(_userId, test.TestId))
				.ReturnsAsync((TestResult)null!);
			testResultRepoMock.Setup(r => r.AddAsync(It.IsAny<TestResult>()))
				.ReturnsAsync((TestResult tr) =>
				{
					tr.TestResultId = 10;
					return tr;
				});
			userAnswerRepoMock.Setup(r => r.GetByTestResultIdAsync(10))
				.ReturnsAsync(new List<UserAnswer>());

			var request = new TestStartRequestDto { Id = test.TestId, IsSelectTime = false };

			var result = await service.GetTestStartAsync(request, _userId);

			result.IsSuccess.Should().BeTrue();
			result.Data!.Duration.Should().Be(0);
			result.Data.TestResultId.Should().Be(10);
			result.Data.Parts.Should().BeEmpty();
			testResultRepoMock.Verify(r => r.AddAsync(It.IsAny<TestResult>()), Times.Once);
			userAnswerRepoMock.Verify(r => r.GetByTestResultIdAsync(10), Times.Once);
		}

		//UTCID03: Existing in-progress session reused -> returns saved answers and mapped parts
		[Trait("Category", "GetTestStartAsync")]
		[Trait("TestCase", "UTCID03")]
		[Fact]
		public async Task UTCID03_GetTestStartAsync_WithExistingSession_ReturnsPartsAndSavedAnswers()
		{
			var service = CreateService(out var uowMock, out var testRepoMock, out var testResultRepoMock, out var userAnswerRepoMock);
			var questions = new List<TestQuestion>
			{
				CreateSingleQuestion(101, partId: 1, order: 1),
				CreateGroupQuestion(202, partId: 2, order: 2)
			};
			var test = CreateTest(2, TestType.Practice, TestSkill.LR, published: true, totalQuestions: 2, questions: questions);
			testRepoMock.Setup(r => r.GetTestByIdAsync(test.TestId)).ReturnsAsync(test);

			var existingResult = CreateTestResult(55, test.TestId, _userId, DateTimeHelper.Now.AddMinutes(-10));
			testResultRepoMock.Setup(r => r.GetActiveTestByUserAndTestAsync(_userId, test.TestId))
				.ReturnsAsync(existingResult);

			var savedAnswers = new List<UserAnswer>
			{
				new UserAnswer { TestResultId = 55, TestQuestionId = 101, ChosenOptionLabel = "A", CreatedAt = DateTimeHelper.Now.AddMinutes(-5) },
				new UserAnswer { TestResultId = 55, TestQuestionId = 202, AnswerText = "Essay", SubQuestionIndex = 1, CreatedAt = DateTimeHelper.Now.AddMinutes(-4) }
			};
			userAnswerRepoMock.Setup(r => r.GetByTestResultIdAsync(55)).ReturnsAsync(savedAnswers);

			var request = new TestStartRequestDto { Id = test.TestId, IsSelectTime = true };

			var result = await service.GetTestStartAsync(request, _userId);

			result.IsSuccess.Should().BeTrue();
			result.Data!.TestResultId.Should().Be(55);
			result.Data.Duration.Should().Be(test.Duration);
			result.Data.Parts.Should().HaveCount(2);
			result.Data.Parts.Single(p => p.PartId == 1).TestQuestions.Should()
				.ContainSingle(q => !q.IsGroup && q.TestQuestionId == 101);
			result.Data.Parts.Single(p => p.PartId == 2).TestQuestions.Should()
				.ContainSingle(q => q.IsGroup && q.TestQuestionId == 202);
			result.Data.SavedAnswers.Should().HaveCount(2);
			result.Data.SavedAnswers.Should().Contain(sa => sa.TestQuestionId == 101 && sa.ChosenOptionLabel == "A");
			result.Data.SavedAnswers.Should().Contain(sa => sa.TestQuestionId == 202 && sa.SubQuestionIndex == 1);
			testResultRepoMock.Verify(r => r.AddAsync(It.IsAny<TestResult>()), Times.Never);
		}

		//UTCID04: Expired LR session triggers auto SubmitLRTestAsync and creates new session
		[Trait("Category", "GetTestStartAsync")]
		[Trait("TestCase", "UTCID04")]
		[Fact]
		public async Task UTCID04_GetTestStartAsync_ExpiredListeningReadingSession_CreatesFreshSession()
		{
			var service = CreateService(out var uowMock, out var testRepoMock, out var testResultRepoMock, out var userAnswerRepoMock);
			var test = CreateTest(3, TestType.Simulator, TestSkill.LR, published: true, duration: 30, questions: new List<TestQuestion>());
			testRepoMock.Setup(r => r.GetTestByIdAsync(test.TestId)).ReturnsAsync(test);

			var existingResult = CreateTestResult(70, test.TestId, _userId,
				DateTimeHelper.Now.AddMinutes(-(test.Duration + 10)));
			testResultRepoMock.Setup(r => r.GetActiveTestByUserAndTestAsync(_userId, test.TestId))
				.ReturnsAsync(existingResult);

			testResultRepoMock.Setup(r => r.AddAsync(It.IsAny<TestResult>()))
				.ReturnsAsync((TestResult tr) =>
				{
					tr.TestResultId = 80;
					return tr;
				});
			userAnswerRepoMock.Setup(r => r.GetByTestResultIdAsync(80))
				.ReturnsAsync(new List<UserAnswer>());

			var request = new TestStartRequestDto { Id = test.TestId, IsSelectTime = true };

			var result = await service.GetTestStartAsync(request, _userId);

			result.IsSuccess.Should().BeTrue();
			result.Data!.TestResultId.Should().Be(80);
			result.Data.SavedAnswers.Should().BeEmpty();
			testResultRepoMock.Verify(r => r.AddAsync(It.IsAny<TestResult>()), Times.Once);
			userAnswerRepoMock.Verify(r => r.GetByTestResultIdAsync(80), Times.Once);
		}

		//UTCID05: Expired non-LR session marks old result graded and creates new session
		[Trait("Category", "GetTestStartAsync")]
		[Trait("TestCase", "UTCID05")]
		[Fact]
		public async Task UTCID05_GetTestStartAsync_ExpiredNonListeningSession_MarksPreviousAndCreatesNew()
		{
			var service = CreateService(out var uowMock, out var testRepoMock, out var testResultRepoMock, out var userAnswerRepoMock);
			var test = CreateTest(4, TestType.Practice, TestSkill.Speaking, published: true, duration: 45, questions: new List<TestQuestion>());
			testRepoMock.Setup(r => r.GetTestByIdAsync(test.TestId)).ReturnsAsync(test);

			var elapsedMinutes = test.Duration + 12;
			var existingResult = CreateTestResult(90, test.TestId, _userId,
				DateTimeHelper.Now.AddMinutes(-elapsedMinutes));
			testResultRepoMock.Setup(r => r.GetActiveTestByUserAndTestAsync(_userId, test.TestId))
				.ReturnsAsync(existingResult);

			testResultRepoMock.Setup(r => r.AddAsync(It.IsAny<TestResult>()))
				.ReturnsAsync((TestResult tr) =>
				{
					tr.TestResultId = 95;
					return tr;
				});
			userAnswerRepoMock.Setup(r => r.GetByTestResultIdAsync(95))
				.ReturnsAsync(new List<UserAnswer>());

			var request = new TestStartRequestDto { Id = test.TestId, IsSelectTime = true };

			var result = await service.GetTestStartAsync(request, _userId);

			result.IsSuccess.Should().BeTrue();
			result.Data!.TestResultId.Should().Be(95);
			existingResult.Status.Should().Be(TestResultStatus.Graded);
			existingResult.Duration.Should().Be(elapsedMinutes);
			existingResult.UpdatedAt.Should().NotBeNull();
			uowMock.Verify(u => u.SaveChangesAsync(), Times.Exactly(2));
			userAnswerRepoMock.Verify(r => r.GetByTestResultIdAsync(95), Times.Once);
		}

		#endregion

		#region CreateFromBankAsync Tests
		//Hepler method

		// UTCID01: Both single question and question group are null 
		// Expected: False -> "Must provide single question id or group question id"
		// Input:userId="11111111-1111-1111-1111-111111111111", Title ="Example title", TestSkill=3, Description="Example description", Duration=60, SingleQuestionIds=null, QuestionGroupIds=null
		[Trait("Category", "CreateFromBankAsync")]
		[Trait("TestCase", "UTCID01")]
		[Fact]
		public async Task UTCID01_CreateFromBankAsync_WhenNoQuestionsProvided_ReturnsFailure()
		{
			var service = CreateService(out var uowMock, out _, out _, out _);
			SetupTransactionMocks(uowMock);

			var dto = new CreateTestFromBankDto
			{
				Title = "Example title",
				TestSkill = TestSkill.LR,
				Description = "Example description",
				Duration = 60,
				SingleQuestionIds = null,
				GroupQuestionIds = null
			};

			var result = await service.CreateFromBankAsync(_userId, dto);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Must provide single question id or group question id");
			uowMock.Verify(u => u.Tests.AddAsync(It.IsAny<Test>()), Times.Never);
			uowMock.Verify(u => u.CommitTransactionAsync(), Times.Never);
			uowMock.Verify(u => u.RollbackTransactionAsync(), Times.Never);
		}

		// UTCID02: Not found part
		// Expected: False -> "Question 1: Part 20 not found"
		// Input: userId="11111111-1111-1111-1111-111111111111",Title ="Example title", TestSkill=2, Description="Example description", Duration=60, SingleQuestionIds=List<int> with questionId have not found partId, QuestionGroupIds=null
		[Trait("Category", "CreateFromBankAsync")]
		[Trait("TestCase", "UTCID02")]
		[Fact]
		public async Task UTCID02_CreateFromBankAsync_WhenSingleQuestionPartNotFound_ReturnsFailure()
		{
			var service = CreateService(out var uowMock, out _, out _, out _);
			SetupTransactionMocks(uowMock);

			var questionRepoMock = new Mock<IQuestionRepository>();
			var partRepoMock = new Mock<IPartRepository>();
			uowMock.SetupGet(u => u.Questions).Returns(questionRepoMock.Object);
			uowMock.SetupGet(u => u.Parts).Returns(partRepoMock.Object);

			var question = new Question
			{
				QuestionId = 1,
				PartId = 20
			};

			questionRepoMock.Setup(r => r.GetByListIdAsync(It.IsAny<List<int>>()))
				.ReturnsAsync(new List<QuestionSnapshotDto>
				{
					new QuestionSnapshotDto
					{
						QuestionId = question.QuestionId,
						PartId = question.PartId
					}
				});
			// Mock Part repository inside ValidatePartForTestSkillAsync (returns null)
			uowMock.SetupGet(u => u.Parts).Returns(partRepoMock.Object);
			partRepoMock.Setup(r => r.GetByIdAsync(20)).ReturnsAsync((Part?)null);

			// ValidatePartForTestSkillAsync sẽ trả về "Part 20 not found"
			var dto = new CreateTestFromBankDto
			{
				Title = "Example title",
				TestSkill = TestSkill.Writing,
				Description = "Example description",
				Duration = 60,
				SingleQuestionIds = new List<int> { 1 },
				GroupQuestionIds = null
			};

			var result = await service.CreateFromBankAsync(_userId, dto);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Contain("Part 20 not found");
			uowMock.Verify(u => u.Tests.AddAsync(It.IsAny<Test>()), Times.Never);
			uowMock.Verify(u => u.RollbackTransactionAsync(), Times.Never);
		}

		// UTCID03: Question have partId mismatch TestSkill
		// Expected: False -> "Question 1: Part 1 (L-Part 1) is not a Writing part. TestSkill is Writing but Part skill is Listening"
		// Input: userId="11111111-1111-1111-1111-111111111111",Title ="Example title", TestSkill=2, Description="Example description", Duration=60, 
		// SingleQuestionIds=List<int> with questionId have partId mismatch TestSkill.Writing, QuestionGroupIds=null
		[Trait("Category", "CreateFromBankAsync")]
		[Trait("TestCase", "UTCID03")]
		[Fact]
		public async Task UTCID03_CreateFromBankAsync_WhenSingleQuestionSkillMismatch_ReturnsFailure()
		{
			var service = CreateService(out var uowMock, out _, out _, out _);
			SetupTransactionMocks(uowMock);

			var questionRepoMock = new Mock<IQuestionRepository>();
			var partRepoMock = new Mock<IPartRepository>();
			uowMock.SetupGet(u => u.Questions).Returns(questionRepoMock.Object);
			uowMock.SetupGet(u => u.Parts).Returns(partRepoMock.Object);

			// Part 1: Listening
			partRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(new Part
			{
				PartId = 1,
				Name = "L-Part 1",
				Skill = QuestionSkill.Listening
			});

			questionRepoMock.Setup(r => r.GetByListIdAsync(It.IsAny<List<int>>()))
				.ReturnsAsync(new List<QuestionSnapshotDto>
				{
					new QuestionSnapshotDto
					{
						QuestionId = 1,
						PartId = 1
					}
				});

			var dto = new CreateTestFromBankDto
			{
				Title = "Example title",
				TestSkill = TestSkill.Writing,
				Description = "Example description",
				Duration = 60,
				SingleQuestionIds = new List<int> { 1 },
				GroupQuestionIds = null
			};

			var result = await service.CreateFromBankAsync(_userId, dto);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Question 1: Part 1 (L-Part 1) is not a Writing part. TestSkill is Writing but Part skill is Listening");
			uowMock.Verify(u => u.Tests.AddAsync(It.IsAny<Test>()), Times.Never);
			uowMock.Verify(u => u.RollbackTransactionAsync(), Times.Never);
		}

		// UTCID04: Not found part
		// Expected: False -> "QuestionGroup 2: Part 20 not found"
		// Input: userId="11111111-1111-1111-1111-111111111111",Title ="Example title", TestSkill=2, Description="Example description", Duration=60, 
		// SingleQuestionIds=null, QuestionGroupIds=List<int> with questionGroupId have not found partId
		[Trait("Category", "CreateFromBankAsync")]
		[Trait("TestCase", "UTCID04")]
		[Fact]
		public async Task UTCID04_CreateFromBankAsync_WhenGroupQuestionPartNotFound_ReturnsFailure()
		{
			var service = CreateService(out var uowMock, out _, out _, out _);
			SetupTransactionMocks(uowMock);

			var groupRepoMock = new Mock<IQuestionGroupRepository>();
			var partRepoMock = new Mock<IPartRepository>();
			uowMock.SetupGet(u => u.Parts).Returns(partRepoMock.Object);

			uowMock.SetupGet(u => u.QuestionGroups).Returns(groupRepoMock.Object);

			groupRepoMock.Setup(r => r.GetByListIdAsync(It.IsAny<List<int>>()))
				.ReturnsAsync(new List<QuestionGroupSnapshotDto>
				{
					new QuestionGroupSnapshotDto
					{
						QuestionGroupId = 2,
						PartId = 20
					}
				});

			var dto = new CreateTestFromBankDto
			{
				Title = "Example title",
				TestSkill = TestSkill.Writing,
				Description = "Example description",
				Duration = 60,
				SingleQuestionIds = null,
				GroupQuestionIds = new List<int> { 2 }
			};

			var result = await service.CreateFromBankAsync(_userId, dto);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Contain("QuestionGroup 2: Part 20 not found");
			uowMock.Verify(u => u.Tests.AddAsync(It.IsAny<Test>()), Times.Never);
			uowMock.Verify(u => u.RollbackTransactionAsync(), Times.Never);
		}

		// UTCID05: Question have partId mismatch TestSkill
		// Expected: False -> "Question Group 2: Part 3 (L-Part 3) is not a Speaking part. TestSkill is Speaking but Part skill is Listening"
		// Input: userId="11111111-1111-1111-1111-111111111111",Title ="Example title", TestSkill=2, Description="Example description", Duration=60, 
		// SingleQuestionIds=null, QuestionGroupIds=List<int> with questionGroupId have partId mismatch
		[Trait("Category", "CreateFromBankAsync")]
		[Trait("TestCase", "UTCID05")]
		[Fact]
		public async Task UTCID05_CreateFromBankAsync_WhenGroupQuestionSkillMismatch_ReturnsFailure()
		{
			var service = CreateService(out var uowMock, out _, out _, out _);
			SetupTransactionMocks(uowMock);

			var groupRepoMock = new Mock<IQuestionGroupRepository>();
			var partRepoMock = new Mock<IPartRepository>();
			uowMock.SetupGet(u => u.QuestionGroups).Returns(groupRepoMock.Object);
			uowMock.SetupGet(u => u.Parts).Returns(partRepoMock.Object);

			partRepoMock.Setup(r => r.GetByIdAsync(3)).ReturnsAsync(new Part
			{
				PartId = 3,
				Name = "L-Part 3",
				Skill = QuestionSkill.Listening
			});

			groupRepoMock.Setup(r => r.GetByListIdAsync(It.IsAny<List<int>>()))
				.ReturnsAsync(new List<QuestionGroupSnapshotDto>
				{
					new QuestionGroupSnapshotDto
					{
						QuestionGroupId = 2,
						PartId = 3
					}
				});

			var dto = new CreateTestFromBankDto
			{
				Title = "Example title",
				TestSkill = TestSkill.Speaking,
				Description = "Example description",
				Duration = 60,
				SingleQuestionIds = null,
				GroupQuestionIds = new List<int> { 2 }
			};

			var result = await service.CreateFromBankAsync(_userId, dto);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("QuestionGroup 2: Part 3 (L-Part 3) is not a Speaking part. TestSkill is Speaking but Part skill is Listening");
			uowMock.Verify(u => u.Tests.AddAsync(It.IsAny<Test>()), Times.Never);
			uowMock.Verify(u => u.RollbackTransactionAsync(), Times.Never);
		}

		// UTCID06: Successful creation with single questions only
		// Expected: True -> "Created successfully (testId: 1)"
		// Input: userId="11111111-1111-1111-1111-111111111111",Title ="Example title", TestSkill=3, Description="Example description", Duration=60, 
		// SingleQuestionIds=List<int> with questionId valid, QuestionGroupIds=null
		[Trait("Category", "CreateFromBankAsync")]
		[Trait("TestCase", "UTCID06")]
		[Fact]
		public async Task UTCID06_CreateFromBankAsync_WhenOnlySingleQuestions_CreatesSuccessfully()
		{
			var service = CreateService(out var uowMock, out _, out _, out _);

			SetupTransactionMocks(uowMock);

			// Mock repositories
			var questionRepoMock = new Mock<IQuestionRepository>();
			var partRepoMock = new Mock<IPartRepository>();
			var testRepoMock = new Mock<ITestRepository>();

			uowMock.SetupGet(u => u.Questions).Returns(questionRepoMock.Object);
			uowMock.SetupGet(u => u.Parts).Returns(partRepoMock.Object);
			uowMock.SetupGet(u => u.Tests).Returns(testRepoMock.Object);

			partRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(new Part
			{
				PartId = 1,
				Name = "L-Part 1",
				Skill = QuestionSkill.Reading
			});
			questionRepoMock.Setup(r => r.GetByListIdAsync(It.IsAny<List<int>>()))
				.ReturnsAsync(new List<QuestionSnapshotDto>
				{
					new QuestionSnapshotDto { QuestionId = 1, PartId = 1 },
					new QuestionSnapshotDto { QuestionId = 2, PartId = 1 }
				});
			// Trường hợp AddAsync trả về Task
			testRepoMock.Setup(r => r.AddAsync(It.IsAny<Test>()))
	.ReturnsAsync((Test t) => t); // trả về chính test được thêm
			var testQuestionRepoMock = new Mock<ITestQuestionRepository>();
			uowMock.SetupGet(u => u.TestQuestions).Returns(testQuestionRepoMock.Object);
			testQuestionRepoMock.Setup(r => r.AddRangeAsync(It.IsAny<List<TestQuestion>>()))
				.Returns(Task.CompletedTask);

			var dto = new CreateTestFromBankDto
			{
				Title = "Example title",
				TestSkill = TestSkill.LR,
				Description = "Example description",
				Duration = 60,
				SingleQuestionIds = new List<int> { 1, 2 },
				GroupQuestionIds = null
			};

			var result = await service.CreateFromBankAsync(_userId, dto);

			result.IsSuccess.Should().BeTrue();
			result.Data.Should().Contain("Created successfully (testId:");
			uowMock.Verify(u => u.Tests.AddAsync(It.IsAny<Test>()), Times.Once);
			uowMock.Verify(u => u.CommitTransactionAsync(), Times.Once);
		}

		// UTCID07: Successful creation with group questions only
		// Expected: True -> "Created successfully (testId: 1)"
		// Input: userId="11111111-1111-1111-1111-111111111111",Title ="Example title", TestSkill=3, Description="Example description", Duration=60, 
		// SingleQuestionIds=null, QuestionGroupIds=List<int> with questionGroupId valid
		[Trait("Category", "CreateFromBankAsync")]
		[Trait("TestCase", "UTCID07")]
		[Fact]
		public async Task UTCID07_CreateFromBankAsync_WhenOnlyGroupQuestions_CreatesSuccessfully()
		{
			var service = CreateService(out var uowMock, out _, out _, out _);
			SetupTransactionMocks(uowMock);

			// Mock repositories
			var questionRepoMock = new Mock<IQuestionRepository>();
			var partRepoMock = new Mock<IPartRepository>();
			var testRepoMock = new Mock<ITestRepository>();
			var groupRepoMock = new Mock<IQuestionGroupRepository>();
			var testQuestionRepoMock = new Mock<ITestQuestionRepository>();

			uowMock.SetupGet(u => u.QuestionGroups).Returns(groupRepoMock.Object);
			uowMock.SetupGet(u => u.Questions).Returns(questionRepoMock.Object);
			uowMock.SetupGet(u => u.Parts).Returns(partRepoMock.Object);
			uowMock.SetupGet(u => u.Tests).Returns(testRepoMock.Object);
			uowMock.SetupGet(u => u.TestQuestions).Returns(testQuestionRepoMock.Object);

			partRepoMock.Setup(r => r.GetByIdAsync(2)).ReturnsAsync(new Part
			{
				PartId =2,
				Name = "L-Part 2",
				Skill = QuestionSkill.Reading
			});
			testRepoMock.Setup(r => r.AddAsync(It.IsAny<Test>()))
				.ReturnsAsync((Test t) => t); // trả về chính test được thêm
			testQuestionRepoMock.Setup(r => r.AddRangeAsync(It.IsAny<List<TestQuestion>>()))
				.Returns(Task.CompletedTask);
			groupRepoMock.Setup(r => r.GetByListIdAsync(It.IsAny<List<int>>()))
				.ReturnsAsync(new List<QuestionGroupSnapshotDto>
				{
					new QuestionGroupSnapshotDto
					{
						QuestionGroupId = 1,
						PartId = 2,
						QuestionSnapshots = new List<QuestionSnapshotDto>
						{
							new QuestionSnapshotDto { QuestionId = 10, PartId = 2 },
							new QuestionSnapshotDto { QuestionId = 11, PartId = 2 }
						}
					}
				});

			var dto = new CreateTestFromBankDto
			{
				Title = "Example title",
				TestSkill = TestSkill.LR,
				Description = "Example description",
				Duration = 60,
				SingleQuestionIds = null,
				GroupQuestionIds = new List<int> { 1 }
			};

			var result = await service.CreateFromBankAsync(_userId, dto);

			result.IsSuccess.Should().BeTrue();
			result.Data.Should().Contain("Created successfully (testId:");
			uowMock.Verify(u => u.Tests.AddAsync(It.IsAny<Test>()), Times.Once);
			uowMock.Verify(u => u.CommitTransactionAsync(), Times.Once);
		}

		// UTCID08: Successful creation with both single and group questions 
		// Expected: True -> "Created successfully (testId: 1)"
		// Input: userId="11111111-1111-1111-1111-111111111111",Title ="Example title", TestSkill=3, Description="Example description", Duration=60, 
		// SingleQuestionIds=List<int> with questionGroupId valid, QuestionGroupIds=List<int> with questionGroupId valid
		[Trait("Category", "CreateFromBankAsync")]
		[Trait("TestCase", "UTCID08")]
		[Fact]
		public async Task UTCID08_CreateFromBankAsync_WhenSingleAndGroupQuestions_CreatesSuccessfully()
		{
			var service = CreateService(out var uowMock, out _, out _, out _);
			SetupTransactionMocks(uowMock);

			// Mock repositories
			var questionRepoMock = new Mock<IQuestionRepository>();
			var partRepoMock = new Mock<IPartRepository>();
			var testRepoMock = new Mock<ITestRepository>();
			var groupRepoMock = new Mock<IQuestionGroupRepository>();
			var testQuestionRepoMock = new Mock<ITestQuestionRepository>();

			uowMock.SetupGet(u => u.QuestionGroups).Returns(groupRepoMock.Object);
			uowMock.SetupGet(u => u.Questions).Returns(questionRepoMock.Object);
			uowMock.SetupGet(u => u.Parts).Returns(partRepoMock.Object);
			uowMock.SetupGet(u => u.Tests).Returns(testRepoMock.Object);
			uowMock.SetupGet(u => u.TestQuestions).Returns(testQuestionRepoMock.Object);

			partRepoMock.Setup(r => r.GetByIdAsync(2)).ReturnsAsync(new Part
			{
				PartId =2,
				Name = "L-Part 2",
				Skill = QuestionSkill.Listening
			});
			partRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(new Part
			{
				PartId =1,
				Name = "L-Part 1",
				Skill = QuestionSkill.Listening
			});
			questionRepoMock.Setup(r => r.GetByListIdAsync(It.IsAny<List<int>>()))
				.ReturnsAsync(new List<QuestionSnapshotDto>
				{
					new QuestionSnapshotDto { QuestionId = 1, PartId = 1 }
				});

			groupRepoMock.Setup(r => r.GetByListIdAsync(It.IsAny<List<int>>()))
				.ReturnsAsync(new List<QuestionGroupSnapshotDto>
				{
					new QuestionGroupSnapshotDto
					{
						QuestionGroupId = 2,
						PartId = 2,
						QuestionSnapshots = new List<QuestionSnapshotDto>
						{
							new QuestionSnapshotDto { QuestionId = 10, PartId = 2 }
						}
					}
				});

			var dto = new CreateTestFromBankDto
			{
				Title = "Example title",
				TestSkill = TestSkill.LR,
				Description = "Example description",
				Duration = 60,
				SingleQuestionIds = new List<int> { 1 },
				GroupQuestionIds = new List<int> { 2 }
			};

			var result = await service.CreateFromBankAsync(_userId, dto);

			result.IsSuccess.Should().BeTrue();
			result.Data.Should().Contain("Created successfully (testId:");
			uowMock.Verify(u => u.Tests.AddAsync(It.IsAny<Test>()), Times.Once);
			uowMock.Verify(u => u.CommitTransactionAsync(), Times.Once);
		}

		// UTCID09: ex.Message when saving changes to database
		// Expected: FALSE -> "Created successfully (testId: 1)"
		// Input: userId="11111111-1111-1111-1111-111111111111",Title ="Example title", TestSkill=1, Description="Example description", Duration=60, 
		// SingleQuestionIds=List<int> with questionGroupId valid, QuestionGroupIds=null
		[Trait("Category", "CreateFromBankAsync")]
		[Trait("TestCase", "UTCID09")]
		[Fact]
		public async Task UTCID09_CreateFromBankAsync_WhenSaveChangesThrows_ReturnsFailure()
		{
			var service = CreateService(out var uowMock, out _, out _, out _);
			SetupTransactionMocks(uowMock);

			// Mock repositories
			var questionRepoMock = new Mock<IQuestionRepository>();
			var partRepoMock = new Mock<IPartRepository>();
			var testRepoMock = new Mock<ITestRepository>();
			var groupRepoMock = new Mock<IQuestionGroupRepository>();
			var testQuestionRepoMock = new Mock<ITestQuestionRepository>();

			uowMock.SetupGet(u => u.QuestionGroups).Returns(groupRepoMock.Object);
			uowMock.SetupGet(u => u.Questions).Returns(questionRepoMock.Object);
			uowMock.SetupGet(u => u.Parts).Returns(partRepoMock.Object);
			uowMock.SetupGet(u => u.Tests).Returns(testRepoMock.Object);
			uowMock.SetupGet(u => u.TestQuestions).Returns(testQuestionRepoMock.Object);

			partRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(new Part
			{
				PartId =1,
				Name = "L-Part 1",
				Skill = QuestionSkill.Listening
			});

			questionRepoMock.Setup(r => r.GetByListIdAsync(It.IsAny<List<int>>()))
				.ReturnsAsync(new List<QuestionSnapshotDto>
				{
					new QuestionSnapshotDto { QuestionId = 1, PartId = 1 }
				});

			uowMock.Setup(u => u.SaveChangesAsync()).ThrowsAsync(new Exception("Database error"));

			var dto = new CreateTestFromBankDto
			{
				Title = "Example title",
				TestSkill = TestSkill.LR,
				Description = "Example description",
				Duration = 60,
				SingleQuestionIds = new List<int> { 1 },
				GroupQuestionIds = null
			};

			var result = await service.CreateFromBankAsync(_userId, dto);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Contain("Database error");
			uowMock.Verify(u => u.RollbackTransactionAsync(), Times.Once);
		}

		// UTCID10: Question have partId mismatch TestSkill.Speaking
		// Expected: FALSE -> "Question 1: Part 1 (L-Part 1) is not a Speaking part. TestSkill is Speaking but Part skill is Listening"
		// Input: userId="11111111-1111-1111-1111-111111111111",Title ="Example title", TestSkill=1, Description="Example description", Duration=60, 
		// SingleQuestionIds=List<int> with questionId have partId mismatch TestSkill.Speaking, QuestionGroupIds=null
		[Trait("Category", "CreateFromBankAsync")]
		[Trait("TestCase", "UTCID10")]
		[Fact]
		public async Task UTCID10_CreateFromBankAsync_WhenSingleQuestionSkillMismatchSpeaking_ReturnsFailure()
		{
			var service = CreateService(out var uowMock, out _, out _, out _);
			SetupTransactionMocks(uowMock);

			// Mock repositories
			var questionRepoMock = new Mock<IQuestionRepository>();
			var partRepoMock = new Mock<IPartRepository>();
			var testRepoMock = new Mock<ITestRepository>();
			var groupRepoMock = new Mock<IQuestionGroupRepository>();
			var testQuestionRepoMock = new Mock<ITestQuestionRepository>();

			uowMock.SetupGet(u => u.QuestionGroups).Returns(groupRepoMock.Object);
			uowMock.SetupGet(u => u.Questions).Returns(questionRepoMock.Object);
			uowMock.SetupGet(u => u.Parts).Returns(partRepoMock.Object);
			uowMock.SetupGet(u => u.Tests).Returns(testRepoMock.Object);
			uowMock.SetupGet(u => u.TestQuestions).Returns(testQuestionRepoMock.Object);

			partRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(new Part
			{
				PartId =1,
				Name = "L-Part 1",
				Skill = QuestionSkill.Listening
			});

			questionRepoMock.Setup(r => r.GetByListIdAsync(It.IsAny<List<int>>()))
				.ReturnsAsync(new List<QuestionSnapshotDto>
				{
					new QuestionSnapshotDto { QuestionId = 1, PartId = 1 }
				});

			var dto = new CreateTestFromBankDto
			{
				Title = "Example title",
				TestSkill = TestSkill.Speaking,
				Description = "Example description",
				Duration = 60,
				SingleQuestionIds = new List<int> { 1 },
				GroupQuestionIds = null
			};

			var result = await service.CreateFromBankAsync(_userId, dto);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Question 1: Part 1 (L-Part 1) is not a Speaking part. TestSkill is Speaking but Part skill is Listening");
			uowMock.Verify(u => u.Tests.AddAsync(It.IsAny<Test>()), Times.Never);
			uowMock.Verify(u => u.RollbackTransactionAsync(), Times.Never);
		}

		// UTCID11: Question have partId mismatch TestSkill.LR
		// Expected: FALSE -> "Question 1: Part 8 (S-Part 1) is not a LR part. TestSkill is LR but Part skill is Speaking"
		// Input: userId="11111111-1111-1111-1111-111111111111",Title ="Example title", TestSkill=3, Description="Example description", Duration=60, 
		// SingleQuestionIds=List<int> with questionId have partId mismatch TestSkill.LR, QuestionGroupIds=null
		[Trait("Category", "CreateFromBankAsync")]
		[Trait("TestCase", "UTCID11")]
		[Fact]
		public async Task UTCID11_CreateFromBankAsync_WhenSingleQuestionSkillMismatchLR_ReturnsFailure()
		{
			var service = CreateService(out var uowMock, out _, out _, out _);
			SetupTransactionMocks(uowMock);

			var questionRepoMock = new Mock<IQuestionRepository>();
			var partRepoMock = new Mock<IPartRepository>();
			uowMock.SetupGet(u => u.Questions).Returns(questionRepoMock.Object);
			uowMock.SetupGet(u => u.Parts).Returns(partRepoMock.Object);

			partRepoMock.Setup(r => r.GetByIdAsync(8)).ReturnsAsync(new Part
			{
				PartId = 8,
				Name = "S-Part 1",
				Skill = QuestionSkill.Speaking
			});

			questionRepoMock.Setup(r => r.GetByListIdAsync(It.IsAny<List<int>>()))
				.ReturnsAsync(new List<QuestionSnapshotDto>
				{
					new QuestionSnapshotDto { QuestionId = 1, PartId = 8 }
				});

			var dto = new CreateTestFromBankDto
			{
				Title = "Example title",
				TestSkill = TestSkill.LR,
				Description = "Example description",
				Duration = 60,
				SingleQuestionIds = new List<int> { 1 },
				GroupQuestionIds = null
			};

			var result = await service.CreateFromBankAsync(_userId, dto);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Question 1: Part 8 (S-Part 1) is not a Listening or Reading part. TestSkill is LR but Part skill is Speaking");
			uowMock.Verify(u => u.Tests.AddAsync(It.IsAny<Test>()), Times.Never);
			uowMock.Verify(u => u.RollbackTransactionAsync(), Times.Never);
		}

		// UTCID12: "Invalid TestSkill: 999"
		// Expected: FALSE -> "Invalid TestSkill: 999"
		// Input: userId="11111111-1111-1111-1111-111111111111",Title ="Example title", TestSkill=999, Description="Example description", Duration=60, 
		// SingleQuestionIds=List<int> with questionId valid, QuestionGroupIds=null
		[Trait("Category", "CreateFromBankAsync")]
		[Trait("TestCase", "UTCID12")]
		[Fact]
		public async Task UTCID12_CreateFromBankAsync_WhenInvalidTestSkill_ReturnsFailure()
		{
			var service = CreateService(out var uowMock, out _, out _, out _);
			SetupTransactionMocks(uowMock);

			// Mock repositories
			var questionRepoMock = new Mock<IQuestionRepository>();
			var partRepoMock = new Mock<IPartRepository>();
			var testRepoMock = new Mock<ITestRepository>();
			var groupRepoMock = new Mock<IQuestionGroupRepository>();
			var testQuestionRepoMock = new Mock<ITestQuestionRepository>();

			uowMock.SetupGet(u => u.QuestionGroups).Returns(groupRepoMock.Object);
			uowMock.SetupGet(u => u.Questions).Returns(questionRepoMock.Object);
			uowMock.SetupGet(u => u.Parts).Returns(partRepoMock.Object);
			uowMock.SetupGet(u => u.Tests).Returns(testRepoMock.Object);
			uowMock.SetupGet(u => u.TestQuestions).Returns(testQuestionRepoMock.Object);

			partRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(new Part
			{
				PartId =1,
				Name = "L-Part 1",
				Skill = QuestionSkill.Listening,
			});

			questionRepoMock.Setup(r => r.GetByListIdAsync(It.IsAny<List<int>>()))
				.ReturnsAsync(new List<QuestionSnapshotDto>
				{
					new QuestionSnapshotDto { QuestionId = 1, PartId = 1 }
				});

			var dto = new CreateTestFromBankDto
			{
				Title = "Example title",
				TestSkill = (TestSkill)999,
				Description = "Example description",
				Duration = 60,
				SingleQuestionIds = new List<int> { 1 },
				GroupQuestionIds = null
			};

			var result = await service.CreateFromBankAsync(_userId, dto);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Invalid TestSkill: 999");
			uowMock.Verify(u => u.Tests.AddAsync(It.IsAny<Test>()), Times.Never);
			uowMock.Verify(u => u.RollbackTransactionAsync(), Times.Never);
		}

		#endregion

		#region CreateFromBankRandomAsync Tests

		// UTCID01: QuestionRanges missing -> returns failure
		// Expected: False -> "Must provide at least one question range"
		// Input: Title="Random test", TestSkill=LR, Duration=45, QuestionRanges=null
		[Trait("Category", "CreateFromBankRandomAsync")]
		[Trait("TestCase", "UTCID01")]
		[Fact]
		public async Task UTCID01_CreateFromBankRandomAsync_WhenQuestionRangesMissing_ReturnsFailure()
		{
			var service = CreateService(out var uowMock, out var testRepoMock, out _, out _);
			SetupTransactionMocks(uowMock);

			var dto = new CreateTestFromBankRandomDto
			{
				Title = "Random test",
				Description = "desc",
				Duration = 45,
				TestSkill = TestSkill.LR,
				QuestionRanges = null!
			};

			var result = await service.CreateFromBankRandomAsync(dto);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Must provide at least one question range");
			testRepoMock.Verify(r => r.AddAsync(It.IsAny<Test>()), Times.Never);
			uowMock.Verify(u => u.CommitTransactionAsync(), Times.Never);
			uowMock.Verify(u => u.RollbackTransactionAsync(), Times.Never);
		}

		// UTCID02: Part validation fails -> returns validation error
		// Expected: False -> "Part 1 (S-Part 1) is not a Listening or Reading part. TestSkill is LR but Part skill is Speaking"
		// Input: Title="Random test", TestSkill=LR, Duration=45, QuestionRanges=[{PartId=1, SingleQuestionCount=1}]
		[Trait("Category", "CreateFromBankRandomAsync")]
		[Trait("TestCase", "UTCID02")]
		[Fact]
		public async Task UTCID02_CreateFromBankRandomAsync_WhenPartSkillMismatch_ReturnsFailure()
		{
			var service = CreateService(out var uowMock, out _, out _, out _);
			SetupTransactionMocks(uowMock);

			var partRepoMock = new Mock<IPartRepository>();
			uowMock.SetupGet(u => u.Parts).Returns(partRepoMock.Object);
			partRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(new Part
			{
				PartId = 1,
				Name = "S-Part 1",
				Skill = QuestionSkill.Speaking
			});

			var dto = new CreateTestFromBankRandomDto
			{
				Title = "Random test",
				Description = "desc",
				Duration = 45,
				TestSkill = TestSkill.LR,
				QuestionRanges = new List<QuestionRangeDto>
				{
					new QuestionRangeDto { PartId = 1, SingleQuestionCount = 1 }
				}
			};

			var result = await service.CreateFromBankRandomAsync(dto);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Contain("Part 1 (S-Part 1) is not a Listening or Reading part");
			uowMock.Verify(u => u.RollbackTransactionAsync(), Times.Never);
		}

		// UTCID03: Not enough single questions -> returns shortage message and rollback
		// Expected: False -> "Not enough questions in bank for PartId=2. Requested: 2, Available: 1"
		// Input: Title="Random test", TestSkill=LR, Duration=45, QuestionRanges=[{PartId=2, SingleQuestionCount=2}]
		[Trait("Category", "CreateFromBankRandomAsync")]
		[Trait("TestCase", "UTCID03")]
		[Fact]
		public async Task UTCID03_CreateFromBankRandomAsync_WhenInsufficientSingleQuestions_RollsBackAndReturnsFailure()
		{
			var service = CreateService(out var uowMock, out _, out _, out _);
			SetupTransactionMocks(uowMock);

			var partRepoMock = new Mock<IPartRepository>();
			var questionRepoMock = new Mock<IQuestionRepository>();
			uowMock.SetupGet(u => u.Parts).Returns(partRepoMock.Object);
			uowMock.SetupGet(u => u.Questions).Returns(questionRepoMock.Object);

			partRepoMock.Setup(r => r.GetByIdAsync(2)).ReturnsAsync(new Part
			{
				PartId = 2,
				Name = "L-Part 2",
				Skill = QuestionSkill.Listening
			});

			questionRepoMock.Setup(r => r.GetRandomQuestionsAsync(2, null, 2))
				.ReturnsAsync(new List<Question>
				{
					new Question { QuestionId = 10, PartId = 2, Options = new List<Option>() }
				});

			var dto = new CreateTestFromBankRandomDto
			{
				Title = "Random test",
				Description = "desc",
				Duration = 45,
				TestSkill = TestSkill.LR,
				QuestionRanges = new List<QuestionRangeDto>
				{
					new QuestionRangeDto { PartId = 2, SingleQuestionCount = 2 }
				}
			};

			var result = await service.CreateFromBankRandomAsync(dto);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Not enough questions in bank for PartId=2. Requested: 2, Available: 1");
			uowMock.Verify(u => u.RollbackTransactionAsync(), Times.Once);
		}

		// UTCID04: Not enough question groups -> returns shortage message and rollback
		// Expected: False -> "Not enough question groups in bank for PartId=3. Requested: 1, Available: 0"
		// Input: Title="Random test", TestSkill=LR, Duration=45, QuestionRanges=[{PartId=3, GroupQuestionCount=1}]
		[Trait("Category", "CreateFromBankRandomAsync")]
		[Trait("TestCase", "UTCID04")]
		[Fact]
		public async Task UTCID04_CreateFromBankRandomAsync_WhenInsufficientGroups_RollsBackAndReturnsFailure()
		{
			var service = CreateService(out var uowMock, out _, out _, out _);
			SetupTransactionMocks(uowMock);

			var partRepoMock = new Mock<IPartRepository>();
			var questionGroupRepoMock = new Mock<IQuestionGroupRepository>();
			uowMock.SetupGet(u => u.Parts).Returns(partRepoMock.Object);
			uowMock.SetupGet(u => u.QuestionGroups).Returns(questionGroupRepoMock.Object);

			partRepoMock.Setup(r => r.GetByIdAsync(3)).ReturnsAsync(new Part
			{
				PartId = 3,
				Name = "L-Part 3",
				Skill = QuestionSkill.Listening
			});

			questionGroupRepoMock.Setup(r => r.GetRandomQuestionGroupsAsync(3, null, 1))
				.ReturnsAsync(new List<QuestionGroup>());

			var dto = new CreateTestFromBankRandomDto
			{
				Title = "Random test",
				Description = "desc",
				Duration = 45,
				TestSkill = TestSkill.LR,
				QuestionRanges = new List<QuestionRangeDto>
				{
					new QuestionRangeDto { PartId = 3, GroupQuestionCount = 1, SingleQuestionCount = 0 }
				}
			};

			var result = await service.CreateFromBankRandomAsync(dto);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Not enough question groups in bank for PartId=3. Requested: 1, Available: 0");
			uowMock.Verify(u => u.RollbackTransactionAsync(), Times.Once);
		}

		// UTCID05: Successful creation adds both single and group questions
		// Expected: True -> "Created successfully (testId: 777) with 4 questions randomly selected from bank"
		// Input: Title="Random test", TestSkill=LR, Duration=45, QuestionRanges=[{PartId=4, SingleQuestionCount=2, GroupQuestionCount=1}]
		[Trait("Category", "CreateFromBankRandomAsync")]
		[Trait("TestCase", "UTCID05")]
		[Fact]
		public async Task UTCID05_CreateFromBankRandomAsync_WhenRandomSelectionSucceeds_PersistsAllEntities()
		{
			var service = CreateService(out var uowMock, out var testRepoMock, out _, out _);
			SetupTransactionMocks(uowMock);

			var partRepoMock = new Mock<IPartRepository>();
			var questionRepoMock = new Mock<IQuestionRepository>();
			var questionGroupRepoMock = new Mock<IQuestionGroupRepository>();
			var testQuestionRepoMock = new Mock<ITestQuestionRepository>();
			uowMock.SetupGet(u => u.Parts).Returns(partRepoMock.Object);
			uowMock.SetupGet(u => u.Questions).Returns(questionRepoMock.Object);
			uowMock.SetupGet(u => u.QuestionGroups).Returns(questionGroupRepoMock.Object);
			uowMock.SetupGet(u => u.TestQuestions).Returns(testQuestionRepoMock.Object);

			partRepoMock.Setup(r => r.GetByIdAsync(4)).ReturnsAsync(new Part
			{
				PartId = 4,
				Name = "L-Part 4",
				Skill = QuestionSkill.Listening
			});

			var randomQuestions = new List<Question>
			{
				new Question { QuestionId = 101, PartId = 4, Options = new List<Option>() },
				new Question { QuestionId = 102, PartId = 4, Options = new List<Option>() }
			};
			questionRepoMock.Setup(r => r.GetRandomQuestionsAsync(4, null, 2))
				.ReturnsAsync(randomQuestions);

			var randomGroups = new List<QuestionGroup>
			{
				new QuestionGroup
				{
					QuestionGroupId = 201,
					PartId = 4,
					Questions = new List<Question>
					{
						new Question { QuestionId = 20101, PartId = 4, Options = new List<Option>() },
						new Question { QuestionId = 20102, PartId = 4, Options = new List<Option>() }
					}
				}
			};
			questionGroupRepoMock.Setup(r => r.GetRandomQuestionGroupsAsync(4, null, 1))
				.ReturnsAsync(randomGroups);

			Test? savedTest = null;
			testRepoMock.Setup(r => r.AddAsync(It.IsAny<Test>()))
				.ReturnsAsync((Test test) =>
				{
					savedTest = test;
					test.TestId = 777;
					return test;
				});

			var addedQuestions = new List<TestQuestion>();
			testQuestionRepoMock.Setup(r => r.AddAsync(It.IsAny<TestQuestion>()))
				.ReturnsAsync((TestQuestion tq) =>
				{
					addedQuestions.Add(tq);
					return tq;
				});

			var dto = new CreateTestFromBankRandomDto
			{
				Title = "Random test",
				Description = "desc",
				Duration = 45,
				TestSkill = TestSkill.LR,
				QuestionRanges = new List<QuestionRangeDto>
				{
					new QuestionRangeDto { PartId = 4, SingleQuestionCount = 2, GroupQuestionCount = 1 }
				}
			};

			var result = await service.CreateFromBankRandomAsync(dto);

			result.IsSuccess.Should().BeTrue();
			result.Data.Should().Be("Created successfully (testId: 777) with 4 questions randomly selected from bank");
			savedTest.Should().NotBeNull();
			savedTest!.TotalQuestion.Should().Be(4);
			savedTest.CreationStatus.Should().Be(TestCreationStatus.Completed);
			savedTest.VisibilityStatus.Should().Be(TestVisibilityStatus.Hidden);
			addedQuestions.Should().HaveCount(3);
			addedQuestions.Count(q => q.IsQuestionGroup).Should().Be(1);
			addedQuestions.Count(q => !q.IsQuestionGroup).Should().Be(2);
			addedQuestions.Where(q => !q.IsQuestionGroup).Select(q => q.SourceQuestionId).Should().Contain(new int?[] { 101, 102 });
			addedQuestions.Single(q => q.IsQuestionGroup).SourceQuestionGroupId.Should().Be(201);
			uowMock.Verify(u => u.CommitTransactionAsync(), Times.Once);
			uowMock.Verify(u => u.RollbackTransactionAsync(), Times.Never);
		}

		#endregion

		#region UpdateStatusAsync Tests
		// helper method

		// UTCID01: không tìm thấy bài test
		// Expected: FALSE -> "Không tìm thấy dữ liệu."
		// Input: testId=0,VisibilityStatus=Published, TestCreationStatus = Completed
		[Trait("Category", "UpdateStatusAsync")]
		[Trait("TestCase", "UTCID01")]
		[Fact]
		public async Task UTCID01_UpdateStatusAsync_WhenTestNotFound_ReturnsFailure()
		{
			var service = CreateService(out var uowMock, out var testRepoMock, out _, out _);
			testRepoMock.Setup(r => r.GetByIdAsync(0)).ReturnsAsync((Test)null!);

			var request = new UpdateTestVisibilityStatusDto
			{
				TestId = 0,
				VisibilityStatus = TestVisibilityStatus.Published
			};

			var result = await service.UpdateStatusAsync(request);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Not found");
			uowMock.Verify(u => u.SaveChangesAsync(), Times.Never);
		}

		// UTCID02: test chưa tạo hoàn chỉnh (InProgress) -> ko được update trạng thái hiển thị
		// Expected: FALSE -> "Chỉ những bài test hoàn chỉnh mới có thể thay đổi trạng thái hiển thị."
		// Input: testId=1,VisibilityStatus=Published, TestCreationStatus = InProgress
		[Trait("Category", "UpdateStatusAsync")]
		[Trait("TestCase", "UTCID02")]
		[Fact]
		public async Task UTCID02_UpdateStatusAsync_WhenCreationStatusInProgress_ReturnsFailure()
		{
			var service = CreateService(out var uowMock, out var testRepoMock, out _, out _);
			var test = CreateTest(1, TestType.Practice, TestSkill.LR, published: false);
			test.CreationStatus = TestCreationStatus.InProgress;
			testRepoMock.Setup(r => r.GetByIdAsync(test.TestId)).ReturnsAsync(test);

			var request = new UpdateTestVisibilityStatusDto
			{
				TestId = 1,
				VisibilityStatus = TestVisibilityStatus.Published
			};

			var result = await service.UpdateStatusAsync(request);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Only completed tests can be published.");
			test.VisibilityStatus.Should().Be(TestVisibilityStatus.Hidden);
			uowMock.Verify(u => u.SaveChangesAsync(), Times.Never);
		}

		// UTCID03: test chưa tạo hoàn chỉnh (Draft) -> ko được update trạng thái hiển thị
		// Expected: FALSE -> "Chỉ những bài test hoàn chỉnh mới có thể thay đổi trạng thái hiển thị."
		// Input: testId=1,VisibilityStatus=Published, TestCreationStatus = Draft
		[Trait("Category", "UpdateStatusAsync")]
		[Trait("TestCase", "UTCID03")]
		[Fact]
		public async Task UTCID03_UpdateStatusAsync_WhenCreationStatusDraft_ReturnsFailure()
		{
			var service = CreateService(out var uowMock, out var testRepoMock, out _, out _);
			var test = CreateTest(1, TestType.Practice, TestSkill.LR, published: false);
			test.CreationStatus = TestCreationStatus.Draft;
			testRepoMock.Setup(r => r.GetByIdAsync(test.TestId)).ReturnsAsync(test);

			var request = new UpdateTestVisibilityStatusDto
			{
				TestId = 1,
				VisibilityStatus = TestVisibilityStatus.Published
			};

			var result = await service.UpdateStatusAsync(request);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Only completed tests can be published.");
			test.VisibilityStatus.Should().Be(TestVisibilityStatus.Hidden);
			uowMock.Verify(u => u.SaveChangesAsync(), Times.Never);
		}

		// UTCID04: Happy case - publish
		// Expected: true -> "Bài test 1 đã đổi trạng thái thành Published."
		// Input: testId=1,VisibilityStatus=Published, TestCreationStatus = Completed
		[Trait("Category", "UpdateStatusAsync")]
		[Trait("TestCase", "UTCID04")]
		[Fact]
		public async Task UTCID04_UpdateStatusAsync_WhenCompleted_PublishesTest()
		{
			var service = CreateService(out var uowMock, out var testRepoMock, out _, out _);
			var test = CreateTest(1, TestType.Practice, TestSkill.LR, published: false);
			test.CreationStatus = TestCreationStatus.Completed;
			test.VisibilityStatus = TestVisibilityStatus.Hidden;
			testRepoMock.Setup(r => r.GetByIdAsync(test.TestId)).ReturnsAsync(test);

			DateTime? updatedAtBefore = test.UpdatedAt;

			var request = new UpdateTestVisibilityStatusDto
			{
				TestId = 1,
				VisibilityStatus = TestVisibilityStatus.Published
			};

			var result = await service.UpdateStatusAsync(request);

			result.IsSuccess.Should().BeTrue();
			result.Data.Should().Be("Test 1 Published successfully");
			test.VisibilityStatus.Should().Be(TestVisibilityStatus.Published);
			test.UpdatedAt.Should().NotBeNull();
			if (updatedAtBefore.HasValue)
			{
				test.UpdatedAt.Should().BeOnOrAfter(updatedAtBefore.Value);
			}
			uowMock.Verify(u => u.SaveChangesAsync(), Times.Once);
		}

		// UTCID05: Happy case - hide
		// Expected: true -> "Bài test 1 đã đổi trạng thái thành Hidden."
		// Input: testId=1,VisibilityStatus=Hidden, TestCreationStatus = Completed
		[Trait("Category", "UpdateStatusAsync")]
		[Trait("TestCase", "UTCID05")]
		[Fact]
		public async Task UTCID05_UpdateStatusAsync_WhenCompleted_HidesTest()
		{
			var service = CreateService(out var uowMock, out var testRepoMock, out _, out _);
			var test = CreateTest(1, TestType.Practice, TestSkill.LR, published: true);
			test.CreationStatus = TestCreationStatus.Completed;
			testRepoMock.Setup(r => r.GetByIdAsync(test.TestId)).ReturnsAsync(test);

			var request = new UpdateTestVisibilityStatusDto
			{
				TestId = 1,
				VisibilityStatus = TestVisibilityStatus.Hidden
			};

			var result = await service.UpdateStatusAsync(request);

			result.IsSuccess.Should().BeTrue();
			result.Data.Should().Be("Test 1 Hidden successfully");
			test.VisibilityStatus.Should().Be(TestVisibilityStatus.Hidden);
			test.UpdatedAt.Should().NotBeNull();
			uowMock.Verify(u => u.SaveChangesAsync(), Times.Once);
		}

		#endregion

		#region GetDetailAsync Tests
		// Helper method

		// UTCID01: không tìm thấy
		// Expected: FALSE -> "Không tìm thấy dữ liệu."
		// Input: id=0
		[Trait("Category", "GetDetailAsync")]
		[Trait("TestCase", "UTCID01")]
		[Fact]
		public async Task UTCID01_GetDetailAsync_WhenTestNotFound_ReturnsFailure()
		{
			var service = CreateService(out var uowMock, out var testRepoMock, out _, out _);
			testRepoMock.Setup(r => r.GetTestByIdAsync(0)).ReturnsAsync((Test)null!);

			var result = await service.GetDetailAsync(0);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be(CommonMessages.DataNotFound);
		}

		// UTCID02: tìm thấy nhưng data rỗng
		// Expected: true -> TestDetailDto with empty question
		// Input: id=1
		[Trait("Category", "GetDetailAsync")]
		[Trait("TestCase", "UTCID02")]
		[Fact]
		public async Task UTCID02_GetDetailAsync_WhenTestHasNoQuestions_ReturnsDetailWithEmptyParts()
		{
			var service = CreateService(out var uowMock, out var testRepoMock, out _, out _);
			var test = CreateTest(1, TestType.Practice, TestSkill.LR, published: true, questions: null);
			testRepoMock.Setup(r => r.GetTestByIdAsync(1)).ReturnsAsync(test);

			var result = await service.GetDetailAsync(1);

			result.IsSuccess.Should().BeTrue();
			result.Data.Should().NotBeNull();
			result.Data.TestId.Should().Be(test.TestId);
			result.Data.Title.Should().Be(test.Title);
			result.Data.Parts.Should().BeEmpty();
		}

		// UTCID03: tìm thấy và có data
		// Expected: true -> TestDetailDto with questions
		// Input: id=2
		[Trait("Category", "GetDetailAsync")]
		[Trait("TestCase", "UTCID03")]
		[Fact]
		public async Task UTCID03_GetDetailAsync_WhenTestHasQuestions_ReturnsPartsAndQuestions()
		{
			var service = CreateService(out var uowMock, out var testRepoMock, out _, out _);

			var questions = new List<TestQuestion>
			{
				// Part 1: one group and one single question
				CreateGroupQuestion(201, partId: 1, order: 1),
				CreateSingleQuestion(101, partId: 1, order: 2),
				// Part 2: one single question
				CreateSingleQuestion(301, partId: 2, order: 1)
			};

			var test = CreateTest(2, TestType.Practice, TestSkill.LR, published: true, totalQuestions: questions.Count, questions: questions);
			testRepoMock.Setup(r => r.GetTestByIdAsync(2)).ReturnsAsync(test);

			var result = await service.GetDetailAsync(2);

			result.IsSuccess.Should().BeTrue();
			result.Data.Should().NotBeNull();

			var detail = result.Data!;
			detail.TestId.Should().Be(test.TestId);
			detail.Parts.Should().HaveCount(2);

			var part1 = detail.Parts.Single(p => p.PartId == 1);
			part1.PartName.Should().Be("Part 1");
			part1.TestQuestions.Should().HaveCount(2);

			// Ordered by OrderInTest: group (order 1) then single (order 2)
			part1.TestQuestions[0].IsGroup.Should().BeTrue();
			part1.TestQuestions[0].QuestionGroupSnapshotDto.Should().NotBeNull();
			part1.TestQuestions[0].QuestionGroupSnapshotDto!.QuestionGroupId.Should().Be(201);

			part1.TestQuestions[1].IsGroup.Should().BeFalse();
			part1.TestQuestions[1].QuestionSnapshotDto.Should().NotBeNull();
			part1.TestQuestions[1].QuestionSnapshotDto!.QuestionId.Should().Be(101);

			var part2 = detail.Parts.Single(p => p.PartId == 2);
			part2.PartName.Should().Be("Part 2");
			part2.TestQuestions.Should().HaveCount(1);
			part2.TestQuestions[0].IsGroup.Should().BeFalse();
			part2.TestQuestions[0].QuestionSnapshotDto.Should().NotBeNull();
			part2.TestQuestions[0].QuestionSnapshotDto!.QuestionId.Should().Be(301);
		}

		// UTCID04: exception khi truy xuất database
		// Expected: throws exception with same message
		// Input: id=2
		[Trait("Category", "GetDetailAsync")]
		[Trait("TestCase", "UTCID04")]
		[Fact]
		public async Task UTCID04_GetDetailAsync_WhenRepositoryThrows_PropagatesException()
		{
			var service = CreateService(out var uowMock, out var testRepoMock, out _, out _);
			var exception = new Exception("Database error");

			testRepoMock.Setup(r => r.GetTestByIdAsync(2)).ThrowsAsync(exception);

			Func<Task> act = async () => await service.GetDetailAsync(2);

			await act.Should().ThrowAsync<Exception>()
				.WithMessage("Database error");
		}

		#endregion

		#region UpdateManualTestAsync Tests
		// Helper method
		// UTCID01: không tìm thấy
		// Expected: FALSE -> "Không tìm thấy dữ liệu."
		// Input: testId=0, Title ="Example title", Description="Example description", AudioUrl="https://cdn/new.mp3", 
		// TestSkill=LR,TestType=Simulator, Parts=List<Parts> with both single and group question
		// TestVisibilityStatus=Published
		[Trait("Category", "UpdateManualTestAsync")]
		[Trait("TestCase", "UTCID01")]
		[Fact]
		public async Task UTCID01_UpdateManualTestAsync_WhenTestNotFound_ReturnsFailure()
		{
			var service = CreateService(out var uowMock, out var testRepoMock, out _, out _);
			testRepoMock.Setup(r => r.GetByIdAsync(0)).ReturnsAsync((Test)null!);

			var dto = new UpdateManualTestDto
			{
				Title = "Example title",
				Description = "Example description",
				AudioUrl = "https://cdn/new.mp3",
				TestSkill = TestSkill.LR,
				TestType = TestType.Simulator,
				Parts = new List<PartDto>()
			};

			var result = await service.UpdateManualTestAsync(0, dto);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Test not found");
		}

		// UTCID02: test đã publish -> tạo clone
		// Expected: true -> "Tạo thành công phiên bản mới v2 (TestId=100)"
		[Trait("Category", "UpdateManualTestAsync")]
		[Trait("TestCase", "UTCID02")]
		[Fact]
		public async Task UTCID02_UpdateManualTestAsync_WhenPublishedTest_ClonesNewVersion()
		{
			// Arrange
			var service = CreateService(out var uowMock, out var testRepoMock, out var testResultRepoMock, out var userAnswerRepoMock);

			var existing = CreateTest(2, TestType.Simulator, TestSkill.LR, published: true, totalQuestions: 10, questions: new List<TestQuestion>());
			existing.ParentTestId = 1;
			existing.Version = 1;

			testRepoMock.Setup(r => r.GetByIdAsync(2)).ReturnsAsync(existing);
			testRepoMock.Setup(r => r.GetNextVersionAsync(1)).ReturnsAsync(2);

			// 🔥 Mock AddAsync: clone test + gán TestId + Version
			Test? addedTest = null;
			testRepoMock.Setup(r => r.AddAsync(It.IsAny<Test>()))
				.Callback<Test>(t =>
				{
					t.TestId = 100;        // giả lập auto-increment
					t.Version = 2;         // version mới
					t.VisibilityStatus = TestVisibilityStatus.Hidden;
					t.CreationStatus = TestCreationStatus.Completed;
					addedTest = t;
				})
				.ReturnsAsync((Test t) => t);

			// 🔥 Mock AddRangeAsync để capture câu hỏi clone
			var addedQuestions = new List<TestQuestion>();
			uowMock.Setup(u => u.TestQuestions.AddRangeAsync(It.IsAny<IEnumerable<TestQuestion>>()))
				.Callback<IEnumerable<TestQuestion>>(items => addedQuestions.AddRange(items))
				.Returns(Task.CompletedTask);

			var dto = new UpdateManualTestDto
			{
				Title = "Example title",
				Description = "Example description",
				AudioUrl = "https://cdn/new.mp3",
				TestSkill = TestSkill.LR,
				TestType = TestType.Simulator,
				Parts = new List<PartDto>
		{
			new PartDto
			{
				PartId = 1,
				Groups = new List<QuestionGroupDto>
				{
					new QuestionGroupDto
					{
						Passage = "Passage 1",
						Questions = new List<QuestionDto>
						{
							new QuestionDto { Content = "Q1" }
						}
					}
				},
				Questions = new List<QuestionDto>
				{
					new QuestionDto { Content = "Q2" }
				}
			}
		}
			};

			// Act
			var result = await service.UpdateManualTestAsync(2, dto);

			// Tổng số câu hỏi trong test clone
			addedTest!.TotalQuestion = addedQuestions.Count;

			// Assert
			result.IsSuccess.Should().BeTrue();
			result.Data.Should().Be($"Cloned to new version v{addedTest.Version} (TestId={addedTest.TestId})");

			addedTest.Should().NotBeNull();
			addedTest.Title.Should().Be(dto.Title);
			addedTest.Description.Should().Be(dto.Description);
			addedTest.AudioUrl.Should().Be(dto.AudioUrl);
			addedTest.TestSkill.Should().Be(dto.TestSkill);
			addedTest.TestType.Should().Be(dto.TestType);
			addedTest.VisibilityStatus.Should().Be(TestVisibilityStatus.Hidden);
			addedTest.CreationStatus.Should().Be(TestCreationStatus.Completed);
			addedTest.TotalQuestion.Should().Be(2); // 1 group + 1 single question

			uowMock.Verify(u => u.TestQuestions.AddRangeAsync(It.IsAny<IEnumerable<TestQuestion>>()), Times.Once);
			uowMock.Verify(u => u.SaveChangesAsync(), Times.AtLeastOnce);
		}


		// UTCID03: test chưa published -> tạo clone
		// Expected: true -> "Cập nhật trực tiếp thành công TestId=2"
		// Input: testId=1, Title ="Example title", Description="Example description", AudioUrl="https://cdn/new.mp3", 
		// TestSkill=LR,TestType=Simulator, Parts=List<Parts> with both single and group question
		// TestVisibilityStatus=Hidden
		[Trait("Category", "UpdateManualTestAsync")]
		[Trait("TestCase", "UTCID03")]
		[Fact]
		public async Task UTCID03_UpdateManualTestAsync_WhenHiddenTestWithBothGroupAndSingle_UpdatesDirectly()
		{
			var service = CreateService(out var uowMock, out var testRepoMock, out _, out _);

			var existing = CreateTest(1, TestType.Simulator, TestSkill.LR, published: false, totalQuestions: 5, questions: new List<TestQuestion>());
			existing.VisibilityStatus = TestVisibilityStatus.Hidden;
			existing.CreationStatus = TestCreationStatus.Completed;

			testRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(existing);

			// Old questions to be removed
			var oldQuestions = new List<TestQuestion>
			{
				CreateSingleQuestion(1, 1, 1),
				CreateSingleQuestion(2, 1, 2)
			};
			var testQuestionRepoMock = new Mock<ITestQuestionRepository>();
			uowMock.SetupGet(u => u.TestQuestions).Returns(testQuestionRepoMock.Object);
			testQuestionRepoMock.Setup(r => r.GetByTestIdAsync(existing.TestId)).ReturnsAsync(oldQuestions);

			var dto = new UpdateManualTestDto
			{
				Title = "Example title",
				Description = "Example description",
				AudioUrl = "https://cdn/new.mp3",
				TestSkill = TestSkill.LR,
				TestType = TestType.Simulator,
				Parts = new List<PartDto>
				{
					new PartDto
					{
						PartId = 1,
						Groups = new List<QuestionGroupDto>
						{
							new QuestionGroupDto
							{
								Passage = "Passage 1",
								Questions = new List<QuestionDto>
								{
									new QuestionDto { Content = "Q1" }
								}
							}
						},
						Questions = new List<QuestionDto>
						{
							new QuestionDto { Content = "Q2" }
						}
					}
				}
			};

			var result = await service.UpdateManualTestAsync(1, dto);

			result.IsSuccess.Should().BeTrue();
			result.Data.Should().Be($"Updated successfully TestId={existing.TestId}");

			existing.Title.Should().Be(dto.Title);
			existing.Description.Should().Be(dto.Description);
			existing.AudioUrl.Should().Be(dto.AudioUrl);
			existing.TestSkill.Should().Be(dto.TestSkill);
			existing.TotalQuestion.Should().Be(2); // 1 group + 1 single

			testQuestionRepoMock.Verify(r => r.RemoveRange(oldQuestions), Times.Once);
			uowMock.Verify(u => u.TestQuestions.AddRangeAsync(It.IsAny<IEnumerable<TestQuestion>>()), Times.Once);
			uowMock.Verify(u => u.SaveChangesAsync(), Times.Once);
		}

		// UTCID04: test chưa published, only group question -> tạo clone
		// Expected: true -> "Cập nhật trực tiếp thành công TestId=2"
		// Input: testId=1, Title ="Example title", Description="Example description", AudioUrl="https://cdn/new.mp3", 
		// TestSkill=LR,TestType=Simulator, Parts=List<Parts> with only group question
		// TestVisibilityStatus=Hidden
		[Trait("Category", "UpdateManualTestAsync")]
		[Trait("TestCase", "UTCID04")]
		[Fact]
		public async Task UTCID04_UpdateManualTestAsync_WhenHiddenTestWithOnlyGroups_UpdatesDirectly()
		{
			var service = CreateService(out var uowMock, out var testRepoMock, out _, out _);

			var existing = CreateTest(1, TestType.Simulator, TestSkill.LR, published: false, totalQuestions: 3, questions: new List<TestQuestion>());
			existing.VisibilityStatus = TestVisibilityStatus.Hidden;
			existing.CreationStatus = TestCreationStatus.Completed;

			testRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(existing);

			var testQuestionRepoMock = new Mock<ITestQuestionRepository>();
			uowMock.SetupGet(u => u.TestQuestions).Returns(testQuestionRepoMock.Object);
			testQuestionRepoMock.Setup(r => r.GetByTestIdAsync(existing.TestId)).ReturnsAsync(new List<TestQuestion>());

			var dto = new UpdateManualTestDto
			{
				Title = "Example title",
				Description = "Example description",
				AudioUrl = "https://cdn/new.mp3",
				TestSkill = TestSkill.LR,
				TestType = TestType.Simulator,
				Parts = new List<PartDto>
				{
					new PartDto
					{
						PartId = 1,
						Groups = new List<QuestionGroupDto>
						{
							new QuestionGroupDto
							{
								Passage = "Passage 1",
								Questions = new List<QuestionDto>
								{
									new QuestionDto { Content = "Q1" }
								}
							}
						}
					}
				}
			};

			var result = await service.UpdateManualTestAsync(1, dto);

			result.IsSuccess.Should().BeTrue();
			result.Data.Should().Be($"Updated successfully TestId={existing.TestId}");

			existing.TotalQuestion.Should().Be(1);
			uowMock.Verify(u => u.TestQuestions.AddRangeAsync(It.IsAny<IEnumerable<TestQuestion>>()), Times.Once);
			uowMock.Verify(u => u.SaveChangesAsync(), Times.Once);
		}

		// UTCID05: test chưa published, only single question -> tạo clone
		// Expected: true -> "Cập nhật trực tiếp thành công TestId=2"
		// Input: testId=1, Title ="Example title", Description="Example description", AudioUrl="https://cdn/new.mp3", 
		// TestSkill=LR,TestType=Simulator, Parts=List<Parts> with only single question
		// TestVisibilityStatus=Hidden
		[Trait("Category", "UpdateManualTestAsync")]
		[Trait("TestCase", "UTCID05")]
		[Fact]
		public async Task UTCID05_UpdateManualTestAsync_WhenHiddenTestWithOnlySingles_UpdatesDirectly()
		{
			var service = CreateService(out var uowMock, out var testRepoMock, out _, out _);

			var existing = CreateTest(1, TestType.Simulator, TestSkill.LR, published: false, totalQuestions: 3, questions: new List<TestQuestion>());
			existing.VisibilityStatus = TestVisibilityStatus.Hidden;
			existing.CreationStatus = TestCreationStatus.Completed;

			testRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(existing);

			var testQuestionRepoMock = new Mock<ITestQuestionRepository>();
			uowMock.SetupGet(u => u.TestQuestions).Returns(testQuestionRepoMock.Object);
			testQuestionRepoMock.Setup(r => r.GetByTestIdAsync(existing.TestId)).ReturnsAsync(new List<TestQuestion>());

			var dto = new UpdateManualTestDto
			{
				Title = "Example title",
				Description = "Example description",
				AudioUrl = "https://cdn/new.mp3",
				TestSkill = TestSkill.LR,
				TestType = TestType.Simulator,
				Parts = new List<PartDto>
				{
					new PartDto
					{
						PartId = 1,
						Questions = new List<QuestionDto>
						{
							new QuestionDto { Content = "Q1" }
						}
					}
				}
			};

			var result = await service.UpdateManualTestAsync(1, dto);

			result.IsSuccess.Should().BeTrue();
			result.Data.Should().Be($"Updated successfully TestId={existing.TestId}");

			existing.TotalQuestion.Should().Be(1);
			uowMock.Verify(u => u.TestQuestions.AddRangeAsync(It.IsAny<IEnumerable<TestQuestion>>()), Times.Once);
			uowMock.Verify(u => u.SaveChangesAsync(), Times.Once);
		}

		// UTCID06: exception khi lưu thay đổi vào database
		// Expected: false -> ex.Message
		// Input: testId=1, Title ="Example title", Description="Example description", AudioUrl="https://cdn/new.mp3", 
		// TestSkill=LR,TestType=Simulator
		// TestVisibilityStatus=Hidden
		[Trait("Category", "UpdateManualTestAsync")]
		[Trait("TestCase", "UTCID06")]
		[Fact]
		public async Task UTCID06_UpdateManualTestAsync_WhenSaveChangesThrows_ReturnsFailureWithExceptionMessage()
		{
			var service = CreateService(out var uowMock, out var testRepoMock, out _, out _);

			var existing = CreateTest(1, TestType.Simulator, TestSkill.LR, published: false, totalQuestions: 3, questions: new List<TestQuestion>());
			existing.VisibilityStatus = TestVisibilityStatus.Hidden;

			testRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(existing);

			var testQuestionRepoMock = new Mock<ITestQuestionRepository>();
			uowMock.SetupGet(u => u.TestQuestions).Returns(testQuestionRepoMock.Object);
			testQuestionRepoMock.Setup(r => r.GetByTestIdAsync(existing.TestId)).ReturnsAsync(new List<TestQuestion>());

			var dto = new UpdateManualTestDto
			{
				Title = "Example title",
				Description = "Example description",
				AudioUrl = "https://cdn/new.mp3",
				TestSkill = TestSkill.LR,
				TestType = TestType.Simulator,
				Parts = new List<PartDto>()
			};

			uowMock.Setup(u => u.SaveChangesAsync()).ThrowsAsync(new Exception("Database error"));

			var result = await service.UpdateManualTestAsync(1, dto);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Database error");
		}

		#endregion

		#region UpdateTestFromBankAsync Tests	
		//Hepler method

		// UTCID01: Both single question and question group are null  - IsPublish = False, testId=1
		// Expected: False -> "Must provide single question id or group question id"
		// Input:userId="11111111-1111-1111-1111-111111111111", Title ="Example title", TestSkill=3, Description="Example description", Duration=60, SingleQuestionIds=null, QuestionGroupIds=null
		[Trait("Category", "UpdateTestFromBankAsync")]
		[Trait("TestCase", "UTCID01")]
		[Fact]
		public async Task UTCID01_UpdateTestFromBankAsync_WhenNoQuestionsProvided_ReturnsFailure()
		{
			var service = CreateService(out var uowMock, out var testRepoMock, out _, out _);
			var existing = CreateTest(1, TestType.Practice, TestSkill.LR, published: false);
			testRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(existing);

			var dto = new UpdateTestFromBank
			{
				Title = "Example title",
				Description = "Example description",
				TestSkill = TestSkill.LR,
				TestType = TestType.Practice,
				Duration = 60,
				SingleQuestionIds = null,
				GroupQuestionIds = null
			};

			var result = await service.UpdateTestFromBankAsync(1, dto);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Must provide single question id or group question id");
		}



		// UTCID02: Successful creation with single questions only - IsPublish = False, testId=1
		// Expected: True -> "Created successfully (testId: 1)"
		// Input: userId="11111111-1111-1111-1111-111111111111",Title ="Example title", TestSkill=3, Description="Example description", Duration=60, 
		// SingleQuestionIds=List<int> with questionId valid, QuestionGroupIds=null
		[Trait("Category", "UpdateTestFromBankAsync")]
		[Trait("TestCase", "UTCID02")]
		[Fact]
		public async Task UTCID02_UpdateTestFromBankAsync_WhenOnlySingleQuestions_UpdatesExistingTest()
		{
			var service = CreateService(out var uowMock, out var testRepoMock, out _, out _);

			var existing = CreateTest(1, TestType.Practice, TestSkill.LR, published: false);
			existing.VisibilityStatus = TestVisibilityStatus.Hidden;
			testRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(existing);

			var questionRepoMock = new Mock<IQuestionRepository>();
			var testQuestionRepoMock = new Mock<ITestQuestionRepository>();
			uowMock.SetupGet(u => u.Questions).Returns(questionRepoMock.Object);
			uowMock.SetupGet(u => u.TestQuestions).Returns(testQuestionRepoMock.Object);

			testQuestionRepoMock.Setup(r => r.GetByTestIdAsync(existing.TestId))
				.ReturnsAsync(new List<TestQuestion>());

			questionRepoMock.Setup(r => r.GetByListIdAsync(It.IsAny<List<int>>()))
				.ReturnsAsync(new List<QuestionSnapshotDto>
				{
					new QuestionSnapshotDto { QuestionId = 1, PartId = 1 },
					new QuestionSnapshotDto { QuestionId = 2, PartId = 1 }
				});

			var dto = new UpdateTestFromBank
			{
				Title = "Example title",
				Description = "Example description",
				TestSkill = TestSkill.LR,
				TestType = TestType.Practice,
				Duration = 60,
				SingleQuestionIds = new List<int> { 1, 2 },
				GroupQuestionIds = null
			};

			var result = await service.UpdateTestFromBankAsync(1, dto);

			result.IsSuccess.Should().BeTrue();
			result.Data.Should().Be($"Updated successfully TestId={existing.TestId}");
			existing.TotalQuestion.Should().Be(2);
			uowMock.Verify(u => u.TestQuestions.AddRangeAsync(It.IsAny<IEnumerable<TestQuestion>>()), Times.Once);
			uowMock.Verify(u => u.SaveChangesAsync(), Times.AtLeastOnce);
		}

		// UTCID03: Successful creation with group questions only - IsPublish = False, testId=1
		// Expected: True -> "Created successfully (testId: 1)"
		// Input: userId="11111111-1111-1111-1111-111111111111",Title ="Example title", TestSkill=3, Description="Example description", Duration=60, 
		// SingleQuestionIds=null, QuestionGroupIds=List<int> with questionGroupId valid
		[Trait("Category", "UpdateTestFromBankAsync")]
		[Trait("TestCase", "UTCID03")]
		[Fact]
		public async Task UTCID03_UpdateTestFromBankAsync_WhenOnlyGroupQuestions_UpdatesExistingTest()
		{
			var service = CreateService(out var uowMock, out var testRepoMock, out _, out _);

			var existing = CreateTest(1, TestType.Practice, TestSkill.LR, published: false);
			existing.VisibilityStatus = TestVisibilityStatus.Hidden;
			testRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(existing);

			var groupRepoMock = new Mock<IQuestionGroupRepository>();
			var testQuestionRepoMock = new Mock<ITestQuestionRepository>();
			uowMock.SetupGet(u => u.QuestionGroups).Returns(groupRepoMock.Object);
			uowMock.SetupGet(u => u.TestQuestions).Returns(testQuestionRepoMock.Object);

			testQuestionRepoMock.Setup(r => r.GetByTestIdAsync(existing.TestId))
				.ReturnsAsync(new List<TestQuestion>());

			groupRepoMock.Setup(r => r.GetByListIdAsync(It.IsAny<List<int>>()))
				.ReturnsAsync(new List<QuestionGroupSnapshotDto>
				{
					new QuestionGroupSnapshotDto
					{
						QuestionGroupId = 1,
						PartId = 2,
						QuestionSnapshots = new List<QuestionSnapshotDto>
						{
							new QuestionSnapshotDto { QuestionId = 10, PartId = 2 },
							new QuestionSnapshotDto { QuestionId = 11, PartId = 2 }
						}
					}
				});

			var dto = new UpdateTestFromBank
			{
				Title = "Example title",
				Description = "Example description",
				TestSkill = TestSkill.LR,
				TestType = TestType.Practice,
				Duration = 60,
				SingleQuestionIds = null,
				GroupQuestionIds = new List<int> { 1 }
			};

			var result = await service.UpdateTestFromBankAsync(1, dto);

			result.IsSuccess.Should().BeTrue();
			result.Data.Should().Be($"Updated successfully TestId={existing.TestId}");
			uowMock.Verify(u => u.TestQuestions.AddRangeAsync(It.IsAny<IEnumerable<TestQuestion>>()), Times.Once);
			uowMock.Verify(u => u.SaveChangesAsync(), Times.AtLeastOnce);
		}

		// UTCID04: Successful creation with both single and group questions  - IsPublish = False, testId=1
		// Expected: True -> "Created successfully (testId: 1)"
		// Input: userId="11111111-1111-1111-1111-111111111111",Title ="Example title", TestSkill=3, Description="Example description", Duration=60, 
		// SingleQuestionIds=List<int> with questionGroupId valid, QuestionGroupIds=List<int> with questionGroupId valid
		[Trait("Category", "UpdateTestFromBankAsync")]
		[Trait("TestCase", "UTCID04")]
		[Fact]
		public async Task UTCID04_UpdateTestFromBankAsync_WhenSingleAndGroupQuestions_UpdatesExistingTest()
		{
			var service = CreateService(out var uowMock, out var testRepoMock, out _, out _);

			var existing = CreateTest(1, TestType.Practice, TestSkill.LR, published: false);
			existing.VisibilityStatus = TestVisibilityStatus.Hidden;
			testRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(existing);

			var questionRepoMock = new Mock<IQuestionRepository>();
			var groupRepoMock = new Mock<IQuestionGroupRepository>();
			var testQuestionRepoMock = new Mock<ITestQuestionRepository>();
			uowMock.SetupGet(u => u.Questions).Returns(questionRepoMock.Object);
			uowMock.SetupGet(u => u.QuestionGroups).Returns(groupRepoMock.Object);
			uowMock.SetupGet(u => u.TestQuestions).Returns(testQuestionRepoMock.Object);

			testQuestionRepoMock.Setup(r => r.GetByTestIdAsync(existing.TestId))
				.ReturnsAsync(new List<TestQuestion>());

			questionRepoMock.Setup(r => r.GetByListIdAsync(It.IsAny<List<int>>()))
				.ReturnsAsync(new List<QuestionSnapshotDto>
				{
					new QuestionSnapshotDto { QuestionId = 1, PartId = 1 }
				});

			groupRepoMock.Setup(r => r.GetByListIdAsync(It.IsAny<List<int>>()))
				.ReturnsAsync(new List<QuestionGroupSnapshotDto>
				{
					new QuestionGroupSnapshotDto
					{
						QuestionGroupId = 2,
						PartId = 2,
						QuestionSnapshots = new List<QuestionSnapshotDto>
						{
							new QuestionSnapshotDto { QuestionId = 10, PartId = 2 }
						}
					}
				});

			var dto = new UpdateTestFromBank
			{
				Title = "Example title",
				Description = "Example description",
				TestSkill = TestSkill.LR,
				TestType = TestType.Practice,
				Duration = 60,
				SingleQuestionIds = new List<int> { 1 },
				GroupQuestionIds = new List<int> { 2 }
			};

			var result = await service.UpdateTestFromBankAsync(1, dto);

			result.IsSuccess.Should().BeTrue();
			result.Data.Should().Be($"Updated successfully TestId={existing.TestId}");
			existing.TotalQuestion.Should().Be(2);
			uowMock.Verify(u => u.TestQuestions.AddRangeAsync(It.IsAny<IEnumerable<TestQuestion>>()), Times.Once);
			uowMock.Verify(u => u.SaveChangesAsync(), Times.AtLeastOnce);
		}


		// UTCID05: Test not found - IsPublish = False, testId=0
		// Expected: FALSE -> "Test not found"
		// Input: userId="11111111-1111-1111-1111-111111111111",Title ="Example title", TestSkill=3, Description="Example description", Duration=60, 
		// SingleQuestionIds=List<int> with questionId valid, QuestionGroupIds=null
		[Trait("Category", "UpdateTestFromBankAsync")]
		[Trait("TestCase", "UTCID05")]
		[Fact]
		public async Task UTCID05_UpdateTestFromBankAsync_WhenTestNotFound_ReturnsFailure()
		{
			var service = CreateService(out var uowMock, out var testRepoMock, out _, out _);
			testRepoMock.Setup(r => r.GetByIdAsync(0)).ReturnsAsync((Test)null!);

			var dto = new UpdateTestFromBank
			{
				Title = "Example title",
				Description = "Example description",
				TestSkill = TestSkill.LR,
				TestType = TestType.Practice,
				Duration = 60,
				SingleQuestionIds = new List<int> { 1 },
				GroupQuestionIds = null
			};

			var result = await service.UpdateTestFromBankAsync(0, dto);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Test not found");
		}

		// UTCID06: Test đã public -> clone bản mới - IsPublish = true, testId=1
		// Expected: true -> "Cloned to new version v2 (TestId=2)"
		// Input: userId="11111111-1111-1111-1111-111111111111",Title ="Example title", TestSkill=3, Description="Example description", Duration=60, 
		// SingleQuestionIds=List<int> with questionId valid, QuestionGroupIds=null
		[Trait("Category", "UpdateTestFromBankAsync")]
		[Trait("TestCase", "UTCID06")]
		[Fact]
		public async Task UTCID06_UpdateTestFromBankAsync_WhenPublishedTest_ClonesNewVersion()
		{
			var service = CreateService(out var uowMock, out var testRepoMock, out _, out _);

			var existing = CreateTest(1, TestType.Practice, TestSkill.LR, published: true);
			existing.ParentTestId = 1;
			existing.Version = 1;
			testRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(existing);

			testRepoMock.Setup(r => r.GetNextVersionAsync(1)).ReturnsAsync(2);

			Test? clonedTest = null;
			testRepoMock.Setup(r => r.AddAsync(It.IsAny<Test>()))
				.Callback<Test>(t => clonedTest = t)
				.ReturnsAsync((Test t) => t);

			var questionRepoMock = new Mock<IQuestionRepository>();
			var testQuestionRepoMock = new Mock<ITestQuestionRepository>();
			uowMock.SetupGet(u => u.Questions).Returns(questionRepoMock.Object);
			uowMock.SetupGet(u => u.TestQuestions).Returns(testQuestionRepoMock.Object);

			questionRepoMock.Setup(r => r.GetByListIdAsync(It.IsAny<List<int>>()))
				.ReturnsAsync(new List<QuestionSnapshotDto>
				{
					new QuestionSnapshotDto { QuestionId = 1, PartId = 1 }
				});

			var dto = new UpdateTestFromBank
			{
				Title = "Example title",
				Description = "Example description",
				TestSkill = TestSkill.LR,
				TestType = TestType.Practice,
				Duration = 60,
				SingleQuestionIds = new List<int> { 1 },
				GroupQuestionIds = null
			};

			var result = await service.UpdateTestFromBankAsync(1, dto);

			result.IsSuccess.Should().BeTrue();
			result.Data.Should().StartWith("Cloned to new version v");
			clonedTest.Should().NotBeNull();
			clonedTest!.Title.Should().Be(dto.Title);
			clonedTest.Description.Should().Be(dto.Description);
			clonedTest.TestSkill.Should().Be(dto.TestSkill);
			clonedTest.TestType.Should().Be(dto.TestType);
			uowMock.Verify(u => u.TestQuestions.AddRangeAsync(It.IsAny<IEnumerable<TestQuestion>>()), Times.Once);
			uowMock.Verify(u => u.SaveChangesAsync(), Times.AtLeastOnce);
		}

		#endregion

		#region CloneTestAsync Tests
		// Helper method

		// UTCID01: không tìm thấy source test
		// Expected: false -> exception "Source test not found"
		// Input: sourceTestId=0
		[Trait("Category", "CloneTestAsync")]
		[Trait("TestCase", "UTCID01")]
		[Fact]
		public async Task UTCID01_CloneTestAsync_WhenSourceTestNotFound_ThrowsException()
		{
			var service = CreateService(out var uowMock, out var testRepoMock, out _, out _);

			testRepoMock.Setup(r => r.GetByIdAsync(0)).ReturnsAsync((Test)null!);

			Func<Task> act = async () => await service.CloneTestAsync(0);

			await act.Should().ThrowAsync<Exception>()
				.WithMessage("Source test not found");
			uowMock.Verify(u => u.SaveChangesAsync(), Times.Never);
		}

		// UTCID02: clone thành công
		// Expected: true -> Test with TestQuestion
		// Input: sourceTestId=1
		[Trait("Category", "CloneTestAsync")]
		[Trait("TestCase", "UTCID02")]
		[Fact]
		public async Task UTCID02_CloneTestAsync_WhenSourceHasQuestions_ClonesWithTestQuestions()
		{
			var service = CreateService(out var uowMock, out var testRepoMock, out _, out _);

			var source = new Test
			{
				TestId = 1,
				Title = "Source Test",
				Description = "Description",
				AudioUrl = "audio.mp3",
				Duration = 60,
				TotalQuestion = 2,
				TestSkill = TestSkill.LR,
				TestType = TestType.Practice,
				VisibilityStatus = TestVisibilityStatus.Published,
				CreationStatus = TestCreationStatus.Completed,
				Version = 1,
				TestQuestions = new List<TestQuestion>
				{
					new TestQuestion
					{
						PartId = 1,
						OrderInTest = 1,
						SourceType = QuestionSourceType.FromBank,
						SnapshotJson = "{\"q\":1}"
					},
					new TestQuestion
					{
						PartId = 2,
						OrderInTest = 2,
						SourceType = QuestionSourceType.FromBank,
						SnapshotJson = "{\"q\":2}"
					}
				}
			};

			testRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(source);

			var clone = await service.CloneTestAsync(1);

			clone.Should().NotBeNull();
			clone.Should().NotBeSameAs(source);

			clone.Title.Should().Be(source.Title);
			clone.Description.Should().Be(source.Description);
			clone.AudioUrl.Should().Be(source.AudioUrl);
			clone.Duration.Should().Be(source.Duration);
			clone.TotalQuestion.Should().Be(source.TotalQuestion);
			clone.TestSkill.Should().Be(source.TestSkill);
			clone.TestType.Should().Be(source.TestType);
			clone.VisibilityStatus.Should().Be(TestVisibilityStatus.Hidden);
			clone.CreationStatus.Should().Be(TestCreationStatus.Completed);
			clone.ParentTestId.Should().Be(source.TestId);
			clone.Version.Should().Be(source.Version + 1);

			clone.TestQuestions.Should().HaveCount(source.TestQuestions.Count);
			for (int i = 0; i < source.TestQuestions.Count; i++)
			{
				var srcQ = source.TestQuestions.ElementAt(i);
				var clonedQ = clone.TestQuestions.ElementAt(i);

				clonedQ.PartId.Should().Be(srcQ.PartId);
				clonedQ.OrderInTest.Should().Be(srcQ.OrderInTest);
				clonedQ.SourceType.Should().Be(srcQ.SourceType);
				clonedQ.SnapshotJson.Should().Be(srcQ.SnapshotJson);
			}

			uowMock.Verify(u => u.Tests.AddAsync(It.IsAny<Test>()), Times.Once);
			uowMock.Verify(u => u.SaveChangesAsync(), Times.Once);
		}

		// UTCID03: clone thành công
		// Expected: true -> Test do not have TestQuestion
		// Input: sourceTestId=2
		[Trait("Category", "CloneTestAsync")]
		[Trait("TestCase", "UTCID03")]
		[Fact]
		public async Task UTCID03_CloneTestAsync_WhenSourceHasNoQuestions_ClonesWithoutTestQuestions()
		{
			var service = CreateService(out var uowMock, out var testRepoMock, out _, out _);

			var source = new Test
			{
				TestId = 2,
				Title = "Source Test No Questions",
				Description = "Description",
				AudioUrl = "audio2.mp3",
				Duration = 45,
				TotalQuestion = 0,
				TestSkill = TestSkill.LR,
				TestType = TestType.Practice,
				VisibilityStatus = TestVisibilityStatus.Published,
				CreationStatus = TestCreationStatus.Completed,
				Version = 3,
				TestQuestions = new List<TestQuestion>()
			};

			testRepoMock.Setup(r => r.GetByIdAsync(2)).ReturnsAsync(source);

			var clone = await service.CloneTestAsync(2);

			clone.Should().NotBeNull();
			clone.Title.Should().Be(source.Title);
			clone.TotalQuestion.Should().Be(source.TotalQuestion);
			clone.TestQuestions.Should().BeEmpty();
			clone.ParentTestId.Should().Be(source.TestId);
			clone.Version.Should().Be(source.Version + 1);

			uowMock.Verify(u => u.Tests.AddAsync(It.IsAny<Test>()), Times.Once);
			uowMock.Verify(u => u.SaveChangesAsync(), Times.Once);
		}

		#endregion

		#region GetVersionsByParentIdAsync Tests
		// Helper method

		// UTCID01: không tìm thấy 
		// Expected: false -> "Parent test not found"
		// Input: parentTestId=0
		[Trait("Category", "GetVersionsByParentIdAsync")]
		[Trait("TestCase", "UTCID01")]
		[Fact]
		public async Task UTCID01_GetVersionsByParentIdAsync_WhenParentTestNotFound_ReturnsFailure()
		{
			var service = CreateService(out var uowMock, out var testRepoMock, out _, out _);

			testRepoMock.Setup(r => r.GetTestByIdAsync(0)).ReturnsAsync((Test)null!);

			var result = await service.GetVersionsByParentIdAsync(0);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Parent test not found");
			uowMock.Verify(u => u.Tests.GetVersionsByParentIdAsync(It.IsAny<int>()), Times.Never);
		}

		// UTCID02: thành công
		// Expected: true -> List<TestVersionDto>
		// Input: parentTestId=1
		[Trait("Category", "GetVersionsByParentIdAsync")]
		[Trait("TestCase", "UTCID02")]
		[Fact]
		public async Task UTCID02_GetVersionsByParentIdAsync_WhenParentExists_ReturnsOrderedVersionList()
		{
			var service = CreateService(out var uowMock, out var testRepoMock, out _, out _);

			var parent = new Test
			{
				TestId = 1,
				Title = "Parent Test",
				Version = 1,
				CreationStatus = TestCreationStatus.Completed,
				VisibilityStatus = TestVisibilityStatus.Published,
				CreatedAt = DateTimeHelper.Now.AddDays(-5)
			};

			var v1 = new Test
			{
				TestId = 1,
				Title = "Parent Test v1",
				Version = 1,
				CreationStatus = TestCreationStatus.Completed,
				VisibilityStatus = TestVisibilityStatus.Published,
				CreatedAt = DateTimeHelper.Now.AddDays(-5),
				UpdatedAt = DateTimeHelper.Now.AddDays(-4)
			};

			var v2 = new Test
			{
				TestId = 2,
				Title = "Parent Test v2",
				Version = 2,
				CreationStatus = TestCreationStatus.Completed,
				VisibilityStatus = TestVisibilityStatus.Hidden,
				CreatedAt = DateTimeHelper.Now.AddDays(-3),
				UpdatedAt = DateTimeHelper.Now.AddDays(-2)
			};

			testRepoMock.Setup(r => r.GetTestByIdAsync(1)).ReturnsAsync(parent);
			testRepoMock.Setup(r => r.GetVersionsByParentIdAsync(1))
				.ReturnsAsync(new List<Test> { v1, v2 });

			var result = await service.GetVersionsByParentIdAsync(1);

			result.IsSuccess.Should().BeTrue();
			result.Data.Should().NotBeNull();

			var dtos = result.Data!;
			dtos.Should().HaveCount(2);

			// Ordered by Version desc
			dtos[0].TestId.Should().Be(v2.TestId);
			dtos[0].Version.Should().Be(v2.Version);
			dtos[0].Title.Should().Be(v2.Title);
			dtos[0].CreationStatus.Should().Be(v2.CreationStatus);
			dtos[0].VisibilityStatus.Should().Be(v2.VisibilityStatus);
			dtos[0].CreatedAt.Should().Be(v2.CreatedAt);
			dtos[0].UpdatedAt.Should().Be(v2.UpdatedAt);

			dtos[1].TestId.Should().Be(v1.TestId);
			dtos[1].Version.Should().Be(v1.Version);
			dtos[1].Title.Should().Be(v1.Title);
			dtos[1].CreationStatus.Should().Be(v1.CreationStatus);
			dtos[1].VisibilityStatus.Should().Be(v1.VisibilityStatus);
			dtos[1].CreatedAt.Should().Be(v1.CreatedAt);
			dtos[1].UpdatedAt.Should().Be(v1.UpdatedAt);

			uowMock.Verify(u => u.Tests.GetVersionsByParentIdAsync(1), Times.Once);
		}

		// UTCID03: exception khi truy xuất database
		// Expected: false -> ex.Message
		// Input: parentTestId=2
		[Trait("Category", "GetVersionsByParentIdAsync")]
		[Trait("TestCase", "UTCID03")]
		[Fact]
		public async Task UTCID03_GetVersionsByParentIdAsync_WhenRepositoryThrows_PropagatesException()
		{
			var service = CreateService(out var uowMock, out var testRepoMock, out _, out _);
			var exception = new Exception("Database error");

			testRepoMock.Setup(r => r.GetTestByIdAsync(2)).ThrowsAsync(exception);

			Func<Task> act = async () => await service.GetVersionsByParentIdAsync(2);

			await act.Should().ThrowAsync<Exception>()
				.WithMessage("Database error");
		}
		#endregion

		#region CreateDraftManualAsync Tests	
		// Helper method

		// UTCID01: thành công 
		// Expected: true -> "TestId: 1"
		// Input: userId="11111111-1111-1111-1111-111111111111", 
		// CreateTestManualDraftDto: title="TOEIC Test 1",description="Listening & Reading test",AudioUrl="https://cdn/new.mp3",TestSkill=TestSkill.LR
		[Trait("Category", "CreateDraftManualAsync")]
		[Trait("TestCase", "UTCID01")]
		[Fact]
		public async Task UTCID01_CreateDraftManualAsync_WhenValidInput_ReturnsSuccessWithTestId()
		{
			var service = CreateService(out var uowMock, out var testRepoMock, out _, out _);

			// Arrange repository to assign TestId after add
			testRepoMock.Setup(r => r.AddAsync(It.IsAny<Test>()))
				.ReturnsAsync((Test t) =>
				{
					t.TestId = 1;
					return t;
				});

			var userId = Guid.Parse("11111111-1111-1111-1111-111111111111");
			var dto = new CreateTestManualDraftDto
			{
				Title = "TOEIC Test 1",
				Description = "Listening & Reading test",
				AudioUrl = "https://cdn/new.mp3",
				TestSkill = TestSkill.LR
			};

			var result = await service.CreateDraftManualAsync(userId, dto);

			result.IsSuccess.Should().BeTrue();
			result.Data.Should().Be("TestId: 1");
			testRepoMock.Verify(r => r.AddAsync(It.IsAny<Test>()), Times.Once);
			uowMock.Verify(u => u.SaveChangesAsync(), Times.Once);
		}

		// UTCID02: exception
		// Expected: false -> "Create draft failed: {ex.Message}"
		// Input: userId="11111111-1111-1111-1111-111111111111", 
		// CreateTestManualDraftDto: title="TOEIC Test 1",description="Listening & Reading test",AudioUrl="https://cdn/new.mp3",TestSkill=TestSkill.LR
		[Trait("Category", "CreateDraftManualAsync")]
		[Trait("TestCase", "UTCID02")]
		[Fact]
		public async Task UTCID02_CreateDraftManualAsync_WhenExceptionThrown_ReturnsFailureWithMessage()
		{
			var service = CreateService(out var uowMock, out var testRepoMock, out _, out _);

			var exception = new Exception("Database error");
			testRepoMock.Setup(r => r.AddAsync(It.IsAny<Test>())).ThrowsAsync(exception);

			var userId = Guid.Parse("11111111-1111-1111-1111-111111111111");
			var dto = new CreateTestManualDraftDto
			{
				Title = "TOEIC Test 1",
				Description = "Listening & Reading test",
				AudioUrl = "https://cdn/new.mp3",
				TestSkill = TestSkill.LR
			};

			var result = await service.CreateDraftManualAsync(userId, dto);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Create draft failed: Database error");
		}

		#endregion

		#region SavePartManualAsync Tests
		// Helper method

		// UTCID01: Ko tim thay test
		// Expected: false -> "Test not found"
		// Input: testId=0, userId="11111111-1111-1111-1111-111111111111"
		[Trait("Category", "SavePartManualAsync")]
		[Trait("TestCase", "UTCID01")]
		[Fact]
		public async Task UTCID01_SavePartManualAsync_WhenTestNotFound_ReturnsFailure()
		{
			var service = CreateService(out var uowMock, out var testRepoMock, out _, out _);
			SetupTransactionMocks(uowMock);

			testRepoMock.Setup(r => r.GetByIdAsync(0)).ReturnsAsync((Test)null!);

			var userId = Guid.Parse("11111111-1111-1111-1111-111111111111");
			var dto = new PartDto();

			var result = await service.SavePartManualAsync(userId, 0, 1, dto);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Test not found");
			uowMock.Verify(u => u.CommitTransactionAsync(), Times.Never);
			uowMock.Verify(u => u.RollbackTransactionAsync(), Times.Never);
		}

		// UTCID02: 
		// Expected: false -> "Cannot edit a published test. Please clone to create a new version."
		// Input: testId=4 (Test published), userId="11111111-1111-1111-1111-111111111111"
		// partId=1, PartDto=Part with id = 12 and have valid question
		[Trait("Category", "SavePartManualAsync")]
		[Trait("TestCase", "UTCID02")]
		[Fact]
		public async Task UTCID02_SavePartManualAsync_WhenTestPublished_ReturnsFailure()
		{
			var service = CreateService(out var uowMock, out var testRepoMock, out _, out _);
			SetupTransactionMocks(uowMock);

			var test = CreateTest(4, TestType.Simulator, TestSkill.LR, published: true);
			testRepoMock.Setup(r => r.GetByIdAsync(test.TestId)).ReturnsAsync(test);

			var userId = Guid.Parse("11111111-1111-1111-1111-111111111111");
			var dto = new PartDto
			{
				Groups = new List<QuestionGroupDto>()
			};

			var result = await service.SavePartManualAsync(userId, test.TestId, 1, dto);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Cannot edit a published test. Please clone to create a new version.");
			uowMock.Verify(u => u.CommitTransactionAsync(), Times.Never);
			uowMock.Verify(u => u.RollbackTransactionAsync(), Times.Never);
		}

		// UTCID03: 
		// Expected: false -> "Part 12 (S-Part 2) is not a Listening or Reading part. TestSkill is LR but Part skill is Speaking"
		// Input: testId=2 (LR), userId="11111111-1111-1111-1111-111111111111"
		// partId=12, PartDto=Part with id = 12 and have valid question
		[Trait("Category", "SavePartManualAsync")]
		[Trait("TestCase", "UTCID03")]
		[Fact]
		public async Task UTCID03_SavePartManualAsync_WhenLRTestWithNonLRPart_ReturnsFailure()
		{
			var service = CreateService(out var uowMock, out var testRepoMock, out _, out _);
			SetupTransactionMocks(uowMock);

			var partRepoMock = new Mock<IPartRepository>();
			uowMock.SetupGet(u => u.Parts).Returns(partRepoMock.Object);

			var test = CreateTest(2, TestType.Simulator, TestSkill.LR, published: false);
			testRepoMock.Setup(r => r.GetByIdAsync(test.TestId)).ReturnsAsync(test);

			partRepoMock.Setup(r => r.GetByIdAsync(12)).ReturnsAsync(new Part
			{
				PartId = 12,
				Name = "S-Part 2",
				Skill = QuestionSkill.Speaking
			});

			var userId = Guid.Parse("11111111-1111-1111-1111-111111111111");
			var dto = new PartDto
			{
				Questions = new List<QuestionDto>
				{
					new QuestionDto { Content = "Sample Q" }
				}
			};

			var result = await service.SavePartManualAsync(userId, test.TestId, 12, dto);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Part 12 (S-Part 2) is not a Listening or Reading part. TestSkill is LR but Part skill is Speaking");
			uowMock.Verify(u => u.CommitTransactionAsync(), Times.Never);
			uowMock.Verify(u => u.RollbackTransactionAsync(), Times.Never);
		}

		// UTCID04:
		// Expected: false -> "Part 1 (L-Part 1) is not a Writing part. TestSkill is Writing but Part skill is Listening"
		// Input: testId=3 (Writing), userId="11111111-1111-1111-1111-111111111111"
		// partId=1, PartDto=Part with id = 1 and have valid question
		[Trait("Category", "SavePartManualAsync")]
		[Trait("TestCase", "UTCID04")]
		[Fact]
		public async Task UTCID04_SavePartManualAsync_WhenWritingTestWithListeningPart_ReturnsFailure()
		{
			var service = CreateService(out var uowMock, out var testRepoMock, out _, out _);
			SetupTransactionMocks(uowMock);

			var partRepoMock = new Mock<IPartRepository>();
			uowMock.SetupGet(u => u.Parts).Returns(partRepoMock.Object);

			var test = CreateTest(3, TestType.Simulator, TestSkill.Writing, published: false);
			testRepoMock.Setup(r => r.GetByIdAsync(test.TestId)).ReturnsAsync(test);

			partRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(new Part
			{
				PartId = 1,
				Name = "L-Part 1",
				Skill = QuestionSkill.Listening
			});

			var userId = Guid.Parse("11111111-1111-1111-1111-111111111111");
			var dto = new PartDto
			{
				Questions = new List<QuestionDto>
				{
					new QuestionDto { Content = "Sample Q" }
				}
			};

			var result = await service.SavePartManualAsync(userId, test.TestId, 1, dto);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Part 1 (L-Part 1) is not a Writing part. TestSkill is Writing but Part skill is Listening");
			uowMock.Verify(u => u.CommitTransactionAsync(), Times.Never);
			uowMock.Verify(u => u.RollbackTransactionAsync(), Times.Never);
		}

		// UTCID05:
		// Expected: false -> "Part 1 (L-Part 1) is not a Speaking part. TestSkill is Speaking but Part skill is Listening"
		// Input: testId=1 (Speaking), userId="11111111-1111-1111-1111-111111111111"
		// partId=1, PartDto=Part with id = 1 and have valid question
		[Trait("Category", "SavePartManualAsync")]
		[Trait("TestCase", "UTCID05")]
		[Fact]
		public async Task UTCID05_SavePartManualAsync_WhenSpeakingTestWithListeningPart_ReturnsFailure()
		{
			var service = CreateService(out var uowMock, out var testRepoMock, out _, out _);
			SetupTransactionMocks(uowMock);

			var partRepoMock = new Mock<IPartRepository>();
			uowMock.SetupGet(u => u.Parts).Returns(partRepoMock.Object);

			var test = CreateTest(1, TestType.Simulator, TestSkill.Speaking, published: false);
			testRepoMock.Setup(r => r.GetByIdAsync(test.TestId)).ReturnsAsync(test);

			partRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(new Part
			{
				PartId = 1,
				Name = "L-Part 1",
				Skill = QuestionSkill.Listening
			});

			var userId = Guid.Parse("11111111-1111-1111-1111-111111111111");
			var dto = new PartDto
			{
				Questions = new List<QuestionDto>
				{
					new QuestionDto { Content = "Sample Q" }
				}
			};

			var result = await service.SavePartManualAsync(userId, test.TestId, 1, dto);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Part 1 (L-Part 1) is not a Speaking part. TestSkill is Speaking but Part skill is Listening");
			uowMock.Verify(u => u.CommitTransactionAsync(), Times.Never);
			uowMock.Verify(u => u.RollbackTransactionAsync(), Times.Never);
		}

		// UTCID06:
		// Expected: false -> "Part 999 not found"
		// Input: testId=1 (Speaking), userId="11111111-1111-1111-1111-111111111111"
		// partId=999, PartDto=Part with id = 999 and have valid question
		[Trait("Category", "SavePartManualAsync")]
		[Trait("TestCase", "UTCID06")]
		[Fact]
		public async Task UTCID06_SavePartManualAsync_WhenPartNotFound_ReturnsFailure()
		{
			var service = CreateService(out var uowMock, out var testRepoMock, out _, out _);
			SetupTransactionMocks(uowMock);

			var partRepoMock = new Mock<IPartRepository>();
			uowMock.SetupGet(u => u.Parts).Returns(partRepoMock.Object);

			var test = CreateTest(1, TestType.Simulator, TestSkill.Speaking, published: false);
			testRepoMock.Setup(r => r.GetByIdAsync(test.TestId)).ReturnsAsync(test);

			partRepoMock.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((Part)null!);

			var userId = Guid.Parse("11111111-1111-1111-1111-111111111111");
			var dto = new PartDto
			{
				Questions = new List<QuestionDto>
				{
					new QuestionDto { Content = "Sample Q" }
				}
			};

			var result = await service.SavePartManualAsync(userId, test.TestId, 999, dto);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Part 999 not found");
			uowMock.Verify(u => u.CommitTransactionAsync(), Times.Never);
			uowMock.Verify(u => u.RollbackTransactionAsync(), Times.Never);
		}

		// UTCID07:
		// Expected: false -> "No questions to save for this part."
		// Input: testId=1 (Speaking), userId="11111111-1111-1111-1111-111111111111"
		// partId=1, PartDto=Part with no question
		[Trait("Category", "SavePartManualAsync")]
		[Trait("TestCase", "UTCID07")]
		[Fact]
		public async Task UTCID07_SavePartManualAsync_WhenNoQuestions_ReturnsFailure()
		{
			var service = CreateService(out var uowMock, out var testRepoMock, out _, out _);
			SetupTransactionMocks(uowMock);
			var partRepoMock = new Mock<IPartRepository>();

			var test = CreateTest(1, TestType.Simulator, TestSkill.Speaking, published: false);
			testRepoMock.Setup(r => r.GetByIdAsync(test.TestId)).ReturnsAsync(test);
			partRepoMock.Setup(r => r.GetByIdAsync(12)).ReturnsAsync(new Part
			{
				PartId = 12,
				Name = "S-Part 2",
				Skill = QuestionSkill.Speaking
			});
			uowMock.SetupGet(u => u.Parts).Returns(partRepoMock.Object);

			var userId = Guid.Parse("11111111-1111-1111-1111-111111111111");
			var dto = new PartDto
			{
				Groups = new List<QuestionGroupDto>(),
				Questions = new List<QuestionDto>()
			};

			var result = await service.SavePartManualAsync(userId, test.TestId, 12, dto);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("No questions to save for this part.");
		}

		// UTCID08:
		// Expected: true -> "Saved Part 5 successfully"
		// Input: testId=2 (LR), userId="11111111-1111-1111-1111-111111111111"
		// partId=5, PartDto=Part with id = 5 and have valid question
		[Trait("Category", "SavePartManualAsync")]
		[Trait("TestCase", "UTCID08")]
		[Fact]
		public async Task UTCID08_SavePartManualAsync_WhenValidInput_SavesPartAndReturnsSuccess()
		{
			var service = CreateService(out var uowMock, out var testRepoMock, out _, out _);
			SetupTransactionMocks(uowMock);

			var partRepoMock = new Mock<IPartRepository>();
			var testQuestionRepoMock = new Mock<ITestQuestionRepository>();

			uowMock.SetupGet(u => u.Parts).Returns(partRepoMock.Object);
			uowMock.SetupGet(u => u.TestQuestions).Returns(testQuestionRepoMock.Object);

			var test = CreateTest(2, TestType.Simulator, TestSkill.LR, published: false);
			testRepoMock.Setup(r => r.GetByIdAsync(test.TestId)).ReturnsAsync(test);

			partRepoMock.Setup(r => r.GetByIdAsync(5)).ReturnsAsync(new Part
			{
				PartId = 5,
				Name = "L-Part 5",
				Skill = QuestionSkill.Listening
			});

			testQuestionRepoMock.Setup(r => r.GetByTestAndPartAsync(test.TestId, 5))
				.ReturnsAsync(new List<TestQuestion>());

			testQuestionRepoMock.Setup(r => r.GetByTestIdAsync(test.TestId))
				.ReturnsAsync(new List<TestQuestion>());

			testQuestionRepoMock.Setup(r => r.AddRangeAsync(It.IsAny<IEnumerable<TestQuestion>>()))
				.Returns(Task.CompletedTask);

			var userId = Guid.Parse("11111111-1111-1111-1111-111111111111");
			var dto = new PartDto
			{
				Questions = new List<QuestionDto>
				{
					new QuestionDto { Content = "Sample Q" }
				}
			};

			var result = await service.SavePartManualAsync(userId, test.TestId, 5, dto);

			result.IsSuccess.Should().BeTrue();
			result.Data.Should().Be("Saved Part 5 successfully");
			uowMock.Verify(u => u.SaveChangesAsync(), Times.AtLeastOnce);
			uowMock.Verify(u => u.CommitTransactionAsync(), Times.Once);
		}

		// UTCID09: exception khi lưu thay đổi vào database
		// Expected: false ->"Save part failed: {ex.Message}"
		// Input: testId=1 (Speaking), userId="11111111-1111-1111-1111-111111111111"
		// partId=12, PartDto=Part with id = 12 and have valid question
		[Trait("Category", "SavePartManualAsync")]
		[Trait("TestCase", "UTCID09")]
		[Fact]
		public async Task UTCID09_SavePartManualAsync_WhenExceptionThrown_RollsBackAndReturnsFailure()
		{
			var service = CreateService(out var uowMock, out var testRepoMock, out _, out _);
			SetupTransactionMocks(uowMock);

			var partRepoMock = new Mock<IPartRepository>();
			var testQuestionRepoMock = new Mock<ITestQuestionRepository>();

			uowMock.SetupGet(u => u.Parts).Returns(partRepoMock.Object);
			uowMock.SetupGet(u => u.TestQuestions).Returns(testQuestionRepoMock.Object);

			var test = CreateTest(1, TestType.Simulator, TestSkill.Speaking, published: false);
			testRepoMock.Setup(r => r.GetByIdAsync(test.TestId)).ReturnsAsync(test);

			partRepoMock.Setup(r => r.GetByIdAsync(12)).ReturnsAsync(new Part
			{
				PartId = 12,
				Name = "S-Part 2",
				Skill = QuestionSkill.Speaking
			});

			testQuestionRepoMock.Setup(r => r.GetByTestAndPartAsync(test.TestId, 12))
				.ReturnsAsync(new List<TestQuestion>());

			testQuestionRepoMock.Setup(r => r.GetByTestIdAsync(test.TestId))
				.ThrowsAsync(new Exception("Database error"));

			var userId = Guid.Parse("11111111-1111-1111-1111-111111111111");
			var dto = new PartDto
			{
				Questions = new List<QuestionDto>
				{
					new QuestionDto { Content = "Sample Q" }
				}
			};

			var result = await service.SavePartManualAsync(userId, test.TestId, 12, dto);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Save part failed: Database error");
			uowMock.Verify(u => u.RollbackTransactionAsync(), Times.Once);
		}

		#endregion

		#region FinalizeTestAsync Tests
		// Helper method

		// UTCID01: Ko tim thay test
		// Expected: false -> "Test not found"
		// Input: testId=0, userId="11111111-1111-1111-1111-111111111111"
		[Trait("Category", "FinalizeTestAsync")]
		[Trait("TestCase", "UTCID01")]
		[Fact]
		public async Task UTCID01_FinalizeTestAsync_WhenTestNotFound_ReturnsFailure()
		{
			var service = CreateService(out var uowMock, out var testRepoMock, out _, out _);

			testRepoMock.Setup(r => r.GetByIdAsync(0)).ReturnsAsync((Test)null!);

			var userId = Guid.Parse("11111111-1111-1111-1111-111111111111");

			var result = await service.FinalizeTestAsync(userId, 0);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Test not found");
		}

		// UTCID02: 
		// Expected: false -> "No questions found."
		// Input: testId=4 (0 question), userId="11111111-1111-1111-1111-111111111111"
		[Trait("Category", "FinalizeTestAsync")]
		[Trait("TestCase", "UTCID02")]
		[Fact]
		public async Task UTCID02_FinalizeTestAsync_WhenNoQuestions_ReturnsFailure()
		{
			var service = CreateService(out var uowMock, out var testRepoMock, out _, out _);

			var test = CreateTest(4, TestType.Simulator, TestSkill.LR, published: true, totalQuestions: 0, questions: new List<TestQuestion>());
			testRepoMock.Setup(r => r.GetByIdAsync(test.TestId)).ReturnsAsync(test);

			var testQuestionRepoMock = new Mock<ITestQuestionRepository>();
			uowMock.SetupGet(u => u.TestQuestions).Returns(testQuestionRepoMock.Object);
			testQuestionRepoMock.Setup(r => r.GetByTestIdAsync(test.TestId))
				.ReturnsAsync(new List<TestQuestion>());

			var userId = Guid.Parse("11111111-1111-1111-1111-111111111111");

			var result = await service.FinalizeTestAsync(userId, test.TestId);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("No questions found.");
		}

		// UTCID03: 
		// Expected: false -> "L&R test requires an audio file."
		// Input: testId=2 (miss audio file), userId="11111111-1111-1111-1111-111111111111"
		[Trait("Category", "FinalizeTestAsync")]
		[Trait("TestCase", "UTCID03")]
		[Fact]
		public async Task UTCID03_FinalizeTestAsync_WhenLRTestMissingAudio_ReturnsFailure()
		{
			var service = CreateService(out var uowMock, out var testRepoMock, out _, out _);

			// LR test without AudioUrl
			var test = CreateTest(2, TestType.Simulator, TestSkill.LR, published: true, totalQuestions: 1,
				questions: new List<TestQuestion> { CreateSingleQuestion(1, partId: 1, order: 1) });
			test.AudioUrl = string.Empty;

			testRepoMock.Setup(r => r.GetByIdAsync(test.TestId)).ReturnsAsync(test);

			var testQuestionRepoMock = new Mock<ITestQuestionRepository>();
			uowMock.SetupGet(u => u.TestQuestions).Returns(testQuestionRepoMock.Object);
			testQuestionRepoMock.Setup(r => r.GetByTestIdAsync(test.TestId))
				.ReturnsAsync(test.TestQuestions!.ToList());

			var userId = Guid.Parse("11111111-1111-1111-1111-111111111111");

			var result = await service.FinalizeTestAsync(userId, test.TestId);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("L&R test requires an audio file.");
		}

		// UTCID04: 
		// Expected: false -> "Test must have 200 questions, currently 100."
		// Input: testId=3 (invalid total questions), userId="11111111-1111-1111-1111-111111111111"
		[Trait("Category", "FinalizeTestAsync")]
		[Trait("TestCase", "UTCID04")]
		[Fact]
		public async Task UTCID04_FinalizeTestAsync_WhenTotalQuestionsInvalid_ReturnsFailureWithCurrentCount()
		{
			var service = CreateService(out var uowMock, out var testRepoMock, out _, out _);

			// Giả định GetExpectedQuestionCount(TestSkill.LR) = 200 cho LR test
			var test = CreateTest(3, TestType.Simulator, TestSkill.LR, published: true, totalQuestions: 100);
			testRepoMock.Setup(r => r.GetByIdAsync(test.TestId)).ReturnsAsync(test);

			// 100 câu hỏi (single) để totalQuestions = 100
			var questions = Enumerable.Range(1, 100)
				.Select(i => CreateSingleQuestion(i, partId: 1, order: i))
				.ToList();

			var testQuestionRepoMock = new Mock<ITestQuestionRepository>();
			uowMock.SetupGet(u => u.TestQuestions).Returns(testQuestionRepoMock.Object);
			testQuestionRepoMock.Setup(r => r.GetByTestIdAsync(test.TestId))
				.ReturnsAsync(questions);

			var userId = Guid.Parse("11111111-1111-1111-1111-111111111111");

			var result = await service.FinalizeTestAsync(userId, test.TestId);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Test must have 200 questions, currently 100.");
		}

		// UTCID05: 
		// Expected: true -> "Test Toeic test 1 finalized successfully!"
		// Input: testId=1, userId="11111111-1111-1111-1111-111111111111"
		[Trait("Category", "FinalizeTestAsync")]
		[Trait("TestCase", "UTCID05")]
		[Fact]
		public async Task UTCID05_FinalizeTestAsync_WhenValidFullTest_UpdatesStatusAndReturnsSuccess()
		{
			var service = CreateService(out var uowMock, out var testRepoMock, out _, out _);

			// LR test với đủ 200 câu hỏi
			var test = new Test
			{
				TestId = 1,
				Title = "Toeic test 1",
				TestType = TestType.Simulator,
				TestSkill = TestSkill.LR,
				VisibilityStatus = TestVisibilityStatus.Published,
				AudioUrl = "audio.mp3",
				CreatedAt = DateTimeHelper.Now.AddDays(-1)
			};

			testRepoMock.Setup(r => r.GetByIdAsync(test.TestId)).ReturnsAsync(test);

			// 200 câu hỏi single
			var questions = Enumerable.Range(1, 200)
				.Select(i => new TestQuestion
				{
					TestQuestionId = i,
					TestId = test.TestId,
					PartId = 1,
					IsQuestionGroup = false,
					SnapshotJson = JsonConvert.SerializeObject(new QuestionSnapshotDto
					{
						QuestionId = i,
						PartId = 1,
						Content = $"Question {i}"
					})
				})
				.ToList();

			var testQuestionRepoMock = new Mock<ITestQuestionRepository>();
			uowMock.SetupGet(u => u.TestQuestions).Returns(testQuestionRepoMock.Object);
			testQuestionRepoMock.Setup(r => r.GetByTestIdAsync(test.TestId))
				.ReturnsAsync(questions);

			var userId = Guid.Parse("11111111-1111-1111-1111-111111111111");

			var result = await service.FinalizeTestAsync(userId, test.TestId);

			result.IsSuccess.Should().BeTrue();
			result.Data.Should().Be("Test Toeic test 1 finalized successfully!");
			test.CreationStatus.Should().Be(TestCreationStatus.Completed);
			test.TotalQuestion.Should().Be(200);
			uowMock.Verify(u => u.SaveChangesAsync(), Times.Once);
		}

		#endregion

		#region SubmitLRTestAsync Tests	
		// Helper method

		// UTCID01: 
		// Expected: False -> "No answers provided."
		// Input: SubmitLRTestRequestDto: testId=1, testResultId=1,duration=60,TestType=LR,Answers=null  
		//userId="11111111-1111-1111-1111-111111111111"
		[Trait("Category", "SubmitLRTestAsync")]
		[Trait("TestCase", "UTCID01")]
		[Fact]
		public async Task UTCID01_SubmitLRTestAsync_WhenAnswersNull_ReturnsNoAnswersProvided()
		{
			var service = CreateService(out _, out _, out _, out _);

			var request = new SubmitLRTestRequestDto
			{
				TestId = 1,
				TestResultId = 1,
				Duration = 60,
				TestType = TestType.Simulator,
				Answers = null
			};

			var userId = Guid.Parse("11111111-1111-1111-1111-111111111111");

			var result = await service.SubmitLRTestAsync(userId, request);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("No answers provided.");
		}

		// UTCID02: 
		// Expected: False -> "No answers provided."
		// Input: SubmitLRTestRequestDto: testId=1, testResultId=1,duration=60,TestType=LR,Answers=empty  
		//userId="11111111-1111-1111-1111-111111111111"
		[Trait("Category", "SubmitLRTestAsync")]
		[Trait("TestCase", "UTCID02")]
		[Fact]
		public async Task UTCID02_SubmitLRTestAsync_WhenAnswersEmpty_ReturnsNoAnswersProvided()
		{
			var service = CreateService(out _, out _, out _, out _);

			var request = new SubmitLRTestRequestDto
			{
				TestId = 1,
				TestResultId = 1,
				Duration = 60,
				TestType = TestType.Simulator,
				Answers = new List<UserLRAnswerDto>()
			};

			var userId = Guid.Parse("11111111-1111-1111-1111-111111111111");

			var result = await service.SubmitLRTestAsync(userId, request);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("No answers provided.");
		}

		// UTCID03: 
		// Expected: False -> "Test session must be provided."
		// Input: SubmitLRTestRequestDto: testId=1, testResultId=null,duration=60,TestType=LR,Answers=List<UserLRAnswerDto> with valid elements  
		//userId="11111111-1111-1111-1111-111111111111"
		[Trait("Category", "SubmitLRTestAsync")]
		[Trait("TestCase", "UTCID03")]
		[Fact]
		public async Task UTCID03_SubmitLRTestAsync_WhenTestResultIdNull_ReturnsSessionMustBeProvided()
		{
			var service = CreateService(out _, out _, out _, out _);

			var request = new SubmitLRTestRequestDto
			{
				TestId = 1,
				TestResultId = null,
				Duration = 60,
				TestType = TestType.Simulator,
				Answers = new List<UserLRAnswerDto>
				{
					new UserLRAnswerDto { TestQuestionId = 10, SubQuestionIndex = 0, ChosenOptionLabel = "A" }
				}
			};

			var userId = Guid.Parse("11111111-1111-1111-1111-111111111111");

			var result = await service.SubmitLRTestAsync(userId, request);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Test session must be provided.");
		}

		// UTCID04: 
		// Expected: False -> "Test session not found."
		// Input: SubmitLRTestRequestDto: testId=1, testResultId=0,duration=60,TestType=LR,Answers=List<UserLRAnswerDto> with valid elements  
		//userId="11111111-1111-1111-1111-111111111111"
		[Trait("Category", "SubmitLRTestAsync")]
		[Trait("TestCase", "UTCID04")]
		[Fact]
		public async Task UTCID04_SubmitLRTestAsync_WhenTestResultNotFound_ReturnsFailure()
		{
			var service = CreateService(out var uowMock, out _, out var testResultRepoMock, out _);

			testResultRepoMock.Setup(r => r.GetByIdAsync(0)).ReturnsAsync((TestResult)null!);

			var request = new SubmitLRTestRequestDto
			{
				TestId = 1,
				TestResultId = 0,
				Duration = 60,
				TestType = TestType.Simulator,
				Answers = new List<UserLRAnswerDto>
				{
					new UserLRAnswerDto { TestQuestionId = 10, SubQuestionIndex = 0, ChosenOptionLabel = "A" }
				}
			};

			var userId = Guid.Parse("11111111-1111-1111-1111-111111111111");

			var result = await service.SubmitLRTestAsync(userId, request);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Test session not found.");
		}

		// UTCID05: 
		// Expected: False -> "Test session does not match the submitted data."
		// Input: SubmitLRTestRequestDto: testId=1, testResultId=2,duration=60,TestType=LR,Answers=List<UserLRAnswerDto> with valid elements  
		//userId="11111111-1111-1111-1111-111111111111"
		[Trait("Category", "SubmitLRTestAsync")]
		[Trait("TestCase", "UTCID05")]
		[Fact]
		public async Task UTCID05_SubmitLRTestAsync_WhenTestIdMismatch_ReturnsSessionDoesNotMatch()
		{
			var service = CreateService(out var uowMock, out _, out var testResultRepoMock, out _);

			// testResult có TestId khác với request.TestId
			var existingResult = CreateTestResult(2, testId: 2, userId: _userId, createdAt: DateTimeHelper.Now.AddMinutes(-10));
			testResultRepoMock.Setup(r => r.GetByIdAsync(2)).ReturnsAsync(existingResult);

			var request = new SubmitLRTestRequestDto
			{
				TestId = 1,
				TestResultId = 2,
				Duration = 60,
				TestType = TestType.Simulator,
				Answers = new List<UserLRAnswerDto>
				{
					new UserLRAnswerDto { TestQuestionId = 10, SubQuestionIndex = 0, ChosenOptionLabel = "A" }
				}
			};

			var userId = _userId;

			var result = await service.SubmitLRTestAsync(userId, request);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Test session does not match the submitted data.");
		}

		// UTCID06: 
		// Expected: False -> "Test session does not match the submitted data."
		// Input: SubmitLRTestRequestDto: testId=1, testResultId=2,duration=60,TestType=LR,Answers=List<UserLRAnswerDto> with valid elements  
		//userId="22222222-2222-2222-2222-222222222222"
		[Trait("Category", "SubmitLRTestAsync")]
		[Trait("TestCase", "UTCID06")]
		[Fact]
		public async Task UTCID06_SubmitLRTestAsync_WhenUserMismatch_ReturnsSessionDoesNotMatch()
		{
			var service = CreateService(out var uowMock, out _, out var testResultRepoMock, out _);

			// testResult có UserId khác với userId truyền vào
			var existingResult = CreateTestResult(2, testId: 1, userId: _userId, createdAt: DateTimeHelper.Now.AddMinutes(-10));
			testResultRepoMock.Setup(r => r.GetByIdAsync(2)).ReturnsAsync(existingResult);

			var request = new SubmitLRTestRequestDto
			{
				TestId = 1,
				TestResultId = 2,
				Duration = 60,
				TestType = TestType.Simulator,
				Answers = new List<UserLRAnswerDto>
				{
					new UserLRAnswerDto { TestQuestionId = 10, SubQuestionIndex = 0, ChosenOptionLabel = "A" }
				}
			};

			var userId = Guid.Parse("22222222-2222-2222-2222-222222222222");

			var result = await service.SubmitLRTestAsync(userId, request);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Test session does not match the submitted data.");
		}

		// UTCID07: 
		// Expected: False -> "This test session has already been submitted."
		// Input: SubmitLRTestRequestDto: testId=1, testResultId=3,duration=60,TestType=LR,Answers=List<UserLRAnswerDto> with valid elements  
		//userId="11111111-1111-1111-1111-111111111111"
		[Trait("Category", "SubmitLRTestAsync")]
		[Trait("TestCase", "UTCID07")]
		[Fact]
		public async Task UTCID07_SubmitLRTestAsync_WhenAlreadyGraded_ReturnsAlreadySubmitted()
		{
			var service = CreateService(out var uowMock, out _, out var testResultRepoMock, out _);

			var existingResult = CreateTestResult(3, testId: 1, userId: _userId, createdAt: DateTimeHelper.Now.AddMinutes(-10), status: TestResultStatus.Graded);
			testResultRepoMock.Setup(r => r.GetByIdAsync(3)).ReturnsAsync(existingResult);

			var request = new SubmitLRTestRequestDto
			{
				TestId = 1,
				TestResultId = 3,
				Duration = 60,
				TestType = TestType.Simulator,
				Answers = new List<UserLRAnswerDto>
				{
					new UserLRAnswerDto { TestQuestionId = 10, SubQuestionIndex = 0, ChosenOptionLabel = "A" }
				}
			};

			var userId = _userId;

			var result = await service.SubmitLRTestAsync(userId, request);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("This test session has already been submitted.");
		}

		// UTCID08: 
		// Expected: False -> "Invalid test or questions."
		// Input: SubmitLRTestRequestDto: testId=2, testResultId=1,duration=60,TestType=LR,Answers=List<UserLRAnswerDto> with valid elements  
		//userId="11111111-1111-1111-1111-111111111111"
		[Trait("Category", "SubmitLRTestAsync")]
		[Trait("TestCase", "UTCID08")]
		[Fact]
		public async Task UTCID08_SubmitLRTestAsync_WhenNoTestQuestions_ReturnsInvalidTestOrQuestions()
		{
			var service = CreateService(out var uowMock, out var testRepoMock, out var testResultRepoMock, out var userAnswerRepoMock);

			// Hợp lệ về TestResult, user, testId
			var existingResult = CreateTestResult(1, testId: 2, userId: _userId, createdAt: DateTimeHelper.Now.AddMinutes(-10));
			testResultRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(existingResult);

			testRepoMock.Setup(r => r.GetTotalQuestionAsync(2)).ReturnsAsync(100);

			var testQuestionRepoMock = new Mock<ITestQuestionRepository>();
			uowMock.SetupGet(u => u.TestQuestions).Returns(testQuestionRepoMock.Object);
			testQuestionRepoMock.Setup(r => r.GetByTestIdAsync(2))
				.ReturnsAsync(new List<TestQuestion>());

			var request = new SubmitLRTestRequestDto
			{
				TestId = 2,
				TestResultId = 1,
				Duration = 60,
				TestType = TestType.Simulator,
				Answers = new List<UserLRAnswerDto>
				{
					new UserLRAnswerDto { TestQuestionId = 10, SubQuestionIndex = 0, ChosenOptionLabel = "A" }
				}
			};

			var userId = _userId;

			var result = await service.SubmitLRTestAsync(userId, request);

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Invalid test or questions.");
		}

		// UTCID09: 
		// Expected: true -> GeneralLRResultDto
		// Input: SubmitLRTestRequestDto: testId=1, testResultId=1,duration=60,TestType=LR,Answers=List<UserLRAnswerDto> with valid elements  
		//userId="11111111-1111-1111-1111-111111111111"
		[Trait("Category", "SubmitLRTestAsync")]
		[Trait("TestCase", "UTCID09")]
		[Fact]
		public async Task UTCID09_SubmitLRTestAsync_WhenValidRequest_GradesAndReturnsResult()
		{
			var service = CreateService(out var uowMock, out var testRepoMock, out var testResultRepoMock, out var userAnswerRepoMock);

			// TestResult hợp lệ
			var existingResult = CreateTestResult(1, testId: 1, userId: _userId, createdAt: DateTimeHelper.Now.AddMinutes(-10));
			testResultRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(existingResult);

			// Tổng số câu hỏi
			testRepoMock.Setup(r => r.GetTotalQuestionAsync(1)).ReturnsAsync(1);

			// 1 câu hỏi Listening, single
			var snapshot = new QuestionSnapshotDto
			{
				QuestionId = 1,
				PartId = 1,
				Content = "Q1",
				Options = new List<OptionSnapshotDto>
				{
					new OptionSnapshotDto { Label = "A", Content = "A", IsCorrect = true },
					new OptionSnapshotDto { Label = "B", Content = "B", IsCorrect = false }
				}
			};

			var testQuestion = new TestQuestion
			{
				TestQuestionId = 10,
				TestId = 1,
				PartId = 1,
				IsQuestionGroup = false,
				SnapshotJson = JsonConvert.SerializeObject(snapshot)
			};

			var testQuestionRepoMock = new Mock<ITestQuestionRepository>();
			uowMock.SetupGet(u => u.TestQuestions).Returns(testQuestionRepoMock.Object);
			testQuestionRepoMock.Setup(r => r.GetByTestIdAsync(1))
				.ReturnsAsync(new List<TestQuestion> { testQuestion });

			// Map Part -> Listening
			var partRepoMock = new Mock<IPartRepository>();
			uowMock.SetupGet(u => u.Parts).Returns(partRepoMock.Object);
			partRepoMock.Setup(r => r.GetSkillMapByIdsAsync(It.IsAny<List<int>>()))
				.ReturnsAsync(new Dictionary<int, QuestionSkill> { { 1, QuestionSkill.Listening } });

			// Lưu UserAnswers
			userAnswerRepoMock.Setup(r => r.AddRangeAsync(It.IsAny<IEnumerable<UserAnswer>>()))
				.Returns(Task.CompletedTask);

			// Trả về kết quả chi tiết
			var expectedResult = new GeneralLRResultDto
			{
				Duration = 60,
				TotalQuestions = 1,
				SkipCount = 0,
				ListeningCorrect = 1,
				ListeningTotal = 1,
				ReadingCorrect = 0,
				ReadingTotal = 0
			};

			testResultRepoMock.Setup(r => r.GetTestResultLRAsync(existingResult.TestResultId))
				.ReturnsAsync(expectedResult);

			var request = new SubmitLRTestRequestDto
			{
				TestId = 1,
				TestResultId = 1,
				Duration = 60,
				TestType = TestType.Simulator,
				Answers = new List<UserLRAnswerDto>
				{
					new UserLRAnswerDto { TestQuestionId = 10, SubQuestionIndex = 0, ChosenOptionLabel = "A" }
				}
			};

			var userId = _userId;

			var result = await service.SubmitLRTestAsync(userId, request);

			result.IsSuccess.Should().BeTrue();
			result.Data.Should().NotBeNull();
			result.Data!.TotalQuestions.Should().Be(1);
			result.Data.ListeningCorrect.Should().Be(1);
			uowMock.Verify(u => u.UserAnswers.AddRangeAsync(It.IsAny<IEnumerable<UserAnswer>>()), Times.Once);
			uowMock.Verify(u => u.SaveChangesAsync(), Times.AtLeastOnce);
			testResultRepoMock.Verify(r => r.GetTestResultLRAsync(existingResult.TestResultId), Times.Once);
		}

		#endregion

		#region GetDashboardStatistic Tests
		// Helper method

		// UTCID01: 
		// Expected: False -> "No test results found."
		// Input:TestSkill=1,range="16/11/2025"
		//examineeId="11111111-1111-1111-1111-111111111111"
		[Trait("Category", "GetDashboardStatisticAsync")]
		[Trait("TestCase", "UTCID01")]
		[Fact]
		public async Task UTCID01_GetDashboardStatisticAsync_WhenNoResults_ReturnsFailure()
		{
			var service = CreateService(out var uowMock, out _, out var testResultRepoMock, out _);

			var examineeId = Guid.Parse("11111111-1111-1111-1111-111111111111");

			testResultRepoMock.Setup(r => r.GetResultsWithinRangeAsync(examineeId, It.IsAny<DateTime?>()))
				.ReturnsAsync(new List<TestResult>());

			var result = await service.GetDashboardStatisticAsync(examineeId, TestSkill.Speaking, "16/11/2025");

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("No test results found.");
		}

		// UTCID02: 
		// Expected: False -> "No test results found for skill: Writing"
		// Input:TestSkill=2,range="16/11/2025"
		//examineeId="11111111-1111-1111-1111-111111111111"
		[Trait("Category", "GetDashboardStatisticAsync")]
		[Trait("TestCase", "UTCID02")]
		[Fact]
		public async Task UTCID02_GetDashboardStatisticAsync_WhenNoResultsForSkill_ReturnsFailureForSkill()
		{
			var service = CreateService(out var uowMock, out _, out var testResultRepoMock, out _);

			var examineeId = Guid.Parse("11111111-1111-1111-1111-111111111111");

			// Chỉ có kết quả cho LR, không có cho Writing
			var testLR = CreateTest(1, TestType.Simulator, TestSkill.LR, published: true);
			var results = new List<TestResult>
			{
				new TestResult
				{
					TestResultId = 1,
					UserId = examineeId,
					TestId = testLR.TestId,
					Test = testLR,
					TotalScore = 800,
					TotalQuestions = 200,
					CorrectCount = 160,
					Duration = 120
				}
			};

			testResultRepoMock.Setup(r => r.GetResultsWithinRangeAsync(examineeId, It.IsAny<DateTime?>()))
				.ReturnsAsync(results);

			var result = await service.GetDashboardStatisticAsync(examineeId, TestSkill.Writing, "16/11/2025");

			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("No test results found for skill: Writing");
		}

		// UTCID03: 
		// Expected: True -> StatisticResultDto
		// Input:TestSkill=1,range="16/10/2025"
		//examineeId="11111111-1111-1111-1111-111111111111"
		[Trait("Category", "GetDashboardStatisticAsync")]
		[Trait("TestCase", "UTCID03")]
		[Fact]
		public async Task UTCID03_GetDashboardStatisticAsync_WhenResultsExist_ReturnsStatisticResultDto()
		{
			var service = CreateService(out var uowMock, out _, out var testResultRepoMock, out _);

			var examineeId = Guid.Parse("11111111-1111-1111-1111-111111111111");

			var test = CreateTest(1, TestType.Simulator, TestSkill.LR, published: true);

			var result1 = new TestResult
			{
				TestResultId = 1,
				UserId = examineeId,
				TestId = test.TestId,
				Test = test,
				TotalScore = 700,
				TotalQuestions = 200,
				CorrectCount = 150,
				Duration = 120,
				SkillScores = new List<UserTestSkillScore>
				{
					new UserTestSkillScore { Skill = "Listening", TotalQuestions = 100, CorrectCount = 80, Score = 350 },
					new UserTestSkillScore { Skill = "Reading", TotalQuestions = 100, CorrectCount = 70, Score = 350 }
				}
			};

			var result2 = new TestResult
			{
				TestResultId = 2,
				UserId = examineeId,
				TestId = test.TestId,
				Test = test,
				TotalScore = 800,
				TotalQuestions = 200,
				CorrectCount = 160,
				Duration = 110,
				SkillScores = new List<UserTestSkillScore>
				{
					new UserTestSkillScore { Skill = "Listening", TotalQuestions = 100, CorrectCount = 85, Score = 400 },
					new UserTestSkillScore { Skill = "Reading", TotalQuestions = 100, CorrectCount = 75, Score = 400 }
				}
			};

			testResultRepoMock.Setup(r => r.GetResultsWithinRangeAsync(examineeId, It.IsAny<DateTime?>()))
				.ReturnsAsync(new List<TestResult> { result1, result2 });

			var result = await service.GetDashboardStatisticAsync(examineeId, TestSkill.LR, "16/10/2025");

			result.IsSuccess.Should().BeTrue();
			result.Data.Should().NotBeNull();
			result.Data!.Skill.Should().Be(TestSkill.LR);
			result.Data.Range.Should().Be("16/10/2025");
			result.Data.TotalTests.Should().Be(2);
			result.Data.Listening.Should().NotBeNull();
			result.Data.Reading.Should().NotBeNull();
		}

		#endregion
	}
}

