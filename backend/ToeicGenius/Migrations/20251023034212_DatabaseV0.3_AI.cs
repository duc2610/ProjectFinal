using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ToeicGenius.Migrations
{
    /// <inheritdoc />
    public partial class DatabaseV03_AI : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AnswerText",
                table: "UserAnswers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "AIScorer",
                table: "AIFeedbacks",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddColumn<double>(
                name: "AudioDuration",
                table: "AIFeedbacks",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AudioFileUrl",
                table: "AIFeedbacks",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CorrectedText",
                table: "AIFeedbacks",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DetailedAnalysisJson",
                table: "AIFeedbacks",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DetailedScoresJson",
                table: "AIFeedbacks",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ImageFileUrl",
                table: "AIFeedbacks",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PythonApiResponse",
                table: "AIFeedbacks",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RecommendationsJson",
                table: "AIFeedbacks",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Transcription",
                table: "AIFeedbacks",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UserAnswerId1",
                table: "AIFeedbacks",
                type: "int",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(2085));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(2094));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(2096));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(2097));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(2098));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(2100));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(2101));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 8,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(2102));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 9,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(2103));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 10,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(2104));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(2105));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(2106));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(2107));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(2108));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(2110));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 16,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(2152));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 17,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(2154));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 18,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(2155));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 19,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(2156));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 20,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(2157));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 21,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(2159));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 22,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(2160));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(1935));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(1938));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(1940));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(1940));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(1979));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(1983));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(1985));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(1987));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(1988));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(1989));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(1990));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(2021));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(2022));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(2024));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(2025));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(2027));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 16,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(2028));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 17,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(2029));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 18,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(2031));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 19,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(2032));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 20,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(2033));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 21,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(2042));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 22,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(2044));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "CreatedAt", "FullName", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 23, 3, 42, 8, 805, DateTimeKind.Utc).AddTicks(6558), "Administrator", "$2a$11$mRSFXJyiMCHU6NXrhwhw6OaFDw2aD6q6Pg2gPX4NrYbrThIZ5mEja" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 23, 3, 42, 8, 976, DateTimeKind.Utc).AddTicks(7486), "$2a$11$NzYaReTKXvSlxxy4SKJESuxh.4UXMGmI4mRdtJaAwi4WFF5ZCHh.m" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                columns: new[] { "CreatedAt", "FullName", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 23, 3, 42, 9, 157, DateTimeKind.Utc).AddTicks(6255), "Examinee User", "$2a$11$CSTScrMUSTpQly3ylej2LOt1byC/rExuG9V5YCln1.4n2ZavUJfrS" });

            migrationBuilder.CreateIndex(
                name: "IX_AIFeedbacks_UserAnswerId1",
                table: "AIFeedbacks",
                column: "UserAnswerId1");

            migrationBuilder.AddForeignKey(
                name: "FK_AIFeedbacks_UserAnswers_UserAnswerId1",
                table: "AIFeedbacks",
                column: "UserAnswerId1",
                principalTable: "UserAnswers",
                principalColumn: "UserAnswerId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AIFeedbacks_UserAnswers_UserAnswerId1",
                table: "AIFeedbacks");

            migrationBuilder.DropIndex(
                name: "IX_AIFeedbacks_UserAnswerId1",
                table: "AIFeedbacks");

            migrationBuilder.DropColumn(
                name: "AnswerText",
                table: "UserAnswers");

            migrationBuilder.DropColumn(
                name: "AudioDuration",
                table: "AIFeedbacks");

            migrationBuilder.DropColumn(
                name: "AudioFileUrl",
                table: "AIFeedbacks");

            migrationBuilder.DropColumn(
                name: "CorrectedText",
                table: "AIFeedbacks");

            migrationBuilder.DropColumn(
                name: "DetailedAnalysisJson",
                table: "AIFeedbacks");

            migrationBuilder.DropColumn(
                name: "DetailedScoresJson",
                table: "AIFeedbacks");

            migrationBuilder.DropColumn(
                name: "ImageFileUrl",
                table: "AIFeedbacks");

            migrationBuilder.DropColumn(
                name: "PythonApiResponse",
                table: "AIFeedbacks");

            migrationBuilder.DropColumn(
                name: "RecommendationsJson",
                table: "AIFeedbacks");

            migrationBuilder.DropColumn(
                name: "Transcription",
                table: "AIFeedbacks");

            migrationBuilder.DropColumn(
                name: "UserAnswerId1",
                table: "AIFeedbacks");

            migrationBuilder.AlterColumn<string>(
                name: "AIScorer",
                table: "AIFeedbacks",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 21, 17, 40, 0, 841, DateTimeKind.Utc).AddTicks(5026));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 21, 17, 40, 0, 841, DateTimeKind.Utc).AddTicks(5027));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 21, 17, 40, 0, 841, DateTimeKind.Utc).AddTicks(5028));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 21, 17, 40, 0, 841, DateTimeKind.Utc).AddTicks(5029));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 21, 17, 40, 0, 841, DateTimeKind.Utc).AddTicks(5030));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 21, 17, 40, 0, 841, DateTimeKind.Utc).AddTicks(5031));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 21, 17, 40, 0, 841, DateTimeKind.Utc).AddTicks(5032));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 8,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 21, 17, 40, 0, 841, DateTimeKind.Utc).AddTicks(5033));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 9,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 21, 17, 40, 0, 841, DateTimeKind.Utc).AddTicks(5034));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 10,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 21, 17, 40, 0, 841, DateTimeKind.Utc).AddTicks(5035));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 21, 17, 40, 0, 841, DateTimeKind.Utc).AddTicks(5036));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 21, 17, 40, 0, 841, DateTimeKind.Utc).AddTicks(5037));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 21, 17, 40, 0, 841, DateTimeKind.Utc).AddTicks(5037));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 21, 17, 40, 0, 841, DateTimeKind.Utc).AddTicks(5038));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 21, 17, 40, 0, 841, DateTimeKind.Utc).AddTicks(5039));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 16,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 21, 17, 40, 0, 841, DateTimeKind.Utc).AddTicks(5040));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 17,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 21, 17, 40, 0, 841, DateTimeKind.Utc).AddTicks(5041));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 18,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 21, 17, 40, 0, 841, DateTimeKind.Utc).AddTicks(5042));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 19,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 21, 17, 40, 0, 841, DateTimeKind.Utc).AddTicks(5044));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 20,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 21, 17, 40, 0, 841, DateTimeKind.Utc).AddTicks(5045));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 21,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 21, 17, 40, 0, 841, DateTimeKind.Utc).AddTicks(5046));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 22,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 21, 17, 40, 0, 841, DateTimeKind.Utc).AddTicks(5046));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 21, 17, 40, 0, 841, DateTimeKind.Utc).AddTicks(4864));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 21, 17, 40, 0, 841, DateTimeKind.Utc).AddTicks(4866));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 21, 17, 40, 0, 841, DateTimeKind.Utc).AddTicks(4867));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 21, 17, 40, 0, 841, DateTimeKind.Utc).AddTicks(4868));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 21, 17, 40, 0, 841, DateTimeKind.Utc).AddTicks(4898));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 21, 17, 40, 0, 841, DateTimeKind.Utc).AddTicks(4911));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 21, 17, 40, 0, 841, DateTimeKind.Utc).AddTicks(4912));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 21, 17, 40, 0, 841, DateTimeKind.Utc).AddTicks(4913));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 21, 17, 40, 0, 841, DateTimeKind.Utc).AddTicks(4914));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 21, 17, 40, 0, 841, DateTimeKind.Utc).AddTicks(4915));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 21, 17, 40, 0, 841, DateTimeKind.Utc).AddTicks(4916));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 21, 17, 40, 0, 841, DateTimeKind.Utc).AddTicks(4944));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 21, 17, 40, 0, 841, DateTimeKind.Utc).AddTicks(4975));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 21, 17, 40, 0, 841, DateTimeKind.Utc).AddTicks(4976));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 21, 17, 40, 0, 841, DateTimeKind.Utc).AddTicks(4977));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 21, 17, 40, 0, 841, DateTimeKind.Utc).AddTicks(4978));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 16,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 21, 17, 40, 0, 841, DateTimeKind.Utc).AddTicks(4979));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 17,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 21, 17, 40, 0, 841, DateTimeKind.Utc).AddTicks(4980));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 18,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 21, 17, 40, 0, 841, DateTimeKind.Utc).AddTicks(4981));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 19,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 21, 17, 40, 0, 841, DateTimeKind.Utc).AddTicks(4983));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 20,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 21, 17, 40, 0, 841, DateTimeKind.Utc).AddTicks(4984));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 21,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 21, 17, 40, 0, 841, DateTimeKind.Utc).AddTicks(4988));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 22,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 21, 17, 40, 0, 841, DateTimeKind.Utc).AddTicks(4990));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "CreatedAt", "FullName", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 21, 17, 40, 0, 960, DateTimeKind.Utc).AddTicks(2514), "System Admin", "$2a$11$jb6qC7RXb/SqrYseehdaN.iSSWZG6WuccVpHUGWle5nBw3ifE0.DS" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 21, 17, 40, 1, 81, DateTimeKind.Utc).AddTicks(3518), "$2a$11$NXZ5FKJlmGgZ3ZiDVMEwCuKqvEaZRyKglx5y7SksIIWprBVwwnlty" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                columns: new[] { "CreatedAt", "FullName", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 21, 17, 40, 1, 199, DateTimeKind.Utc).AddTicks(6295), "Regular Examinee", "$2a$11$RjuntvzP/br6SysTiV6/IORNp5WjCUIuUkz.nD2sP9waF8Ei7mfVm" });
        }
    }
}
