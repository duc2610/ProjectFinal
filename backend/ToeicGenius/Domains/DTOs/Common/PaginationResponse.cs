namespace ToeicGenius.Domains.DTOs.Common
{
	public class PaginationResponse<T>
	{
		public IEnumerable<T> DataPaginated { get; set; }
		public int CurrentPage { get; set; }
		public int PageSize { get; set; }
		public int TotalCount { get; set; }
		public int TotalPages { get; set; }
		public bool HasNextPage { get; set; }
		public bool HasPreviousPage { get; set; }
		public PaginationResponse(IEnumerable<T> data, int totalCount, int currentPage, int pageSize)
		{
			TotalCount = totalCount;
			PageSize = pageSize;
			CurrentPage = currentPage;
			DataPaginated = data;

			TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
			HasPreviousPage = currentPage > 1;
			HasNextPage = currentPage < TotalPages;
		}
	}
}
