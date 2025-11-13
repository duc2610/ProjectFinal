namespace ToeicGenius.Domains.DTOs.Responses.Test
{
    /// <summary>
    /// Represents a saved answer that user can resume
    /// </summary>
    public class SavedAnswerDto
    {
        public int TestQuestionId { get; set; }
        public string? ChosenOptionLabel { get; set; }
        public string? AnswerText { get; set; }
        public string? AnswerAudioUrl { get; set; }
        public int? SubQuestionIndex { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
