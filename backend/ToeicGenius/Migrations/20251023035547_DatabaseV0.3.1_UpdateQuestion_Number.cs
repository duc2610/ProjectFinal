using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ToeicGenius.Migrations
{
    /// <inheritdoc />
    public partial class DatabaseV031_UpdateQuestion_Number : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Number",
                table: "Questions",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 55, 46, 142, DateTimeKind.Utc).AddTicks(4598));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 55, 46, 142, DateTimeKind.Utc).AddTicks(4602));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 55, 46, 142, DateTimeKind.Utc).AddTicks(4603));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 55, 46, 142, DateTimeKind.Utc).AddTicks(4604));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 55, 46, 142, DateTimeKind.Utc).AddTicks(4606));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 55, 46, 142, DateTimeKind.Utc).AddTicks(4607));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 55, 46, 142, DateTimeKind.Utc).AddTicks(4608));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 8,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 55, 46, 142, DateTimeKind.Utc).AddTicks(4609));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 9,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 55, 46, 142, DateTimeKind.Utc).AddTicks(4610));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 10,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 55, 46, 142, DateTimeKind.Utc).AddTicks(4611));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 55, 46, 142, DateTimeKind.Utc).AddTicks(4613));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 55, 46, 142, DateTimeKind.Utc).AddTicks(4614));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 55, 46, 142, DateTimeKind.Utc).AddTicks(4615));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 55, 46, 142, DateTimeKind.Utc).AddTicks(4616));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 55, 46, 142, DateTimeKind.Utc).AddTicks(4617));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 16,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 55, 46, 142, DateTimeKind.Utc).AddTicks(4619));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 17,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 55, 46, 142, DateTimeKind.Utc).AddTicks(4620));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 18,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 55, 46, 142, DateTimeKind.Utc).AddTicks(4621));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 19,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 55, 46, 142, DateTimeKind.Utc).AddTicks(4622));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 20,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 55, 46, 142, DateTimeKind.Utc).AddTicks(4623));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 21,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 55, 46, 142, DateTimeKind.Utc).AddTicks(4624));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 22,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 55, 46, 142, DateTimeKind.Utc).AddTicks(4625));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 55, 46, 142, DateTimeKind.Utc).AddTicks(4392));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 55, 46, 142, DateTimeKind.Utc).AddTicks(4398));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 55, 46, 142, DateTimeKind.Utc).AddTicks(4400));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 55, 46, 142, DateTimeKind.Utc).AddTicks(4401));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 1,
                columns: new[] { "CreatedAt", "Number" },
                values: new object[] { new DateTime(2025, 10, 23, 3, 55, 46, 142, DateTimeKind.Utc).AddTicks(4438), 0 });

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 2,
                columns: new[] { "CreatedAt", "Number" },
                values: new object[] { new DateTime(2025, 10, 23, 3, 55, 46, 142, DateTimeKind.Utc).AddTicks(4452), 0 });

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 3,
                columns: new[] { "CreatedAt", "Number" },
                values: new object[] { new DateTime(2025, 10, 23, 3, 55, 46, 142, DateTimeKind.Utc).AddTicks(4455), 0 });

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 4,
                columns: new[] { "CreatedAt", "Number" },
                values: new object[] { new DateTime(2025, 10, 23, 3, 55, 46, 142, DateTimeKind.Utc).AddTicks(4457), 0 });

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 5,
                columns: new[] { "CreatedAt", "Number" },
                values: new object[] { new DateTime(2025, 10, 23, 3, 55, 46, 142, DateTimeKind.Utc).AddTicks(4458), 0 });

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 6,
                columns: new[] { "CreatedAt", "Number" },
                values: new object[] { new DateTime(2025, 10, 23, 3, 55, 46, 142, DateTimeKind.Utc).AddTicks(4459), 0 });

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 7,
                columns: new[] { "CreatedAt", "Number" },
                values: new object[] { new DateTime(2025, 10, 23, 3, 55, 46, 142, DateTimeKind.Utc).AddTicks(4460), 0 });

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 11,
                columns: new[] { "CreatedAt", "Number" },
                values: new object[] { new DateTime(2025, 10, 23, 3, 55, 46, 142, DateTimeKind.Utc).AddTicks(4493), 0 });

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 12,
                columns: new[] { "CreatedAt", "Number" },
                values: new object[] { new DateTime(2025, 10, 23, 3, 55, 46, 142, DateTimeKind.Utc).AddTicks(4495), 0 });

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 13,
                columns: new[] { "CreatedAt", "Number" },
                values: new object[] { new DateTime(2025, 10, 23, 3, 55, 46, 142, DateTimeKind.Utc).AddTicks(4496), 0 });

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 14,
                columns: new[] { "CreatedAt", "Number" },
                values: new object[] { new DateTime(2025, 10, 23, 3, 55, 46, 142, DateTimeKind.Utc).AddTicks(4497), 0 });

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 15,
                columns: new[] { "CreatedAt", "Number" },
                values: new object[] { new DateTime(2025, 10, 23, 3, 55, 46, 142, DateTimeKind.Utc).AddTicks(4499), 0 });

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 16,
                columns: new[] { "CreatedAt", "Number" },
                values: new object[] { new DateTime(2025, 10, 23, 3, 55, 46, 142, DateTimeKind.Utc).AddTicks(4500), 0 });

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 17,
                columns: new[] { "CreatedAt", "Number" },
                values: new object[] { new DateTime(2025, 10, 23, 3, 55, 46, 142, DateTimeKind.Utc).AddTicks(4502), 0 });

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 18,
                columns: new[] { "CreatedAt", "Number" },
                values: new object[] { new DateTime(2025, 10, 23, 3, 55, 46, 142, DateTimeKind.Utc).AddTicks(4503), 0 });

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 19,
                columns: new[] { "CreatedAt", "Number" },
                values: new object[] { new DateTime(2025, 10, 23, 3, 55, 46, 142, DateTimeKind.Utc).AddTicks(4504), 0 });

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 20,
                columns: new[] { "CreatedAt", "Number" },
                values: new object[] { new DateTime(2025, 10, 23, 3, 55, 46, 142, DateTimeKind.Utc).AddTicks(4506), 0 });

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 21,
                columns: new[] { "CreatedAt", "Number" },
                values: new object[] { new DateTime(2025, 10, 23, 3, 55, 46, 142, DateTimeKind.Utc).AddTicks(4512), 0 });

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 22,
                columns: new[] { "CreatedAt", "Number" },
                values: new object[] { new DateTime(2025, 10, 23, 3, 55, 46, 142, DateTimeKind.Utc).AddTicks(4549), 0 });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 23, 3, 55, 46, 307, DateTimeKind.Utc).AddTicks(9223), "$2a$11$19puTsCi8CarCbMCx1LR4OnVTt3NHUXXz5HawLHh.E8JvpajgdACW" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 23, 3, 55, 46, 479, DateTimeKind.Utc).AddTicks(2231), "$2a$11$EWYRsSyhBb6JFCIgYeFi8eNXIwYO/psf/Rn9EKEh4CmtDH4LCgwxe" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 23, 3, 55, 46, 651, DateTimeKind.Utc).AddTicks(6839), "$2a$11$7e9lFQuSAdVEHhPjvBTK9.U5QiFatww4TwiPZmjML132Yo2b0F6Wu" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Number",
                table: "Questions");

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(2085));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(2094));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(2096));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(2097));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(2098));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(2100));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(2101));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 8,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(2102));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 9,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(2103));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 10,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(2104));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(2105));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(2106));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(2107));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(2108));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(2110));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 16,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(2152));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 17,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(2154));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 18,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(2155));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 19,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(2156));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 20,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(2157));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 21,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(2159));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 22,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(2160));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(1935));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(1938));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(1940));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(1940));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(1979));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(1983));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(1985));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(1987));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(1988));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(1989));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(1990));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(2021));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(2022));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(2024));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(2025));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(2027));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 16,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(2028));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 17,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(2029));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 18,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(2031));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 19,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(2032));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 20,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(2033));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 21,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(2042));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 22,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 3, 42, 8, 630, DateTimeKind.Utc).AddTicks(2044));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 23, 3, 42, 8, 805, DateTimeKind.Utc).AddTicks(6558), "$2a$11$mRSFXJyiMCHU6NXrhwhw6OaFDw2aD6q6Pg2gPX4NrYbrThIZ5mEja" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 23, 3, 42, 8, 976, DateTimeKind.Utc).AddTicks(7486), "$2a$11$NzYaReTKXvSlxxy4SKJESuxh.4UXMGmI4mRdtJaAwi4WFF5ZCHh.m" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 23, 3, 42, 9, 157, DateTimeKind.Utc).AddTicks(6255), "$2a$11$CSTScrMUSTpQly3ylej2LOt1byC/rExuG9V5YCln1.4n2ZavUJfrS" });
        }
    }
}
