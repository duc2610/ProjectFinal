using ToeicGenius.Shared.Constants;
using ToeicGenius.Domains.Enums;

namespace ToeicGenius.Domains.DTOs.Requests.User
{
	public class UserResquestDto
	{

		// Pagination
		public int Page { get; set; } = NumberConstants.DefaultFirstPage;
		public int PageSize { get; set; } = NumberConstants.DefaultPageSize;

		// Search
		public string? Keyword { get; set; }

		// Filter
		public string? Role { get; set; }
		public UserStatus? Status { get; set; } = UserStatus.Active;

		// Filter by time createdAt (optional)
		public DateTime? FromDate { get; set; }
		public DateTime? ToDate { get; set; }

		// Sort
		public string? SortBy { get; set; } = StringConstants.CreatedAt;
		public SortOrder SortOrder { get; set; } = SortOrder.Desc;
	}
}
