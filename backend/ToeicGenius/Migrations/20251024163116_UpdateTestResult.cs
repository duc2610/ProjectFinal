using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ToeicGenius.Migrations
{
    /// <inheritdoc />
    public partial class UpdateTestResult : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "StartTime",
                table: "TestResults");

            migrationBuilder.DropColumn(
                name: "TestMode",
                table: "TestResults");

            migrationBuilder.AddColumn<int>(
                name: "TestType",
                table: "TestResults",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1261));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1263));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1264));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1265));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1266));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1267));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1268));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 8,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1269));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 9,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1270));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 10,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1271));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1271));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1272));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1273));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1274));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1275));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 16,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1276));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 17,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1277));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 18,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1278));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 19,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1279));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 20,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1280));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 21,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1281));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 22,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1282));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1092));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1094));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1095));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1096));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1124));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1126));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1128));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1129));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1130));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1131));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1132));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1213));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1215));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1216));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1217));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1218));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 16,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1219));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 17,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1220));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 18,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1222));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 19,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1223));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 20,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1224));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 21,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1227));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 22,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 24, 16, 31, 14, 405, DateTimeKind.Utc).AddTicks(1229));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 24, 16, 31, 14, 521, DateTimeKind.Utc).AddTicks(7082), "$2a$11$CSS2yJ45a7huqqG7BUMDbe1Hmt7Smnk.agcERJe65zKfOnhvgu3/u" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 24, 16, 31, 14, 638, DateTimeKind.Utc).AddTicks(1376), "$2a$11$taEWebTEhLh1yvYgWgDrWuqlI.fkpTirNG3uJaTXudZk3GdmWFxx." });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 10, 24, 16, 31, 14, 754, DateTimeKind.Utc).AddTicks(3396), "$2a$11$ksN97KhZguJYNeRHgIXUtO2M2AOo/MIKxCu19p6LjnUgY6jm6B/Uq" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TestType",
                table: "TestResults");

            migrationBuilder.AddColumn<DateTime>(
                name: "StartTime",
                table: "TestResults",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TestMode",
                table: "TestResults",
                type: "nvarchar(max)",
                nullable: true);

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
    }
}
