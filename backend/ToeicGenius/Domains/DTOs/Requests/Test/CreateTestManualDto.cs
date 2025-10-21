using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;
using ToeicGenius.Domains.DTOs.Requests.GroupQuestion;
using ToeicGenius.Domains.DTOs.Requests.Question;
using ToeicGenius.Domains.DTOs.Responses.Question;
using ToeicGenius.Domains.DTOs.Responses.QuestionGroup;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Domains.Enums;

namespace ToeicGenius.Domains.DTOs.Requests.Exam
{
	public class CreateTestManualDto
	{
		[Required]
		public string Title { get; set; }
		[Required]
		public TestType TestType { get; set; }
		[Required]
		public TestSkill TestSkill { get; set; }
		public string? Description { get; set; }
		public string? AudioUrl { get; set; } // Audio full (45') for listening   
		[Required]
		public List<PartDto> Parts { get; set; } = new();
	}
	public class PartDto
	{
		[Required] public int PartId { get; set; }
		public List<QuestionGroupDto>? Groups { get; set; }
		public List<QuestionDto>? Questions { get; set; }
	}

	public class QuestionGroupDto
	{
		public string? Passage { get; set; }
		public string? ImageUrl { get; set; }
		public List<QuestionDto> Questions { get; set; } = new();
	}

	public class QuestionDto
	{
		public string? Content { get; set; }
		public string? ImageUrl { get; set; }
		public List<OptionDto>? Options { get; set; } = new();
		public string? Explanation { get; set; }
	}

	public class OptionRequestDto
	{
		public string Label { get; set; } = string.Empty; // A, B, C, D
		public string? Content { get; set; }
		public bool IsCorrect { get; set; } = false;
	}
	public class TestBuildResult
	{
		public List<TestQuestion> Questions { get; set; } = new();
		public int NextOrder { get; set; }
	}
}
