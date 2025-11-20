using System;
using System.Collections.Generic;

namespace ToeicGenius.Domains.DTOs.Responses.AI
{
    public class PerPartAssessmentFeedbackDto
    {
        public int TestQuestionId { get; set; }
        public int FeedbackId { get; set; }
        public int UserAnswerId { get; set; }

        // User's original answer
        public string? AnswerText { get; set; }
        public string? AnswerAudioUrl { get; set; }

        public double Score { get; set; }
        public string Content { get; set; } = string.Empty;
        public string AIScorer { get; set; } = string.Empty;
        public Dictionary<string, object> DetailedScores { get; set; } = new();
        public Dictionary<string, object> DetailedAnalysis { get; set; } = new();
        public List<string> Recommendations { get; set; } = new();
        public string Transcription { get; set; } = string.Empty;
        public string CorrectedText { get; set; } = string.Empty;
        public double? AudioDuration { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
