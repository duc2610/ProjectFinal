using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using ToeicGenius.Configurations;
using ToeicGenius.Domains.DTOs.Requests.AI.Writing;
using ToeicGenius.Domains.DTOs.Requests.AI.Speaking;
using ToeicGenius.Domains.DTOs.Responses.AI.Writing;
using ToeicGenius.Domains.DTOs.Responses.AI.Speaking;
using ToeicGenius.Domains.DTOs.Responses.Question;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Services.Implementations;
using ToeicGenius.Services.Interfaces;
using ToeicGenius.Shared.Helpers;
using ToeicGenius.Domains.DTOs.Common;
using Xunit;
using ToeicGenius.Domains.DTOs.Requests.Question;

namespace ToeicGenius.Tests.UnitTests
{
	public class AssessmentServiceTests
	{
		private readonly Guid _userId = Guid.NewGuid();

		#region AssessmentService_AssessWritingSentenceAsync

		// UTCID01: Input = valid sentence request with image snapshot; Expected = mapped feedback DTO is returned with TOEIC score conversion.
		[Fact]
		public async Task UTCID01_AssessWritingSentenceAsync_WhenDataIsValid_ReturnsMappedFeedback()
		{
			var request = new WritingSentenceRequestDto
			{
				TestQuestionId = 1001,
				Text = "The people are having a meeting in the office."
			};

			var imageUrl = "https://cdn/questions/1001.jpg";
			var testQuestion = CreateTestQuestion(request.TestQuestionId, imageUrl);
			var pythonResponseJson = CreatePythonResponseJson(testQuestion.OrderInTest, request.Text, 80);

			var (service, httpClientFactoryMock, _, feedbackRepoMock, testQuestionRepoMock, fileServiceMock, userTestRepoMock, userAnswerRepoMock, _) =
				CreateServiceAsync((_, _) => Task.FromResult(BuildHttpResponse(HttpStatusCode.OK, pythonResponseJson)));

			testQuestionRepoMock.Setup(r => r.GetByIdAsync(request.TestQuestionId)).ReturnsAsync(testQuestion);

			var testResult = new TestResult { TestResultId = 777, UserId = _userId, TestId = 1 };
			userTestRepoMock.Setup(r => r.GetOrCreateActiveTestAsync(_userId, It.IsAny<int>()))
				.ReturnsAsync(testResult);

			userAnswerRepoMock.Setup(r => r.AddAsync(It.IsAny<UserAnswer>()))
				.ReturnsAsync((UserAnswer ua) =>
				{
					ua.UserAnswerId = 555;
					return ua;
				});

			fileServiceMock.Setup(f => f.DownloadFileAsync(imageUrl))
				.ReturnsAsync(() => new MemoryStream(Encoding.UTF8.GetBytes("image-bytes")));

			feedbackRepoMock.Setup(r => r.CreateAsync(It.IsAny<AIFeedback>()))
				.ReturnsAsync((AIFeedback feedback) =>
				{
					feedback.FeedbackId = 321;
					return feedback;
				});

			var result = await service.AssessWritingSentenceAsync(request, _userId);

			var expectedScore = ToeicScoreTable.ConvertWritingScore(80);
			result.Score.Should().Be(expectedScore);
			result.FeedbackId.Should().Be(321);
			result.UserAnswerId.Should().Be(555);
			result.AIScorer.Should().Be("writing");
			result.CorrectedText.Should().Be("Corrected people at work.");
			result.Recommendations.Should().Contain("Keep practicing descriptions.");
			result.DetailedScores.Should().ContainKey("grammar");
			result.DetailedAnalysis.Should().ContainKey("corrected_text");
			result.PythonApiResponse.Should().Be(pythonResponseJson);

			feedbackRepoMock.Verify(r => r.CreateAsync(It.Is<AIFeedback>(f =>
				f.Score == expectedScore &&
				f.AIScorer == "writing" &&
				f.ImageFileUrl == imageUrl &&
				f.UserAnswerId == 555)), Times.Once);
			httpClientFactoryMock.Verify(f => f.CreateClient("WritingApi"), Times.Once);
			fileServiceMock.Verify(f => f.DownloadFileAsync(imageUrl), Times.Once);
		}

		// UTCID02: Input = snapshot without image URL; Expected = throws descriptive exception before calling file service or python API.
		[Fact]
		public async Task UTCID02_AssessWritingSentenceAsync_WhenImageMissing_ThrowsException()
		{
			var request = new WritingSentenceRequestDto
			{
				TestQuestionId = 404,
				Text = "Empty snapshot image."
			};

			var testQuestion = CreateTestQuestion(request.TestQuestionId, imageUrl: null);
			var (service, _, _, _, testQuestionRepoMock, fileServiceMock, _, _, _) =
				CreateServiceAsync((_, _) => Task.FromResult(BuildHttpResponse(HttpStatusCode.OK, "{}")));

			testQuestionRepoMock.Setup(r => r.GetByIdAsync(request.TestQuestionId)).ReturnsAsync(testQuestion);

			var act = async () => await service.AssessWritingSentenceAsync(request, _userId);

			await act.Should().ThrowAsync<Exception>()
				.WithMessage($"TestQuestion {request.TestQuestionId} missing image");

			fileServiceMock.Verify(f => f.DownloadFileAsync(It.IsAny<string>()), Times.Never);
		}

		// UTCID03: Input = python API returns non-success status; Expected = propagates Python API error without creating feedback.
		[Fact]
		public async Task UTCID03_AssessWritingSentenceAsync_WhenPythonApiFails_ThrowsException()
		{
			var request = new WritingSentenceRequestDto
			{
				TestQuestionId = 999,
				Text = "API failure scenario."
			};

			var imageUrl = "https://cdn/questions/999.jpg";
			var testQuestion = CreateTestQuestion(request.TestQuestionId, imageUrl);
			var (service, _, _, feedbackRepoMock, testQuestionRepoMock, fileServiceMock, userTestRepoMock, userAnswerRepoMock, _) =
				CreateServiceAsync((_, _) => Task.FromResult(BuildHttpResponse(HttpStatusCode.InternalServerError, "service down")));

			testQuestionRepoMock.Setup(r => r.GetByIdAsync(request.TestQuestionId)).ReturnsAsync(testQuestion);

			var testResult = new TestResult { TestResultId = 42, UserId = _userId, TestId = 1 };
			userTestRepoMock.Setup(r => r.GetOrCreateActiveTestAsync(_userId, It.IsAny<int>()))
				.ReturnsAsync(testResult);

			userAnswerRepoMock.Setup(r => r.AddAsync(It.IsAny<UserAnswer>()))
				.ReturnsAsync((UserAnswer ua) =>
				{
					ua.UserAnswerId = 900;
					return ua;
				});

			fileServiceMock.Setup(f => f.DownloadFileAsync(imageUrl))
				.ReturnsAsync(() => new MemoryStream(Encoding.UTF8.GetBytes("image-bytes")));

			var act = async () => await service.AssessWritingSentenceAsync(request, _userId);

			await act.Should().ThrowAsync<Exception>()
				.WithMessage("Python API error: InternalServerError - service down");

			feedbackRepoMock.Verify(r => r.CreateAsync(It.IsAny<AIFeedback>()), Times.Never);
		}
		// UTCID04: Python returns invalid JSON → should throw exception
		[Fact]
		public async Task UTCID04_AssessWritingSentenceAsync_WhenPythonResponseInvalid_ThrowsException()
		{
			var request = new WritingSentenceRequestDto
			{
				TestQuestionId = 1002,
				Text = "Invalid JSON scenario."
			};

			var imageUrl = "https://cdn/questions/1002.jpg";
			var testQuestion = CreateTestQuestion(request.TestQuestionId, imageUrl);
			var (service, _, _, _, testQuestionRepoMock, fileServiceMock, userTestRepoMock, userAnswerRepoMock, _) =
				CreateServiceAsync((_, _) => Task.FromResult(BuildHttpResponse(HttpStatusCode.OK, "INVALID_JSON")));

			testQuestionRepoMock.Setup(r => r.GetByIdAsync(request.TestQuestionId)).ReturnsAsync(testQuestion);

			var testResult = new TestResult { TestResultId = 43, UserId = _userId, TestId = 1 };
			userTestRepoMock.Setup(r => r.GetOrCreateActiveTestAsync(_userId, It.IsAny<int>()))
				.ReturnsAsync(testResult);

			userAnswerRepoMock.Setup(r => r.AddAsync(It.IsAny<UserAnswer>()))
				.ReturnsAsync((UserAnswer ua) => { ua.UserAnswerId = 901; return ua; });

			fileServiceMock.Setup(f => f.DownloadFileAsync(imageUrl))
				.ReturnsAsync(() => new MemoryStream(Encoding.UTF8.GetBytes("image-bytes")));

			var act = async () => await service.AssessWritingSentenceAsync(request, _userId);

			await act.Should().ThrowAsync<JsonException>();
		}

		// UTCID05: Python returns score outside normal range → map to TOEIC scale
		[Fact]
		public async Task UTCID05_AssessWritingSentenceAsync_WhenPythonScoreOutOfRange_ReturnsClampedToeicScore()
		{
			var request = new WritingSentenceRequestDto
			{
				TestQuestionId = 1003,
				Text = "Boundary score scenario."
			};

			var imageUrl = "https://cdn/questions/1003.jpg";
			var testQuestion = CreateTestQuestion(request.TestQuestionId, imageUrl);

			// Python response with OverallScore > 100
			var pythonResponse = new PythonWritingResponse { OverallScore = 120, Scores = new(), DetailedAnalysis = new(), Recommendations = new() };
			var pythonJson = JsonSerializer.Serialize(pythonResponse);

			var (service, _, _, feedbackRepoMock, testQuestionRepoMock, fileServiceMock, userTestRepoMock, userAnswerRepoMock, _) =
				CreateServiceAsync((_, _) => Task.FromResult(BuildHttpResponse(HttpStatusCode.OK, pythonJson)));

			testQuestionRepoMock.Setup(r => r.GetByIdAsync(request.TestQuestionId)).ReturnsAsync(testQuestion);

			var testResult = new TestResult { TestResultId = 44, UserId = _userId, TestId = 1 };
			userTestRepoMock.Setup(r => r.GetOrCreateActiveTestAsync(_userId, It.IsAny<int>()))
				.ReturnsAsync(testResult);

			userAnswerRepoMock.Setup(r => r.AddAsync(It.IsAny<UserAnswer>()))
				.ReturnsAsync((UserAnswer ua) => { ua.UserAnswerId = 902; return ua; });

			fileServiceMock.Setup(f => f.DownloadFileAsync(imageUrl))
				.ReturnsAsync(() => new MemoryStream(Encoding.UTF8.GetBytes("image-bytes")));
			feedbackRepoMock.Setup(r => r.CreateAsync(It.IsAny<AIFeedback>()))
							.ReturnsAsync((AIFeedback feedback) =>
							{
								feedback.FeedbackId = 321;
								return feedback;
							});
			var result = await service.AssessWritingSentenceAsync(request, _userId);

			// TOEIC score should be clamped if Python score > 100
			var expectedScore = ToeicScoreTable.ConvertWritingScore(120);
			result.Score.Should().Be(expectedScore);
			result.FeedbackId.Should().BePositive();
		}

		// UTCID06: Dependency throws (FileService) → verify catch logs and exception
		[Fact]
		public async Task UTCID06_AssessWritingSentenceAsync_WhenFileServiceThrows_PropagatesException()
		{
			var request = new WritingSentenceRequestDto
			{
				TestQuestionId = 1004,
				Text = "File service failure."
			};

			var imageUrl = "https://cdn/questions/1004.jpg";
			var testQuestion = CreateTestQuestion(request.TestQuestionId, imageUrl);

			var (service, _, loggerMock, _, testQuestionRepoMock, fileServiceMock, userTestRepoMock, userAnswerRepoMock, _) =
				CreateServiceAsync((_, _) => Task.FromResult(BuildHttpResponse(HttpStatusCode.OK, "{}")));

			testQuestionRepoMock.Setup(r => r.GetByIdAsync(request.TestQuestionId)).ReturnsAsync(testQuestion);

			var testResult = new TestResult { TestResultId = 45, UserId = _userId, TestId = 1 };
			userTestRepoMock.Setup(r => r.GetOrCreateActiveTestAsync(_userId, It.IsAny<int>()))
				.ReturnsAsync(testResult);

			userAnswerRepoMock.Setup(r => r.AddAsync(It.IsAny<UserAnswer>()))
				.ReturnsAsync((UserAnswer ua) => { ua.UserAnswerId = 903; return ua; });

			// Simulate file service exception
			fileServiceMock.Setup(f => f.DownloadFileAsync(imageUrl))
				.ThrowsAsync(new IOException("Disk error"));

			var act = async () => await service.AssessWritingSentenceAsync(request, _userId);

			await act.Should().ThrowAsync<IOException>().WithMessage("Disk error");
		}

		#endregion

		#region AssessmentService_GetFeedbackAsync

		// UTCID01: Input = feedback exists and user is owner; Expected = returns mapped DTO with details.
		[Fact]
		public async Task UTCID01_GetFeedbackAsync_WhenFeedbackExistsAndOwner_ReturnsDto()
		{
			var feedback = new AIFeedback
			{
				FeedbackId = 701,
				UserAnswerId = 902,
				Score = 150,
				Content = "Great job",
				AIScorer = "writing",
				DetailedScoresJson = JsonSerializer.Serialize(new Dictionary<string, object> { { "grammar", 95 } }),
				DetailedAnalysisJson = JsonSerializer.Serialize(new Dictionary<string, object> { { "corrections", "..." } }),
				RecommendationsJson = JsonSerializer.Serialize(new List<string> { "Keep practicing descriptions." }),
				PythonApiResponse = "{\"overall_score\":90}",
				CreatedAt = DateTimeHelper.Now
			};

			var (service, _, _, feedbackRepoMock, _, _, _, _, _) = CreateServiceAsync();

			feedbackRepoMock.Setup(r => r.GetByIdAsync(feedback.FeedbackId)).ReturnsAsync(feedback);
			feedbackRepoMock.Setup(r => r.IsUserOwnerAsync(feedback.FeedbackId, _userId)).ReturnsAsync(true);

			var result = await service.GetFeedbackAsync(feedback.FeedbackId, _userId);

			result.FeedbackId.Should().Be(feedback.FeedbackId);
			result.UserAnswerId.Should().Be(feedback.UserAnswerId);
			result.Score.Should().Be(feedback.Score);
			result.AIScorer.Should().Be("writing");
			result.DetailedScores.Should().ContainKey("grammar");
			result.Recommendations.Should().Contain("Keep practicing descriptions.");

			feedbackRepoMock.Verify(r => r.GetByIdAsync(feedback.FeedbackId), Times.Once);
			feedbackRepoMock.Verify(r => r.IsUserOwnerAsync(feedback.FeedbackId, _userId), Times.Once);
		}

		// UTCID02: Input = feedback is missing; Expected = throws "Feedback not found".
		[Fact]
		public async Task UTCID02_GetFeedbackAsync_WhenNotFound_ThrowsException()
		{
			var (service, _, _, feedbackRepoMock, _, _, _, _, _) = CreateServiceAsync();

			feedbackRepoMock.Setup(r => r.GetByIdAsync(9999)).ReturnsAsync((AIFeedback)null!);

			var act = async () => await service.GetFeedbackAsync(9999, _userId);

			await act.Should().ThrowAsync<Exception>()
				.WithMessage("Feedback not found");

			feedbackRepoMock.Verify(r => r.IsUserOwnerAsync(It.IsAny<int>(), It.IsAny<Guid>()), Times.Never);
		}

		// UTCID03: Input = user is not owner; Expected = throws UnauthorizedAccessException.
		[Fact]
		public async Task UTCID03_GetFeedbackAsync_WhenUserNotOwner_ThrowsUnauthorized()
		{
			var feedback = new AIFeedback { FeedbackId = 808, UserAnswerId = 1001 };
			var (service, _, _, feedbackRepoMock, _, _, _, _, _) = CreateServiceAsync();

			feedbackRepoMock.Setup(r => r.GetByIdAsync(feedback.FeedbackId)).ReturnsAsync(feedback);
			feedbackRepoMock.Setup(r => r.IsUserOwnerAsync(feedback.FeedbackId, _userId)).ReturnsAsync(false);

			var act = async () => await service.GetFeedbackAsync(feedback.FeedbackId, _userId);

			await act.Should().ThrowAsync<UnauthorizedAccessException>()
				.WithMessage("You don't have permission to access this feedback");
		}

		#endregion

		#region AssessmentService_AssessSpeakingAsync

		// UTCID01: Input = describe_picture request with provided TestResult; Expected = uploads audio, downloads image, stores feedback.
		[Fact]
		public async Task UTCID01_AssessSpeakingAsync_DescribePictureWithExistingTestResult_ReturnsFeedback()
		{
			var request = new SpeakingAssessmentRequestDto
			{
				TestQuestionId = 6101,
				AudioFile = CreateAudioFormFile(),
				TestResultId = 501
			};
			var taskType = "describe_picture";

			var imageUrl = "https://cdn/questions/6101.jpg";
			var testQuestion = CreateTestQuestion(
				request.TestQuestionId,
				imageUrl: imageUrl,
				content: "Describe the picture in detail.",
				explanation: "Mention key visual elements.");

			var pythonResponseJson = CreatePythonSpeakingResponseJson(taskType, testQuestion.OrderInTest, 88);

			var (service, _, _, feedbackRepoMock, testQuestionRepoMock, fileServiceMock, userTestRepoMock, userAnswerRepoMock, testResultRepoMock) =
				CreateServiceAsync(
					writingHandler: (_, _) => Task.FromResult(BuildHttpResponse(HttpStatusCode.OK, "{}")),
					speakingHandler: (_, _) => Task.FromResult(BuildHttpResponse(HttpStatusCode.OK, pythonResponseJson)));

			testQuestionRepoMock.Setup(r => r.GetByIdAsync(request.TestQuestionId)).ReturnsAsync(testQuestion);

			var existingResult = new TestResult { TestResultId = request.TestResultId.Value, UserId = _userId, TestId = 7 };
			testResultRepoMock.Setup(r => r.GetByIdAsync(request.TestResultId.Value)).ReturnsAsync(existingResult);

			fileServiceMock.Setup(f => f.UploadFileAsync(request.AudioFile, "audio"))
				.ReturnsAsync(Result<string>.Success("https://cdn/audio/6101.wav"));
			fileServiceMock.Setup(f => f.DownloadFileAsync(imageUrl))
				.ReturnsAsync(() => new MemoryStream(Encoding.UTF8.GetBytes("image-bytes")));

			userAnswerRepoMock.Setup(r => r.AddAsync(It.IsAny<UserAnswer>()))
				.ReturnsAsync((UserAnswer ua) =>
				{
					ua.UserAnswerId = 1234;
					return ua;
				});

			feedbackRepoMock.Setup(r => r.CreateAsync(It.IsAny<AIFeedback>()))
				.ReturnsAsync((AIFeedback feedback) =>
				{
					feedback.FeedbackId = 4321;
					return feedback;
				});

			var result = await service.AssessSpeakingAsync(request, taskType, _userId);

			var expectedScore = ToeicScoreTable.ConvertSpeakingScore(88);
			result.Score.Should().Be(expectedScore);
			result.FeedbackId.Should().Be(4321);
			result.UserAnswerId.Should().Be(1234);
			result.AIScorer.Should().Be("speaking");
			result.Transcription.Should().Be("Sample transcription text.");
			result.AudioDuration.Should().Be(42.5);
			result.DetailedScores.Should().ContainKey("fluency");
			result.Recommendations.Should().Contain("Maintain steady pace.");
			result.PythonApiResponse.Should().Be(pythonResponseJson);

			fileServiceMock.Verify(f => f.UploadFileAsync(request.AudioFile, "audio"), Times.Once);
			fileServiceMock.Verify(f => f.DownloadFileAsync(imageUrl), Times.Once);
			userTestRepoMock.Verify(r => r.GetOrCreateActiveTestAsync(It.IsAny<Guid>(), It.IsAny<int>()), Times.Never);
			testResultRepoMock.Verify(r => r.GetByIdAsync(request.TestResultId.Value), Times.Once);

			feedbackRepoMock.Verify(r => r.CreateAsync(It.Is<AIFeedback>(f =>
				f.Score == expectedScore &&
				f.AudioFileUrl == "https://cdn/audio/6101.wav" &&
				f.ImageFileUrl == imageUrl &&
				f.AIScorer == "speaking")), Times.Once);
		}

		// UTCID02: Input = Python API returns error for speaking; Expected = throws and no feedback persisted.
		[Fact]
		public async Task UTCID02_AssessSpeakingAsync_WhenPythonApiFails_ThrowsException()
		{
			var request = new SpeakingAssessmentRequestDto
			{
				TestQuestionId = 6202,
				AudioFile = CreateAudioFormFile()
			};
			var taskType = "respond_questions";

			var testQuestion = CreateTestQuestion(request.TestQuestionId, imageUrl: null, content: "Respond to the recorded questions.");

			var (service, _, _, feedbackRepoMock, testQuestionRepoMock, fileServiceMock, userTestRepoMock, userAnswerRepoMock, _) =
				CreateServiceAsync(
					writingHandler: (_, _) => Task.FromResult(BuildHttpResponse(HttpStatusCode.OK, "{}")),
					speakingHandler: (_, _) => Task.FromResult(BuildHttpResponse(HttpStatusCode.BadRequest, "speech failed")));

			testQuestionRepoMock.Setup(r => r.GetByIdAsync(request.TestQuestionId)).ReturnsAsync(testQuestion);

			fileServiceMock.Setup(f => f.UploadFileAsync(request.AudioFile, "audio"))
				.ReturnsAsync(Result<string>.Success("https://cdn/audio/6202.wav"));

			var testResult = new TestResult { TestResultId = 88, UserId = _userId, TestId = 8 };
			userTestRepoMock.Setup(r => r.GetOrCreateActiveTestAsync(_userId, It.IsAny<int>())).ReturnsAsync(testResult);

			userAnswerRepoMock.Setup(r => r.AddAsync(It.IsAny<UserAnswer>()))
				.ReturnsAsync((UserAnswer ua) =>
				{
					ua.UserAnswerId = 5678;
					return ua;
				});

			var act = async () => await service.AssessSpeakingAsync(request, taskType, _userId);

			await act.Should().ThrowAsync<Exception>()
				.WithMessage("Python API error: BadRequest - speech failed");

			feedbackRepoMock.Verify(r => r.CreateAsync(It.IsAny<AIFeedback>()), Times.Never);
			fileServiceMock.Verify(f => f.DownloadFileAsync(It.IsAny<string>()), Times.Never);
		}
		// UTCID03: Input = TestQuestionId does not exist → throws exception
		[Fact]
		public async Task UTCID03_AssessSpeakingAsync_WhenTestQuestionNotFound_ThrowsException()
		{
			var request = new SpeakingAssessmentRequestDto
			{
				TestQuestionId = 9999,
				AudioFile = CreateAudioFormFile()
			};
			var taskType = "respond_questions";

			var (service, _, _, feedbackRepoMock, testQuestionRepoMock, fileServiceMock, userTestRepoMock, userAnswerRepoMock, _) =
				CreateServiceAsync();

			// TestQuestion not found
			testQuestionRepoMock.Setup(r => r.GetByIdAsync(request.TestQuestionId))
				.ReturnsAsync((TestQuestion)null);

			var act = async () => await service.AssessSpeakingAsync(request, taskType, _userId);

			await act.Should().ThrowAsync<Exception>();

			feedbackRepoMock.Verify(r => r.CreateAsync(It.IsAny<AIFeedback>()), Times.Never);
			userAnswerRepoMock.Verify(r => r.AddAsync(It.IsAny<UserAnswer>()), Times.Never);
		}

		// UTCID04: Input = TestResultId provided but not found → throws exception
		[Fact]
		public async Task UTCID04_AssessSpeakingAsync_WhenTestResultNotFound_ThrowsException()
		{
			var request = new SpeakingAssessmentRequestDto
			{
				TestQuestionId = 6303,
				AudioFile = CreateAudioFormFile(),
				TestResultId = 777
			};
			var taskType = "respond_questions";

			var testQuestion = CreateTestQuestion(6303, imageUrl: null, content: "Answer the questions.");

			var (service, _, _, _, testQuestionRepoMock, fileServiceMock, userTestRepoMock, userAnswerRepoMock, testResultRepoMock) =
				CreateServiceAsync();

			testQuestionRepoMock.Setup(r => r.GetByIdAsync(request.TestQuestionId))
				.ReturnsAsync(testQuestion);

			testResultRepoMock.Setup(r => r.GetByIdAsync(request.TestResultId.Value))
				.ReturnsAsync((TestResult)null);

			var act = async () => await service.AssessSpeakingAsync(request, taskType, _userId);

			await act.Should().ThrowAsync<Exception>();
		}

		// UTCID05: Input = Audio upload fails → throws exception
		[Fact]
		public async Task UTCID05_AssessSpeakingAsync_WhenAudioUploadFails_ThrowsException()
		{
			var request = new SpeakingAssessmentRequestDto
			{
				TestQuestionId = 6404,
				AudioFile = CreateAudioFormFile()
			};
			var taskType = "respond_questions";

			var testQuestion = CreateTestQuestion(6404, imageUrl: null, content: "Answer the questions.");

			var (service, _, _, feedbackRepoMock, testQuestionRepoMock, fileServiceMock, userTestRepoMock, userAnswerRepoMock, _) =
				CreateServiceAsync();

			testQuestionRepoMock.Setup(r => r.GetByIdAsync(request.TestQuestionId))
				.ReturnsAsync(testQuestion);

			// Upload fails
			fileServiceMock.Setup(f => f.UploadFileAsync(request.AudioFile, "audio"))
				.ReturnsAsync(Result<string>.Failure("Upload failed"));

			var act = async () => await service.AssessSpeakingAsync(request, taskType, _userId);

			await act.Should().ThrowAsync<Exception>()
				.WithMessage("Failed to upload audio file");

			feedbackRepoMock.Verify(r => r.CreateAsync(It.IsAny<AIFeedback>()), Times.Never);
		}

		// UTCID06: Input = UserAnswer creation fails → throws exception
		[Fact]
		public async Task UTCID06_AssessSpeakingAsync_WhenUserAnswerCreationFails_ThrowsException()
		{
			var request = new SpeakingAssessmentRequestDto
			{
				TestQuestionId = 6505,
				AudioFile = CreateAudioFormFile()
			};
			var taskType = "respond_questions";

			var testQuestion = CreateTestQuestion(6505, imageUrl: null, content: "Answer the questions.");

			var (service, _, _, feedbackRepoMock, testQuestionRepoMock, fileServiceMock, userTestRepoMock, userAnswerRepoMock, _) =
				CreateServiceAsync();

			testQuestionRepoMock.Setup(r => r.GetByIdAsync(request.TestQuestionId))
				.ReturnsAsync(testQuestion);

			fileServiceMock.Setup(f => f.UploadFileAsync(request.AudioFile, "audio"))
				.ReturnsAsync(Result<string>.Success("https://cdn/audio/6505.wav"));

			userAnswerRepoMock.Setup(r => r.AddAsync(It.IsAny<UserAnswer>()))
				.ThrowsAsync(new Exception());

			var act = async () => await service.AssessSpeakingAsync(request, taskType, _userId);

			await act.Should().ThrowAsync<Exception>();

			feedbackRepoMock.Verify(r => r.CreateAsync(It.IsAny<AIFeedback>()), Times.Never);
		}

		// UTCID07: Input = Feedback saving fails → throws exception
		[Fact]
		public async Task UTCID07_AssessSpeakingAsync_WhenSavingFeedbackFails_ThrowsException()
		{
			var request = new SpeakingAssessmentRequestDto
			{
				TestQuestionId = 6606,
				AudioFile = CreateAudioFormFile()
			};
			var taskType = "respond_questions";

			var testQuestion = CreateTestQuestion(6606, imageUrl: null, content: "Answer the questions.");

			var pythonResponseJson = CreatePythonSpeakingResponseJson(taskType: taskType, questionNumber: testQuestion.OrderInTest, overallScore: 90);

			var (service, _, _, feedbackRepoMock, testQuestionRepoMock, fileServiceMock, userTestRepoMock, userAnswerRepoMock, _) =
				CreateServiceAsync(
					writingHandler: (_, _) => Task.FromResult(BuildHttpResponse(HttpStatusCode.OK, "{}")),
					speakingHandler: (_, _) => Task.FromResult(BuildHttpResponse(HttpStatusCode.OK, pythonResponseJson))
				);

			testQuestionRepoMock.Setup(r => r.GetByIdAsync(request.TestQuestionId))
				.ReturnsAsync(testQuestion);

			fileServiceMock.Setup(f => f.UploadFileAsync(request.AudioFile, "audio"))
				.ReturnsAsync(Result<string>.Success("https://cdn/audio/6606.wav"));

			userAnswerRepoMock.Setup(r => r.AddAsync(It.IsAny<UserAnswer>()))
				.ReturnsAsync((UserAnswer ua) => { ua.UserAnswerId = 99; return ua; });

			feedbackRepoMock.Setup(r => r.CreateAsync(It.IsAny<AIFeedback>()))
				.ThrowsAsync(new Exception());

			var act = async () => await service.AssessSpeakingAsync(request, taskType, _userId);

			await act.Should().ThrowAsync<Exception>();
		}

		#endregion

		#region AssessmentService_AssessWritingEssayAsync

		// UTCID01: Input = valid essay request with provided TestResult; Expected = feedback DTO stored, avoids auto test creation.
		[Fact]
		public async Task UTCID01_AssessWritingEssayAsync_WhenUsingExistingTestResult_ReturnsFeedback()
		{
			var request = new WritingEssayRequestDto
			{
				TestQuestionId = 4004,
				Text = "In my opinion, remote work improves productivity by reducing commute stress.",
				TestResultId = 910
			};

			var testQuestion = CreateTestQuestion(request.TestQuestionId, imageUrl: null, content: "Do you agree that remote work increases productivity?");
			var pythonResponseJson = CreatePythonResponseJson(testQuestion.OrderInTest, request.Text, 85, partType: "opinion_essay");

			var (service, _, _, feedbackRepoMock, testQuestionRepoMock, fileServiceMock, userTestRepoMock, userAnswerRepoMock, testResultRepoMock) =
				CreateServiceAsync((_, _) => Task.FromResult(BuildHttpResponse(HttpStatusCode.OK, pythonResponseJson)));

			testQuestionRepoMock.Setup(r => r.GetByIdAsync(request.TestQuestionId)).ReturnsAsync(testQuestion);

			var existingResult = new TestResult { TestResultId = request.TestResultId.Value, UserId = _userId, TestId = 3 };
			testResultRepoMock.Setup(r => r.GetByIdAsync(request.TestResultId.Value)).ReturnsAsync(existingResult);

			userAnswerRepoMock.Setup(r => r.AddAsync(It.IsAny<UserAnswer>()))
				.ReturnsAsync((UserAnswer ua) =>
				{
					ua.UserAnswerId = 111;
					return ua;
				});

			feedbackRepoMock.Setup(r => r.CreateAsync(It.IsAny<AIFeedback>()))
				.ReturnsAsync((AIFeedback feedback) =>
				{
					feedback.FeedbackId = 222;
					return feedback;
				});

			var result = await service.AssessWritingEssayAsync(request, _userId);

			var expectedScore = ToeicScoreTable.ConvertWritingScore(85);
			result.Score.Should().Be(expectedScore);
			result.FeedbackId.Should().Be(222);
			result.UserAnswerId.Should().Be(111);
			result.AIScorer.Should().Be("writing");
			result.Recommendations.Should().Contain("Keep practicing descriptions.");
			result.DetailedAnalysis.Should().ContainKey("corrected_text");
			result.PythonApiResponse.Should().Be(pythonResponseJson);

			feedbackRepoMock.Verify(r => r.CreateAsync(It.Is<AIFeedback>(f =>
				f.Score == expectedScore &&
				f.UserAnswerId == 111 &&
				f.PythonApiResponse == pythonResponseJson)), Times.Once);
			testResultRepoMock.Verify(r => r.GetByIdAsync(request.TestResultId.Value), Times.Once);
			userTestRepoMock.Verify(r => r.GetOrCreateActiveTestAsync(It.IsAny<Guid>(), It.IsAny<int>()), Times.Never);
			fileServiceMock.Verify(f => f.DownloadFileAsync(It.IsAny<string>()), Times.Never);
		}

		// UTCID02: Input = python API error during essay assessment; Expected = exception thrown and no feedback saved.
		[Fact]
		public async Task UTCID02_AssessWritingEssayAsync_WhenPythonApiFails_ThrowsException()
		{
			var request = new WritingEssayRequestDto
			{
				TestQuestionId = 5005,
				Text = "I believe international experience is essential for leadership roles."
			};

			var testQuestion = CreateTestQuestion(request.TestQuestionId, imageUrl: null, content: "Explain why international experience matters.");

			var (service, _, _, feedbackRepoMock, testQuestionRepoMock, fileServiceMock, userTestRepoMock, userAnswerRepoMock, _) =
				CreateServiceAsync((_, _) => Task.FromResult(BuildHttpResponse(HttpStatusCode.BadRequest, "invalid payload")));

			testQuestionRepoMock.Setup(r => r.GetByIdAsync(request.TestQuestionId)).ReturnsAsync(testQuestion);

			var testResult = new TestResult { TestResultId = 333, UserId = _userId, TestId = 6 };
			userTestRepoMock.Setup(r => r.GetOrCreateActiveTestAsync(_userId, It.IsAny<int>())).ReturnsAsync(testResult);

			userAnswerRepoMock.Setup(r => r.AddAsync(It.IsAny<UserAnswer>()))
				.ReturnsAsync((UserAnswer ua) =>
				{
					ua.UserAnswerId = 444;
					return ua;
				});

			var act = async () => await service.AssessWritingEssayAsync(request, _userId);

			await act.Should().ThrowAsync<Exception>()
				.WithMessage("Python API error: BadRequest - invalid payload");

			feedbackRepoMock.Verify(r => r.CreateAsync(It.IsAny<AIFeedback>()), Times.Never);
			fileServiceMock.Verify(f => f.DownloadFileAsync(It.IsAny<string>()), Times.Never);
		}
		// UTCID03: Input = TestQuestionId not found; Expected = exception thrown immediately.
		[Fact]
		public async Task UTCID03_AssessWritingEssayAsync_WhenTestQuestionNotFound_ThrowsException()
		{
			var request = new WritingEssayRequestDto
			{
				TestQuestionId = 6006,
				Text = "This essay should fail because question does not exist."
			};

			var (service, _, _, _, testQuestionRepoMock, _, userTestRepoMock, _, _) =
				CreateServiceAsync();

			testQuestionRepoMock
				.Setup(r => r.GetByIdAsync(request.TestQuestionId))
				.ReturnsAsync((TestQuestion)null!);

			var act = async () => await service.AssessWritingEssayAsync(request, _userId);

			await act.Should().ThrowAsync<Exception>()
				.WithMessage("TestQuestion 6006 not found");

			userTestRepoMock.Verify(r => r.GetOrCreateActiveTestAsync(It.IsAny<Guid>(), It.IsAny<int>()), Times.Never);
		}

		// UTCID04: Input = invalid TestResultId; Expected = exception, no feedback saved.
		[Fact]
		public async Task UTCID04_AssessWritingEssayAsync_WhenTestResultIdNotFound_ThrowsException()
		{
			var invalidResultId = 999999;

			var request = new WritingEssayRequestDto
			{
				TestQuestionId = 7007,
				Text = "Essay with invalid test result id.",
				TestResultId = invalidResultId
			};

			var testQuestion = CreateTestQuestion(7007, null, "Discuss the impact of globalization.");

			var (service, _, _, feedbackRepoMock, testQuestionRepoMock, _, _, _, testResultRepoMock) =
				CreateServiceAsync();

			testQuestionRepoMock.Setup(r => r.GetByIdAsync(7007)).ReturnsAsync(testQuestion);
			testResultRepoMock.Setup(r => r.GetByIdAsync(invalidResultId)).ReturnsAsync((TestResult)null!);

			var act = async () => await service.AssessWritingEssayAsync(request, _userId);

			await act.Should().ThrowAsync<Exception>()
				.WithMessage("TestResult 999999 not found");

			feedbackRepoMock.Verify(r => r.CreateAsync(It.IsAny<AIFeedback>()), Times.Never);
		}
		// UTCID05: Input = user answer creation fails; Expected = exception and no feedback created.
		[Fact]
		public async Task UTCID05_AssessWritingEssayAsync_WhenUserAnswerCreationFails_ThrowsException()
		{
			var request = new WritingEssayRequestDto
			{
				TestQuestionId = 8008,
				Text = "Essay that triggers userAnswer failure."
			};

			var testQuestion = CreateTestQuestion(8008, null, "What are the benefits of recycling?");

			var (service, _, _, feedbackRepoMock, testQuestionRepoMock, _, _, userAnswerRepoMock, userTestRepoMock) =
				CreateServiceAsync();

			testQuestionRepoMock.Setup(r => r.GetByIdAsync(8008)).ReturnsAsync(testQuestion);

			var testResult = new TestResult { TestResultId = 77, UserId = _userId, TestId = 10 };
			userTestRepoMock.Setup(r => r.GetOrCreateActiveTestAsync(_userId, It.IsAny<int>())).ReturnsAsync(testResult);


			userAnswerRepoMock.Setup(r => r.AddAsync(It.IsAny<UserAnswer>()))
				.ThrowsAsync(new Exception());

			var act = async () => await service.AssessWritingEssayAsync(request, _userId);

			await act.Should().ThrowAsync<Exception>();

			feedbackRepoMock.Verify(r => r.CreateAsync(It.IsAny<AIFeedback>()), Times.Never);
		}
		// UTCID06: Input = Python returns malformed JSON; Expected = JsonException.
		[Fact]
		public async Task UTCID06_AssessWritingEssayAsync_WhenPythonReturnsMalformedJson_ThrowsJsonException()
		{
			var request = new WritingEssayRequestDto
			{
				TestQuestionId = 9009,
				Text = "Essay for malformed Python response."
			};

			var testQuestion = CreateTestQuestion(9009, null, "Discuss the challenges of AI ethics.");

			var (service, _, _, feedbackRepoMock, testQuestionRepoMock, _, userTestRepoMock, userAnswerRepoMock, _) =
				CreateServiceAsync((_, _) =>
					Task.FromResult(BuildHttpResponse(HttpStatusCode.OK, "INVALID_JSON")));

			testQuestionRepoMock.Setup(r => r.GetByIdAsync(9009)).ReturnsAsync(testQuestion);

			var testResult = new TestResult { TestResultId = 88, UserId = _userId, TestId = 11 };
			userTestRepoMock.Setup(r => r.GetOrCreateActiveTestAsync(_userId, It.IsAny<int>()))
				.ReturnsAsync(testResult);

			userAnswerRepoMock.Setup(r => r.AddAsync(It.IsAny<UserAnswer>()))
				.ReturnsAsync(new UserAnswer { UserAnswerId = 555 });

			var act = async () => await service.AssessWritingEssayAsync(request, _userId);

			await act.Should().ThrowAsync<JsonException>();

			feedbackRepoMock.Verify(r => r.CreateAsync(It.IsAny<AIFeedback>()), Times.Never);
		}
		// UTCID07: Input = AI gives 100 points; Expected = TOEIC score 200.
		[Fact]
		public async Task UTCID07_AssessWritingEssayAsync_WhenOverallScoreIs100_ConvertsToToeic200()
		{
			var request = new WritingEssayRequestDto
			{
				TestQuestionId = 10010,
				Text = "Essay for score conversion test."
			};

			var testQuestion = CreateTestQuestion(10010, null, "Why is discipline essential for success?");
			var pythonJson = CreatePythonResponseJson(testQuestion.OrderInTest, request.Text, 100);

			var (service, _, _, _, testQuestionRepoMock, _, userTestRepoMock, userAnswerRepoMock, _) =
				CreateServiceAsync((_, _) => Task.FromResult(BuildHttpResponse(HttpStatusCode.OK, pythonJson)));

			testQuestionRepoMock.Setup(r => r.GetByIdAsync(10010)).ReturnsAsync(testQuestion);

			var testResult = new TestResult { TestResultId = 101, UserId = _userId, TestId = 12 };
			userTestRepoMock.Setup(r => r.GetOrCreateActiveTestAsync(_userId, It.IsAny<int>()))
				.ReturnsAsync(testResult);

			userAnswerRepoMock.Setup(r => r.AddAsync(It.IsAny<UserAnswer>()))
				.ReturnsAsync(new UserAnswer { UserAnswerId = 777 });

			var result = await service.AssessWritingEssayAsync(request, _userId);

			result.Score.Should().Be(200); // max TOEIC
		}
		// UTCID08: Input = feedback creation fails; Expected = exception thrown.
		[Fact]
		public async Task UTCID08_AssessWritingEssayAsync_WhenFeedbackCreationFails_ThrowsException()
		{
			var request = new WritingEssayRequestDto
			{
				TestQuestionId = 11011,
				Text = "Essay for feedback failure."
			};

			var testQuestion = CreateTestQuestion(11011, null, "Describe a memorable journey.");
			var pythonJson = CreatePythonResponseJson(testQuestion.OrderInTest, request.Text, 70);

			var (service, _, _, feedbackRepoMock, testQuestionRepoMock, _, userTestRepoMock, userAnswerRepoMock, _) =
				CreateServiceAsync((_, _) => Task.FromResult(BuildHttpResponse(HttpStatusCode.OK, pythonJson)));

			testQuestionRepoMock.Setup(r => r.GetByIdAsync(11011)).ReturnsAsync(testQuestion);

			var testResult = new TestResult { TestResultId = 202, UserId = _userId, TestId = 13 };
			userTestRepoMock.Setup(r => r.GetOrCreateActiveTestAsync(_userId, It.IsAny<int>()))
				.ReturnsAsync(testResult);

			userAnswerRepoMock.Setup(r => r.AddAsync(It.IsAny<UserAnswer>()))
				.ReturnsAsync(new UserAnswer { UserAnswerId = 888 });

			feedbackRepoMock.Setup(r => r.CreateAsync(It.IsAny<AIFeedback>()))
				.ThrowsAsync(new Exception("feedback insert error"));

			var act = async () => await service.AssessWritingEssayAsync(request, _userId);

			await act.Should().ThrowAsync<Exception>()
				.WithMessage("feedback insert error");
		}

		#endregion

		#region AssessmentService_AssessWritingEmailAsync

		// UTCID01: Input = valid email request with existing TestResult; Expected = feedback DTO mapped and stored, no auto test creation.
		[Fact]
		public async Task UTCID01_AssessWritingEmailAsync_WhenUsingExistingTestResult_ReturnsFeedback()
		{
			var request = new WritingEmailRequestDto
			{
				TestQuestionId = 2002,
				Text = "Thank you for the update. I will join the meeting tomorrow.",
				TestResultId = 600
			};

			var testQuestion = CreateTestQuestion(request.TestQuestionId, imageUrl: null, content: "Write an email to confirm participation.");
			var pythonResponseJson = CreatePythonResponseJson(testQuestion.OrderInTest, request.Text, 70);

			var (service, _, _, feedbackRepoMock, testQuestionRepoMock, fileServiceMock, userTestRepoMock, userAnswerRepoMock, testResultRepoMock) =
				CreateServiceAsync((_, _) => Task.FromResult(BuildHttpResponse(HttpStatusCode.OK, pythonResponseJson)));

			testQuestionRepoMock.Setup(r => r.GetByIdAsync(request.TestQuestionId)).ReturnsAsync(testQuestion);

			var existingResult = new TestResult { TestResultId = request.TestResultId.Value, UserId = _userId, TestId = 2 };
			testResultRepoMock.Setup(r => r.GetByIdAsync(request.TestResultId.Value)).ReturnsAsync(existingResult);

			userAnswerRepoMock.Setup(r => r.AddAsync(It.IsAny<UserAnswer>()))
				.ReturnsAsync((UserAnswer ua) =>
				{
					ua.UserAnswerId = 880;
					return ua;
				});

			feedbackRepoMock.Setup(r => r.CreateAsync(It.IsAny<AIFeedback>()))
				.ReturnsAsync((AIFeedback feedback) =>
				{
					feedback.FeedbackId = 990;
					return feedback;
				});

			var result = await service.AssessWritingEmailAsync(request, _userId);

			var expectedScore = ToeicScoreTable.ConvertWritingScore(70);
			result.Score.Should().Be(expectedScore);
			result.UserAnswerId.Should().Be(880);
			result.FeedbackId.Should().Be(990);
			result.AIScorer.Should().Be("writing");
			result.Recommendations.Should().Contain("Keep practicing descriptions.");
			result.DetailedScores.Should().ContainKey("vocabulary");
			result.PythonApiResponse.Should().Be(pythonResponseJson);

			feedbackRepoMock.Verify(r => r.CreateAsync(It.Is<AIFeedback>(f =>
				f.Score == expectedScore &&
				f.UserAnswerId == 880 &&
				f.PythonApiResponse == pythonResponseJson &&
				f.ImageFileUrl == null)), Times.Once);
			testResultRepoMock.Verify(r => r.GetByIdAsync(request.TestResultId.Value), Times.Once);
			userTestRepoMock.Verify(r => r.GetOrCreateActiveTestAsync(It.IsAny<Guid>(), It.IsAny<int>()), Times.Never);
			fileServiceMock.Verify(f => f.DownloadFileAsync(It.IsAny<string>()), Times.Never);
		}

		// UTCID02: Input = python API returns error for email request; Expected = throws exception, feedback not persisted.
		[Fact]
		public async Task UTCID02_AssessWritingEmailAsync_WhenPythonApiFails_ThrowsException()
		{
			var request = new WritingEmailRequestDto
			{
				TestQuestionId = 3003,
				Text = "Following up on the shipment delay."
			};

			var testQuestion = CreateTestQuestion(request.TestQuestionId, imageUrl: null, content: "Respond to the delay notice.");

			var (service, _, _, feedbackRepoMock, testQuestionRepoMock, fileServiceMock, userTestRepoMock, userAnswerRepoMock, _) =
				CreateServiceAsync((_, _) => Task.FromResult(BuildHttpResponse(HttpStatusCode.BadGateway, "gateway error")));

			testQuestionRepoMock.Setup(r => r.GetByIdAsync(request.TestQuestionId)).ReturnsAsync(testQuestion);

			var testResult = new TestResult { TestResultId = 77, UserId = _userId, TestId = 5 };
			userTestRepoMock.Setup(r => r.GetOrCreateActiveTestAsync(_userId, It.IsAny<int>())).ReturnsAsync(testResult);

			userAnswerRepoMock.Setup(r => r.AddAsync(It.IsAny<UserAnswer>()))
				.ReturnsAsync((UserAnswer ua) =>
				{
					ua.UserAnswerId = 701;
					return ua;
				});

			var act = async () => await service.AssessWritingEmailAsync(request, _userId);

			await act.Should().ThrowAsync<Exception>()
				.WithMessage("Python API error: BadGateway - gateway error");

			feedbackRepoMock.Verify(r => r.CreateAsync(It.IsAny<AIFeedback>()), Times.Never);
			fileServiceMock.Verify(f => f.DownloadFileAsync(It.IsAny<string>()), Times.Never);
		}

		// UTCID03 — TestQuestionId không tồn tại → throw exception
		[Fact]
		public async Task UTCID03_AssessWritingEmailAsync_WhenTestQuestionNotFound_ThrowsException()
		{
			var request = new WritingEmailRequestDto
			{
				TestQuestionId = 9999,
				Text = "Please confirm my enrollment."
			};

			var (service, _, _, feedbackRepoMock, testQuestionRepoMock, fileServiceMock, userTestRepoMock, userAnswerRepoMock, testResultRepoMock) =
				CreateServiceAsync();

			// Test question not found
			testQuestionRepoMock.Setup(r => r.GetByIdAsync(request.TestQuestionId))
				.ReturnsAsync((TestQuestion)null);

			var act = async () => await service.AssessWritingEmailAsync(request, _userId);

			await act.Should().ThrowAsync<Exception>();

			feedbackRepoMock.Verify(r => r.CreateAsync(It.IsAny<AIFeedback>()), Times.Never);
			userAnswerRepoMock.Verify(r => r.AddAsync(It.IsAny<UserAnswer>()), Times.Never);
		}

		// UTCID04: Input = TestResultId provided but not found; Expected = throws exception.
		[Fact]
		public async Task UTCID04_AssessWritingEmailAsync_WhenTestResultNotFound_ThrowsException()
		{
			var request = new WritingEmailRequestDto
			{
				TestQuestionId = 123,
				Text = "Hello world",
				TestResultId = 321
			};

			var testQuestion = CreateTestQuestion(123, content: "Please write an email.", imageUrl: null);

			var (service, _, _, _, testQuestionRepoMock, _, _, _, testResultRepoMock) =
				CreateServiceAsync();

			testQuestionRepoMock.Setup(r => r.GetByIdAsync(request.TestQuestionId))
				.ReturnsAsync(testQuestion);

			testResultRepoMock.Setup(r => r.GetByIdAsync(321))
				.ReturnsAsync((TestResult)null);

			var act = async () => await service.AssessWritingEmailAsync(request, _userId);

			await act.Should().ThrowAsync<Exception>();
		}

		// UTCID05: Input = UserAnswer creation fails; Expected = exception thrown, no feedback persisted.
		[Fact]
		public async Task UTCID05_AssessWritingEmailAsync_WhenUserAnswerCreationFails_ThrowsException()
		{
			var request = new WritingEmailRequestDto
			{
				TestQuestionId = 1001,
				Text = "I'm writing to request more details about the event."
			};

			var testQuestion = CreateTestQuestion(1001, content: "Please write an email.", imageUrl: null);

			var (service, _, _, feedbackRepoMock, testQuestionRepoMock, _, userTestRepoMock, userAnswerRepoMock, _) =
				CreateServiceAsync();

			testQuestionRepoMock.Setup(r => r.GetByIdAsync(request.TestQuestionId))
				.ReturnsAsync(testQuestion);

			userTestRepoMock.Setup(r => r.GetOrCreateActiveTestAsync(It.IsAny<Guid>(), It.IsAny<int>()))
				.ReturnsAsync(new TestResult { TestResultId = 10 });

			userAnswerRepoMock.Setup(r => r.AddAsync(It.IsAny<UserAnswer>()))
				.ThrowsAsync(new Exception("DB fail"));

			var act = async () => await service.AssessWritingEmailAsync(request, _userId);

			await act.Should().ThrowAsync<Exception>()
				.WithMessage("DB fail");

			feedbackRepoMock.Verify(r => r.CreateAsync(It.IsAny<AIFeedback>()), Times.Never);
		}

		// UTCID06: Input = Feedback saving fails; Expected = exception thrown.
		[Fact]
		public async Task UTCID06_AssessWritingEmailAsync_WhenSavingFeedbackFails_ThrowsException()
		{
			var request = new WritingEmailRequestDto
			{
				TestQuestionId = 2300,
				Text = "I will send the documents by tomorrow morning."
			};

			var testQuestion = CreateTestQuestion(2300, content: "Please write an email.", imageUrl: null);
			var pythonResponseJson = CreatePythonResponseJson(testQuestion.OrderInTest, request.Text, 60);

			var (service, _, _, feedbackRepoMock, testQuestionRepoMock, _, userTestRepoMock, userAnswerRepoMock, _) =
				CreateServiceAsync((_, _) => Task.FromResult(BuildHttpResponse(HttpStatusCode.OK, pythonResponseJson)));

			testQuestionRepoMock.Setup(r => r.GetByIdAsync(request.TestQuestionId))
				.ReturnsAsync(testQuestion);

			userTestRepoMock.Setup(r => r.GetOrCreateActiveTestAsync(_userId, It.IsAny<int>()))
				.ReturnsAsync(new TestResult { TestResultId = 2 });

			userAnswerRepoMock.Setup(r => r.AddAsync(It.IsAny<UserAnswer>()))
				.ReturnsAsync((UserAnswer ua) => { ua.UserAnswerId = 99; return ua; });

			feedbackRepoMock.Setup(r => r.CreateAsync(It.IsAny<AIFeedback>()))
				.ThrowsAsync(new Exception("Cannot save feedback"));

			var act = async () => await service.AssessWritingEmailAsync(request, _userId);

			await act.Should().ThrowAsync<Exception>()
				.WithMessage("Cannot save feedback");
		}

		// UTCID07: Input = Python API returns invalid JSON; Expected = exception thrown.
		[Fact]
		public async Task UTCID07_AssessWritingEmailAsync_WhenPythonReturnsInvalidJson_ThrowsException()
		{
			var request = new WritingEmailRequestDto
			{
				TestQuestionId = 2400,
				Text = "Kindly update me on the delivery status."
			};

			var testQuestion = CreateTestQuestion(100, content: "Write an email.", imageUrl: null);

			var invalidJson = "{ invalid-json }"; // intentionally broken

			var (service, _, _, _, testQuestionRepoMock, _, userTestRepoMock, userAnswerRepoMock, _) =
				CreateServiceAsync((_, _) => Task.FromResult(BuildHttpResponse(HttpStatusCode.OK, invalidJson)));

			testQuestionRepoMock.Setup(r => r.GetByIdAsync(request.TestQuestionId))
				.ReturnsAsync(testQuestion);

			userTestRepoMock.Setup(r => r.GetOrCreateActiveTestAsync(_userId, It.IsAny<int>()))
				.ReturnsAsync(new TestResult { TestResultId = 45 });

			userAnswerRepoMock.Setup(r => r.AddAsync(It.IsAny<UserAnswer>()))
				.ReturnsAsync((UserAnswer ua) => { ua.UserAnswerId = 55; return ua; });

			var act = async () => await service.AssessWritingEmailAsync(request, _userId);

			await act.Should().ThrowAsync<JsonException>();
		}

		// UTCID08: Input = TestQuestion snapshot content is null; Expected = still processes and returns feedback.
		[Fact]
		public async Task UTCID08_AssessWritingEmailAsync_WhenSnapshotContentNull_StillReturnsFeedback()
		{
			var request = new WritingEmailRequestDto
			{
				TestQuestionId = 555,
				Text = "hello"
			};

			var testQuestion = CreateTestQuestion(555, imageUrl: null, content: "Sample content");

			var pythonResponseJson = CreatePythonResponseJson(1, request.Text, 80);

			var (service, _, _, _, testQuestionRepoMock, _, userTestRepoMock, userAnswerRepoMock, _) =
				CreateServiceAsync((_, _) => Task.FromResult(BuildHttpResponse(HttpStatusCode.OK, pythonResponseJson)));

			testQuestionRepoMock.Setup(r => r.GetByIdAsync(555))
				.ReturnsAsync(testQuestion);

			userTestRepoMock.Setup(r => r.GetOrCreateActiveTestAsync(_userId, It.IsAny<int>()))
				.ReturnsAsync(new TestResult { TestResultId = 11 });

			userAnswerRepoMock.Setup(r => r.AddAsync(It.IsAny<UserAnswer>()))
				.ReturnsAsync((UserAnswer ua) => { ua.UserAnswerId = 33; return ua; });

			var result = await service.AssessWritingEmailAsync(request, _userId);

			result.Score.Should().Be(ToeicScoreTable.ConvertWritingScore(80));
		}

		#endregion

		#region Helper Methods
		private static TestQuestion CreateTestQuestion(int testQuestionId, string? imageUrl, string content = "Describe the picture.", string? explanation = null)
		{
			var snapshot = new QuestionSnapshotDto
			{
				QuestionId = testQuestionId,
				PartId = 1,
				Content = content,
				ImageUrl = imageUrl,
				Explanation = explanation
			};

			return new TestQuestion
			{
				TestQuestionId = testQuestionId,
				OrderInTest = 3,
				TestId = 1,
				SnapshotJson = JsonSerializer.Serialize(snapshot)
			};
		}

		private static string CreatePythonResponseJson(int questionNumber, string text, int overallScore, string partType = "writing_sentence")
		{
			var response = new PythonWritingResponse
			{
				Text = text,
				PartType = partType,
				QuestionNumber = questionNumber,
				OverallScore = overallScore,
				Scores = new PythonScoreBreakdown
				{
					WordCount = 35,
					Grammar = 90,
					Vocabulary = 85,
					Organization = 88,
					Relevance = 92,
					SentenceVariety = 80,
					OpinionSupport = 78,
					Overall = overallScore
				},
				DetailedAnalysis = new PythonDetailedAnalysis
				{
					CorrectedText = "Corrected people at work.",
					ImageDescription = "Two people meeting.",
					GrammarErrors = new List<PythonGrammarError>(),
					VocabularyIssues = new List<PythonVocabularyIssue>(),
					MissingPoints = new List<string>(),
					MatchedPoints = new List<string> { "Mentioned office" },
					OpinionSupportIssues = new List<string>()
				},
				Recommendations = new List<string> { "Keep practicing descriptions." }
			};

			return JsonSerializer.Serialize(response, new JsonSerializerOptions
			{
				PropertyNamingPolicy = JsonNamingPolicy.CamelCase
			});
		}

		private static string CreatePythonSpeakingResponseJson(string taskType, int questionNumber, int overallScore)
		{
			var response = new PythonSpeakingResponse
			{
				Transcription = "Sample transcription text.",
				Duration = 42.5,
				Scores = new Dictionary<string, object>
				{
					{ "fluency", 90 },
					{ "pronunciation", 85 }
				},
				DetailedAnalysis = new Dictionary<string, object>
				{
					{ "notes", "Clear articulation." }
				},
				Recommendations = new List<string> { "Maintain steady pace." },
				OverallScore = overallScore,
				QuestionType = taskType,
				QuestionNumber = questionNumber,
				Timestamp = DateTime.UtcNow.ToString("O")
			};

			return JsonSerializer.Serialize(response, new JsonSerializerOptions
			{
				PropertyNamingPolicy = JsonNamingPolicy.CamelCase
			});
		}

		private static IFormFile CreateAudioFormFile(string fileName = "answer.wav")
		{
			var content = Encoding.UTF8.GetBytes("audio-bytes");
			var fileMock = new Mock<IFormFile>();
			fileMock.Setup(f => f.OpenReadStream()).Returns(() => new MemoryStream(content));
			fileMock.Setup(f => f.FileName).Returns(fileName);
			fileMock.Setup(f => f.Length).Returns(content.Length);
			fileMock.Setup(f => f.ContentType).Returns("audio/wav");
			return fileMock.Object;
		}

		private static HttpResponseMessage BuildHttpResponse(HttpStatusCode statusCode, string content)
		{
			return new HttpResponseMessage(statusCode)
			{
				Content = new StringContent(content, Encoding.UTF8, "application/json")
			};
		}

		private (AssessmentService service,
			Mock<IHttpClientFactory> httpClientFactoryMock,
			Mock<IUnitOfWork> uowMock,
			Mock<IAIFeedbackRepository> feedbackRepoMock,
			Mock<ITestQuestionRepository> testQuestionRepoMock,
			Mock<IFileService> fileServiceMock,
			Mock<IUserTestRepository> userTestRepoMock,
			Mock<IUserAnswerRepository> userAnswerRepoMock,
			Mock<ITestResultRepository> testResultRepoMock)
			CreateServiceAsync(
				Func<HttpRequestMessage, CancellationToken, Task<HttpResponseMessage>>? writingHandler = null,
				Func<HttpRequestMessage, CancellationToken, Task<HttpResponseMessage>>? speakingHandler = null)
		{
			writingHandler ??= (_, _) => Task.FromResult(BuildHttpResponse(HttpStatusCode.OK, "{}"));
			speakingHandler ??= (_, _) => Task.FromResult(BuildHttpResponse(HttpStatusCode.OK, "{}"));

			var httpClientFactoryMock = new Mock<IHttpClientFactory>();
			var writingClient = new HttpClient(new TestHttpMessageHandler(writingHandler));
			var speakingClient = new HttpClient(new TestHttpMessageHandler(speakingHandler));

			httpClientFactoryMock.Setup(f => f.CreateClient("WritingApi")).Returns(writingClient);
			httpClientFactoryMock.Setup(f => f.CreateClient("SpeakingApi")).Returns(speakingClient);

			var uowMock = new Mock<IUnitOfWork>();
			var feedbackRepoMock = new Mock<IAIFeedbackRepository>();
			var testQuestionRepoMock = new Mock<ITestQuestionRepository>();
			var fileServiceMock = new Mock<IFileService>();
			var userTestRepoMock = new Mock<IUserTestRepository>();
			var userAnswerRepoMock = new Mock<IUserAnswerRepository>();
			var testResultRepoMock = new Mock<ITestResultRepository>();

			uowMock.SetupGet(u => u.TestResults).Returns(testResultRepoMock.Object);
			uowMock.SetupGet(u => u.UserTests).Returns(userTestRepoMock.Object);
			uowMock.SetupGet(u => u.UserAnswers).Returns(userAnswerRepoMock.Object);
			uowMock.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);

			var loggerMock = new Mock<ILogger<AssessmentService>>();
			var options = Options.Create(new PythonApiSettings
			{
				WritingApiUrl = "http://python-writing",
				SpeakingApiUrl = "http://python-speaking"
			});

			var service = new AssessmentService(
				httpClientFactoryMock.Object,
				uowMock.Object,
				feedbackRepoMock.Object,
				testQuestionRepoMock.Object,
				fileServiceMock.Object,
				options,
				loggerMock.Object);

			return (service, httpClientFactoryMock, uowMock, feedbackRepoMock, testQuestionRepoMock,
				fileServiceMock, userTestRepoMock, userAnswerRepoMock, testResultRepoMock);
		}

		private sealed class TestHttpMessageHandler : HttpMessageHandler
		{
			private readonly Func<HttpRequestMessage, CancellationToken, Task<HttpResponseMessage>> _handler;

			public TestHttpMessageHandler(Func<HttpRequestMessage, CancellationToken, Task<HttpResponseMessage>> handler)
			{
				_handler = handler;
			}

			protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
				=> _handler(request, cancellationToken);
		}
		#endregion
	}
}
