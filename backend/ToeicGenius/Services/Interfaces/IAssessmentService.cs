using ToeicGenius.Domains.DTOs.Requests.AI;
using ToeicGenius.Domains.DTOs.Requests.AI.Speaking;
using ToeicGenius.Domains.DTOs.Requests.AI.Writing;
using ToeicGenius.Domains.DTOs.Responses.AI;

namespace ToeicGenius.Services.Interfaces
{
    public interface IAssessmentService
    {
        // Bulk Assessment (NEW - Submit all at once)
        Task<BulkAssessmentResponseDto> BulkAssessAsync(BulkAssessmentRequestDto request, Guid userId);

        // Writing (Individual - for backward compatibility)
        Task<AIFeedbackResponseDto> AssessWritingSentenceAsync(WritingSentenceRequestDto request, Guid userId);
        Task<AIFeedbackResponseDto> AssessWritingEmailAsync(WritingEmailRequestDto request, Guid userId);
        Task<AIFeedbackResponseDto> AssessWritingEssayAsync(WritingEssayRequestDto request, Guid userId);

        // Speaking (Individual - for backward compatibility)
        Task<AIFeedbackResponseDto> AssessSpeakingAsync(SpeakingAssessmentRequestDto request, string taskType, Guid userId);

        // Queries
        Task<AIFeedbackResponseDto> GetFeedbackAsync(int feedbackId, Guid userId);
        Task<List<AIFeedbackResponseDto>> GetUserHistoryAsync(Guid userId, string? aiScorer);

        // Health checks
        Task<bool> CheckWritingApiHealthAsync();
        Task<bool> CheckSpeakingApiHealthAsync();
    }
}