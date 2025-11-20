using ToeicGenius.Domains.Entities;

namespace ToeicGenius.Repositories.Interfaces
{
	public interface IOptionRepository : IBaseRepository<Option, int>
	{
		Task<List<Option>> GetOptionsByQuestionIdAsync(int questionId);
		void RemoveRange(IEnumerable<Option> options);
	}
}


