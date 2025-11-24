using Microsoft.AspNetCore.Mvc;
using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Domains.Enums;

namespace ToeicGenius.Repositories.Interfaces
{
	public interface IPartRepository : IBaseRepository<Part, int>
	{
		Task<List<Part>> GetPartsBySkill(QuestionSkill questionSkill);
		Task<Dictionary<int, QuestionSkill>> GetSkillMapByIdsAsync(List<int> partIds);
	}
}


