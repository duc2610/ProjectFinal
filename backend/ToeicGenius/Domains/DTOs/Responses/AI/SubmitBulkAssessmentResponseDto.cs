using System.Collections.Generic;
using ToeicGenius.Domains.Enums;

namespace ToeicGenius.Domains.DTOs.Responses.AI
{
    public class SubmitBulkAssessmentResponseDto
    {
        public int TestId { get; set; }
        public int TestResultId { get; set; }

        // Test type indicator
        public bool IsSimulator { get; set; }

        // TOEIC Scaled scores (0-200) - Only for Simulator mode
        public double? WritingScore { get; set; }
        public double? SpeakingScore { get; set; }
        public double TotalScore { get; set; }

        // Raw scores (0-100) - For Practice mode display
        public double? WritingRawScore { get; set; }
        public double? SpeakingRawScore { get; set; }

        // Question counts
        public int TotalQuestions { get; set; }
        public int AnsweredQuestions { get; set; }
        public int SkippedQuestions { get; set; }

        public List<PerPartAssessmentFeedbackDto> PerPartFeedbacks { get; set; } = new();
    }
}
