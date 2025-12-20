using System.Collections.Generic;
using ToeicGenius.Domains.DTOs.Responses.AI;
using ToeicGenius.Domains.Enums;

namespace ToeicGenius.Domains.DTOs.Responses.Test
{
    /// <summary>
    /// Response DTO for Speaking/Writing test result detail (used by /tests/result/detail endpoint)
    /// Supports: S&W Simulator, Speaking Practice, Writing Practice
    /// </summary>
    public class TestResultDetailSWDto
    {
        // Test basic info
        public int TestResultId { get; set; }
        public int TestId { get; set; }
        public string Title { get; set; } = string.Empty;
        public TestType TestType { get; set; }
        public TestSkill TestSkill { get; set; }
        public int Duration { get; set; }
        public int TimeResuilt { get; set; }
        public int QuantityQuestion { get; set; }

        /// <summary>
        /// true = Simulator (TOEIC scale 0-200), false = Practice (raw score 0-100)
        /// </summary>
        public bool IsSimulator { get; set; }

        // TOEIC Scaled scores (0-200) - Only for Simulator mode
        public double? WritingScore { get; set; }
        public double? SpeakingScore { get; set; }

        /// <summary>
        /// Simulator: 0-400 (TOEIC scale), Practice: 0-100 (raw score)
        /// </summary>
        public double TotalScore { get; set; }

        // Raw scores (0-100) - For Practice mode display or reference
        public double? WritingRawScore { get; set; }
        public double? SpeakingRawScore { get; set; }

        // Question counts
        public int TotalQuestions { get; set; }
        public int AnsweredQuestions { get; set; }
        public int SkippedQuestions { get; set; }

        // Test result metadata
        public bool? IsSelectTime { get; set; }
        public TestResultStatus? Status { get; set; }

        // Feedbacks with question content (legacy - kept for backward compatibility)
        public List<PerPartAssessmentFeedbackDto> PerPartFeedbacks { get; set; } = new();

        // Parts with questions (similar to L&R structure)
        public List<TestPartDto> Parts { get; set; } = new();
    }
}
