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
            migrationBuilder.DropColumn(
                name: "IncorrectCount",
                table: "UserTestSkillScores");

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 16, 4, 53, 430, DateTimeKind.Utc).AddTicks(8237));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 16, 4, 53, 430, DateTimeKind.Utc).AddTicks(8238));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 16, 4, 53, 430, DateTimeKind.Utc).AddTicks(8239));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 16, 4, 53, 430, DateTimeKind.Utc).AddTicks(8240));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 16, 4, 53, 430, DateTimeKind.Utc).AddTicks(8241));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 16, 4, 53, 430, DateTimeKind.Utc).AddTicks(8242));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 16, 4, 53, 430, DateTimeKind.Utc).AddTicks(8243));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 8,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 16, 4, 53, 430, DateTimeKind.Utc).AddTicks(8244));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 9,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 16, 4, 53, 430, DateTimeKind.Utc).AddTicks(8245));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 10,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 16, 4, 53, 430, DateTimeKind.Utc).AddTicks(8246));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 16, 4, 53, 430, DateTimeKind.Utc).AddTicks(8247));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 16, 4, 53, 430, DateTimeKind.Utc).AddTicks(8247));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 16, 4, 53, 430, DateTimeKind.Utc).AddTicks(8248));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 16, 4, 53, 430, DateTimeKind.Utc).AddTicks(8249));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 16, 4, 53, 430, DateTimeKind.Utc).AddTicks(8250));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 16,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 16, 4, 53, 430, DateTimeKind.Utc).AddTicks(8251));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 17,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 16, 4, 53, 430, DateTimeKind.Utc).AddTicks(8252));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 18,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 16, 4, 53, 430, DateTimeKind.Utc).AddTicks(8253));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 19,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 16, 4, 53, 430, DateTimeKind.Utc).AddTicks(8254));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 20,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 16, 4, 53, 430, DateTimeKind.Utc).AddTicks(8255));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 21,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 16, 4, 53, 430, DateTimeKind.Utc).AddTicks(8256));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 22,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 16, 4, 53, 430, DateTimeKind.Utc).AddTicks(8257));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 16, 4, 53, 430, DateTimeKind.Utc).AddTicks(8126));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 16, 4, 53, 430, DateTimeKind.Utc).AddTicks(8129));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 16, 4, 53, 430, DateTimeKind.Utc).AddTicks(8129));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 16, 4, 53, 430, DateTimeKind.Utc).AddTicks(8130));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 16, 4, 53, 430, DateTimeKind.Utc).AddTicks(8157));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 16, 4, 53, 430, DateTimeKind.Utc).AddTicks(8159));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 16, 4, 53, 430, DateTimeKind.Utc).AddTicks(8160));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 16, 4, 53, 430, DateTimeKind.Utc).AddTicks(8161));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 16, 4, 53, 430, DateTimeKind.Utc).AddTicks(8162));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 16, 4, 53, 430, DateTimeKind.Utc).AddTicks(8163));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 16, 4, 53, 430, DateTimeKind.Utc).AddTicks(8164));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 16, 4, 53, 430, DateTimeKind.Utc).AddTicks(8188));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 16, 4, 53, 430, DateTimeKind.Utc).AddTicks(8190));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 16, 4, 53, 430, DateTimeKind.Utc).AddTicks(8191));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 16, 4, 53, 430, DateTimeKind.Utc).AddTicks(8192));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 16, 4, 53, 430, DateTimeKind.Utc).AddTicks(8193));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 16,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 16, 4, 53, 430, DateTimeKind.Utc).AddTicks(8194));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 17,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 16, 4, 53, 430, DateTimeKind.Utc).AddTicks(8195));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 18,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 16, 4, 53, 430, DateTimeKind.Utc).AddTicks(8196));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 19,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 16, 4, 53, 430, DateTimeKind.Utc).AddTicks(8197));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 20,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 16, 4, 53, 430, DateTimeKind.Utc).AddTicks(8199));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 21,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 16, 4, 53, 430, DateTimeKind.Utc).AddTicks(8203));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 22,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 16, 4, 53, 430, DateTimeKind.Utc).AddTicks(8205));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 26, 16, 4, 53, 547, DateTimeKind.Utc).AddTicks(5288), "$2a$11$0QAyWw3JzCm5alatP45bt.91EG.z5DHO.soEIjTRW70TljkAxRhSC" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 26, 16, 4, 53, 664, DateTimeKind.Utc).AddTicks(4948), "$2a$11$TWyyV97ktpUHbyHpXcXuIeN2G0UUzTZlQwzbUSUr4RLJgiuJpxK3G" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 26, 16, 4, 53, 780, DateTimeKind.Utc).AddTicks(7583), "$2a$11$6o7O5s0yzQ3I8sAeTn2//.taxrYvrl9thtFwgadFBR0OecloGOJda" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "IncorrectCount",
                table: "UserTestSkillScores",
                type: "int",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 15, 41, 36, 41, DateTimeKind.Utc).AddTicks(17));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 15, 41, 36, 41, DateTimeKind.Utc).AddTicks(19));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 15, 41, 36, 41, DateTimeKind.Utc).AddTicks(20));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 15, 41, 36, 41, DateTimeKind.Utc).AddTicks(21));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 15, 41, 36, 41, DateTimeKind.Utc).AddTicks(22));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 15, 41, 36, 41, DateTimeKind.Utc).AddTicks(23));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 15, 41, 36, 41, DateTimeKind.Utc).AddTicks(23));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 8,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 15, 41, 36, 41, DateTimeKind.Utc).AddTicks(24));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 9,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 15, 41, 36, 41, DateTimeKind.Utc).AddTicks(25));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 10,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 15, 41, 36, 41, DateTimeKind.Utc).AddTicks(27));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 15, 41, 36, 41, DateTimeKind.Utc).AddTicks(27));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 15, 41, 36, 41, DateTimeKind.Utc).AddTicks(28));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 15, 41, 36, 41, DateTimeKind.Utc).AddTicks(29));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 15, 41, 36, 41, DateTimeKind.Utc).AddTicks(30));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 15, 41, 36, 41, DateTimeKind.Utc).AddTicks(31));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 16,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 15, 41, 36, 41, DateTimeKind.Utc).AddTicks(32));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 17,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 15, 41, 36, 41, DateTimeKind.Utc).AddTicks(33));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 18,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 15, 41, 36, 41, DateTimeKind.Utc).AddTicks(34));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 19,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 15, 41, 36, 41, DateTimeKind.Utc).AddTicks(35));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 20,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 15, 41, 36, 41, DateTimeKind.Utc).AddTicks(36));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 21,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 15, 41, 36, 41, DateTimeKind.Utc).AddTicks(37));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 22,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 15, 41, 36, 41, DateTimeKind.Utc).AddTicks(37));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 15, 41, 36, 40, DateTimeKind.Utc).AddTicks(9862));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 15, 41, 36, 40, DateTimeKind.Utc).AddTicks(9865));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 15, 41, 36, 40, DateTimeKind.Utc).AddTicks(9866));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 15, 41, 36, 40, DateTimeKind.Utc).AddTicks(9866));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 15, 41, 36, 40, DateTimeKind.Utc).AddTicks(9892));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 15, 41, 36, 40, DateTimeKind.Utc).AddTicks(9894));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 15, 41, 36, 40, DateTimeKind.Utc).AddTicks(9895));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 15, 41, 36, 40, DateTimeKind.Utc).AddTicks(9896));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 15, 41, 36, 40, DateTimeKind.Utc).AddTicks(9897));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 15, 41, 36, 40, DateTimeKind.Utc).AddTicks(9898));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 15, 41, 36, 40, DateTimeKind.Utc).AddTicks(9899));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 15, 41, 36, 40, DateTimeKind.Utc).AddTicks(9924));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 15, 41, 36, 40, DateTimeKind.Utc).AddTicks(9926));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 15, 41, 36, 40, DateTimeKind.Utc).AddTicks(9927));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 15, 41, 36, 40, DateTimeKind.Utc).AddTicks(9928));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 15, 41, 36, 40, DateTimeKind.Utc).AddTicks(9929));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 16,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 15, 41, 36, 40, DateTimeKind.Utc).AddTicks(9930));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 17,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 15, 41, 36, 40, DateTimeKind.Utc).AddTicks(9931));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 18,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 15, 41, 36, 40, DateTimeKind.Utc).AddTicks(9932));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 19,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 15, 41, 36, 40, DateTimeKind.Utc).AddTicks(9933));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 20,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 15, 41, 36, 40, DateTimeKind.Utc).AddTicks(9935));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 21,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 15, 41, 36, 40, DateTimeKind.Utc).AddTicks(9940));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 22,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 26, 15, 41, 36, 40, DateTimeKind.Utc).AddTicks(9984));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 26, 15, 41, 36, 157, DateTimeKind.Utc).AddTicks(9668), "$2a$11$hV/WkNj5QtW6j72JZx8mG.ytYIWCzUrUl.iqhGbvEYbeWRwu/MD0." });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 26, 15, 41, 36, 274, DateTimeKind.Utc).AddTicks(5546), "$2a$11$xnjayWDb0ibVknmqYg.vceCmNzfkKTkdbE7BUoqfEog4sQNQStYOO" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 26, 15, 41, 36, 391, DateTimeKind.Utc).AddTicks(2163), "$2a$11$suyvMF5rrQKE9FW9IwQGnOuHi9NyCXo5kgDlnjdvHgTNJP.dab08e" });
        }
    }
}
