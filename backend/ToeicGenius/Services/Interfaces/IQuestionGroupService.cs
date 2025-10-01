using System.Collections.Generic;
using System.Threading.Tasks;
using ToeicGenius.Domains.DTOs.Responses.Question;
using ToeicGenius.Domains.DTOs.Responses.QuestionGroup;
using ToeicGenius.Domains.Entities;

namespace ToeicGenius.Services.Interfaces
{
    public interface IQuestionGroupService
    {
        Task<QuestionGroup> CreateAsync(QuestionGroup group);
		Task<QuestionGroupResponseDto?> GetQuestionGroupResponseByIdAsync(int id);

	}
}