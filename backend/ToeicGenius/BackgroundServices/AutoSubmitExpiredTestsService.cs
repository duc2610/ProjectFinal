using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using ToeicGenius.Domains.DTOs.Requests.AI;
using ToeicGenius.Domains.DTOs.Requests.Test;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Domains.Enums;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Services.Interfaces;
using static ToeicGenius.Shared.Helpers.DateTimeHelper;

namespace ToeicGenius.BackgroundServices
{
	/// <summary>
	/// Background service that runs every 2 minutes to auto-submit expired tests
	/// when frontend fails to submit due to network issues or crashes.
	/// Only processes tests with IsSelectTime = true (timed tests).
	/// </summary>
	public class AutoSubmitExpiredTestsService : BackgroundService
	{
		private readonly IServiceProvider _serviceProvider;
		private readonly ILogger<AutoSubmitExpiredTestsService> _logger;
		private readonly TimeSpan _checkInterval = TimeSpan.FromMinutes(2);

		public AutoSubmitExpiredTestsService(
			IServiceProvider serviceProvider,
			ILogger<AutoSubmitExpiredTestsService> logger)
		{
			_serviceProvider = serviceProvider;
			_logger = logger;
		}

		protected override async Task ExecuteAsync(CancellationToken stoppingToken)
		{
			_logger.LogInformation("AutoSubmitExpiredTestsService started. Checking every {Minutes} minutes.", _checkInterval.TotalMinutes);

			while (!stoppingToken.IsCancellationRequested)
			{
				try
				{
					await ProcessExpiredTestsAsync();
				}
				catch (Exception ex)
				{
					_logger.LogError(ex, "Error occurred while processing expired tests.");
				}

				// Wait before next check
				await Task.Delay(_checkInterval, stoppingToken);
			}

			_logger.LogInformation("AutoSubmitExpiredTestsService stopped.");
		}

		private async Task ProcessExpiredTestsAsync()
		{
			using var scope = _serviceProvider.CreateScope();
			var uow = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
			var testService = scope.ServiceProvider.GetRequiredService<ITestService>();
			var assessmentService = scope.ServiceProvider.GetRequiredService<IAssessmentService>();

			try
			{
				// Get all InProgress test results with IsSelectTime = true (timed tests only)
				var expiredTests = await uow.TestResults.GetExpiredInProgressTestsAsync();

				if (expiredTests == null || !expiredTests.Any())
				{
					_logger.LogDebug("No expired tests found at {Time}", UtcNow);
					return;
				}

				_logger.LogInformation("Found {Count} expired test(s) to auto-submit.", expiredTests.Count);

				foreach (var testResult in expiredTests)
				{
					try
					{
						var test = await uow.Tests.GetByIdAsync(testResult.TestId);
						if (test == null)
						{
							_logger.LogWarning("Test {TestId} not found for TestResult {TestResultId}", testResult.TestId, testResult.TestResultId);
							continue;
						}

						var elapsedTime = UtcNow - testResult.CreatedAt;
						var expectedDuration = TimeSpan.FromMinutes(test.Duration + 5); // 5 minutes grace period

						if (elapsedTime > expectedDuration)
						{
							_logger.LogInformation(
								"Auto-submitting TestResult {TestResultId} for User {UserId}. Elapsed: {Elapsed} min, Expected: {Expected} min",
								testResult.TestResultId,
								testResult.UserId,
								elapsedTime.TotalMinutes,
								expectedDuration.TotalMinutes);

							// Auto-submit based on test skill
							if (test.TestSkill == TestSkill.LR)
							{
								await AutoSubmitLRTestAsync(testService, testResult, test, (int)elapsedTime.TotalMinutes);
							}
							else
							{
								// For Speaking/Writing/SW tests, build bulk request and call AI grading
								await AutoSubmitSWTestAsync(uow, assessmentService, testResult, test, (int)elapsedTime.TotalMinutes);
							}
						}
					}
					catch (Exception ex)
					{
						_logger.LogError(ex, "Error auto-submitting TestResult {TestResultId}", testResult.TestResultId);
					}
				}
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error in ProcessExpiredTestsAsync");
			}
		}

		/// <summary>
		/// Auto-submit Listening & Reading test
		/// </summary>
		private async Task AutoSubmitLRTestAsync(ITestService testService, TestResult testResult, Test test, int duration)
		{
			var submitRequest = new SubmitLRTestRequestDto
			{
				TestId = test.TestId,
				TestResultId = testResult.TestResultId,
				Duration = duration,
				TestType = test.TestType,
				Answers = new List<UserLRAnswerDto>() // Empty - will get saved answers from database
			};

			var result = await testService.SubmitLRTestAsync(testResult.UserId, submitRequest);

			if (result.IsSuccess)
			{
				_logger.LogInformation("Successfully auto-submitted LR test for TestResult {TestResultId}", testResult.TestResultId);
			}
			else
			{
				_logger.LogError("Failed to auto-submit LR test for TestResult {TestResultId}: {Error}",
					testResult.TestResultId, result.ErrorMessage);
			}
		}

		/// <summary>
		/// Auto-submit Speaking/Writing test by calling AI grading service
		/// </summary>
		private async Task AutoSubmitSWTestAsync(IUnitOfWork uow, IAssessmentService assessmentService, TestResult testResult, Test test, int duration)
		{
			try
			{
				// Lấy saved answers từ DB
				var savedAnswers = await uow.UserAnswers.GetByTestResultIdAsync(testResult.TestResultId);

				// Lấy test questions với Part để xác định PartType
				var testQuestions = await uow.TestQuestions.GetByTestIdWithPartAsync(test.TestId);

				// Build danh sách parts cho bulk request
				var parts = new List<BulkAssessmentPartDto>();

				foreach (var tq in testQuestions)
				{
					var savedAnswer = savedAnswers.FirstOrDefault(sa => sa.TestQuestionId == tq.TestQuestionId);
					var partType = GetPartTypeFromPart(tq.Part);

					parts.Add(new BulkAssessmentPartDto
					{
						TestQuestionId = tq.TestQuestionId,
						PartType = partType,
						AnswerText = savedAnswer?.AnswerText,
						AudioFileUrl = savedAnswer?.AnswerAudioUrl
					});
				}

				// Build bulk request
				var bulkRequest = new SubmitBulkAssessmentRequestDto
				{
					TestResultId = testResult.TestResultId,
					Duration = duration,
					TestType = test.TestType.ToString(),
					Parts = parts
				};

				// Gọi Assessment Service để chấm điểm
				await assessmentService.SubmitBulkAssessmentAsync(bulkRequest, testResult.UserId);

				_logger.LogInformation("Successfully auto-submitted S&W test with AI grading for TestResult {TestResultId}", testResult.TestResultId);
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "AI grading failed for TestResult {TestResultId}, marking as Graded with score 0", testResult.TestResultId);

				// Nếu AI grading fail, vẫn mark là Graded với score = 0 để không block user
				testResult.Status = TestResultStatus.Graded;
				testResult.Duration = duration;
				testResult.TotalScore = 0;
				testResult.UpdatedAt = UtcNow;
				await uow.TestResults.UpdateAsync(testResult);
				await uow.SaveChangesAsync();
			}
		}

		/// <summary>
		/// Get part type string from Part entity for bulk assessment
		/// </summary>
		private static string GetPartTypeFromPart(Part? part)
		{
			if (part == null)
				return "writing_sentence";

			return part.PartNumber switch
			{
				// Writing parts
				8 => "writing_sentence",
				9 => "writing_email",
				10 => "writing_essay",
				// Speaking parts
				11 => "read_aloud",
				12 => "describe_picture",
				13 => "respond_questions",
				14 => "respond_with_info",
				15 => "express_opinion",
				// Fallback based on Skill
				_ => part.Skill == QuestionSkill.Writing ? "writing_sentence" : "read_aloud"
			};
		}
	}
}
