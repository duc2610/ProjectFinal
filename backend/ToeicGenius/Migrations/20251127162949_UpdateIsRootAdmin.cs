using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ToeicGenius.Migrations
{
    /// <inheritdoc />
    public partial class UpdateIsRootAdmin : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsRoot",
                table: "Users",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 27, 23, 29, 47, 292, DateTimeKind.Unspecified).AddTicks(4185));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 27, 23, 29, 47, 292, DateTimeKind.Unspecified).AddTicks(4188));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 27, 23, 29, 47, 292, DateTimeKind.Unspecified).AddTicks(4189));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 27, 23, 29, 47, 292, DateTimeKind.Unspecified).AddTicks(4191));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 27, 23, 29, 47, 292, DateTimeKind.Unspecified).AddTicks(4216));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 27, 23, 29, 47, 292, DateTimeKind.Unspecified).AddTicks(4219));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 27, 23, 29, 47, 292, DateTimeKind.Unspecified).AddTicks(4220));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 8,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 27, 23, 29, 47, 292, DateTimeKind.Unspecified).AddTicks(4222));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 9,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 27, 23, 29, 47, 292, DateTimeKind.Unspecified).AddTicks(4223));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 10,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 27, 23, 29, 47, 292, DateTimeKind.Unspecified).AddTicks(4225));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 27, 23, 29, 47, 292, DateTimeKind.Unspecified).AddTicks(4226));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 27, 23, 29, 47, 292, DateTimeKind.Unspecified).AddTicks(4228));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 27, 23, 29, 47, 292, DateTimeKind.Unspecified).AddTicks(4229));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 27, 23, 29, 47, 292, DateTimeKind.Unspecified).AddTicks(4231));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 27, 23, 29, 47, 292, DateTimeKind.Unspecified).AddTicks(4232));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 16,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 27, 23, 29, 47, 292, DateTimeKind.Unspecified).AddTicks(4234));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 17,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 27, 23, 29, 47, 292, DateTimeKind.Unspecified).AddTicks(4235));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 18,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 27, 23, 29, 47, 292, DateTimeKind.Unspecified).AddTicks(4237));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 19,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 27, 23, 29, 47, 292, DateTimeKind.Unspecified).AddTicks(4238));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 20,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 27, 23, 29, 47, 292, DateTimeKind.Unspecified).AddTicks(4240));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 21,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 27, 23, 29, 47, 292, DateTimeKind.Unspecified).AddTicks(4241));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 22,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 27, 23, 29, 47, 292, DateTimeKind.Unspecified).AddTicks(4242));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 27, 23, 29, 47, 292, DateTimeKind.Unspecified).AddTicks(3986));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 27, 23, 29, 47, 292, DateTimeKind.Unspecified).AddTicks(4013));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 27, 23, 29, 47, 292, DateTimeKind.Unspecified).AddTicks(4014));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 27, 23, 29, 47, 292, DateTimeKind.Unspecified).AddTicks(4037));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 27, 23, 29, 47, 292, DateTimeKind.Unspecified).AddTicks(4068));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 27, 23, 29, 47, 292, DateTimeKind.Unspecified).AddTicks(4072));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 27, 23, 29, 47, 292, DateTimeKind.Unspecified).AddTicks(4074));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 27, 23, 29, 47, 292, DateTimeKind.Unspecified).AddTicks(4076));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 27, 23, 29, 47, 292, DateTimeKind.Unspecified).AddTicks(4077));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 27, 23, 29, 47, 292, DateTimeKind.Unspecified).AddTicks(4079));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 27, 23, 29, 47, 292, DateTimeKind.Unspecified).AddTicks(4080));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 27, 23, 29, 47, 292, DateTimeKind.Unspecified).AddTicks(4107));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 27, 23, 29, 47, 292, DateTimeKind.Unspecified).AddTicks(4124));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 27, 23, 29, 47, 292, DateTimeKind.Unspecified).AddTicks(4126));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 27, 23, 29, 47, 292, DateTimeKind.Unspecified).AddTicks(4128));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 27, 23, 29, 47, 292, DateTimeKind.Unspecified).AddTicks(4130));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 16,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 27, 23, 29, 47, 292, DateTimeKind.Unspecified).AddTicks(4131));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 17,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 27, 23, 29, 47, 292, DateTimeKind.Unspecified).AddTicks(4133));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 18,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 27, 23, 29, 47, 292, DateTimeKind.Unspecified).AddTicks(4135));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 19,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 27, 23, 29, 47, 292, DateTimeKind.Unspecified).AddTicks(4136));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 20,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 27, 23, 29, 47, 292, DateTimeKind.Unspecified).AddTicks(4138));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 21,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 27, 23, 29, 47, 292, DateTimeKind.Unspecified).AddTicks(4140));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 22,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 27, 23, 29, 47, 292, DateTimeKind.Unspecified).AddTicks(4141));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "CreatedAt", "IsRoot", "PasswordHash" },
                values: new object[] { new DateTime(2025, 11, 27, 23, 29, 47, 410, DateTimeKind.Unspecified).AddTicks(8703), true, "$2a$11$/Ywch/DGmPnlaS/ocmCegenJS/R3nbx1ESlg/A76dAQiiEgcefgga" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                columns: new[] { "CreatedAt", "IsRoot", "PasswordHash" },
                values: new object[] { new DateTime(2025, 11, 27, 23, 29, 47, 528, DateTimeKind.Unspecified).AddTicks(404), false, "$2a$11$NoVsxKuJ5guuGTo/a4gPqOhXTXGw2CpQuulzdLrpXT2smUcZT2VZ6" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                columns: new[] { "CreatedAt", "IsRoot", "PasswordHash" },
                values: new object[] { new DateTime(2025, 11, 27, 23, 29, 47, 644, DateTimeKind.Unspecified).AddTicks(4456), false, "$2a$11$YUTZaX0o1Hu.PmbDcwk8rePVn5NqVD4IDqCsK0JCNVOkoA8OarmxG" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsRoot",
                table: "Users");

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
    }
}
