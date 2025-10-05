using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.DTOs.Requests.GroupQuestion;
using ToeicGenius.Domains.DTOs.Responses.QuestionGroup;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Repositories.Implementations;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Services.Interfaces;

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

		public async Task<Result<QuestionGroupResponseDto>> CreateQuestionGroupAsync(QuestionGroupRequestDto request)
		{
			await _uow.BeginTransactionAsync();
			try
			{
				// Upload files song song
				var audioTask = request.Audio != null
					? _fileService.SaveFileToMEGAAsync(request.Audio, "audio")
					: Task.FromResult<string?>(null);
				var imageTask = request.Image != null
					? _fileService.SaveFileToMEGAAsync(request.Image, "image")
					: Task.FromResult<string?>(null);

				await Task.WhenAll(audioTask, imageTask);

				var group = new QuestionGroup
				{
					PartId = request.PartId,
					GroupType = request.GroupType,
					AudioUrl = await audioTask,
					Image = await imageTask,
					PassageContent = request.PassageContent,
					PassageType = request.PassageType,
					OrderIndex = request.OrderIndex
				};

				await _uow.QuestionGroups.AddAsync(group);

				var questions = new List<Question>();
				var options = new List<Option>();
				var solutions = new List<SolutionDetail>();

				// Thêm questions và gán vào group
				for (int i = 0; i < request.Questions.Count; i++)
				{
					var q = request.Questions[i];

					var qAudioTask = q.Audio != null
						? _fileService.SaveFileToMEGAAsync(q.Audio, "audio")
						: Task.FromResult<string?>(null);
					var qImageTask = q.Image != null
						? _fileService.SaveFileToMEGAAsync(q.Image, "image")
						: Task.FromResult<string?>(null);

					await Task.WhenAll(qAudioTask, qImageTask);

					var question = new Question
					{
						QuestionGroup = group, // Gán navigation property
						QuestionTypeId = q.QuestionTypeId,
						PartId = q.PartId,
						Content = q.Content,
						Number = q.Number,
						AudioUrl = await qAudioTask,
						ImageUrl = await qImageTask
					};
					questions.Add(question);
					group.Questions.Add(question); // Thêm vào navigation property của group

					// Tạm lưu Options/Solutions để gán QuestionId sau
					if (q.AnswerOptions != null)
					{
						options.AddRange(q.AnswerOptions.Select(opt => new Option
						{
							Content = opt.Content,
							OptionLabel = opt.Label,
							IsCorrect = opt.IsCorrect,
							Question = question // Gán navigation property
						}));
					}

					if (!string.IsNullOrWhiteSpace(q.Solution))
					{
						solutions.Add(new SolutionDetail
						{
							Explanation = q.Solution,
							Question = question // Gán navigation property
						});
					}
				}

				await _uow.Questions.AddRangeAsync(questions);
				if (options.Any())
					await _uow.Options.AddRangeAsync(options);
				if (solutions.Any())
					await _uow.Solutions.AddRangeAsync(solutions);

				await _uow.SaveChangesAsync(); // Commit tất cả: group, questions, options, solutions

				// Lấy lại group với questions (read-only)
				var response = await _uow.QuestionGroups.GetGroupWithQuestionsAsync(group.QuestionGroupId);
				await _uow.CommitTransactionAsync();
				return Result<QuestionGroupResponseDto>.Success(response);
			}
			catch (Exception ex)
			{
				await _uow.RollbackTransactionAsync();
				// TODO: Cleanup uploaded files if needed
				return Result<QuestionGroupResponseDto>.Failure($"Failed to create question group: {ex.Message}");
			}
		}

		public async Task<IEnumerable<QuestionGroupListItemDto>> FilterGroupsAsync(int? part)
		{
			return await _uow.QuestionGroups.FilterGroupsAsync(part);
		}
	}
}