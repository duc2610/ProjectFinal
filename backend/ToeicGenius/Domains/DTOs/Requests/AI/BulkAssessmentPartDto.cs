namespace ToeicGenius.Domains.DTOs.Requests.AI
{
    public class BulkAssessmentPartDto
    {
        /// <summary>
        /// TestQuestionId from TestQuestion table.
        /// - For single questions: Just one question (e.g., Part 1, 2, 5)
        /// - For group questions: One TestQuestionId represents a group (e.g., Speaking Part 3 Q5-Q7, Part 4 Q8-Q10)
        ///   In this case, send ONE audio for the entire group (all 3 questions answered together)
        /// </summary>
        public int TestQuestionId { get; set; }

        /// <summary>
        /// Part type:
        /// - Writing: writing_sentence, writing_email, writing_essay
        /// - Speaking: read_aloud, describe_picture, respond_questions, respond_with_info, express_opinion
        ///
        /// Note: For group questions (Part 3/4 with 3 questions), still use:
        /// - "respond_questions" for Part 3 (Questions 5-7)
        /// - "respond_with_info" for Part 4 (Questions 8-10)
        /// </summary>
        public string PartType { get; set; } = string.Empty;

        /// <summary>
        /// For writing parts only
        /// </summary>
        public string? AnswerText { get; set; }

        /// <summary>
        /// For speaking parts: client should upload audio first and provide URL here
        /// - Single question: 1 audio for 1 question
        /// - Group questions (Part 3/4): 1 audio for all 3 questions in the group
        /// </summary>
        public string? AudioFileUrl { get; set; }
    }
}
