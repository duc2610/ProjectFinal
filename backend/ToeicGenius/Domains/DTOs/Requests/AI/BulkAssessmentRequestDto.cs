using Microsoft.AspNetCore.Http;

namespace ToeicGenius.Domains.DTOs.Requests.AI
{
    /// <summary>
    /// Request for bulk assessment - User submits all answers at once
    /// </summary>
    public class BulkAssessmentRequestDto
    {
        public int TestResultId { get; set; }

        /// <summary>
        /// Writing answers (optional - if user chose to do Writing)
        /// </summary>
        public List<WritingAnswerDto>? WritingAnswers { get; set; }

        /// <summary>
        /// Speaking answers (optional - if user chose to do Speaking)
        /// </summary>
        public List<SpeakingAnswerDto>? SpeakingAnswers { get; set; }
    }

    public class WritingAnswerDto
    {
        /// <summary>
        /// Part number (1, 2, 3)
        /// </summary>
        public int PartNumber { get; set; }

        /// <summary>
        /// TestQuestion ID
        /// </summary>
        public int TestQuestionId { get; set; }

        /// <summary>
        /// User's written answer
        /// </summary>
        public string Text { get; set; } = string.Empty;
    }

    public class SpeakingAnswerDto
    {
        /// <summary>
        /// Part number (1, 2, 3, 4, 5)
        /// </summary>
        public int PartNumber { get; set; }

        /// <summary>
        /// TestQuestion ID
        /// </summary>
        public int TestQuestionId { get; set; }

        /// <summary>
        /// Audio file
        /// </summary>
        public IFormFile AudioFile { get; set; } = null!;
    }
}
