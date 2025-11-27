
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ToeicGenius.Domains.DTOs.Requests.Question;
using ToeicGenius.Domains.Enums;

namespace ToeicGenius.Domains.DTOs.Requests.QuestionGroup
{
	public class UpdateQuestionGroupDto
	{
		[Required]
		public int QuestionGroupId { get; set; }
		[Required]
		public int PartId { get; set; }
		public IFormFile? Audio { get; set; }
		public IFormFile? Image { get; set; }
		public string? PassageContent { get; set; }

		[Required]
		public string? QuestionsJson { get; set; }

		[NotMapped]
		public List<UpdateSingleQuestionDto> Questions { get; set; } = new List<UpdateSingleQuestionDto>();
	}
	public class UpdateSingleQuestionDto
	{
		public int? QuestionId { get; set; } // null for new question
		public string? Content { get; set; }

		[Required(ErrorMessage = "Question Type ID is required.")]
		[Range(1, int.MaxValue, ErrorMessage = "Question Type ID must be a positive integer.")]
		public int QuestionTypeId { get; set; }

		[Required(ErrorMessage = "Part ID is required.")]
		[Range(1, int.MaxValue, ErrorMessage = "Part ID must be a positive integer.")]
		public int PartId { get; set; }
		public List<UpdateAnswerOptionDto>? AnswerOptions { get; set; }
		public string? Solution { get; set; }
	}

}
