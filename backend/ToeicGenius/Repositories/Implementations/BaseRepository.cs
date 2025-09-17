using Microsoft.EntityFrameworkCore;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Repositories.Persistence;

namespace ToeicGenius.Repositories.Implementations
{
	public class BaseRepository<T, TKey> : IBaseRepository<T, TKey> where T : class
	{
		protected readonly ToeicGeniusDbContext _context;
		protected readonly DbSet<T> _dbSet;

		public BaseRepository(ToeicGeniusDbContext context)
		{
			_context = context;
			_dbSet = context.Set<T>();
		}
		public async Task<T> AddAsync(T entity)
		{
			await _dbSet.AddAsync(entity);
			return entity;
		}

		public async Task DeleteAsync(T entity)
		{
			_dbSet.Remove(entity);
		}

		public async Task<IEnumerable<T>> GetAllAsync()
		{
			return await _dbSet.ToListAsync();
		}

		public async Task<T?> GetByIdAsync(TKey id)
		{
			return await _dbSet.FindAsync(id);
		}

		public async Task<int> SaveChangesAsync()
		{
			return await _context.SaveChangesAsync();
		}

		public async Task UpdateAsync(T entity)
		{
			_dbSet.Update(entity);
		}
	}
}
