
using System.ComponentModel.DataAnnotations;
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
		public string? PassageType { get; set; }
		public int OrderIndex { get; set; }
		public List<UpdateQuestionDto> Questions { get; set; } = new List<UpdateQuestionDto>();
	}

	
}
