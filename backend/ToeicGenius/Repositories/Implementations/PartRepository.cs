using Microsoft.EntityFrameworkCore;
using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Domains.Enums;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Repositories.Persistence;

namespace ToeicGenius.Repositories.Implementations
{
	public class PartRepository : BaseRepository<Part, int>, IPartRepository
	{
		public PartRepository(ToeicGeniusDbContext context) : base(context) { }

		public async Task<List<Part>> GetPartsBySkill(QuestionSkill questionSkill)
		{
			var parts = await _context.Parts
				.Where(p => p.Skill == questionSkill)
				.ToListAsync();
			return parts;
		}

		public async Task<Dictionary<int, QuestionSkill>> GetSkillMapByIdsAsync(List<int> partIds)
		{
			return await _context.Parts
				.Where(p => partIds.Contains(p.PartId))
				.ToDictionaryAsync(p => p.PartId, p => p.Skill);
		}

	}
}


