using ToeicGenius.Domains.DTOs.Responses.Question;
using ToeicGenius.Domains.DTOs.Responses.QuestionGroup;
using ToeicGenius.Domains.Entities;

namespace ToeicGenius.Extensions
{
	public static class QuestionMappingExtensions
	{
		/// <summary>
		/// Maps a Question entity to QuestionSnapshotDto
		/// </summary>
		public static QuestionSnapshotDto ToSnapshotDto(this Question question)
		{
			return new QuestionSnapshotDto
			{
				QuestionId = question.QuestionId,
				PartId = question.PartId,
				Content = question.Content ?? string.Empty,
				AudioUrl = question.AudioUrl,
				ImageUrl = question.ImageUrl,
				Explanation = question.Explanation,
				Options = question.Options?.Select(o => o.ToSnapshotDto()).ToList() ?? new List<OptionSnapshotDto>()
			};
		}

		/// <summary>
		/// Maps an Option entity to OptionSnapshotDto
		/// </summary>
		public static OptionSnapshotDto ToSnapshotDto(this Option option)
		{
			return new OptionSnapshotDto
			{
				Label = option.Label ?? string.Empty,
				Content = option.Content ?? string.Empty,
				IsCorrect = option.IsCorrect
			};
		}

		/// <summary>
		/// Maps a QuestionGroup entity to QuestionGroupSnapshotDto
		/// </summary>
		public static QuestionGroupSnapshotDto ToSnapshotDto(this QuestionGroup questionGroup)
		{
			return new QuestionGroupSnapshotDto
			{
				QuestionGroupId = questionGroup.QuestionGroupId,
				PartId = questionGroup.PartId,
				Passage = questionGroup.PassageContent ?? string.Empty,
				AudioUrl = questionGroup.AudioUrl,
				ImageUrl = questionGroup.ImageUrl,
				QuestionSnapshots = questionGroup.Questions?.Select(q => q.ToSnapshotDto()).ToList() ?? new List<QuestionSnapshotDto>()
			};
		}
	}
}
