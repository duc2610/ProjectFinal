using Microsoft.EntityFrameworkCore;
using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.DTOs.Requests.Test;
using ToeicGenius.Domains.DTOs.Responses.Test;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Domains.Enums;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Repositories.Persistence;
using ToeicGenius.Shared.Constants;

namespace ToeicGenius.Repositories.Implementations
{
	public class TestRepository : BaseRepository<Test, int>, ITestRepository
	{
		public TestRepository(ToeicGeniusDbContext context) : base(context) { }

		public async Task<PaginationResponse<TestListResponseDto>> FilterQuestionsAsync(TestFilterDto request)
		{
			var query = _context.Tests.AsQueryable();

			if (request.TestSkill.HasValue)
			{
				query = query.Where(t => t.TestSkill == request.TestSkill.Value);
			}

			if (request.TestType.HasValue)
			{
				query = query.Where(t => t.TestType == request.TestType.Value);
			}

			if (!string.IsNullOrEmpty(request.KeyWord))
			{
				query = query.Where(t => t.Title.ToLower().Contains(request.KeyWord.ToLower()));
			}
			if (request.Status.HasValue)
			{
				query = query.Where(t => t.Status == request.Status);
			}
			var page = request.page <= 0 ? NumberConstants.DefaultFirstPage : request.page;
			var pageSize = request.pageSize <= 0 ? NumberConstants.DefaultPageSize : request.pageSize;
			var totalRecords = await query.CountAsync();

			var data = await query
				.OrderBy(q => q.TestId)
				.Skip((page - 1) * pageSize)
				.Take(pageSize)
				.Select(t => new TestListResponseDto
				{
					Id = t.TestId,
					TestType = t.TestType,
					TestSkill = t.TestSkill,
					Title = t.Title,
					Description = t.Description,
					Duration = t.Duration,
					Status = t.Status
				})
				.ToListAsync();

			return new PaginationResponse<TestListResponseDto>(data, totalRecords, page, pageSize);
		}

		public async Task<Test> GetTestByIdAsync(int id)
		{
			return await _context.Tests.Include(t => t.TestQuestions)
										 .ThenInclude(tq => tq.Part)
										 .FirstOrDefaultAsync(t => t.TestId == id);
		}
	}
}


