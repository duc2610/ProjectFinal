using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.DTOs.Requests.GroupQuestion;
using ToeicGenius.Domains.DTOs.Responses.QuestionGroup;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Services.Interfaces;

namespace ToeicGenius.Services.Implementations
{
    public class QuestionGroupService : IQuestionGroupService
    {
        private readonly IQuestionGroupRepository _questionGroupRepository;
        private readonly IQuestionRepository _questionRepository;
        private readonly IQuestionService _questionService;

        public QuestionGroupService(
            IQuestionGroupRepository questionGroupRepository,
            IQuestionRepository questionRepository,
            IQuestionService questionService)
        {
            _questionGroupRepository = questionGroupRepository;
            _questionRepository = questionRepository;
            _questionService = questionService;
        }

        public async Task<QuestionGroup> CreateAsync(QuestionGroup group)
        {
            return await _questionGroupRepository.AddAsync(group);
        }

		public async Task<QuestionGroupResponseDto?> GetQuestionGroupResponseByIdAsync(int id)
		{
			return await _questionGroupRepository.GetGroupWithQuestionsAsync(id);
		}

        public async Task<Result<QuestionGroupResponseDto>> CreateQuestionGroupAsync(QuestionGroupRequestDto request)
        {
            var group = new QuestionGroup
            {
                PartId = request.PartId,
                GroupType = request.GroupType,
                AudioUrl = request.AudioUrl,
                Image = request.Image,
                PassageContent = request.PassageContent,
                PassageType = request.PassageType,
                OrderIndex = request.OrderIndex
            };

            await _questionGroupRepository.AddAsync(group);

            // Tạo các câu hỏi con mới cho group này
            foreach (var q in request.Questions)
            {
                await _questionService.CreateAsync(q);
            }

            var response = await _questionGroupRepository.GetGroupWithQuestionsAsync(group.QuestionGroupId);
            return Result<QuestionGroupResponseDto>.Success(response);
        }

        public async Task<IEnumerable<QuestionGroupListItemDto>> FilterGroupsAsync(int? part)
        {
            return await _questionGroupRepository.FilterGroupsAsync(part);
        }
    }
}