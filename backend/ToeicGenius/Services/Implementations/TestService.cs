using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System.Text.Json;
using System.Text.Json.Serialization;
using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.DTOs.Requests.AI;
using ToeicGenius.Domains.DTOs.Requests.Exam;
using ToeicGenius.Domains.DTOs.Requests.Test;
using ToeicGenius.Domains.DTOs.Requests.TestQuestion;
using ToeicGenius.Domains.DTOs.Responses.Question;
using ToeicGenius.Domains.DTOs.Responses.QuestionGroup;
using ToeicGenius.Domains.DTOs.Responses.Test;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Domains.Enums;
using ToeicGenius.Extensions;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Services.Interfaces;
using ToeicGenius.Shared.Constants;
using ToeicGenius.Shared.Helpers;
using static ToeicGenius.Shared.Helpers.DateTimeHelper;
using ToeicGenius.Shared.Validators;
using Microsoft.EntityFrameworkCore;

namespace ToeicGenius.Services.Implementations
{
	public class TestService : ITestService
	{
		private readonly IUnitOfWork _uow;
		private readonly IFileService _fileService;
		private readonly IAssessmentService _assessmentService;

		public TestService(IUnitOfWork unitOfWork, IFileService fileService, IAssessmentService assessmentService)
		{
			_uow = unitOfWork;
			_fileService = fileService;
			_assessmentService = assessmentService;
		}

		#region Manage Tests - Test Creator
		/* CREATE - Start */
		// Create from bank (for practice test)
		public async Task<Result<string>> CreateFromBankAsync(Guid userId, CreateTestFromBankDto dto)
		{
			await _uow.BeginTransactionAsync();
			try
			{
				if ((dto.SingleQuestionIds == null || !dto.SingleQuestionIds.Any()) &&
					(dto.GroupQuestionIds == null || !dto.GroupQuestionIds.Any()))
				{
					return Result<string>.Failure(ErrorMessages.NoQuestionsToSaveForThisTest);
				}

				var test = new Test
				{
					Title = dto.Title,
					Description = dto.Description,
					Duration = dto.Duration,
					TestSkill = dto.TestSkill,
					Version = NumberConstants.FirstVersion,
					TestType = TestType.Practice,
					CreatedById = userId
				};

				var singleQuestions = new List<QuestionSnapshotDto>();
				var groupQuestions = new List<QuestionGroupSnapshotDto>();
				if (dto.SingleQuestionIds != null)
				{
					singleQuestions = await _uow.Questions.GetByListIdAsync(dto.SingleQuestionIds);
					// C� ID kh�ng t?n t?i trong DB
					if (singleQuestions.Count != dto.SingleQuestionIds.Count)
					{
						var foundIds = singleQuestions.Select(q => q.QuestionId).ToHashSet();
						var missingIds = dto.SingleQuestionIds.Where(id => !foundIds.Contains(id));

						return Result<string>.Failure(
							$"Kh�ng t�m th?y c�u h?i trong ng�n h�ng ({string.Join(", ", missingIds)})"
						);
					}
					// Validate all PartIds from fetched questions match TestSkill
					foreach (var q in singleQuestions)
					{
						var (isValid, errorMessage) = await ValidatePartForTestSkillAsync(q.PartId, dto.TestSkill);
						if (!isValid)
						{
							return Result<string>.Failure($"C�u h?i (id = {q.QuestionId}): {errorMessage}");
						}
					}
				}
				if (dto.GroupQuestionIds != null)
				{
					groupQuestions = await _uow.QuestionGroups.GetByListIdAsync(dto.GroupQuestionIds);
					// C� group ID kh�ng t?n t?i
					if (groupQuestions.Count != dto.GroupQuestionIds.Count)
					{
						var foundIds = groupQuestions.Select(g => g.QuestionGroupId).ToHashSet();
						var missingIds = dto.GroupQuestionIds.Where(id => !foundIds.Contains(id));

						return Result<string>.Failure(
							$"Kh�ng t�m th?y c�u h?i nh�m trong ng�n h�ng ({string.Join(", ", missingIds)})"
						);
					}
					foreach (var g in groupQuestions)
					{
						var (isValid, errorMessage) = await ValidatePartForTestSkillAsync(g.PartId, dto.TestSkill);
						if (!isValid)
						{
							return Result<string>.Failure($"C�u h?i nh�m (id ={g.QuestionGroupId}): {errorMessage}");
						}
					}

				}

				var quantityQuestion = 0;
				var order = NumberConstants.FirstOrderNumber;
				foreach (var q in singleQuestions)
				{
					quantityQuestion++;
					var snapshot = System.Text.Json.JsonSerializer.Serialize(q, new JsonSerializerOptions
					{
						ReferenceHandler = ReferenceHandler.IgnoreCycles
					});
					await _uow.TestQuestions.AddAsync(new TestQuestion
					{
						Test = test,
						IsQuestionGroup = false,
						PartId = q.PartId,
						SnapshotJson = snapshot,
						OrderInTest = order++,
						SourceType = QuestionSourceType.FromBank,
						SourceQuestionId = q.QuestionId,
						CreatedAt = UtcNow
					});
				}

				foreach (var q in groupQuestions)
				{
					quantityQuestion += q.QuestionSnapshots.Count();
					var snapshot = System.Text.Json.JsonSerializer.Serialize(q, new JsonSerializerOptions
					{
						ReferenceHandler = ReferenceHandler.IgnoreCycles
					});

					await _uow.TestQuestions.AddAsync(new TestQuestion
					{
						Test = test,
						IsQuestionGroup = true,
						PartId = q.PartId,
						SnapshotJson = snapshot,
						OrderInTest = order++,
						SourceType = QuestionSourceType.FromBank,
						SourceQuestionGroupId = q.QuestionGroupId,
						CreatedAt = UtcNow,
					});
				}
				test.TotalQuestion = quantityQuestion;
				test.CreationStatus = TestCreationStatus.Completed;
				test.VisibilityStatus = TestVisibilityStatus.Hidden;
				await _uow.Tests.AddAsync(test);

				await _uow.SaveChangesAsync();
				await _uow.CommitTransactionAsync();
				return Result<string>.Success(string.Format(SuccessMessages.TestCreatedWithId, test.TestId));
			}
			catch (Exception ex)
			{
				await _uow.RollbackTransactionAsync();
				return Result<string>.Failure(ex.ToString());
			}
		}

		// Create from bank with random selection (for practice test)
		public async Task<Result<string>> CreateFromBankRandomAsync(Guid userId, CreateTestFromBankRandomDto dto)
		{
			await _uow.BeginTransactionAsync();
			try
			{
				if (dto.QuestionRanges == null || !dto.QuestionRanges.Any())
				{
					return Result<string>.Failure(ErrorMessages.NoQuestionRange);
				}

				// Validate all PartIds match TestSkill
				foreach (var range in dto.QuestionRanges)
				{
					var (isValid, errorMessage) = await ValidatePartForTestSkillAsync(range.PartId, dto.TestSkill);
					if (!isValid)
					{
						return Result<string>.Failure(errorMessage);
					}
				}

				var test = new Test
				{
					Title = dto.Title,
					Description = dto.Description,
					Duration = dto.Duration,
					TestSkill = dto.TestSkill,
					Version = NumberConstants.FirstVersion,
					TestType = TestType.Practice,
					CreatedById = userId
				};

				var quantityQuestion = 0;
				var order = NumberConstants.FirstOrderNumber;

				foreach (var range in dto.QuestionRanges)
				{
					// Random single questions
					if (range.SingleQuestionCount.HasValue && range.SingleQuestionCount.Value > 0)
					{
						var randomQuestions = await _uow.Questions.GetRandomQuestionsAsync(
							range.PartId,
							range.QuestionTypeId,
							range.SingleQuestionCount.Value
						);

						if (randomQuestions.Count < range.SingleQuestionCount.Value)
						{
							await _uow.RollbackTransactionAsync();
							return Result<string>.Failure(
								$"Not enough questions in bank for PartId={range.PartId}. " +
								$"Requested: {range.SingleQuestionCount.Value}, Available: {randomQuestions.Count}"
							);
						}

						foreach (var q in randomQuestions)
						{
							quantityQuestion++;
							var snapshotDto = q.ToSnapshotDto();
							var snapshot = System.Text.Json.JsonSerializer.Serialize(snapshotDto);

							await _uow.TestQuestions.AddAsync(new TestQuestion
							{
								Test = test,
								IsQuestionGroup = false,
								PartId = q.PartId,
								SnapshotJson = snapshot,
								OrderInTest = order++,
								SourceType = QuestionSourceType.FromBank,
								SourceQuestionId = q.QuestionId,
								CreatedAt = UtcNow
							});
						}
					}

					// Random question groups
					if (range.GroupQuestionCount.HasValue && range.GroupQuestionCount.Value > 0)
					{
						var randomGroups = await _uow.QuestionGroups.GetRandomQuestionGroupsAsync(
							range.PartId,
							range.QuestionTypeId,
							range.GroupQuestionCount.Value
						);

						if (randomGroups.Count < range.GroupQuestionCount.Value)
						{
							await _uow.RollbackTransactionAsync();
							return Result<string>.Failure(
								$"Not enough question groups in bank for PartId={range.PartId}. " +
								$"Requested: {range.GroupQuestionCount.Value}, Available: {randomGroups.Count}"
							);
						}

						foreach (var g in randomGroups)
						{
							quantityQuestion += g.Questions.Count();
							var snapshotDto = g.ToSnapshotDto();
							var snapshot = System.Text.Json.JsonSerializer.Serialize(snapshotDto);

							await _uow.TestQuestions.AddAsync(new TestQuestion
							{
								Test = test,
								IsQuestionGroup = true,
								PartId = g.PartId,
								SnapshotJson = snapshot,
								OrderInTest = order++,
								SourceType = QuestionSourceType.FromBank,
								SourceQuestionGroupId = g.QuestionGroupId,
								CreatedAt = UtcNow,
							});
						}
					}
				}

				test.TotalQuestion = quantityQuestion;
				test.CreationStatus = TestCreationStatus.Completed;
				test.VisibilityStatus = TestVisibilityStatus.Hidden;
				await _uow.Tests.AddAsync(test);

				await _uow.SaveChangesAsync();
				await _uow.CommitTransactionAsync();
				return Result<string>.Success(string.Format(SuccessMessages.TestCreatedFromBank, test.TestId, quantityQuestion));
			}
			catch (Exception ex)
			{
				await _uow.RollbackTransactionAsync();
				return Result<string>.Failure(ex.ToString());
			}
		}

		// Create manual (for simulator test)
		public async Task<Result<string>> CreateManualAsync(Guid userId, CreateTestManualDto dto)
		{
			await _uow.BeginTransactionAsync();
			var uploadedFiles = new List<string>();

			var jsonSettings = new JsonSerializerSettings
			{
				ReferenceLoopHandling = ReferenceLoopHandling.Ignore,
				NullValueHandling = NullValueHandling.Include, // Gi? key n?u null d? d? debug snapshot
				ContractResolver = new CamelCasePropertyNamesContractResolver()
			};

			try
			{
				// Validate c?u tr�c test d?u v�o
				TestValidator.ValidateTestStructure(dto);

				if (dto.TestSkill == TestSkill.LR && string.IsNullOrEmpty(dto.AudioUrl))
					return Result<string>.Failure("L&R test requires an audio file.");

				int duration = GetTestDuration(dto.TestSkill);
				int quantity = GetQuantityQuestion(dto);

				// Kh?i t?o d?i tu?ng Test
				var test = new Test
				{
					Title = dto.Title,
					Description = dto.Description,
					Duration = duration,
					TestSkill = dto.TestSkill,
					TestType = TestType.Simulator,
					AudioUrl = dto.AudioUrl,
					Version = NumberConstants.FirstVersion,
					TotalQuestion = quantity,
					CreatedAt = UtcNow,
					CreatedById = userId
				};

				await _uow.Tests.AddAsync(test);

				var testQuestions = new List<TestQuestion>();
				int order = 1;

				// Duy?t qua t?ng Part
				foreach (var part in dto.Parts)
				{
					// X? l� nh�m c�u h?i
					if (part.Groups?.Any() == true)
					{
						foreach (var groupDto in part.Groups)
						{
							var groupSnapshot = await HandleQuestionGroupSnapshotAsync(groupDto, part.PartId, dto.TestSkill);

							string snapshotJson = JsonConvert.SerializeObject(groupSnapshot, jsonSettings);

							testQuestions.Add(new TestQuestion
							{
								Test = test,
								OrderInTest = order++,
								IsQuestionGroup = true,
								PartId = part.PartId,
								SourceType = QuestionSourceType.Manual,
								SnapshotJson = snapshotJson,
								CreatedAt = UtcNow
							});
						}
					}

					// X? l� c�u h?i don
					if (part.Questions?.Any() == true)
					{
						foreach (var questionDto in part.Questions)
						{
							var questionSnapshot = await HandleSingleQuestionSnapshotAsync(questionDto, part.PartId, dto.TestSkill);

							string snapshotJson = JsonConvert.SerializeObject(questionSnapshot, jsonSettings);

							testQuestions.Add(new TestQuestion
							{
								Test = test,
								OrderInTest = order++,
								IsQuestionGroup = false,
								PartId = part.PartId,
								SourceType = QuestionSourceType.Manual,
								SnapshotJson = snapshotJson,
								CreatedAt = UtcNow
							});
						}
					}
				}
				// Luu v�o DB
				await _uow.TestQuestions.AddRangeAsync(testQuestions);
				test.CreationStatus = TestCreationStatus.Completed;
				test.VisibilityStatus = TestVisibilityStatus.Hidden;
				await _uow.SaveChangesAsync();
				await _uow.CommitTransactionAsync();

				return Result<string>.Success(string.Format(SuccessMessages.TestCreatedWithQuestions, test.TestId, quantity));
			}
			catch (Exception ex)
			{
				await _uow.RollbackTransactionAsync();
				await _fileService.RollbackAndCleanupAsync(uploadedFiles);
				return Result<string>.Failure($"Error: {ex.Message}");
			}
		}

		// Create for each part 
		// Create draft test
		public async Task<Result<string>> CreateDraftManualAsync(Guid userId, CreateTestManualDraftDto dto)
		{
			try
			{
				var test = new Test
				{
					Title = dto.Title,
					Description = dto.Description,
					TestSkill = dto.TestSkill,
					TestType = TestType.Simulator,
					AudioUrl = dto.AudioUrl,
					CreationStatus = TestCreationStatus.Draft,
					VisibilityStatus = TestVisibilityStatus.Hidden,
					Duration = GetTestDuration(dto.TestSkill),
					CreatedAt = UtcNow,
					CreatedById = userId
				};

				await _uow.Tests.AddAsync(test);
				await _uow.SaveChangesAsync();

				return Result<string>.Success("TestId: " + test.TestId);
			}
			catch (Exception ex)
			{
				return Result<string>.Failure($"Create draft failed: {ex.Message}");
			}
		}

		// Save each part
		public async Task<Result<string>> SavePartManualAsync(Guid userId, int testId, int partId, PartDto dto)
		{
			await _uow.BeginTransactionAsync();

			try
			{
				var test = await _uow.Tests.GetByIdAsync(testId);
				if (test == null)
					return Result<string>.Failure(ErrorMessages.ExamNotFound);

				// Check ownership - user must be the creator of this test
				if (test.CreatedById != userId)
					return Result<string>.Failure(ErrorMessages.NoPermissionToActionTest);

				if (test.VisibilityStatus == TestVisibilityStatus.Published)
					return Result<string>.Failure(ErrorMessages.CannotEditPublishedTest);

				// Validate partId is compatible with test skill
				var (isValid, errorMessage) = await ValidatePartForTestSkillAsync(partId, test.TestSkill);
				if (!isValid)
					return Result<string>.Failure(errorMessage);

				// Ensure there is something to save
				if ((dto.Groups == null || !dto.Groups.Any()) && (dto.Questions == null || !dto.Questions.Any()))
					return Result<string>.Failure(ErrorMessages.NoQuestionsToSaveForThisPart);

				// Xo� d? li?u cu c?a Part n�y (n?u c�)
				var oldQuestions = await _uow.TestQuestions.GetByTestAndPartAsync(testId, partId);
				if (oldQuestions.Any())
					_uow.TestQuestions.RemoveRange(oldQuestions);

				// L?y c�c c�u h?i c�n l?i sau khi xo� Part hi?n t?i (d? resequence OrderInTest)
				var remainingQuestions = await _uow.TestQuestions.GetByTestIdAsync(testId);

				var testQuestions = new List<TestQuestion>();

				var jsonSettings = new JsonSerializerSettings
				{
					ReferenceLoopHandling = ReferenceLoopHandling.Ignore,
					NullValueHandling = NullValueHandling.Include,
					ContractResolver = new CamelCasePropertyNamesContractResolver()
				};

				// Group questions
				if (dto.Groups?.Any() == true)
				{
					foreach (var g in dto.Groups)
					{
						var snapshot = await HandleQuestionGroupSnapshotAsync(g, partId, test.TestSkill);
						string snapshotJson = JsonConvert.SerializeObject(snapshot, jsonSettings);

						testQuestions.Add(new TestQuestion
						{
							TestId = testId,
							PartId = partId,
							IsQuestionGroup = true,
							OrderInTest = 0, // will be resequenced
							SourceType = QuestionSourceType.Manual,
							SnapshotJson = snapshotJson,
							CreatedAt = UtcNow
						});
					}
				}

				// Single questions
				if (dto.Questions?.Any() == true)
				{
					foreach (var q in dto.Questions)
					{
						var snapshot = await HandleSingleQuestionSnapshotAsync(q, partId, test.TestSkill);
						string snapshotJson = JsonConvert.SerializeObject(snapshot, jsonSettings);

						testQuestions.Add(new TestQuestion
						{
							TestId = testId,
							PartId = partId,
							IsQuestionGroup = false,
							OrderInTest = 0, // will be resequenced
							SourceType = QuestionSourceType.Manual,
							SnapshotJson = snapshotJson,
							CreatedAt = UtcNow
						});
					}
				}

				// Add new items then persist to get TestQuestionIds for stable ordering
				await _uow.TestQuestions.AddRangeAsync(testQuestions);
				await _uow.SaveChangesAsync();

				// Resequence OrderInTest t? 1..N tr�n to�n b? test sau khi d� c� d? li?u m?i
				var allQuestions = await _uow.TestQuestions.GetByTestIdAsync(testId);
				var orderedPartIds = allQuestions
					.Select(q => q.PartId)
					.Distinct()
					.OrderBy(id => id)
					.ToList();

				int nextOrder = 1;
				foreach (var pid in orderedPartIds)
				{
					var itemsInPart = allQuestions
						.Where(q => q.PartId == pid)
						.OrderByDescending(q => q.IsQuestionGroup)
						.ThenBy(q => q.TestQuestionId) // ?n d?nh theo id d� sinh
						.ToList();

					foreach (var item in itemsInPart)
					{
						item.OrderInTest = nextOrder++;
					}
				}

				int totalQuestions = 0;
				foreach (var q in allQuestions)
				{
					if (q.IsQuestionGroup)
					{
						// Deserialize snapshot d? l?y s? c�u trong group
						var snapshot = JsonConvert.DeserializeObject<QuestionGroupSnapshotDto>(q.SnapshotJson);
						totalQuestions += snapshot?.QuestionSnapshots?.Count ?? 0;
					}
					else
					{
						totalQuestions += 1;
					}
				}
				// C?p nh?t t?ng s? c�u h?i c?a test sau khi luu/resequence
				test.TotalQuestion = totalQuestions;

				test.UpdatedAt = UtcNow;
				test.CreationStatus = TestCreationStatus.InProgress;

				await _uow.SaveChangesAsync();
				await _uow.CommitTransactionAsync();

				return Result<string>.Success(string.Format(SuccessMessages.PartSaved, partId));
			}
			catch (Exception ex)
			{
				await _uow.RollbackTransactionAsync();
				return Result<string>.Failure($"Save part failed: {ex.Message}");
			}
		}

		// Finalize when create full of a test
		public async Task<Result<string>> FinalizeTestAsync(Guid userId, int testId)
		{
			var test = await _uow.Tests.GetByIdAsync(testId);
			if (test == null)
				return Result<string>.Failure(ErrorMessages.ExamNotFound);

			// Check ownership - user must be the creator of this test
			if (test.CreatedById != userId)
				return Result<string>.Failure(ErrorMessages.NoPermissionToActionTest);

			// Validate c?u tr�c d?y d?
			var questions = await _uow.TestQuestions.GetByTestIdAsync(testId);
			if (questions.Count == 0)
				return Result<string>.Failure("No questions found.");

			if (test.TestSkill == TestSkill.LR && string.IsNullOrEmpty(test.AudioUrl))
				return Result<string>.Failure("L&R test requires an audio file.");

			// T�nh t?ng s? c�u
			int totalQuestions = 0;
			foreach (var q in questions)
			{
				if (q.IsQuestionGroup)
				{
					var snapshot = JsonConvert.DeserializeObject<QuestionGroupSnapshotDto>(q.SnapshotJson);
					totalQuestions += snapshot?.QuestionSnapshots?.Count ?? 0;
				}
				else
				{
					totalQuestions += 1;
				}
			}
			// Validate s? c�u
			int expectedCount = GetExpectedQuestionCount(test.TestSkill);
			if (totalQuestions != expectedCount)
				return Result<string>.Failure($"Test must have {expectedCount} questions, currently {totalQuestions}.");

			test.TotalQuestion = totalQuestions;
			test.CreationStatus = TestCreationStatus.Completed;
			test.UpdatedAt = UtcNow;

			await _uow.SaveChangesAsync();

			return Result<string>.Success(string.Format(SuccessMessages.TestFinalized, test.Title));
		}
		/* CREATE - End */

		/* LIST & DETAIL - start */
		// Get list (for TestCreator) - filter by creatorId
		public async Task<Result<PaginationResponse<TestListResponseDto>>> FilterAllAsync(TestFilterDto request, Guid? creatorId = null)
		{
			var result = await _uow.Tests.FilterTestsAsync(request, creatorId);
			// Convert UTC → Vietnam time cho tất cả items
			foreach (var item in result.DataPaginated)
			{
				if (item.CreatedAt.HasValue)
					item.CreatedAt = ToVietnamTime(item.CreatedAt.Value);
			}
			return Result<PaginationResponse<TestListResponseDto>>.Success(result);
		}

		// Get detail (for TestCreator) - check ownership
		public async Task<Result<TestDetailDto>> GetDetailAsync(int id, Guid? userId = null, bool isAdmin = false)
		{
			var test = await _uow.Tests.GetTestByIdAsync(id);
			if (test == null) return Result<TestDetailDto>.Failure(CommonMessages.DataNotFound);

			// Check ownership if not admin
			if (!isAdmin && userId.HasValue && test.CreatedById != userId.Value)
				return Result<TestDetailDto>.Failure(ErrorMessages.NoPermissionToActionTest);

			var result = new TestDetailDto
			{
				TestId = test.TestId,
				Title = test.Title,
				Description = test.Description,
				Duration = test.Duration,
				QuantityQuestion = test.TotalQuestion,
				AudioUrl = test.AudioUrl,
				TestType = test.TestType,
				TestSkill = test.TestSkill,
				CreationStatus = test.CreationStatus,
				VisibilityStatus = test.VisibilityStatus,
				CreatedAt = ToVietnamTime(test.CreatedAt),
				UpdatedAt = test.UpdatedAt.HasValue ? ToVietnamTime(test.UpdatedAt.Value) : null
			};
			// N?u test chua c� c�u h?i
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
					PartId = first.PartId!,
					PartName = first.Part?.Name ?? $"Part {first.PartId}",
				};

				foreach (var tq in group.OrderBy(q => q.OrderInTest))
				{
					if (tq.IsQuestionGroup)
					{
						var groupSnap = JsonConvert.DeserializeObject<QuestionGroupSnapshotDto>(tq.SnapshotJson);
						if (groupSnap != null)
						{
							var testQuestion = new TestQuestionViewDto
							{
								TestQuestionId = tq.TestQuestionId!,
								IsGroup = true,
								QuestionGroupSnapshotDto = groupSnap
							};
							partDto.TestQuestions.Add(testQuestion);
						}
					}
					else
					{
						var questionSnap = JsonConvert.DeserializeObject<QuestionSnapshotDto>(tq.SnapshotJson);
						if (questionSnap != null)
						{
							var testQuestion = new TestQuestionViewDto
							{
								TestQuestionId = tq.TestQuestionId!,
								IsGroup = false,
								QuestionSnapshotDto = questionSnap
							};
							partDto.TestQuestions.Add(testQuestion);
						}
					}
				}

				result.Parts.Add(partDto);
			}
			return Result<TestDetailDto>.Success(result);
		}
		/* LIST & DETAIL - end */

		/* UPDATE - Start */
		// Update Status - check ownership
		public async Task<Result<string>> UpdateStatusAsync(UpdateTestVisibilityStatusDto request, Guid userId, bool isAdmin = false)
		{
			var test = await _uow.Tests.GetByIdAsync(request.TestId);
			if (test == null) return Result<string>.Failure(CommonMessages.DataNotFound);

			// Check ownership if not admin
			if (!isAdmin && test.CreatedById != userId)
				return Result<string>.Failure(ErrorMessages.NoPermissionToActionTest);

			if (test.CreationStatus != TestCreationStatus.Completed)
			{
				return Result<string>.Failure("Ch? nh?ng b�i test ho�n ch?nh m?i c� th? thay d?i tr?ng th�i hi?n th?.");
			}

			// X? l� khi chuy?n sang Published
			if (request.VisibilityStatus == TestVisibilityStatus.Published)
			{
				// X�c d?nh rootId (g?c c?a chu?i version)
				int rootId = test.ParentTestId ?? test.TestId;

				// ?n t?t c? c�c version KH�C (trong c�ng nh�m) tru?c khi publish b?n n�y
				await _uow.Tests.HideAllPreviousVersionAsync(rootId, test.TestId);
			}
			test.VisibilityStatus = request.VisibilityStatus;
			test.UpdatedAt = UtcNow;
			await _uow.SaveChangesAsync();

			return Result<string>.Success(string.Format(SuccessMessages.TestStatusChanged, test.TestId, test.VisibilityStatus));
		}

		// Update Test From Bank (practice test) - check ownership
		public async Task<Result<string>> UpdateTestFromBankAsync(int testId, UpdateTestFromBank dto, Guid userId, bool isAdmin = false)
		{
			// 1?. Ki?m tra input h?p l?
			if ((dto.SingleQuestionIds == null || !dto.SingleQuestionIds.Any()) &&
				(dto.GroupQuestionIds == null || !dto.GroupQuestionIds.Any()))
				return Result<string>.Failure(ErrorMessages.NoQuestionsToSaveForThisTest);

			// 2?. L?y test hi?n t?i
			var existing = await _uow.Tests.GetByIdAsync(testId);
			if (existing == null)
				return Result<string>.Failure(ErrorMessages.ExamNotFound);

			// Check ownership if not admin
			if (!isAdmin && existing.CreatedById != userId)
				return Result<string>.Failure(ErrorMessages.NoPermissionToActionTest);

			var isPublished = existing.VisibilityStatus == TestVisibilityStatus.Published;
			Test targetTest;

			if (isPublished)
			{
				// Clone b?n m?i n?u test d� publish
				int parentId = existing.ParentTestId ?? existing.TestId;
				int newVersion = await _uow.Tests.GetNextVersionAsync(parentId);

				targetTest = new Test
				{
					Title = dto.Title,
					Description = dto.Description,
					TestSkill = dto.TestSkill,
					TestType = dto.TestType,
					Duration = dto.Duration,
					TotalQuestion = 0,
					CreationStatus = TestCreationStatus.Completed,
					VisibilityStatus = TestVisibilityStatus.Published,
					ParentTestId = parentId,
					Version = newVersion,
					CreatedById = userId,
					CreatedAt = UtcNow
				};

				await _uow.Tests.AddAsync(targetTest);
				await _uow.SaveChangesAsync(); // d? c� TestId

				// ?n c�c b?n cu
				await _uow.Tests.HideAllPreviousVersionAsync(parentId, targetTest.TestId);
				await _uow.SaveChangesAsync();
			}
			else
			{
				// N?u chua publish th� update tr?c ti?p
				targetTest = existing;
				targetTest.Title = dto.Title;
				targetTest.Description = dto.Description;
				targetTest.TestSkill = dto.TestSkill;
				targetTest.TestType = dto.TestType;
				targetTest.Duration = dto.Duration;
				targetTest.TotalQuestion = 0;
				targetTest.UpdatedAt = UtcNow;

				var oldQuestions = await _uow.TestQuestions.GetByTestIdAsync(targetTest.TestId);
				_uow.TestQuestions.RemoveRange(oldQuestions);
			}

			// 5?. Snapshot c�u h?i t? bank
			var jsonSettings = new JsonSerializerSettings
			{
				ReferenceLoopHandling = ReferenceLoopHandling.Ignore
			};

			var testQuestions = new List<TestQuestion>();
			int order = 1;

			// SINGLE QUESTIONS
			var singleQuestions = dto.SingleQuestionIds?.Any() == true
				? await _uow.Questions.GetByListIdAsync(dto.SingleQuestionIds)
				: new List<QuestionSnapshotDto>();
			foreach (var q in singleQuestions)
			{
				string snapshot = JsonConvert.SerializeObject(q, jsonSettings);
				testQuestions.Add(new TestQuestion
				{
					Test = targetTest,
					PartId = q.PartId,
					OrderInTest = order++,
					SourceType = QuestionSourceType.FromBank,
					IsQuestionGroup = false,
					SourceQuestionId = q.QuestionId,
					SnapshotJson = snapshot,
					CreatedAt = UtcNow
				});
			}

			// GROUP QUESTIONS
			var groupQuestions = dto.GroupQuestionIds?.Any() == true
				? await _uow.QuestionGroups.GetByListIdAsync(dto.GroupQuestionIds)
				: new List<QuestionGroupSnapshotDto>();
			foreach (var g in groupQuestions)
			{
				string snapshot = JsonConvert.SerializeObject(g, jsonSettings);
				testQuestions.Add(new TestQuestion
				{
					Test = targetTest,
					PartId = g.PartId,
					OrderInTest = order++,
					SourceType = QuestionSourceType.FromBank,
					IsQuestionGroup = true,
					SourceQuestionGroupId = g.QuestionGroupId,
					SnapshotJson = snapshot,
					CreatedAt = UtcNow
				});
			}

			// 6?. C?p nh?t l?i s? lu?ng c�u h?i
			targetTest.TotalQuestion = testQuestions.Count;

			await _uow.TestQuestions.AddRangeAsync(testQuestions);
			await _uow.SaveChangesAsync();

			// 7?. Tr? v? k?t qu?
			return Result<string>.Success(
				isPublished
					? $"T?o th�nh c�ng phi�n b?n m?i v{targetTest.Version} (TestId={targetTest.TestId})"
					: $"C?p nh?t tr?c ti?p th�nh c�ng TestId={targetTest.TestId}");
		}

		// Update Test Manual (simulator test)
		public async Task<Result<string>> UpdateManualTestAsync(int testId, UpdateManualTestDto dto, Guid userId, bool isAdmin = false)
		{
			try
			{

				var existing = await _uow.Tests.GetByIdAsync(testId);
				if (existing == null)
					return Result<string>.Failure(ErrorMessages.ExamNotFound);
				int totalQuestion = GetQuantityQuestion(dto);
				// N?u test dang PUBLISHED -> t?o b?n clone
				Test targetTest;

				if (existing.VisibilityStatus == TestVisibilityStatus.Published)
				{
					// L?y version m?i
					int parentId = existing.ParentTestId ?? existing.TestId;
					int newVersion = await _uow.Tests.GetNextVersionAsync(parentId);

					targetTest = new Test
					{
						Title = dto.Title,
						Description = dto.Description,
						TestSkill = dto.TestSkill,
						TestType = dto.TestType,
						AudioUrl = dto.AudioUrl,
						Duration = GetTestDuration(dto.TestSkill),
						TotalQuestion = totalQuestion,
						VisibilityStatus = TestVisibilityStatus.Hidden,
						CreationStatus = TestCreationStatus.Completed,
						ParentTestId = existing.ParentTestId ?? existing.TestId,
						CreatedById = userId,
						Version = newVersion,
						CreatedAt = UtcNow
					};

					await _uow.Tests.AddAsync(targetTest);
					await _uow.SaveChangesAsync();

					// ?n c�c b?n cu
					await _uow.Tests.HideAllPreviousVersionAsync(parentId, targetTest.TestId);
					await _uow.SaveChangesAsync();
				}
				else
				{
					// N?u ko publish, update tr?c ti?p
					targetTest = existing;
					targetTest.Title = dto.Title;
					targetTest.Description = dto.Description;
					targetTest.AudioUrl = dto.AudioUrl;
					targetTest.TestSkill = dto.TestSkill;
					targetTest.TotalQuestion = totalQuestion;
					targetTest.UpdatedAt = UtcNow;

					// X�a test question cu
					var oldQuestions = await _uow.TestQuestions.GetByTestIdAsync(targetTest.TestId);
					_uow.TestQuestions.RemoveRange(oldQuestions);
				}

				// ? Snapshot l?i c�u h?i m?i
				var jsonSettings = new JsonSerializerSettings
				{
					ReferenceLoopHandling = ReferenceLoopHandling.Ignore,
				};

				var testQuestions = new List<TestQuestion>();
				int order = 1;

				foreach (var part in dto.Parts)
				{
					// Question Groups
					if (part.Groups?.Any() == true)
					{
						foreach (var groupDto in part.Groups)
						{
							var groupSnapshot = await HandleQuestionGroupSnapshotAsync(groupDto, part.PartId, dto.TestSkill);
							string snapshot = JsonConvert.SerializeObject(groupSnapshot, jsonSettings);

							testQuestions.Add(new TestQuestion
							{
								Test = targetTest,
								PartId = part.PartId,
								OrderInTest = order++,
								IsQuestionGroup = true,
								SourceType = QuestionSourceType.Manual,
								SnapshotJson = snapshot,
								CreatedAt = UtcNow
							});
						}
					}

					// Single questions
					if (part.Questions?.Any() == true)
					{
						foreach (var qDto in part.Questions)
						{
							var questionSnapshot = await HandleSingleQuestionSnapshotAsync(qDto, part.PartId, dto.TestSkill);
							string snapshot = JsonConvert.SerializeObject(questionSnapshot, jsonSettings);

							testQuestions.Add(new TestQuestion
							{
								Test = targetTest,
								PartId = part.PartId,
								OrderInTest = order++,
								SourceType = QuestionSourceType.Manual,
								SnapshotJson = snapshot,
								CreatedAt = UtcNow
							});
						}
					}
				}

				await _uow.TestQuestions.AddRangeAsync(testQuestions);

				await _uow.SaveChangesAsync();

				return Result<string>.Success(
					existing.VisibilityStatus == TestVisibilityStatus.Published
						? $"T?o th�nh c�ng phi�n b?n m?i v{targetTest.Version} (TestId={targetTest.TestId})"
						: $"C?p nh?t tr?c ti?p th�nh c�ng TestId={targetTest.TestId}");
			}
			catch (Exception ex)
			{
				return Result<string>.Failure(ex.Message);
			}
		}

		// If test visibility status: published => clone new version
		// If test creation status: completed => update directly
		public async Task<Test> CloneTestAsync(int sourceTestId)
		{
			var source = await _uow.Tests.GetByIdAsync(sourceTestId);
			if (source == null)
				throw new Exception("Source test not found");

			var clone = new Test
			{
				Title = source.Title,
				Description = source.Description,
				AudioUrl = source.AudioUrl,
				Duration = source.Duration,
				TotalQuestion = source.TotalQuestion,
				TestSkill = source.TestSkill,
				TestType = source.TestType,
				CreationStatus = TestCreationStatus.Completed,
				VisibilityStatus = TestVisibilityStatus.Hidden,
				Version = source.Version + 1,
				ParentTestId = source.TestId,
				CreatedById = source.CreatedById,
				CreatedAt = UtcNow
			};

			// Clone snapshot c?a TestQuestion
			foreach (var tq in source.TestQuestions)
			{
				clone.TestQuestions.Add(new TestQuestion
				{
					PartId = tq.PartId,
					OrderInTest = tq.OrderInTest,
					SourceType = tq.SourceType,
					SnapshotJson = tq.SnapshotJson,
					CreatedAt = UtcNow
				});
			}

			await _uow.Tests.AddAsync(clone);
			await _uow.SaveChangesAsync();
			return clone;
		}
		/* UPDATE - End */

		// Get version
		public async Task<Result<List<TestVersionDto>>> GetVersionsByParentIdAsync(int parentTestId)
		{
			// L?y test g?c
			var parent = await _uow.Tests.GetTestByIdAsync(parentTestId);
			if (parent == null)
				return Result<List<TestVersionDto>>.Failure("Parent test not found");

			// L?y t?t c? version c� c�ng parent (bao g?m c? parent)
			var allVersions = await _uow.Tests.GetVersionsByParentIdAsync(parentTestId);
			var dtos = allVersions
				.OrderByDescending(t => t.Version)
				.Select(t => new TestVersionDto
				{
					TestId = t.TestId,
					Version = t.Version,
					Title = t.Title,
					CreationStatus = t.CreationStatus,
					VisibilityStatus = t.VisibilityStatus,
					CreatedAt = t.CreatedAt,
					UpdatedAt = t.UpdatedAt
				})
				.ToList();

			// Convert UTC → Vietnam time
			foreach (var dto in dtos)
			{
				dto.CreatedAt = ToVietnamTime(dto.CreatedAt);
				if (dto.UpdatedAt.HasValue)
					dto.UpdatedAt = ToVietnamTime(dto.UpdatedAt.Value);
			}

			return Result<List<TestVersionDto>>.Success(dtos);
		}
		#endregion

		#region Do Test - Examinee
		// Get test data for examinee
		public async Task<Result<TestStartResponseDto>> GetTestStartAsync(TestStartRequestDto request, Guid userId)
		{
			// Check test existed
			var test = await _uow.Tests.GetTestByIdAsync(request.Id);
			if (test == null || test.VisibilityStatus != TestVisibilityStatus.Published) return Result<TestStartResponseDto>.Failure(ErrorMessages.ExamNotFound);

			// Simulator: th?i gian c? d?nh
			// Practice: c� th? ch?n t�nh gi? ho?c kh�ng
			int duration = test.Duration;
			if (test.TestType == TestType.Practice)
			{
				duration = request.IsSelectTime ? test.Duration : 0;
			}

			var result = new TestStartResponseDto
			{
				TestId = test.TestId,
				Title = test.Title,
				TestType = test.TestType,
				TestSkill = test.TestSkill,
				AudioUrl = test.AudioUrl,
				Duration = duration,
				QuantityQuestion = test.TotalQuestion,
				CreatedAt = ToVietnamTime(test.CreatedAt),
				UpdatedAt = test.UpdatedAt.HasValue ? ToVietnamTime(test.UpdatedAt.Value) : null
			};

			// Reuse active test session if available to avoid duplicates
			var existingTestResult = await _uow.TestResults.GetActiveTestByUserAndTestAsync(userId, test.TestId);
			TestResult userTest;
			if (existingTestResult != null)
			{
				userTest = existingTestResult;

				// Ch? auto-submit n?u b�i thi c� t�nh gi? (IsSelectTime = true)
				if (userTest.IsSelectTime)
				{
					// Check if test time has expired + 5 minutes grace period -> auto-submit
					var elapsedTime = UtcNow - userTest.CreatedAt;
					var testDurationWithGrace = TimeSpan.FromMinutes(test.Duration + 5);

					if (elapsedTime > testDurationWithGrace && userTest.Status == TestResultStatus.InProgress)
					{
						// Auto-submit the test based on test skill
						if (test.TestSkill == TestSkill.LR)
						{
							// For LR tests, call SubmitLRTestAsync
							var submitRequest = new SubmitLRTestRequestDto
							{
								TestId = test.TestId,
								TestResultId = userTest.TestResultId,
								Duration = (int)elapsedTime.TotalMinutes,
								TestType = test.TestType,
								Answers = new List<UserLRAnswerDto>() // Empty - will get from DB
							};

							await SubmitLRTestAsync(userId, submitRequest);
						}
						else
						{
							// For Speaking/Writing/SW tests, build bulk request from saved answers and call AI grading
							await AutoSubmitSWTestAsync(userTest, test, (int)elapsedTime.TotalMinutes);
						}

						// After auto-submit, create a new test session for the user to start fresh
						userTest = new TestResult
						{
							UserId = userId,
							TestId = test.TestId,
							Status = TestResultStatus.InProgress,
							Duration = 0,
							TotalScore = 0,
							TestType = test.TestType,
							CreatedAt = UtcNow,
							IsSelectTime = request.IsSelectTime
						};

						await _uow.TestResults.AddAsync(userTest);
						await _uow.SaveChangesAsync();
					}
				}
			}
			else
			{
				userTest = new TestResult
				{
					UserId = userId,
					TestId = test.TestId,
					Status = TestResultStatus.InProgress,
					Duration = 0,
					TotalScore = 0,
					TestType = test.TestType,
					CreatedAt = UtcNow,
					IsSelectTime = request.IsSelectTime
				};

				await _uow.TestResults.AddAsync(userTest);
				await _uow.SaveChangesAsync();
			}

			result.TestResultId = userTest.TestResultId;

			// Load saved answers if user is resuming
			var savedAnswers = await _uow.UserAnswers.GetByTestResultIdAsync(userTest.TestResultId);
			var savedAnswersList = savedAnswers?.ToList() ?? new List<UserAnswer>();
			var savedAnswersDict = savedAnswersList.ToDictionary(
				ua => (ua.TestQuestionId, ua.SubQuestionIndex),
				ua => ua
			);

			// N?u test chua c� c�u h?i
			if (test.TestQuestions == null || !test.TestQuestions.Any())
				return Result<TestStartResponseDto>.Success(result);

			// L?y c�c Parts, m?i Parts g?m c�c c�u h?i
			var groupedByPart = test.TestQuestions
				.Where(q => q.PartId != null)
				.GroupBy(q => q.PartId)
				.ToList();

			foreach (var group in groupedByPart)
			{
				var first = group.First();
				var partDto = new TestPartDto
				{
					PartId = first.PartId!,
					PartName = first.Part?.Name ?? $"Part {first.PartId}",
					Description = first.Part?.Description,
				};

				foreach (var tq in group.OrderBy(q => q.OrderInTest))
				{
					if (tq.IsQuestionGroup)
					{
						var groupSnap = JsonConvert.DeserializeObject<QuestionGroupSnapshotDto>(tq.SnapshotJson);
						if (groupSnap != null)
						{
							var testQuestion = new TestQuestionViewDto
							{
								TestQuestionId = tq.TestQuestionId!,
								IsGroup = true,
								QuestionGroupSnapshotDto = groupSnap
							};
							partDto.TestQuestions.Add(testQuestion);
						}
					}
					else
					{
						var questionSnap = JsonConvert.DeserializeObject<QuestionSnapshotDto>(tq.SnapshotJson);
						if (questionSnap != null)
						{
							var testQuestion = new TestQuestionViewDto
							{
								TestQuestionId = tq.TestQuestionId!,
								IsGroup = false,
								QuestionSnapshotDto = questionSnap
							};
							partDto.TestQuestions.Add(testQuestion);
						}
					}
				}

				result.Parts.Add(partDto);
			}

			// Map saved answers to response
			result.SavedAnswers = savedAnswersList.Select(ua => new SavedAnswerDto
			{
				TestQuestionId = ua.TestQuestionId,
				ChosenOptionLabel = ua.ChosenOptionLabel,
				AnswerText = ua.AnswerText,
				AnswerAudioUrl = ua.AnswerAudioUrl,
				SubQuestionIndex = ua.SubQuestionIndex,
				CreatedAt = ToVietnamTime(ua.CreatedAt),
				UpdatedAt = ua.UpdatedAt.HasValue ? ToVietnamTime(ua.UpdatedAt.Value) : null
			}).ToList();

			return Result<TestStartResponseDto>.Success(result);
		}
		// Submit listening & reading test
		public async Task<Result<GeneralLRResultDto>> SubmitLRTestAsync(Guid userId, SubmitLRTestRequestDto request)
		{
			if (!request.TestResultId.HasValue)
				return Result<GeneralLRResultDto>.Failure("Test session must be provided.");

			TestResult? testResult = await _uow.TestResults.GetByIdAsync(request.TestResultId.Value);

			if (testResult == null)
				return Result<GeneralLRResultDto>.Failure("Test session not found.");
			if (testResult.UserId != userId || testResult.TestId != request.TestId)
				return Result<GeneralLRResultDto>.Failure("Test session does not match the submitted data.");
			if (testResult.Status == TestResultStatus.Graded)
				return Result<GeneralLRResultDto>.Failure("This test session has already been submitted.");

			// N?u Answers r?ng (auto-submit), l?y t? DB (saved answers t? save-progress)
			if (request.Answers == null || !request.Answers.Any())
			{
				var savedAnswers = await _uow.UserAnswers.GetByTestResultIdAsync(request.TestResultId.Value);
				if (savedAnswers != null && savedAnswers.Any())
				{
					// Group by (TestQuestionId, SubQuestionIndex) v� l?y answer m?i nh?t d? tr�nh duplicate
					request.Answers = savedAnswers
						.GroupBy(sa => new { sa.TestQuestionId, sa.SubQuestionIndex })
						.Select(g => g.OrderByDescending(x => x.UpdatedAt ?? x.CreatedAt).First())
						.Select(sa => new UserLRAnswerDto
						{
							TestQuestionId = sa.TestQuestionId,
							SubQuestionIndex = sa.SubQuestionIndex,
							ChosenOptionLabel = sa.ChosenOptionLabel
						}).ToList();
				}
				else
				{
					// Kh�ng c� answers n�o du?c luu, t?o list r?ng d? x? l� nhu b? tr?ng t?t c?
					request.Answers = new List<UserLRAnswerDto>();
				}
			}

			// T?ng s? c�u h?i
			var totalQuestion = await _uow.Tests.GetTotalQuestionAsync(request.TestId);

			// Test question c?a b�i test
			var testQuestions = await _uow.TestQuestions.GetByTestIdAsync(request.TestId);

			if (!testQuestions.Any())
				return Result<GeneralLRResultDto>.Failure(ErrorMessages.InvalidTestOrQuestions);

			bool isSimulator = request.TestType == TestType.Simulator;

			testResult.Duration = request.Duration;
			testResult.TestType = request.TestType;
			testResult.Status = TestResultStatus.Graded;
			testResult.UpdatedAt = UtcNow;

			// L?y map Part -> Skill
			var partIds = testQuestions.Select(q => q.PartId).Distinct().ToList();
			var partSkillMap = await _uow.Parts.GetSkillMapByIdsAsync(partIds);

			// 1?.X? l� & ch?m b�i
			var (userAnswers, stats) = ProcessUserAnswers(request, testQuestions, partSkillMap, isSimulator, testResult);

			// 2.T�nh k?t qu? cu?i c�ng
			var result = isSimulator
				? CalculateSimulatorResult(stats, request.Duration)
				: CalculatePracticeResult(stats, request.Duration);

			// 3. Set th�ng tin cho test result
			testResult.SkillScores = BuildSkillScores(result, isSimulator);
			testResult.TotalQuestions = totalQuestion;
			testResult.CorrectCount = result.CorrectCount;
			testResult.IncorrectCount = result.IncorrectCount;
			testResult.SkipCount = result.SkipCount;
			testResult.TotalScore = (decimal)(isSimulator ? result.TotalScore : 0);

			// 4.Luu v�o DB
			await _uow.UserAnswers.AddRangeAsync(userAnswers);
			await _uow.SaveChangesAsync();

			var resultDetail = await _uow.TestResults.GetTestResultLRAsync(testResult.TestResultId);

			return Result<GeneralLRResultDto>.Success(resultDetail);
		}
		public async Task<Result<List<TestHistoryDto>>> GetTestHistoryAsync(Guid userId)
		{
			var result = await _uow.Tests.GetTestHistoryAsync(userId);
			// Convert UTC → Vietnam time cho tất cả items
			foreach (var item in result)
			{
				item.CreatedAt = ToVietnamTime(item.CreatedAt);
			}
			return Result<List<TestHistoryDto>>.Success(result);
		}
		public async Task<Result<TestResultDetailDto>> GetListeningReadingResultDetailAsync(int testResultId, Guid userId)
		{
			var testResult = await _uow.TestResults.GetListeningReadingResultDetailAsync(testResultId, userId);

			if (testResult == null || testResult.UserId != userId)
				return Result<TestResultDetailDto>.Failure("Test result not found or unauthorized.");

			var test = testResult.Test;

			// Get Listening and Reading scores from SkillScores
			var listeningScore = testResult.SkillScores?.FirstOrDefault(s => s.Skill == "Listening");
			var readingScore = testResult.SkillScores?.FirstOrDefault(s => s.Skill == "Reading");

			var dto = new TestResultDetailDto
			{
				TestResultId = testResult.TestResultId,
				TestId = test.TestId,
				Title = test.Title,
				TestSkill = test.TestSkill,
				TestType = test.TestType,
				IsSelectTime = testResult.IsSelectTime,
				Status = testResult.Status,
				AudioUrl = test.AudioUrl,
				Duration = test.Duration,
				TimeResult = testResult.Duration,
				QuantityQuestion = test.TotalQuestion,
				CorrectCount = testResult.CorrectCount,
				ListeningScore = listeningScore != null ? (int?)listeningScore.Score : null,
				ReadingScore = readingScore != null ? (int?)readingScore.Score : null,
				TotalScore = (int)testResult.TotalScore
			};

			// Gom theo Part
			var groupedByPart = test.TestQuestions
				.Where(q => q.PartId != null)
				.GroupBy(q => q.PartId)
				.ToList();

			foreach (var group in groupedByPart)
			{
				var first = group.First();
				var partDto = new TestPartDto
				{
					PartId = first.PartId,
					PartName = first.Part?.Name ?? $"Part {first.PartId}"
				};

				foreach (var tq in group.OrderBy(q => q.OrderInTest))
				{
					// Get the snapshot JSON to use (version-aware)
					string snapshotJsonToUse = tq.SnapshotJson; // Default: current/latest version

					// If SnapshotVersions exists, try to get the version from user's answer
					if (!string.IsNullOrEmpty(tq.SnapshotVersions))
					{
						// Find user answer for this question to get the version they saw
						var anyUserAnswer = testResult.UserAnswers.FirstOrDefault(x => x.TestQuestionId == tq.TestQuestionId);
						if (anyUserAnswer != null)
						{
							try
							{
								var versionHistory = System.Text.Json.JsonSerializer.Deserialize<QuestionVersionHistory>(tq.SnapshotVersions);
								if (versionHistory != null)
								{
									// Get snapshot from the version user answered
									var versionSnapshot = versionHistory.GetSnapshot(anyUserAnswer.QuestionVersion);
									if (versionSnapshot != null)
									{
										// Use the versioned snapshot
										snapshotJsonToUse = System.Text.Json.JsonSerializer.Serialize(versionSnapshot);
									}
								}
							}
							catch
							{
								// If version lookup fails, fall back to SnapshotJson
							}
						}
					}

					// V?i question group
					if (tq.IsQuestionGroup)
					{
						var groupSnap = JsonConvert.DeserializeObject<QuestionGroupSnapshotDto>(snapshotJsonToUse ?? "{}");
						if (groupSnap == null) continue;

						for (int i = 0; i < groupSnap.QuestionSnapshots.Count; i++)
						{
							var subQuestion = groupSnap.QuestionSnapshots[i];

							// ?? match theo TestQuestionId + SubQuestionIndex
							var subAnswer = testResult.UserAnswers.FirstOrDefault(x =>
								x.TestQuestionId == tq.TestQuestionId &&
								x.SubQuestionIndex == i);

							subQuestion.UserAnswer = subAnswer?.ChosenOptionLabel;
							subQuestion.IsCorrect = subAnswer?.IsCorrect;
						}

						partDto.TestQuestions.Add(new TestQuestionViewDto
						{
							TestQuestionId = tq.TestQuestionId,
							IsGroup = true,
							QuestionGroupSnapshotDto = groupSnap
						});
					}
					else
					{
						// ?? C�u h?i don
						var questionSnap = JsonConvert.DeserializeObject<QuestionSnapshotDto>(snapshotJsonToUse ?? "{}");
						if (questionSnap == null) continue;

						var userAnswer = testResult.UserAnswers.FirstOrDefault(x => x.TestQuestionId == tq.TestQuestionId);

						questionSnap.UserAnswer = userAnswer?.ChosenOptionLabel;
						questionSnap.IsCorrect = userAnswer?.IsCorrect;

						partDto.TestQuestions.Add(new TestQuestionViewDto
						{
							TestQuestionId = tq.TestQuestionId,
							IsGroup = false,
							QuestionSnapshotDto = questionSnap
						});
					}
				}
				dto.Parts.Add(partDto);
			}

			return Result<TestResultDetailDto>.Success(dto);
		}

		public async Task<Result<object>> GetUnifiedTestResultDetailAsync(int testResultId, Guid userId)
		{
			// 1. L?y TestResult v?i Test v� SkillScores
			var testResult = await _uow.TestResults.GetTestResultWithDetailsAsync(testResultId);

			if (testResult == null)
				return Result<object>.Failure("Test result not found.");

			if (testResult.UserId != userId)
				return Result<object>.Failure(ErrorMessages.UnauthorizedAccess);

			var testSkill = testResult.Test.TestSkill;

			// 2. N?u l� L&R ? tr? v? TestResultDetailDto
			if (testSkill == TestSkill.LR)
			{
				var lrResult = await GetListeningReadingResultDetailAsync(testResultId, userId);
				if (!lrResult.IsSuccess)
					return Result<object>.Failure(lrResult.ErrorMessage);

				return Result<object>.Success(lrResult.Data);
			}

			// 3. N?u l� S/W/SW ? tr? v? TestResultDetailSWDto
			var aiFeedbacks = await _uow.AIFeedbacks.GetByTestResultIdAsync(testResultId);

			// X�c d?nh lo?i test: Simulator hay Practice
			bool isSimulator = testResult.Test?.TestType == TestType.Simulator;
			int totalQuestions = testResult.Test?.TotalQuestion ?? 0;

			// L?y di?m t? SkillScores
			var writingSkillScore = testResult.SkillScores.FirstOrDefault(s => s.Skill == "Writing");
			var speakingSkillScore = testResult.SkillScores.FirstOrDefault(s => s.Skill == "Speaking");

			// T�nh raw scores t? AI feedbacks (d�ng Part.Skill d? ph�n bi?t Writing/Speaking)
			var writingFeedbacks = aiFeedbacks.Where(f =>
				f.UserAnswer?.TestQuestion?.Part?.Skill == QuestionSkill.Writing).ToList();
			var speakingFeedbacks = aiFeedbacks.Where(f =>
				f.UserAnswer?.TestQuestion?.Part?.Skill == QuestionSkill.Speaking).ToList();

			double? writingRawScore = writingFeedbacks.Any()
				? writingFeedbacks.Average(f => (double)f.Score)
				: null;
			double? speakingRawScore = speakingFeedbacks.Any()
				? speakingFeedbacks.Average(f => (double)f.Score)
				: null;

			// �?m s? c�u d� tr? l?i v� b? qua
			int answeredQuestions = aiFeedbacks.Count;
			int skippedQuestions = totalQuestions - answeredQuestions;

			// L?y t?t c? TestQuestionId t? feedbacks
			var testQuestionIds = aiFeedbacks
				.Select(f => f.UserAnswer?.TestQuestionId ?? 0)
				.Where(id => id > 0)
				.Distinct()
				.ToList();

			// L?y TestQuestions v?i Part
			var testQuestions = await _uow.TestQuestions.GetByIdsWithPartAsync(testQuestionIds);

			// Map sang TestResultDetailSWDto
			var response = new Domains.DTOs.Responses.Test.TestResultDetailSWDto
			{
				// Test basic info
				TestResultId = testResult.TestResultId,
				TestId = testResult.TestId,
				Title = testResult.Test?.Title ?? string.Empty,
				TestType = testResult.Test?.TestType ?? TestType.Practice,
				TestSkill = testResult.Test?.TestSkill ?? TestSkill.LR,
				Duration = testResult.Test?.Duration ?? 0,
				TimeResuilt = testResult.Duration,
				QuantityQuestion = totalQuestions,

				// Mode indicator
				IsSimulator = isSimulator,

				// TOEIC Scaled scores (0-200) - Ch? c� gi� tr? khi Simulator
				WritingScore = isSimulator && writingSkillScore != null ? (double?)writingSkillScore.Score : null,
				SpeakingScore = isSimulator && speakingSkillScore != null ? (double?)speakingSkillScore.Score : null,

				// TotalScore: Simulator = 0-400, Practice = 0-100
				TotalScore = (double)testResult.TotalScore,

				// Raw scores (0-100) - Lu�n c� gi� tr? n?u c� feedback
				WritingRawScore = writingRawScore,
				SpeakingRawScore = speakingRawScore,

				// Question counts
				TotalQuestions = totalQuestions,
				AnsweredQuestions = answeredQuestions,
				SkippedQuestions = skippedQuestions,

				IsSelectTime = testResult.IsSelectTime,
				Status = testResult.Status,
				PerPartFeedbacks = aiFeedbacks.Select(f =>
				{
					var testQuestionId = f.UserAnswer?.TestQuestionId ?? 0;
					var testQuestion = testQuestions.FirstOrDefault(tq => tq.TestQuestionId == testQuestionId);

					// Deserialize QuestionContent
					object? questionContent = null;
					if (testQuestion != null && !string.IsNullOrEmpty(testQuestion.SnapshotJson))
					{
						try
						{
							if (testQuestion.IsQuestionGroup)
							{
								questionContent = System.Text.Json.JsonSerializer.Deserialize<Domains.DTOs.Responses.QuestionGroup.QuestionGroupSnapshotDto>(testQuestion.SnapshotJson);
							}
							else
							{
								questionContent = System.Text.Json.JsonSerializer.Deserialize<Domains.DTOs.Responses.Question.QuestionSnapshotDto>(testQuestion.SnapshotJson);
							}
						}
						catch
						{
							// If deserialization fails, keep questionContent as null
						}
					}

					return new Domains.DTOs.Responses.AI.PerPartAssessmentFeedbackDto
					{
						TestQuestionId = testQuestionId,
						FeedbackId = f.FeedbackId,
						UserAnswerId = f.UserAnswerId,
						// User's original answer
						AnswerText = f.UserAnswer?.AnswerText,
						AnswerAudioUrl = f.UserAnswer?.AnswerAudioUrl,
						Score = (double)f.Score,  // Raw score 0-100 cho t?ng c�u
						Content = f.Content ?? string.Empty,
						AIScorer = f.AIScorer ?? string.Empty,
						DetailedScores = string.IsNullOrEmpty(f.DetailedScoresJson)
							? new Dictionary<string, object>()
							: System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(f.DetailedScoresJson) ?? new Dictionary<string, object>(),
						DetailedAnalysis = string.IsNullOrEmpty(f.DetailedAnalysisJson)
							? new Dictionary<string, object>()
							: System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(f.DetailedAnalysisJson) ?? new Dictionary<string, object>(),
						Recommendations = string.IsNullOrEmpty(f.RecommendationsJson)
							? new List<string>()
							: System.Text.Json.JsonSerializer.Deserialize<List<string>>(f.RecommendationsJson) ?? new List<string>(),
						Transcription = f.Transcription ?? string.Empty,
						CorrectedText = f.CorrectedText ?? string.Empty,
						AudioDuration = f.AudioDuration,
						CreatedAt = ToVietnamTime(f.CreatedAt),
						// Question content
						PartId = testQuestion?.PartId ?? 0,
						PartName = testQuestion?.Part?.Name,
						QuestionContent = questionContent
					};
				}).ToList()
			};

			return Result<object>.Success(response);
		}

		public async Task<Result<List<TestListResponseDto>>> GetTestsByTypeAsync(TestType testType, Guid? userId = null)
		{
			var result = await _uow.Tests.GetTestByType(testType, userId);
			if (result == null || !result.Any())
			{
				return Result<List<TestListResponseDto>>.Failure("Not found");
			}
			// Convert UTC → Vietnam time cho tất cả items
			foreach (var item in result)
			{
				if (item.CreatedAt.HasValue)
					item.CreatedAt = ToVietnamTime(item.CreatedAt.Value);
				if (item.ResultProgress != null && item.ResultProgress.CreatedAt != default)
					item.ResultProgress.CreatedAt = ToVietnamTime(item.ResultProgress.CreatedAt);
			}
			return Result<List<TestListResponseDto>>.Success(result);
		}
		public async Task<Result<StatisticResultDto>> GetDashboardStatisticAsync(Guid examineeId, TestSkill skill, string range)
		{
			var dateFrom = GetDateRangeStart(range);
			var results = await _uow.TestResults.GetResultsWithinRangeAsync(examineeId, dateFrom);

			if (results == null || !results.Any())
				return Result<StatisticResultDto>.Failure("No test results found.");

			// L?c k?t qu? theo k? nang
			IEnumerable<TestResult> filtered = skill switch
			{
				TestSkill.Speaking => results.Where(r => r.Test.TestSkill == TestSkill.Speaking),
				TestSkill.Writing => results.Where(r => r.Test.TestSkill == TestSkill.Writing),
				_ => results.Where(r => r.Test.TestSkill == TestSkill.LR)
			};

			if (!filtered.Any())
				return Result<StatisticResultDto>.Failure($"No test results found for skill: {skill}");

			// H�m chia an to�n (tr�nh NaN / Infinity)
			static double SafeDivide(double numerator, double denominator)
				=> denominator == 0 ? 0 : numerator / denominator;

			var dto = new StatisticResultDto
			{
				Skill = skill,
				Range = range,
				TotalTests = filtered.Count(),
				AverageScore = (int)Math.Round(filtered.Average(r => r.TotalScore), 2),
				HighestScore = (int)filtered.Max(r => r.TotalScore),
				AverageAccuracy = Math.Round(filtered.Average(r => SafeDivide(r.CorrectCount, r.TotalQuestions) * 100), 2),
				AverageDurationMinutes = Math.Round(filtered.Average(r => SafeDivide(r.Duration, 60.0)), 2)
			};

			// N?u l� ListeningReading th� chia nh? ph?n b�n trong
			if (skill == TestSkill.LR)
			{
				var listeningScores = filtered
					.SelectMany(r => r.SkillScores)
					.Where(s => s.Skill == "Listening")
					.ToList();

				var readingScores = filtered
					.SelectMany(r => r.SkillScores)
					.Where(s => s.Skill == "Reading")
					.ToList();

				dto.Listening = new SkillBreakdownDto
				{
					AverageScore = listeningScores.Any() ? (int)Math.Round(listeningScores.Average(s => s.Score), 2) : 0,
					HighestScore = listeningScores.Any() ? (int)listeningScores.Max(s => s.Score) : 0,
					Accuracy = listeningScores.Any()
						? Math.Round(listeningScores.Average(s => SafeDivide(s.CorrectCount ?? 0, s.TotalQuestions ?? 0) * 100), 2)
						: 0
				};

				dto.Reading = new SkillBreakdownDto
				{
					AverageScore = readingScores.Any() ? (int)Math.Round(readingScores.Average(s => s.Score), 2) : 0,
					HighestScore = readingScores.Any() ? (int)readingScores.Max(s => s.Score) : 0,
					Accuracy = readingScores.Any()
						? Math.Round(readingScores.Average(s => SafeDivide(s.CorrectCount ?? 0, s.TotalQuestions ?? 0) * 100), 2)
						: 0
				};
			}

			return Result<StatisticResultDto>.Success(dto);
		}
		#endregion

		#region Private Helper Methods
		// Get duration for test (by test skill)
		private int GetExpectedQuestionCount(TestSkill skill)
		{
			return skill switch
			{
				TestSkill.LR => 200,
				TestSkill.Speaking => 11,
				TestSkill.Writing => 8,
				TestSkill.SW => 19, // Speaking (11) + Writing (8) = 19
				_ => throw new ArgumentOutOfRangeException(nameof(skill), $"Unsupported TestSkill: {skill}")
			};
		}
		private int GetTestDuration(TestSkill skill)
		{
			return skill switch
			{
				TestSkill.LR => NumberConstants.LRDuration,
				TestSkill.Speaking => NumberConstants.SpeakingDuration,
				TestSkill.Writing => NumberConstants.WritingDuration,
				TestSkill.SW => NumberConstants.SWDuration,
				_ => throw new Exception("Invalid test skill")
			};
		}
		private int GetQuantityQuestion(CreateTestManualDto dto)
		{
			int quantity = 0;

			foreach (var part in dto.Parts)
			{
				// �?m c�u h?i tr?c ti?p trong part
				if (part.Questions != null)
					quantity += part.Questions.Count;

				// �?m c�u h?i trong t?ng group c?a part
				if (part.Groups != null)
				{
					foreach (var group in part.Groups)
					{
						if (group.Questions != null)
							quantity += group.Questions.Count;
					}
				}
			}

			return quantity;
		}
		private int GetQuantityQuestion(UpdateManualTestDto dto)
		{
			int quantity = 0;

			foreach (var part in dto.Parts)
			{
				// �?m c�u h?i tr?c ti?p trong part
				if (part.Questions != null)
					quantity += part.Questions.Count;

				// �?m c�u h?i trong t?ng group c?a part
				if (part.Groups != null)
				{
					foreach (var group in part.Groups)
					{
						if (group.Questions != null)
							quantity += group.Questions.Count;
					}
				}
			}

			return quantity;
		}
		// Support function for SubmitLR TestAsync
		private (List<UserAnswer> UserAnswers, TestStats Stats) ProcessUserAnswers(SubmitLRTestRequestDto request, List<TestQuestion> testQuestions, Dictionary<int, QuestionSkill> partSkillMap, bool isSimulator, TestResult testResult)
		{
			int listeningCorrect = 0, readingCorrect = 0;
			int listeningTotal = 0, readingTotal = 0;
			int skipCount = 0, totalQuestions = 0;

			var userAnswers = new List<UserAnswer>();

			// T?o map d? tra nhanh c�u tr? l?i ngu?i d�ng (O(1))
			// X? l� duplicate: n?u c� nhi?u answer c�ng (TestQuestionId, SubQuestionIndex), l?y c�i d?u ti�n
			var answerMap = request.Answers
				.GroupBy(a => a.TestQuestionId)
				.ToDictionary(
					g => g.Key,
					g => g.GroupBy(a => a.SubQuestionIndex ?? 0)
						  .ToDictionary(sg => sg.Key, sg => sg.First())
				);

			foreach (var tq in testQuestions)
			{
				// X�c d?nh k? nang
				if (!partSkillMap.TryGetValue(tq.PartId, out var skill))
					continue;

				bool isListening = skill == QuestionSkill.Listening;

				try
				{
					if (!tq.IsQuestionGroup)
					{
						totalQuestions++;
						if (isListening) listeningTotal++; else readingTotal++;

						var snapshot = JsonConvert.DeserializeObject<QuestionSnapshotDto>(tq.SnapshotJson);
						if (snapshot == null || snapshot.Options == null) continue;

						// T�m c�u tr? l?i
						if (!answerMap.TryGetValue(tq.TestQuestionId, out var subMap)
							|| !subMap.TryGetValue(0, out var userAnswerDto))
						{
							skipCount++;
							continue;
						}

						bool isCorrect = CheckIsCorrect(snapshot.Options, userAnswerDto.ChosenOptionLabel);

						if (isCorrect)
						{
							if (isListening) listeningCorrect++; else readingCorrect++;
						}

						userAnswers.Add(CreateUserAnswer(
							testResult,
							tq.TestQuestionId,
							null,
							userAnswerDto.ChosenOptionLabel,
							isCorrect
						));
					}
					else
					{
						// GROUP QUESTION
						var groupSnapshot = JsonConvert.DeserializeObject<QuestionGroupSnapshotDto>(tq.SnapshotJson);
						if (groupSnapshot == null || groupSnapshot.QuestionSnapshots == null)
							continue;

						for (int i = 0; i < groupSnapshot.QuestionSnapshots.Count; i++)
						{
							var qSnap = groupSnapshot.QuestionSnapshots[i];
							totalQuestions++;
							if (isListening) listeningTotal++; else readingTotal++;

							// T�m c�u tr? l?i user
							if (!answerMap.TryGetValue(tq.TestQuestionId, out var subMap)
								|| !subMap.TryGetValue(i, out var userAnswerDto))
							{
								skipCount++;
								continue;
							}

							bool isCorrect = CheckIsCorrect(qSnap.Options, userAnswerDto.ChosenOptionLabel);

							if (isCorrect)
							{
								if (isListening) listeningCorrect++; else readingCorrect++;
							}

							userAnswers.Add(CreateUserAnswer(
								testResult,
								tq.TestQuestionId,
								i,
								userAnswerDto.ChosenOptionLabel,
								isCorrect
							));
						}
					}
				}
				catch (Exception ex)
				{
					// debug khi snapshot b? l?i JSON
					Console.WriteLine($"Error processing TestQuestionId={tq.TestQuestionId}: {ex.Message}");
				}
			}

			// T?ng k?t th?ng k�
			var stats = new TestStats
			{
				TotalQuestions = totalQuestions,
				SkipCount = skipCount,
				ListeningCorrect = listeningCorrect,
				ReadingCorrect = readingCorrect,
				ListeningTotal = listeningTotal,
				ReadingTotal = readingTotal
			};

			return (userAnswers, stats);
		}
		private bool CheckIsCorrect(List<OptionSnapshotDto>? options, string? chosenLabel)
		{
			if (options == null || string.IsNullOrEmpty(chosenLabel))
				return false;

			var chosen = options.FirstOrDefault(o =>
				o.Label.Equals(chosenLabel, StringComparison.OrdinalIgnoreCase));

			return chosen?.IsCorrect ?? false;
		}
		private UserAnswer CreateUserAnswer(TestResult testResult, int testQuestionId, int? subIndex, string chosenLabel, bool? isCorrect)
		{
			return new UserAnswer
			{
				TestResult = testResult,
				TestQuestionId = testQuestionId,
				SubQuestionIndex = subIndex,
				ChosenOptionLabel = chosenLabel,
				IsCorrect = isCorrect,
				CreatedAt = UtcNow
			};
		}
		private GeneralLRResultDto CalculateSimulatorResult(TestStats stats, int duration)
		{
			int listeningScore = ToeicScoreTable.GetListeningScore(stats.ListeningCorrect);
			int readingScore = ToeicScoreTable.GetReadingScore(stats.ReadingCorrect);

			return new GeneralLRResultDto
			{
				Duration = duration,
				TotalQuestions = stats.TotalQuestions,
				SkipCount = stats.SkipCount,

				ListeningCorrect = stats.ListeningCorrect,
				ListeningTotal = stats.ListeningTotal,
				ListeningScore = listeningScore,

				ReadingCorrect = stats.ReadingCorrect,
				ReadingTotal = stats.ReadingTotal,
				ReadingScore = readingScore,

				TotalScore = listeningScore + readingScore,
				CorrectCount = stats.ListeningCorrect + stats.ReadingCorrect,
				IncorrectCount = stats.TotalQuestions - (stats.ListeningCorrect + stats.ReadingCorrect) - stats.SkipCount
			};
		}
		private GeneralLRResultDto CalculatePracticeResult(TestStats stats, int duration)
		{
			int totalCorrect = stats.ListeningCorrect + stats.ReadingCorrect;

			return new GeneralLRResultDto
			{
				Duration = duration,
				TotalQuestions = stats.TotalQuestions,
				SkipCount = stats.SkipCount,
				CorrectCount = totalCorrect,
				IncorrectCount = stats.TotalQuestions - totalCorrect - stats.SkipCount,
				TotalScore = null
			};
		}
		private async Task<QuestionGroupSnapshotDto> HandleQuestionGroupSnapshotAsync(QuestionGroupDto dto, int partId, TestSkill skill)
		{
			// Mapping th? c�ng, tr�nh ph? thu?c EF entity d? snapshot chu?n nh?t
			// S? d?ng index (1, 2, 3...) l�m QuestionId cho c�c c�u trong group (Test Simulator)
			// Index n�y d�ng l�m subQuestionId khi Examinee report c�u h?i trong group
			return new QuestionGroupSnapshotDto
			{
				QuestionGroupId = 0,
				PartId = partId,
				Passage = dto.Passage ?? string.Empty,
				ImageUrl = dto.ImageUrl,
				QuestionSnapshots = dto.Questions?.Select((q, index) => new QuestionSnapshotDto
				{
					QuestionId = index + 1, // Index b?t d?u t? 1 (1, 2, 3...)
					PartId = partId,
					Content = q.Content ?? string.Empty,
					ImageUrl = q.ImageUrl,
					Explanation = q.Explanation ?? string.Empty,
					Options = q.Options?.Select(o => new OptionSnapshotDto
					{
						Label = o.Label ?? string.Empty,
						Content = o.Content ?? string.Empty,
						IsCorrect = o.IsCorrect
					}).ToList() ?? new List<OptionSnapshotDto>()
				}).ToList() ?? new List<QuestionSnapshotDto>()
			};
		}
		private async Task<QuestionSnapshotDto> HandleSingleQuestionSnapshotAsync(QuestionDto dto, int partId, TestSkill skill)
		{
			// C�u h?i don kh�ng c?n subQuestionId khi report, nhung d?t = 1 d? consistency
			return new QuestionSnapshotDto
			{
				QuestionId = 1, // C�u h?i don lu�n = 1 (kh�ng d�ng trong report v� subQuestionId = null)
				PartId = partId,
				Content = dto.Content ?? string.Empty,
				ImageUrl = dto.ImageUrl,
				Explanation = dto.Explanation ?? string.Empty,
				Options = dto.Options?.Select(o => new OptionSnapshotDto
				{
					Label = o.Label ?? string.Empty,
					Content = o.Content ?? string.Empty,
					IsCorrect = o.IsCorrect
				}).ToList() ?? new List<OptionSnapshotDto>()
			};
		}
		private List<UserTestSkillScore> BuildSkillScores(GeneralLRResultDto result, bool isSimulator)
		{
			return new List<UserTestSkillScore>
			{
				new UserTestSkillScore
				{
					Skill = "Listening",
					CorrectCount = result.ListeningCorrect ?? 0,
					TotalQuestions = result.ListeningTotal ?? 0,
					Score = isSimulator ? result.ListeningScore ?? 0 : 0
				},
				new UserTestSkillScore
				{
					Skill = "Reading",
					CorrectCount = result.ReadingCorrect ?? 0,
					TotalQuestions = result.ReadingTotal ?? 0,
					Score = isSimulator ? result.ReadingScore ?? 0 : 0
				}
			};
		}
		private DateTime? GetDateRangeStart(string range)
		{
			return range.ToLower() switch
			{
				"1y" => UtcNow.AddYears(-1),
				"6m" => UtcNow.AddMonths(-6),
				"3m" => UtcNow.AddMonths(-3),
				"1m" => UtcNow.AddMonths(-1),
				"7d" => UtcNow.AddDays(-7),
				"3d" => UtcNow.AddDays(-3),
				_ => null // all
			};
		}
		#endregion

		#region Validation Helpers
		/// <summary>
		/// Validate if PartId is compatible with TestSkill
		/// </summary>
		private async Task<(bool isValid, string errorMessage)> ValidatePartForTestSkillAsync(int partId, TestSkill testSkill)
		{
			var part = await _uow.Parts.GetByIdAsync(partId);
			if (part == null)
				return (false, $"Part {partId} not found");

			// Mapping validation:
			// TestSkill.Speaking (1) ? QuestionSkill.Speaking (1) ? Parts 11-15
			// TestSkill.Writing (2) ? QuestionSkill.Writing (2) ? Parts 8-10
			// TestSkill.LR (3) ? QuestionSkill.Listening (3) or Reading (4) ? Parts 1-7

			switch (testSkill)
			{
				case TestSkill.Speaking:
					if (part.Skill != QuestionSkill.Speaking)
						return (false, $"Part {partId} ({part.Name}) is not a Speaking part. TestSkill is Speaking but Part skill is {part.Skill}");
					break;

				case TestSkill.Writing:
					if (part.Skill != QuestionSkill.Writing)
						return (false, $"Part {partId} ({part.Name}) is not a Writing part. TestSkill is Writing but Part skill is {part.Skill}");
					break;

				case TestSkill.LR:
					if (part.Skill != QuestionSkill.Listening && part.Skill != QuestionSkill.Reading)
						return (false, $"Part {partId} ({part.Name}) is not a Listening or Reading part. TestSkill is LR but Part skill is {part.Skill}");
					break;
				case TestSkill.SW:
					if (part.Skill != QuestionSkill.Speaking && part.Skill != QuestionSkill.Writing)
						return (false, $"Part {partId} ({part.Name}) is not a Speaking or Reading part. TestSkill is LR but Part skill is {part.Skill}");
					break;
				default:
					return (false, $"Invalid TestSkill: {testSkill}");
			}

			return (true, string.Empty);
		}

		public async Task<Result<string>> SaveProgressAsync(Guid userId, SaveProgressRequestDto request)
		{
			try
			{
				// Validate TestResult ownership and status
				var testResult = await _uow.TestResults.GetByIdAsync(request.TestResultId);
				if (testResult == null)
					return Result<string>.Failure($"TestResult {request.TestResultId} not found");

				if (testResult.UserId != userId)
					return Result<string>.Failure("You don't have permission to save this test result");

				if (testResult.Status == TestResultStatus.Graded)
					return Result<string>.Failure("This test has already been submitted/graded. Cannot save progress.");

				// Process each answer
				foreach (var answerDto in request.Answers)
				{
					// Check if answer already exists for this question
					var existingAnswer = await _uow.UserAnswers.GetByTestResultAndQuestionAsync(
						request.TestResultId,
						answerDto.TestQuestionId,
						answerDto.SubQuestionIndex);

					if (existingAnswer != null)
					{
						// Update existing answer
						existingAnswer.ChosenOptionLabel = answerDto.ChosenOptionLabel;
						existingAnswer.AnswerText = answerDto.AnswerText;
						existingAnswer.AnswerAudioUrl = answerDto.AnswerAudioUrl;
						existingAnswer.SubQuestionIndex = answerDto.SubQuestionIndex;
						existingAnswer.UpdatedAt = UtcNow;
						// Keep QuestionVersion unchanged (it was set when first created)

						await _uow.UserAnswers.UpdateAsync(existingAnswer);
					}
					else
					{
						// Get current version from TestQuestion for new answer
						var testQuestion = await _uow.TestQuestions.GetByIdAsync(answerDto.TestQuestionId);
						var questionVersion = testQuestion?.CurrentVersion ?? 1;

						// Create new answer
						var newAnswer = new UserAnswer
						{
							TestResultId = request.TestResultId,
							TestQuestionId = answerDto.TestQuestionId,
							ChosenOptionLabel = answerDto.ChosenOptionLabel,
							AnswerText = answerDto.AnswerText,
							AnswerAudioUrl = answerDto.AnswerAudioUrl,
							SubQuestionIndex = answerDto.SubQuestionIndex,
							QuestionVersion = questionVersion, // Save the version user is answering
							CreatedAt = UtcNow
						};

						await _uow.UserAnswers.AddAsync(newAnswer);
					}
				}

				// Update TestResult timestamp (but keep status as InProgress)
				testResult.UpdatedAt = UtcNow;
				await _uow.SaveChangesAsync();

				return Result<string>.Success("Progress saved successfully");
			}
			catch (Exception ex)
			{
				return Result<string>.Failure($"Error saving progress: {ex.Message}");
			}
		}

		/// <summary>
		/// Auto-submit Speaking/Writing test when time expires.
		/// Builds bulk request from saved answers and calls AI grading service.
		/// </summary>
		private async Task AutoSubmitSWTestAsync(TestResult testResult, Test test, int duration)
		{
			try
			{
				// L?y saved answers t? DB
				var savedAnswers = await _uow.UserAnswers.GetByTestResultIdAsync(testResult.TestResultId);

				// L?y test questions v?i Part d? x�c d?nh PartType
				var testQuestions = await _uow.TestQuestions.GetByTestIdWithPartAsync(test.TestId);

				// Build danh s�ch parts cho bulk request
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

				// G?i Assessment Service d? ch?m di?m
				await _assessmentService.SubmitBulkAssessmentAsync(bulkRequest, testResult.UserId);
			}
			catch (Exception)
			{
				// N?u AI grading fail, v?n mark l� Graded v?i score = 0 d? kh�ng block user
				testResult.Status = TestResultStatus.Graded;
				testResult.Duration = duration;
				testResult.TotalScore = 0;
				testResult.UpdatedAt = UtcNow;
				await _uow.SaveChangesAsync();
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

		public async Task<Result<string>> UpdateTestQuestionAsync(int testQuestionId, UpdateTestQuestionDto dto, Guid userId, bool isAdmin = false)
		{
			await _uow.BeginTransactionAsync();
			try
			{
				// Get TestQuestion with details
				var testQuestion = await _uow.TestQuestions.GetByIdWithDetailsAsync(testQuestionId);
				if (testQuestion == null)
					return Result<string>.Failure("TestQuestion not found");

				// Check ownership if not admin - verify the test belongs to this user
				if (!isAdmin && testQuestion.Test?.CreatedById != userId)
					return Result<string>.Failure("You don't have permission to update this question. Only the test creator can modify.");

				// Branch based on whether this is a question group or single question
				if (testQuestion.IsQuestionGroup)
				{
					return await UpdateTestQuestionGroupAsync(testQuestion, dto, userId, isAdmin);
				}
				else
				{
					return await UpdateSingleTestQuestionAsync(testQuestion, dto, userId, isAdmin);
				}
			}
			catch (Exception ex)
			{
				await _uow.RollbackTransactionAsync();
				return Result<string>.Failure($"Error updating TestQuestion: {ex.Message}");
			}
		}

		/// <summary>
		/// Update a single question (not a group)
		/// </summary>
		private async Task<Result<string>> UpdateSingleTestQuestionAsync(TestQuestion testQuestion, UpdateTestQuestionDto dto, Guid userId, bool isAdmin)
		{
			// Use case-insensitive JSON options to support both PascalCase and camelCase snapshots
			var jsonOptions = new System.Text.Json.JsonSerializerOptions
			{
				PropertyNameCaseInsensitive = true
			};

			// Try to get version history (new format), or migrate from old format
			QuestionVersionHistory? versionHistory = null;
			QuestionSnapshotDto? currentSnapshot = null;

			if (!string.IsNullOrEmpty(testQuestion.SnapshotVersions))
			{
				// New format: Use SnapshotVersions
				try
				{
					versionHistory = System.Text.Json.JsonSerializer.Deserialize<QuestionVersionHistory>(testQuestion.SnapshotVersions, jsonOptions);
				}
				catch
				{
					return Result<string>.Failure("Invalid snapshot versions format");
				}

				if (versionHistory == null || !versionHistory.Versions.Any())
					return Result<string>.Failure("Failed to deserialize version history");

				currentSnapshot = versionHistory.GetLatestSnapshot();
			}
			else
			{
				// Old format: Migrate from SnapshotJson to SnapshotVersions
				try
				{
					currentSnapshot = System.Text.Json.JsonSerializer.Deserialize<QuestionSnapshotDto>(testQuestion.SnapshotJson, jsonOptions);
				}
				catch
				{
					return Result<string>.Failure("Invalid snapshot JSON format");
				}

				if (currentSnapshot == null)
					return Result<string>.Failure("Failed to deserialize snapshot");

				// Initialize version history with current snapshot
				versionHistory = QuestionVersionHistory.CreateInitial(currentSnapshot, testQuestion.CreatedAt);
			}

			if (currentSnapshot == null)
				return Result<string>.Failure("No snapshot found");

			var snapshot = currentSnapshot;

			// Clone the snapshot for the new version
			var newSnapshot = new QuestionSnapshotDto
			{
				QuestionId = snapshot.QuestionId,
				PartId = snapshot.PartId,
				Content = snapshot.Content,
				AudioUrl = snapshot.AudioUrl,
				ImageUrl = snapshot.ImageUrl,
				Explanation = snapshot.Explanation,
				Options = snapshot.Options.Select(o => new OptionSnapshotDto
				{
					Label = o.Label,
					Content = o.Content,
					IsCorrect = o.IsCorrect
				}).ToList(),
				UserAnswer = snapshot.UserAnswer,
				IsCorrect = snapshot.IsCorrect
			};

			// Update new snapshot with changes
			if (!string.IsNullOrEmpty(dto.Content))
				newSnapshot.Content = dto.Content;

			if (dto.Audio != null)
			{
				// Upload new audio
				var audioUploadResult = await _fileService.UploadFileAsync(dto.Audio, "audios");
				if (!audioUploadResult.IsSuccess)
					return Result<string>.Failure($"Failed to upload audio: {audioUploadResult.ErrorMessage}");
				newSnapshot.AudioUrl = audioUploadResult.Data;
			}

			if (dto.Image != null)
			{
				// Upload new image
				var imageUploadResult = await _fileService.UploadFileAsync(dto.Image, "images");
				if (!imageUploadResult.IsSuccess)
					return Result<string>.Failure($"Failed to upload image: {imageUploadResult.ErrorMessage}");
				newSnapshot.ImageUrl = imageUploadResult.Data;
			}

			if (!string.IsNullOrEmpty(dto.Solution))
				newSnapshot.Explanation = dto.Solution;

			if (dto.AnswerOptions != null && dto.AnswerOptions.Any())
			{
				newSnapshot.Options = dto.AnswerOptions.Select(o => new OptionSnapshotDto
				{
					Label = o.Label,
					Content = o.Content,
					IsCorrect = o.IsCorrect
				}).ToList();
			}

			// Check if anyone has answered this question
			var anyUserAnswers = (await _uow.UserAnswers.GetAllAsync())
				.Any(ua => ua.TestQuestionId == testQuestion.TestQuestionId);

			if (anyUserAnswers)
			{
				// Add as new version (preserve old version)
				versionHistory.AddVersion(newSnapshot, Now);
				testQuestion.CurrentVersion = versionHistory.CurrentVersion;
			}
			else
			{
				// No one answered yet, update the current version directly
				versionHistory.Versions[versionHistory.Versions.Count - 1].Snapshot = newSnapshot;
				versionHistory.Versions[versionHistory.Versions.Count - 1].CreatedAt = UtcNow;
			}

			// Serialize updated version history (new format)
			testQuestion.SnapshotVersions = System.Text.Json.JsonSerializer.Serialize(versionHistory);

			// Also update SnapshotJson with latest version (for backward compatibility)
			testQuestion.SnapshotJson = System.Text.Json.JsonSerializer.Serialize(newSnapshot);
			testQuestion.UpdatedAt = UtcNow;

			await _uow.TestQuestions.UpdateTestQuestionAsync(testQuestion);

			// If requested, also update the source Question in bank
			if (dto.AlsoUpdateSourceInBank && testQuestion.SourceQuestionId.HasValue)
			{
				var sourceQuestion = await _uow.Questions.GetByIdAsync(testQuestion.SourceQuestionId.Value);
				if (sourceQuestion != null)
				{
					// Update Question entity
					if (!string.IsNullOrEmpty(dto.Content))
						sourceQuestion.Content = dto.Content;

					if (dto.Audio != null && !string.IsNullOrEmpty(newSnapshot.AudioUrl))
						sourceQuestion.AudioUrl = newSnapshot.AudioUrl;

					if (dto.Image != null && !string.IsNullOrEmpty(newSnapshot.ImageUrl))
						sourceQuestion.ImageUrl = newSnapshot.ImageUrl;

					if (!string.IsNullOrEmpty(dto.Solution))
						sourceQuestion.Explanation = dto.Solution;

					sourceQuestion.UpdatedAt = UtcNow;
					await _uow.Questions.UpdateAsync(sourceQuestion);

					// Update Options in bank
					if (dto.AnswerOptions != null && dto.AnswerOptions.Any())
					{
						var existingOptions = await _uow.Options.GetOptionsByQuestionIdAsync(sourceQuestion.QuestionId);
						_uow.Options.RemoveRange(existingOptions);

						foreach (var optDto in dto.AnswerOptions)
						{
							await _uow.Options.AddAsync(new Option
							{
								QuestionId = sourceQuestion.QuestionId,
								Label = optDto.Label,
								Content = optDto.Content,
								IsCorrect = optDto.IsCorrect
							});
						}
					}
				}
			}

			// Save all changes to database before committing transaction
			await _uow.SaveChangesAsync();
			await _uow.CommitTransactionAsync();
			return Result<string>.Success("TestQuestion updated successfully" +
				(dto.AlsoUpdateSourceInBank && testQuestion.SourceQuestionId.HasValue
					? " (including source Question in bank)"
					: ""));
		}

		/// <summary>
		/// Update a question group (Part 3, 4, 6, 7)
		/// </summary>
		private async Task<Result<string>> UpdateTestQuestionGroupAsync(TestQuestion testQuestion, UpdateTestQuestionDto dto, Guid userId, bool isAdmin)
		{
			// Use case-insensitive JSON options to support both PascalCase and camelCase snapshots
			var jsonOptions = new System.Text.Json.JsonSerializerOptions
			{
				PropertyNameCaseInsensitive = true
			};

			// Try to get version history (new format), or migrate from old format
			QuestionGroupVersionHistory? versionHistory = null;
			QuestionGroupSnapshotDto? currentGroupSnapshot = null;

			if (!string.IsNullOrEmpty(testQuestion.SnapshotVersions))
			{
				// New format: Use SnapshotVersions
				try
				{
					versionHistory = System.Text.Json.JsonSerializer.Deserialize<QuestionGroupVersionHistory>(testQuestion.SnapshotVersions, jsonOptions);
				}
				catch
				{
					return Result<string>.Failure("Invalid question group snapshot versions format");
				}

				if (versionHistory == null || !versionHistory.Versions.Any())
					return Result<string>.Failure("Failed to deserialize question group version history");

				currentGroupSnapshot = versionHistory.GetLatestSnapshot();
			}
			else
			{
				// Old format: Migrate from SnapshotJson to SnapshotVersions
				try
				{
					currentGroupSnapshot = System.Text.Json.JsonSerializer.Deserialize<QuestionGroupSnapshotDto>(testQuestion.SnapshotJson, jsonOptions);
				}
				catch
				{
					return Result<string>.Failure("Invalid question group snapshot JSON format");
				}

				if (currentGroupSnapshot == null)
					return Result<string>.Failure("Failed to deserialize question group snapshot");

				// Initialize version history with current snapshot
				versionHistory = QuestionGroupVersionHistory.CreateInitial(currentGroupSnapshot, testQuestion.CreatedAt);
			}

			if (currentGroupSnapshot == null)
				return Result<string>.Failure("No question group snapshot found");

			// Clone the snapshot for the new version
			var newGroupSnapshot = new QuestionGroupSnapshotDto
			{
				QuestionGroupId = currentGroupSnapshot.QuestionGroupId,
				PartId = currentGroupSnapshot.PartId,
				Passage = currentGroupSnapshot.Passage,
				AudioUrl = currentGroupSnapshot.AudioUrl,
				ImageUrl = currentGroupSnapshot.ImageUrl,
				QuestionSnapshots = currentGroupSnapshot.QuestionSnapshots.Select(q => new QuestionSnapshotDto
				{
					QuestionId = q.QuestionId,
					PartId = q.PartId,
					Content = q.Content,
					AudioUrl = q.AudioUrl,
					ImageUrl = q.ImageUrl,
					Explanation = q.Explanation,
					Options = q.Options.Select(o => new OptionSnapshotDto
					{
						Label = o.Label,
						Content = o.Content,
						IsCorrect = o.IsCorrect
					}).ToList(),
					UserAnswer = q.UserAnswer,
					IsCorrect = q.IsCorrect
				}).ToList()
			};

			// Update Passage if provided
			if (!string.IsNullOrEmpty(dto.Passage))
				newGroupSnapshot.Passage = dto.Passage;

			// Update Audio if provided
			if (dto.Audio != null)
			{
				var audioUploadResult = await _fileService.UploadFileAsync(dto.Audio, "audios");
				if (!audioUploadResult.IsSuccess)
					return Result<string>.Failure($"Failed to upload audio: {audioUploadResult.ErrorMessage}");
				newGroupSnapshot.AudioUrl = audioUploadResult.Data;
			}

			// Update Image if provided
			if (dto.Image != null)
			{
				var imageUploadResult = await _fileService.UploadFileAsync(dto.Image, "images");
				if (!imageUploadResult.IsSuccess)
					return Result<string>.Failure($"Failed to upload image: {imageUploadResult.ErrorMessage}");
				newGroupSnapshot.ImageUrl = imageUploadResult.Data;
			}

			// Update sub-questions if provided
			if (dto.Questions != null && dto.Questions.Any())
			{
				foreach (var subQDto in dto.Questions)
				{
					// Find the sub-question to update by QuestionId
					var subQuestion = newGroupSnapshot.QuestionSnapshots
						.FirstOrDefault(q => q.QuestionId == subQDto.QuestionId);

					if (subQuestion != null)
					{
						// Update content if provided
						if (!string.IsNullOrEmpty(subQDto.Content))
							subQuestion.Content = subQDto.Content;

						// Update explanation if provided
						if (!string.IsNullOrEmpty(subQDto.Explanation))
							subQuestion.Explanation = subQDto.Explanation;

						// Update options if provided
						if (subQDto.Options != null && subQDto.Options.Any())
						{
							subQuestion.Options = subQDto.Options.Select(o => new OptionSnapshotDto
							{
								Label = o.Label,
								Content = o.Content,
								IsCorrect = o.IsCorrect
							}).ToList();
						}
					}
				}
			}

			// Check if anyone has answered this question group
			var anyUserAnswers = (await _uow.UserAnswers.GetAllAsync())
				.Any(ua => ua.TestQuestionId == testQuestion.TestQuestionId);

			if (anyUserAnswers)
			{
				// Add as new version (preserve old version for users who already answered)
				versionHistory.AddVersion(newGroupSnapshot, Now);
				testQuestion.CurrentVersion = versionHistory.CurrentVersion;
			}
			else
			{
				// No one answered yet, update the current version directly
				versionHistory.Versions[versionHistory.Versions.Count - 1].Snapshot = newGroupSnapshot;
				versionHistory.Versions[versionHistory.Versions.Count - 1].CreatedAt = UtcNow;
			}

			// Serialize updated version history (new format)
			testQuestion.SnapshotVersions = System.Text.Json.JsonSerializer.Serialize(versionHistory);

			// Also update SnapshotJson with latest version (for backward compatibility)
			testQuestion.SnapshotJson = System.Text.Json.JsonSerializer.Serialize(newGroupSnapshot);
			testQuestion.UpdatedAt = UtcNow;

			await _uow.TestQuestions.UpdateTestQuestionAsync(testQuestion);

			// If requested, also update the source QuestionGroup in bank
			if (dto.AlsoUpdateSourceInBank && testQuestion.SourceQuestionGroupId.HasValue)
			{
				var sourceGroup = await _uow.QuestionGroups.GetGroupWithQuestionsEntityAsync(testQuestion.SourceQuestionGroupId.Value);
				if (sourceGroup != null)
				{
					// Update QuestionGroup entity
					if (!string.IsNullOrEmpty(dto.Passage))
						sourceGroup.PassageContent = dto.Passage;

					if (dto.Audio != null && !string.IsNullOrEmpty(newGroupSnapshot.AudioUrl))
						sourceGroup.AudioUrl = newGroupSnapshot.AudioUrl;

					if (dto.Image != null && !string.IsNullOrEmpty(newGroupSnapshot.ImageUrl))
						sourceGroup.ImageUrl = newGroupSnapshot.ImageUrl;

					sourceGroup.UpdatedAt = UtcNow;

					// Update sub-questions in bank if provided
					if (dto.Questions != null && dto.Questions.Any())
					{
						foreach (var subQDto in dto.Questions)
						{
							if (subQDto.QuestionId.HasValue)
							{
								var bankQuestion = sourceGroup.Questions.FirstOrDefault(q => q.QuestionId == subQDto.QuestionId.Value);
								if (bankQuestion != null)
								{
									if (!string.IsNullOrEmpty(subQDto.Content))
										bankQuestion.Content = subQDto.Content;

									if (!string.IsNullOrEmpty(subQDto.Explanation))
										bankQuestion.Explanation = subQDto.Explanation;

									bankQuestion.UpdatedAt = UtcNow;

									// Update options
									if (subQDto.Options != null && subQDto.Options.Any())
									{
										var existingOptions = await _uow.Options.GetOptionsByQuestionIdAsync(bankQuestion.QuestionId);
										_uow.Options.RemoveRange(existingOptions);

										foreach (var optDto in subQDto.Options)
										{
											await _uow.Options.AddAsync(new Option
											{
												QuestionId = bankQuestion.QuestionId,
												Label = optDto.Label,
												Content = optDto.Content,
												IsCorrect = optDto.IsCorrect
											});
										}
									}
								}
							}
						}
					}
				}
			}

			// Save all changes to database before committing transaction
			await _uow.SaveChangesAsync();
			await _uow.CommitTransactionAsync();
			return Result<string>.Success("TestQuestion (Group) updated successfully" +
				(anyUserAnswers ? $" (new version {testQuestion.CurrentVersion})" : "") +
				(dto.AlsoUpdateSourceInBank && testQuestion.SourceQuestionGroupId.HasValue
					? " (including source QuestionGroup in bank)"
					: ""));
		}
		#endregion

	}
}
