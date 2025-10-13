using ToeicGenius.Domains.Entities;
using ToeicGenius.Domains.Enums;

namespace ToeicGenius.Repositories.Interfaces
{
	public interface IQuestionTypeRepository : IBaseRepository<QuestionType, int>
	{
		Task<List<QuestionType>> GetQuestionTypeByTestSkill(int partId);
	}
}


