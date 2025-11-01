using System.Text.Json.Serialization;

namespace ToeicGenius.Domains.DTOs.Responses.AI.Speaking
{
    public class PythonSpeakingResponse
    {
        [JsonPropertyName("transcription")]
        public string Transcription { get; set; }

        [JsonPropertyName("duration")]
        public double Duration { get; set; }

        [JsonPropertyName("scores")]
        public Dictionary<string, object> Scores { get; set; }

        [JsonPropertyName("detailed_analysis")]
        public Dictionary<string, object> DetailedAnalysis { get; set; }

        [JsonPropertyName("recommendations")]
        public List<string> Recommendations { get; set; }

        [JsonPropertyName("overall_score")]
        public int OverallScore { get; set; }

        [JsonPropertyName("question_type")]
        public string QuestionType { get; set; }

        [JsonPropertyName("question_number")]
        public int QuestionNumber { get; set; }

        [JsonPropertyName("timestamp")]
        public string Timestamp { get; set; }
    }
}
