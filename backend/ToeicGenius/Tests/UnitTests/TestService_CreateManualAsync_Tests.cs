using Moq;
using Xunit;
using FluentAssertions;
using ToeicGenius.Domains.DTOs.Requests.Exam;
using ToeicGenius.Domains.Enums;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Services.Implementations;
using ToeicGenius.Services.Interfaces;
using ToeicGenius.Domains.Entities;
using Microsoft.EntityFrameworkCore.Storage;
using ToeicGenius.Shared.Validators;

namespace ToeicGenius.Tests.UnitTests
{
	public class TestService_CreateManualAsync_Tests
	{
		private readonly Mock<IUnitOfWork> _mockUow;
		private readonly Mock<IFileService> _mockFileService;
		private readonly TestService _service;

		public TestService_CreateManualAsync_Tests()
		{
			_mockUow = new Mock<IUnitOfWork>();
			_mockFileService = new Mock<IFileService>();
			var fakeTransaction = new Mock<IDbContextTransaction>();

			_mockUow.Setup(x => x.BeginTransactionAsync()).ReturnsAsync(fakeTransaction.Object);
			_mockUow.Setup(x => x.CommitTransactionAsync()).Returns(Task.CompletedTask);
			_mockUow.Setup(x => x.SaveChangesAsync()).ReturnsAsync(1);
			_mockUow.Setup(x => x.Tests.AddAsync(It.IsAny<Test>())).ReturnsAsync(new Test { TestId = 1 });

			_mockFileService.Setup(f => f.RollbackAndCleanupAsync(It.IsAny<List<string>>()))
				.Returns(Task.CompletedTask);

			_service = new TestService(_mockUow.Object, _mockFileService.Object);
		}

		// ✅ CASE 1: L&R đủ 200 câu => PASS (no exception)
		[Fact]
		public void ValidateTestStructure_LR_With_200Questions_Should_Pass()
		{
			var dto = new CreateTestManualDto
			{
				Title = "LR full",
				TestSkill = TestSkill.LR,
				TestType = TestType.Simulator,
				Parts = new List<ManualPartDto>
				{
					new ManualPartDto
					{
						PartId = 1,
						Questions = GenerateQuestions(200, 4)
					}
				}
			};

			var ex = Record.Exception(() => TestValidator.ValidateTestStructure(dto));
			Assert.Null(ex);
		}

		// ❌ CASE 2: L&R có 199 câu => FAIL
		[Fact]
		public void ValidateTestStructure_LR_With_199Questions_Should_Fail()
		{
			var dto = new CreateTestManualDto
			{
				Title = "LR short",
				TestSkill = TestSkill.LR,
				TestType = TestType.Simulator,
				Parts = new List<ManualPartDto>
				{
					new ManualPartDto
					{
						PartId = 1,
						Questions = GenerateQuestions(199, 4)
					}
				}
			};

			var ex = Assert.Throws<Exception>(() => TestValidator.ValidateTestStructure(dto));
			ex.Message.Should().Contain("200 questions");
		}

		// ✅ CASE 3: Speaking đúng 11 câu => PASS
		[Fact]
		public void ValidateTestStructure_Speaking_With_11Questions_Should_Pass()
		{
			var dto = new CreateTestManualDto
			{
				Title = "Speaking",
				TestSkill = TestSkill.Speaking,
				TestType = TestType.Simulator,
				Parts = new List<ManualPartDto>
				{
					new ManualPartDto
					{
						PartId = 1,
						Questions = GenerateQuestions(11, 0) // speaking has no options in validator logic
                    }
				}
			};

			var ex = Record.Exception(() => TestValidator.ValidateTestStructure(dto));
			Assert.Null(ex);
		}

		// ❌ CASE 4: Writing chỉ có 7 câu (phải 8) => FAIL
		[Fact]
		public void ValidateTestStructure_Writing_With_7Questions_Should_Fail()
		{
			var dto = new CreateTestManualDto
			{
				Title = "Writing short",
				TestSkill = TestSkill.Writing,
				TestType = TestType.Simulator,
				Parts = new List<ManualPartDto>
				{
					new ManualPartDto
					{
						PartId = 1,
						Questions = GenerateQuestions(7, 0)
					}
				}
			};

			var ex = Assert.Throws<Exception>(() => TestValidator.ValidateTestStructure(dto));
			ex.Message.Should().Contain("Writing must have exactly 8 questions");
		}

		// ❌ CASE 5: Part 2 có 4 option thay vì 3 => FAIL
		[Fact]
		public void ValidateTestStructure_Part2_With_4Options_Should_Fail()
		{
			var dto = new CreateTestManualDto
			{
				Title = "LR Part2 wrong options",
				TestSkill = TestSkill.LR,
				TestType = TestType.Simulator,
				Parts = new List<ManualPartDto>
				{
					new ManualPartDto
					{
						PartId = 2,
						Questions = GenerateQuestions(3, 4) // each question has 4 options -> invalid for part 2
                    },
                    // add remaining questions to reach 200 so the validator hits the option-check as well:
                    new ManualPartDto
					{
						PartId = 1,
						Questions = GenerateQuestions(197, 4)
					}
				}
			};

			var ex = Assert.Throws<Exception>(() => TestValidator.ValidateTestStructure(dto));
			ex.Message.Should().Contain("Part 2 must have exactly 3 options");
		}

		// ❌ CASE 6: Group có 1 câu => FAIL
		[Fact]
		public void ValidateTestStructure_Group_With_1Question_Should_Fail()
		{
			var dto = new CreateTestManualDto
			{
				Title = "LR group small",
				TestSkill = TestSkill.LR,
				TestType = TestType.Simulator,
				Parts = new List<ManualPartDto>
				{
					new ManualPartDto
					{
						PartId = 3,
						Groups = new List<ManualQuestionGroupDto>
						{
							new ManualQuestionGroupDto
							{
								Passage = "Short passage",
								Questions = GenerateQuestions(1, 4) // group with single question -> invalid
                            }
						},
                        // fill other parts to reach 200 total so that the total-check doesn't block
                        Questions = GenerateQuestions(199, 4) // combine to ensure total==200 (1 in group + 199)
                    }
				}
			};

			var ex = Assert.Throws<Exception>(() => TestValidator.ValidateTestStructure(dto));
			ex.Message.Should().Contain("must have 2–5 questions");
		}

		// Helper: generate list of ManualQuestionDto with given option count
		private static List<ManualQuestionDto> GenerateQuestions(int count, int optionCount)
		{
			var list = new List<ManualQuestionDto>();
			for (int i = 0; i < count; i++)
			{
				var q = new ManualQuestionDto
				{
					Content = $"Q{i + 1}",
					Explanation = $"Explanation {i + 1}",
					Options = optionCount > 0 ? GenerateOptions(optionCount) : new List<ManualOptionDto>()
				};
				list.Add(q);
			}
			return list;
		}

		// Helper: generate options (A,B,C,...)
		private static List<ManualOptionDto> GenerateOptions(int count)
		{
			var options = new List<ManualOptionDto>();
			for (int i = 0; i < count; i++)
			{
				options.Add(new ManualOptionDto
				{
					Label = ((char)('A' + (i % 26))).ToString(),
					Content = $"Option {i + 1}",
					IsCorrect = i == 0
				});
			}
			return options;
		}

		private static Microsoft.AspNetCore.Http.IFormFile MockFile(string name)
		{
			var stream = new System.IO.MemoryStream(new byte[10]);
			return new FormFile(stream, 0, 10, "file", name);
		}
	}
}
