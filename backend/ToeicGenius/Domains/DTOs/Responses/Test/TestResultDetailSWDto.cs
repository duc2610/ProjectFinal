using System.Collections.Generic;
using ToeicGenius.Domains.DTOs.Responses.AI;
using ToeicGenius.Domains.Enums;

namespace ToeicGenius.Domains.DTOs.Responses.Test
{
    /// <summary>
    /// Response DTO for Speaking/Writing test result detail (used by /tests/result/detail endpoint)
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

        // Aggregated skill scores
        public double? WritingScore { get; set; }
        public double? SpeakingScore { get; set; }
        public double TotalScore { get; set; }

        // Test result metadata
        public bool? IsSelectTime { get; set; }
        public TestResultStatus? Status { get; set; }

        // Feedbacks with question content
        public List<PerPartAssessmentFeedbackDto> PerPartFeedbacks { get; set; } = new();
    }
}
