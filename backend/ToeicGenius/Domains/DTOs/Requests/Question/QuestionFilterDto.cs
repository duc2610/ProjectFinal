using System.ComponentModel.DataAnnotations;

namespace ToeicGenius.Domains.DTOs.Requests.Question
{
	public class QuestionFilterDto
	{
		public int? partId { get; set; }
		public int? questionTypeId { get; set; }
		public int? skill { get; set; }

		[Required]
		public int page { get; set; }
		[Required]
		public int pageSize { get; set; }
	}
}
