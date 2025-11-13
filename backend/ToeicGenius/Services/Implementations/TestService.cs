using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System.Text.Json;
using System.Text.Json.Serialization;
using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.DTOs.Requests.Exam;
using ToeicGenius.Domains.DTOs.Requests.Test;
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
using ToeicGenius.Shared.Validators;

namespace ToeicGenius.Services.Implementations
{
	public class TestService : ITestService
	{
		private readonly IUnitOfWork _uow;
		private readonly IFileService _fileService;
		public TestService(IUnitOfWork unitOfWork, IFileService fileService)
		{
			_uow = unitOfWork;
			_fileService = fileService;
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
					return Result<string>.Failure("Must provide single question id or group question id");
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

				var singleQuestions = await _uow.Questions.GetByListIdAsync(dto.SingleQuestionIds);
				var groupQuestions = await _uow.QuestionGroups.GetByListIdAsync(dto.GroupQuestionIds);

				// Validate all PartIds from fetched questions match TestSkill
				foreach (var q in singleQuestions)
				{
					var (isValid, errorMessage) = await ValidatePartForTestSkillAsync(q.PartId, dto.TestSkill);
					if (!isValid)
					{
						return Result<string>.Failure($"Question {q.QuestionId}: {errorMessage}");
					}
				}

				foreach (var g in groupQuestions)
				{
					var (isValid, errorMessage) = await ValidatePartForTestSkillAsync(g.PartId, dto.TestSkill);
					if (!isValid)
					{
						return Result<string>.Failure($"QuestionGroup {g.QuestionGroupId}: {errorMessage}");
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
						CreatedAt = DateTime.UtcNow
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
						CreatedAt = DateTime.UtcNow,
					});
				}
				test.TotalQuestion = quantityQuestion;
				test.CreationStatus = TestCreationStatus.Completed;
				test.VisibilityStatus = TestVisibilityStatus.Hidden;
				await _uow.Tests.AddAsync(test);

				await _uow.SaveChangesAsync();
				await _uow.CommitTransactionAsync();
				return Result<string>.Success($"Created successfully (testId: {test.TestId})");
			}
			catch (Exception ex)
			{
				await _uow.RollbackTransactionAsync();
				return Result<string>.Failure(ex.ToString());
			}
		}

		// Create from bank with random selection (for practice test)
		public async Task<Result<string>> CreateFromBankRandomAsync(CreateTestFromBankRandomDto dto)
		{
			await _uow.BeginTransactionAsync();
			try
			{
				if (dto.QuestionRanges == null || !dto.QuestionRanges.Any())
				{
					return Result<string>.Failure("Must provide at least one question range");
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
								CreatedAt = DateTime.UtcNow
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
								CreatedAt = DateTime.UtcNow,
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
				return Result<string>.Success($"Created successfully (testId: {test.TestId}) with {quantityQuestion} questions randomly selected from bank");
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
				NullValueHandling = NullValueHandling.Include, // Giữ key nếu null để dễ debug snapshot
				ContractResolver = new CamelCasePropertyNamesContractResolver()
			};

			try
			{
				// Validate cấu trúc test đầu vào
				TestValidator.ValidateTestStructure(dto);

				if (dto.TestSkill == TestSkill.LR && string.IsNullOrEmpty(dto.AudioUrl))
					return Result<string>.Failure("L&R test requires an audio file.");

				int duration = GetTestDuration(dto.TestSkill);
				int quantity = GetQuantityQuestion(dto);

				// Khởi tạo đối tượng Test
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
					CreatedAt = DateTime.UtcNow,
					CreatedById = userId
				};

				await _uow.Tests.AddAsync(test);

				var testQuestions = new List<TestQuestion>();
				int order = 1;

				// Duyệt qua từng Part
				foreach (var part in dto.Parts)
				{
					// Xử lý nhóm câu hỏi
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
								CreatedAt = DateTime.UtcNow
							});
						}
					}

					// Xử lý câu hỏi đơn
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
								CreatedAt = DateTime.UtcNow
							});
						}
					}
				}
				// Lưu vào DB
				await _uow.TestQuestions.AddRangeAsync(testQuestions);
				test.CreationStatus = TestCreationStatus.Completed;
				test.VisibilityStatus = TestVisibilityStatus.Hidden;
				await _uow.SaveChangesAsync();
				await _uow.CommitTransactionAsync();

				return Result<string>.Success($"Created successfully TestId = {test.TestId} with {quantity} questions");
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
					CreatedAt = DateTime.UtcNow,
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
					return Result<string>.Failure("Test not found");

				if (test.CreationStatus == TestCreationStatus.Completed || test.VisibilityStatus == TestVisibilityStatus.Published)
					return Result<string>.Failure("Cannot edit a published test. Please clone to create a new version.");

				// Validate partId is compatible with test skill
				var (isValid, errorMessage) = await ValidatePartForTestSkillAsync(partId, test.TestSkill);
				if (!isValid)
					return Result<string>.Failure(errorMessage);

				// Ensure there is something to save
				if ((dto.Groups == null || !dto.Groups.Any()) && (dto.Questions == null || !dto.Questions.Any()))
					return Result<string>.Failure("No questions to save for this part.");

				// Xoá dữ liệu cũ của Part này (nếu có)
				var oldQuestions = await _uow.TestQuestions.GetByTestAndPartAsync(testId, partId);
				if (oldQuestions.Any())
					_uow.TestQuestions.RemoveRange(oldQuestions);

				// Lấy các câu hỏi còn lại sau khi xoá Part hiện tại (để resequence OrderInTest)
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
							CreatedAt = DateTime.UtcNow
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
							CreatedAt = DateTime.UtcNow
						});
					}
				}

				// Add new items then persist to get TestQuestionIds for stable ordering
				await _uow.TestQuestions.AddRangeAsync(testQuestions);
				await _uow.SaveChangesAsync();

				// Resequence OrderInTest từ 1..N trên toàn bộ test sau khi đã có dữ liệu mới
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
						.ThenBy(q => q.TestQuestionId) // ổn định theo id đã sinh
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
						// Deserialize snapshot để lấy số câu trong group
						var snapshot = JsonConvert.DeserializeObject<QuestionGroupSnapshotDto>(q.SnapshotJson);
						totalQuestions += snapshot?.QuestionSnapshots?.Count ?? 0;
					}
					else
					{
						totalQuestions += 1;
					}
				}
				// Cập nhật tổng số câu hỏi của test sau khi lưu/resequence
				test.TotalQuestion = totalQuestions;

				test.UpdatedAt = DateTime.UtcNow;
				test.CreationStatus = TestCreationStatus.InProgress;

				await _uow.SaveChangesAsync();
				await _uow.CommitTransactionAsync();

				return Result<string>.Success($"Saved Part {partId} successfully");
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
				return Result<string>.Failure("Test not found");

			// Validate cấu trúc đầy đủ
			var questions = await _uow.TestQuestions.GetByTestIdAsync(testId);
			if (questions.Count == 0)
				return Result<string>.Failure("No questions found.");

			if (test.TestSkill == TestSkill.LR && string.IsNullOrEmpty(test.AudioUrl))
				return Result<string>.Failure("L&R test requires an audio file.");

			// Tính tổng số câu
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
			// Validate số câu
			int expectedCount = GetExpectedQuestionCount(test.TestSkill);
			if (totalQuestions != expectedCount)
				return Result<string>.Failure($"Test must have {expectedCount} questions, currently {totalQuestions}.");

			test.TotalQuestion = totalQuestions;
			test.CreationStatus = TestCreationStatus.Completed;
			test.UpdatedAt = DateTime.UtcNow;

			await _uow.SaveChangesAsync();

			return Result<string>.Success($"Test {test.Title} finalized successfully!");
		}
		/* CREATE - End */

		/* LIST & DETAIL - start */
		// Get list (for TestCreator)
		public async Task<Result<PaginationResponse<TestListResponseDto>>> FilterAllAsync(TestFilterDto request)
		{
			var result = await _uow.Tests.FilterQuestionsAsync(request);
			return Result<PaginationResponse<TestListResponseDto>>.Success(result);
		}

		// Get detail (for TestCreator)
		public async Task<Result<TestDetailDto>> GetDetailAsync(int id)
		{
			var test = await _uow.Tests.GetTestByIdAsync(id);
			if (test == null) return Result<TestDetailDto>.Failure("Test not found");

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
		// Update Status
		public async Task<Result<string>> UpdateStatusAsync(UpdateTestVisibilityStatusDto request)
		{
			var test = await _uow.Tests.GetByIdAsync(request.TestId);
			if (test == null) return Result<string>.Failure("Not found");
			if (test.CreationStatus != TestCreationStatus.Completed)
			{
				return Result<string>.Failure("Only completed tests can be published.");
			}

			test.VisibilityStatus = request.VisibilityStatus;
			test.UpdatedAt = DateTime.Now;
			await _uow.SaveChangesAsync();

			return Result<string>.Success($"Test {test.TestId} {test.VisibilityStatus} successfully");
		}

		// Update Test From Bank (practice test)
		public async Task<Result<string>> UpdateTestFromBankAsync(int testId, UpdateTestFromBank dto)
		{
			// 1️. Kiểm tra input hợp lệ
			if ((dto.SingleQuestionIds == null || !dto.SingleQuestionIds.Any()) &&
				(dto.GroupQuestionIds == null || !dto.GroupQuestionIds.Any()))
				return Result<string>.Failure("Must provide single question id or group question id");

			// 2️. Lấy test hiện tại
			var existing = await _uow.Tests.GetByIdAsync(testId);
			if (existing == null)
				return Result<string>.Failure("Test not found");

			// 3️. Luôn tạo version mới khi update (không update trực tiếp)
			int parentId = existing.ParentTestId ?? existing.TestId;
			int newVersion = await _uow.Tests.GetNextVersionAsync(parentId);

			Test targetTest = new Test
			{
				Title = dto.Title,
				Description = dto.Description,
				TestSkill = dto.TestSkill,
				TestType = dto.TestType,
				Duration = dto.Duration,
				TotalQuestion = 0,
				// Nếu test gốc là bản đã public, thì clone ra 1 bản nháp mới để chỉnh sửa
				CreationStatus = existing.VisibilityStatus == TestVisibilityStatus.Published
								? TestCreationStatus.Draft
								: existing.CreationStatus,

				// Khi clone ra test mới thì mặc định ẩn
				VisibilityStatus = TestVisibilityStatus.Hidden,
				ParentTestId = parentId,
				Version = newVersion,
				CreatedAt = DateTime.UtcNow
			};

			await _uow.Tests.AddAsync(targetTest);
			await _uow.SaveChangesAsync(); // để có TestId

			// 5️. Snapshot câu hỏi từ bank
			var jsonSettings = new JsonSerializerSettings
			{
				ReferenceLoopHandling = ReferenceLoopHandling.Ignore
			};

			var testQuestions = new List<TestQuestion>();
			int order = 1;

			// SINGLE QUESTIONS
			var singleQuestions = await _uow.Questions.GetByListIdAsync(dto.SingleQuestionIds);
			foreach (var q in singleQuestions)
			{
				string snapshot = JsonConvert.SerializeObject(q, jsonSettings);
				testQuestions.Add(new TestQuestion
				{
					Test = targetTest,
					PartId = q.PartId,
					OrderInTest = order++,
					SourceType = QuestionSourceType.FromBank,
					SnapshotJson = snapshot,
					CreatedAt = DateTime.UtcNow
				});
			}

			// GROUP QUESTIONS
			var groupQuestions = await _uow.QuestionGroups.GetByListIdAsync(dto.GroupQuestionIds);
			foreach (var g in groupQuestions)
			{
				string snapshot = JsonConvert.SerializeObject(g, jsonSettings);
				testQuestions.Add(new TestQuestion
				{
					Test = targetTest,
					PartId = g.PartId,
					OrderInTest = order++,
					SourceType = QuestionSourceType.FromBank,
					SnapshotJson = snapshot,
					CreatedAt = DateTime.UtcNow
				});
			}

			// 6️. Cập nhật lại số lượng câu hỏi
			targetTest.TotalQuestion = testQuestions.Count;

			await _uow.TestQuestions.AddRangeAsync(testQuestions);
			await _uow.SaveChangesAsync();

			// 7️. Trả về kết quả
			return Result<string>.Success(
				$"Updated to version v{targetTest.Version} (TestId={targetTest.TestId})");
		}

		// Update Test Manual (simulator test)
		public async Task<Result<string>> UpdateManualTestAsync(int testId, UpdateManualTestDto dto)
		{
			var existing = await _uow.Tests.GetByIdAsync(testId);
			if (existing == null)
				return Result<string>.Failure("Test not found");
			int totalQuestion = GetQuantityQuestion(dto);
			// Nếu test đang PUBLISHED -> tạo bản clone
			Test targetTest;

			if (existing.VisibilityStatus == TestVisibilityStatus.Published)
			{
				// Lấy version mới
				int newVersion = await _uow.Tests.GetNextVersionAsync(existing.ParentTestId ?? existing.TestId);

				targetTest = new Test
				{
					Title = dto.Title,
					Description = dto.Description,
					TestSkill = dto.TestSkill,
					TestType = dto.TestType,
					AudioUrl = dto.AudioUrl,
					Duration = GetTestDuration(dto.TestSkill),
					TotalQuestion = totalQuestion, // sẽ cập nhật sau
					VisibilityStatus = TestVisibilityStatus.Hidden,
					ParentTestId = existing.ParentTestId ?? existing.TestId,
					Version = newVersion,
					CreatedAt = DateTime.UtcNow
				};

				await _uow.Tests.AddAsync(targetTest);
				await _uow.SaveChangesAsync();
			}
			else
			{
				// Nếu là Completed, update trực tiếp
				targetTest = existing;
				targetTest.Title = dto.Title;
				targetTest.Description = dto.Description;
				targetTest.AudioUrl = dto.AudioUrl;
				targetTest.TestSkill = dto.TestSkill;
				targetTest.TotalQuestion = totalQuestion;
				targetTest.UpdatedAt = DateTime.UtcNow;

				// Xóa test question cũ
				var oldQuestions = await _uow.TestQuestions.GetByTestIdAsync(targetTest.TestId);
				_uow.TestQuestions.RemoveRange(oldQuestions);
			}

			// ✅ Snapshot lại câu hỏi mới
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
							CreatedAt = DateTime.UtcNow
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
							CreatedAt = DateTime.UtcNow
						});
					}
				}
			}

			await _uow.TestQuestions.AddRangeAsync(testQuestions);

			await _uow.SaveChangesAsync();

			return Result<string>.Success(
				existing.VisibilityStatus == TestVisibilityStatus.Published
					? $"Cloned to new version v{targetTest.Version} (TestId={targetTest.TestId})"
					: $"Updated successfully TestId={targetTest.TestId}");
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
				CreatedAt = DateTime.UtcNow
			};

			// Clone snapshot của TestQuestion
			foreach (var tq in source.TestQuestions)
			{
				clone.TestQuestions.Add(new TestQuestion
				{
					PartId = tq.PartId,
					OrderInTest = tq.OrderInTest,
					SourceType = tq.SourceType,
					SnapshotJson = tq.SnapshotJson,
					CreatedAt = DateTime.UtcNow
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
			// Lấy test gốc
			var parent = await _uow.Tests.GetTestByIdAsync(parentTestId);
			if (parent == null)
				return Result<List<TestVersionDto>>.Failure("Parent test not found");

			// Lấy tất cả version có cùng parent (bao gồm cả parent)
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

			return Result<List<TestVersionDto>>.Success(dtos);
		}
		#endregion

		#region Do Test - Examinee
		// Get test data for examinee
		public async Task<Result<TestStartResponseDto>> GetTestStartAsync(TestStartRequestDto request, Guid userId)
		{
			// Check test existed
			var test = await _uow.Tests.GetTestByIdAsync(request.Id);
			if (test == null || test.VisibilityStatus != TestVisibilityStatus.Published) return Result<TestStartResponseDto>.Failure("Test not found");

			// Simulator: thời gian cố định
			// Practice: có thể chọn tính giờ hoặc không
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
				CreatedAt = test.CreatedAt,
				UpdatedAt = test.UpdatedAt
			};

			// Reuse active test session if available to avoid duplicates
			var existingTestResult = await _uow.TestResults.GetActiveTestByUserAndTestAsync(userId, test.TestId);
			TestResult userTest;
			if (existingTestResult != null)
			{
				userTest = existingTestResult;

				// Check if test time has expired + 5 minutes grace period -> auto-submit
				var elapsedTime = DateTime.UtcNow - userTest.CreatedAt;
				var testDurationWithGrace = TimeSpan.FromMinutes(test.Duration + 5);

				if (elapsedTime > testDurationWithGrace && userTest.Status == TestResultStatus.InProgress)
				{
					// Auto-submit the test based on test skill
					if (test.TestSkill == TestSkill.LR || test.TestSkill == TestSkill.FourSkills)
					{
						// For LR and FourSkills tests, call SubmitLRTestAsync
						var submitRequest = new SubmitLRTestRequestDto
						{
							TestId = test.TestId,
							TestResultId = userTest.TestResultId,
							Duration = (int)elapsedTime.TotalMinutes,
							TestType = test.TestType,
							Answers = new List<UserLRAnswerDto>() // Empty answers list for auto-submit
						};

						await SubmitLRTestAsync(userId, submitRequest);
					}
					else
					{
						// For Speaking/Writing tests, just mark as submitted (grading happens separately via bulk grading)
						userTest.Status = TestResultStatus.Graded;
						userTest.Duration = (int)elapsedTime.TotalMinutes;
						userTest.UpdatedAt = DateTime.UtcNow;
						await _uow.SaveChangesAsync();
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
						CreatedAt = DateTime.UtcNow
					};

					await _uow.TestResults.AddAsync(userTest);
					await _uow.SaveChangesAsync();
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
					CreatedAt = DateTime.UtcNow
				};

				await _uow.TestResults.AddAsync(userTest);
				await _uow.SaveChangesAsync();
			}

			result.TestResultId = userTest.TestResultId;

			// Load saved answers if user is resuming
			var savedAnswers = await _uow.UserAnswers.GetByTestResultIdAsync(userTest.TestResultId);
			var savedAnswersDict = savedAnswers?.ToDictionary(
				ua => (ua.TestQuestionId, ua.SubQuestionIndex),
				ua => ua
			) ?? new Dictionary<(int, int?), UserAnswer>();

			// Nếu test chưa có câu hỏi
			if (test.TestQuestions == null || !test.TestQuestions.Any())
				return Result<TestStartResponseDto>.Success(result);

			// Lấy các Parts, mỗi Parts gồm các câu hỏi
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
			result.SavedAnswers = savedAnswers.Select(ua => new SavedAnswerDto
			{
				TestQuestionId = ua.TestQuestionId,
				ChosenOptionLabel = ua.ChosenOptionLabel,
				AnswerText = ua.AnswerText,
				AnswerAudioUrl = ua.AnswerAudioUrl,
				SubQuestionIndex = ua.SubQuestionIndex,
				CreatedAt = ua.CreatedAt,
				UpdatedAt = ua.UpdatedAt
			}).ToList();

			return Result<TestStartResponseDto>.Success(result);
		}
		// Submit listening & reading test
		public async Task<Result<GeneralLRResultDto>> SubmitLRTestAsync(Guid userId, SubmitLRTestRequestDto request)
		{
			if (request.Answers == null || !request.Answers.Any())
				return Result<GeneralLRResultDto>.Failure("No answers provided.");

			if (!request.TestResultId.HasValue)
				return Result<GeneralLRResultDto>.Failure("Test session must be provided.");
			TestResult? testResult = null;
			if (request.TestResultId.HasValue)
			{
				testResult = await _uow.TestResults.GetByIdAsync(request.TestResultId.Value);

				if (testResult == null)
					return Result<GeneralLRResultDto>.Failure("Test session not found.");
				if (testResult.UserId != userId || testResult.TestId != request.TestId)
					return Result<GeneralLRResultDto>.Failure("Test session does not match the submitted data.");
				if (testResult.Status == TestResultStatus.Graded)
					return Result<GeneralLRResultDto>.Failure("This test session has already been submitted.");
			}

			// Tổng số câu hỏi
			var totalQuestion = await _uow.Tests.GetTotalQuestionAsync(request.TestId);

			// Test question của bài test
			var testQuestions = await _uow.TestQuestions.GetByTestIdAsync(request.TestId);

			if (!testQuestions.Any())
				return Result<GeneralLRResultDto>.Failure("Invalid test or questions.");

			bool isSimulator = request.TestType == TestType.Simulator;

			testResult.Duration = request.Duration;
			testResult.TestType = request.TestType;
			testResult.Status = TestResultStatus.Graded;
			testResult.UpdatedAt = DateTime.UtcNow;

			// Lấy map Part -> Skill
			var partIds = testQuestions.Select(q => q.PartId).Distinct().ToList();
			var partSkillMap = await _uow.Parts.GetSkillMapByIdsAsync(partIds);

			// 1️.Xử lý & chấm bài
			var (userAnswers, stats) = ProcessUserAnswers(request, testQuestions, partSkillMap, isSimulator, testResult);

			// 2.Tính kết quả cuối cùng
			var result = isSimulator
				? CalculateSimulatorResult(stats, request.Duration)
				: CalculatePracticeResult(stats, request.Duration);

			// 3. Set thông tin cho test result
			testResult.SkillScores = BuildSkillScores(result, isSimulator);
			testResult.TotalQuestions = totalQuestion;
			testResult.CorrectCount = result.CorrectCount;
			testResult.IncorrectCount = result.IncorrectCount;
			testResult.SkipCount = result.SkipCount;
			testResult.TotalScore = (decimal)(isSimulator ? result.TotalScore : 0);

			// 4.Lưu vào DB
			await _uow.UserAnswers.AddRangeAsync(userAnswers);
			await _uow.SaveChangesAsync();

			var resultDetail = await _uow.TestResults.GetTestResultLRAsync(testResult.TestResultId);

			return Result<GeneralLRResultDto>.Success(resultDetail);
		}
		public async Task<Result<List<TestHistoryDto>>> GetTestHistoryAsync(Guid userId)
		{
			var result = await _uow.Tests.GetTestHistoryAsync(userId);
			return Result<List<TestHistoryDto>>.Success(result);
		}
		public async Task<Result<TestResultDetailDto>> GetListeningReadingResultDetailAsync(int testResultId, Guid userId)
		{
			var testResult = await _uow.TestResults.GetListeningReadingResultDetailAsync(testResultId, userId);

			if (testResult == null || testResult.UserId != userId)
				return Result<TestResultDetailDto>.Failure("Test result not found or unauthorized.");

			var test = testResult.Test;

			var dto = new TestResultDetailDto
			{
				TestResultId = testResult.TestResultId,
				TestId = test.TestId,
				Title = test.Title,
				TestSkill = test.TestSkill,
				TestType = test.TestType,
				AudioUrl = test.AudioUrl,
				Duration = test.Duration,
				QuantityQuestion = test.TotalQuestion,
				CorrectCount = testResult.CorrectCount,
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
					// Với question group
					if (tq.IsQuestionGroup)
					{
						var groupSnap = JsonConvert.DeserializeObject<QuestionGroupSnapshotDto>(tq.SnapshotJson ?? "{}");
						if (groupSnap == null) continue;

						for (int i = 0; i < groupSnap.QuestionSnapshots.Count; i++)
						{
							var subQuestion = groupSnap.QuestionSnapshots[i];

							// 🔹 match theo TestQuestionId + SubQuestionIndex
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
						// 🔹 Câu hỏi đơn
						var questionSnap = JsonConvert.DeserializeObject<QuestionSnapshotDto>(tq.SnapshotJson ?? "{}");
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
		public async Task<Result<List<TestListResponseDto>>> GetTestsByTypeAsync(TestType testType)
		{
			var result = await _uow.Tests.GetTestByType(testType);
			if (result == null || !result.Any())
			{
				return Result<List<TestListResponseDto>>.Failure("Not found");
			}
			return Result<List<TestListResponseDto>>.Success(result);
		}
		public async Task<Result<StatisticResultDto>> GetDashboardStatisticAsync(Guid examineeId, TestSkill skill, string range)
		{
			var dateFrom = GetDateRangeStart(range);
			var results = await _uow.TestResults.GetResultsWithinRangeAsync(examineeId, dateFrom);

			if (results == null || !results.Any())
				return Result<StatisticResultDto>.Failure("No test results found.");

			// Lọc kết quả theo kỹ năng
			IEnumerable<TestResult> filtered = skill switch
			{
				TestSkill.Speaking => results.Where(r => r.Test.TestSkill == TestSkill.Speaking),
				TestSkill.Writing => results.Where(r => r.Test.TestSkill == TestSkill.Writing),
				_ => results.Where(r => r.Test.TestSkill == TestSkill.LR)
			};

			if (!filtered.Any())
				return Result<StatisticResultDto>.Failure($"No test results found for skill: {skill}");

			// Hàm chia an toàn (tránh NaN / Infinity)
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

			// Nếu là ListeningReading thì chia nhỏ phần bên trong
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
				TestSkill.FourSkills => NumberConstants.FourSkillsDuration,
				_ => throw new Exception("Invalid test skill")
			};
		}
		private int GetQuantityQuestion(CreateTestManualDto dto)
		{
			int quantity = 0;

			foreach (var part in dto.Parts)
			{
				// Đếm câu hỏi trực tiếp trong part
				if (part.Questions != null)
					quantity += part.Questions.Count;

				// Đếm câu hỏi trong từng group của part
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
				// Đếm câu hỏi trực tiếp trong part
				if (part.Questions != null)
					quantity += part.Questions.Count;

				// Đếm câu hỏi trong từng group của part
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

			// Tạo map để tra nhanh câu trả lời người dùng (O(1))
			var answerMap = request.Answers
				.GroupBy(a => a.TestQuestionId)
				.ToDictionary(
					g => g.Key,
					g => g.ToDictionary(a => a.SubQuestionIndex ?? 0)
				);

			foreach (var tq in testQuestions)
			{
				// Xác định kỹ năng
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

						// Tìm câu trả lời
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

							// Tìm câu trả lời user
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
					// debug khi snapshot bị lỗi JSON
					Console.WriteLine($"Error processing TestQuestionId={tq.TestQuestionId}: {ex.Message}");
				}
			}

			// Tổng kết thống kê
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
				CreatedAt = DateTime.UtcNow
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
			// Mapping thủ công, tránh phụ thuộc EF entity để snapshot chuẩn nhất
			return new QuestionGroupSnapshotDto
			{
				QuestionGroupId = 0,
				PartId = partId,
				Passage = dto.Passage ?? string.Empty,
				ImageUrl = dto.ImageUrl,
				QuestionSnapshots = dto.Questions?.Select(q => new QuestionSnapshotDto
				{
					QuestionId = 0,
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
			return new QuestionSnapshotDto
			{
				QuestionId = 0,
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
				"1y" => DateTime.UtcNow.AddYears(-1),
				"6m" => DateTime.UtcNow.AddMonths(-6),
				"3m" => DateTime.UtcNow.AddMonths(-3),
				"1m" => DateTime.UtcNow.AddMonths(-1),
				"7d" => DateTime.UtcNow.AddDays(-7),
				"3d" => DateTime.UtcNow.AddDays(-3),
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
			// TestSkill.Speaking (1) → QuestionSkill.Speaking (1) → Parts 11-15
			// TestSkill.Writing (2) → QuestionSkill.Writing (2) → Parts 8-10
			// TestSkill.LR (3) → QuestionSkill.Listening (3) or Reading (4) → Parts 1-7

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
						existingAnswer.UpdatedAt = DateTime.UtcNow;

						await _uow.UserAnswers.UpdateAsync(existingAnswer);
					}
					else
					{
						// Create new answer
						var newAnswer = new UserAnswer
						{
							TestResultId = request.TestResultId,
							TestQuestionId = answerDto.TestQuestionId,
							ChosenOptionLabel = answerDto.ChosenOptionLabel,
							AnswerText = answerDto.AnswerText,
							AnswerAudioUrl = answerDto.AnswerAudioUrl,
							SubQuestionIndex = answerDto.SubQuestionIndex,
							CreatedAt = DateTime.UtcNow
						};

						await _uow.UserAnswers.AddAsync(newAnswer);
					}
				}

				// Update TestResult timestamp (but keep status as InProgress)
				testResult.UpdatedAt = DateTime.UtcNow;
				await _uow.SaveChangesAsync();

				return Result<string>.Success("Progress saved successfully");
			}
			catch (Exception ex)
			{
				return Result<string>.Failure($"Error saving progress: {ex.Message}");
			}
		}
		#endregion

	}
}
