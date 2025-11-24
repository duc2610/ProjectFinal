namespace ToeicGenius.Shared.Wrappers
{
	public class PagedResponse<T>
	{
		public List<T> Data { get; set; } = new();
		public int PageNumber { get; set; }
		public int PageSize { get; set; }
		public int TotalRecords { get; set; }
		public int TotalPages => (int)Math.Ceiling((double)TotalRecords / PageSize);
		public bool HasPreviousPage => PageNumber > 1;
		public bool HasNextPage => PageNumber < TotalPages;

		public PagedResponse(List<T> data, int pageNumber, int pageSize, int totalRecords)
		{
			Data = data;
			PageNumber = pageNumber;
			PageSize = pageSize;
			TotalRecords = totalRecords;
		}
	}
}
