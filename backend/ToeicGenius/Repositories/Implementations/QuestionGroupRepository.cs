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
					PartName = g.Part.Name,
					AudioUrl = g.AudioUrl,
					Image = g.ImageUrl,
					PassageContent = g.PassageContent,
					PassageType = g.PassageType,
					OrderIndex = g.OrderIndex,
					Status = g.Status,
					Questions = g.Questions.Select(q => new QuestionResponseDto
					{
						QuestionId = q.QuestionId,
						QuestionTypeId = q.QuestionTypeId,
						QuestionTypeName = q.QuestionType.TypeName,
						PartId = q.PartId,
						PartName = g.Part.Name,
						Content = q.Content,
						Number = q.Number,
						Options = q.Options.Select(o => new OptionDto
						{
							OptionId = o.OptionId,
							Content = o.Content,
							IsCorrect = o.IsCorrect
						}).ToList(),
						Solution = q.Explanation,
						ImageUrl = null,
						AudioUrl = null,
						Status = q.Status
					}).ToList(),
				})
				.FirstOrDefaultAsync();

			return group;
		}
		public async Task<PaginationResponse<QuestionGroupListItemDto>> FilterGroupsAsync(int? part, int page, int pageSize)
		{
			var query = _context.QuestionGroups.AsQueryable();

			// Lọc theo part
			if (part.HasValue)
				query = query.Where(g => g.PartId == part.Value);

			var totalCount = await query.CountAsync();

			var data = await query
				.Where(g => g.Status == CommonStatus.Active)
				.OrderBy(q => q.QuestionGroupId)
				.Skip((page - 1) * pageSize)
				.Take(pageSize)
				.Select(g => new QuestionGroupListItemDto
				{
					QuestionGroupId = g.QuestionGroupId,
					PartId = g.PartId,
					PartName = g.Part.Name,
					AudioUrl = g.AudioUrl,
					Image = g.ImageUrl,
					PassageContent = g.PassageContent,
					PassageType = g.PassageType,
					OrderIndex = g.OrderIndex,
					QuestionCount = g.Questions.Count(),
					Status = g.Status,
				})
				.ToListAsync();

			return new PaginationResponse<QuestionGroupListItemDto>(data, totalCount, page, pageSize);
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
	}
}


