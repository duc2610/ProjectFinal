using Microsoft.EntityFrameworkCore;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Domains.Enums;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Repositories.Persistence;
using static ToeicGenius.Shared.Helpers.DateTimeHelper;

namespace ToeicGenius.Repositories.Implementations
{
	public class QuestionReportRepository : BaseRepository<QuestionReport, int>, IQuestionReportRepository
	{
		public QuestionReportRepository(ToeicGeniusDbContext context) : base(context) { }

		public async Task<QuestionReport> CreateReportAsync(QuestionReport report)
		{
			report.CreatedAt = Now;
			await _context.QuestionReports.AddAsync(report);
			await _context.SaveChangesAsync();
			return report;
		}

		public async Task<QuestionReport?> GetReportByIdAsync(int reportId)
		{
			return await _context.QuestionReports
				.Include(r => r.TestQuestion)
					.ThenInclude(tq => tq.Part)
				.Include(r => r.Reporter)
				.Include(r => r.Reviewer)
				.FirstOrDefaultAsync(r => r.ReportId == reportId);
		}

		public async Task<List<QuestionReport>> GetReportsAsync(
			ReportStatus? status = null,
			int? testQuestionId = null,
			Guid? reportedBy = null,
			int skip = 0,
			int take = 20)
		{
			var query = _context.QuestionReports
				.Include(r => r.TestQuestion)
					.ThenInclude(tq => tq.Part)
				.Include(r => r.Reporter)
				.Include(r => r.Reviewer)
				.AsQueryable();

			// Apply filters
			if (status.HasValue)
				query = query.Where(r => r.Status == status.Value);

			if (testQuestionId.HasValue)
				query = query.Where(r => r.TestQuestionId == testQuestionId.Value);

			if (reportedBy.HasValue)
				query = query.Where(r => r.ReportedBy == reportedBy.Value);

			return await query
				.OrderByDescending(r => r.CreatedAt)
				.Skip(skip)
				.Take(take)
				.ToListAsync();
		}

		public async Task<int> GetReportsCountAsync(
			ReportStatus? status = null,
			int? testQuestionId = null,
			Guid? reportedBy = null)
		{
			var query = _context.QuestionReports.AsQueryable();

			if (status.HasValue)
				query = query.Where(r => r.Status == status.Value);

			if (testQuestionId.HasValue)
				query = query.Where(r => r.TestQuestionId == testQuestionId.Value);

			if (reportedBy.HasValue)
				query = query.Where(r => r.ReportedBy == reportedBy.Value);

			return await query.CountAsync();
		}

		public async Task<QuestionReport> UpdateReportAsync(QuestionReport report)
		{
			_context.QuestionReports.Update(report);
			await _context.SaveChangesAsync();
			return report;
		}

		public async Task<bool> HasUserReportedQuestionAsync(int testQuestionId, Guid userId)
		{
			return await _context.QuestionReports
				.AnyAsync(r => r.TestQuestionId == testQuestionId && r.ReportedBy == userId);
		}

		public async Task<int> GetPendingReportsCountAsync()
		{
			return await _context.QuestionReports
				.CountAsync(r => r.Status == ReportStatus.Pending);
		}
	}
}
