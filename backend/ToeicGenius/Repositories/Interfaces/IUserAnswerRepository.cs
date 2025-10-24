using ToeicGenius.Domains.Entities;

namespace ToeicGenius.Repositories.Interfaces
{
	public interface IUserAnswerRepository : IBaseRepository<UserAnswer, int>
	{
        Task<UserAnswer?> GetByTestResultAndTestQuestionAsync(int testResultId, int testQuestionId);
    }
}


