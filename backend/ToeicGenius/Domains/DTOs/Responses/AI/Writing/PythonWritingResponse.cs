using System.Text.Json.Serialization;

namespace ToeicGenius.Domains.DTOs.Responses.AI.Writing
{
    public class PythonWritingResponse
    {
        [JsonPropertyName("text")]
        public string Text { get; set; }

        [JsonPropertyName("part_type")]
        public string PartType { get; set; }

        [JsonPropertyName("question_number")]
        public int QuestionNumber { get; set; }

        [JsonPropertyName("scores")]
        public PythonScoreBreakdown Scores { get; set; }

        [JsonPropertyName("detailed_analysis")]
        public PythonDetailedAnalysis DetailedAnalysis { get; set; }

        [JsonPropertyName("recommendations")]
        public List<string> Recommendations { get; set; }

        [JsonPropertyName("overall_score")]
        public int OverallScore { get; set; }

        [JsonPropertyName("timestamp")]
        public string Timestamp { get; set; }
    }
}
