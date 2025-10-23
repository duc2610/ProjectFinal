using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using ToeicGenius.Configurations;
using ToeicGenius.Domains.DTOs.Requests.AI.Speaking;
using ToeicGenius.Domains.DTOs.Requests.AI.Writing;
using ToeicGenius.Domains.DTOs.Responses;
using ToeicGenius.Domains.DTOs.Responses.AI.Speaking;
using ToeicGenius.Domains.DTOs.Responses.AI.Writing;
using ToeicGenius.Domains.DTOs.Responses.AI;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Services.Interfaces;

namespace ToeicGenius.Services.Implementations
{
    public class AssessmentService : IAssessmentService
    {
        private readonly HttpClient _writingHttpClient;
        private readonly HttpClient _speakingHttpClient;
        private readonly IUnitOfWork _uow;
        private readonly IAIFeedbackRepository _feedbackRepository;
        private readonly IFileService _fileService;
        private readonly ILogger<AssessmentService> _logger;
        private readonly string _writingApiUrl;
        private readonly string _speakingApiUrl;
        private readonly JsonSerializerOptions _jsonOptions;

        public AssessmentService(
            IHttpClientFactory httpClientFactory,
            IUnitOfWork uow,
            IAIFeedbackRepository feedbackRepository,
            IFileService fileService,
            IOptions<PythonApiSettings> settings,
            ILogger<AssessmentService> logger)
        {
            _writingHttpClient = httpClientFactory.CreateClient("WritingApi");
            _speakingHttpClient = httpClientFactory.CreateClient("SpeakingApi");
            _uow = uow;
            _feedbackRepository = feedbackRepository;
            _fileService = fileService;
            _logger = logger;
            _writingApiUrl = settings.Value.WritingApiUrl;
            _speakingApiUrl = settings.Value.SpeakingApiUrl;
            _jsonOptions = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };
        }

        #region WRITING ASSESSMENTS

        public async Task<AIFeedbackResponseDto> AssessWritingSentenceAsync(
            WritingSentenceRequestDto request,
            Guid userId)
        {
            try
            {
                _logger.LogInformation("📝 Writing Sentence - User: {UserId}, Q{Number}", userId, request.QuestionNumber);

                var question = await GetQuestionAsync(request.QuestionId, 8, request.QuestionNumber);
                if (question == null)
                    throw new Exception($"Question {request.QuestionNumber} not found");

                if (string.IsNullOrEmpty(question.ImageUrl))
                    throw new Exception($"Question {request.QuestionNumber} missing image");

                _logger.LogInformation("📝 Found Question - Id: {QuestionId}, HasImage: {HasImage}",
                    question.QuestionId, !string.IsNullOrEmpty(question.ImageUrl));

                var (userTest, userAnswer) = await CreateWritingUserAnswerAsync(userId, question.QuestionId, request.Text);

                var imageStream = await _fileService.DownloadFileAsync(question.ImageUrl);

                using var content = new MultipartFormDataContent();
                content.Add(new StringContent(request.Text), "text");
                content.Add(new StringContent(question.Content ?? ""), "question_content");
                content.Add(new StringContent(request.QuestionNumber.ToString()), "question_number");

                var imageContent = new StreamContent(imageStream);
                imageContent.Headers.ContentType = new MediaTypeHeaderValue("image/jpeg");
                content.Add(imageContent, "image", "question_image.jpg");

                _logger.LogInformation("🚀 Calling Python: {Url}/assess/sentence", _writingApiUrl);

                var response = await _writingHttpClient.PostAsync($"{_writingApiUrl}/assess/sentence", content);

                if (!response.IsSuccessStatusCode)
                {
                    var error = await response.Content.ReadAsStringAsync();
                    throw new Exception($"Python API error: {response.StatusCode} - {error}");
                }

                var jsonResponse = await response.Content.ReadAsStringAsync();
                var pythonResponse = JsonSerializer.Deserialize<PythonWritingResponse>(jsonResponse, _jsonOptions);

                var feedback = new AIFeedback
                {
                    UserAnswerId = userAnswer.UserAnswerId,
                    Score = pythonResponse!.OverallScore,
                    Content = GenerateContentSummary(pythonResponse),
                    AIScorer = "writing",
                    DetailedScoresJson = JsonSerializer.Serialize(pythonResponse.Scores, _jsonOptions),
                    DetailedAnalysisJson = JsonSerializer.Serialize(pythonResponse.DetailedAnalysis, _jsonOptions),
                    RecommendationsJson = JsonSerializer.Serialize(pythonResponse.Recommendations, _jsonOptions),
                    CorrectedText = pythonResponse.DetailedAnalysis?.CorrectedText,
                    PythonApiResponse = jsonResponse,
                    ImageFileUrl = question.ImageUrl,
                    CreatedAt = DateTime.UtcNow
                };

                await _feedbackRepository.CreateAsync(feedback);

                _logger.LogInformation("✅ Completed - FeedbackId: {Id}, Score: {Score}", feedback.FeedbackId, feedback.Score);

                return MapToResponseDto(feedback);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error Writing Sentence Q{Number} - Inner: {Inner}",
                    request.QuestionNumber, ex.InnerException?.Message ?? "None");
                throw;
            }
        }

        public async Task<AIFeedbackResponseDto> AssessWritingEmailAsync(
            WritingEmailRequestDto request,
            Guid userId)
        {
            try
            {
                _logger.LogInformation("📧 Writing Email - User: {UserId}, Q{Number}", userId, request.QuestionNumber);

                var question = await GetQuestionAsync(request.QuestionId, 9, request.QuestionNumber);
                if (question == null)
                    throw new Exception($"Question {request.QuestionNumber} not found");

                _logger.LogInformation("📝 Found Question - Id: {QuestionId}, Content: {HasContent}",
                    question.QuestionId, !string.IsNullOrEmpty(question.Content));

                var (userTest, userAnswer) = await CreateWritingUserAnswerAsync(userId, question.QuestionId, request.Text);

                var pythonRequest = new
                {
                    text = request.Text,
                    prompt = question.Content ?? "",
                    part_type = "respond_request",
                    question_number = request.QuestionNumber
                };

                var jsonContent = JsonSerializer.Serialize(pythonRequest, _jsonOptions);
                var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

                _logger.LogInformation("🚀 Calling Python: {Url}/assess", _writingApiUrl);

                var response = await _writingHttpClient.PostAsync($"{_writingApiUrl}/assess", content);

                if (!response.IsSuccessStatusCode)
                {
                    var error = await response.Content.ReadAsStringAsync();
                    throw new Exception($"Python API error: {response.StatusCode} - {error}");
                }

                var jsonResponse = await response.Content.ReadAsStringAsync();
                var pythonResponse = JsonSerializer.Deserialize<PythonWritingResponse>(jsonResponse, _jsonOptions);

                var feedback = new AIFeedback
                {
                    UserAnswerId = userAnswer.UserAnswerId,
                    Score = pythonResponse!.OverallScore,
                    Content = GenerateContentSummary(pythonResponse),
                    AIScorer = "writing",
                    DetailedScoresJson = JsonSerializer.Serialize(pythonResponse.Scores, _jsonOptions),
                    DetailedAnalysisJson = JsonSerializer.Serialize(pythonResponse.DetailedAnalysis, _jsonOptions),
                    RecommendationsJson = JsonSerializer.Serialize(pythonResponse.Recommendations, _jsonOptions),
                    CorrectedText = pythonResponse.DetailedAnalysis?.CorrectedText,
                    PythonApiResponse = jsonResponse,
                    CreatedAt = DateTime.UtcNow
                };

                await _feedbackRepository.CreateAsync(feedback);

                _logger.LogInformation("✅ Completed - FeedbackId: {Id}, Score: {Score}", feedback.FeedbackId, feedback.Score);

                return MapToResponseDto(feedback);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error Writing Email Q{Number} - Inner: {Inner}",
                    request.QuestionNumber, ex.InnerException?.Message ?? "None");
                throw;
            }
        }

        public async Task<AIFeedbackResponseDto> AssessWritingEssayAsync(
            WritingEssayRequestDto request,
            Guid userId)
        {
            try
            {
                _logger.LogInformation("📄 Writing Essay - User: {UserId}, Q{Number}", userId, request.QuestionNumber);

                var question = await GetQuestionAsync(request.QuestionId, 10, request.QuestionNumber);
                if (question == null)
                    throw new Exception($"Question {request.QuestionNumber} not found");

                _logger.LogInformation("📝 Found Question - Id: {QuestionId}, Content: {HasContent}",
                    question.QuestionId, !string.IsNullOrEmpty(question.Content));

                var (userTest, userAnswer) = await CreateWritingUserAnswerAsync(userId, question.QuestionId, request.Text);

                var pythonRequest = new
                {
                    text = request.Text,
                    prompt = question.Content ?? "",
                    part_type = "opinion_essay",
                    question_number = request.QuestionNumber
                };

                var jsonContent = JsonSerializer.Serialize(pythonRequest, _jsonOptions);
                var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

                _logger.LogInformation("🚀 Calling Python: {Url}/assess", _writingApiUrl);

                var response = await _writingHttpClient.PostAsync($"{_writingApiUrl}/assess", content);

                if (!response.IsSuccessStatusCode)
                {
                    var error = await response.Content.ReadAsStringAsync();
                    throw new Exception($"Python API error: {response.StatusCode} - {error}");
                }

                var jsonResponse = await response.Content.ReadAsStringAsync();
                var pythonResponse = JsonSerializer.Deserialize<PythonWritingResponse>(jsonResponse, _jsonOptions);

                var feedback = new AIFeedback
                {
                    UserAnswerId = userAnswer.UserAnswerId,
                    Score = pythonResponse!.OverallScore,
                    Content = GenerateContentSummary(pythonResponse),
                    AIScorer = "writing",
                    DetailedScoresJson = JsonSerializer.Serialize(pythonResponse.Scores, _jsonOptions),
                    DetailedAnalysisJson = JsonSerializer.Serialize(pythonResponse.DetailedAnalysis, _jsonOptions),
                    RecommendationsJson = JsonSerializer.Serialize(pythonResponse.Recommendations, _jsonOptions),
                    CorrectedText = pythonResponse.DetailedAnalysis?.CorrectedText,
                    PythonApiResponse = jsonResponse,
                    CreatedAt = DateTime.UtcNow
                };

                await _feedbackRepository.CreateAsync(feedback);

                _logger.LogInformation("✅ Completed - FeedbackId: {Id}, Score: {Score}", feedback.FeedbackId, feedback.Score);

                return MapToResponseDto(feedback);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error Writing Essay Q{Number} - Inner: {Inner}",
                    request.QuestionNumber, ex.InnerException?.Message ?? "None");
                throw;
            }
        }

        #endregion

        #region SPEAKING ASSESSMENTS

        public async Task<AIFeedbackResponseDto> AssessSpeakingAsync(
            SpeakingAssessmentRequestDto request,
            string questionType,
            Guid userId)
        {
            string? audioUrl = null;

            try
            {
                _logger.LogInformation("🎤 Speaking - User: {UserId}, Type: {Type}, Q{Number}",
                    userId, questionType, request.QuestionNumber);

                var partId = GetSpeakingPartId(request.QuestionNumber);
                var question = await GetQuestionAsync(request.QuestionId, partId, request.QuestionNumber);

                if (question == null)
                    throw new Exception($"Question {request.QuestionNumber} not found");

                _logger.LogInformation("📝 Found Question - Id: {QuestionId}, PartId: {PartId}, HasImage: {HasImage}",
                    question.QuestionId, partId, !string.IsNullOrEmpty(question.ImageUrl));

                // 1. Upload audio
                _logger.LogInformation("📤 Uploading audio...");
                var uploadResult = await _fileService.UploadFileAsync(request.AudioFile, "audio");
                if (!uploadResult.IsSuccess)
                    throw new Exception($"Upload failed: {uploadResult.ErrorMessage}");

                audioUrl = uploadResult.Data;
                _logger.LogInformation("✅ Audio uploaded: {AudioUrl}", audioUrl);

                // 2. Create UserAnswer with audio URL
                var (userTest, userAnswer) = await CreateSpeakingUserAnswerAsync(userId, question.QuestionId, audioUrl!);

                // 3. Download audio to send to Python
                var audioStream = await _fileService.DownloadFileAsync(audioUrl!);

                using var content = new MultipartFormDataContent();

                var audioContent = new StreamContent(audioStream);
                audioContent.Headers.ContentType = new MediaTypeHeaderValue(request.AudioFile.ContentType);
                content.Add(audioContent, "file", request.AudioFile.FileName);

                content.Add(new StringContent(question.Content ?? ""), "question_content");
                content.Add(new StringContent(questionType), "question_type");
                content.Add(new StringContent(request.QuestionNumber.ToString()), "question_number");

                if (partId == 11 && !string.IsNullOrEmpty(question.Content))
                {
                    content.Add(new StringContent(question.Content), "reference_text");
                    _logger.LogInformation("📄 Added reference text for Read Aloud");
                }

                if (partId == 12 && !string.IsNullOrEmpty(question.ImageUrl))
                {
                    var pictureStream = await _fileService.DownloadFileAsync(question.ImageUrl);
                    var pictureContent = new StreamContent(pictureStream);
                    pictureContent.Headers.ContentType = new MediaTypeHeaderValue("image/jpeg");
                    content.Add(pictureContent, "picture", "picture.jpg");
                    _logger.LogInformation("🖼️ Added picture: {ImageUrl}", question.ImageUrl);
                }

                _logger.LogInformation("🚀 Calling Python: {Url}/assess", _speakingApiUrl);

                var response = await _speakingHttpClient.PostAsync($"{_speakingApiUrl}/assess", content);

                if (!response.IsSuccessStatusCode)
                {
                    var error = await response.Content.ReadAsStringAsync();
                    throw new Exception($"Python API error: {response.StatusCode} - {error}");
                }

                var jsonResponse = await response.Content.ReadAsStringAsync();
                var pythonResponse = JsonSerializer.Deserialize<PythonSpeakingResponse>(jsonResponse, _jsonOptions);

                var feedback = new AIFeedback
                {
                    UserAnswerId = userAnswer.UserAnswerId,
                    Score = pythonResponse!.OverallScore,
                    Content = GenerateSpeakingContentSummary(pythonResponse),
                    AIScorer = "speaking",
                    DetailedScoresJson = JsonSerializer.Serialize(pythonResponse.Scores, _jsonOptions),
                    DetailedAnalysisJson = JsonSerializer.Serialize(pythonResponse.DetailedAnalysis, _jsonOptions),
                    RecommendationsJson = JsonSerializer.Serialize(pythonResponse.Recommendations, _jsonOptions),
                    Transcription = pythonResponse.Transcription,
                    AudioDuration = (double)pythonResponse.Duration,
                    PythonApiResponse = jsonResponse,
                    AudioFileUrl = audioUrl,
                    ImageFileUrl = question.ImageUrl,
                    CreatedAt = DateTime.UtcNow
                };

                await _feedbackRepository.CreateAsync(feedback);

                _logger.LogInformation("✅ Completed - FeedbackId: {Id}, Score: {Score}",
                    feedback.FeedbackId, feedback.Score);

                return MapToResponseDto(feedback);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error Speaking Q{Number} - Inner: {Inner}",
                    request.QuestionNumber, ex.InnerException?.Message ?? "None");

                if (!string.IsNullOrEmpty(audioUrl))
                {
                    try
                    {
                        await _fileService.DeleteFileAsync(audioUrl);
                        _logger.LogInformation("🗑️ Rolled back audio upload: {AudioUrl}", audioUrl);
                    }
                    catch (Exception rollbackEx)
                    {
                        _logger.LogError(rollbackEx, "Failed to rollback audio upload");
                    }
                }

                throw;
            }
        }

        #endregion

        #region FEEDBACK QUERIES

        public async Task<AIFeedbackResponseDto> GetFeedbackAsync(int feedbackId, Guid userId)
        {
            var feedback = await _feedbackRepository.GetByIdAsync(feedbackId);
            if (feedback == null)
                throw new Exception("Feedback not found");

            if (feedback.UserAnswer?.UserTest?.UserId != userId)
                throw new UnauthorizedAccessException("Access denied");

            return MapToResponseDto(feedback);
        }

        public async Task<List<FeedbackHistoryDto>> GetUserHistoryAsync(Guid userId, string? aiScorer = null)
        {
            var feedbacks = await _feedbackRepository.GetByUserIdAsync(userId);

            if (!string.IsNullOrEmpty(aiScorer))
            {
                feedbacks = feedbacks.Where(f => f.AIScorer == aiScorer).ToList();
            }

            return feedbacks.Select(f => new FeedbackHistoryDto
            {
                FeedbackId = f.FeedbackId,
                QuestionNumber = f.UserAnswer?.Question?.Number ?? 0,
                QuestionType = DetermineQuestionType(f.UserAnswer?.Question?.PartId ?? 0, f.AIScorer),
                Score = f.Score,
                Summary = f.Content?.Length > 100 ? f.Content.Substring(0, 100) + "..." : f.Content,
                CreatedAt = f.CreatedAt
            }).ToList();
        }

        #endregion

        #region HEALTH CHECKS

        public async Task<bool> CheckWritingApiHealthAsync()
        {
            try
            {
                var response = await _writingHttpClient.GetAsync($"{_writingApiUrl}/health");
                return response.IsSuccessStatusCode;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> CheckSpeakingApiHealthAsync()
        {
            try
            {
                var response = await _speakingHttpClient.GetAsync($"{_speakingApiUrl}/");
                return response.IsSuccessStatusCode;
            }
            catch
            {
                return false;
            }
        }

        #endregion

        #region HELPER METHODS

        private async Task<Question?> GetQuestionAsync(int? questionId, int partId, int number)
        {
            if (questionId.HasValue)
            {
                return await _uow.Questions.GetByIdAsync(questionId.Value);
            }

            return await _uow.Questions.GetByPartAndNumberAsync(partId, number);
        }

        // ✅ CHO WRITING - Lưu text
        private async Task<(TestResult userTest, UserAnswer userAnswer)> CreateWritingUserAnswerAsync(
            Guid userId,
            int questionId,
            string answerText)
        {
            // 1. Get or create UserTest (đã validate TestId exists bên trong)
            var userTest = await _uow.UserTests.GetOrCreateActiveTestAsync(userId);

            // 2. UserTest.UserTestId đã được set sau SaveChanges trong repository
            _logger.LogInformation("💾 Using UserTest: {UserTestId}", userTest.UserTestId);

            // 3. Validate QuestionId exists
            var questionExists = await _uow.Questions.GetByIdAsync(questionId);
            if (questionExists == null)
            {
                throw new Exception($"Question with ID {questionId} does not exist");
            }

            // 4. Tạo UserAnswer
            var userAnswer = new UserAnswer
            {
                UserTestId = userTest.UserTestId,
                QuestionId = questionId,
                AnswerText = answerText,
                CreatedAt = DateTime.UtcNow
            };

            await _uow.UserAnswers.AddAsync(userAnswer);
            await _uow.SaveChangesAsync();

            _logger.LogInformation("💾 Created Writing UserAnswer: {UserAnswerId} for UserTest: {UserTestId}",
                userAnswer.UserAnswerId, userTest.UserTestId);

            return (userTest, userAnswer);
        }

        // ✅ CHO SPEAKING - Lưu audio URL
        private async Task<(TestResult userTest, UserAnswer userAnswer)> CreateSpeakingUserAnswerAsync(
            Guid userId,
            int questionId,
            string audioUrl)
        {
            // 1. Get or create UserTest
            var userTest = await _uow.UserTests.GetOrCreateActiveTestAsync(userId);

            // 2. ✅ QUAN TRỌNG: Đảm bảo UserTest đã được save vào DB
            if (userTest.UserTestId == 0)
            {
                await _uow.SaveChangesAsync();
                _logger.LogInformation("💾 Saved new UserTest: {UserTestId}", userTest.UserTestId);
            }

            // 3. Validate QuestionId exists
            var questionExists = await _uow.Questions.GetByIdAsync(questionId);
            if (questionExists == null)
            {
                throw new Exception($"Question with ID {questionId} does not exist");
            }

            // 4. Tạo UserAnswer
            var userAnswer = new UserAnswer
            {
                UserTestId = userTest.UserTestId,
                QuestionId = questionId,
                AnswerAudioUrl = audioUrl,
                CreatedAt = DateTime.UtcNow
            };

            await _uow.UserAnswers.AddAsync(userAnswer);
            await _uow.SaveChangesAsync();

            _logger.LogInformation("💾 Created Speaking UserAnswer: {UserAnswerId} with Audio for UserTest: {UserTestId}",
                userAnswer.UserAnswerId, userTest.UserTestId);

            return (userTest, userAnswer);
        }

        private int GetSpeakingPartId(int questionNumber)
        {
            return questionNumber switch
            {
                >= 1 and <= 2 => 11,
                >= 3 and <= 4 => 12,
                >= 5 and <= 7 => 13,
                >= 8 and <= 10 => 14,
                11 => 15,
                _ => throw new ArgumentException($"Invalid question number: {questionNumber}")
            };
        }

        private string DetermineQuestionType(int partId, string? aiScorer)
        {
            if (aiScorer == "writing")
            {
                return partId switch
                {
                    8 => "write_sentence",
                    9 => "respond_email",
                    10 => "write_essay",
                    _ => "writing"
                };
            }
            else
            {
                return partId switch
                {
                    11 => "read_aloud",
                    12 => "describe_picture",
                    13 => "respond_questions",
                    14 => "respond_info",
                    15 => "express_opinion",
                    _ => "speaking"
                };
            }
        }

        private string GenerateContentSummary(PythonWritingResponse response)
        {
            return $"Score: {response.OverallScore}/100. " +
                   $"Grammar: {response.Scores.Grammar}, " +
                   $"Vocabulary: {response.Scores.Vocabulary}, " +
                   $"Organization: {response.Scores.Organization}";
        }

        private string GenerateSpeakingContentSummary(PythonSpeakingResponse response)
        {
            var scoresText = string.Join(", ", response.Scores.Take(3).Select(kvp => $"{kvp.Key}: {kvp.Value}"));
            return $"Score: {response.OverallScore}/100. {scoresText}";
        }

        private AIFeedbackResponseDto MapToResponseDto(AIFeedback feedback)
        {
            return new AIFeedbackResponseDto
            {
                FeedbackId = feedback.FeedbackId,
                UserAnswerId = feedback.UserAnswerId,
                Score = feedback.Score,
                Content = feedback.Content ?? string.Empty,
                AIScorer = feedback.AIScorer ?? string.Empty,
                DetailedScores = string.IsNullOrEmpty(feedback.DetailedScoresJson)
                    ? new Dictionary<string, object>()
                    : JsonSerializer.Deserialize<Dictionary<string, object>>(feedback.DetailedScoresJson, _jsonOptions) ?? new Dictionary<string, object>(),
                DetailedAnalysis = string.IsNullOrEmpty(feedback.DetailedAnalysisJson)
                    ? new Dictionary<string, object>()
                    : JsonSerializer.Deserialize<Dictionary<string, object>>(feedback.DetailedAnalysisJson, _jsonOptions) ?? new Dictionary<string, object>(),
                Recommendations = string.IsNullOrEmpty(feedback.RecommendationsJson)
                    ? new List<string>()
                    : JsonSerializer.Deserialize<List<string>>(feedback.RecommendationsJson, _jsonOptions) ?? new List<string>(),
                Transcription = feedback.Transcription ?? string.Empty,
                CorrectedText = feedback.CorrectedText ?? string.Empty,
                AudioDuration = (double?)feedback.AudioDuration,
                CreatedAt = feedback.CreatedAt
            };
        }

        #endregion
    }
}