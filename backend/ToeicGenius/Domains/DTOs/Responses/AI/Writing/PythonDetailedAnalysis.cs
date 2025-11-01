using System.Text.Json.Serialization;

namespace ToeicGenius.Domains.DTOs.Responses.AI.Writing
{
    public class PythonDetailedAnalysis
    {
        [JsonPropertyName("grammar_errors")]
        public List<PythonGrammarError> GrammarErrors { get; set; }

        [JsonPropertyName("vocabulary_issues")]
        public List<PythonVocabularyIssue> VocabularyIssues { get; set; }

        [JsonPropertyName("missing_points")]
        public List<string> MissingPoints { get; set; }

        [JsonPropertyName("matched_points")]
        public List<string> MatchedPoints { get; set; }

        [JsonPropertyName("corrected_text")]
        public string CorrectedText { get; set; }

        [JsonPropertyName("image_description")]
        public string ImageDescription { get; set; }

        [JsonPropertyName("opinion_support_issues")]
        public List<string> OpinionSupportIssues { get; set; }
    }
}
