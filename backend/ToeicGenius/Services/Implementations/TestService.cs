using Humanizer;
using Microsoft.EntityFrameworkCore;
using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.DTOs.Requests.Exam;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Domains.Enums;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Services.Interfaces;

namespace ToeicGenius.Services.Implementations
{
	public class TestService : ITestService
	{
		private readonly IUnitOfWork _uow;
		public TestService(IUnitOfWork unitOfWork)
		{
			_uow = unitOfWork;
		}
		public async Task<Result<string>> CreateTestFromBankAsync(CreateTestFromBankDto request)
		{
			await _uow.BeginTransactionAsync();
			try
			{
				if (!request.Parts.Any()) return Result<string>.Failure("At least one Part is required.");

				// Create Test entity
				var test = new Test
				{
					Title = request.Title,
					TestSkill = request.TestSkill,
					Description = request.Description,
					Duration = request.Duration,
					TestMode = request.TestMode,
					CreatedAt = DateTime.UtcNow,
					Status = CommonStatus.Active
				};

				var existingNumbers = new HashSet<int>();

				foreach(var partDto in request.Parts)
				{
					var part = await _uow.Parts.GetByIdAsync(partDto.PartId);
					if (part == null)
					{
						return Result<string>.Failure($"Part ID {partDto.PartId} does not exist.");
					}
					if (part.Skill != request.TestSkill)
					{
						return Result<string>.Failure($"Part ID {partDto.PartId} does not match TestSkill {request.TestSkill}.");
					}

					// Process QuestionGroups from Group Bank
					if (partDto.QuestionGroupIds.Any())
					{

					}

					// Process Question from Group Bank
				}
				return Result<string>.Success("");
			}
			catch (Exception ex)
			{
				return Result<string>.Failure(ex.ToString());
			}
		}

		public Task<Result<string>> CreateTestManualAsync()
		{
			throw new NotImplementedException();
		}
	}
}
