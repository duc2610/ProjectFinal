using Moq;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Services.Implementations;
using ToeicGenius.Services.Interfaces;

namespace ToeicGenius.Tests.UnitTests
{
	public class QuestionGroupServiceTests
	{
		private readonly Mock<IQuestionService> _questionService = new();
		private readonly Mock<IFileService > _fileService = new();
		private readonly Mock<IUnitOfWork> _uow = new();
		private QuestionGroupService CreateService()
		{
			return new QuestionGroupService(
				_questionService.Object,
				_fileService.Object,
				_uow.Object
			);
		}

		#region 1. QuestionGroupService_GetDetailAsync

		#endregion

		#region 2. QuestionGroupService_FilterQuestionGroupsAsync

		#endregion

		#region 3. QuestionGroupService_CreateAsync

		#endregion

		#region 4. QuestionGroupService_UpdateAsync

		#endregion
	}
}
