using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.DTOs.Requests.Question;
using ToeicGenius.Domains.DTOs.Responses.Question;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Domains.Enums;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Services.Interfaces;
using ToeicGenius.Shared.Constants;
using static ToeicGenius.Shared.Helpers.DateTimeHelper;
using ToeicGenius.Shared.Validators;
using Azure.Core;

namespace ToeicGenius.Services.Implementations
{
	public class QuestionService : IQuestionService
	{
		private readonly IUnitOfWork _uow;
		private readonly IFileService _fileService;

		public QuestionService(IUnitOfWork unitOfWork, IFileService fileService)
		{
			_fileService = fileService;
			_uow = unitOfWork;
		}

		public async Task<QuestionResponseDto> GetByIdAsync(int id)
		{
			try
			{
				return await _uow.Questions.GetQuestionResponseByIdAsync(id);
			}
			catch (Exception ex)
			{
				throw;
			}
		}

		public async Task<IEnumerable<Question>> GetAllAsync()
		{
			return await _uow.Questions.GetAllAsync();
		}

		public async Task<Result<string>> CreateAsync(CreateQuestionDto request)
		{
			// check valid listening part
			var part = await _uow.Parts.GetByIdAsync(request.PartId);

			bool isListeningPart = part != null && part.Skill == QuestionSkill.Listening;
			bool isLRPart12 = part != null && part.Skill == QuestionSkill.Listening && (part.PartNumber == 1 || part.PartNumber == 2);

			// Listening part yêu cầu file audio
			if (part != null && part.Skill == QuestionSkill.Listening)
			{
				if (request.Audio == null || request.Audio.Length == 0)
				{
					return Result<string>.Failure("Phần Listening part yêu cầu phải có file âm thanh.");
				}
			}

			// Nếu không phải part 1,2 của LR thì check content question
			if (!isLRPart12)
			{
				if (string.IsNullOrWhiteSpace(request.Content))
				{
					return Result<string>.Failure("Content của câu hỏi không được để trống.");
				}
			}

			await _uow.BeginTransactionAsync();
			var uploadedFiles = new List<string>(); // Danh sách lưu trữ các URL file đã upload
			try
			{
				// Upload audio file for question (nếu có)
				var audioUrl = "";
				if (request.Audio != null)
				{
					var (isValid, errorMessage) = FileValidator.ValidateFile(request.Audio, "audio");
					if (!isValid)
					{
						return Result<string>.Failure(errorMessage);
					}
					var result = await _fileService.UploadFileAsync(request.Audio, "audio");
					audioUrl = result.IsSuccess ? result.Data : "";
					uploadedFiles.Add(audioUrl);
				}

				// Upload image file for question (nếu có)
				var imageUrl = "";
				if (request.Image != null)
				{
					var (isValid, errorMessage) = FileValidator.ValidateFile(request.Image, "image");
					if (!isValid)
					{
						return Result<string>.Failure(errorMessage);
					}
					var result = await _fileService.UploadFileAsync(request.Image, "image");
					imageUrl = result.IsSuccess ? result.Data : "";
					uploadedFiles.Add(imageUrl);
				}

				// Entity question
				var question = new Question
				{
					QuestionGroupId = request.QuestionGroupId,
					QuestionTypeId = request.QuestionTypeId,
					PartId = request.PartId,
					Content = request.Content,
					AudioUrl = audioUrl,
					ImageUrl = imageUrl,
					Explanation = request.Solution
				};

				await _uow.Questions.AddAsync(question);
				// Tạo options
				var options = new List<Option>();
				var requireQuantityOptions = (isListeningPart && part.PartNumber == 2)
					? NumberConstants.MinQuantityOption
					: NumberConstants.MaxQuantityOption;

				if (request.AnswerOptions != null && request.AnswerOptions.Any())
				{
					foreach (var opt in request.AnswerOptions)
					{
						// Nếu không phải part 1,2 của LR thì content là bắt buộc
						if (!isLRPart12 && string.IsNullOrWhiteSpace(opt.Content))
						{
							return Result<string>.Failure("Content của option không được để trống.");
						}

						options.Add(new Option
						{
							Content = isLRPart12 ? null : opt.Content,
							Label = opt.Label,
							IsCorrect = opt.IsCorrect,
							Question = question
						});
					}
				}

				// Check validate options
				if (options.Any())
				{
					var (isValid, errorMessage) = OptionValidator.IsValid(options, requireQuantityOptions);
					if (!isValid) throw new Exception(errorMessage);
					await _uow.Options.AddRangeAsync(options);
				}

				await _uow.SaveChangesAsync();
				await _uow.CommitTransactionAsync();
				return Result<string>.Success(SuccessMessages.OperationSuccess);
			}
			catch (Exception ex)
			{
				// Rollback transaction & delete files
				await _fileService.RollbackAndCleanupAsync(uploadedFiles);
				return Result<string>.Failure(ex.Message);
			}
		}

		public async Task<Result<string>> UpdateAsync(int questionId, UpdateQuestionDto dto)
		{
			// Check question
			var currentQuestion = await _uow.Questions.GetQuestionByIdAndStatus(questionId, CommonStatus.Active);
			if (currentQuestion == null)
				return Result<string>.Failure("Không tìm thấy câu hỏi để cập nhật.");

			// check valid listening part
			var part = await _uow.Parts.GetByIdAsync(dto.PartId);
			if (part != null && part.Skill == QuestionSkill.Listening)
			{
				// FIX: only require audio when neither new file is provided nor question already has audio
				var hasExistingAudio = !string.IsNullOrEmpty(currentQuestion.AudioUrl);
				var hasNewAudio = dto.Audio != null && dto.Audio.Length > 0;
				if (!hasExistingAudio && !hasNewAudio)
				{
					return Result<string>.Failure("Phần Listening part yêu cầu phải có file âm thanh.");
				}
			}

			bool isListeningPart = part != null && part.Skill == QuestionSkill.Listening;
			bool isLRPart12 = part != null && part.Skill == QuestionSkill.Listening && (part.PartNumber == 1 || part.PartNumber == 2);
			// Nếu không phải part 1,2 của LR thì check content question
			if (!isLRPart12)
			{
				if (string.IsNullOrWhiteSpace(dto.Content))
				{
					return Result<string>.Failure("Content của câu hỏi không được để trống.");
				}
			}

			await _uow.BeginTransactionAsync();

			var uploadedFiles = new List<string>();   // file mới để rollback nếu fail
			var filesToDelete = new List<string>();  // file cũ sẽ xoá SAU KHI commit

			try
			{
				// 2) Upload file mới (nếu có)
				string? newImageUrl = null, newAudioUrl = null;

				if (dto.Image is { Length: > 0 })
				{
					var (ok, err) = FileValidator.ValidateFile(dto.Image, "image");
					if (!ok) return Result<string>.Failure(err);

					var up = await _fileService.UploadFileAsync(dto.Image, "image");
					if (!up.IsSuccess) return Result<string>.Failure("Lỗi khi tải lên file ảnh.");

					newImageUrl = up.Data;
					uploadedFiles.Add(newImageUrl);

					if (!string.IsNullOrEmpty(currentQuestion.ImageUrl))
						filesToDelete.Add(currentQuestion.ImageUrl);
				}

				if (dto.Audio is { Length: > 0 })
				{
					var (ok, err) = FileValidator.ValidateFile(dto.Audio, "audio");
					if (!ok) return Result<string>.Failure(err);

					var up = await _fileService.UploadFileAsync(dto.Audio, "audio");
					if (!up.IsSuccess) return Result<string>.Failure("Lỗi khi tải lên file âm thanh.");

					newAudioUrl = up.Data;
					uploadedFiles.Add(newAudioUrl);

					if (!string.IsNullOrEmpty(currentQuestion.AudioUrl))
						filesToDelete.Add(currentQuestion.AudioUrl);
				}

				// 3) Cập nhật field chính
				currentQuestion.PartId = dto.PartId;
				currentQuestion.QuestionTypeId = dto.QuestionTypeId;
				currentQuestion.Content = dto.Content;
				currentQuestion.Explanation = dto.Solution;
				currentQuestion.UpdatedAt = Now;

				// Chỉ thay khi có file mới
				if (!string.IsNullOrEmpty(newAudioUrl)) currentQuestion.AudioUrl = newAudioUrl;
				if (!string.IsNullOrEmpty(newImageUrl)) currentQuestion.ImageUrl = newImageUrl;

				// 4) Đáp án (tuỳ chọn)
				//    null  : KHÔNG đụng tới options
				//    rỗng  : soft-delete toàn bộ options
				//    >0    : upsert + soft-delete cái bị bỏ + validate
				if (dto.AnswerOptions != null)
				{
					if (dto.AnswerOptions.Count == 0)
					{
						foreach (var opt in currentQuestion.Options)
						{
							opt.Status = CommonStatus.Inactive;
							opt.UpdatedAt = Now;
						}
					}
					else
					{
						// đúng 1 đáp án đúng
						if (dto.AnswerOptions.Count(o => o.IsCorrect) != 1)
							return Result<string>.Failure("Cần có duy nhất một đáp án đúng.");
						// Nếu không phải part 1,2 của LR thì content là bắt buộc
						if (!isLRPart12 && string.IsNullOrWhiteSpace(dto.Content))
						{
							return Result<string>.Failure("Content của option không được để trống.");
						}
						// rule số lượng theo Part (LR Part 2 = 3; còn lại = 4)
						var isLR = Convert.ToInt32(part.Skill) == (int)TestSkill.LR;
						var required = (isLR && Convert.ToInt32(part.PartNumber) == 2)
							? NumberConstants.MinQuantityOption
							: NumberConstants.MaxQuantityOption;

						// map hiện có
						var existing = currentQuestion.Options.ToDictionary(o => o.OptionId, o => o);

						// build keepIds from DTO but only positive ids (ids <= 0 are treated as "new")
						var keepIds = new HashSet<int>(dto.AnswerOptions
							.Where(d => d.Id.HasValue && d.Id.Value > 0)
							.Select(d => d.Id!.Value));

						// soft-delete những option cũ không còn trong payload
						foreach (var old in currentQuestion.Options.Where(o => !keepIds.Contains(o.OptionId)))
						{
							old.Status = CommonStatus.Inactive;
							old.UpdatedAt = Now;
						}

						// upsert: update nếu có Id (>0 và tồn tại), còn lại thêm mới
						foreach (var d in dto.AnswerOptions)
						{
							var label = (d.Label ?? "").Trim();
							var content = (d.Content ?? "").Trim();
							if (string.IsNullOrEmpty(label) || string.IsNullOrEmpty(content))
								return Result<string>.Failure("Các nhãn dán (label) và nội dung câu hỏi là bắt buộc.");

							if (d.Id.HasValue && existing.TryGetValue(d.Id.Value, out var opt))
							{
								// update existing option
								opt.Label = label;
								opt.Content = content;
								opt.IsCorrect = d.IsCorrect;
								opt.Status = CommonStatus.Active;
								opt.UpdatedAt = Now;
							}
							else
							{
								// create new option
								currentQuestion.Options.Add(new Option
								{
									Label = label,
									Content = content,
									IsCorrect = d.IsCorrect,
									Status = CommonStatus.Active,
									CreatedAt = Now,
									// QuestionId sẽ được EF set qua navigation 'Question'
									Question = currentQuestion
								});
							}
						}

						// validate trên danh sách Active cuối cùng
						var finalOptions = currentQuestion.Options
							.Where(o => o.Status != CommonStatus.Inactive)
							.ToList();
						var (ok, err) = OptionValidator.IsValid(finalOptions, required);
						if (!ok) return Result<string>.Failure(err);
					}
				}

				// 5) Commit
				await _uow.SaveChangesAsync();
				await _uow.CommitTransactionAsync();

				// 6) Xoá file cũ sau commit (best-effort)
				foreach (var f in filesToDelete)
					if (!string.IsNullOrEmpty(f))
						await _fileService.DeleteFileAsync(f);

				return Result<string>.Success($"Câu hỏi {questionId} cập nhật thành công.");
			}
			catch (Exception ex)
			{
				await _fileService.RollbackAndCleanupAsync(uploadedFiles);
				return Result<string>.Failure(ex.Message);
			}
		}

		public async Task<Result<string>> UpdateStatusAsync(int id, bool isGroupQuestion, bool isRestore)
		{
			await _uow.BeginTransactionAsync();

			try
			{
				CommonStatus targetStatus = isRestore ? CommonStatus.Active : CommonStatus.Inactive;
				CommonStatus currentStatus = isRestore ? CommonStatus.Inactive : CommonStatus.Active;

				if (!isGroupQuestion)
				{
					// Xử lý câu hỏi đơn
					var question = await _uow.Questions.GetQuestionByIdAndStatus(id, currentStatus);

					if (question == null)
					{
						string notFoundType = isRestore ? "Inactive" : "Active";
						return Result<string>.Failure($"Không tìm thấy câu hỏi có ID {id} hoặc câu hỏi đã ở trạng thái {targetStatus}.");
					}

					// Cập nhật trạng thái
					question.Status = targetStatus;
					question.UpdatedAt = Now;

					foreach (var option in question.Options)
					{
						option.Status = targetStatus;
						option.UpdatedAt = Now;
					}
				}
				else
				{
					// Xử lý nhóm câu hỏi
					var group = await _uow.QuestionGroups.GetByIdAndStatusAsync(id, currentStatus);

					if (group == null)
					{
						string notFoundType = isRestore ? "Inactive" : "Active";
						return Result<string>.Failure($"Không tìm thấy nhóm câu hỏi có ID {id} hoặc nhóm đã ở trạng thái {targetStatus}.");
					}

					group.Status = targetStatus;
					group.UpdatedAt = Now;

					foreach (var question in group.Questions)
					{
						question.Status = targetStatus;
						question.UpdatedAt = Now;

						foreach (var option in question.Options)
						{
							option.Status = targetStatus;
							option.UpdatedAt = Now;
						}
					}
				}

				await _uow.SaveChangesAsync();
				await _uow.CommitTransactionAsync();

				string actionName = isRestore ? "Khôi phục" : "Xóa";
				return Result<string>.Success($"{actionName} thành công.");
			}
			catch (Exception ex)
			{
				await _uow.RollbackTransactionAsync();
				string actionName = isRestore ? "Khôi phục" : "Xóa";
				return Result<string>.Failure($"{actionName} thất bại: {ex.Message}");
			}
		}

		public async Task<QuestionResponseDto?> GetQuestionResponseByIdAsync(int id)
		{
			return await _uow.Questions.GetQuestionResponseByIdAsync(id);
		}

		public async Task<Result<PaginationResponse<QuestionListItemDto>>> FilterSingleQuestionAsync(
			int? partId, int? questionTypeId, string? keyWord, int? skill, string sortOrder, int page, int pageSize, CommonStatus status)
		{
			try
			{
				var result = await _uow.Questions.FilterSingleAsync(partId, questionTypeId, keyWord, skill, sortOrder, page, pageSize, status);
				return Result<PaginationResponse<QuestionListItemDto>>.Success(result);
			}
			catch (Exception ex)
			{
				return Result<PaginationResponse<QuestionListItemDto>>.Failure(ex.Message);
			}

		}
	}
}