using System.Text.Json.Serialization;
using System.Text.Json;
using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.DTOs.Requests.Exam;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Domains.Enums;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Services.Interfaces;
using ToeicGenius.Shared.Constants;
using ToeicGenius.Domains.DTOs.Requests.Test;
using ToeicGenius.Domains.DTOs.Responses.Test;
using ToeicGenius.Domains.DTOs.Responses.Question;
using ToeicGenius.Domains.DTOs.Responses.QuestionGroup;
using Newtonsoft.Json;
using Humanizer;

namespace ToeicGenius.Services.Implementations
{
	public class TestService : ITestService
	{
		private readonly IUnitOfWork _uow;
		public TestService(IUnitOfWork unitOfWork)
		{
			_uow = unitOfWork;
		}
		public async Task<Result<string>> CreateTestFromBankAsync(CreateTestFromBankDto dto)
		{
			await _uow.BeginTransactionAsync();
			try
			{
				if (dto.SingleQuestionIds == null && dto.GroupQuestionIds == null)
					throw new ArgumentException("Must provide single question id or group question id");

				var test = new Test
				{
					Title = dto.Title,
					Description = dto.Description,
					Duration = dto.Duration,
					TestSkill = dto.TestSkill,
					TestType = dto.TestType
				};
				await _uow.Tests.AddAsync(test);

				var singleQuestions = await _uow.Questions.GetByListIdAsync(dto.SingleQuestionIds);
				var groupQuestions = await _uow.QuestionGroups.GetByListIdAsync(dto.GroupQuestionIds);

				var order = 1;
				foreach (var q in singleQuestions)
				{
					var snapshot = System.Text.Json.JsonSerializer.Serialize(q, new JsonSerializerOptions
					{
						ReferenceHandler = ReferenceHandler.IgnoreCycles
					});

					await _uow.TestQuestions.AddAsync(new TestQuestion
					{
						Test = test,
						OriginalQuestionId = q.QuestionId,
						PartId = q.PartId,
						SnapshotJson = snapshot,
						OrderInTest = order++,
					});
				}

				foreach (var q in groupQuestions)
				{
					var snapshot = System.Text.Json.JsonSerializer.Serialize(q, new JsonSerializerOptions
					{
						ReferenceHandler = ReferenceHandler.IgnoreCycles
					});

					await _uow.TestQuestions.AddAsync(new TestQuestion
					{
						Test = test,
						OriginalQuestionGroupId = q.QuestionGroupId,
						PartId = q.PartId,
						SnapshotJson = snapshot,
						OrderInTest = order++,
					});
				}

				await _uow.SaveChangesAsync();
				await _uow.CommitTransactionAsync();
				return Result<string>.Success("Created successfully");
			}
			catch (Exception ex)
			{
				await _uow.RollbackTransactionAsync();
				return Result<string>.Failure(ex.ToString());
			}
		}

		// Simulator test
		// Create manual
		public async Task<Result<string>> CreateTestManualAsync(CreateTestManualDto dto)
		{
			await _uow.BeginTransactionAsync();

			try
			{
				var expectedParts = GetExpectedParts(dto.TestSkill);
				var invalidPart = dto.Parts.FirstOrDefault(p => !expectedParts.Contains(p.PartId));
				if (invalidPart != null)
					throw new Exception($"Invalid PartId {invalidPart.PartId} for {dto.TestSkill}");

				var duration = dto.TestSkill == TestSkill.LR ? NumberConstants.LRDuration : (dto.TestSkill == TestSkill.Speaking ? NumberConstants.SpeakingDuration : NumberConstants.WritingDuration);

				var test = new Test
				{
					Title = dto.Title,
					Description = dto.Description,
					Duration = duration,
					TestSkill = dto.TestSkill,
					TestType = TestType.Simulator,
					CreatedAt = DateTime.UtcNow
				};
				await _uow.Tests.AddAsync(test);


				int order = 1;
				var testQuestions = new List<TestQuestion>();

				foreach (var part in dto.Parts)
				{
					// Groups
					if (part.Groups != null)
					{
						foreach (var groupDto in part.Groups)
						{
							var groupEntity = new QuestionGroup
							{
								PassageContent = groupDto.Passage,
								AudioUrl = "",
								ImageUrl = "",
								PartId = part.PartId,
							};
							await _uow.QuestionGroups.AddAsync(groupEntity);
							await _uow.SaveChangesAsync();

							var questions = new List<Question>();
							foreach (var q in groupDto.Questions)
							{
								var qEntity = new Question
								{
									QuestionGroupId = groupEntity.QuestionGroupId,
									Content = q.Content,
									AudioUrl = "",
									ImageUrl = "",
									Explanation = q.Explanation,
									PartId = part.PartId
								};
								await _uow.Questions.AddAsync(qEntity);
								await _uow.SaveChangesAsync();

								foreach (var opt in q.Options)
								{
									await _uow.Options.AddAsync(new Option
									{
										QuestionId = qEntity.QuestionId,
										Label = opt.Label,
										Content = opt.Content,
										IsCorrect = opt.IsCorrect,
									});
								}
								await _uow.SaveChangesAsync();
								questions.Add(qEntity);
							}

							groupEntity.Questions = questions;
							await _uow.SaveChangesAsync();

							// Snapshot
							string snapshot = JsonConvert.SerializeObject(groupEntity);
							testQuestions.Add(new TestQuestion
							{
								Test = test,
								OrderInTest = order++,
								PartId = part.PartId,
								OriginalQuestionGroupId = groupEntity.QuestionGroupId,
								SnapshotJson = snapshot
							});
						}
					}

					// Single questions
					if (part.Questions != null)
					{
						foreach (var q in part.Questions)
						{
							var qEntity = new Question
							{
								Content = q.Content,
								AudioUrl = "",
								ImageUrl = "",
								Explanation = q.Explanation,
								PartId = part.PartId
							};
							await _uow.Questions.AddAsync(qEntity);
							await _uow.SaveChangesAsync();

							foreach (var opt in q.Options)
							{
								await _uow.Options.AddAsync(new Option
								{
									QuestionId = qEntity.QuestionId,
									Label = opt.Label,
									Content = opt.Content,
									IsCorrect = opt.IsCorrect,
								});
							}
							await _uow.SaveChangesAsync();

							// Snapshot
							string snapshot = JsonConvert.SerializeObject(qEntity);
							testQuestions.Add(new TestQuestion
							{
								Test = test,
								OrderInTest = order++,
								PartId = part.PartId,
								OriginalQuestionId = qEntity.QuestionId,
								SnapshotJson = snapshot
							});
						}
					}
				}

				await _uow.SaveChangesAsync();
				await _uow.CommitTransactionAsync();
				return Result<string>.Success($"Created successfully {test.TestId}");
			}
			catch (Exception ex)
			{
				await _uow.RollbackTransactionAsync();
				return Result<string>.Failure(ex.ToString());
			}
		}

		public async Task<Result<PaginationResponse<TestListResponseDto>>> FilterTestAsync(TestFilterDto request)
		{
			var result = await _uow.Tests.FilterQuestionsAsync(request);
			return Result<PaginationResponse<TestListResponseDto>>.Success(result);

		}

		public async Task<Result<TestDetailDto>> GetTestDetailAsync(int id)
		{
			var test = await _uow.Tests.GetTestByIdAsync(id);
			if (test == null) return Result<TestDetailDto>.Failure("Test not found");

			var result = new TestDetailDto
			{
				TestId = test.TestId,
				Title = test.Title,
				Description = test.Description,
				Duration = test.Duration,
				AudioUrl = test.AudioUrl,
				TestType = test.TestType,
				TestSkill = test.TestSkill,
				Status = test.Status,
				CreatedAt = test.CreatedAt,
				UpdatedAt = test.UpdatedAt
			};
			// Nếu test chưa có câu hỏi
			if (test.TestQuestions == null || !test.TestQuestions.Any())
				return Result<TestDetailDto>.Success(result);

			var groupedByPart = test.TestQuestions
				.Where(q => q.PartId != null)
				.GroupBy(q => q.PartId)
				.ToList();

			foreach (var group in groupedByPart)
			{
				var first = group.First();
				var partDto = new TestPartDto
				{
					PartId = first.PartId!.Value,
					PartName = first.Part?.Name ?? $"Part {first.PartId}",
				};

				foreach (var tq in group.OrderBy(q => q.OrderInTest))
				{
					if (tq.OriginalQuestionGroupId != null)
					{
						var groupSnap = System.Text.Json.JsonSerializer.Deserialize<QuestionGroupSnapshotDto>(tq.SnapshotJson);
						if (groupSnap != null)
							partDto.QuestionGroups.Add(groupSnap);
					}
					else
					{
						var questionSnap = System.Text.Json.JsonSerializer.Deserialize<QuestionSnapshotDto>(tq.SnapshotJson);
						if (questionSnap != null)
							partDto.Questions.Add(questionSnap);
					}
				}

				result.Parts.Add(partDto);
			}
			return Result<TestDetailDto>.Success(result);
		}

		public async Task<Result<string>> UpdateTestStatusAsync(UpdateTestStatusDto request)
		{
			var test = await _uow.Tests.GetByIdAsync(request.TestId);
			if (test == null) return Result<string>.Failure("Not found");

			test.Status = request.Status;
			test.UpdatedAt = DateTime.Now;
			await _uow.SaveChangesAsync();

			return Result<string>.Success($"Test {test.TestId} {test.Status} successfully");
		}

		private List<int> GetExpectedParts(TestSkill skill)
		{
			return skill switch
			{
				TestSkill.LR => new List<int> { 1, 2, 3, 4, 5, 6, 7 },
				TestSkill.Speaking => new List<int> { 1, 2, 3 },
				TestSkill.Writing => new List<int> { 1, 2, 3, 4, 5 },
				_ => new List<int>()
			};
		}
	}
}
