using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.DTOs.Responses.Question;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Domains.Enums;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Repositories.Persistence;

namespace ToeicGenius.Repositories.Implementations
{
	public class QuestionRepository : BaseRepository<Question, int>, IQuestionRepository
	{
		public QuestionRepository(ToeicGeniusDbContext context) : base(context) { }

		public async Task<QuestionResponseDto?> GetQuestionResponseByIdAsync(int id)
		{
			var question = await _context.Questions
				.Include(q => q.Options)
				.Include(q => q.QuestionType)
				.Include(q => q.Part)
				.Include(q => q.QuestionGroup)
				.Where(q => q.QuestionId == id)
				.Select(q => new QuestionResponseDto
				{
					QuestionId = q.QuestionId,
					QuestionTypeId = q.QuestionTypeId,
					QuestionTypeName = q.QuestionType.TypeName,
					PartId = q.PartId,
					PartName = q.Part.Name ?? "",
					Content = q.Content,

					// Only take ACTIVE options
					Options = q.Options
						.Where(o => o.Status == CommonStatus.Active)
						.Select(o => new OptionDto
						{
							OptionId = o.OptionId,
							Content = o.Content ?? "",
							IsCorrect = o.IsCorrect
						})
						.ToList(),

					Solution = q.Explanation,
					AudioUrl = q.AudioUrl,
					ImageUrl = q.ImageUrl,
					Status = q.Status
				})
				.FirstOrDefaultAsync();

			return question;
		}


		public async Task<PaginationResponse<QuestionResponseDto>> FilterQuestionsAsync(
			int? partId, int? questionTypeId, string? keyWord, int? skill, int page, int pageSize, CommonStatus status)
		{
			var query = _context.Questions
				.Include(q => q.Part)
				.Include(q => q.QuestionType)
				.Include(q => q.Options)
				.Where(g => g.Status == status && g.QuestionGroupId == null)
				.AsQueryable();

			if (partId.HasValue)
				query = query.Where(q => q.PartId == partId);

			if (questionTypeId.HasValue)
				query = query.Where(q => q.QuestionTypeId == questionTypeId);

			if (skill.HasValue)
			{
				query = query.Where(q => q.Part.Skill == (QuestionSkill)skill);
			}

			if (!string.IsNullOrEmpty(keyWord))
			{
				query = query.Where(q => q.Content.ToLower().Contains(keyWord.ToLower()));
			}

			var totalCount = await query.CountAsync();

			var data = await query
				.OrderByDescending(q => q.QuestionId)
				.Skip((page - 1) * pageSize)
				.Take(pageSize)
				.Select(q => new QuestionResponseDto
				{
					QuestionId = q.QuestionId,
					QuestionTypeName = q.QuestionType.TypeName,
					PartName = q.Part.Name ?? "",
					Content = q.Content,
					Status = q.Status
				})
				.ToListAsync();

			return new PaginationResponse<QuestionResponseDto>(data, totalCount, page, pageSize);
		}

		public async Task<List<Question>> GetQuestionsByGroupIdAsync(int groupId)
		{
			return await _context.Questions
				.Where(q => q.QuestionGroupId == groupId)
				.ToListAsync();
		}

		public async Task<Question> GetQuestionByIdAndStatus(int questionId, CommonStatus status)
		{
			return await _context.Questions
								.Include(x => x.Options)
								.Where(x => x.QuestionId == questionId && x.Status == status)
								.FirstOrDefaultAsync();
		}
		public async Task<List<QuestionSnapshotDto>> GetByListIdAsync(List<int> questionIds)
		{
			return await _context.Questions
				.AsNoTracking()
				.Where(q => questionIds.Contains(q.QuestionId) && q.Status == CommonStatus.Active)
				.Select(q => new QuestionSnapshotDto
				{
					QuestionId = q.QuestionId,
					Content = q.Content,
					AudioUrl = q.AudioUrl,
					ImageUrl = q.ImageUrl,
					PartId = q.PartId,
					Explanation = q.Explanation,
					Options = q.Options.Select(o => new OptionSnapshotDto
					{
						Label = o.Label,
						Content = o.Content,
						IsCorrect = o.IsCorrect,
					}).ToList()
				})
				.ToListAsync();
		}
		
		public async Task<PaginationResponse<QuestionListItemDto>> FilterSingleAsync(int? partId, int? questionTypeId, string? keyWord, int? skill, string sortOrder, int page, int pageSize, CommonStatus status)
		{
			var query = _context.Questions
				.Include(q => q.Part)
				.Include(q => q.QuestionType)
				.Where(q => q.Status == status && q.QuestionGroupId == null)
				.AsQueryable();

			if (partId.HasValue)
				query = query.Where(q => q.PartId == partId);

			if (questionTypeId.HasValue)
				query = query.Where(q => q.QuestionTypeId == questionTypeId);

			if (skill.HasValue)
				query = query.Where(q => q.Part.Skill == (QuestionSkill)skill);

			if (!string.IsNullOrEmpty(keyWord))
				query = query.Where(q => q.Content.ToLower().Contains(keyWord.ToLower()));

			var data = await query
				.Select(q => new QuestionListItemDto
				{
					Id = q.QuestionId,
					IsGroupQuestion = false,
					PartName = q.Part.Name,
					PartId = q.PartId,
					Skill = q.Part.Skill,
					QuestionCount = 1,
					Content = q.Content,
					Status = q.Status,
					CreatedAt = q.CreatedAt
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
		

		public async Task<List<Question>> GetByPartIdAsync(int partId)
		{
			return await _context.Questions
				.Include(q => q.Part)
				.Include(q => q.QuestionType)
				.Include(q => q.Options)
				.Where(q => q.PartId == partId && q.Status == CommonStatus.Active && q.QuestionGroupId == null)
				.OrderBy(q => q.QuestionId)
				.ToListAsync();
		}

		public async Task<List<Question>> GetRandomQuestionsAsync(int partId, int? questionTypeId, int count)
		{
			var query = _context.Questions
				.Include(q => q.Part)
				.Include(q => q.QuestionType)
				.Include(q => q.Options)
				.Where(q => q.PartId == partId
					&& q.Status == CommonStatus.Active
					&& q.QuestionGroupId == null);

			// Filter by QuestionType if specified
			if (questionTypeId.HasValue)
			{
				query = query.Where(q => q.QuestionTypeId == questionTypeId.Value);
			}

			// Random selection using OrderBy with Guid.NewGuid()
			return await query
				.OrderBy(q => Guid.NewGuid())
				.Take(count)
				.ToListAsync();
		}
	}
}


