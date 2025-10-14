using ToeicGenius.Domains.Entities;

namespace ToeicGenius.Repositories.Interfaces
{
	// Interface định nghĩa các phương thức cơ bản
	public interface IBaseRepository<T, TKey> where T : class
	{
		Task<T?> GetByIdAsync(TKey id);

		Task<IEnumerable<T>> GetAllAsync();

		Task<T> AddAsync(T entity);

		Task<T> UpdateAsync(T entity);

		Task DeleteAsync(T entity);

		Task AddRangeAsync(IEnumerable<T> entities);
	}
}
