using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using ToeicGenius.Domains.DTOs.Requests.Test;
using ToeicGenius.Domains.Enums;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Services.Interfaces;

namespace ToeicGenius.BackgroundServices
{
	/// <summary>
	/// Background service that runs every 2 minutes to auto-submit expired tests
	/// when frontend fails to submit due to network issues or crashes
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

			try
			{
				// Get all InProgress test results with their test details
				var expiredTests = await uow.TestResults.GetExpiredInProgressTestsAsync();

				if (expiredTests == null || !expiredTests.Any())
				{
					_logger.LogDebug("No expired tests found at {Time}", DateTime.UtcNow);
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

						var elapsedTime = DateTime.UtcNow - testResult.CreatedAt;
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
							if (test.TestSkill == TestSkill.LR || test.TestSkill == TestSkill.FourSkills)
							{
								// For LR and FourSkills tests, call SubmitLRTestAsync
								var submitRequest = new SubmitLRTestRequestDto
								{
									TestId = test.TestId,
									TestResultId = testResult.TestResultId,
									Duration = (int)elapsedTime.TotalMinutes,
									TestType = test.TestType,
									Answers = new List<UserLRAnswerDto>() // Empty - will use saved answers from database
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
							else
							{
								// For Speaking/Writing tests, just mark as Graded (bulk grading will handle scoring)
								testResult.Status = TestResultStatus.Graded;
								testResult.Duration = (int)elapsedTime.TotalMinutes;
								testResult.UpdatedAt = DateTime.UtcNow;
								await uow.TestResults.UpdateAsync(testResult);
								await uow.SaveChangesAsync();

								_logger.LogInformation("Successfully marked Speaking/Writing test as Graded for TestResult {TestResultId}", testResult.TestResultId);
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
	}
}
