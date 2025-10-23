namespace ToeicGenius.Domains.DTOs.Responses.AI
{
    public class FeedbackHistoryDto
    {
        public int FeedbackId { get; set; }
        public int QuestionNumber { get; set; }
        public string? QuestionType { get; set; }
        public decimal Score { get; set; }
        public string? Summary { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
