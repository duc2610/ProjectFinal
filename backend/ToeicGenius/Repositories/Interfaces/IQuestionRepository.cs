using System.Threading.Tasks;
using ToeicGenius.Domains.DTOs.Responses.Question;
using ToeicGenius.Domains.Entities;

namespace ToeicGenius.Repositories.Interfaces
{
	public interface IQuestionRepository : IBaseRepository<Question, int>
	{
        Task<QuestionResponseDto?> GetQuestionResponseByIdAsync(int id);
    }
}


