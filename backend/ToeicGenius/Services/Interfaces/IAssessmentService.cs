using ToeicGenius.Domains.DTOs.Requests.AI.Speaking;
using ToeicGenius.Domains.DTOs.Requests.AI.Writing;
using ToeicGenius.Domains.DTOs.Responses.AI;

namespace ToeicGenius.Services.Interfaces
{
    public interface IAssessmentService
    {
        Task<AIFeedbackResponseDto> AssessWritingSentenceAsync(WritingSentenceRequestDto request, Guid userId);
        Task<AIFeedbackResponseDto> AssessWritingEmailAsync(WritingEmailRequestDto request, Guid userId);
        Task<AIFeedbackResponseDto> AssessWritingEssayAsync(WritingEssayRequestDto request, Guid userId);
        Task<AIFeedbackResponseDto> AssessSpeakingAsync(SpeakingAssessmentRequestDto request, string questionType, Guid userId);
        Task<AIFeedbackResponseDto> GetFeedbackAsync(int feedbackId, Guid userId);
        Task<List<FeedbackHistoryDto>> GetUserHistoryAsync(Guid userId, string? aiScorer = null);
        Task<bool> CheckWritingApiHealthAsync();
        Task<bool> CheckSpeakingApiHealthAsync();
    }
}
