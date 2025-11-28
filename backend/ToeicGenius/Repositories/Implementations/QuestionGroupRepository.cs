using Microsoft.EntityFrameworkCore;
using ToeicGenius.Domains.DTOs.Responses.QuestionGroup;
using ToeicGenius.Domains.DTOs.Responses.Question;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Repositories.Persistence;
using ToeicGenius.Domains.Enums;
using ToeicGenius.Domains.DTOs.Common;

namespace ToeicGenius.Repositories.Implementations
{
	public class QuestionGroupRepository : BaseRepository<QuestionGroup, int>, IQuestionGroupRepository
	{
		public QuestionGroupRepository(ToeicGeniusDbContext context) : base(context) { }

		public async Task<QuestionGroupResponseDto?> GetGroupWithQuestionsAsync(int id)
		{
			var group = await _context.QuestionGroups
				.Include(g => g.Part)
				.Include(g => g.Questions)
					.ThenInclude(q => q.QuestionType)
				.Include(g => g.Questions)
					.ThenInclude(q => q.Options)
				.Where(g => g.QuestionGroupId == id)
				.Select(g => new QuestionGroupResponseDto
				{
					QuestionGroupId = g.QuestionGroupId,
					PartId = g.PartId,
					PartName = g.Part.Name ?? "",
					AudioUrl = g.AudioUrl,
					ImageUrl = g.ImageUrl,
					PassageContent = g.PassageContent,
					Status = g.Status,
					// Chỉ lấy QUESTION Active
					Questions = g.Questions
								.Where(q => q.Status == CommonStatus.Active)
								.Select(q => new SingleQuestionDto
								{
									QuestionId = q.QuestionId,
									QuestionTypeId = q.QuestionTypeId,
									QuestionTypeName = q.QuestionType.TypeName,
									PartId = q.PartId,
									PartName = g.Part.Name ?? "",
									Content = q.Content,
									// Chỉ lấy OPTION Active
									Options = q.Options
										.Where(o => o.Status == CommonStatus.Active)
										.Select(o => new OptionDto
										{
											OptionId = o.OptionId,
											Content = o.Content ?? "",
											Label = o.Label ?? "",
											IsCorrect = o.IsCorrect
										})
										.ToList(),
						Solution = q.Explanation,
						Status = q.Status
					}).ToList(),
				})
				.FirstOrDefaultAsync();

			return group;
		}
		public async Task<PaginationResponse<QuestionListItemDto>> FilterGroupAsync(int? partId, string? keyWord, int? skill, string sortOrder, int page, int pageSize, CommonStatus status, Guid? creatorId = null)
		{
			var query = _context.QuestionGroups
				.Include(g => g.Part)
				.Include(g => g.Questions)
				.Where(g => g.Status == status)
				.AsQueryable();

			// Filter by creator - TestCreator only sees their own question groups
			if (creatorId.HasValue)
				query = query.Where(g => g.CreatedById == creatorId.Value);

			if (partId.HasValue)
				query = query.Where(g => g.PartId == partId);

			if (skill.HasValue)
				query = query.Where(g => g.Part.Skill == (QuestionSkill)skill);

			if (!string.IsNullOrEmpty(keyWord))
				query = query.Where(g => g.PassageContent.ToLower().Contains(keyWord.ToLower()));

			var data = await query
				.Select(g => new QuestionListItemDto
				{
					Id = g.QuestionGroupId,
					IsGroupQuestion = true,
					PartName = g.Part.Name,
					PartId = g.PartId,
					Skill = g.Part.Skill,
					Content = g.PassageContent,
					QuestionCount = g.Questions.Count(),
					Status = g.Status,
					CreatedAt = g.CreatedAt
				})
				.ToListAsync();

			// Sort & paginate
			data = sortOrder?.ToLower() == "desc"
				? data.OrderByDescending(x => x.CreatedAt).ToList()
				: data.OrderBy(x => x.CreatedAt).ToList();

			var totalCount = data.Count;
			var pagedData = data.Skip((page - 1) * pageSize).Take(pageSize).ToList();

			return new PaginationResponse<QuestionListItemDto>(pagedData, totalCount, page, pageSize);
		}

		public async Task<QuestionGroup> GetByIdAndStatusAsync(int? id, CommonStatus status)
		{
			return await _context.QuestionGroups
				.Where(x => x.QuestionGroupId == id && x.Status == status)
				.Include(qg => qg.Questions)
					.ThenInclude(q => q.Options)
				.FirstOrDefaultAsync();
		}

		public async Task<List<QuestionGroupSnapshotDto>> GetByListIdAsync(List<int> questionGroupIds)
		{
			return await _context.QuestionGroups
				.Include(qg => qg.Questions)
					.ThenInclude(q => q.Options)
				.Where(qg => questionGroupIds.Contains(qg.QuestionGroupId) && qg.Status == CommonStatus.Active)
				.Select(qg => new QuestionGroupSnapshotDto
				{
					QuestionGroupId = qg.QuestionGroupId,
					PartId = qg.PartId,
					Passage = qg.PassageContent,
					AudioUrl = qg.AudioUrl,
					ImageUrl = qg.ImageUrl,

					QuestionSnapshots = qg.Questions
						.Where(q => q.Status == CommonStatus.Active)
						.Select(q => new QuestionSnapshotDto
						{
							QuestionId = q.QuestionId,
							PartId = q.PartId,
							Content = q.Content,
							AudioUrl = q.AudioUrl,
							ImageUrl = q.ImageUrl,
							Explanation = q.Explanation,
							Options = q.Options
								.Where(o => o.Status == CommonStatus.Active)
								.Select(o => new OptionSnapshotDto
								{
									Label = o.Label,
									Content = o.Content,
									IsCorrect = o.IsCorrect
								}).ToList()
						}).ToList()
				})
				.ToListAsync();
		}

		public async Task<List<QuestionGroup>> GetRandomQuestionGroupsAsync(int partId, int? questionTypeId, int count)
		{
			var query = _context.QuestionGroups
				.Include(qg => qg.Questions)
					.ThenInclude(q => q.Options)
				.Include(qg => qg.Part)
				.Where(qg => qg.PartId == partId && qg.Status == CommonStatus.Active);

			// Filter by QuestionType if specified
			// Note: QuestionType is at Question level, not QuestionGroup level
			// So we check if the group contains questions of the specified type
			if (questionTypeId.HasValue)
			{
				query = query.Where(qg => qg.Questions.Any(q => q.QuestionTypeId == questionTypeId.Value));
			}

			// Random selection using OrderBy with Guid.NewGuid()
			return await query
				.OrderBy(qg => Guid.NewGuid())
				.Take(count)
				.ToListAsync();
		}
	}
}


