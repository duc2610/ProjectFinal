using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ToeicGenius.Migrations
{
    /// <inheritdoc />
    public partial class UpdateTestResultStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "Status",
                table: "TestResults",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 8, 18, 28, 430, DateTimeKind.Utc).AddTicks(3832));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 8, 18, 28, 430, DateTimeKind.Utc).AddTicks(3834));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 8, 18, 28, 430, DateTimeKind.Utc).AddTicks(3835));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 8, 18, 28, 430, DateTimeKind.Utc).AddTicks(3836));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 8, 18, 28, 430, DateTimeKind.Utc).AddTicks(3837));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 8, 18, 28, 430, DateTimeKind.Utc).AddTicks(3838));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 8, 18, 28, 430, DateTimeKind.Utc).AddTicks(3839));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 8,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 8, 18, 28, 430, DateTimeKind.Utc).AddTicks(3839));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 9,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 8, 18, 28, 430, DateTimeKind.Utc).AddTicks(3840));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 10,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 8, 18, 28, 430, DateTimeKind.Utc).AddTicks(3841));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 8, 18, 28, 430, DateTimeKind.Utc).AddTicks(3842));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 8, 18, 28, 430, DateTimeKind.Utc).AddTicks(3843));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 8, 18, 28, 430, DateTimeKind.Utc).AddTicks(3844));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 8, 18, 28, 430, DateTimeKind.Utc).AddTicks(3845));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 8, 18, 28, 430, DateTimeKind.Utc).AddTicks(3846));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 16,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 8, 18, 28, 430, DateTimeKind.Utc).AddTicks(3847));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 17,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 8, 18, 28, 430, DateTimeKind.Utc).AddTicks(3848));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 18,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 8, 18, 28, 430, DateTimeKind.Utc).AddTicks(3849));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 19,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 8, 18, 28, 430, DateTimeKind.Utc).AddTicks(3849));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 20,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 8, 18, 28, 430, DateTimeKind.Utc).AddTicks(3850));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 21,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 8, 18, 28, 430, DateTimeKind.Utc).AddTicks(3851));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 22,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 8, 18, 28, 430, DateTimeKind.Utc).AddTicks(3852));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 8, 18, 28, 430, DateTimeKind.Utc).AddTicks(3694));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 8, 18, 28, 430, DateTimeKind.Utc).AddTicks(3696));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 8, 18, 28, 430, DateTimeKind.Utc).AddTicks(3697));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 8, 18, 28, 430, DateTimeKind.Utc).AddTicks(3698));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 8, 18, 28, 430, DateTimeKind.Utc).AddTicks(3724));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 8, 18, 28, 430, DateTimeKind.Utc).AddTicks(3728));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 8, 18, 28, 430, DateTimeKind.Utc).AddTicks(3729));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 8, 18, 28, 430, DateTimeKind.Utc).AddTicks(3730));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 8, 18, 28, 430, DateTimeKind.Utc).AddTicks(3731));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 8, 18, 28, 430, DateTimeKind.Utc).AddTicks(3732));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 8, 18, 28, 430, DateTimeKind.Utc).AddTicks(3733));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 8, 18, 28, 430, DateTimeKind.Utc).AddTicks(3758));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 8, 18, 28, 430, DateTimeKind.Utc).AddTicks(3759));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 8, 18, 28, 430, DateTimeKind.Utc).AddTicks(3760));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 8, 18, 28, 430, DateTimeKind.Utc).AddTicks(3761));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 8, 18, 28, 430, DateTimeKind.Utc).AddTicks(3762));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 16,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 8, 18, 28, 430, DateTimeKind.Utc).AddTicks(3763));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 17,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 8, 18, 28, 430, DateTimeKind.Utc).AddTicks(3764));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 18,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 8, 18, 28, 430, DateTimeKind.Utc).AddTicks(3787));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 19,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 8, 18, 28, 430, DateTimeKind.Utc).AddTicks(3788));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 20,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 8, 18, 28, 430, DateTimeKind.Utc).AddTicks(3790));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 21,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 8, 18, 28, 430, DateTimeKind.Utc).AddTicks(3796));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 22,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 8, 18, 28, 430, DateTimeKind.Utc).AddTicks(3798));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 11, 13, 8, 18, 28, 548, DateTimeKind.Utc).AddTicks(2395), "$2a$11$Dwfh63HbZmzRqQ16GNM1VuLDzc0JoG/7Wxm7ybza8zWUqN0YamGHG" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 11, 13, 8, 18, 28, 664, DateTimeKind.Utc).AddTicks(4865), "$2a$11$2TRJOa1b/TwVxIbNvSQSVu96wlTgOu3nHTl3N.K7j4gYnHHZgoXae" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 11, 13, 8, 18, 28, 781, DateTimeKind.Utc).AddTicks(2705), "$2a$11$8lzw9QFWoWf3/XLu3UjxiOwpV3wNvSuiqnC4WMX8vogKRcrRtoOTW" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "TestResults",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 7, 6, 43, 29, DateTimeKind.Utc).AddTicks(7377));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 7, 6, 43, 29, DateTimeKind.Utc).AddTicks(7379));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 7, 6, 43, 29, DateTimeKind.Utc).AddTicks(7380));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 7, 6, 43, 29, DateTimeKind.Utc).AddTicks(7381));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 7, 6, 43, 29, DateTimeKind.Utc).AddTicks(7382));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 7, 6, 43, 29, DateTimeKind.Utc).AddTicks(7383));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 7, 6, 43, 29, DateTimeKind.Utc).AddTicks(7384));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 8,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 7, 6, 43, 29, DateTimeKind.Utc).AddTicks(7384));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 9,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 7, 6, 43, 29, DateTimeKind.Utc).AddTicks(7385));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 10,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 7, 6, 43, 29, DateTimeKind.Utc).AddTicks(7386));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 7, 6, 43, 29, DateTimeKind.Utc).AddTicks(7388));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 7, 6, 43, 29, DateTimeKind.Utc).AddTicks(7390));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 7, 6, 43, 29, DateTimeKind.Utc).AddTicks(7391));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 7, 6, 43, 29, DateTimeKind.Utc).AddTicks(7393));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 7, 6, 43, 29, DateTimeKind.Utc).AddTicks(7395));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 16,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 7, 6, 43, 29, DateTimeKind.Utc).AddTicks(7396));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 17,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 7, 6, 43, 29, DateTimeKind.Utc).AddTicks(7397));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 18,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 7, 6, 43, 29, DateTimeKind.Utc).AddTicks(7398));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 19,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 7, 6, 43, 29, DateTimeKind.Utc).AddTicks(7401));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 20,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 7, 6, 43, 29, DateTimeKind.Utc).AddTicks(7402));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 21,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 7, 6, 43, 29, DateTimeKind.Utc).AddTicks(7404));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 22,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 7, 6, 43, 29, DateTimeKind.Utc).AddTicks(7405));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 7, 6, 43, 29, DateTimeKind.Utc).AddTicks(7222));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 7, 6, 43, 29, DateTimeKind.Utc).AddTicks(7225));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 7, 6, 43, 29, DateTimeKind.Utc).AddTicks(7226));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 7, 6, 43, 29, DateTimeKind.Utc).AddTicks(7227));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 7, 6, 43, 29, DateTimeKind.Utc).AddTicks(7255));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 7, 6, 43, 29, DateTimeKind.Utc).AddTicks(7257));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 7, 6, 43, 29, DateTimeKind.Utc).AddTicks(7258));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 7, 6, 43, 29, DateTimeKind.Utc).AddTicks(7259));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 7, 6, 43, 29, DateTimeKind.Utc).AddTicks(7261));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 7, 6, 43, 29, DateTimeKind.Utc).AddTicks(7296));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 7, 6, 43, 29, DateTimeKind.Utc).AddTicks(7297));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 7, 6, 43, 29, DateTimeKind.Utc).AddTicks(7323));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 7, 6, 43, 29, DateTimeKind.Utc).AddTicks(7324));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 7, 6, 43, 29, DateTimeKind.Utc).AddTicks(7325));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 7, 6, 43, 29, DateTimeKind.Utc).AddTicks(7326));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 7, 6, 43, 29, DateTimeKind.Utc).AddTicks(7328));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 16,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 7, 6, 43, 29, DateTimeKind.Utc).AddTicks(7329));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 17,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 7, 6, 43, 29, DateTimeKind.Utc).AddTicks(7330));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 18,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 7, 6, 43, 29, DateTimeKind.Utc).AddTicks(7331));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 19,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 7, 6, 43, 29, DateTimeKind.Utc).AddTicks(7333));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 20,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 7, 6, 43, 29, DateTimeKind.Utc).AddTicks(7334));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 21,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 7, 6, 43, 29, DateTimeKind.Utc).AddTicks(7339));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 22,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 13, 7, 6, 43, 29, DateTimeKind.Utc).AddTicks(7341));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 11, 13, 7, 6, 43, 147, DateTimeKind.Utc).AddTicks(33), "$2a$11$FMHj7UODnmAZZIiMlNCxxumWaHMmQ4Gkax7RfamovOgIWQHk2O0pi" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 11, 13, 7, 6, 43, 264, DateTimeKind.Utc).AddTicks(4640), "$2a$11$N28Yuq36M0DB5Jhi5LMxye3.FCs9pg8yqYdW2otxEjT5BiRb3Pjs2" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 11, 13, 7, 6, 43, 381, DateTimeKind.Utc).AddTicks(35), "$2a$11$nyF1KllMVCyfILNZzMYIaebPK1qB04eLzHGdq.17.hn0Kw38mXPAK" });
        }
    }
}
