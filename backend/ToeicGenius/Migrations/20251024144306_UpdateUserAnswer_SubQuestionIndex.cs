using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ToeicGenius.Migrations
{
    /// <inheritdoc />
    public partial class UpdateUserAnswer_SubQuestionIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserAnswers_Options_OptionId",
                table: "UserAnswers");

            migrationBuilder.DropIndex(
                name: "IX_UserAnswers_OptionId",
                table: "UserAnswers");

            migrationBuilder.RenameColumn(
                name: "OptionId",
                table: "UserAnswers",
                newName: "SubQuestionIndex");

            migrationBuilder.AddColumn<string>(
                name: "ChosenOptionLabel",
                table: "UserAnswers",
                type: "nvarchar(5)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsCorrect",
                table: "UserAnswers",
                type: "bit",
                nullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "PartId",
                table: "TestQuestions",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 14, 43, 3, 939, DateTimeKind.Utc).AddTicks(3541));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 14, 43, 3, 939, DateTimeKind.Utc).AddTicks(3543));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 14, 43, 3, 939, DateTimeKind.Utc).AddTicks(3544));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 14, 43, 3, 939, DateTimeKind.Utc).AddTicks(3545));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 14, 43, 3, 939, DateTimeKind.Utc).AddTicks(3546));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 14, 43, 3, 939, DateTimeKind.Utc).AddTicks(3547));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 14, 43, 3, 939, DateTimeKind.Utc).AddTicks(3548));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 8,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 14, 43, 3, 939, DateTimeKind.Utc).AddTicks(3548));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 9,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 14, 43, 3, 939, DateTimeKind.Utc).AddTicks(3549));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 10,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 14, 43, 3, 939, DateTimeKind.Utc).AddTicks(3550));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 14, 43, 3, 939, DateTimeKind.Utc).AddTicks(3551));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 14, 43, 3, 939, DateTimeKind.Utc).AddTicks(3552));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 14, 43, 3, 939, DateTimeKind.Utc).AddTicks(3553));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 14, 43, 3, 939, DateTimeKind.Utc).AddTicks(3554));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 14, 43, 3, 939, DateTimeKind.Utc).AddTicks(3555));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 16,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 14, 43, 3, 939, DateTimeKind.Utc).AddTicks(3556));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 17,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 14, 43, 3, 939, DateTimeKind.Utc).AddTicks(3557));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 18,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 14, 43, 3, 939, DateTimeKind.Utc).AddTicks(3558));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 19,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 14, 43, 3, 939, DateTimeKind.Utc).AddTicks(3558));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 20,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 14, 43, 3, 939, DateTimeKind.Utc).AddTicks(3590));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 21,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 14, 43, 3, 939, DateTimeKind.Utc).AddTicks(3591));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 22,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 14, 43, 3, 939, DateTimeKind.Utc).AddTicks(3592));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 14, 43, 3, 939, DateTimeKind.Utc).AddTicks(3424));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 14, 43, 3, 939, DateTimeKind.Utc).AddTicks(3426));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 14, 43, 3, 939, DateTimeKind.Utc).AddTicks(3427));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 14, 43, 3, 939, DateTimeKind.Utc).AddTicks(3428));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 14, 43, 3, 939, DateTimeKind.Utc).AddTicks(3460));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 14, 43, 3, 939, DateTimeKind.Utc).AddTicks(3462));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 14, 43, 3, 939, DateTimeKind.Utc).AddTicks(3463));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 14, 43, 3, 939, DateTimeKind.Utc).AddTicks(3464));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 14, 43, 3, 939, DateTimeKind.Utc).AddTicks(3465));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 14, 43, 3, 939, DateTimeKind.Utc).AddTicks(3466));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 14, 43, 3, 939, DateTimeKind.Utc).AddTicks(3467));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 14, 43, 3, 939, DateTimeKind.Utc).AddTicks(3494));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 14, 43, 3, 939, DateTimeKind.Utc).AddTicks(3496));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 14, 43, 3, 939, DateTimeKind.Utc).AddTicks(3497));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 14, 43, 3, 939, DateTimeKind.Utc).AddTicks(3498));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 14, 43, 3, 939, DateTimeKind.Utc).AddTicks(3499));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 16,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 14, 43, 3, 939, DateTimeKind.Utc).AddTicks(3500));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 17,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 14, 43, 3, 939, DateTimeKind.Utc).AddTicks(3501));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 18,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 14, 43, 3, 939, DateTimeKind.Utc).AddTicks(3502));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 19,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 14, 43, 3, 939, DateTimeKind.Utc).AddTicks(3503));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 20,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 14, 43, 3, 939, DateTimeKind.Utc).AddTicks(3505));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 21,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 14, 43, 3, 939, DateTimeKind.Utc).AddTicks(3506));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 22,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 14, 43, 3, 939, DateTimeKind.Utc).AddTicks(3507));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 24, 14, 43, 4, 57, DateTimeKind.Utc).AddTicks(1907), "$2a$11$3gvF3KksHbZXTrfsO/pBKeSV4ETwCOBqLcBp13b29IVbqAalncszu" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 24, 14, 43, 4, 173, DateTimeKind.Utc).AddTicks(8509), "$2a$11$Q4s6FUTL4zLcRXt/CfNrbOyGq0wnEdrx2tCNUivN3jKibUf7GkpXO" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 24, 14, 43, 4, 290, DateTimeKind.Utc).AddTicks(604), "$2a$11$i4uZN/YysVbnoUAAjWbMbewFHfkcUnX.EINO6I2xFilTam8vvYeaG" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ChosenOptionLabel",
                table: "UserAnswers");

            migrationBuilder.DropColumn(
                name: "IsCorrect",
                table: "UserAnswers");

            migrationBuilder.RenameColumn(
                name: "SubQuestionIndex",
                table: "UserAnswers",
                newName: "OptionId");

            migrationBuilder.AlterColumn<int>(
                name: "PartId",
                table: "TestQuestions",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

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

            migrationBuilder.CreateIndex(
                name: "IX_UserAnswers_OptionId",
                table: "UserAnswers",
                column: "OptionId");

            migrationBuilder.AddForeignKey(
                name: "FK_UserAnswers_Options_OptionId",
                table: "UserAnswers",
                column: "OptionId",
                principalTable: "Options",
                principalColumn: "OptionId");
        }
    }
}
