using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Services.Interfaces;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Domains.DTOs.Responses.Question;
using ToeicGenius.Domains.DTOs.Requests.Question;
using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.DTOs.Responses.QuestionGroup;
using ToeicGenius.Shared.Constants;
using ToeicGenius.Shared.Validators;
using ToeicGenius.Domains.Enums;
using Azure.Core;
using Amazon.Runtime.Internal;

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
			return await _uow.Questions.GetQuestionResponseByIdAsync(id);
		}

		public async Task<IEnumerable<Question>> GetAllAsync()
		{
			return await _uow.Questions.GetAllAsync();
		}

		public async Task<Result<string>> CreateAsync(CreateQuestionDto request)
		{
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
					Number = request.Number,
					AudioUrl = audioUrl,
					ImageUrl = imageUrl,
					Explanation = request.Solution
				};

				await _uow.Questions.AddAsync(question);
				var options = new List<Option>();

				var part = await _uow.Parts.GetByIdAsync(request.PartId);
				var requireQuantityOptions = (part.Skill ==(int)TestSkill.LR && part.PartNumber == 2) ? NumberConstants.MinQuantityOption : NumberConstants.MaxQuantityOption;

				// Options (nếu có)
				if (request.AnswerOptions != null && request.AnswerOptions.Any())
				{
					options.AddRange(request.AnswerOptions.Select(opt => new Option
					{
						Content = opt.Content,
						Label = opt.Label,
						IsCorrect = opt.IsCorrect,
						Question = question
					}));
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
				return Result<string>.Failure(ErrorMessages.OperationFailed + $": {ex.Message}");
			}
		}

        public async Task<Result<string>> UpdateAsync(int questionId, UpdateQuestionDto dto)
        {
            await _uow.BeginTransactionAsync();

            var uploadedFiles = new List<string>();   // file mới để rollback nếu fail
            var filesToDelete = new List<string>();  // file cũ sẽ xoá SAU KHI commit

            try
            {
                // 1) Lấy question (đang Active theo repo của bạn)
                var currentQuestion = await _uow.Questions.GetQuestionByIdAndStatus(questionId, CommonStatus.Active);
                if (currentQuestion == null)
                    return Result<string>.Failure("Not found question to update");

                // 2) Upload file mới (nếu có)
                string? newImageUrl = null, newAudioUrl = null;

                if (dto.Image is { Length: > 0 })
                {
                    var (ok, err) = FileValidator.ValidateFile(dto.Image, "image");
                    if (!ok) return Result<string>.Failure(err);

                    var up = await _fileService.UploadFileAsync(dto.Image, "image");
                    if (!up.IsSuccess) return Result<string>.Failure("Failed to upload image file.");

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
                    if (!up.IsSuccess) return Result<string>.Failure("Failed to upload audio file.");

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
                currentQuestion.Number = dto.Number;
                currentQuestion.UpdatedAt = DateTime.UtcNow;

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
                            opt.UpdatedAt = DateTime.UtcNow;
                        }
                    }
                    else
                    {
                        // đúng 1 đáp án đúng
                        if (dto.AnswerOptions.Count(o => o.IsCorrect) != 1)
                            return Result<string>.Failure("Exactly one answer must be marked correct.");

                        // rule số lượng theo Part (LR Part 2 = 3; còn lại = 4)
                        var part = await _uow.Parts.GetByIdAsync(dto.PartId);
                        var isLR = Convert.ToInt32(part.Skill) == (int)TestSkill.LR;
                        var required = (isLR && Convert.ToInt32(part.PartNumber) == 2)
                            ? NumberConstants.MinQuantityOption
                            : NumberConstants.MaxQuantityOption;

                        // map hiện có
                        var existing = currentQuestion.Options.ToDictionary(o => o.OptionId, o => o);

                        // soft-delete những option cũ không còn trong payload
                        var keepIds = new HashSet<int>(dto.AnswerOptions.Where(d => d.Id.HasValue)
                                                                        .Select(d => d.Id!.Value));
                        foreach (var old in currentQuestion.Options.Where(o => !keepIds.Contains(o.OptionId)))
                        {
                            old.Status = CommonStatus.Inactive;
                            old.UpdatedAt = DateTime.UtcNow;
                        }

                        // upsert: update nếu có Id, còn lại thêm mới
                        foreach (var d in dto.AnswerOptions)
                        {
                            var label = (d.Label ?? "").Trim();
                            var content = (d.Content ?? "").Trim();
                            if (string.IsNullOrEmpty(label) || string.IsNullOrEmpty(content))
                                return Result<string>.Failure("Answer label/content is required.");

                            if (d.Id.HasValue && existing.TryGetValue(d.Id.Value, out var opt))
                            {
                                opt.Label = label;
                                opt.Content = content;
                                opt.IsCorrect = d.IsCorrect;
                                opt.Status = CommonStatus.Active;
                                opt.UpdatedAt = DateTime.UtcNow;
                            }
                            else
                            {
                                currentQuestion.Options.Add(new Option
                                {
                                    Label = label,
                                    Content = content,
                                    IsCorrect = d.IsCorrect,
                                    Status = CommonStatus.Active,
                                    CreatedAt = DateTime.UtcNow,
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

                return Result<string>.Success($"Question {questionId} updated successfully.");
            }
            catch (Exception ex)
            {
                await _uow.RollbackTransactionAsync();
                await _fileService.RollbackAndCleanupAsync(uploadedFiles);
                return Result<string>.Failure($"Operation failed: {ex.Message}");
            }
        }



        public async Task<Result<string>> DeleteAsync(int id)
		{
			await _uow.BeginTransactionAsync();

			try
			{
				var question = await _uow.Questions.GetQuestionByIdAndStatus(id, CommonStatus.Active);

				if (question == null)
				{
					return Result<string>.Failure($"Question with ID {id} not found or already deleted.");
				}

				// Mark QuestionGroup as deleted
				question.Status = CommonStatus.Inactive;
				question.UpdatedAt = DateTime.UtcNow;

				// Mark all Questions and their Options as deleted
				foreach (var option in question.Options)
				{
					option.Status = CommonStatus.Inactive;
					option.UpdatedAt = DateTime.UtcNow;
				}

				await _uow.SaveChangesAsync();
				await _uow.CommitTransactionAsync();
				return Result<string>.Success("");
			}
			catch (Exception ex)
			{
				await _uow.RollbackTransactionAsync();
				return Result<string>.Failure($"Operation failed: {ex.Message}");
			}
		}

		public async Task<QuestionResponseDto?> GetQuestionResponseByIdAsync(int id)
		{
			return await _uow.Questions.GetQuestionResponseByIdAsync(id);
		}

		public async Task<Result<PaginationResponse<QuestionResponseDto>>> FilterQuestionsAsync(
	int? partId, int? questionTypeId, string? keyWord, int? skill, int page, int pageSize, CommonStatus status)
		{
			var result = await _uow.Questions.FilterQuestionsAsync(partId, questionTypeId, keyWord, skill, page, pageSize, status);
			return Result<PaginationResponse<QuestionResponseDto>>.Success(result);
		}
	}
}