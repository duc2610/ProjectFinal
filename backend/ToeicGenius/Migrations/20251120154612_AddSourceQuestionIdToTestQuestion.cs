using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ToeicGenius.Migrations
{
    /// <inheritdoc />
    public partial class AddSourceQuestionIdToTestQuestion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "SourceQuestionGroupId",
                table: "TestQuestions",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SourceQuestionId",
                table: "TestQuestions",
                type: "int",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 22, 46, 10, 472, DateTimeKind.Unspecified).AddTicks(5522));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 22, 46, 10, 472, DateTimeKind.Unspecified).AddTicks(5532));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 22, 46, 10, 472, DateTimeKind.Unspecified).AddTicks(5565));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 22, 46, 10, 472, DateTimeKind.Unspecified).AddTicks(5567));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 22, 46, 10, 472, DateTimeKind.Unspecified).AddTicks(5569));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 22, 46, 10, 472, DateTimeKind.Unspecified).AddTicks(5570));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 22, 46, 10, 472, DateTimeKind.Unspecified).AddTicks(5572));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 8,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 22, 46, 10, 472, DateTimeKind.Unspecified).AddTicks(5574));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 9,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 22, 46, 10, 472, DateTimeKind.Unspecified).AddTicks(5575));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 10,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 22, 46, 10, 472, DateTimeKind.Unspecified).AddTicks(5577));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 22, 46, 10, 472, DateTimeKind.Unspecified).AddTicks(5579));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 22, 46, 10, 472, DateTimeKind.Unspecified).AddTicks(5582));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 22, 46, 10, 472, DateTimeKind.Unspecified).AddTicks(5584));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 22, 46, 10, 472, DateTimeKind.Unspecified).AddTicks(5585));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 22, 46, 10, 472, DateTimeKind.Unspecified).AddTicks(5587));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 16,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 22, 46, 10, 472, DateTimeKind.Unspecified).AddTicks(5589));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 17,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 22, 46, 10, 472, DateTimeKind.Unspecified).AddTicks(5590));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 18,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 22, 46, 10, 472, DateTimeKind.Unspecified).AddTicks(5592));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 19,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 22, 46, 10, 472, DateTimeKind.Unspecified).AddTicks(5594));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 20,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 22, 46, 10, 472, DateTimeKind.Unspecified).AddTicks(5595));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 21,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 22, 46, 10, 472, DateTimeKind.Unspecified).AddTicks(5597));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 22,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 22, 46, 10, 472, DateTimeKind.Unspecified).AddTicks(5598));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 22, 46, 10, 472, DateTimeKind.Unspecified).AddTicks(5181));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 22, 46, 10, 472, DateTimeKind.Unspecified).AddTicks(5258));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 22, 46, 10, 472, DateTimeKind.Unspecified).AddTicks(5260));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 22, 46, 10, 472, DateTimeKind.Unspecified).AddTicks(5261));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 22, 46, 10, 472, DateTimeKind.Unspecified).AddTicks(5316));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 22, 46, 10, 472, DateTimeKind.Unspecified).AddTicks(5326));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 22, 46, 10, 472, DateTimeKind.Unspecified).AddTicks(5328));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 22, 46, 10, 472, DateTimeKind.Unspecified).AddTicks(5330));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 22, 46, 10, 472, DateTimeKind.Unspecified).AddTicks(5332));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 22, 46, 10, 472, DateTimeKind.Unspecified).AddTicks(5334));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 22, 46, 10, 472, DateTimeKind.Unspecified).AddTicks(5367));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 22, 46, 10, 472, DateTimeKind.Unspecified).AddTicks(5419));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 22, 46, 10, 472, DateTimeKind.Unspecified).AddTicks(5422));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 22, 46, 10, 472, DateTimeKind.Unspecified).AddTicks(5424));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 22, 46, 10, 472, DateTimeKind.Unspecified).AddTicks(5426));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 22, 46, 10, 472, DateTimeKind.Unspecified).AddTicks(5428));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 16,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 22, 46, 10, 472, DateTimeKind.Unspecified).AddTicks(5430));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 17,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 22, 46, 10, 472, DateTimeKind.Unspecified).AddTicks(5432));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 18,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 22, 46, 10, 472, DateTimeKind.Unspecified).AddTicks(5434));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 19,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 22, 46, 10, 472, DateTimeKind.Unspecified).AddTicks(5437));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 20,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 22, 46, 10, 472, DateTimeKind.Unspecified).AddTicks(5439));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 21,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 22, 46, 10, 472, DateTimeKind.Unspecified).AddTicks(5453));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 22,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 22, 46, 10, 472, DateTimeKind.Unspecified).AddTicks(5455));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 11, 20, 22, 46, 10, 647, DateTimeKind.Unspecified).AddTicks(2289), "$2a$11$L91azolXwvdbAutpVMPmmeuzj6jgTDwsFRB/W1z8tEmj.t203JTuO" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 11, 20, 22, 46, 10, 824, DateTimeKind.Unspecified).AddTicks(2976), "$2a$11$SI0CA11ueVLz3YYd4OtttuYiB3HUGCVaKfJWtAc64rrdy2IBIVotm" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 11, 20, 22, 46, 10, 993, DateTimeKind.Unspecified).AddTicks(5269), "$2a$11$i2x98hO7BspcYBW.riiFbueAKbnAQ1jr4/8.wVoTQyUKrJHS4DEq2" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SourceQuestionGroupId",
                table: "TestQuestions");

            migrationBuilder.DropColumn(
                name: "SourceQuestionId",
                table: "TestQuestions");

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 21, 59, 0, 337, DateTimeKind.Unspecified).AddTicks(5876));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 21, 59, 0, 337, DateTimeKind.Unspecified).AddTicks(5883));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 21, 59, 0, 337, DateTimeKind.Unspecified).AddTicks(5913));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 21, 59, 0, 337, DateTimeKind.Unspecified).AddTicks(5916));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 21, 59, 0, 337, DateTimeKind.Unspecified).AddTicks(5918));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 21, 59, 0, 337, DateTimeKind.Unspecified).AddTicks(5920));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 21, 59, 0, 337, DateTimeKind.Unspecified).AddTicks(5923));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 8,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 21, 59, 0, 337, DateTimeKind.Unspecified).AddTicks(5925));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 9,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 21, 59, 0, 337, DateTimeKind.Unspecified).AddTicks(5927));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 10,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 21, 59, 0, 337, DateTimeKind.Unspecified).AddTicks(5930));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 21, 59, 0, 337, DateTimeKind.Unspecified).AddTicks(5932));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 21, 59, 0, 337, DateTimeKind.Unspecified).AddTicks(5934));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 21, 59, 0, 337, DateTimeKind.Unspecified).AddTicks(5936));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 21, 59, 0, 337, DateTimeKind.Unspecified).AddTicks(5939));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 21, 59, 0, 337, DateTimeKind.Unspecified).AddTicks(5941));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 16,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 21, 59, 0, 337, DateTimeKind.Unspecified).AddTicks(5944));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 17,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 21, 59, 0, 337, DateTimeKind.Unspecified).AddTicks(5946));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 18,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 21, 59, 0, 337, DateTimeKind.Unspecified).AddTicks(5948));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 19,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 21, 59, 0, 337, DateTimeKind.Unspecified).AddTicks(5950));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 20,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 21, 59, 0, 337, DateTimeKind.Unspecified).AddTicks(5952));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 21,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 21, 59, 0, 337, DateTimeKind.Unspecified).AddTicks(5954));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 22,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 21, 59, 0, 337, DateTimeKind.Unspecified).AddTicks(5956));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 21, 59, 0, 337, DateTimeKind.Unspecified).AddTicks(5641));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 21, 59, 0, 337, DateTimeKind.Unspecified).AddTicks(5684));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 21, 59, 0, 337, DateTimeKind.Unspecified).AddTicks(5685));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 21, 59, 0, 337, DateTimeKind.Unspecified).AddTicks(5687));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 21, 59, 0, 337, DateTimeKind.Unspecified).AddTicks(5726));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 21, 59, 0, 337, DateTimeKind.Unspecified).AddTicks(5733));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 21, 59, 0, 337, DateTimeKind.Unspecified).AddTicks(5735));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 21, 59, 0, 337, DateTimeKind.Unspecified).AddTicks(5738));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 21, 59, 0, 337, DateTimeKind.Unspecified).AddTicks(5739));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 21, 59, 0, 337, DateTimeKind.Unspecified).AddTicks(5742));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 21, 59, 0, 337, DateTimeKind.Unspecified).AddTicks(5765));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 21, 59, 0, 337, DateTimeKind.Unspecified).AddTicks(5795));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 21, 59, 0, 337, DateTimeKind.Unspecified).AddTicks(5797));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 21, 59, 0, 337, DateTimeKind.Unspecified).AddTicks(5799));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 21, 59, 0, 337, DateTimeKind.Unspecified).AddTicks(5801));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 21, 59, 0, 337, DateTimeKind.Unspecified).AddTicks(5804));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 16,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 21, 59, 0, 337, DateTimeKind.Unspecified).AddTicks(5806));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 17,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 21, 59, 0, 337, DateTimeKind.Unspecified).AddTicks(5808));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 18,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 21, 59, 0, 337, DateTimeKind.Unspecified).AddTicks(5810));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 19,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 21, 59, 0, 337, DateTimeKind.Unspecified).AddTicks(5812));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 20,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 21, 59, 0, 337, DateTimeKind.Unspecified).AddTicks(5813));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 21,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 21, 59, 0, 337, DateTimeKind.Unspecified).AddTicks(5823));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 22,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 20, 21, 59, 0, 337, DateTimeKind.Unspecified).AddTicks(5825));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 11, 20, 21, 59, 0, 548, DateTimeKind.Unspecified).AddTicks(4131), "$2a$11$6rMQMHSGMwhOmoeP2iKVpeYwByAnTd2jMSQ9vVzs./OidK4ArucoO" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 11, 20, 21, 59, 0, 766, DateTimeKind.Unspecified).AddTicks(2882), "$2a$11$8CJqy7tpEeEZhXh/CSrolu1sfdKfLWfUSF4JrCkhXHDe3ZTrza3hS" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 11, 20, 21, 59, 0, 961, DateTimeKind.Unspecified).AddTicks(6523), "$2a$11$uiXC5WSRqTUP4p5xegUQQ.MOx7ERvlWhJ8Zl6kmappMsLQiqdbRxW" });
        }
    }
}
