namespace ToeicGenius.Domains.DTOs.Requests.Question
{
    public class UpdateQuestionDto
    {
        public int QuestionId { get; set; }
        public int QuestionTypeId { get; set; }
        public int PartId { get; set; }
        public string? Content { get; set; }
        public int Number { get; set; }
        public string? AudioUrl { get; set; }
        public string? ImageUrl { get; set; }
        // Thêm các trường khác nếu cần
    }
}