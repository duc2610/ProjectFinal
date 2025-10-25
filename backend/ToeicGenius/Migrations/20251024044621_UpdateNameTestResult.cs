using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ToeicGenius.Migrations
{
    /// <inheritdoc />
    public partial class UpdateNameTestResult : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserAnswers_UserTests_UserTestId",
                table: "UserAnswers");

            migrationBuilder.DropForeignKey(
                name: "FK_UserTests_Tests_TestId",
                table: "UserTests");

            migrationBuilder.DropForeignKey(
                name: "FK_UserTests_Users_UserId",
                table: "UserTests");

            migrationBuilder.DropForeignKey(
                name: "FK_UserTestSkillScores_UserTests_UserTestId",
                table: "UserTestSkillScores");

            migrationBuilder.DropPrimaryKey(
                name: "PK_UserTests",
                table: "UserTests");

            migrationBuilder.RenameTable(
                name: "UserTests",
                newName: "TestResults");

            migrationBuilder.RenameIndex(
                name: "IX_UserTests_UserId",
                table: "TestResults",
                newName: "IX_TestResults_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_UserTests_TestId",
                table: "TestResults",
                newName: "IX_TestResults_TestId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_TestResults",
                table: "TestResults",
                column: "UserTestId");

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
                name: "FK_TestResults_Tests_TestId",
                table: "TestResults",
                column: "TestId",
                principalTable: "Tests",
                principalColumn: "TestId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_TestResults_Users_UserId",
                table: "TestResults",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TestResults_Tests_TestId",
                table: "TestResults");

            migrationBuilder.DropForeignKey(
                name: "FK_TestResults_Users_UserId",
                table: "TestResults");

            migrationBuilder.DropForeignKey(
                name: "FK_UserAnswers_TestResults_UserTestId",
                table: "UserAnswers");

            migrationBuilder.DropForeignKey(
                name: "FK_UserTestSkillScores_TestResults_UserTestId",
                table: "UserTestSkillScores");

            migrationBuilder.DropPrimaryKey(
                name: "PK_TestResults",
                table: "TestResults");

            migrationBuilder.RenameTable(
                name: "TestResults",
                newName: "UserTests");

            migrationBuilder.RenameIndex(
                name: "IX_TestResults_UserId",
                table: "UserTests",
                newName: "IX_UserTests_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_TestResults_TestId",
                table: "UserTests",
                newName: "IX_UserTests_TestId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_UserTests",
                table: "UserTests",
                column: "UserTestId");

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5963));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5969));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5971));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5972));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5973));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5974));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5975));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 8,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5976));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 9,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5977));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 10,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5978));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5979));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5980));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5983));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5985));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5986));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 16,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5987));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 17,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5988));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 18,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5989));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 19,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5990));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 20,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5991));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 21,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5992));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 22,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5993));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5728));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5731));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5734));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5735));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5773));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5786));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5788));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5790));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5791));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5792));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5793));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5823));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5830));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5831));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5833));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5834));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 16,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5835));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 17,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5836));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 18,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5884));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 19,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5885));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 20,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5887));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 21,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5907));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 22,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5910));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 23, 14, 10, 12, 468, DateTimeKind.Utc).AddTicks(4634), "$2a$11$lXUbE08aBBkX5Kqj7OpagOgseDa9XW2rvmK//NvrwP12aeIKBB3e2" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 23, 14, 10, 12, 640, DateTimeKind.Utc).AddTicks(8465), "$2a$11$Oax5AvkrkawNTMLjt6b54eT7aoGvn67Dkn0F9Fl91/B9ryfO9jDem" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 23, 14, 10, 12, 814, DateTimeKind.Utc).AddTicks(6103), "$2a$11$lZwVax2UVSwNRqQMUwTlZuEhiw1uioopvgchbgaGs/CUv6WR487lO" });

            migrationBuilder.AddForeignKey(
                name: "FK_UserAnswers_UserTests_UserTestId",
                table: "UserAnswers",
                column: "UserTestId",
                principalTable: "UserTests",
                principalColumn: "UserTestId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserTests_Tests_TestId",
                table: "UserTests",
                column: "TestId",
                principalTable: "Tests",
                principalColumn: "TestId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserTests_Users_UserId",
                table: "UserTests",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserTestSkillScores_UserTests_UserTestId",
                table: "UserTestSkillScores",
                column: "UserTestId",
                principalTable: "UserTests",
                principalColumn: "UserTestId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
