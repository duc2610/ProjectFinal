namespace ToeicGenius.Domains.DTOs.Requests.Test
{
    /// <summary>
    /// DTO for saving test progress (auto-save during test)
    /// </summary>
    public class SaveProgressRequestDto
    {
        /// <summary>
        /// TestResult ID being saved
        /// </summary>
        public int TestResultId { get; set; }

        /// <summary>
        /// List of user answers to save/update
        /// </summary>
        public List<UserAnswerProgressDto> Answers { get; set; } = new();
    }

    public class UserAnswerProgressDto
    {
        /// <summary>
        /// TestQuestion ID
        /// </summary>
        public int TestQuestionId { get; set; }

        /// <summary>
        /// For Listening/Reading: chosen option (A/B/C/D)
        /// </summary>
        public string? ChosenOptionLabel { get; set; }

        /// <summary>
        /// For Writing: text answer
        /// </summary>
        public string? AnswerText { get; set; }

        /// <summary>
        /// For Speaking: audio file URL
        /// </summary>
        public string? AnswerAudioUrl { get; set; }

        /// <summary>
        /// For group questions: which sub-question (1,2,3...)
        /// </summary>
        public int? SubQuestionIndex { get; set; }
    }
}
