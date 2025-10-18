using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ToeicGenius.Migrations
{
    /// <inheritdoc />
    public partial class DatabaseV03 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Parts",
                columns: table => new
                {
                    PartId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PartNumber = table.Column<int>(type: "int", nullable: false),
                    Skill = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Parts", x => x.PartId);
                });

            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoleName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UserOtps",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    OtpCodeHash = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UsedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserOtps", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    GoogleId = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    FullName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "QuestionGroups",
                columns: table => new
                {
                    QuestionGroupId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PartId = table.Column<int>(type: "int", nullable: false),
                    AudioUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PassageContent = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PassageType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OrderIndex = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuestionGroups", x => x.QuestionGroupId);
                    table.ForeignKey(
                        name: "FK_QuestionGroups_Parts_PartId",
                        column: x => x.PartId,
                        principalTable: "Parts",
                        principalColumn: "PartId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "QuestionTypes",
                columns: table => new
                {
                    QuestionTypeId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TypeName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PartId = table.Column<int>(type: "int", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Skill = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuestionTypes", x => x.QuestionTypeId);
                    table.ForeignKey(
                        name: "FK_QuestionTypes_Parts_PartId",
                        column: x => x.PartId,
                        principalTable: "Parts",
                        principalColumn: "PartId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "FlashcardSets",
                columns: table => new
                {
                    SetId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsPublic = table.Column<bool>(type: "bit", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FlashcardSets", x => x.SetId);
                    table.ForeignKey(
                        name: "FK_FlashcardSets_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RefreshTokens",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Token = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    CreatedByIp = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    RevokeAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RevokeByIp = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    ReplacedByToken = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RefreshTokens", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RefreshTokens_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tests",
                columns: table => new
                {
                    TestId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TestType = table.Column<int>(type: "int", maxLength: 50, nullable: false),
                    TestSkill = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AudioUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Duration = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    CreatedById = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    PartId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tests", x => x.TestId);
                    table.ForeignKey(
                        name: "FK_Tests_Parts_PartId",
                        column: x => x.PartId,
                        principalTable: "Parts",
                        principalColumn: "PartId");
                    table.ForeignKey(
                        name: "FK_Tests_Users_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "UserRoles",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RoleId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserRoles", x => new { x.UserId, x.RoleId });
                    table.ForeignKey(
                        name: "FK_UserRoles_Roles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "Roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserRoles_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Questions",
                columns: table => new
                {
                    QuestionId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    QuestionTypeId = table.Column<int>(type: "int", nullable: false),
                    QuestionGroupId = table.Column<int>(type: "int", nullable: true),
                    PartId = table.Column<int>(type: "int", nullable: false),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Number = table.Column<int>(type: "int", nullable: false),
                    AudioUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Explanation = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Questions", x => x.QuestionId);
                    table.ForeignKey(
                        name: "FK_Questions_Parts_PartId",
                        column: x => x.PartId,
                        principalTable: "Parts",
                        principalColumn: "PartId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Questions_QuestionGroups_QuestionGroupId",
                        column: x => x.QuestionGroupId,
                        principalTable: "QuestionGroups",
                        principalColumn: "QuestionGroupId");
                    table.ForeignKey(
                        name: "FK_Questions_QuestionTypes_QuestionTypeId",
                        column: x => x.QuestionTypeId,
                        principalTable: "QuestionTypes",
                        principalColumn: "QuestionTypeId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Flashcards",
                columns: table => new
                {
                    CardId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SetId = table.Column<int>(type: "int", nullable: false),
                    FrontText = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BackText = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AudioUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MediaUrl = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Flashcards", x => x.CardId);
                    table.ForeignKey(
                        name: "FK_Flashcards_FlashcardSets_SetId",
                        column: x => x.SetId,
                        principalTable: "FlashcardSets",
                        principalColumn: "SetId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TestQuestion",
                columns: table => new
                {
                    TestQuestionId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TestId = table.Column<int>(type: "int", nullable: false),
                    OrderInTest = table.Column<int>(type: "int", nullable: false),
                    PartId = table.Column<int>(type: "int", nullable: true),
                    OriginalQuestionId = table.Column<int>(type: "int", nullable: true),
                    OriginalQuestionGroupId = table.Column<int>(type: "int", nullable: true),
                    SnapshotJson = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TestQuestion", x => x.TestQuestionId);
                    table.ForeignKey(
                        name: "FK_TestQuestion_Parts_PartId",
                        column: x => x.PartId,
                        principalTable: "Parts",
                        principalColumn: "PartId",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_TestQuestion_Tests_TestId",
                        column: x => x.TestId,
                        principalTable: "Tests",
                        principalColumn: "TestId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserTests",
                columns: table => new
                {
                    UserTestId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TestId = table.Column<int>(type: "int", nullable: false),
                    StartTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Duration = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TotalScore = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    TestMode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserTests", x => x.UserTestId);
                    table.ForeignKey(
                        name: "FK_UserTests_Tests_TestId",
                        column: x => x.TestId,
                        principalTable: "Tests",
                        principalColumn: "TestId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserTests_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Options",
                columns: table => new
                {
                    OptionId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    QuestionId = table.Column<int>(type: "int", nullable: false),
                    Label = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsCorrect = table.Column<bool>(type: "bit", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Options", x => x.OptionId);
                    table.ForeignKey(
                        name: "FK_Options_Questions_QuestionId",
                        column: x => x.QuestionId,
                        principalTable: "Questions",
                        principalColumn: "QuestionId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FlashcardProgresses",
                columns: table => new
                {
                    ProgressId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FlashcardId = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FlashcardProgresses", x => x.ProgressId);
                    table.ForeignKey(
                        name: "FK_FlashcardProgresses_Flashcards_FlashcardId",
                        column: x => x.FlashcardId,
                        principalTable: "Flashcards",
                        principalColumn: "CardId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserTestSkillScores",
                columns: table => new
                {
                    UserTestResultId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserTestId = table.Column<int>(type: "int", nullable: false),
                    Skill = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Score = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserTestSkillScores", x => x.UserTestResultId);
                    table.ForeignKey(
                        name: "FK_UserTestSkillScores_UserTests_UserTestId",
                        column: x => x.UserTestId,
                        principalTable: "UserTests",
                        principalColumn: "UserTestId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserAnswers",
                columns: table => new
                {
                    UserAnswerId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserTestId = table.Column<int>(type: "int", nullable: false),
                    QuestionId = table.Column<int>(type: "int", nullable: false),
                    AnswerAudioUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OptionId = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserAnswers", x => x.UserAnswerId);
                    table.ForeignKey(
                        name: "FK_UserAnswers_Options_OptionId",
                        column: x => x.OptionId,
                        principalTable: "Options",
                        principalColumn: "OptionId");
                    table.ForeignKey(
                        name: "FK_UserAnswers_Questions_QuestionId",
                        column: x => x.QuestionId,
                        principalTable: "Questions",
                        principalColumn: "QuestionId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserAnswers_UserTests_UserTestId",
                        column: x => x.UserTestId,
                        principalTable: "UserTests",
                        principalColumn: "UserTestId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AIFeedbacks",
                columns: table => new
                {
                    FeedbackId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserAnswerId = table.Column<int>(type: "int", nullable: false),
                    Score = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AIScorer = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AIFeedbacks", x => x.FeedbackId);
                    table.ForeignKey(
                        name: "FK_AIFeedbacks_UserAnswers_UserAnswerId",
                        column: x => x.UserAnswerId,
                        principalTable: "UserAnswers",
                        principalColumn: "UserAnswerId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Parts",
                columns: new[] { "PartId", "Description", "Name", "PartNumber", "Skill" },
                values: new object[,]
                {
                    { 1, "Listening – Photographs", "Part 1", 1, 0 },
                    { 2, "Listening – Question-Response", "Part 2", 2, 0 },
                    { 3, "Listening – Conversations", "Part 3", 3, 0 },
                    { 4, "Listening – Talks", "Part 4", 4, 0 },
                    { 5, "Reading – Incomplete Sentences", "Part 5", 5, 0 },
                    { 6, "Reading – Text Completion", "Part 6", 6, 0 },
                    { 7, "Reading – Reading Comprehension", "Part 7", 7, 0 },
                    { 8, "Writing – Write a sentence based on a picture", "Part 1", 1, 2 },
                    { 9, "Writing – Respond to a written request", "Part 2", 2, 2 },
                    { 10, "Writing – Write an opinion essay", "Part 3", 3, 2 },
                    { 11, "Speaking – Read a text aloud", "Part 1", 1, 1 },
                    { 12, "Speaking – Describe a picture", "Part 2", 2, 1 },
                    { 13, "Speaking – Respond to questions", "Part 3", 3, 1 },
                    { 14, "Speaking – Respond to questions using information provided", "Part 4", 4, 1 },
                    { 15, "Speaking – Express an opinion", "Part 5", 5, 1 }
                });

            migrationBuilder.InsertData(
                table: "Roles",
                columns: new[] { "Id", "Description", "RoleName" },
                values: new object[,]
                {
                    { 1, null, "Admin" },
                    { 2, null, "Examinee" },
                    { 3, null, "TestCreator" }
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "CreatedAt", "Email", "FullName", "GoogleId", "PasswordHash", "Status", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2025, 10, 18, 3, 24, 3, 688, DateTimeKind.Utc).AddTicks(7967), "admin@toeicgenius.com", "System Admin", null, "$2a$11$VV9ETAQ.wX3fVob2IIAi6eWSSgEh9hYdKzoF5KaUTRh61WP4RdqmW", 1, null },
                    { new Guid("22222222-2222-2222-2222-222222222222"), new DateTime(2025, 10, 18, 3, 24, 3, 808, DateTimeKind.Utc).AddTicks(4449), "creator@toeicgenius.com", "Test Creator", null, "$2a$11$I8av6Kz5Ce/1R.qizf1hyebrCkF6D/qJ6QERXC6zCJkR/4LDSxuAi", 1, null },
                    { new Guid("33333333-3333-3333-3333-333333333333"), new DateTime(2025, 10, 18, 3, 24, 3, 924, DateTimeKind.Utc).AddTicks(7400), "examinee@toeicgenius.com", "Regular Examinee", null, "$2a$11$Y2WySfr46yhh4On3kZRdkeNzlTVHROkvzQgaV4YGDzwdL1IHWJKI6", 1, null }
                });

            migrationBuilder.InsertData(
                table: "QuestionGroups",
                columns: new[] { "QuestionGroupId", "AudioUrl", "CreatedAt", "ImageUrl", "OrderIndex", "PartId", "PassageContent", "PassageType", "Status", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, null, new DateTime(2025, 10, 18, 3, 24, 3, 571, DateTimeKind.Utc).AddTicks(4652), null, 0, 6, "Passage1", null, 1, null },
                    { 2, null, new DateTime(2025, 10, 18, 3, 24, 3, 571, DateTimeKind.Utc).AddTicks(4654), null, 0, 7, "Passage2", null, 1, null },
                    { 3, null, new DateTime(2025, 10, 18, 3, 24, 3, 571, DateTimeKind.Utc).AddTicks(4655), null, 0, 7, "Passage3", null, 1, null }
                });

            migrationBuilder.InsertData(
                table: "QuestionTypes",
                columns: new[] { "QuestionTypeId", "Description", "PartId", "Skill", "TypeName" },
                values: new object[,]
                {
                    { 1, "MCQ", 1, 0, "[P1] Tranh tả người (Hành động/Trạng thái)" },
                    { 2, "MCQ", 1, 0, "[P1] Tranh tả vật/Phong cảnh (Vị trí/Trạng thái tĩnh)" },
                    { 3, "MCQ", 1, 0, "[P1] Tranh tả vật đang được thực hiện (Bị động tiếp diễn)" },
                    { 4, "MCQ", 2, 0, "[P2] Câu hỏi W/H (Who, What, When, Where, Why, How)" },
                    { 5, "MCQ", 2, 0, "[P2] Câu hỏi YES/NO" },
                    { 6, "MCQ", 2, 0, "[P2] Câu hỏi lựa chọn (OR Question)" },
                    { 7, "MCQ", 2, 0, "[P2] Câu hỏi đuôi / Xác nhận (Tag/Negative Questions)" },
                    { 8, "MCQ", 2, 0, "[P2] Câu yêu cầu, đề nghị, gợi ý (Request/Suggestion)" },
                    { 9, "MCQ", 2, 0, "[P2] Câu trần thuật (Statement/Response)" },
                    { 10, "MCQ", 3, 0, "[P3] Hỏi về ý chính/Mục đích hội thoại (Purpose/Gist)" },
                    { 11, "MCQ", 3, 0, "[P3] Hỏi chi tiết thông tin được đề cập (Detail)" },
                    { 12, "MCQ", 3, 0, "[P3] Hỏi về hành động tiếp theo (Action/Do-next)" },
                    { 13, "MCQ", 3, 0, "[P3] Hỏi suy luận/Ý định/Thái độ (Inference/Attitude)" },
                    { 14, "MCQ", 3, 0, "[P3] Hỏi dựa vào Hình/Bảng dữ liệu (Graphic Question)" },
                    { 15, "MCQ", 4, 0, "[P4] Hỏi nội dung chính/Chủ đề bài nói (Main Topic)" },
                    { 16, "MCQ", 4, 0, "[P4] Hỏi chi tiết thông tin được đề cập (Detail)" },
                    { 17, "MCQ", 4, 0, "[P4] Hỏi suy luận/Hàm ý (Inference/Imply)" },
                    { 18, "MCQ", 4, 0, "[P4] Hỏi hành động người nghe nên làm (Listener Action)" },
                    { 19, "MCQ", 4, 0, "[P4] Hỏi dựa vào Hình/Bảng dữ liệu (Graphic Question)" },
                    { 20, "MCQ", 5, 0, "[P5] Ngữ pháp (Thì, Câu điều kiện, Liên từ, Giới từ,...) " },
                    { 21, "MCQ", 5, 0, "[P5] Từ loại (N, V, Adj, Adv)" },
                    { 22, "MCQ", 5, 0, "[P5] Từ vựng (Nghĩa của từ)" },
                    { 23, "MCQ", 6, 0, "[P6] Hoàn thành câu/Từ loại/Từ vựng trong đoạn văn" },
                    { 24, "MCQ", 6, 0, "[P6] Chọn câu phù hợp để điền vào chỗ trống" },
                    { 25, "MCQ", 7, 0, "[P7] Hỏi về ý chính/Mục đích (Main Idea/Purpose)" },
                    { 26, "MCQ", 7, 0, "[P7] Tìm thông tin chi tiết (Specific Detail)" },
                    { 27, "MCQ", 7, 0, "[P7] Suy luận/Thông tin không đề cập (Inference/NOT TRUE)" },
                    { 28, "MCQ", 7, 0, "[P7] Tìm từ đồng nghĩa (Synonym/Meaning)" },
                    { 29, "MCQ", 7, 0, "[P7] Thêm câu vào chỗ trống (Sentence Insertion - Chỉ trong Multi-Passage)" },
                    { 30, "MCQ", 7, 0, "[P7] Liên kết thông tin giữa các đoạn (Connecting Information)" },
                    { 31, "ShortAnswer", 11, 1, "[Speaking] Đọc to đoạn văn (Read a text aloud)" },
                    { 32, "ShortAnswer", 12, 1, "[Speaking] Mô tả tranh (Describe a picture)" },
                    { 33, "ShortAnswer", 13, 1, "[Speaking] Trả lời câu hỏi cá nhân (Respond to questions Q5-7)" },
                    { 34, "ShortAnswer", 14, 1, "[Speaking] Trả lời dựa vào bảng/lịch (Respond to questions Q8-10)" },
                    { 35, "ShortAnswer", 15, 1, "[Speaking] Bày tỏ ý kiến cá nhân (Express an opinion Q11)" },
                    { 36, "Essay", 8, 2, "[Writing] Viết câu dựa vào tranh (Write a sentence Q1-5)" },
                    { 37, "Essay", 9, 2, "[Writing] Viết thư trả lời yêu cầu (Respond to a written request Q6-7)" },
                    { 38, "Essay", 10, 2, "[Writing] Viết luận nêu ý kiến cá nhân (Write an opinion essay Q8)" }
                });

            migrationBuilder.InsertData(
                table: "UserRoles",
                columns: new[] { "RoleId", "UserId" },
                values: new object[,]
                {
                    { 1, new Guid("11111111-1111-1111-1111-111111111111") },
                    { 3, new Guid("22222222-2222-2222-2222-222222222222") },
                    { 2, new Guid("33333333-3333-3333-3333-333333333333") }
                });

            migrationBuilder.InsertData(
                table: "Questions",
                columns: new[] { "QuestionId", "AudioUrl", "Content", "CreatedAt", "Explanation", "ImageUrl", "Number", "PartId", "QuestionGroupId", "QuestionTypeId", "Status", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, null, "What is the capital of France?", new DateTime(2025, 10, 18, 3, 24, 3, 571, DateTimeKind.Utc).AddTicks(4774), null, null, 1, 1, null, 1, 1, null },
                    { 2, null, "Single Question 2", new DateTime(2025, 10, 18, 3, 24, 3, 571, DateTimeKind.Utc).AddTicks(4684), null, null, 2, 1, null, 1, 1, null },
                    { 3, null, "Single Question 3", new DateTime(2025, 10, 18, 3, 24, 3, 571, DateTimeKind.Utc).AddTicks(4692), null, null, 3, 2, null, 2, 1, null },
                    { 4, null, "Single Question 4", new DateTime(2025, 10, 18, 3, 24, 3, 571, DateTimeKind.Utc).AddTicks(4694), null, null, 4, 2, null, 2, 1, null },
                    { 5, null, "Single Question 5", new DateTime(2025, 10, 18, 3, 24, 3, 571, DateTimeKind.Utc).AddTicks(4695), null, null, 5, 1, null, 1, 1, null },
                    { 6, null, "Single Question 6", new DateTime(2025, 10, 18, 3, 24, 3, 571, DateTimeKind.Utc).AddTicks(4696), null, null, 6, 1, null, 1, 1, null },
                    { 7, null, "Single Question 7", new DateTime(2025, 10, 18, 3, 24, 3, 571, DateTimeKind.Utc).AddTicks(4697), null, null, 7, 2, null, 2, 1, null },
                    { 8, null, "Single Question 8", new DateTime(2025, 10, 18, 3, 24, 3, 571, DateTimeKind.Utc).AddTicks(4698), null, null, 8, 2, null, 2, 1, null },
                    { 9, null, "Single Question 9", new DateTime(2025, 10, 18, 3, 24, 3, 571, DateTimeKind.Utc).AddTicks(4699), null, null, 9, 1, null, 1, 1, null },
                    { 10, null, "Single Question 10", new DateTime(2025, 10, 18, 3, 24, 3, 571, DateTimeKind.Utc).AddTicks(4700), null, null, 10, 1, null, 1, 1, null },
                    { 11, null, "Group 1 - Question 1", new DateTime(2025, 10, 18, 3, 24, 3, 571, DateTimeKind.Utc).AddTicks(4730), null, null, 1, 1, 1, 1, 1, null },
                    { 12, null, "Group 1 - Question 2", new DateTime(2025, 10, 18, 3, 24, 3, 571, DateTimeKind.Utc).AddTicks(4731), null, null, 2, 1, 1, 1, 1, null },
                    { 13, null, "Group 1 - Question 3", new DateTime(2025, 10, 18, 3, 24, 3, 571, DateTimeKind.Utc).AddTicks(4732), null, null, 3, 1, 1, 1, 1, null },
                    { 14, null, "Group 2 - Question 1", new DateTime(2025, 10, 18, 3, 24, 3, 571, DateTimeKind.Utc).AddTicks(4733), null, null, 1, 2, 2, 2, 1, null },
                    { 15, null, "Group 2 - Question 2", new DateTime(2025, 10, 18, 3, 24, 3, 571, DateTimeKind.Utc).AddTicks(4734), null, null, 2, 2, 2, 2, 1, null },
                    { 16, null, "Group 2 - Question 3", new DateTime(2025, 10, 18, 3, 24, 3, 571, DateTimeKind.Utc).AddTicks(4736), null, null, 3, 2, 2, 2, 1, null },
                    { 17, null, "Group 3 - Question 1", new DateTime(2025, 10, 18, 3, 24, 3, 571, DateTimeKind.Utc).AddTicks(4737), null, null, 1, 1, 3, 1, 1, null },
                    { 18, null, "Group 3 - Question 2", new DateTime(2025, 10, 18, 3, 24, 3, 571, DateTimeKind.Utc).AddTicks(4738), null, null, 2, 1, 3, 1, 1, null },
                    { 19, null, "Group 3 - Question 3", new DateTime(2025, 10, 18, 3, 24, 3, 571, DateTimeKind.Utc).AddTicks(4739), null, null, 3, 1, 3, 1, 1, null }
                });

            migrationBuilder.InsertData(
                table: "Options",
                columns: new[] { "OptionId", "Content", "CreatedAt", "IsCorrect", "Label", "QuestionId", "Status", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, "Paris", new DateTime(2025, 10, 18, 3, 24, 3, 571, DateTimeKind.Utc).AddTicks(4797), true, "A", 1, 1, null },
                    { 2, "London", new DateTime(2025, 10, 18, 3, 24, 3, 571, DateTimeKind.Utc).AddTicks(4798), false, "B", 1, 1, null },
                    { 3, "Berlin", new DateTime(2025, 10, 18, 3, 24, 3, 571, DateTimeKind.Utc).AddTicks(4799), false, "C", 1, 1, null },
                    { 4, "Madrid", new DateTime(2025, 10, 18, 3, 24, 3, 571, DateTimeKind.Utc).AddTicks(4800), false, "D", 1, 1, null },
                    { 5, "Paris", new DateTime(2025, 10, 18, 3, 24, 3, 571, DateTimeKind.Utc).AddTicks(4801), true, "A", 11, 1, null },
                    { 6, "London", new DateTime(2025, 10, 18, 3, 24, 3, 571, DateTimeKind.Utc).AddTicks(4802), false, "B", 11, 1, null },
                    { 7, "Berlin", new DateTime(2025, 10, 18, 3, 24, 3, 571, DateTimeKind.Utc).AddTicks(4803), false, "C", 11, 1, null },
                    { 8, "Madrid", new DateTime(2025, 10, 18, 3, 24, 3, 571, DateTimeKind.Utc).AddTicks(4804), false, "D", 11, 1, null }
                });

            migrationBuilder.CreateIndex(
                name: "IX_AIFeedbacks_UserAnswerId",
                table: "AIFeedbacks",
                column: "UserAnswerId");

            migrationBuilder.CreateIndex(
                name: "IX_FlashcardProgresses_FlashcardId",
                table: "FlashcardProgresses",
                column: "FlashcardId");

            migrationBuilder.CreateIndex(
                name: "IX_Flashcards_SetId",
                table: "Flashcards",
                column: "SetId");

            migrationBuilder.CreateIndex(
                name: "IX_FlashcardSets_UserId",
                table: "FlashcardSets",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Options_QuestionId",
                table: "Options",
                column: "QuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_QuestionGroups_PartId",
                table: "QuestionGroups",
                column: "PartId");

            migrationBuilder.CreateIndex(
                name: "IX_Questions_PartId",
                table: "Questions",
                column: "PartId");

            migrationBuilder.CreateIndex(
                name: "IX_Questions_QuestionGroupId",
                table: "Questions",
                column: "QuestionGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_Questions_QuestionTypeId",
                table: "Questions",
                column: "QuestionTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_QuestionTypes_PartId",
                table: "QuestionTypes",
                column: "PartId");

            migrationBuilder.CreateIndex(
                name: "IX_RefreshTokens_UserId",
                table: "RefreshTokens",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_TestQuestion_PartId",
                table: "TestQuestion",
                column: "PartId");

            migrationBuilder.CreateIndex(
                name: "IX_TestQuestion_TestId",
                table: "TestQuestion",
                column: "TestId");

            migrationBuilder.CreateIndex(
                name: "IX_Tests_CreatedById",
                table: "Tests",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_Tests_PartId",
                table: "Tests",
                column: "PartId");

            migrationBuilder.CreateIndex(
                name: "IX_UserAnswers_OptionId",
                table: "UserAnswers",
                column: "OptionId");

            migrationBuilder.CreateIndex(
                name: "IX_UserAnswers_QuestionId",
                table: "UserAnswers",
                column: "QuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_UserAnswers_UserTestId",
                table: "UserAnswers",
                column: "UserTestId");

            migrationBuilder.CreateIndex(
                name: "IX_UserRoles_RoleId",
                table: "UserRoles",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_UserTests_TestId",
                table: "UserTests",
                column: "TestId");

            migrationBuilder.CreateIndex(
                name: "IX_UserTests_UserId",
                table: "UserTests",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserTestSkillScores_UserTestId",
                table: "UserTestSkillScores",
                column: "UserTestId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AIFeedbacks");

            migrationBuilder.DropTable(
                name: "FlashcardProgresses");

            migrationBuilder.DropTable(
                name: "RefreshTokens");

            migrationBuilder.DropTable(
                name: "TestQuestion");

            migrationBuilder.DropTable(
                name: "UserOtps");

            migrationBuilder.DropTable(
                name: "UserRoles");

            migrationBuilder.DropTable(
                name: "UserTestSkillScores");

            migrationBuilder.DropTable(
                name: "UserAnswers");

            migrationBuilder.DropTable(
                name: "Flashcards");

            migrationBuilder.DropTable(
                name: "Roles");

            migrationBuilder.DropTable(
                name: "Options");

            migrationBuilder.DropTable(
                name: "UserTests");

            migrationBuilder.DropTable(
                name: "FlashcardSets");

            migrationBuilder.DropTable(
                name: "Questions");

            migrationBuilder.DropTable(
                name: "Tests");

            migrationBuilder.DropTable(
                name: "QuestionGroups");

            migrationBuilder.DropTable(
                name: "QuestionTypes");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Parts");
        }
    }
}
