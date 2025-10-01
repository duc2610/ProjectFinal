using Microsoft.EntityFrameworkCore;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Domains.Enums;

namespace ToeicGenius.Repositories.Persistence
{
	public class ToeicGeniusDbContext : DbContext
	{
		public ToeicGeniusDbContext(DbContextOptions<ToeicGeniusDbContext> options) : base(options) { }
		public DbSet<User> Users => Set<User>();
		public DbSet<Role> Roles => Set<Role>();
		public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
		public DbSet<UserOtp> UserOtps => Set<UserOtp>();
		public DbSet<FlashcardSet> FlashcardSets => Set<FlashcardSet>();
		public DbSet<Flashcard> Flashcards => Set<Flashcard>();
		public DbSet<FlashcardProgress> FlashcardProgresses => Set<FlashcardProgress>();
		public DbSet<QuestionType> QuestionTypes => Set<QuestionType>();
		public DbSet<QuestionGroup> QuestionGroups => Set<QuestionGroup>();
		public DbSet<Question> Questions => Set<Question>();
		public DbSet<Option> Options => Set<Option>();
		public DbSet<SolutionDetail> SolutionDetails => Set<SolutionDetail>();
		public DbSet<Test> Tests => Set<Test>();
		public DbSet<Part> Parts => Set<Part>();
		public DbSet<UserTest> UserTests => Set<UserTest>();
		public DbSet<UserAnswer> UserAnswers => Set<UserAnswer>();
		public DbSet<AIFeedback> AIFeedbacks => Set<AIFeedback>();
		public DbSet<UserTestSkillScore> UserTestSkillScores => Set<UserTestSkillScore>();

		protected override void OnModelCreating(ModelBuilder modelBuilder)
		{
			base.OnModelCreating(modelBuilder);


			// Many-to-many User <-> Role
			modelBuilder.Entity<User>()
				.HasMany(u => u.Roles)
				.WithMany(r => r.Users)
				.UsingEntity<Dictionary<string, object>>(
					"UserRoles",
					j => j.HasOne<Role>().WithMany().HasForeignKey("RoleId"),
					j => j.HasOne<User>().WithMany().HasForeignKey("UserId"),
					j =>
					{
						j.HasKey("UserId", "RoleId");
						j.ToTable("UserRoles");
					}
				);

			modelBuilder.Entity<RefreshToken>()
				.HasOne(rt => rt.User)
				.WithMany(u => u.RefreshTokens)
				.HasForeignKey(rt => rt.UserId);

			// Flashcards
			modelBuilder.Entity<FlashcardSet>()
				.HasOne(fs => fs.User)
				.WithMany()
				.HasForeignKey(fs => fs.UserId);

			modelBuilder.Entity<Flashcard>()
				.HasOne(f => f.FlashcardSet)
				.WithMany(fs => fs.Flashcards)
				.HasForeignKey(f => f.SetId);

			modelBuilder.Entity<FlashcardProgress>()
				.HasOne(fp => fp.Flashcard)
				.WithMany(f => f.Progresses)
				.HasForeignKey(fp => fp.FlashcardId);

			// Question bank
			modelBuilder.Entity<Question>()
				.HasOne(q => q.QuestionType)
				.WithMany(qt => qt.Questions)
				.HasForeignKey(q => q.QuestionTypeId);

			modelBuilder.Entity<Question>()
				.HasOne(q => q.QuestionGroup)
				.WithMany(qg => qg.Questions)
				.HasForeignKey(q => q.QuestionGroupId)
				.IsRequired(false);

			modelBuilder.Entity<QuestionGroup>()
				.HasOne(qg => qg.Part)
				.WithMany(p => p.QuestionGroups)
				.HasForeignKey(qg => qg.PartId)
				.OnDelete(DeleteBehavior.Restrict);

			modelBuilder.Entity<Question>()
				.HasOne(q => q.Part)
				.WithMany(p => p.Questions)
				.HasForeignKey(q => q.PartId)
				.OnDelete(DeleteBehavior.Restrict);

			modelBuilder.Entity<Option>()
				.HasOne(o => o.Question)
				.WithMany(q => q.Options)
				.HasForeignKey(o => o.QuestionId);

			modelBuilder.Entity<Question>()
				.HasOne(q => q.SolutionDetail)
				.WithOne(sd => sd.Question)
				.HasForeignKey<SolutionDetail>(sd => sd.QuestionId)
				.OnDelete(DeleteBehavior.Cascade); // hoặc Restrict tùy ý bạn

			// Test-Part many-to-many
			modelBuilder.Entity<Test>()
				.HasMany(t => t.Parts)
				.WithMany(p => p.Tests)
				.UsingEntity<Dictionary<string, object>>(
					"TestParts",
					j => j.HasOne<Part>().WithMany().HasForeignKey("PartId"),
					j => j.HasOne<Test>().WithMany().HasForeignKey("TestId"),
					j => j.HasKey("TestId", "PartId")
				);

			// UserTest relations
			modelBuilder.Entity<UserTest>()
				.HasOne(ut => ut.User)
				.WithMany(u => u.UserTests)
				.HasForeignKey(ut => ut.UserId);
			modelBuilder.Entity<UserTest>()
				.HasOne(ut => ut.Test)
				.WithMany(t => t.UserTests)
				.HasForeignKey(ut => ut.TestId);
			modelBuilder.Entity<UserTest>()
				.Property(ut => ut.TotalScore)
				.HasPrecision(5, 2);

			modelBuilder.Entity<UserAnswer>()
				.HasOne(ua => ua.UserTest)
				.WithMany(ut => ut.UserAnswers)
				.HasForeignKey(ua => ua.UserTestId);
			modelBuilder.Entity<UserAnswer>()
				.HasOne(ua => ua.Question)
				.WithMany()
				.HasForeignKey(ua => ua.QuestionId);
			modelBuilder.Entity<UserAnswer>()
				.HasOne(ua => ua.Option)
				.WithMany()
				.HasForeignKey(ua => ua.OptionId)
				.IsRequired(false);

			modelBuilder.Entity<AIFeedback>()
				.HasOne(af => af.UserAnswer)
				.WithMany()
				.HasForeignKey(af => af.UserAnswerId);
			modelBuilder.Entity<AIFeedback>()
				.Property(af => af.Score)
				.HasPrecision(5, 2);

			modelBuilder.Entity<UserTestSkillScore>()
				.HasOne(ss => ss.UserTest)
				.WithMany(ut => ut.SkillScores)
				.HasForeignKey(ss => ss.UserTestId);
			modelBuilder.Entity<UserTestSkillScore>()
				.Property(uts => uts.Score)
				.HasPrecision(5, 2);

			// Default values
			modelBuilder.Entity<User>()
				.Property(u => u.CreatedAt)
				.HasDefaultValueSql("SYSUTCDATETIME()");

			modelBuilder.Entity<RefreshToken>()
				.Property(rt => rt.CreatedAt)
				.HasDefaultValueSql("SYSUTCDATETIME()");

			modelBuilder.Entity<FlashcardSet>()
				.Property(fs => fs.CreatedAt)
				.HasDefaultValueSql("SYSUTCDATETIME()");

			// Seed Roles
			modelBuilder.Entity<Role>().HasData(
				new Role { Id = 1, RoleName = "Admin" },
				new Role { Id = 2, RoleName = "User" },
				new Role { Id = 3, RoleName = "TestCreator" }
			);

			modelBuilder.Entity<QuestionType>().HasData(
				// Listening
				new QuestionType { QuestionTypeId = 1, Skill = "Listening", TypeName = "MCQ", Description = "Part 1 – Photographs" },
				new QuestionType { QuestionTypeId = 2, Skill = "Listening", TypeName = "MCQ", Description = "Part 2 – Question-Response" },
				new QuestionType { QuestionTypeId = 3, Skill = "Listening", TypeName = "MCQ", Description = "Part 3 – Conversations" },
				new QuestionType { QuestionTypeId = 4, Skill = "Listening", TypeName = "MCQ", Description = "Part 4 – Talks" },

				// Reading
				new QuestionType { QuestionTypeId = 5, Skill = "Reading", TypeName = "MCQ", Description = "Part 5 – Incomplete Sentences" },
				new QuestionType { QuestionTypeId = 6, Skill = "Reading", TypeName = "MCQ", Description = "Part 6 – Text Completion" },
				new QuestionType { QuestionTypeId = 7, Skill = "Reading", TypeName = "MCQ", Description = "Part 7 – Reading Comprehension" },

				// Speaking
				new QuestionType { QuestionTypeId = 8, Skill = "Speaking", TypeName = "ShortAnswer", Description = "Speaking – Short Answer / Read Aloud / Respond to Question" },

				// Writing
				new QuestionType { QuestionTypeId = 9, Skill = "Writing", TypeName = "Essay", Description = "Writing – Sentence / Paragraph / Email Writing" }
			);

			// Seed Part (Part of TOEIC Test)
			modelBuilder.Entity<Part>().HasData(
				// Listening & Reading (L&R) – 7 Parts
				new Part { PartId = 1, Name = "Part 1", PartNumber = 1, Skill = TestSkill.LR, Description = "Listening – Photographs" },
				new Part { PartId = 2, Name = "Part 2", PartNumber = 2, Skill = TestSkill.LR, Description = "Listening – Question-Response" },
				new Part { PartId = 3, Name = "Part 3", PartNumber = 3, Skill = TestSkill.LR, Description = "Listening – Conversations" },
				new Part { PartId = 4, Name = "Part 4", PartNumber = 4, Skill = TestSkill.LR, Description = "Listening – Talks" },
				new Part { PartId = 5, Name = "Part 5", PartNumber = 5, Skill = TestSkill.LR, Description = "Reading – Incomplete Sentences" },
				new Part { PartId = 6, Name = "Part 6", PartNumber = 6, Skill = TestSkill.LR, Description = "Reading – Text Completion" },
				new Part { PartId = 7, Name = "Part 7", PartNumber = 7, Skill = TestSkill.LR, Description = "Reading – Reading Comprehension" },

				// Writing – 3 Parts
				new Part { PartId = 8, Name = "Part 1", PartNumber = 1, Skill = TestSkill.Writing, Description = "Writing – Câu 1-5" },
				new Part { PartId = 9, Name = "Part 2", PartNumber = 2, Skill = TestSkill.Writing, Description = "Writing – Câu 6-7" },
				new Part { PartId = 10, Name = "Part 3", PartNumber = 3, Skill = TestSkill.Writing, Description = "Writing – Câu 8" },

				// Speaking – 5 Parts
				new Part { PartId = 11, Name = "Part 1", PartNumber = 1, Skill = TestSkill.Speaking, Description = "Speaking – Câu 1-2" },
				new Part { PartId = 12, Name = "Part 2", PartNumber = 2, Skill = TestSkill.Speaking, Description = "Speaking – Câu 3-4" },
				new Part { PartId = 13, Name = "Part 3", PartNumber = 3, Skill = TestSkill.Speaking, Description = "Speaking – Câu 5-7" },
				new Part { PartId = 14, Name = "Part 4", PartNumber = 4, Skill = TestSkill.Speaking, Description = "Speaking – Câu 8-10" },
				new Part { PartId = 15, Name = "Part 5", PartNumber = 5, Skill = TestSkill.Speaking, Description = "Speaking – Câu 11" }
			);

			// Seed QuestionGroup
			modelBuilder.Entity<QuestionGroup>().HasData(
				new QuestionGroup { QuestionGroupId = 1, PartId = 6, PassageContent = "Passage1" },
				new QuestionGroup { QuestionGroupId = 2, PartId = 7, PassageContent = "Passage2" },
				new QuestionGroup { QuestionGroupId = 3, PartId = 7, PassageContent = "Passage3" }
			);

			// Seed 10 single questions (không thuộc group)
			modelBuilder.Entity<Question>().HasData(
				new Question { QuestionId = 2, QuestionTypeId = 1, QuestionGroupId = null, PartId = 1, Content = "Single Question 2", Number = 2 },
				new Question { QuestionId = 3, QuestionTypeId = 2, QuestionGroupId = null, PartId = 2, Content = "Single Question 3", Number = 3 },
				new Question { QuestionId = 4, QuestionTypeId = 2, QuestionGroupId = null,PartId = 2, Content = "Single Question 4", Number = 4 },
				new Question { QuestionId = 5, QuestionTypeId = 1, QuestionGroupId = null, PartId = 1, Content = "Single Question 5", Number = 5 },
				new Question { QuestionId = 6, QuestionTypeId = 1, QuestionGroupId = null, PartId = 1, Content = "Single Question 6", Number = 6 },
				new Question { QuestionId = 7, QuestionTypeId = 2, QuestionGroupId = null,PartId = 2, Content = "Single Question 7", Number = 7 },
				new Question { QuestionId = 8, QuestionTypeId = 2, QuestionGroupId = null,PartId = 2, Content = "Single Question 8", Number = 8 },
				new Question { QuestionId = 9, QuestionTypeId = 1, QuestionGroupId = null,PartId = 1, Content = "Single Question 9", Number = 9 },
				new Question { QuestionId = 10, QuestionTypeId = 1, QuestionGroupId = null, PartId = 1, Content = "Single Question 10", Number = 10 }
			);

			// Seed 3 group, mỗi group có 3 câu hỏi con
			modelBuilder.Entity<Question>().HasData(
				// Group 1
				new Question { QuestionId = 11, QuestionTypeId = 1, QuestionGroupId = 1, PartId = 1, Content = "Group 1 - Question 1", Number = 1 },
				new Question { QuestionId = 12, QuestionTypeId = 1, QuestionGroupId = 1, PartId = 1, Content = "Group 1 - Question 2", Number = 2 },
				new Question { QuestionId = 13, QuestionTypeId = 1, QuestionGroupId = 1, PartId = 1, Content = "Group 1 - Question 3", Number = 3 },
				// Group 2
				new Question { QuestionId = 14, QuestionTypeId = 2, QuestionGroupId = 2, PartId = 2, Content = "Group 2 - Question 1", Number = 1 },
				new Question { QuestionId = 15, QuestionTypeId = 2, QuestionGroupId = 2, PartId = 2, Content = "Group 2 - Question 2", Number = 2 },
				new Question { QuestionId = 16, QuestionTypeId = 2, QuestionGroupId = 2, PartId = 2, Content = "Group 2 - Question 3", Number = 3 },
				// Group 3
				new Question { QuestionId = 17, QuestionTypeId = 1, QuestionGroupId = 3, PartId = 1, Content = "Group 3 - Question 1", Number = 1 },
				new Question { QuestionId = 18, QuestionTypeId = 1, QuestionGroupId = 3, PartId = 1, Content = "Group 3 - Question 2", Number = 2 },
				new Question { QuestionId = 19, QuestionTypeId = 1, QuestionGroupId = 3, PartId = 1, Content = "Group 3 - Question 3", Number = 3 }
			);

			// Question (single)
			modelBuilder.Entity<Question>().HasData(
				new Question { QuestionId = 1, QuestionTypeId = 1, QuestionGroupId = null, PartId = 1, Content = "What is the capital of France?", Number = 1, AudioUrl = null, ImageUrl = null }
			);

			// Option
			modelBuilder.Entity<Option>().HasData(
				new Option { OptionId = 1, QuestionId = 1, Content = "Paris", IsCorrect = true, OptionLabel = "A" },
				new Option { OptionId = 2, QuestionId = 1, Content = "London", IsCorrect = false, OptionLabel = "B" },
				new Option { OptionId = 3, QuestionId = 1, Content = "Berlin", IsCorrect = false, OptionLabel = "C" },
				new Option { OptionId = 4, QuestionId = 1, Content = "Madrid", IsCorrect = false, OptionLabel = "D" }
			);

			// SolutionDetail (1-1)
			modelBuilder.Entity<SolutionDetail>().HasData(
				new SolutionDetail { SolutionDetailId = 1, QuestionId = 1, Explanation = "Paris is the capital of France." }
			);

		}
	}
}
