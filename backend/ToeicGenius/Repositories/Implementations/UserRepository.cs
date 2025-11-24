using Microsoft.EntityFrameworkCore;
using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.DTOs.Requests.User;
using ToeicGenius.Domains.DTOs.Responses.User;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Domains.Enums;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Repositories.Persistence;
using static ToeicGenius.Shared.Helpers.DateTimeHelper;

namespace ToeicGenius.Repositories.Implementations
{
	public class UserRepository : BaseRepository<User, Guid>, IUserRepository
	{

		public UserRepository(ToeicGeniusDbContext context) : base(context) { }

		public async Task<int> CountActiveUsersAsync()
		{
			return await _context.Users.CountAsync(u => u.Status == UserStatus.Active);
		}

		public async Task<int> CountBannedUsersAsync()
		{
			return await _context.Users.CountAsync(u => u.Status == UserStatus.Banned);
		}
		// Count new user this month
		public async Task<int> CountNewUsersThisMonthAsync()
		{
			var now = Today;
			var startOfMonth = new DateTime(now.Year, now.Month, 1);
			return await _context.Users.CountAsync(u => u.CreatedAt >= startOfMonth);
		}

		// Count new user this week
		public async Task<int> CountNewUsersThisWeekAsync()
		{
			var now = Today;
			var diff = (7 + (int)now.DayOfWeek - (int)DayOfWeek.Monday) % 7; // tuần bắt đầu từ Monday
			var startOfWeek = now.AddDays(-diff);
			return await _context.Users.CountAsync(u => u.CreatedAt >= startOfWeek);
		}

		public async Task<int> CountTotalUsersAsync()
		{
			return await _context.Users.CountAsync();
		}

		// Get user by Email
		public async Task<User?> GetByEmailAsync(string email)
		{
			return await _context.Users.Include(u => u.Roles).FirstOrDefaultAsync(u => u.Email == email);
		}

		// Get user by refreshToken
		public async Task<User?> GetByRefreshTokenAsync(string refreshToken)
		{
			return await _context.Users
				.Include(u => u.Roles)
				.Include(u => u.RefreshTokens) // load refresh tokens
				.FirstOrDefaultAsync(u => u.RefreshTokens.Any(rt => rt.Token == refreshToken));
		}

		public async Task<User?> GetUserAndRoleByUserIdAsync(Guid userId)
		{
			return await _context.Users.Include(u => u.Roles).FirstOrDefaultAsync(u => u.Id == userId);
		}

		public async Task<PaginationResponse<UserResponseDto>> GetUsersAsync(UserResquestDto request)
		{
			var query = _context.Users.AsQueryable();

			// Search
			if (!string.IsNullOrWhiteSpace(request.Keyword))
			{
				query = query.Where(u =>
					u.Email.Contains(request.Keyword) ||
					u.FullName.Contains(request.Keyword));
			}

			// Filter role 
			if (!string.IsNullOrEmpty(request.Role))
			{
				query = query.Where(u => u.Roles.Any(r => r.RoleName == request.Role));
			}

			// Filter status
			if (request.Status.HasValue)
			{
				query = query.Where(u => u.Status == request.Status.Value);
			}

			// Filter by date
			if (request.FromDate.HasValue)
			{
				query = query.Where(u => u.CreatedAt >= request.FromDate.Value);
			}

			if (request.ToDate.HasValue)
			{
				query = query.Where(u => u.CreatedAt <= request.ToDate.Value);
			}

			// Sort
			query = request.SortBy?.ToLower() switch
			{
				"fullname" => request.SortOrder == SortOrder.Asc
					? query.OrderBy(u => u.FullName)
					: query.OrderByDescending(u => u.FullName),

				"status" => request.SortOrder == SortOrder.Asc
					? query.OrderBy(u => u.Status)
					: query.OrderByDescending(u => u.Status),

				_ => request.SortOrder == SortOrder.Asc
					? query.OrderBy(u => u.CreatedAt)
					: query.OrderByDescending(u => u.CreatedAt),
			};

			var totalCount = await query.CountAsync();

			var users = await query
				.Skip((request.Page - 1) * request.PageSize)
				.Take(request.PageSize)
				.Select(u => new UserResponseDto
				{
					Id = u.Id,
					FullName = u.FullName,
					Email = u.Email,
					Status = u.Status,
					Roles = u.Roles.Select(r => r.RoleName).ToList(),
					CreatedAt = u.CreatedAt
				})
				.ToListAsync();

			return new PaginationResponse<UserResponseDto>(users, totalCount, request.Page, request.PageSize);
		}
	}
}
