using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ToeicGenius.Migrations
{
    /// <inheritdoc />
    public partial class AddQuestionVersionHistory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Version",
                table: "TestQuestions",
                newName: "CurrentVersion");

            migrationBuilder.AddColumn<int>(
                name: "QuestionVersion",
                table: "UserAnswers",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "SnapshotVersions",
                table: "TestQuestions",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 21, 4, 49, 49, 424, DateTimeKind.Unspecified).AddTicks(5625));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 21, 4, 49, 49, 424, DateTimeKind.Unspecified).AddTicks(5631));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 21, 4, 49, 49, 424, DateTimeKind.Unspecified).AddTicks(5663));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 21, 4, 49, 49, 424, DateTimeKind.Unspecified).AddTicks(5665));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 21, 4, 49, 49, 424, DateTimeKind.Unspecified).AddTicks(5667));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 21, 4, 49, 49, 424, DateTimeKind.Unspecified).AddTicks(5668));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 21, 4, 49, 49, 424, DateTimeKind.Unspecified).AddTicks(5670));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 8,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 21, 4, 49, 49, 424, DateTimeKind.Unspecified).AddTicks(5671));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 9,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 21, 4, 49, 49, 424, DateTimeKind.Unspecified).AddTicks(5673));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 10,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 21, 4, 49, 49, 424, DateTimeKind.Unspecified).AddTicks(5674));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 21, 4, 49, 49, 424, DateTimeKind.Unspecified).AddTicks(5676));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 21, 4, 49, 49, 424, DateTimeKind.Unspecified).AddTicks(5678));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 21, 4, 49, 49, 424, DateTimeKind.Unspecified).AddTicks(5680));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 21, 4, 49, 49, 424, DateTimeKind.Unspecified).AddTicks(5682));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 21, 4, 49, 49, 424, DateTimeKind.Unspecified).AddTicks(5683));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 16,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 21, 4, 49, 49, 424, DateTimeKind.Unspecified).AddTicks(5685));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 17,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 21, 4, 49, 49, 424, DateTimeKind.Unspecified).AddTicks(5686));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 18,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 21, 4, 49, 49, 424, DateTimeKind.Unspecified).AddTicks(5688));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 19,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 21, 4, 49, 49, 424, DateTimeKind.Unspecified).AddTicks(5690));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 20,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 21, 4, 49, 49, 424, DateTimeKind.Unspecified).AddTicks(5691));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 21,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 21, 4, 49, 49, 424, DateTimeKind.Unspecified).AddTicks(5693));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 22,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 21, 4, 49, 49, 424, DateTimeKind.Unspecified).AddTicks(5694));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 21, 4, 49, 49, 424, DateTimeKind.Unspecified).AddTicks(5388));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 21, 4, 49, 49, 424, DateTimeKind.Unspecified).AddTicks(5427));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 21, 4, 49, 49, 424, DateTimeKind.Unspecified).AddTicks(5429));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 21, 4, 49, 49, 424, DateTimeKind.Unspecified).AddTicks(5430));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 21, 4, 49, 49, 424, DateTimeKind.Unspecified).AddTicks(5469));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 21, 4, 49, 49, 424, DateTimeKind.Unspecified).AddTicks(5485));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 21, 4, 49, 49, 424, DateTimeKind.Unspecified).AddTicks(5488));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 21, 4, 49, 49, 424, DateTimeKind.Unspecified).AddTicks(5489));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 21, 4, 49, 49, 424, DateTimeKind.Unspecified).AddTicks(5491));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 21, 4, 49, 49, 424, DateTimeKind.Unspecified).AddTicks(5493));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 21, 4, 49, 49, 424, DateTimeKind.Unspecified).AddTicks(5516));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 21, 4, 49, 49, 424, DateTimeKind.Unspecified).AddTicks(5547));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 21, 4, 49, 49, 424, DateTimeKind.Unspecified).AddTicks(5550));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 21, 4, 49, 49, 424, DateTimeKind.Unspecified).AddTicks(5552));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 21, 4, 49, 49, 424, DateTimeKind.Unspecified).AddTicks(5553));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 21, 4, 49, 49, 424, DateTimeKind.Unspecified).AddTicks(5555));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 16,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 21, 4, 49, 49, 424, DateTimeKind.Unspecified).AddTicks(5557));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 17,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 21, 4, 49, 49, 424, DateTimeKind.Unspecified).AddTicks(5559));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 18,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 21, 4, 49, 49, 424, DateTimeKind.Unspecified).AddTicks(5561));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 19,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 21, 4, 49, 49, 424, DateTimeKind.Unspecified).AddTicks(5563));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 20,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 21, 4, 49, 49, 424, DateTimeKind.Unspecified).AddTicks(5564));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 21,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 21, 4, 49, 49, 424, DateTimeKind.Unspecified).AddTicks(5582));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 22,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 21, 4, 49, 49, 424, DateTimeKind.Unspecified).AddTicks(5584));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 11, 21, 4, 49, 49, 597, DateTimeKind.Unspecified).AddTicks(9876), "$2a$11$C.I4UqplHwAxhJpb2r7oqO26IUiZvvObKUVRVVgIbjtf7Q5yxTBg2" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 11, 21, 4, 49, 49, 767, DateTimeKind.Unspecified).AddTicks(7929), "$2a$11$xkW6iHk36i7qotFC5RDmeu5SIBFUdpdPDVVjJYzu5nVLybsTLwAhK" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 11, 21, 4, 49, 49, 946, DateTimeKind.Unspecified).AddTicks(5811), "$2a$11$I8KNo5wdlqxV/CCsgmLFEuNkoTTi/f3.AL6C1d.gp2yIzf/5KBovK" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "QuestionVersion",
                table: "UserAnswers");

            migrationBuilder.DropColumn(
                name: "SnapshotVersions",
                table: "TestQuestions");

            migrationBuilder.RenameColumn(
                name: "CurrentVersion",
                table: "TestQuestions",
                newName: "Version");

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
    }
}
