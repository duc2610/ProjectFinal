using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ToeicGenius.Migrations
{
    /// <inheritdoc />
    public partial class UpdateTestResultAndSkillScores : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "UserTestResultId",
                table: "UserTestSkillScores",
                newName: "TestSkillScoreId");

            migrationBuilder.RenameColumn(
                name: "QuantityQuestion",
                table: "Tests",
                newName: "TotalQuestion");

            migrationBuilder.AddColumn<int>(
                name: "CorrectCount",
                table: "UserTestSkillScores",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TotalQuestions",
                table: "UserTestSkillScores",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CorrectCount",
                table: "TestResults",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "IncorrectCount",
                table: "TestResults",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "SkipCount",
                table: "TestResults",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "TotalQuestions",
                table: "TestResults",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 28, 5, 6, 29, 290, DateTimeKind.Utc).AddTicks(3889));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 28, 5, 6, 29, 290, DateTimeKind.Utc).AddTicks(3892));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 28, 5, 6, 29, 290, DateTimeKind.Utc).AddTicks(3893));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 28, 5, 6, 29, 290, DateTimeKind.Utc).AddTicks(3895));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 28, 5, 6, 29, 290, DateTimeKind.Utc).AddTicks(3896));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 28, 5, 6, 29, 290, DateTimeKind.Utc).AddTicks(3898));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 28, 5, 6, 29, 290, DateTimeKind.Utc).AddTicks(3899));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 8,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 28, 5, 6, 29, 290, DateTimeKind.Utc).AddTicks(3901));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 9,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 28, 5, 6, 29, 290, DateTimeKind.Utc).AddTicks(3902));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 10,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 28, 5, 6, 29, 290, DateTimeKind.Utc).AddTicks(3904));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 28, 5, 6, 29, 290, DateTimeKind.Utc).AddTicks(3905));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 28, 5, 6, 29, 290, DateTimeKind.Utc).AddTicks(3907));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 28, 5, 6, 29, 290, DateTimeKind.Utc).AddTicks(3908));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 28, 5, 6, 29, 290, DateTimeKind.Utc).AddTicks(3912));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 28, 5, 6, 29, 290, DateTimeKind.Utc).AddTicks(3913));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 16,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 28, 5, 6, 29, 290, DateTimeKind.Utc).AddTicks(3915));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 17,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 28, 5, 6, 29, 290, DateTimeKind.Utc).AddTicks(3916));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 18,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 28, 5, 6, 29, 290, DateTimeKind.Utc).AddTicks(3918));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 19,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 28, 5, 6, 29, 290, DateTimeKind.Utc).AddTicks(3919));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 20,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 28, 5, 6, 29, 290, DateTimeKind.Utc).AddTicks(3921));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 21,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 28, 5, 6, 29, 290, DateTimeKind.Utc).AddTicks(3922));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 22,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 28, 5, 6, 29, 290, DateTimeKind.Utc).AddTicks(3924));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 28, 5, 6, 29, 290, DateTimeKind.Utc).AddTicks(3706));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 28, 5, 6, 29, 290, DateTimeKind.Utc).AddTicks(3710));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 28, 5, 6, 29, 290, DateTimeKind.Utc).AddTicks(3711));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 28, 5, 6, 29, 290, DateTimeKind.Utc).AddTicks(3713));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 28, 5, 6, 29, 290, DateTimeKind.Utc).AddTicks(3754));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 28, 5, 6, 29, 290, DateTimeKind.Utc).AddTicks(3757));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 28, 5, 6, 29, 290, DateTimeKind.Utc).AddTicks(3759));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 28, 5, 6, 29, 290, DateTimeKind.Utc).AddTicks(3761));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 28, 5, 6, 29, 290, DateTimeKind.Utc).AddTicks(3762));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 28, 5, 6, 29, 290, DateTimeKind.Utc).AddTicks(3764));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 28, 5, 6, 29, 290, DateTimeKind.Utc).AddTicks(3766));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 28, 5, 6, 29, 290, DateTimeKind.Utc).AddTicks(3808));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 28, 5, 6, 29, 290, DateTimeKind.Utc).AddTicks(3810));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 28, 5, 6, 29, 290, DateTimeKind.Utc).AddTicks(3812));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 28, 5, 6, 29, 290, DateTimeKind.Utc).AddTicks(3814));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 28, 5, 6, 29, 290, DateTimeKind.Utc).AddTicks(3816));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 16,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 28, 5, 6, 29, 290, DateTimeKind.Utc).AddTicks(3817));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 17,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 28, 5, 6, 29, 290, DateTimeKind.Utc).AddTicks(3819));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 18,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 28, 5, 6, 29, 290, DateTimeKind.Utc).AddTicks(3821));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 19,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 28, 5, 6, 29, 290, DateTimeKind.Utc).AddTicks(3823));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 20,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 28, 5, 6, 29, 290, DateTimeKind.Utc).AddTicks(3825));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 21,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 28, 5, 6, 29, 290, DateTimeKind.Utc).AddTicks(3836));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 22,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 28, 5, 6, 29, 290, DateTimeKind.Utc).AddTicks(3838));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 28, 5, 6, 29, 481, DateTimeKind.Utc).AddTicks(1481), "$2a$11$EJ7Q5GyA7qaIB/vdyuHNK.KxPVC0kUm6stwmUf6qM05LV.YmGIVvK" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 28, 5, 6, 29, 665, DateTimeKind.Utc).AddTicks(7673), "$2a$11$klroocBdinoDF4kkYOEKrevNRxkZP6.WKxjDLzkg4HLGhRcGkEpY." });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 28, 5, 6, 29, 828, DateTimeKind.Utc).AddTicks(9046), "$2a$11$d7w4.hDK1V440yahC8YfQe72lPn2wAxAVu9lWgeiAN8xNpw5pgsRu" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CorrectCount",
                table: "UserTestSkillScores");

            migrationBuilder.DropColumn(
                name: "TotalQuestions",
                table: "UserTestSkillScores");

            migrationBuilder.DropColumn(
                name: "CorrectCount",
                table: "TestResults");

            migrationBuilder.DropColumn(
                name: "IncorrectCount",
                table: "TestResults");

            migrationBuilder.DropColumn(
                name: "SkipCount",
                table: "TestResults");

            migrationBuilder.DropColumn(
                name: "TotalQuestions",
                table: "TestResults");

            migrationBuilder.RenameColumn(
                name: "TestSkillScoreId",
                table: "UserTestSkillScores",
                newName: "UserTestResultId");

            migrationBuilder.RenameColumn(
                name: "TotalQuestion",
                table: "Tests",
                newName: "QuantityQuestion");

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1261));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1263));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1264));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1265));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1266));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1267));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1268));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 8,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1269));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 9,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1270));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 10,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1271));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1271));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1272));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1273));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1274));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1275));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 16,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1276));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 17,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1277));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 18,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1278));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 19,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1279));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 20,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1280));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 21,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1281));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 22,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1282));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1092));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1094));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1095));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1096));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1124));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1126));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1128));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1129));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1130));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1131));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1132));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1213));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1215));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1216));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1217));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1218));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 16,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1219));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 17,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1220));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 18,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1222));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 19,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1223));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 20,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1224));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 21,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1227));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 22,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1229));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 24, 16, 31, 14, 521, DateTimeKind.Utc).AddTicks(7082), "$2a$11$CSS2yJ45a7huqqG7BUMDbe1Hmt7Smnk.agcERJe65zKfOnhvgu3/u" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 24, 16, 31, 14, 638, DateTimeKind.Utc).AddTicks(1376), "$2a$11$taEWebTEhLh1yvYgWgDrWuqlI.fkpTirNG3uJaTXudZk3GdmWFxx." });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 24, 16, 31, 14, 754, DateTimeKind.Utc).AddTicks(3396), "$2a$11$ksN97KhZguJYNeRHgIXUtO2M2AOo/MIKxCu19p6LjnUgY6jm6B/Uq" });
        }
    }
}
