namespace ToeicGenius.Domains.DTOs.Responses.QuestionGroup
{
	public class GroupQuestionItemDto
	{
		public string Content { get; set; } = string.Empty;
		public List<string> Options { get; set; } = new();
		public string? Explanation { get; set; }
	}
}
