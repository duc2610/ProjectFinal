using Newtonsoft.Json;
using System.Text.RegularExpressions;
using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.DTOs.Requests.Exam;
using ToeicGenius.Domains.DTOs.Responses.Question;
using ToeicGenius.Domains.DTOs.Responses.Test;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Domains.Enums;

namespace ToeicGenius.Shared.Validators
{
	public static class TestValidator
	{
		public static void ValidateTestStructure(CreateTestManualDto dto)
		{
			var total = dto.Parts.Sum(p => (p.Questions?.Count ?? 0) + (p.Groups?.Sum(g => g.Questions.Count) ?? 0));
			switch (dto.TestSkill)
			{
				case TestSkill.LR:
					foreach (var part in dto.Parts)
					{
						foreach (var group in part.Groups ?? [])
						{
							if (group.Questions.Count < 2 || group.Questions.Count > 5)
								throw new Exception($"Group in part {part.PartId} must have 2–5 questions");
						}

						foreach (var q in part.Questions ?? [])
						{
							if (part.PartId == 2 && q.Options.Count != 3)
								throw new Exception("Part 2 must have exactly 3 options");
							else if (part.PartId != 2 && q.Options.Count != 4)
								throw new Exception($"Part {part.PartId} must have exactly 4 options");
						}
					}
					if (total != 200)
						throw new Exception("L&R must have exactly 200 questions");
					break;
				case TestSkill.Speaking:
					if (total != 11)
						throw new Exception("Speaking must have exactly 11 questions");
					break;
				case TestSkill.Writing:
					if (total != 8)
						throw new Exception("Writing must have exactly 8 questions");
					break;
			}


		}
	}
}
