using Azure.Core;
using System.ComponentModel.DataAnnotations;
using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.DTOs.Requests.GroupQuestion;
using ToeicGenius.Domains.DTOs.Requests.Question;
using ToeicGenius.Domains.DTOs.Requests.QuestionGroup;
using ToeicGenius.Domains.DTOs.Responses.QuestionGroup;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Domains.Enums;
using ToeicGenius.Repositories.Implementations;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Services.Interfaces;
using ToeicGenius.Shared.Constants;
using ToeicGenius.Shared.Validators;

namespace ToeicGenius.Services.Implementations
{
	public class QuestionGroupService : IQuestionGroupService
	{

		private readonly IQuestionService _questionService;
		private readonly IFileService _fileService;
		private readonly IUnitOfWork _uow;

		public QuestionGroupService(
			IQuestionService questionService,
			IFileService fileService,
			IUnitOfWork unitOfWork)
		{
			_questionService = questionService;
			_fileService = fileService;
			_uow = unitOfWork;
		}


		public async Task<QuestionGroupResponseDto?> GetQuestionGroupResponseByIdAsync(int id)
		{
			return await _uow.QuestionGroups.GetGroupWithQuestionsAsync(id);
		}

		/// <summary>
		/// CREATE QUESTION GROUP
		/// Tạo mới một nhóm câu hỏi (e.g. Part 6, Part 7,...) kèm các câu hỏi con 
		/// Xử lý upload file và rollback file nếu có lỗi
		/// </summary>
		public async Task<Result<string>> CreateQuestionGroupAsync(QuestionGroupRequestDto request)
		{
			await _uow.BeginTransactionAsync();
			var uploadedFiles = new List<string>(); // Danh sách lưu trữ các URL file đã upload
			try
			{
				// Upload files audio (nếu có)
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

				// Upload files image (nếu có)
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

				// Entity question group
				var group = new QuestionGroup
				{
					PartId = request.PartId,
					AudioUrl = audioUrl,
					Image = imageUrl,
					PassageContent = request.PassageContent,
					PassageType = request.PassageType,
					OrderIndex = request.OrderIndex,
				};

				await _uow.QuestionGroups.AddAsync(group);

				var questions = new List<Question>();
				var options = new List<Option>();


				// Thêm questions và gán vào group
				for (int i = 0; i < request.Questions.Count; i++)
				{
					var q = request.Questions[i];
					// Upload file audio for question (nếu có)
					var qAudioUrl = "";
					if (q.Audio != null)
					{
						var (isValid, errorMessage) = FileValidator.ValidateFile(q.Audio, "audio");
						if (!isValid)
						{
							return Result<string>.Failure(errorMessage);
						}
						var result = await _fileService.UploadFileAsync(q.Audio, "audio");
						qAudioUrl = result.IsSuccess ? result.Data : "";
						uploadedFiles.Add(qAudioUrl); // Lưu URL để xóa nếu có lỗi
					}

					// Upload file image for question (nếu có)
					var qImageUrl = "";
					if (q.Image != null)
					{
						var (isValid, errorMessage) = FileValidator.ValidateFile(q.Image, "image");
						if (!isValid)
						{
							return Result<string>.Failure(errorMessage);
						}
						var result = await _fileService.UploadFileAsync(q.Audio, "image");
						qImageUrl = result.IsSuccess ? result.Data : "";
						uploadedFiles.Add(qImageUrl);
					}

					// Entity question
					var question = new Question
					{
						QuestionGroup = group,
						QuestionTypeId = q.QuestionTypeId,
						PartId = request.PartId,
						Content = q.Content,
						Number = q.Number,
						AudioUrl = qAudioUrl,
						ImageUrl = qImageUrl,
						Explanation = q.Solution,
					};
					questions.Add(question);
					group.Questions.Add(question);

					// Option for question (nếu có)
					if (q.AnswerOptions != null && q.AnswerOptions.Any())
					{
						options.AddRange(q.AnswerOptions.Select(opt => new Option
						{
							Content = opt.Content,
							Label = opt.Label,
							IsCorrect = opt.IsCorrect,
							Question = question
						}));
					}
				}

				// Bulk insert 
				await _uow.Questions.AddRangeAsync(questions);

				// Check validate options
				if (options.Any())
				{
					var (isValid, errorMessage) = OptionValidator.IsValid(options);
					if (!isValid) return Result<string>.Failure(errorMessage);
					await _uow.Options.AddRangeAsync(options);
				}

				await _uow.SaveChangesAsync(); // Commit tất cả: group, questions, options

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

		public async Task<IEnumerable<QuestionGroupListItemDto>> FilterGroupsAsync(int? part)
		{
			return await _uow.QuestionGroups.FilterGroupsAsync(part);
		}

		public async Task<Result<string>> UpdateAsync(UpdateQuestionGroupDto request)
		{
			await _uow.BeginTransactionAsync();
			var uploadedFiles = new List<string>(); // Danh sách lưu trữ các URL file đã upload
			var filesToDelete = new List<string>(); // Danh sách file cũ cần xóa

			try
			{
				// Validate QuestionGroup exists and not deleted
				var questionGroup = await _uow.QuestionGroups.GetByIdAndStatusAsync(request.QuestionGroupId, CommonStatus.Active);

				if (questionGroup == null)
				{
					return Result<string>.Failure($"QuestionGroup with ID {request.QuestionGroupId} not found or already deleted.");
				}

				// Upload files audio (nếu có)
				var audioUrl = questionGroup.AudioUrl;
				if (request.Audio != null)
				{
					var (isValid, errorMessage) = FileValidator.ValidateFile(request.Audio, "audio");
					if (!isValid)
					{
						return Result<string>.Failure(errorMessage);
					}
					var result = await _fileService.UploadFileAsync(request.Audio, "audio");
					if (!result.IsSuccess)
					{
						return Result<string>.Failure($"Failed to upload audio file.");
					}
					audioUrl = result.Data;
					uploadedFiles.Add(audioUrl);
					if (!string.IsNullOrEmpty(questionGroup.AudioUrl))
					{
						filesToDelete.Add(questionGroup.AudioUrl);
					}
				}

				// Upload files image (nếu có)
				var imageUrl = questionGroup.Image;
				if (request.Image != null)
				{
					var (isValid, errorMessage) = FileValidator.ValidateFile(request.Image, "image");
					if (!isValid)
					{
						return Result<string>.Failure(errorMessage);
					}
					var result = await _fileService.UploadFileAsync(request.Image, "image");
					if (!result.IsSuccess)
					{
						return Result<string>.Failure($"Failed to upload image file.");
					}
					imageUrl = result.Data;
					uploadedFiles.Add(imageUrl);
					if (!string.IsNullOrEmpty(questionGroup.Image))
					{
						filesToDelete.Add(questionGroup.Image);
					}
				}

				// Update QuestionGroup entity
				questionGroup.AudioUrl = audioUrl;
				questionGroup.Image = imageUrl;
				questionGroup.PassageContent = request.PassageContent;
				questionGroup.PassageType = request.PassageType;
				questionGroup.OrderIndex = request.OrderIndex;
				questionGroup.UpdatedAt = DateTime.UtcNow;

				var questions = new List<Question>();
				var options = new List<Option>();
				var questionNumbers = new HashSet<int>();
				var existingQuestions = questionGroup.Questions.ToDictionary(q => q.QuestionId, q => q);

				// Validate and process Questions
				for (int i = 0; i < request.Questions.Count; i++)
				{
					var q = request.Questions[i];

					if (q.Id.HasValue && existingQuestions.ContainsKey(q.Id.Value))
					{
						var currentQuestion = existingQuestions[q.Id.Value];
						currentQuestion.Status = CommonStatus.Inactive;
						currentQuestion.UpdatedAt = DateTime.UtcNow;
						if (!string.IsNullOrEmpty(currentQuestion.AudioUrl)) filesToDelete.Add(currentQuestion.AudioUrl);
						if (!string.IsNullOrEmpty(currentQuestion.ImageUrl)) filesToDelete.Add(currentQuestion.ImageUrl);
						foreach (var option in currentQuestion.Options)
						{
							option.Status = CommonStatus.Inactive;
							option.UpdatedAt = DateTime.UtcNow;
						}
					}

					// Upload files for Question
					var qAudioUrl = q.Id.HasValue ? existingQuestions.GetValueOrDefault(q.Id.Value)?.AudioUrl : "";
					if (q.Audio != null)
					{
						var (isValid, errorMessage) = FileValidator.ValidateFile(q.Audio, "audio");
						if (!isValid)
						{
							await _fileService.RollbackAndCleanupAsync(uploadedFiles);
							return Result<string>.Failure(errorMessage);
						}
						var result = await _fileService.UploadFileAsync(q.Audio, "audio");
						if (!result.IsSuccess)
						{
							await _fileService.RollbackAndCleanupAsync(uploadedFiles);
							return Result<string>.Failure($"Failed to upload audio file for question.");
						}
						qAudioUrl = result.Data;
						uploadedFiles.Add(qAudioUrl);
						if (q.Id.HasValue && !string.IsNullOrEmpty(existingQuestions.GetValueOrDefault(q.Id.Value)?.AudioUrl))
						{
							filesToDelete.Add(existingQuestions[q.Id.Value].AudioUrl);
						}
					}

					var qImageUrl = q.Id.HasValue ? existingQuestions.GetValueOrDefault(q.Id.Value)?.ImageUrl : "";
					if (q.Image != null)
					{
						var (isValid, errorMessage) = FileValidator.ValidateFile(q.Image, "image");
						if (!isValid)
						{
							await _fileService.RollbackAndCleanupAsync(uploadedFiles);
							return Result<string>.Failure(errorMessage);
						}
						var result = await _fileService.UploadFileAsync(q.Image, "image");
						if (!result.IsSuccess)
						{
							await _fileService.RollbackAndCleanupAsync(uploadedFiles);
							return Result<string>.Failure($"Failed to upload image file for question.");
						}
						qImageUrl = result.Data;
						uploadedFiles.Add(qImageUrl);
						if (q.Id.HasValue && !string.IsNullOrEmpty(existingQuestions.GetValueOrDefault(q.Id.Value)?.ImageUrl))
						{
							filesToDelete.Add(existingQuestions[q.Id.Value].ImageUrl);
						}
					}

					// Create or update Question
					if (q.Id.HasValue && existingQuestions.ContainsKey(q.Id.Value))
					{
						var oldQuestion = existingQuestions[q.Id.Value];
						oldQuestion.Content = q.Content;
						oldQuestion.Number = q.Number;
						oldQuestion.AudioUrl = qAudioUrl;
						oldQuestion.ImageUrl = qImageUrl;
						oldQuestion.Explanation = q.Solution;
						oldQuestion.UpdatedAt = DateTime.UtcNow;
					}
					else
					{
						var newQuestion = new Question
						{
							QuestionGroup = questionGroup,
							QuestionTypeId = q.QuestionTypeId,
							PartId = questionGroup.PartId,
							Content = q.Content,
							Number = q.Number,
							AudioUrl = qAudioUrl,
							ImageUrl = qImageUrl,
							Explanation = q.Solution,
							Status = CommonStatus.Active
						};
						questions.Add(newQuestion);
						questionGroup.Questions.Add(newQuestion);
					}



					var question = q.Id.HasValue ? existingQuestions.GetValueOrDefault(q.Id.Value) : questions.Last();
					var existingOptions = q.Id.HasValue ? existingQuestions.GetValueOrDefault(q.Id.Value)?.Options.ToDictionary(o => o.OptionId, o => o) : new Dictionary<int, Option>();

					foreach (var opt in q.AnswerOptions)
					{
						if (opt.Id.HasValue && existingOptions.ContainsKey(opt.Id.Value))
						{
							var option = existingOptions[opt.Id.Value];
							option.Content = opt.Content;
							option.Label = opt.Label;
							option.IsCorrect = opt.IsCorrect;
							option.UpdatedAt = DateTime.UtcNow;
						}
						else
						{
							options.Add(new Option
							{
								Content = opt.Content,
								Label = opt.Label,
								IsCorrect = opt.IsCorrect,
								Question = question,
								Status = CommonStatus.Active
							});
						}
					}

				}

				// Bulk insert new Questions and Options
				await _uow.Questions.AddRangeAsync(questions);
				if (options.Any())
				{
					var (isValid, errorMessage) = OptionValidator.IsValid(options);
					if (!isValid)
					{
						await _fileService.RollbackAndCleanupAsync(uploadedFiles);
						return Result<string>.Failure(errorMessage);
					}
					await _uow.Options.AddRangeAsync(options);
				}

				// Delete old files
				foreach (var file in filesToDelete)
				{
					if (!string.IsNullOrEmpty(file))
					{
						await _fileService.DeleteFileAsync(file);
					}
				}

				await _uow.SaveChangesAsync(); // Commit tất cả: group, questions, options
				await _uow.CommitTransactionAsync();
				return Result<string>.Success($"QuestionGroup {request.QuestionGroupId} updated successfully.");
			}
			catch (Exception ex)
			{
				// Rollback transaction & delete files
				await _fileService.RollbackAndCleanupAsync(uploadedFiles);
				return Result<string>.Failure($"Operation failed: {ex.Message}");
			}
		}

		/// <summary>
		/// Soft delete a QuestionGroup, its Questions, and Options, marking associated files for deletion.
		/// </summary>
		public async Task<Result<string>> DeleteQuestionGroupAsync(int questionGroupId)
		{
			await _uow.BeginTransactionAsync();

			try
			{
				var questionGroup = await _uow.QuestionGroups.GetByIdAndStatusAsync(questionGroupId, CommonStatus.Active);

				if (questionGroup == null)
				{
					return Result<string>.Failure($"QuestionGroup with ID {questionGroupId} not found or already deleted.");
				}

				// Mark QuestionGroup as deleted
				questionGroup.Status = CommonStatus.Inactive;
				questionGroup.UpdatedAt = DateTime.UtcNow;

				// Mark all Questions and their Options as deleted
				foreach (var question in questionGroup.Questions)
				{
					question.Status = CommonStatus.Inactive;
					question.UpdatedAt = DateTime.UtcNow;

					foreach (var option in question.Options)
					{
						option.Status = CommonStatus.Inactive;
						option.UpdatedAt = DateTime.UtcNow;
					}
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

	}
}