namespace ToeicGenius.Repositories.Interfaces
{
	// Interface định nghĩa các phương thức cơ bản
	public interface IBaseRepository<T, TKey> where T : class
	{
		// Lấy entity theo Id
		Task<T?> GetByIdAsync(TKey id);

		// Lấy tất cả entity
		Task<IEnumerable<T>> GetAllAsync();

		// Thêm entity vào context (chưa lưu)
		Task<T> AddAsync(T entity);

		// Cập nhật entity (chưa lưu)
		Task UpdateAsync(T entity);

		// Xóa entity (chưa lưu)
		Task DeleteAsync(T entity);

		// Lưu thay đổi vào DB (commit)
		Task<int> SaveChangesAsync();
	}
}
