using System.Text.Json.Serialization;

namespace ToeicGenius.Domains.DTOs.Responses.AI.Writing
{
    public class PythonGrammarError
    {
        [JsonPropertyName("wrong")]
        public string Wrong { get; set; }

        [JsonPropertyName("correct")]
        public string Correct { get; set; }

        [JsonPropertyName("rule")]
        public string Rule { get; set; }

        [JsonPropertyName("severity")]
        public string Severity { get; set; }
    }
}
