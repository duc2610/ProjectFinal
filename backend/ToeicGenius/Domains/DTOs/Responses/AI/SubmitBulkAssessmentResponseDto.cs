using System.Collections.Generic;
using ToeicGenius.Domains.Enums;

namespace ToeicGenius.Domains.DTOs.Responses.AI
{
    public class SubmitBulkAssessmentResponseDto
    {
        // Aggregated skill scores
        public double? WritingScore { get; set; }
        public double? SpeakingScore { get; set; }
        public double TotalScore { get; set; }

        public List<PerPartAssessmentFeedbackDto> PerPartFeedbacks { get; set; } = new();
    }
}
