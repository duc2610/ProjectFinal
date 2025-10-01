using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using ToeicGenius.Domains.DTOs.Responses.Question;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Repositories.Persistence;

namespace ToeicGenius.Repositories.Implementations
{
	public class QuestionRepository : BaseRepository<Question, int>, IQuestionRepository
	{
		public QuestionRepository(ToeicGeniusDbContext context) : base(context) { }

        public async Task<QuestionResponseDto?> GetQuestionResponseByIdAsync(int id)
        {
            var question = await _context.Questions
                .Include(q => q.Options)
                .Include(q => q.QuestionType)
                .Include(q => q.Part)
                .Include(q => q.QuestionGroup)
                .Where(q => q.QuestionId == id)
                .Select(q => new QuestionResponseDto
                {
                    QuestionId = q.QuestionId,
                    QuestionTypeId = q.QuestionTypeId,
                    QuestionTypeName = q.QuestionType.TypeName,
                    PartId = q.PartId,
                    PartName = q.Part.Name,
                    Content = q.Content,
                    Number = q.Number,
                    Options = q.Options.Select(o => new OptionDto
                    {
                        OptionId = o.OptionId,
                        Content = o.Content,
                        IsCorrect = o.IsCorrect
                    }).ToList(),
                    Answer = q.SolutionDetail.Explanation,
                    AudioUrl = q.AudioUrl,
                    ImangeUrl = q.ImageUrl,
                })
                .FirstOrDefaultAsync();

            return question;
        }
    }
}


