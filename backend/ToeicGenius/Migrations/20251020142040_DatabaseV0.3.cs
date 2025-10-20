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
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true)
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
                    QuantityQuestion = table.Column<int>(type: "int", nullable: false),
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
                    { 1, "Photographs", "L-Part 1", 1, 3 },
                    { 2, "Question-Response", "L-Part 2", 2, 3 },
                    { 3, "Conversations", "L-Part 3", 3, 3 },
                    { 4, "Talks", "L-Part 4", 4, 3 },
                    { 5, "Incomplete Sentences", "R-Part 5", 5, 4 },
                    { 6, "Text Completion", "R-Part 6", 6, 4 },
                    { 7, "Reading Comprehension", "R-Part 7", 7, 4 },
                    { 8, "Write a sentence based on a picture", "W-Part 1", 1, 2 },
                    { 9, "Respond to a written request", "W-Part 2", 2, 2 },
                    { 10, "Write an opinion essay", "W-Part 3", 3, 2 },
                    { 11, "Read a text aloud", "S-Part 1", 1, 1 },
                    { 12, "Describe a picture", "S-Part 2", 2, 1 },
                    { 13, "Respond to questions", "S-Part 3", 3, 1 },
                    { 14, "Respond to questions using information provided", "S-Part 4", 4, 1 },
                    { 15, "Express an opinion", "S-Part 5", 5, 1 }
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
                    { new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2025, 10, 20, 14, 20, 37, 760, DateTimeKind.Utc).AddTicks(8652), "admin@toeicgenius.com", "System Admin", null, "$2a$11$UwarOdaZcuLFTef968RbJOjmvMlyTI2ulqJf0VcmeSB3bg4CykHPm", 1, null },
                    { new Guid("22222222-2222-2222-2222-222222222222"), new DateTime(2025, 10, 20, 14, 20, 37, 878, DateTimeKind.Utc).AddTicks(756), "creator@toeicgenius.com", "Test Creator", null, "$2a$11$MWWddRd0yM/l3MzUnbPU1O/qJoXNnuhhQrdQ8bBeZRyQO1B1Qvl2W", 1, null },
                    { new Guid("33333333-3333-3333-3333-333333333333"), new DateTime(2025, 10, 20, 14, 20, 37, 994, DateTimeKind.Utc).AddTicks(3142), "examinee@toeicgenius.com", "Regular Examinee", null, "$2a$11$3js9oquHJaqPGYwzS4KhDe4cxIex.XF6T/7q0sZjA38oReV2tPT2q", 1, null }
                });

            migrationBuilder.InsertData(
                table: "QuestionGroups",
                columns: new[] { "QuestionGroupId", "AudioUrl", "CreatedAt", "ImageUrl", "PartId", "PassageContent", "Status", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, null, new DateTime(2025, 10, 20, 14, 20, 37, 644, DateTimeKind.Utc).AddTicks(5891), null, 3, "Passage for Part 3 - Short Conversation", 1, null },
                    { 2, null, new DateTime(2025, 10, 20, 14, 20, 37, 644, DateTimeKind.Utc).AddTicks(5894), null, 4, "Passage for Part 4 - Short Talk", 1, null },
                    { 3, null, new DateTime(2025, 10, 20, 14, 20, 37, 644, DateTimeKind.Utc).AddTicks(5895), null, 6, "Passage for Part 6 - Text Completion", 1, null },
                    { 4, null, new DateTime(2025, 10, 20, 14, 20, 37, 644, DateTimeKind.Utc).AddTicks(5896), null, 7, "Passage for Part 7 - Reading Comprehension", 1, null }
                });

            migrationBuilder.InsertData(
                table: "QuestionTypes",
                columns: new[] { "QuestionTypeId", "Description", "PartId", "TypeName" },
                values: new object[,]
                {
                    { 1, "MCQ", 1, "[P1] Tranh tả người (Hành động/Trạng thái)" },
                    { 2, "MCQ", 1, "[P1] Tranh tả vật/Phong cảnh (Vị trí/Trạng thái tĩnh)" },
                    { 3, "MCQ", 1, "[P1] Tranh tả vật đang được thực hiện (Bị động tiếp diễn)" },
                    { 4, "MCQ", 2, "[P2] Câu hỏi W/H (Who, What, When, Where, Why, How)" },
                    { 5, "MCQ", 2, "[P2] Câu hỏi YES/NO" },
                    { 6, "MCQ", 2, "[P2] Câu hỏi lựa chọn (OR Question)" },
                    { 7, "MCQ", 2, "[P2] Câu hỏi đuôi / Xác nhận (Tag/Negative Questions)" },
                    { 8, "MCQ", 2, "[P2] Câu yêu cầu, đề nghị, gợi ý (Request/Suggestion)" },
                    { 9, "MCQ", 2, "[P2] Câu trần thuật (Statement/Response)" },
                    { 10, "MCQ", 3, "[P3] Hỏi về ý chính/Mục đích hội thoại (Purpose/Gist)" },
                    { 11, "MCQ", 3, "[P3] Hỏi chi tiết thông tin được đề cập (Detail)" },
                    { 12, "MCQ", 3, "[P3] Hỏi về hành động tiếp theo (Action/Do-next)" },
                    { 13, "MCQ", 3, "[P3] Hỏi suy luận/Ý định/Thái độ (Inference/Attitude)" },
                    { 14, "MCQ", 3, "[P3] Hỏi dựa vào Hình/Bảng dữ liệu (Graphic Question)" },
                    { 15, "MCQ", 4, "[P4] Hỏi nội dung chính/Chủ đề bài nói (Main Topic)" },
                    { 16, "MCQ", 4, "[P4] Hỏi chi tiết thông tin được đề cập (Detail)" },
                    { 17, "MCQ", 4, "[P4] Hỏi suy luận/Hàm ý (Inference/Imply)" },
                    { 18, "MCQ", 4, "[P4] Hỏi hành động người nghe nên làm (Listener Action)" },
                    { 19, "MCQ", 4, "[P4] Hỏi dựa vào Hình/Bảng dữ liệu (Graphic Question)" },
                    { 20, "MCQ", 5, "[P5] Ngữ pháp (Thì, Câu điều kiện, Liên từ, Giới từ,...) " },
                    { 21, "MCQ", 5, "[P5] Từ loại (N, V, Adj, Adv)" },
                    { 22, "MCQ", 5, "[P5] Từ vựng (Nghĩa của từ)" },
                    { 23, "MCQ", 6, "[P6] Hoàn thành câu/Từ loại/Từ vựng trong đoạn văn" },
                    { 24, "MCQ", 6, "[P6] Chọn câu phù hợp để điền vào chỗ trống" },
                    { 25, "MCQ", 7, "[P7] Hỏi về ý chính/Mục đích (Main Idea/Purpose)" },
                    { 26, "MCQ", 7, "[P7] Tìm thông tin chi tiết (Specific Detail)" },
                    { 27, "MCQ", 7, "[P7] Suy luận/Thông tin không đề cập (Inference/NOT TRUE)" },
                    { 28, "MCQ", 7, "[P7] Tìm từ đồng nghĩa (Synonym/Meaning)" },
                    { 29, "MCQ", 7, "[P7] Thêm câu vào chỗ trống (Sentence Insertion - Chỉ trong Multi-Passage)" },
                    { 30, "MCQ", 7, "[P7] Liên kết thông tin giữa các đoạn (Connecting Information)" },
                    { 31, "ShortAnswer", 11, "[Speaking] Đọc to đoạn văn (Read a text aloud)" },
                    { 32, "ShortAnswer", 12, "[Speaking] Mô tả tranh (Describe a picture)" },
                    { 33, "ShortAnswer", 13, "[Speaking] Trả lời câu hỏi cá nhân (Respond to questions Q5-7)" },
                    { 34, "ShortAnswer", 14, "[Speaking] Trả lời dựa vào bảng/lịch (Respond to questions Q8-10)" },
                    { 35, "ShortAnswer", 15, "[Speaking] Bày tỏ ý kiến cá nhân (Express an opinion Q11)" },
                    { 36, "Essay", 8, "[Writing] Viết câu dựa vào tranh (Write a sentence Q1-5)" },
                    { 37, "Essay", 9, "[Writing] Viết thư trả lời yêu cầu (Respond to a written request Q6-7)" },
                    { 38, "Essay", 10, "[Writing] Viết luận nêu ý kiến cá nhân (Write an opinion essay Q8)" }
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
                columns: new[] { "QuestionId", "AudioUrl", "Content", "CreatedAt", "Explanation", "ImageUrl", "PartId", "QuestionGroupId", "QuestionTypeId", "Status", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, null, "What is the capital of France?", new DateTime(2025, 10, 20, 14, 20, 37, 644, DateTimeKind.Utc).AddTicks(5923), null, null, 1, null, 1, 1, null },
                    { 2, null, "Where does he live?", new DateTime(2025, 10, 20, 14, 20, 37, 644, DateTimeKind.Utc).AddTicks(5924), null, null, 2, null, 1, 1, null },
                    { 3, null, "What time does she start work?", new DateTime(2025, 10, 20, 14, 20, 37, 644, DateTimeKind.Utc).AddTicks(5925), null, null, 2, null, 2, 1, null },
                    { 4, null, "Which color do you like?", new DateTime(2025, 10, 20, 14, 20, 37, 644, DateTimeKind.Utc).AddTicks(5927), null, null, 1, null, 2, 1, null },
                    { 5, null, "Select the correct sentence.", new DateTime(2025, 10, 20, 14, 20, 37, 644, DateTimeKind.Utc).AddTicks(5928), null, null, 5, null, 1, 1, null },
                    { 6, null, "Describe your favorite city.", new DateTime(2025, 10, 20, 14, 20, 37, 644, DateTimeKind.Utc).AddTicks(5929), null, null, 11, null, 1, 1, null },
                    { 7, null, "Write a short essay about your hometown.", new DateTime(2025, 10, 20, 14, 20, 37, 644, DateTimeKind.Utc).AddTicks(5930), null, null, 9, null, 1, 1, null },
                    { 11, null, "Group 1 - Q1", new DateTime(2025, 10, 20, 14, 20, 37, 644, DateTimeKind.Utc).AddTicks(5956), null, null, 3, 1, 1, 1, null },
                    { 12, null, "Group 1 - Q2", new DateTime(2025, 10, 20, 14, 20, 37, 644, DateTimeKind.Utc).AddTicks(5958), null, null, 3, 1, 1, 1, null },
                    { 13, null, "Group 1 - Q3", new DateTime(2025, 10, 20, 14, 20, 37, 644, DateTimeKind.Utc).AddTicks(5959), null, null, 3, 1, 1, 1, null },
                    { 14, null, "Group 2 - Q1", new DateTime(2025, 10, 20, 14, 20, 37, 644, DateTimeKind.Utc).AddTicks(5960), null, null, 4, 2, 2, 1, null },
                    { 15, null, "Group 2 - Q2", new DateTime(2025, 10, 20, 14, 20, 37, 644, DateTimeKind.Utc).AddTicks(5961), null, null, 4, 2, 2, 1, null },
                    { 16, null, "Group 2 - Q3", new DateTime(2025, 10, 20, 14, 20, 37, 644, DateTimeKind.Utc).AddTicks(5963), null, null, 4, 2, 2, 1, null },
                    { 17, null, "Group 3 - Q1", new DateTime(2025, 10, 20, 14, 20, 37, 644, DateTimeKind.Utc).AddTicks(5964), null, null, 6, 3, 1, 1, null },
                    { 18, null, "Group 3 - Q2", new DateTime(2025, 10, 20, 14, 20, 37, 644, DateTimeKind.Utc).AddTicks(5965), null, null, 6, 3, 1, 1, null },
                    { 19, null, "Group 3 - Q3", new DateTime(2025, 10, 20, 14, 20, 37, 644, DateTimeKind.Utc).AddTicks(5966), null, null, 6, 3, 1, 1, null },
                    { 20, null, "Group 4 - Q1", new DateTime(2025, 10, 20, 14, 20, 37, 644, DateTimeKind.Utc).AddTicks(5967), null, null, 7, 4, 2, 1, null },
                    { 21, null, "Group 4 - Q2", new DateTime(2025, 10, 20, 14, 20, 37, 644, DateTimeKind.Utc).AddTicks(5972), null, null, 7, 4, 2, 1, null },
                    { 22, null, "Group 4 - Q3", new DateTime(2025, 10, 20, 14, 20, 37, 644, DateTimeKind.Utc).AddTicks(5973), null, null, 7, 4, 2, 1, null }
                });

            migrationBuilder.InsertData(
                table: "Options",
                columns: new[] { "OptionId", "Content", "CreatedAt", "IsCorrect", "Label", "QuestionId", "Status", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, "Paris", new DateTime(2025, 10, 20, 14, 20, 37, 644, DateTimeKind.Utc).AddTicks(6002), true, "A", 1, 1, null },
                    { 2, "London", new DateTime(2025, 10, 20, 14, 20, 37, 644, DateTimeKind.Utc).AddTicks(6003), false, "B", 1, 1, null },
                    { 3, "Berlin", new DateTime(2025, 10, 20, 14, 20, 37, 644, DateTimeKind.Utc).AddTicks(6004), false, "C", 1, 1, null },
                    { 4, "Madrid", new DateTime(2025, 10, 20, 14, 20, 37, 644, DateTimeKind.Utc).AddTicks(6005), false, "D", 1, 1, null },
                    { 5, "At home", new DateTime(2025, 10, 20, 14, 20, 37, 644, DateTimeKind.Utc).AddTicks(6006), true, "A", 2, 1, null },
                    { 6, "At work", new DateTime(2025, 10, 20, 14, 20, 37, 644, DateTimeKind.Utc).AddTicks(6007), false, "B", 2, 1, null },
                    { 7, "At school", new DateTime(2025, 10, 20, 14, 20, 37, 644, DateTimeKind.Utc).AddTicks(6008), false, "C", 2, 1, null },
                    { 8, "8 AM", new DateTime(2025, 10, 20, 14, 20, 37, 644, DateTimeKind.Utc).AddTicks(6009), true, "A", 3, 1, null },
                    { 9, "9 AM", new DateTime(2025, 10, 20, 14, 20, 37, 644, DateTimeKind.Utc).AddTicks(6010), false, "B", 3, 1, null },
                    { 10, "10 AM", new DateTime(2025, 10, 20, 14, 20, 37, 644, DateTimeKind.Utc).AddTicks(6032), false, "C", 3, 1, null },
                    { 11, "Red", new DateTime(2025, 10, 20, 14, 20, 37, 644, DateTimeKind.Utc).AddTicks(6033), true, "A", 4, 1, null },
                    { 12, "Green", new DateTime(2025, 10, 20, 14, 20, 37, 644, DateTimeKind.Utc).AddTicks(6034), false, "B", 4, 1, null },
                    { 13, "Blue", new DateTime(2025, 10, 20, 14, 20, 37, 644, DateTimeKind.Utc).AddTicks(6035), false, "C", 4, 1, null },
                    { 14, "Yellow", new DateTime(2025, 10, 20, 14, 20, 37, 644, DateTimeKind.Utc).AddTicks(6036), false, "D", 4, 1, null },
                    { 15, "She goes to school.", new DateTime(2025, 10, 20, 14, 20, 37, 644, DateTimeKind.Utc).AddTicks(6037), true, "A", 5, 1, null },
                    { 16, "She go to school.", new DateTime(2025, 10, 20, 14, 20, 37, 644, DateTimeKind.Utc).AddTicks(6038), false, "B", 5, 1, null },
                    { 17, "She going to school.", new DateTime(2025, 10, 20, 14, 20, 37, 644, DateTimeKind.Utc).AddTicks(6039), false, "C", 5, 1, null },
                    { 18, "She gone to school.", new DateTime(2025, 10, 20, 14, 20, 37, 644, DateTimeKind.Utc).AddTicks(6039), false, "D", 5, 1, null },
                    { 19, "Option A", new DateTime(2025, 10, 20, 14, 20, 37, 644, DateTimeKind.Utc).AddTicks(6040), true, "A", 11, 1, null },
                    { 20, "Option B", new DateTime(2025, 10, 20, 14, 20, 37, 644, DateTimeKind.Utc).AddTicks(6041), false, "B", 11, 1, null },
                    { 21, "Option C", new DateTime(2025, 10, 20, 14, 20, 37, 644, DateTimeKind.Utc).AddTicks(6042), false, "C", 11, 1, null },
                    { 22, "Option D", new DateTime(2025, 10, 20, 14, 20, 37, 644, DateTimeKind.Utc).AddTicks(6043), false, "D", 11, 1, null }
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
