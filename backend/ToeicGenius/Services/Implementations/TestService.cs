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
using ToeicGenius.Extensions;
using Newtonsoft.Json;
using Humanizer;
using static System.Net.Mime.MediaTypeNames;
using Microsoft.EntityFrameworkCore;
using ToeicGenius.Shared.Validators;
using Azure.Core;
using Newtonsoft.Json.Serialization;
using System.Threading.Tasks;

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

		/* CREATE */
		// Create from bank ( for practice test )
		public async Task<Result<string>> CreateFromBankAsync(CreateTestFromBankDto dto)
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
				};

				var singleQuestions = await _uow.Questions.GetByListIdAsync(dto.SingleQuestionIds);
				var groupQuestions = await _uow.QuestionGroups.GetByListIdAsync(dto.GroupQuestionIds);

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
				test.QuantityQuestion = quantityQuestion;
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

		// Create from bank with random selection ( for practice test )
		public async Task<Result<string>> CreateFromBankRandomAsync(CreateTestFromBankRandomDto dto)
		{
			await _uow.BeginTransactionAsync();
			try
			{
				if (dto.QuestionRanges == null || !dto.QuestionRanges.Any())
				{
					return Result<string>.Failure("Must provide at least one question range");
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

				test.QuantityQuestion = quantityQuestion;
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

		// Create manual ( for simulator test )
		public async Task<Result<string>> CreateManualAsync(CreateTestManualDto dto)
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
					QuantityQuestion = quantity,
					CreatedAt = DateTime.UtcNow
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

		#region 🔹 Snapshot Handlers
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
		#endregion

		public async Task<Result<PaginationResponse<TestListResponseDto>>> FilterAllAsync(TestFilterDto request)
		{
			var result = await _uow.Tests.FilterQuestionsAsync(request);
			return Result<PaginationResponse<TestListResponseDto>>.Success(result);
		}
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
				QuantityQuestion = test.QuantityQuestion,
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
					if (tq.IsQuestionGroup)
					{
						var groupSnap = JsonConvert.DeserializeObject<QuestionGroupSnapshotDto>(tq.SnapshotJson);
						if (groupSnap != null)
							partDto.QuestionGroups.Add(groupSnap);
					}
					else
					{
						var questionSnap = JsonConvert.DeserializeObject<QuestionSnapshotDto>(tq.SnapshotJson);
						if (questionSnap != null)
							partDto.Questions.Add(questionSnap);
					}
				}

				result.Parts.Add(partDto);
			}
			return Result<TestDetailDto>.Success(result);
		}

		// UPDATE 
		public async Task<Result<string>> UpdateStatusAsync(UpdateTestStatusDto request)
		{
			var test = await _uow.Tests.GetByIdAsync(request.TestId);
			if (test == null) return Result<string>.Failure("Not found");

			test.Status = request.Status;
			test.UpdatedAt = DateTime.Now;
			await _uow.SaveChangesAsync();

			return Result<string>.Success($"Test {test.TestId} {test.Status} successfully");
		}
		public async Task<Result<string>> UpdateTestFromBankAsync(int testId, UpdateTestFromBank dto)
		{
			// 1️⃣ Kiểm tra input hợp lệ
			if ((dto.SingleQuestionIds == null || !dto.SingleQuestionIds.Any()) &&
				(dto.GroupQuestionIds == null || !dto.GroupQuestionIds.Any()))
				return Result<string>.Failure("Must provide single question id or group question id");

			// 2️⃣ Lấy test hiện tại
			var existing = await _uow.Tests.GetByIdAsync(testId);
			if (existing == null)
				return Result<string>.Failure("Test not found");

			// 3️⃣ Nếu test đang ACTIVE → clone version mới
			Test targetTest;
			if (existing.Status == CommonStatus.Active)
			{
				int newVersion = await _uow.Tests.GetNextVersionAsync(existing.ParentTestId ?? existing.TestId);

				targetTest = new Test
				{
					Title = dto.Title,
					Description = dto.Description,
					TestSkill = dto.TestSkill,
					TestType = dto.TestType,
					Duration = dto.Duration,
					QuantityQuestion = 0,
					Status = CommonStatus.Draft,
					ParentTestId = existing.ParentTestId ?? existing.TestId,
					Version = newVersion,
					CreatedAt = DateTime.UtcNow
				};

				await _uow.Tests.AddAsync(targetTest);
				await _uow.SaveChangesAsync(); // để có TestId
			}
			else
			{
				// 4️⃣ Nếu là Draft → update trực tiếp
				targetTest = existing;
				targetTest.Title = dto.Title;
				targetTest.Description = dto.Description;
				targetTest.TestSkill = dto.TestSkill;
				targetTest.TestType = dto.TestType;
				targetTest.Duration = dto.Duration;
				targetTest.UpdatedAt = DateTime.UtcNow;

				// Xóa TestQuestion cũ
				var oldQuestions = await _uow.TestQuestions.GetByTestIdAsync(targetTest.TestId);
				if (oldQuestions.Any())
					_uow.TestQuestions.RemoveRange(oldQuestions);
			}

			// 5️⃣ Snapshot câu hỏi từ bank
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

			// 6️⃣ Cập nhật lại số lượng câu hỏi
			targetTest.QuantityQuestion = testQuestions.Count;

			await _uow.TestQuestions.AddRangeAsync(testQuestions);
			await _uow.SaveChangesAsync();

			// 7️⃣ Trả về kết quả
			return Result<string>.Success(
				existing.Status == CommonStatus.Active
					? $"Cloned and updated new version v{targetTest.Version} (TestId={targetTest.TestId})"
					: $"Updated successfully TestId={targetTest.TestId}");
		}


		public async Task<Result<string>> UpdateManualTestAsync(int testId, UpdateManualTestDto dto)
		{
			var existing = await _uow.Tests.GetByIdAsync(testId);
			if (existing == null)
				return Result<string>.Failure("Test not found");

			// ✅ Nếu test đang ACTIVE -> tạo bản clone
			Test targetTest;
			if (existing.Status == CommonStatus.Active)
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
					QuantityQuestion = 0, // sẽ cập nhật sau
					Status = CommonStatus.Draft,
					ParentTestId = existing.ParentTestId ?? existing.TestId,
					Version = newVersion,
					CreatedAt = DateTime.UtcNow
				};

				await _uow.Tests.AddAsync(targetTest);
				await _uow.SaveChangesAsync();
			}
			else
			{
				// ✅ Nếu là Draft, update trực tiếp
				targetTest = existing;
				targetTest.Title = dto.Title;
				targetTest.Description = dto.Description;
				targetTest.AudioUrl = dto.AudioUrl;
				targetTest.TestSkill = dto.TestSkill;
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
			targetTest.QuantityQuestion = testQuestions.Count;

			await _uow.SaveChangesAsync();

			return Result<string>.Success(
				existing.Status == CommonStatus.Active
					? $"Cloned to new version v{targetTest.Version} (TestId={targetTest.TestId})"
					: $"Updated successfully TestId={targetTest.TestId}");
		}
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
				QuantityQuestion = source.QuantityQuestion,
				TestSkill = source.TestSkill,
				TestType = source.TestType,
				Status = CommonStatus.Draft,
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
					Status = t.Status,
					CreatedAt = t.CreatedAt,
					UpdatedAt = t.UpdatedAt
				})
				.ToList();

			return Result<List<TestVersionDto>>.Success(dtos);
		}

		/* Function support */
		// Get duration for test (by test skill)
		private int GetTestDuration(TestSkill skill)
		{
			return skill switch
			{
				TestSkill.LR => NumberConstants.LRDuration,
				TestSkill.Speaking => NumberConstants.SpeakingDuration,
				TestSkill.Writing => NumberConstants.WritingDuration,
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
	}
}
