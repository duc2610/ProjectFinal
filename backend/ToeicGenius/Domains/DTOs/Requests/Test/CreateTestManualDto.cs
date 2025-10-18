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
		public IFormFile? AudioUrl { get; set; } // Audio full (45') for listening   
		[Required]
		public List<ManualPartDto> Parts { get; set; } = new();
	}
	public class ManualPartDto
	{
		[Required] public int PartId { get; set; }
		public List<ManualQuestionGroupDto>? Groups { get; set; }
		public List<ManualQuestionDto>? Questions { get; set; }
	}

	public class ManualQuestionGroupDto
	{
		public string Passage { get; set; } = string.Empty;
		public IFormFile? AudioUrl { get; set; }
		public IFormFile? ImageUrl { get; set; }
		public List<ManualQuestionDto> Questions { get; set; } = new();
	}

	public class ManualQuestionDto
	{
		public string Content { get; set; } = string.Empty;
		public IFormFile? AudioUrl { get; set; }
		public IFormFile? ImageUrl { get; set; }
		public List<ManualOptionDto> Options { get; set; } = new();
		public string? Explanation { get; set; }
	}

	public class ManualOptionDto
	{
		public string Label { get; set; } = string.Empty; // A, B, C, D
		public string Content { get; set; } = string.Empty;
		public bool IsCorrect { get; set; } = false;
	}
}
