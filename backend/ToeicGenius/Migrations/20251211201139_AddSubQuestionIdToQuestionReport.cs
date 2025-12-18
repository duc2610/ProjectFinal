using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ToeicGenius.Migrations
{
    /// <inheritdoc />
    public partial class AddSubQuestionIdToQuestionReport : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "SubQuestionId",
                table: "QuestionReports",
                type: "int",
                nullable: true);

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SubQuestionId",
                table: "QuestionReports");

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Utc).AddTicks(4560));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Utc).AddTicks(4566));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Utc).AddTicks(4569));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Utc).AddTicks(4571));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Utc).AddTicks(4573));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Utc).AddTicks(4576));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Utc).AddTicks(4578));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 8,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Utc).AddTicks(4580));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 9,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Utc).AddTicks(4582));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 10,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Utc).AddTicks(4584));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Utc).AddTicks(4586));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Utc).AddTicks(4588));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Utc).AddTicks(4590));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Utc).AddTicks(4593));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Utc).AddTicks(4595));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 16,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Utc).AddTicks(4597));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 17,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Utc).AddTicks(4599));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 18,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Utc).AddTicks(4601));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 19,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Utc).AddTicks(4603));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 20,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Utc).AddTicks(4605));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 21,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Utc).AddTicks(4607));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 22,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Utc).AddTicks(4609));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Utc).AddTicks(4282));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Utc).AddTicks(4332));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Utc).AddTicks(4336));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Utc).AddTicks(4338));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Utc).AddTicks(4387));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Utc).AddTicks(4413));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Utc).AddTicks(4416));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Utc).AddTicks(4427));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Utc).AddTicks(4429));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Utc).AddTicks(4431));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Utc).AddTicks(4434));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Utc).AddTicks(4475));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Utc).AddTicks(4480));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Utc).AddTicks(4482));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Utc).AddTicks(4485));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Utc).AddTicks(4488));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 16,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Utc).AddTicks(4490));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 17,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Utc).AddTicks(4492));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 18,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Utc).AddTicks(4495));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 19,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Utc).AddTicks(4497));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 20,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Utc).AddTicks(4499));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 21,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Utc).AddTicks(4502));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 22,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Utc).AddTicks(4504));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 11, 28, 11, 42, 18, 727, DateTimeKind.Utc).AddTicks(3014), "$2a$11$SM10K0UckDRQcFOXNYvCw.b6TkiaNU8.hEH2ceHvSd2JE/weCl2/K" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 11, 28, 11, 42, 18, 959, DateTimeKind.Utc).AddTicks(3175), "$2a$11$ZN.La1z8QVNlp43dSLMHP.yHwlH5qsLBPXkqP4cI9QRqQnFM7eC9u" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 11, 28, 11, 42, 19, 188, DateTimeKind.Utc).AddTicks(298), "$2a$11$C2rI4p4.MqVmq81dK22TJ.qXC2uruKsQrj3t9u2SlgWYimFxezQsu" });
        }
    }
}
