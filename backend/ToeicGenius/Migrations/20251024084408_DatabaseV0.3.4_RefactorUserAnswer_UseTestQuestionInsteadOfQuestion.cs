using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ToeicGenius.Migrations
{
    /// <inheritdoc />
    public partial class DatabaseV034_RefactorUserAnswer_UseTestQuestionInsteadOfQuestion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserAnswers_Questions_QuestionId",
                table: "UserAnswers");

            migrationBuilder.DropForeignKey(
                name: "FK_UserAnswers_TestResults_UserTestId",
                table: "UserAnswers");

            migrationBuilder.DropForeignKey(
                name: "FK_UserTestSkillScores_TestResults_UserTestId",
                table: "UserTestSkillScores");

            migrationBuilder.RenameColumn(
                name: "UserTestId",
                table: "UserTestSkillScores",
                newName: "TestResultId");

            migrationBuilder.RenameIndex(
                name: "IX_UserTestSkillScores_UserTestId",
                table: "UserTestSkillScores",
                newName: "IX_UserTestSkillScores_TestResultId");

            migrationBuilder.RenameColumn(
                name: "UserTestId",
                table: "UserAnswers",
                newName: "TestResultId");

            migrationBuilder.RenameColumn(
                name: "QuestionId",
                table: "UserAnswers",
                newName: "TestQuestionId");

            migrationBuilder.RenameIndex(
                name: "IX_UserAnswers_UserTestId",
                table: "UserAnswers",
                newName: "IX_UserAnswers_TestResultId");

            migrationBuilder.RenameIndex(
                name: "IX_UserAnswers_QuestionId",
                table: "UserAnswers",
                newName: "IX_UserAnswers_TestQuestionId");

            migrationBuilder.RenameColumn(
                name: "UserTestId",
                table: "TestResults",
                newName: "TestResultId");

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 8, 44, 7, 77, DateTimeKind.Utc).AddTicks(1426));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 8, 44, 7, 77, DateTimeKind.Utc).AddTicks(1430));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 8, 44, 7, 77, DateTimeKind.Utc).AddTicks(1431));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 8, 44, 7, 77, DateTimeKind.Utc).AddTicks(1433));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 8, 44, 7, 77, DateTimeKind.Utc).AddTicks(1434));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 8, 44, 7, 77, DateTimeKind.Utc).AddTicks(1436));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 8, 44, 7, 77, DateTimeKind.Utc).AddTicks(1437));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 8,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 8, 44, 7, 77, DateTimeKind.Utc).AddTicks(1438));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 9,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 8, 44, 7, 77, DateTimeKind.Utc).AddTicks(1439));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 10,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 8, 44, 7, 77, DateTimeKind.Utc).AddTicks(1441));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 8, 44, 7, 77, DateTimeKind.Utc).AddTicks(1442));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 8, 44, 7, 77, DateTimeKind.Utc).AddTicks(1443));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 8, 44, 7, 77, DateTimeKind.Utc).AddTicks(1444));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 8, 44, 7, 77, DateTimeKind.Utc).AddTicks(1445));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 8, 44, 7, 77, DateTimeKind.Utc).AddTicks(1446));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 16,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 8, 44, 7, 77, DateTimeKind.Utc).AddTicks(1447));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 17,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 8, 44, 7, 77, DateTimeKind.Utc).AddTicks(1448));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 18,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 8, 44, 7, 77, DateTimeKind.Utc).AddTicks(1449));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 19,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 8, 44, 7, 77, DateTimeKind.Utc).AddTicks(1450));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 20,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 8, 44, 7, 77, DateTimeKind.Utc).AddTicks(1452));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 21,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 8, 44, 7, 77, DateTimeKind.Utc).AddTicks(1453));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 22,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 8, 44, 7, 77, DateTimeKind.Utc).AddTicks(1454));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 8, 44, 7, 77, DateTimeKind.Utc).AddTicks(1251));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 8, 44, 7, 77, DateTimeKind.Utc).AddTicks(1254));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 8, 44, 7, 77, DateTimeKind.Utc).AddTicks(1255));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 8, 44, 7, 77, DateTimeKind.Utc).AddTicks(1257));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 8, 44, 7, 77, DateTimeKind.Utc).AddTicks(1294));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 8, 44, 7, 77, DateTimeKind.Utc).AddTicks(1297));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 8, 44, 7, 77, DateTimeKind.Utc).AddTicks(1322));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 8, 44, 7, 77, DateTimeKind.Utc).AddTicks(1324));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 8, 44, 7, 77, DateTimeKind.Utc).AddTicks(1325));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 8, 44, 7, 77, DateTimeKind.Utc).AddTicks(1326));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 8, 44, 7, 77, DateTimeKind.Utc).AddTicks(1328));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 8, 44, 7, 77, DateTimeKind.Utc).AddTicks(1359));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 8, 44, 7, 77, DateTimeKind.Utc).AddTicks(1361));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 8, 44, 7, 77, DateTimeKind.Utc).AddTicks(1362));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 8, 44, 7, 77, DateTimeKind.Utc).AddTicks(1364));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 8, 44, 7, 77, DateTimeKind.Utc).AddTicks(1365));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 16,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 8, 44, 7, 77, DateTimeKind.Utc).AddTicks(1367));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 17,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 8, 44, 7, 77, DateTimeKind.Utc).AddTicks(1368));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 18,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 8, 44, 7, 77, DateTimeKind.Utc).AddTicks(1370));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 19,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 8, 44, 7, 77, DateTimeKind.Utc).AddTicks(1371));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 20,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 8, 44, 7, 77, DateTimeKind.Utc).AddTicks(1372));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 21,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 8, 44, 7, 77, DateTimeKind.Utc).AddTicks(1384));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 22,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 8, 44, 7, 77, DateTimeKind.Utc).AddTicks(1385));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 24, 8, 44, 7, 249, DateTimeKind.Utc).AddTicks(3888), "$2a$11$8Q77WTOweXBaaXsMO8Jh9eJsBLoAgMGRMjVyBnZxu/w4U9Hkkvh8C" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 24, 8, 44, 7, 421, DateTimeKind.Utc).AddTicks(346), "$2a$11$yaQMZLq9aBkOydyL5NY5WuwE8/KDOUYSaV9QmZZxbuPj7ePM3Wefe" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 24, 8, 44, 7, 590, DateTimeKind.Utc).AddTicks(5199), "$2a$11$loXiJm39QyQ8yAsUbGHcb.amEDtluFYKm.Pp7KYw6zkkRC/ZK2dIe" });

            migrationBuilder.AddForeignKey(
                name: "FK_UserAnswers_TestQuestions_TestQuestionId",
                table: "UserAnswers",
                column: "TestQuestionId",
                principalTable: "TestQuestions",
                principalColumn: "TestQuestionId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_UserAnswers_TestResults_TestResultId",
                table: "UserAnswers",
                column: "TestResultId",
                principalTable: "TestResults",
                principalColumn: "TestResultId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserTestSkillScores_TestResults_TestResultId",
                table: "UserTestSkillScores",
                column: "TestResultId",
                principalTable: "TestResults",
                principalColumn: "TestResultId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserAnswers_TestQuestions_TestQuestionId",
                table: "UserAnswers");

            migrationBuilder.DropForeignKey(
                name: "FK_UserAnswers_TestResults_TestResultId",
                table: "UserAnswers");

            migrationBuilder.DropForeignKey(
                name: "FK_UserTestSkillScores_TestResults_TestResultId",
                table: "UserTestSkillScores");

            migrationBuilder.RenameColumn(
                name: "TestResultId",
                table: "UserTestSkillScores",
                newName: "UserTestId");

            migrationBuilder.RenameIndex(
                name: "IX_UserTestSkillScores_TestResultId",
                table: "UserTestSkillScores",
                newName: "IX_UserTestSkillScores_UserTestId");

            migrationBuilder.RenameColumn(
                name: "TestResultId",
                table: "UserAnswers",
                newName: "UserTestId");

            migrationBuilder.RenameColumn(
                name: "TestQuestionId",
                table: "UserAnswers",
                newName: "QuestionId");

            migrationBuilder.RenameIndex(
                name: "IX_UserAnswers_TestResultId",
                table: "UserAnswers",
                newName: "IX_UserAnswers_UserTestId");

            migrationBuilder.RenameIndex(
                name: "IX_UserAnswers_TestQuestionId",
                table: "UserAnswers",
                newName: "IX_UserAnswers_QuestionId");

            migrationBuilder.RenameColumn(
                name: "TestResultId",
                table: "TestResults",
                newName: "UserTestId");

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 4, 46, 17, 985, DateTimeKind.Utc).AddTicks(2351));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 4, 46, 17, 985, DateTimeKind.Utc).AddTicks(2353));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 4, 46, 17, 985, DateTimeKind.Utc).AddTicks(2354));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 4, 46, 17, 985, DateTimeKind.Utc).AddTicks(2355));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 4, 46, 17, 985, DateTimeKind.Utc).AddTicks(2357));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 4, 46, 17, 985, DateTimeKind.Utc).AddTicks(2358));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 4, 46, 17, 985, DateTimeKind.Utc).AddTicks(2360));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 8,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 4, 46, 17, 985, DateTimeKind.Utc).AddTicks(2361));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 9,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 4, 46, 17, 985, DateTimeKind.Utc).AddTicks(2362));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 10,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 4, 46, 17, 985, DateTimeKind.Utc).AddTicks(2364));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 4, 46, 17, 985, DateTimeKind.Utc).AddTicks(2365));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 4, 46, 17, 985, DateTimeKind.Utc).AddTicks(2366));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 4, 46, 17, 985, DateTimeKind.Utc).AddTicks(2367));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 4, 46, 17, 985, DateTimeKind.Utc).AddTicks(2368));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 4, 46, 17, 985, DateTimeKind.Utc).AddTicks(2369));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 16,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 4, 46, 17, 985, DateTimeKind.Utc).AddTicks(2370));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 17,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 4, 46, 17, 985, DateTimeKind.Utc).AddTicks(2371));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 18,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 4, 46, 17, 985, DateTimeKind.Utc).AddTicks(2372));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 19,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 4, 46, 17, 985, DateTimeKind.Utc).AddTicks(2373));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 20,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 4, 46, 17, 985, DateTimeKind.Utc).AddTicks(2374));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 21,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 4, 46, 17, 985, DateTimeKind.Utc).AddTicks(2375));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 22,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 4, 46, 17, 985, DateTimeKind.Utc).AddTicks(2376));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 4, 46, 17, 985, DateTimeKind.Utc).AddTicks(2088));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 4, 46, 17, 985, DateTimeKind.Utc).AddTicks(2093));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 4, 46, 17, 985, DateTimeKind.Utc).AddTicks(2094));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 4, 46, 17, 985, DateTimeKind.Utc).AddTicks(2096));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 4, 46, 17, 985, DateTimeKind.Utc).AddTicks(2145));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 4, 46, 17, 985, DateTimeKind.Utc).AddTicks(2158));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 4, 46, 17, 985, DateTimeKind.Utc).AddTicks(2160));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 4, 46, 17, 985, DateTimeKind.Utc).AddTicks(2162));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 4, 46, 17, 985, DateTimeKind.Utc).AddTicks(2163));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 4, 46, 17, 985, DateTimeKind.Utc).AddTicks(2164));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 4, 46, 17, 985, DateTimeKind.Utc).AddTicks(2165));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 4, 46, 17, 985, DateTimeKind.Utc).AddTicks(2197));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 4, 46, 17, 985, DateTimeKind.Utc).AddTicks(2204));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 4, 46, 17, 985, DateTimeKind.Utc).AddTicks(2206));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 4, 46, 17, 985, DateTimeKind.Utc).AddTicks(2208));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 4, 46, 17, 985, DateTimeKind.Utc).AddTicks(2269));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 16,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 4, 46, 17, 985, DateTimeKind.Utc).AddTicks(2270));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 17,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 4, 46, 17, 985, DateTimeKind.Utc).AddTicks(2272));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 18,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 4, 46, 17, 985, DateTimeKind.Utc).AddTicks(2273));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 19,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 4, 46, 17, 985, DateTimeKind.Utc).AddTicks(2274));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 20,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 4, 46, 17, 985, DateTimeKind.Utc).AddTicks(2276));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 21,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 4, 46, 17, 985, DateTimeKind.Utc).AddTicks(2290));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 22,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 4, 46, 17, 985, DateTimeKind.Utc).AddTicks(2291));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 24, 4, 46, 18, 157, DateTimeKind.Utc).AddTicks(1109), "$2a$11$2rZyyLem8ZcZTrBzQGKVNeh0K.u4BinvCCooydJtX1SSb63h7ma26" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 24, 4, 46, 18, 326, DateTimeKind.Utc).AddTicks(7584), "$2a$11$od8rG5EINcYfYX4TSaBHO.HAnosRJQhCd0IjnUJsgtVCkko46HbYq" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 24, 4, 46, 18, 494, DateTimeKind.Utc).AddTicks(7390), "$2a$11$G4LjlHtQanIRndqPzpTh5OAGWeUiY4foqTC/sfAckHXmaykSVcCzm" });

            migrationBuilder.AddForeignKey(
                name: "FK_UserAnswers_Questions_QuestionId",
                table: "UserAnswers",
                column: "QuestionId",
                principalTable: "Questions",
                principalColumn: "QuestionId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserAnswers_TestResults_UserTestId",
                table: "UserAnswers",
                column: "UserTestId",
                principalTable: "TestResults",
                principalColumn: "UserTestId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserTestSkillScores_TestResults_UserTestId",
                table: "UserTestSkillScores",
                column: "UserTestId",
                principalTable: "TestResults",
                principalColumn: "UserTestId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
