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
using ToeicGenius.Domains.DTOs.Responses.Question;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Domains.Enums;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Services.Interfaces;
using ToeicGenius.Shared.Helpers;
using static ToeicGenius.Shared.Helpers.DateTimeHelper;

namespace ToeicGenius.Services.Implementations
{
    public class AssessmentService : IAssessmentService
    {
        private readonly HttpClient _writingHttpClient;
        private readonly HttpClient _speakingHttpClient;
        private readonly IUnitOfWork _uow;
        private readonly IAIFeedbackRepository _feedbackRepository;
        private readonly ITestQuestionRepository _testQuestionRepository;
        private readonly IFileService _fileService;
        private readonly ILogger<AssessmentService> _logger;
        private readonly string _writingApiUrl;
        private readonly string _speakingApiUrl;
        private readonly JsonSerializerOptions _jsonOptions;

        public AssessmentService(
            IHttpClientFactory httpClientFactory,
            IUnitOfWork uow,
            IAIFeedbackRepository feedbackRepository,
            ITestQuestionRepository testQuestionRepository,
            IFileService fileService,
            IOptions<PythonApiSettings> settings,
            ILogger<AssessmentService> logger)
        {
            _writingHttpClient = httpClientFactory.CreateClient("WritingApi");
            _speakingHttpClient = httpClientFactory.CreateClient("SpeakingApi");
            _uow = uow;
            _feedbackRepository = feedbackRepository;
            _testQuestionRepository = testQuestionRepository;
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

        // Bulk assessment for writing & speaking
        public async Task<ToeicGenius.Domains.DTOs.Responses.AI.SubmitBulkAssessmentResponseDto> SubmitBulkAssessmentAsync(
            ToeicGenius.Domains.DTOs.Requests.AI.SubmitBulkAssessmentRequestDto request,
            Guid userId)
        {
            if (request == null || request.Parts == null || !request.Parts.Any())
                throw new Exception("No parts provided for bulk assessment.");

            // Validate TestResult ownership
            var testResult = await _uow.TestResults.GetByIdAsync(request.TestResultId);
            if (testResult == null)
                throw new Exception($"TestResult {request.TestResultId} not found");
            if (testResult.UserId != userId)
                throw new UnauthorizedAccessException("You don't have permission to submit this test result");
            if (testResult.Status == TestResultStatus.Graded)
                throw new Exception("This test has already been submitted/completed.");

            var response = new ToeicGenius.Domains.DTOs.Responses.AI.SubmitBulkAssessmentResponseDto();

            var perPartResponses = new List<ToeicGenius.Domains.DTOs.Responses.AI.PerPartAssessmentFeedbackDto>();
            var rawWritingScores = new List<double>();
            var rawSpeakingScores = new List<double>();
            int skipCount = 0;
            int totalQuestions = request.Parts.Count;

            foreach (var part in request.Parts)
            {
                try
                {
                    // Check if this part is skipped (empty answer)
                    bool isSkipped = false;
                    if (part.PartType?.StartsWith("writing") == true)
                    {
                        isSkipped = string.IsNullOrWhiteSpace(part.AnswerText);
                    }
                    else
                    {
                        isSkipped = string.IsNullOrWhiteSpace(part.AudioFileUrl);
                    }

                    if (isSkipped)
                    {
                        skipCount++;
                        continue; // Skip processing this part
                    }

                    ToeicGenius.Domains.DTOs.Responses.AI.AIFeedbackResponseDto aiResponse = null!;

                    // Writing parts
                    if (part.PartType?.StartsWith("writing") == true)
                    {
                        if (part.PartType == "writing_sentence")
                        {
                            var dto = new ToeicGenius.Domains.DTOs.Requests.AI.Writing.WritingSentenceRequestDto
                            {
                                TestQuestionId = part.TestQuestionId,
                                Text = part.AnswerText ?? string.Empty
                            };
                            aiResponse = await AssessWritingSentenceAsync(dto, userId);
                        }
                        else if (part.PartType == "writing_email")
                        {
                            var dto = new ToeicGenius.Domains.DTOs.Requests.AI.Writing.WritingEmailRequestDto
                            {
                                TestQuestionId = part.TestQuestionId,
                                Text = part.AnswerText ?? string.Empty
                            };
                            aiResponse = await AssessWritingEmailAsync(dto, userId);
                        }
                        else if (part.PartType == "writing_essay")
                        {
                            var dto = new ToeicGenius.Domains.DTOs.Requests.AI.Writing.WritingEssayRequestDto
                            {
                                TestQuestionId = part.TestQuestionId,
                                Text = part.AnswerText ?? string.Empty
                            };
                            aiResponse = await AssessWritingEssayAsync(dto, userId);
                        }

                        // Extract raw score from Python response (0-100)
                        if (!string.IsNullOrEmpty(aiResponse.PythonApiResponse))
                        {
                            var pythonResponse = JsonSerializer.Deserialize<PythonWritingResponse>(
                                aiResponse.PythonApiResponse, _jsonOptions);
                            if (pythonResponse != null)
                                rawWritingScores.Add(pythonResponse.OverallScore);
                        }
                    }
                    else // Speaking parts
                    {
                        if (string.IsNullOrEmpty(part.AudioFileUrl))
                            throw new Exception($"AudioFileUrl is required for speaking part TestQuestionId={part.TestQuestionId}");

                        // Map part type names to taskType used by python API
                        var taskType = part.PartType switch
                        {
                            "read_aloud" => "read_aloud",
                            "describe_picture" => "describe_picture",
                            "respond_questions" => "respond_questions",
                            "respond_with_info" => "respond_with_info",
                            "express_opinion" => "express_opinion",
                            _ => part.PartType
                        };

                        aiResponse = await AssessSpeakingFromUrlAsync(part.TestQuestionId, taskType ?? string.Empty, part.AudioFileUrl!, userId);

                        // Extract raw score from Python response (0-100)
                        if (!string.IsNullOrEmpty(aiResponse.PythonApiResponse))
                        {
                            var pythonResponse = JsonSerializer.Deserialize<PythonSpeakingResponse>(
                                aiResponse.PythonApiResponse, _jsonOptions);
                            if (pythonResponse != null)
                                rawSpeakingScores.Add(pythonResponse.OverallScore);
                        }
                    }

                    // Map to PerPartAssessmentFeedbackDto
                    var mapped = new ToeicGenius.Domains.DTOs.Responses.AI.PerPartAssessmentFeedbackDto
                    {
                        TestQuestionId = part.TestQuestionId,
                        FeedbackId = aiResponse.FeedbackId,
                        UserAnswerId = aiResponse.UserAnswerId ?? 0,
                        Score = (double)aiResponse.Score,
                        Content = aiResponse.Content ?? string.Empty,
                        AIScorer = aiResponse.AIScorer ?? string.Empty,
                        DetailedScores = aiResponse.DetailedScores ?? new Dictionary<string, object>(),
                        DetailedAnalysis = aiResponse.DetailedAnalysis ?? new Dictionary<string, object>(),
                        Recommendations = aiResponse.Recommendations ?? new List<string>(),
                        Transcription = aiResponse.Transcription ?? string.Empty,
                        CorrectedText = aiResponse.CorrectedText ?? string.Empty,
                        AudioDuration = aiResponse.AudioDuration,
                        CreatedAt = aiResponse.CreatedAt
                    };

                    perPartResponses.Add(mapped);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing part {TestQuestionId} in bulk assessment", part.TestQuestionId);
                    // Continue with other parts; optionally we could record partial failures
                }
            }

            // Aggregate RAW scores (0-100) before conversion
            double? writingAvg = rawWritingScores.Any() ? rawWritingScores.Average() : (double?)null;
            double? speakingAvg = rawSpeakingScores.Any() ? rawSpeakingScores.Average() : (double?)null;

            // Convert averaged RAW scores (0-100) to TOEIC scale scores (0-200) - ONE TIME ONLY
            int? writingToeicScore = writingAvg.HasValue ? ToeicScoreTable.ConvertWritingScore(writingAvg.Value) : (int?)null;
            int? speakingToeicScore = speakingAvg.HasValue ? ToeicScoreTable.ConvertSpeakingScore(speakingAvg.Value) : (int?)null;

            response.WritingScore = writingToeicScore;
            response.SpeakingScore = speakingToeicScore;
            response.PerPartFeedbacks = perPartResponses;

            // Update TestResult
            var skillScores = new List<ToeicGenius.Domains.Entities.UserTestSkillScore>();
            if (writingToeicScore.HasValue)
            {
                skillScores.Add(new ToeicGenius.Domains.Entities.UserTestSkillScore
                {
                    Skill = "Writing",
                    CorrectCount = 0,
                    TotalQuestions = rawWritingScores.Count,
                    Score = writingToeicScore.Value
                });
            }
            if (speakingToeicScore.HasValue)
            {
                skillScores.Add(new ToeicGenius.Domains.Entities.UserTestSkillScore
                {
                    Skill = "Speaking",
                    CorrectCount = 0,
                    TotalQuestions = rawSpeakingScores.Count,
                    Score = speakingToeicScore.Value
                });
            }

            testResult.SkillScores = skillScores;
            testResult.Duration = request.Duration;
            testResult.UpdatedAt = Now;
            testResult.Status = TestResultStatus.Graded;

            // Calculate TotalScore as sum of all skill scores (Writing + Speaking)
            testResult.TotalScore = skillScores.Sum(s => s.Score);

            // Update TotalQuestions and SkipCount
            testResult.TotalQuestions = totalQuestions;
            testResult.SkipCount = skipCount;

            await _uow.SaveChangesAsync();

            return response;
        }

        private async Task<ToeicGenius.Domains.DTOs.Responses.AI.AIFeedbackResponseDto> AssessSpeakingFromUrlAsync(
            int testQuestionId,
            string taskType,
            string audioUrl,
            Guid userId)
        {
            // Download audio stream
            var audioStream = await _fileService.DownloadFileAsync(audioUrl);
            if (audioStream == null)
                throw new Exception("Failed to download audio file from provided URL.");

            // Get TestQuestion
            var testQuestion = await _testQuestionRepository.GetByIdAsync(testQuestionId);
            if (testQuestion == null)
                throw new Exception($"TestQuestion {testQuestionId} not found");

            var (testResult, userAnswer) = await CreateSpeakingUserAnswerAsync(userId, testQuestionId, audioUrl);

            using var content = new MultipartFormDataContent();

            var audioContent = new StreamContent(audioStream);
            audioContent.Headers.ContentType = new MediaTypeHeaderValue("audio/wav");
            content.Add(audioContent, "file", "upload.wav");

            content.Add(new StringContent(taskType), "question_type");
            content.Add(new StringContent(testQuestion.OrderInTest.ToString()), "question_number");

            // Declare snapshot outside for later use
            ToeicGenius.Domains.DTOs.Responses.Question.QuestionSnapshotDto? singleSnapshot = null;

            // Handle Group Questions (Part 3/4: respond_questions, respond_with_info)
            if (testQuestion.IsQuestionGroup)
            {
                var groupSnapshot = JsonSerializer.Deserialize<ToeicGenius.Domains.DTOs.Responses.QuestionGroup.QuestionGroupSnapshotDto>(
                    testQuestion.SnapshotJson, _jsonOptions);

                if (groupSnapshot != null)
                {
                    // Send passage/context
                    if (!string.IsNullOrEmpty(groupSnapshot.Passage))
                        content.Add(new StringContent(groupSnapshot.Passage), "passage");

                    // Send all questions as JSON array with order index
                    var questionsJson = JsonSerializer.Serialize(
                        groupSnapshot.QuestionSnapshots.Select((q, index) => new
                        {
                            order = index + 1,
                            content = q.Content
                        }).ToList(),
                        _jsonOptions
                    );
                    content.Add(new StringContent(questionsJson), "questions");

                    _logger.LogInformation("🔗 Group Questions - Passage length: {Length}, Questions count: {Count}",
                        groupSnapshot.Passage?.Length ?? 0, groupSnapshot.QuestionSnapshots.Count);
                }
            }
            else
            {
                // Single question
                singleSnapshot = JsonSerializer.Deserialize<ToeicGenius.Domains.DTOs.Responses.Question.QuestionSnapshotDto>(
                    testQuestion.SnapshotJson, _jsonOptions);

                if (singleSnapshot != null)
                {
                    if (!string.IsNullOrEmpty(singleSnapshot.Content))
                        content.Add(new StringContent(singleSnapshot.Content), "reference_text");

                    if (!string.IsNullOrEmpty(singleSnapshot.Explanation))
                        content.Add(new StringContent(singleSnapshot.Explanation), "question_context");
                }
            }

            // Handle describe_picture image (only for single questions)
            if (taskType == "describe_picture" && !testQuestion.IsQuestionGroup && singleSnapshot != null)
            {
                if (!string.IsNullOrEmpty(singleSnapshot.ImageUrl))
                {
                    var imageStream = await _fileService.DownloadFileAsync(singleSnapshot.ImageUrl);
                    var imageContent = new StreamContent(imageStream);
                    imageContent.Headers.ContentType = new MediaTypeHeaderValue("image/jpeg");
                    content.Add(imageContent, "picture", "question_image.jpg");
                }
            }

            _logger.LogInformation("🚀 Calling Python: {Url}/assess (speaking from url)", _speakingApiUrl);

            var response = await _speakingHttpClient.PostAsync($"{_speakingApiUrl}/assess", content);

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                throw new Exception($"Python API error: {response.StatusCode} - {error}");
            }

            var jsonResponse = await response.Content.ReadAsStringAsync();
            var pythonResponse = JsonSerializer.Deserialize<PythonSpeakingResponse>(jsonResponse, _jsonOptions);

            // Convert AI score (0-100) to TOEIC scale score (0-200)
            var toeicScore = ToeicScoreTable.ConvertSpeakingScore(pythonResponse!.OverallScore);

            var feedback = new AIFeedback
            {
                UserAnswerId = userAnswer.UserAnswerId,
                Score = toeicScore,
                Content = GenerateSpeakingContentSummary(pythonResponse),
                AIScorer = "speaking",
                Transcription = pythonResponse.Transcription,
                AudioDuration = pythonResponse.Duration,
                DetailedScoresJson = JsonSerializer.Serialize(pythonResponse.Scores, _jsonOptions),
                DetailedAnalysisJson = JsonSerializer.Serialize(pythonResponse.DetailedAnalysis, _jsonOptions),
                RecommendationsJson = JsonSerializer.Serialize(pythonResponse.Recommendations, _jsonOptions),
                PythonApiResponse = jsonResponse,
                AudioFileUrl = audioUrl,
                ImageFileUrl = taskType == "describe_picture" ? singleSnapshot?.ImageUrl : null,
                CreatedAt = Now
            };

            await _feedbackRepository.CreateAsync(feedback);

            return MapToResponseDto(feedback);
        }
        #region WRITING ASSESSMENTS

        public async Task<AIFeedbackResponseDto> AssessWritingSentenceAsync(
            WritingSentenceRequestDto request,
            Guid userId)
        {
            try
            {
                _logger.LogInformation("📝 Writing Sentence - User: {UserId}, TestQuestionId: {TestQuestionId}",
                    userId, request.TestQuestionId);

                var (testQuestion, snapshot) = await GetTestQuestionSnapshotAsync(request.TestQuestionId);

                if (string.IsNullOrEmpty(snapshot.ImageUrl))
                    throw new Exception($"TestQuestion {request.TestQuestionId} missing image");

                _logger.LogInformation("📝 Found TestQuestion - Id: {TestQuestionId}, HasImage: {HasImage}",
                    testQuestion.TestQuestionId, !string.IsNullOrEmpty(snapshot.ImageUrl));

                var (testResult, userAnswer) = await CreateWritingUserAnswerAsync(userId, request.TestQuestionId, request.Text, request.TestResultId);

                var imageStream = await _fileService.DownloadFileAsync(snapshot.ImageUrl);

                using var content = new MultipartFormDataContent();
                content.Add(new StringContent(request.Text), "text");
                content.Add(new StringContent(testQuestion.OrderInTest.ToString()), "question_number");

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

                // Convert AI score (0-100) to TOEIC scale score (0-200)
                var toeicScore = ToeicScoreTable.ConvertWritingScore(pythonResponse!.OverallScore);

                var feedback = new AIFeedback
                {
                    UserAnswerId = userAnswer.UserAnswerId,
                    Score = toeicScore,
                    Content = GenerateContentSummary(pythonResponse),
                    AIScorer = "writing",
                    DetailedScoresJson = JsonSerializer.Serialize(pythonResponse.Scores, _jsonOptions),
                    DetailedAnalysisJson = JsonSerializer.Serialize(pythonResponse.DetailedAnalysis, _jsonOptions),
                    RecommendationsJson = JsonSerializer.Serialize(pythonResponse.Recommendations, _jsonOptions),
                    CorrectedText = pythonResponse.DetailedAnalysis?.CorrectedText,
                    PythonApiResponse = jsonResponse,
                    ImageFileUrl = snapshot.ImageUrl,
                    CreatedAt = Now
                };

                await _feedbackRepository.CreateAsync(feedback);

                _logger.LogInformation("✅ Completed - FeedbackId: {Id}, Score: {Score}",
                    feedback.FeedbackId, feedback.Score);

                return MapToResponseDto(feedback);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error Writing Sentence TestQuestionId: {TestQuestionId} - Inner: {Inner}",
                    request.TestQuestionId, ex.InnerException?.Message ?? "None");
                throw;
            }
        }

        public async Task<AIFeedbackResponseDto> AssessWritingEmailAsync(
            WritingEmailRequestDto request,
            Guid userId)
        {
            try
            {
                _logger.LogInformation("📧 Writing Email - User: {UserId}, TestQuestionId: {TestQuestionId}",
                    userId, request.TestQuestionId);

                var (testQuestion, snapshot) = await GetTestQuestionSnapshotAsync(request.TestQuestionId);

                _logger.LogInformation("📝 Found TestQuestion - Id: {TestQuestionId}, Content: {HasContent}",
                    testQuestion.TestQuestionId, !string.IsNullOrEmpty(snapshot.Content));

                var (testResult, userAnswer) = await CreateWritingUserAnswerAsync(userId, request.TestQuestionId, request.Text, request.TestResultId);

                var pythonRequest = new
                {
                    text = request.Text,
                    prompt = snapshot.Content ?? "",
                    part_type = "respond_request",
                    question_number = testQuestion.OrderInTest
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

                // Convert AI score (0-100) to TOEIC scale score (0-200)
                var toeicScore = ToeicScoreTable.ConvertWritingScore(pythonResponse!.OverallScore);

                var feedback = new AIFeedback
                {
                    UserAnswerId = userAnswer.UserAnswerId,
                    Score = toeicScore,
                    Content = GenerateContentSummary(pythonResponse),
                    AIScorer = "writing",
                    DetailedScoresJson = JsonSerializer.Serialize(pythonResponse.Scores, _jsonOptions),
                    DetailedAnalysisJson = JsonSerializer.Serialize(pythonResponse.DetailedAnalysis, _jsonOptions),
                    RecommendationsJson = JsonSerializer.Serialize(pythonResponse.Recommendations, _jsonOptions),
                    CorrectedText = pythonResponse.DetailedAnalysis?.CorrectedText,
                    PythonApiResponse = jsonResponse,
                    CreatedAt = Now
                };

                await _feedbackRepository.CreateAsync(feedback);

                _logger.LogInformation("✅ Completed - FeedbackId: {Id}, Score: {Score}",
                    feedback.FeedbackId, feedback.Score);

                return MapToResponseDto(feedback);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error Writing Email TestQuestionId: {TestQuestionId} - Inner: {Inner}",
                    request.TestQuestionId, ex.InnerException?.Message ?? "None");
                throw;
            }
        }

        public async Task<AIFeedbackResponseDto> AssessWritingEssayAsync(
            WritingEssayRequestDto request,
            Guid userId)
        {
            try
            {
                _logger.LogInformation("📄 Writing Essay - User: {UserId}, TestQuestionId: {TestQuestionId}",
                    userId, request.TestQuestionId);

                var (testQuestion, snapshot) = await GetTestQuestionSnapshotAsync(request.TestQuestionId);

                _logger.LogInformation("📝 Found TestQuestion - Id: {TestQuestionId}, Content: {HasContent}",
                    testQuestion.TestQuestionId, !string.IsNullOrEmpty(snapshot.Content));

                var (testResult, userAnswer) = await CreateWritingUserAnswerAsync(userId, request.TestQuestionId, request.Text, request.TestResultId);

                var pythonRequest = new
                {
                    text = request.Text,
                    prompt = snapshot.Content ?? "",
                    part_type = "opinion_essay",
                    question_number = testQuestion.OrderInTest
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

                // Convert AI score (0-100) to TOEIC scale score (0-200)
                var toeicScore = ToeicScoreTable.ConvertWritingScore(pythonResponse!.OverallScore);

                var feedback = new AIFeedback
                {
                    UserAnswerId = userAnswer.UserAnswerId,
                    Score = toeicScore,
                    Content = GenerateContentSummary(pythonResponse),
                    AIScorer = "writing",
                    DetailedScoresJson = JsonSerializer.Serialize(pythonResponse.Scores, _jsonOptions),
                    DetailedAnalysisJson = JsonSerializer.Serialize(pythonResponse.DetailedAnalysis, _jsonOptions),
                    RecommendationsJson = JsonSerializer.Serialize(pythonResponse.Recommendations, _jsonOptions),
                    CorrectedText = pythonResponse.DetailedAnalysis?.CorrectedText,
                    PythonApiResponse = jsonResponse,
                    CreatedAt = Now
                };

                await _feedbackRepository.CreateAsync(feedback);

                _logger.LogInformation("✅ Completed - FeedbackId: {Id}, Score: {Score}",
                    feedback.FeedbackId, feedback.Score);

                return MapToResponseDto(feedback);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error Writing Essay TestQuestionId: {TestQuestionId} - Inner: {Inner}",
                    request.TestQuestionId, ex.InnerException?.Message ?? "None");
                throw;
            }
        }

        #endregion

        #region SPEAKING ASSESSMENT

        public async Task<AIFeedbackResponseDto> AssessSpeakingAsync(
            SpeakingAssessmentRequestDto request,
            string taskType,
            Guid userId)
        {
            try
            {
                _logger.LogInformation("🎤 Speaking {TaskType} - User: {UserId}, TestQuestionId: {TestQuestionId}",
                    taskType, userId, request.TestQuestionId);

                var (testQuestion, snapshot) = await GetTestQuestionSnapshotAsync(request.TestQuestionId);

                _logger.LogInformation("📝 Found TestQuestion - Id: {TestQuestionId}, Content: {HasContent}",
                    testQuestion.TestQuestionId, !string.IsNullOrEmpty(snapshot.Content));

                // Upload audio file
                var uploadResult = await _fileService.UploadFileAsync(request.AudioFile, "audio");
                if (!uploadResult.IsSuccess)
                    throw new Exception("Failed to upload audio file");

                var audioUrl = uploadResult.Data;
                var (testResult, userAnswer) = await CreateSpeakingUserAnswerAsync(userId, request.TestQuestionId, audioUrl, request.TestResultId);

                using var content = new MultipartFormDataContent();

                // Add audio file
                var audioStream = request.AudioFile.OpenReadStream();
                var audioContent = new StreamContent(audioStream);
                audioContent.Headers.ContentType = new MediaTypeHeaderValue("audio/wav");
                content.Add(audioContent, "file", request.AudioFile.FileName);

                // Add task type and question number
                content.Add(new StringContent(taskType), "question_type");
                content.Add(new StringContent(testQuestion.OrderInTest.ToString()), "question_number");

                // Add reference text if exists
                if (!string.IsNullOrEmpty(snapshot.Content))
                    content.Add(new StringContent(snapshot.Content), "reference_text");

                // Add question context if exists
                if (!string.IsNullOrEmpty(snapshot.Explanation))
                    content.Add(new StringContent(snapshot.Explanation), "question_context");

                // Add picture for describe_picture task
                if (taskType == "describe_picture" && !string.IsNullOrEmpty(snapshot.ImageUrl))
                {
                    var imageStream = await _fileService.DownloadFileAsync(snapshot.ImageUrl);
                    var imageContent = new StreamContent(imageStream);
                    imageContent.Headers.ContentType = new MediaTypeHeaderValue("image/jpeg");
                    content.Add(imageContent, "picture", "question_image.jpg");
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

                // Convert AI score (0-100) to TOEIC scale score (0-200)
                var toeicScore = ToeicScoreTable.ConvertSpeakingScore(pythonResponse!.OverallScore);

                var feedback = new AIFeedback
                {
                    UserAnswerId = userAnswer.UserAnswerId,
                    Score = toeicScore,
                    Content = GenerateSpeakingContentSummary(pythonResponse),
                    AIScorer = "speaking",
                    Transcription = pythonResponse.Transcription,
                    AudioDuration = pythonResponse.Duration,
                    DetailedScoresJson = JsonSerializer.Serialize(pythonResponse.Scores, _jsonOptions),
                    DetailedAnalysisJson = JsonSerializer.Serialize(pythonResponse.DetailedAnalysis, _jsonOptions),
                    RecommendationsJson = JsonSerializer.Serialize(pythonResponse.Recommendations, _jsonOptions),
                    PythonApiResponse = jsonResponse,
                    AudioFileUrl = audioUrl,
                    ImageFileUrl = taskType == "describe_picture" ? snapshot.ImageUrl : null,
                    CreatedAt = Now
                };

                await _feedbackRepository.CreateAsync(feedback);

                _logger.LogInformation("✅ Completed - FeedbackId: {Id}, Score: {Score}",
                    feedback.FeedbackId, feedback.Score);

                return MapToResponseDto(feedback);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error Speaking {TaskType} TestQuestionId: {TestQuestionId} - Inner: {Inner}",
                    taskType, request.TestQuestionId, ex.InnerException?.Message ?? "None");
                throw;
            }
        }

        #endregion

        #region QUERIES

        public async Task<AIFeedbackResponseDto> GetFeedbackAsync(int feedbackId, Guid userId)
        {
            var feedback = await _feedbackRepository.GetByIdAsync(feedbackId);

            if (feedback == null)
                throw new Exception("Feedback not found");

            var isOwner = await _feedbackRepository.IsUserOwnerAsync(feedbackId, userId);
            if (!isOwner)
                throw new UnauthorizedAccessException("You don't have permission to access this feedback");

            return MapToResponseDto(feedback);
        }

        public async Task<List<AIFeedbackResponseDto>> GetUserHistoryAsync(Guid userId, string? aiScorer)
        {
            var feedbacks = await _feedbackRepository.GetHistoryAsync(userId, aiScorer);
            return feedbacks.Select(MapToResponseDto).ToList();
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

        private async Task<(TestQuestion testQuestion, QuestionSnapshotDto snapshot)> GetTestQuestionSnapshotAsync(int testQuestionId)
        {
            var testQuestion = await _testQuestionRepository.GetByIdAsync(testQuestionId);
            if (testQuestion == null)
                throw new Exception($"TestQuestion {testQuestionId} not found");

            var snapshot = JsonSerializer.Deserialize<QuestionSnapshotDto>(testQuestion.SnapshotJson, _jsonOptions);
            if (snapshot == null)
                throw new Exception($"Failed to deserialize TestQuestion {testQuestionId} snapshot");

            return (testQuestion, snapshot);
        }

        private async Task<(TestResult testResult, UserAnswer userAnswer)> CreateWritingUserAnswerAsync(
            Guid userId,
            int testQuestionId,
            string answerText,
            int? testResultId = null)
        {
            TestResult testResult;

            // If testResultId provided, validate and use it
            if (testResultId.HasValue)
            {
                testResult = await _uow.TestResults.GetByIdAsync(testResultId.Value);
                if (testResult == null)
                    throw new Exception($"TestResult {testResultId.Value} not found");
                if (testResult.UserId != userId)
                    throw new UnauthorizedAccessException("You don't have permission to use this TestResult");
                if (testResult.Status == TestResultStatus.Graded)
                    throw new Exception("This test has already been completed");

                _logger.LogInformation("💾 Using provided TestResult: {TestResultId}", testResult.TestResultId);
            }
            else
            {
                // Backward compatible: use GetOrCreateActiveTestAsync
                testResult = await _uow.UserTests.GetOrCreateActiveTestAsync(userId);
                _logger.LogInformation("💾 Using or created TestResult: {TestResultId}", testResult.TestResultId);
            }

            var testQuestionExists = await _testQuestionRepository.GetByIdAsync(testQuestionId);
            if (testQuestionExists == null)
            {
                throw new Exception($"TestQuestion with ID {testQuestionId} does not exist");
            }

            var userAnswer = new UserAnswer
            {
                TestResultId = testResult.TestResultId,
                TestQuestionId = testQuestionId,
                AnswerText = answerText,
                CreatedAt = Now
            };

            await _uow.UserAnswers.AddAsync(userAnswer);
            await _uow.SaveChangesAsync();

            _logger.LogInformation("💾 Created Writing UserAnswer: {UserAnswerId} for TestResult: {TestResultId}",
                userAnswer.UserAnswerId, testResult.TestResultId);

            return (testResult, userAnswer);
        }

        private async Task<(TestResult testResult, UserAnswer userAnswer)> CreateSpeakingUserAnswerAsync(
            Guid userId,
            int testQuestionId,
            string audioUrl,
            int? testResultId = null)
        {
            TestResult testResult;

            // If testResultId provided, validate and use it
            if (testResultId.HasValue)
            {
                testResult = await _uow.TestResults.GetByIdAsync(testResultId.Value);
                if (testResult == null)
                    throw new Exception($"TestResult {testResultId.Value} not found");
                if (testResult.UserId != userId)
                    throw new UnauthorizedAccessException("You don't have permission to use this TestResult");
                if (testResult.Status == TestResultStatus.Graded)
                    throw new Exception("This test has already been completed");

                _logger.LogInformation("💾 Using provided TestResult: {TestResultId}", testResult.TestResultId);
            }
            else
            {
                // Backward compatible: use GetOrCreateActiveTestAsync
                testResult = await _uow.UserTests.GetOrCreateActiveTestAsync(userId);

                if (testResult.TestResultId == 0)
                {
                    await _uow.SaveChangesAsync();
                    _logger.LogInformation("💾 Saved new TestResult: {TestResultId}", testResult.TestResultId);
                }
                else
                {
                    _logger.LogInformation("💾 Using or created TestResult: {TestResultId}", testResult.TestResultId);
                }
            }

            var testQuestionExists = await _testQuestionRepository.GetByIdAsync(testQuestionId);
            if (testQuestionExists == null)
            {
                throw new Exception($"TestQuestion with ID {testQuestionId} does not exist");
            }

            var userAnswer = new UserAnswer
            {
                TestResultId = testResult.TestResultId,
                TestQuestionId = testQuestionId,
                AnswerAudioUrl = audioUrl,
                CreatedAt = Now
            };

            await _uow.UserAnswers.AddAsync(userAnswer);
            await _uow.SaveChangesAsync();

            _logger.LogInformation("💾 Created Speaking UserAnswer: {UserAnswerId} with Audio for TestResult: {TestResultId}",
                userAnswer.UserAnswerId, testResult.TestResultId);

            return (testResult, userAnswer);
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
                    : JsonSerializer.Deserialize<Dictionary<string, object>>(feedback.DetailedScoresJson, _jsonOptions)
                      ?? new Dictionary<string, object>(),
                DetailedAnalysis = string.IsNullOrEmpty(feedback.DetailedAnalysisJson)
                    ? new Dictionary<string, object>()
                    : JsonSerializer.Deserialize<Dictionary<string, object>>(feedback.DetailedAnalysisJson, _jsonOptions)
                      ?? new Dictionary<string, object>(),
                Recommendations = string.IsNullOrEmpty(feedback.RecommendationsJson)
                    ? new List<string>()
                    : JsonSerializer.Deserialize<List<string>>(feedback.RecommendationsJson, _jsonOptions)
                      ?? new List<string>(),
                Transcription = feedback.Transcription ?? string.Empty,
                CorrectedText = feedback.CorrectedText ?? string.Empty,
                AudioDuration = (double?)feedback.AudioDuration,
                PythonApiResponse = feedback.PythonApiResponse,
                CreatedAt = feedback.CreatedAt
            };
        }

        #endregion
    }
}