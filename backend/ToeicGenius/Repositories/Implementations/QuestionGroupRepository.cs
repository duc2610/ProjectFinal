using Microsoft.EntityFrameworkCore;
using ToeicGenius.Domains.DTOs.Responses.QuestionGroup;
using ToeicGenius.Domains.DTOs.Responses.Question;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Repositories.Persistence;

namespace ToeicGenius.Repositories.Implementations
{
	public class QuestionGroupRepository : BaseRepository<QuestionGroup, int>, IQuestionGroupRepository
	{
		public QuestionGroupRepository(ToeicGeniusDbContext context) : base(context) { }

        public async Task<QuestionGroupResponseDto?> GetGroupWithQuestionsAsync(int id)
        {
            var group = await _context.QuestionGroups
                .Include(g => g.Part)
                .Include(g => g.Questions)
                    .ThenInclude(q => q.QuestionType)
                .Include(g => g.Questions)
                    .ThenInclude(q => q.Options)
                .Include(g => g.Questions)
                    .ThenInclude(q => q.SolutionDetail)
                .Where(g => g.QuestionGroupId == id)
                .Select(g => new QuestionGroupResponseDto
                {
                    QuestionGroupId = g.QuestionGroupId,
                    PartId = g.PartId,
                    PartName = g.Part.Name,
                    GroupType = g.GroupType,
                    AudioUrl = g.AudioUrl,
                    Image = g.Image,
                    PassageContent = g.PassageContent,
                    PassageType = g.PassageType,
                    OrderIndex = g.OrderIndex,
                    Questions = g.Questions.Select(q => new QuestionResponseDto
                    {
                        QuestionId = q.QuestionId,
                        QuestionTypeId = q.QuestionTypeId,
                        QuestionTypeName = q.QuestionType.TypeName,
                        PartId = q.PartId,
                        PartName = g.Part.Name,
                        Content = q.Content,
                        Number = q.Number,
                        Options = q.Options.Select(o => new OptionDto
                        {
                            OptionId = o.OptionId,
                            Content = o.Content,
                            IsCorrect = o.IsCorrect
                        }).ToList(),
                        Solution = q.SolutionDetail.Explanation,
                        ImageUrl = null,
                        AudioUrl = null
                    }).ToList()
                })
                .FirstOrDefaultAsync();

            return group;
        }
		public async Task<List<QuestionGroupListItemDto>> FilterGroupsAsync(int? part)
		{
			var query =  _context.QuestionGroups.AsQueryable();

			if (part.HasValue)
				query = query.Where(g => g.PartId == part.Value);

			var result = await query
				.Select(g => new QuestionGroupListItemDto
				{
					QuestionGroupId = g.QuestionGroupId,
					PartId = g.PartId,
					PartName = g.Part.Name,
					GroupType = g.GroupType,
					AudioUrl = g.AudioUrl,
					Image = g.Image,
					PassageContent = g.PassageContent,
					PassageType = g.PassageType,
					OrderIndex = g.OrderIndex,
					QuestionCount = g.Questions.Count()
				})
				.ToListAsync();

			return result;
		}
	}
}


