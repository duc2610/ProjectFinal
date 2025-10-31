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

			bool isDescending = request.SortOrder?.ToLower() == "desc";
			query = isDescending
				? query.OrderByDescending(t => t.CreatedAt)
				: query.OrderBy(t => t.CreatedAt);

			var data = await query
				.Skip((page - 1) * pageSize)
				.Take(pageSize)
				.Select(t => new TestListResponseDto
				{
					Id = t.TestId,
					TestType = t.TestType,
					TestSkill = t.TestSkill,
					Title = t.Title,
					QuestionQuantity = t.TotalQuestion,
					Duration = t.Duration,
					CreatedAt = t.CreatedAt,
					Status = t.Status,
					Version = t.Version,
					ParentTestId = t.ParentTestId
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
		public async Task<List<Test>> GetVersionsByParentIdAsync(int parentTestId)
		{
			// Gồm cả bản gốc (TestId == parentTestId)
			return await _context.Tests
				.Where(t => t.ParentTestId == parentTestId || t.TestId == parentTestId)
				.OrderByDescending(t => t.Version)
				.ToListAsync();
		}
		public async Task<int> GetNextVersionAsync(int parentTestId)
		{
			// Lấy tất cả version của test cùng "gia đình" (có cùng parent)
			var maxVersion = await _context.Tests
				.Where(t => t.ParentTestId == parentTestId || t.TestId == parentTestId)
				.MaxAsync(t => (int?)t.Version) ?? 1;

			return maxVersion + 1;
		}
		public async Task<int> GetTotalQuestionAsync(int testId)
		{
			return await _context.Tests
				.Where(t => t.TestId == testId)
				.Select(t => t.TotalQuestion)
				.FirstOrDefaultAsync();
		}
		

	}
}


