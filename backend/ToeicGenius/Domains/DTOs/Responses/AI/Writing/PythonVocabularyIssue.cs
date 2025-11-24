using System.Text.Json.Serialization;

namespace ToeicGenius.Domains.DTOs.Responses.AI.Writing
{
    public class PythonVocabularyIssue
    {
        [JsonPropertyName("word")]
        public string Word { get; set; }

        [JsonPropertyName("better")]
        public string Better { get; set; }

        [JsonPropertyName("example")]
        public string Example { get; set; }
    }
}
