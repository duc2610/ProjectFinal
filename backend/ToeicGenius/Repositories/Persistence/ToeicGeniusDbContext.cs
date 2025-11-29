using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using System.Text.Json;
using ToeicGenius.Domains.DTOs.Requests.Question;
using ToeicGenius.Domains.DTOs.Responses.Question;
using ToeicGenius.Domains.DTOs.Responses.QuestionGroup;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Domains.Enums;
using ToeicGenius.Shared.Helpers;
using static ToeicGenius.Shared.Helpers.DateTimeHelper;

namespace ToeicGenius.Repositories.Persistence
{
	public class ToeicGeniusDbContext : DbContext
	{
		private readonly IConfiguration _configuration;
		public ToeicGeniusDbContext(DbContextOptions<ToeicGeniusDbContext> options, IConfiguration configuration) : base(options)
		{
			_configuration = configuration;
		}
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
		public DbSet<Test> Tests => Set<Test>();
		public DbSet<TestQuestion> TestQuestions => Set<TestQuestion>();
		public DbSet<Part> Parts => Set<Part>();
		public DbSet<TestResult> TestResults => Set<TestResult>();
		public DbSet<UserAnswer> UserAnswers => Set<UserAnswer>();
		public DbSet<AIFeedback> AIFeedbacks => Set<AIFeedback>();
		public DbSet<UserTestSkillScore> UserTestSkillScores => Set<UserTestSkillScore>();
		public DbSet<QuestionReport> QuestionReports => Set<QuestionReport>();

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
				.HasForeignKey(fp => fp.CardId);

			modelBuilder.Entity<FlashcardProgress>()
				.HasOne(fp => fp.User)
				.WithMany()
				.HasForeignKey(fp => fp.UserId)
				.OnDelete(DeleteBehavior.Restrict);

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

			modelBuilder.Entity<QuestionType>()
				.HasOne(q => q.Part)
				.WithMany(p => p.QuestionTypes)
				.HasForeignKey(q => q.PartId)
				.OnDelete(DeleteBehavior.Restrict);

			modelBuilder.Entity<Option>()
				.HasOne(o => o.Question)
				.WithMany(q => q.Options)
				.HasForeignKey(o => o.QuestionId);

			// Test - TestQuestion
			// SnapshotJson is just string; no converter necessary.
			modelBuilder.Entity<TestQuestion>()
				.Property(tq => tq.SnapshotJson)
				.HasColumnType("nvarchar(max)");

			modelBuilder.Entity<Test>()
				.HasMany(t => t.TestQuestions)
				.WithOne(q => q.Test)
				.HasForeignKey(q => q.TestId)
				.OnDelete(DeleteBehavior.Cascade);

			modelBuilder.Entity<Test>()
				.HasOne(t => t.CreatedBy)
				.WithMany()
				.HasForeignKey(q => q.CreatedById)
				.OnDelete(DeleteBehavior.Restrict);

			modelBuilder.Entity<TestQuestion>()
				.HasOne(t => t.Part)
				.WithMany()
				.HasForeignKey(q => q.PartId)
				.OnDelete(DeleteBehavior.SetNull);

			// UserTest relations
			modelBuilder.Entity<TestResult>()
				.HasOne(ut => ut.User)
				.WithMany(u => u.UserTests)
				.HasForeignKey(ut => ut.UserId);
			modelBuilder.Entity<TestResult>()
				.HasOne(ut => ut.Test)
				.WithMany(t => t.TestResults)
				.HasForeignKey(ut => ut.TestId);
			modelBuilder.Entity<TestResult>()
				.Property(ut => ut.TotalScore)
				.HasPrecision(5, 2);

			modelBuilder.Entity<UserAnswer>()
				.HasOne(ua => ua.TestResult)
				.WithMany(ut => ut.UserAnswers)
				.HasForeignKey(ua => ua.TestResultId)
				.OnDelete(DeleteBehavior.Cascade);
			modelBuilder.Entity<UserAnswer>()
				.HasOne(ua => ua.TestQuestion)
				.WithMany()
				.HasForeignKey(ua => ua.TestQuestionId)
				.OnDelete(DeleteBehavior.Restrict);

			modelBuilder.Entity<AIFeedback>()
				.HasOne(af => af.UserAnswer)
				.WithMany()
				.HasForeignKey(af => af.UserAnswerId);
			modelBuilder.Entity<AIFeedback>()
				.Property(af => af.Score)
				.HasPrecision(5, 2);

			modelBuilder.Entity<UserTestSkillScore>()
				.HasOne(ss => ss.TestResult)
				.WithMany(ut => ut.SkillScores)
				.HasForeignKey(ss => ss.TestResultId);
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
				new Role { Id = 2, RoleName = "Examinee" },
				new Role { Id = 3, RoleName = "TestCreator" }
			);
			// Seed Part (Part of TOEIC Test)
			modelBuilder.Entity<Part>().HasData(
				// Listening & Reading (L&R) – 7 Parts
				new Part { PartId = 1, Name = "L-Part 1", PartNumber = 1, Skill = QuestionSkill.Listening, Description = "Photographs" },
				new Part { PartId = 2, Name = "L-Part 2", PartNumber = 2, Skill = QuestionSkill.Listening, Description = "Question-Response" },
				new Part { PartId = 3, Name = "L-Part 3", PartNumber = 3, Skill = QuestionSkill.Listening, Description = "Conversations" },
				new Part { PartId = 4, Name = "L-Part 4", PartNumber = 4, Skill = QuestionSkill.Listening, Description = "Talks" },

				new Part { PartId = 5, Name = "R-Part 5", PartNumber = 5, Skill = QuestionSkill.Reading, Description = "Incomplete Sentences" },
				new Part { PartId = 6, Name = "R-Part 6", PartNumber = 6, Skill = QuestionSkill.Reading, Description = "Text Completion" },
				new Part { PartId = 7, Name = "R-Part 7", PartNumber = 7, Skill = QuestionSkill.Reading, Description = "Reading Comprehension" },

				// Writing – 3 Parts
				new Part { PartId = 8, Name = "W-Part 1", PartNumber = 1, Skill = QuestionSkill.Writing, Description = "Write a sentence based on a picture" },
				new Part { PartId = 9, Name = "W-Part 2", PartNumber = 2, Skill = QuestionSkill.Writing, Description = "Respond to a written request" },
				new Part { PartId = 10, Name = "W-Part 3", PartNumber = 3, Skill = QuestionSkill.Writing, Description = "Write an opinion essay" },

				// Speaking – 5 Parts
				new Part { PartId = 11, Name = "S-Part 1", PartNumber = 1, Skill = QuestionSkill.Speaking, Description = "Read a text aloud" },
				new Part { PartId = 12, Name = "S-Part 2", PartNumber = 2, Skill = QuestionSkill.Speaking, Description = "Describe a picture" },
				new Part { PartId = 13, Name = "S-Part 3", PartNumber = 3, Skill = QuestionSkill.Speaking, Description = "Respond to questions" },
				new Part { PartId = 14, Name = "S-Part 4", PartNumber = 4, Skill = QuestionSkill.Speaking, Description = "Respond to questions using information provided" },
				new Part { PartId = 15, Name = "S-Part 5", PartNumber = 5, Skill = QuestionSkill.Speaking, Description = "Express an opinion" }
			);

			modelBuilder.Entity<QuestionType>().HasData(
				// --- TOEIC Listening & Reading (L&R) ---
				// Part 1: Photographs (6 câu)
				new QuestionType { QuestionTypeId = 1, Description = "MCQ", TypeName = "[P1] Tranh tả người (Hành động/Trạng thái)", PartId = 1 },
				new QuestionType { QuestionTypeId = 2, Description = "MCQ", TypeName = "[P1] Tranh tả vật/Phong cảnh (Vị trí/Trạng thái tĩnh)", PartId = 1 },
				new QuestionType { QuestionTypeId = 3, Description = "MCQ", TypeName = "[P1] Tranh tả vật đang được thực hiện (Bị động tiếp diễn)", PartId = 1 },

				// Part 2: Question-Response (25 câu)
				new QuestionType { QuestionTypeId = 4, Description = "MCQ", TypeName = "[P2] Câu hỏi W/H (Who, What, When, Where, Why, How)", PartId = 2 },
				new QuestionType { QuestionTypeId = 5, Description = "MCQ", TypeName = "[P2] Câu hỏi YES/NO", PartId = 2 },
				new QuestionType { QuestionTypeId = 6, Description = "MCQ", TypeName = "[P2] Câu hỏi lựa chọn (OR Question)", PartId = 2 },
				new QuestionType { QuestionTypeId = 7, Description = "MCQ", TypeName = "[P2] Câu hỏi đuôi / Xác nhận (Tag/Negative Questions)", PartId = 2 },
				new QuestionType { QuestionTypeId = 8, Description = "MCQ", TypeName = "[P2] Câu yêu cầu, đề nghị, gợi ý (Request/Suggestion)", PartId = 2 },
				new QuestionType { QuestionTypeId = 9, Description = "MCQ", TypeName = "[P2] Câu trần thuật (Statement/Response)", PartId = 2 },

				// Part 3: Conversations (39 câu)
				new QuestionType { QuestionTypeId = 10, Description = "MCQ", TypeName = "[P3] Hỏi về ý chính/Mục đích hội thoại (Purpose/Gist)", PartId = 3 },
				new QuestionType { QuestionTypeId = 11, Description = "MCQ", TypeName = "[P3] Hỏi chi tiết thông tin được đề cập (Detail)", PartId = 3 },
				new QuestionType { QuestionTypeId = 12, Description = "MCQ", TypeName = "[P3] Hỏi về hành động tiếp theo (Action/Do-next)", PartId = 3 },
				new QuestionType { QuestionTypeId = 13, Description = "MCQ", TypeName = "[P3] Hỏi suy luận/Ý định/Thái độ (Inference/Attitude)", PartId = 3 },
				new QuestionType { QuestionTypeId = 14, Description = "MCQ", TypeName = "[P3] Hỏi dựa vào Hình/Bảng dữ liệu (Graphic Question)", PartId = 3 },

				// Part 4: Talks (30 câu)
				new QuestionType { QuestionTypeId = 15, Description = "MCQ", TypeName = "[P4] Hỏi nội dung chính/Chủ đề bài nói (Main Topic)", PartId = 4 },
				new QuestionType { QuestionTypeId = 16, Description = "MCQ", TypeName = "[P4] Hỏi chi tiết thông tin được đề cập (Detail)", PartId = 4 },
				new QuestionType { QuestionTypeId = 17, Description = "MCQ", TypeName = "[P4] Hỏi suy luận/Hàm ý (Inference/Imply)", PartId = 4 },
				new QuestionType { QuestionTypeId = 18, Description = "MCQ", TypeName = "[P4] Hỏi hành động người nghe nên làm (Listener Action)", PartId = 4 },
				new QuestionType { QuestionTypeId = 19, Description = "MCQ", TypeName = "[P4] Hỏi dựa vào Hình/Bảng dữ liệu (Graphic Question)", PartId = 4 },

				// Part 5: Incomplete Sentences (30 câu)
				new QuestionType { QuestionTypeId = 20, Description = "MCQ", TypeName = "[P5] Ngữ pháp (Thì, Câu điều kiện, Liên từ, Giới từ,...) ", PartId = 5 },
				new QuestionType { QuestionTypeId = 21, Description = "MCQ", TypeName = "[P5] Từ loại (N, V, Adj, Adv)", PartId = 5 },
				new QuestionType { QuestionTypeId = 22, Description = "MCQ", TypeName = "[P5] Từ vựng (Nghĩa của từ)", PartId = 5 },

				// Part 6: Text Completion (16 câu)
				// (Phân loại theo loại văn bản)
				new QuestionType { QuestionTypeId = 23, Description = "MCQ", TypeName = "[P6] Hoàn thành câu/Từ loại/Từ vựng trong đoạn văn", PartId = 6 },
				new QuestionType { QuestionTypeId = 24, Description = "MCQ", TypeName = "[P6] Chọn câu phù hợp để điền vào chỗ trống", PartId = 6 },
				// Loại văn bản thường gặp: Email/Letter, Memo, Announcement/Notice, Article/Review, Advertisement.

				// Part 7: Reading Comprehension (54 câu)
				new QuestionType { QuestionTypeId = 25, Description = "MCQ", TypeName = "[P7] Hỏi về ý chính/Mục đích (Main Idea/Purpose)", PartId = 7 },
				new QuestionType { QuestionTypeId = 26, Description = "MCQ", TypeName = "[P7] Tìm thông tin chi tiết (Specific Detail)", PartId = 7 },
				new QuestionType { QuestionTypeId = 27, Description = "MCQ", TypeName = "[P7] Suy luận/Thông tin không đề cập (Inference/NOT TRUE)", PartId = 7 },
				new QuestionType { QuestionTypeId = 28, Description = "MCQ", TypeName = "[P7] Tìm từ đồng nghĩa (Synonym/Meaning)", PartId = 7 },
				new QuestionType { QuestionTypeId = 29, Description = "MCQ", TypeName = "[P7] Thêm câu vào chỗ trống (Sentence Insertion - Chỉ trong Multi-Passage)", PartId = 7 },
				new QuestionType { QuestionTypeId = 30, Description = "MCQ", TypeName = "[P7] Liên kết thông tin giữa các đoạn (Connecting Information)", PartId = 7 },

				// --- TOEIC Speaking (SW) ---

				// Speaking (11 câu)
				new QuestionType { QuestionTypeId = 31, Description = "ShortAnswer", TypeName = "[Speaking] Đọc to đoạn văn (Read a text aloud)", PartId = 11 },
				new QuestionType { QuestionTypeId = 32, Description = "ShortAnswer", TypeName = "[Speaking] Mô tả tranh (Describe a picture)", PartId = 12 },
				new QuestionType { QuestionTypeId = 33, Description = "ShortAnswer", TypeName = "[Speaking] Trả lời câu hỏi cá nhân (Respond to questions Q5-7)", PartId = 13 },
				new QuestionType { QuestionTypeId = 34, Description = "ShortAnswer", TypeName = "[Speaking] Trả lời dựa vào bảng/lịch (Respond to questions Q8-10)", PartId = 14 },
				new QuestionType { QuestionTypeId = 35, Description = "ShortAnswer", TypeName = "[Speaking] Bày tỏ ý kiến cá nhân (Express an opinion Q11)", PartId = 15 },

				// --- TOEIC Writing (SW) ---

				// Writing (8 câu)
				new QuestionType { QuestionTypeId = 36, Description = "Essay", TypeName = "[Writing] Viết câu dựa vào tranh (Write a sentence Q1-5)", PartId = 8 },
				new QuestionType { QuestionTypeId = 37, Description = "Essay", TypeName = "[Writing] Viết thư trả lời yêu cầu (Respond to a written request Q6-7)", PartId = 9 },
				new QuestionType { QuestionTypeId = 38, Description = "Essay", TypeName = "[Writing] Viết luận nêu ý kiến cá nhân (Write an opinion essay Q8)", PartId = 10 }
			);



			// ----------------------------
			// Question Group
			// ----------------------------
			modelBuilder.Entity<QuestionGroup>().HasData(
				new QuestionGroup { QuestionGroupId = 1, PartId = 3, PassageContent = "Passage for Part 3 - Short Conversation" },
				new QuestionGroup { QuestionGroupId = 2, PartId = 4, PassageContent = "Passage for Part 4 - Short Talk" },
				new QuestionGroup { QuestionGroupId = 3, PartId = 6, PassageContent = "Passage for Part 6 - Text Completion" },
				new QuestionGroup { QuestionGroupId = 4, PartId = 7, PassageContent = "Passage for Part 7 - Reading Comprehension" }
			);

			// ----------------------------
			// Single Questions (not in group)
			// ----------------------------
			modelBuilder.Entity<Question>().HasData(
				new Question { QuestionId = 1, QuestionTypeId = 1, QuestionGroupId = null, PartId = 1, Content = "What is the capital of France?" },
				new Question { QuestionId = 2, QuestionTypeId = 1, QuestionGroupId = null, PartId = 2, Content = "Where does he live?" },
				new Question { QuestionId = 3, QuestionTypeId = 2, QuestionGroupId = null, PartId = 2, Content = "What time does she start work?" },
				new Question { QuestionId = 4, QuestionTypeId = 2, QuestionGroupId = null, PartId = 1, Content = "Which color do you like?" },
				new Question { QuestionId = 5, QuestionTypeId = 1, QuestionGroupId = null, PartId = 5, Content = "Select the correct sentence." },
				new Question { QuestionId = 6, QuestionTypeId = 1, QuestionGroupId = null, PartId = 11, Content = "Describe your favorite city." },
				new Question { QuestionId = 7, QuestionTypeId = 1, QuestionGroupId = null, PartId = 9, Content = "Write a short essay about your hometown." }
			);

			// ----------------------------
			// Questions inside groups
			// ----------------------------
			modelBuilder.Entity<Question>().HasData(
				// Group 1 (Part 3)
				new Question { QuestionId = 11, QuestionTypeId = 1, QuestionGroupId = 1, PartId = 3, Content = "Group 1 - Q1" },
				new Question { QuestionId = 12, QuestionTypeId = 1, QuestionGroupId = 1, PartId = 3, Content = "Group 1 - Q2" },
				new Question { QuestionId = 13, QuestionTypeId = 1, QuestionGroupId = 1, PartId = 3, Content = "Group 1 - Q3" },

				// Group 2 (Part 4)
				new Question { QuestionId = 14, QuestionTypeId = 2, QuestionGroupId = 2, PartId = 4, Content = "Group 2 - Q1" },
				new Question { QuestionId = 15, QuestionTypeId = 2, QuestionGroupId = 2, PartId = 4, Content = "Group 2 - Q2" },
				new Question { QuestionId = 16, QuestionTypeId = 2, QuestionGroupId = 2, PartId = 4, Content = "Group 2 - Q3" },

				// Group 3 (Part 6)
				new Question { QuestionId = 17, QuestionTypeId = 1, QuestionGroupId = 3, PartId = 6, Content = "Group 3 - Q1" },
				new Question { QuestionId = 18, QuestionTypeId = 1, QuestionGroupId = 3, PartId = 6, Content = "Group 3 - Q2" },
				new Question { QuestionId = 19, QuestionTypeId = 1, QuestionGroupId = 3, PartId = 6, Content = "Group 3 - Q3" },

				// Group 4 (Part 7)
				new Question { QuestionId = 20, QuestionTypeId = 2, QuestionGroupId = 4, PartId = 7, Content = "Group 4 - Q1" },
				new Question { QuestionId = 21, QuestionTypeId = 2, QuestionGroupId = 4, PartId = 7, Content = "Group 4 - Q2" },
				new Question { QuestionId = 22, QuestionTypeId = 2, QuestionGroupId = 4, PartId = 7, Content = "Group 4 - Q3" }
			);

			// ----------------------------
			// Options (the rules applied)
			// ----------------------------
			modelBuilder.Entity<Option>().HasData(
				// QuestionId = 1 → 4 options
				new Option { OptionId = 1, QuestionId = 1, Content = "Paris", IsCorrect = true, Label = "A" },
				new Option { OptionId = 2, QuestionId = 1, Content = "London", IsCorrect = false, Label = "B" },
				new Option { OptionId = 3, QuestionId = 1, Content = "Berlin", IsCorrect = false, Label = "C" },
				new Option { OptionId = 4, QuestionId = 1, Content = "Madrid", IsCorrect = false, Label = "D" },

				// QuestionId = 2 → PartId = 2 → 3 options only
				new Option { OptionId = 5, QuestionId = 2, Content = "At home", IsCorrect = true, Label = "A" },
				new Option { OptionId = 6, QuestionId = 2, Content = "At work", IsCorrect = false, Label = "B" },
				new Option { OptionId = 7, QuestionId = 2, Content = "At school", IsCorrect = false, Label = "C" },

				// QuestionId = 3 → PartId = 2 → 3 options only
				new Option { OptionId = 8, QuestionId = 3, Content = "8 AM", IsCorrect = true, Label = "A" },
				new Option { OptionId = 9, QuestionId = 3, Content = "9 AM", IsCorrect = false, Label = "B" },
				new Option { OptionId = 10, QuestionId = 3, Content = "10 AM", IsCorrect = false, Label = "C" },

				// QuestionId = 4 → 4 options
				new Option { OptionId = 11, QuestionId = 4, Content = "Red", IsCorrect = true, Label = "A" },
				new Option { OptionId = 12, QuestionId = 4, Content = "Green", IsCorrect = false, Label = "B" },
				new Option { OptionId = 13, QuestionId = 4, Content = "Blue", IsCorrect = false, Label = "C" },
				new Option { OptionId = 14, QuestionId = 4, Content = "Yellow", IsCorrect = false, Label = "D" },

				// QuestionId = 5 → 4 options
				new Option { OptionId = 15, QuestionId = 5, Content = "She goes to school.", IsCorrect = true, Label = "A" },
				new Option { OptionId = 16, QuestionId = 5, Content = "She go to school.", IsCorrect = false, Label = "B" },
				new Option { OptionId = 17, QuestionId = 5, Content = "She going to school.", IsCorrect = false, Label = "C" },
				new Option { OptionId = 18, QuestionId = 5, Content = "She gone to school.", IsCorrect = false, Label = "D" },

				// Group question examples (all 4 options)
				new Option { OptionId = 19, QuestionId = 11, Content = "Option A", IsCorrect = true, Label = "A" },
				new Option { OptionId = 20, QuestionId = 11, Content = "Option B", IsCorrect = false, Label = "B" },
				new Option { OptionId = 21, QuestionId = 11, Content = "Option C", IsCorrect = false, Label = "C" },
				new Option { OptionId = 22, QuestionId = 11, Content = "Option D", IsCorrect = false, Label = "D" }
			);

			// Seed default account
			var adminConfig = _configuration.GetSection("DefaultAccounts:Admin");
			var creatorConfig = _configuration.GetSection("DefaultAccounts:TestCreator");
			var examineeConfig = _configuration.GetSection("DefaultAccounts:Examinee");
			// Tạo Guid cố định để không thay đổi giữa các migration
			var adminId = Guid.Parse("11111111-1111-1111-1111-111111111111");
			var creatorId = Guid.Parse("22222222-2222-2222-2222-222222222222");
			var examineeId = Guid.Parse("33333333-3333-3333-3333-333333333333");
			modelBuilder.Entity<User>().HasData(
				new User
				{
					Id = adminId,
					Email = adminConfig["Email"]!,
					FullName = adminConfig["FullName"]!,
					PasswordHash = SecurityHelper.HashPassword(adminConfig["Password"]!),
					Status = UserStatus.Active,
					CreatedAt = Now,
					IsRoot = true
				},
				new User
				{
					Id = creatorId,
					Email = creatorConfig["Email"]!,
					FullName = creatorConfig["FullName"]!,
					PasswordHash = SecurityHelper.HashPassword(creatorConfig["Password"]!),
					Status = UserStatus.Active,
					CreatedAt = Now
				},
				new User
				{
					Id = examineeId,
					Email = examineeConfig["Email"]!,
					FullName = examineeConfig["FullName"]!,
					PasswordHash = SecurityHelper.HashPassword(examineeConfig["Password"]!),
					Status = UserStatus.Active,
					CreatedAt = Now
				}
			);
			// Seed bảng trung gian ẩn danh (UserRoles)
			modelBuilder.SharedTypeEntity<Dictionary<string, object>>("UserRoles").HasData(
				new { UserId = adminId, RoleId = 1 },
				new { UserId = creatorId, RoleId = 3 },
				new { UserId = examineeId, RoleId = 2 }
			);
		}
	}
}
