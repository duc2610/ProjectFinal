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
using static System.Net.Mime.MediaTypeNames;
using Microsoft.EntityFrameworkCore;
using ToeicGenius.Shared.Validators;
using Azure.Core;

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
		// Create from bank ( for practice test )
		public async Task<Result<string>> CreateFromBankAsync(CreateTestFromBankDto dto)
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

				var singleQuestions = await _uow.Questions.GetByListIdAsync(dto.SingleQuestionIds);
				var groupQuestions = await _uow.QuestionGroups.GetByListIdAsync(dto.GroupQuestionIds);

				var quantityQuestion = 0;
				var order = 1;
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
						OriginalQuestionId = q.QuestionId,
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
						OriginalQuestionGroupId = q.QuestionGroupId,
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
				return Result<string>.Success("Created successfully");
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

			try
			{
				// 1️⃣ Validate cấu trúc
				TestValidator.ValidateTestStructure(dto);

				// 2️⃣ Upload audio tổng (chỉ cho L&R)
				string audioUrl = await HandleGlobalAudioIfNeeded(dto, uploadedFiles);

				// 3️⃣ Xác định thời lượng theo kỹ năng
				int duration = GetTestDuration(dto.TestSkill);

				// 4️⃣ Tạo test
				var test = new Test
				{
					Title = dto.Title,
					Description = dto.Description,
					Duration = duration,
					TestSkill = dto.TestSkill,
					TestType = TestType.Simulator,
					AudioUrl = audioUrl,
					CreatedAt = DateTime.UtcNow
				};
				await _uow.Tests.AddAsync(test);
				await _uow.SaveChangesAsync();

				// 5️⃣ Xử lý phần nội dung test
				int order = 1;
				TestBuildResult result = dto.TestSkill switch
				{
					TestSkill.LR => await HandleListeningReadingAsync(dto, test, uploadedFiles, order),
					TestSkill.Speaking => await HandleSpeakingAsync(dto, test, uploadedFiles, order),
					TestSkill.Writing => await HandleWritingAsync(dto, test, uploadedFiles, order),
					_ => throw new Exception("Unsupported test skill")
				};

				await _uow.SaveChangesAsync();
				await _uow.CommitTransactionAsync();

				return Result<string>.Success($"Created successfully TestId = {test.TestId}");
			}
			catch (Exception ex)
			{
				await _fileService.RollbackAndCleanupAsync(uploadedFiles);
				return Result<string>.Failure(ex.Message);
			}
		}


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
		public async Task<Result<string>> UpdateStatusAsync(UpdateTestStatusDto request)
		{
			var test = await _uow.Tests.GetByIdAsync(request.TestId);
			if (test == null) return Result<string>.Failure("Not found");

			test.Status = request.Status;
			test.UpdatedAt = DateTime.Now;
			await _uow.SaveChangesAsync();

			return Result<string>.Success($"Test {test.TestId} {test.Status} successfully");
		}
		public async Task<Result<string>> UpdateTestAsync(int testId, UpdateTestDto request)
		{
			var test = await _uow.Tests.GetTestByIdAsync(testId);
			if (test == null)
				return Result<string>.Failure("Test not found");

			test.Title = request.Title;
			test.Description = request.Description;
			test.Duration = request.Duration;
			test.Status = request.Status;
			test.UpdatedAt = DateTime.UtcNow;

			await _uow.SaveChangesAsync();
			return Result<string>.Success($"Updated successfully");
		}

		/* Function support */
		// Upload main audio for tests (L&R)
		private async Task<string> HandleGlobalAudioIfNeeded(CreateTestManualDto dto, List<string> uploadedFiles)
		{
			if (dto.TestSkill != TestSkill.LR)
				return string.Empty;

			if (dto.Audio == null || dto.Audio.Length == 0)
				throw new Exception("Full test audio file is required for Listening & Reading test.");

			var (isValid, err) = FileValidator.ValidateFile(dto.Audio, "audio");
			if (!isValid) throw new Exception(err);

			var upload = await _fileService.UploadFileAsync(dto.Audio, "audio");
			if (!upload.IsSuccess) throw new Exception("Failed to upload audio file.");

			uploadedFiles.Add(upload.Data!);
			return upload.Data!;
		}

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

		// Handle test
		private async Task<TestBuildResult> HandleListeningReadingAsync(CreateTestManualDto dto, Test test, List<string> uploadedFiles, int order)
		{
			var testQuestions = new List<TestQuestion>();

			foreach (var part in dto.Parts)
			{
				// Handle Groups
				if (part.Groups?.Any() == true)
				{
					foreach (var groupDto in part.Groups)
					{
						var groupEntity = await CreateQuestionGroupAsync(groupDto, part.PartId, uploadedFiles);

						// Create Questions (with options)
						var questions = new List<Question>();
						foreach (var q in groupDto.Questions)
						{
							var qEntity = await CreateQuestionWithOptionsAsync(q, part.PartId, uploadedFiles, groupEntity);
							questions.Add(qEntity);
						}

						groupEntity.Questions = questions;

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

				// Handle single questions
				if (part.Questions?.Any() == true)
				{
					foreach (var q in part.Questions)
					{
						var qEntity = await CreateQuestionWithOptionsAsync(q, part.PartId, uploadedFiles);
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
			return new TestBuildResult
			{
				Questions = testQuestions,
				NextOrder = order
			};
		}
		private async Task<TestBuildResult> HandleSpeakingAsync(CreateTestManualDto dto, Test test, List<string> uploadedFiles, int order)
		{
			var testQuestions = new List<TestQuestion>();

			foreach (var part in dto.Parts)
			{
				foreach (var q in part.Questions)
				{
					// Mỗi câu có thể có file audio hoặc image
					string imageUrl = await UploadIfExistsAsync(q.Image, "image", uploadedFiles);

					var qEntity = new Question
					{
						Content = q.Content,
						ImageUrl = imageUrl,
						Explanation = q.Explanation,
						PartId = part.PartId
					};

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

			return new TestBuildResult
			{
				Questions = testQuestions,
				NextOrder = order
			};
		}
		private async Task<TestBuildResult> HandleWritingAsync(CreateTestManualDto dto, Test test, List<string> uploadedFiles, int order)
		{
			var testQuestions = new List<TestQuestion>();

			foreach (var part in dto.Parts)
			{
				foreach (var q in part.Questions)
				{
					string imageUrl = await UploadIfExistsAsync(q.Image, "image", uploadedFiles);

					var qEntity = new Question
					{
						Content = q.Content,
						ImageUrl = imageUrl,
						Explanation = q.Explanation,
						PartId = part.PartId
					};

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

			return new TestBuildResult
			{
				Questions = testQuestions,
				NextOrder = order
			};
		}

		// Upload file (if have)
		private async Task<string> UploadIfExistsAsync(IFormFile? file, string type, List<string> uploadedFiles)
		{
			if (file == null || file.Length == 0) return string.Empty;

			var (isValid, err) = FileValidator.ValidateFile(file, type);
			if (!isValid) throw new Exception(err);

			var upload = await _fileService.UploadFileAsync(file, type);
			if (!upload.IsSuccess) throw new Exception($"Failed to upload {type} file.");

			uploadedFiles.Add(upload.Data!);
			return upload.Data!;
		}

		// Create group question
		private async Task<QuestionGroup> CreateQuestionGroupAsync(ManualQuestionGroupDto groupDto, int partId, List<string> uploadedFiles)
		{
			string imageUrl = await UploadIfExistsAsync(groupDto.Image, "image", uploadedFiles);

			var group = new QuestionGroup
			{
				PassageContent = groupDto.Passage,
				AudioUrl = "",
				ImageUrl = imageUrl,
				PartId = partId
			};

			await _uow.QuestionGroups.AddAsync(group);
			return group;
		}

		// Create single question
		private async Task<Question> CreateQuestionWithOptionsAsync(ManualQuestionDto qDto, int partId, List<string> uploadedFiles, QuestionGroup? group = null)
		{
			string imageUrl = await UploadIfExistsAsync(qDto.Image, "image", uploadedFiles);

			var question = new Question
			{
				QuestionGroup = group,
				Content = qDto.Content,
				AudioUrl = "",
				ImageUrl = imageUrl,
				Explanation = qDto.Explanation,
				PartId = partId
			};

			await _uow.Questions.AddAsync(question);

			foreach (var opt in qDto.Options)
			{
				await _uow.Options.AddAsync(new Option
				{
					Question = question,
					Label = opt.Label,
					Content = opt.Content,
					IsCorrect = opt.IsCorrect
				});
			}

			return question;
		}

	}
}
