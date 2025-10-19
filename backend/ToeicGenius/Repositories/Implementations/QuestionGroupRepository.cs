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
					Questions = g.Questions.Select(q => new SingleQuestionDto
					{
						QuestionId = q.QuestionId,
						QuestionTypeId = q.QuestionTypeId,
						QuestionTypeName = q.QuestionType.TypeName,
						PartId = q.PartId,
						PartName = g.Part.Name ?? "",
						Content = q.Content,
						Options = q.Options.Select(o => new OptionDto
						{
							OptionId = o.OptionId,
							Content = o.Content ?? "",
							Label = o.Label ?? "",
							IsCorrect = o.IsCorrect
						}).ToList(),
						Solution = q.Explanation,
						Status = q.Status
					}).ToList(),
				})
				.FirstOrDefaultAsync();

			return group;
		}
		public async Task<PaginationResponse<QuestionGroupListItemDto>> FilterGroupsAsync(int? part, string? keyWord, int? skill, int page, int pageSize, CommonStatus status)
		{
			var query = _context.QuestionGroups.Where(g => g.Status == status).AsQueryable();

			// Lọc theo part
			if (part.HasValue)
				query = query.Where(g => g.PartId == part.Value);
			if (!string.IsNullOrEmpty(keyWord))
				query = query.Where(g => g.PassageContent.ToLower().Contains(keyWord.ToLower()));
			if (skill.HasValue)
				query = query.Where(g => g.Part.Skill == (QuestionSkill)skill);

			var totalCount = await query.CountAsync();

			var data = await query
				.OrderByDescending(q => q.QuestionGroupId)
				.Skip((page - 1) * pageSize)
				.Take(pageSize)
				.Select(g => new QuestionGroupListItemDto
				{
					QuestionGroupId = g.QuestionGroupId,
					PartId = g.PartId,
					PartName = g.Part.Name ?? "",
					Skill = g.Part.Skill,
					AudioUrl = g.AudioUrl,
					ImageUrl = g.ImageUrl,
					PassageContent = g.PassageContent,
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
	}
}


