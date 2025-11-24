using System.Collections.Generic;

namespace ToeicGenius.Domains.DTOs.Requests.AI
{
    public class SubmitBulkAssessmentRequestDto
    {
        // The TestResultId previously returned when starting the test
        public int TestResultId { get; set; }

        // Duration (seconds) used for the test submission
        public int Duration { get; set; }

        // Test type: Simulator or Practice
        public string? TestType { get; set; }

        // List of parts (writing/speaking) to assess
        public List<BulkAssessmentPartDto>? Parts { get; set; }
    }
}
