using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ToeicGenius.Migrations
{
    /// <inheritdoc />
    public partial class DatabaseV032_RemoveNumberQuestion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Number",
                table: "Questions");

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5963));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5969));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5971));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5972));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5973));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5974));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5975));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 8,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5976));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 9,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5977));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 10,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5978));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5979));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5980));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5983));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5985));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5986));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 16,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5987));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 17,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5988));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 18,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5989));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 19,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5990));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 20,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5991));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 21,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5992));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 22,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5993));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5728));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5731));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5734));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5735));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5773));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5786));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5788));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5790));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5791));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5792));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5793));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5823));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5830));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5831));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5833));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5834));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 16,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5835));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 17,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5836));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 18,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5884));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 19,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5885));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 20,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5887));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 21,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5907));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 22,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 23, 14, 10, 12, 296, DateTimeKind.Utc).AddTicks(5910));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "CreatedAt", "FullName", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 23, 14, 10, 12, 468, DateTimeKind.Utc).AddTicks(4634), "System Admin", "$2a$11$lXUbE08aBBkX5Kqj7OpagOgseDa9XW2rvmK//NvrwP12aeIKBB3e2" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 23, 14, 10, 12, 640, DateTimeKind.Utc).AddTicks(8465), "$2a$11$Oax5AvkrkawNTMLjt6b54eT7aoGvn67Dkn0F9Fl91/B9ryfO9jDem" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                columns: new[] { "CreatedAt", "FullName", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 23, 14, 10, 12, 814, DateTimeKind.Utc).AddTicks(6103), "Regular Examinee", "$2a$11$lZwVax2UVSwNRqQMUwTlZuEhiw1uioopvgchbgaGs/CUv6WR487lO" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
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
                columns: new[] { "CreatedAt", "FullName", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 23, 3, 55, 46, 307, DateTimeKind.Utc).AddTicks(9223), "Administrator", "$2a$11$19puTsCi8CarCbMCx1LR4OnVTt3NHUXXz5HawLHh.E8JvpajgdACW" });

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
                columns: new[] { "CreatedAt", "FullName", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 23, 3, 55, 46, 651, DateTimeKind.Utc).AddTicks(6839), "Examinee User", "$2a$11$7e9lFQuSAdVEHhPjvBTK9.U5QiFatww4TwiPZmjML132Yo2b0F6Wu" });
        }
    }
}
