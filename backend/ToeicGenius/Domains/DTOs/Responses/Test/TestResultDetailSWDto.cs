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
