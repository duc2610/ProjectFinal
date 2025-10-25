using System.Text.Json.Serialization;

namespace ToeicGenius.Domains.DTOs.Responses.AI.Writing
{
    public class PythonScoreBreakdown
    {
        [JsonPropertyName("word_count")]
        public int WordCount { get; set; }

        [JsonPropertyName("grammar")]
        public int Grammar { get; set; }

        [JsonPropertyName("vocabulary")]
        public int Vocabulary { get; set; }

        [JsonPropertyName("organization")]
        public int Organization { get; set; }

        [JsonPropertyName("relevance")]
        public int Relevance { get; set; }

        [JsonPropertyName("sentence_variety")]
        public int SentenceVariety { get; set; }

        [JsonPropertyName("opinion_support")]
        public int OpinionSupport { get; set; }

        [JsonPropertyName("overall")]
        public int Overall { get; set; }
    }
}
