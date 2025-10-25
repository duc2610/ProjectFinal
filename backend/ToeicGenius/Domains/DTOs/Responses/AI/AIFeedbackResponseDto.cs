namespace ToeicGenius.Domains.DTOs.Responses.AI
{
    public class AIFeedbackResponseDto
    {
        public int FeedbackId { get; set; }
        public int? UserAnswerId { get; set; }
        public decimal Score { get; set; }
        public string Content { get; set; }
        public string AIScorer { get; set; }

        // Detailed breakdown
        public Dictionary<string, object> DetailedScores { get; set; }
        public Dictionary<string, object> DetailedAnalysis { get; set; }
        public List<string> Recommendations { get; set; }

        // Additional info
        public string Transcription { get; set; }
        public string CorrectedText { get; set; }
        public double? AudioDuration { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
