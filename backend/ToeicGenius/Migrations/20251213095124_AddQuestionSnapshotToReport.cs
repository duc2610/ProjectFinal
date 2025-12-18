using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ToeicGenius.Migrations
{
    /// <inheritdoc />
    public partial class AddQuestionSnapshotToReport : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsQuestionGroup",
                table: "QuestionReports",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "QuestionSnapshotJson",
                table: "QuestionReports",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 13, 16, 50, 50, 379, DateTimeKind.Utc).AddTicks(9849));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 13, 16, 50, 50, 379, DateTimeKind.Utc).AddTicks(9857));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 13, 16, 50, 50, 379, DateTimeKind.Utc).AddTicks(9908));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 13, 16, 50, 50, 379, DateTimeKind.Utc).AddTicks(9912));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 13, 16, 50, 50, 379, DateTimeKind.Utc).AddTicks(9915));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 13, 16, 50, 50, 379, DateTimeKind.Utc).AddTicks(9918));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 13, 16, 50, 50, 379, DateTimeKind.Utc).AddTicks(9921));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 8,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 13, 16, 50, 50, 379, DateTimeKind.Utc).AddTicks(9924));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 9,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 13, 16, 50, 50, 379, DateTimeKind.Utc).AddTicks(9928));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 10,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 13, 16, 50, 50, 379, DateTimeKind.Utc).AddTicks(9931));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 13, 16, 50, 50, 379, DateTimeKind.Utc).AddTicks(9934));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 13, 16, 50, 50, 379, DateTimeKind.Utc).AddTicks(9937));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 13, 16, 50, 50, 379, DateTimeKind.Utc).AddTicks(9940));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 13, 16, 50, 50, 379, DateTimeKind.Utc).AddTicks(9943));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 13, 16, 50, 50, 379, DateTimeKind.Utc).AddTicks(9947));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 16,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 13, 16, 50, 50, 379, DateTimeKind.Utc).AddTicks(9949));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 17,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 13, 16, 50, 50, 379, DateTimeKind.Utc).AddTicks(9952));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 18,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 13, 16, 50, 50, 379, DateTimeKind.Utc).AddTicks(9955));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 19,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 13, 16, 50, 50, 379, DateTimeKind.Utc).AddTicks(9958));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 20,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 13, 16, 50, 50, 379, DateTimeKind.Utc).AddTicks(9962));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 21,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 13, 16, 50, 50, 379, DateTimeKind.Utc).AddTicks(9965));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 22,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 13, 16, 50, 50, 379, DateTimeKind.Utc).AddTicks(9968));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 13, 16, 50, 50, 379, DateTimeKind.Utc).AddTicks(9348));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 13, 16, 50, 50, 379, DateTimeKind.Utc).AddTicks(9470));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 13, 16, 50, 50, 379, DateTimeKind.Utc).AddTicks(9474));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 13, 16, 50, 50, 379, DateTimeKind.Utc).AddTicks(9477));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 13, 16, 50, 50, 379, DateTimeKind.Utc).AddTicks(9548));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 13, 16, 50, 50, 379, DateTimeKind.Utc).AddTicks(9565));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 13, 16, 50, 50, 379, DateTimeKind.Utc).AddTicks(9569));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 13, 16, 50, 50, 379, DateTimeKind.Utc).AddTicks(9573));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 13, 16, 50, 50, 379, DateTimeKind.Utc).AddTicks(9576));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 13, 16, 50, 50, 379, DateTimeKind.Utc).AddTicks(9580));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 13, 16, 50, 50, 379, DateTimeKind.Utc).AddTicks(9615));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 13, 16, 50, 50, 379, DateTimeKind.Utc).AddTicks(9665));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 13, 16, 50, 50, 379, DateTimeKind.Utc).AddTicks(9670));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 13, 16, 50, 50, 379, DateTimeKind.Utc).AddTicks(9674));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 13, 16, 50, 50, 379, DateTimeKind.Utc).AddTicks(9677));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 13, 16, 50, 50, 379, DateTimeKind.Utc).AddTicks(9685));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 16,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 13, 16, 50, 50, 379, DateTimeKind.Utc).AddTicks(9689));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 17,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 13, 16, 50, 50, 379, DateTimeKind.Utc).AddTicks(9745));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 18,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 13, 16, 50, 50, 379, DateTimeKind.Utc).AddTicks(9750));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 19,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 13, 16, 50, 50, 379, DateTimeKind.Utc).AddTicks(9753));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 20,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 13, 16, 50, 50, 379, DateTimeKind.Utc).AddTicks(9757));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 21,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 13, 16, 50, 50, 379, DateTimeKind.Utc).AddTicks(9760));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 22,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 13, 16, 50, 50, 379, DateTimeKind.Utc).AddTicks(9764));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 12, 13, 16, 50, 50, 988, DateTimeKind.Utc).AddTicks(3406), "$2a$11$3Xy/X6PBVOAc7WZVHUe6kOYKpmRJmane2ZMlObSw6SJKoc93rKNHi" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 12, 13, 16, 50, 51, 379, DateTimeKind.Utc).AddTicks(1419), "$2a$11$IIWwvI8l7QlSDkur/rQgiOT03WrF.OhyTpZrr48tAYU5JcM1Ej6F2" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 12, 13, 16, 50, 52, 270, DateTimeKind.Utc).AddTicks(5520), "$2a$11$5Zq8cTr4tBJo4Z.PpOqqaeB3.lYpPN4190uJQKb/8HyBCu4G6NiH2" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsQuestionGroup",
                table: "QuestionReports");

            migrationBuilder.DropColumn(
                name: "QuestionSnapshotJson",
                table: "QuestionReports");

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 12, 3, 11, 36, 937, DateTimeKind.Utc).AddTicks(9208));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 12, 3, 11, 36, 937, DateTimeKind.Utc).AddTicks(9214));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 12, 3, 11, 36, 937, DateTimeKind.Utc).AddTicks(9241));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 12, 3, 11, 36, 937, DateTimeKind.Utc).AddTicks(9243));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 12, 3, 11, 36, 937, DateTimeKind.Utc).AddTicks(9245));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 12, 3, 11, 36, 937, DateTimeKind.Utc).AddTicks(9246));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 12, 3, 11, 36, 937, DateTimeKind.Utc).AddTicks(9248));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 8,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 12, 3, 11, 36, 937, DateTimeKind.Utc).AddTicks(9250));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 9,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 12, 3, 11, 36, 937, DateTimeKind.Utc).AddTicks(9251));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 10,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 12, 3, 11, 36, 937, DateTimeKind.Utc).AddTicks(9253));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 12, 3, 11, 36, 937, DateTimeKind.Utc).AddTicks(9255));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 12, 3, 11, 36, 937, DateTimeKind.Utc).AddTicks(9257));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 12, 3, 11, 36, 937, DateTimeKind.Utc).AddTicks(9259));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 12, 3, 11, 36, 937, DateTimeKind.Utc).AddTicks(9260));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 12, 3, 11, 36, 937, DateTimeKind.Utc).AddTicks(9262));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 16,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 12, 3, 11, 36, 937, DateTimeKind.Utc).AddTicks(9264));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 17,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 12, 3, 11, 36, 937, DateTimeKind.Utc).AddTicks(9265));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 18,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 12, 3, 11, 36, 937, DateTimeKind.Utc).AddTicks(9267));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 19,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 12, 3, 11, 36, 937, DateTimeKind.Utc).AddTicks(9268));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 20,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 12, 3, 11, 36, 937, DateTimeKind.Utc).AddTicks(9270));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 21,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 12, 3, 11, 36, 937, DateTimeKind.Utc).AddTicks(9271));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 22,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 12, 3, 11, 36, 937, DateTimeKind.Utc).AddTicks(9273));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 12, 3, 11, 36, 937, DateTimeKind.Utc).AddTicks(8960));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 12, 3, 11, 36, 937, DateTimeKind.Utc).AddTicks(9004));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 12, 3, 11, 36, 937, DateTimeKind.Utc).AddTicks(9006));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 12, 3, 11, 36, 937, DateTimeKind.Utc).AddTicks(9007));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 12, 3, 11, 36, 937, DateTimeKind.Utc).AddTicks(9050));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 12, 3, 11, 36, 937, DateTimeKind.Utc).AddTicks(9055));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 12, 3, 11, 36, 937, DateTimeKind.Utc).AddTicks(9057));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 12, 3, 11, 36, 937, DateTimeKind.Utc).AddTicks(9059));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 12, 3, 11, 36, 937, DateTimeKind.Utc).AddTicks(9061));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 12, 3, 11, 36, 937, DateTimeKind.Utc).AddTicks(9063));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 12, 3, 11, 36, 937, DateTimeKind.Utc).AddTicks(9083));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 12, 3, 11, 36, 937, DateTimeKind.Utc).AddTicks(9114));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 12, 3, 11, 36, 937, DateTimeKind.Utc).AddTicks(9117));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 12, 3, 11, 36, 937, DateTimeKind.Utc).AddTicks(9119));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 12, 3, 11, 36, 937, DateTimeKind.Utc).AddTicks(9124));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 12, 3, 11, 36, 937, DateTimeKind.Utc).AddTicks(9126));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 16,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 12, 3, 11, 36, 937, DateTimeKind.Utc).AddTicks(9128));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 17,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 12, 3, 11, 36, 937, DateTimeKind.Utc).AddTicks(9130));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 18,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 12, 3, 11, 36, 937, DateTimeKind.Utc).AddTicks(9132));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 19,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 12, 3, 11, 36, 937, DateTimeKind.Utc).AddTicks(9133));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 20,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 12, 3, 11, 36, 937, DateTimeKind.Utc).AddTicks(9144));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 21,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 12, 3, 11, 36, 937, DateTimeKind.Utc).AddTicks(9151));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 22,
                column: "CreatedAt",
                value: new DateTime(2025, 12, 12, 3, 11, 36, 937, DateTimeKind.Utc).AddTicks(9153));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 12, 12, 3, 11, 37, 133, DateTimeKind.Utc).AddTicks(4801), "$2a$11$WbXL6m.mByPrm0u6UFSjxe6Q1ZN1IWdRd2A41h.2TIg2ttLz4SUiK" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 12, 12, 3, 11, 37, 358, DateTimeKind.Utc).AddTicks(5408), "$2a$11$I6SOn/bgerNpX3tzcWZSa.bbGpIk8C3oVCKtD0LHABgBGpUPc22lO" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 12, 12, 3, 11, 37, 581, DateTimeKind.Utc).AddTicks(4513), "$2a$11$TWH/mDXgqbxeAbHp9VRaYu2uX9WDhQ81tsG25IF8B1DS06MBULQly" });
        }
    }
}
