using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ToeicGenius.Migrations
{
    /// <inheritdoc />
    public partial class UpdateIsSelectTime : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsSelectTime",
                table: "TestResults",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 15, 17, 17, 48, 6, DateTimeKind.Unspecified).AddTicks(7222));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 15, 17, 17, 48, 6, DateTimeKind.Unspecified).AddTicks(7225));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 15, 17, 17, 48, 6, DateTimeKind.Unspecified).AddTicks(7253));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 15, 17, 17, 48, 6, DateTimeKind.Unspecified).AddTicks(7256));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 15, 17, 17, 48, 6, DateTimeKind.Unspecified).AddTicks(7257));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 15, 17, 17, 48, 6, DateTimeKind.Unspecified).AddTicks(7258));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 15, 17, 17, 48, 6, DateTimeKind.Unspecified).AddTicks(7260));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 8,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 15, 17, 17, 48, 6, DateTimeKind.Unspecified).AddTicks(7261));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 9,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 15, 17, 17, 48, 6, DateTimeKind.Unspecified).AddTicks(7263));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 10,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 15, 17, 17, 48, 6, DateTimeKind.Unspecified).AddTicks(7264));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 15, 17, 17, 48, 6, DateTimeKind.Unspecified).AddTicks(7266));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 15, 17, 17, 48, 6, DateTimeKind.Unspecified).AddTicks(7267));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 15, 17, 17, 48, 6, DateTimeKind.Unspecified).AddTicks(7269));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 15, 17, 17, 48, 6, DateTimeKind.Unspecified).AddTicks(7270));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 15, 17, 17, 48, 6, DateTimeKind.Unspecified).AddTicks(7272));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 16,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 15, 17, 17, 48, 6, DateTimeKind.Unspecified).AddTicks(7273));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 17,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 15, 17, 17, 48, 6, DateTimeKind.Unspecified).AddTicks(7275));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 18,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 15, 17, 17, 48, 6, DateTimeKind.Unspecified).AddTicks(7276));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 19,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 15, 17, 17, 48, 6, DateTimeKind.Unspecified).AddTicks(7278));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 20,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 15, 17, 17, 48, 6, DateTimeKind.Unspecified).AddTicks(7279));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 21,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 15, 17, 17, 48, 6, DateTimeKind.Unspecified).AddTicks(7281));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 22,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 15, 17, 17, 48, 6, DateTimeKind.Unspecified).AddTicks(7282));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 15, 17, 17, 48, 6, DateTimeKind.Unspecified).AddTicks(7018));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 15, 17, 17, 48, 6, DateTimeKind.Unspecified).AddTicks(7047));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 15, 17, 17, 48, 6, DateTimeKind.Unspecified).AddTicks(7048));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 15, 17, 17, 48, 6, DateTimeKind.Unspecified).AddTicks(7049));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 15, 17, 17, 48, 6, DateTimeKind.Unspecified).AddTicks(7079));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 15, 17, 17, 48, 6, DateTimeKind.Unspecified).AddTicks(7084));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 15, 17, 17, 48, 6, DateTimeKind.Unspecified).AddTicks(7086));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 15, 17, 17, 48, 6, DateTimeKind.Unspecified).AddTicks(7118));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 15, 17, 17, 48, 6, DateTimeKind.Unspecified).AddTicks(7120));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 15, 17, 17, 48, 6, DateTimeKind.Unspecified).AddTicks(7121));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 15, 17, 17, 48, 6, DateTimeKind.Unspecified).AddTicks(7139));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 15, 17, 17, 48, 6, DateTimeKind.Unspecified).AddTicks(7167));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 15, 17, 17, 48, 6, DateTimeKind.Unspecified).AddTicks(7169));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 15, 17, 17, 48, 6, DateTimeKind.Unspecified).AddTicks(7170));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 15, 17, 17, 48, 6, DateTimeKind.Unspecified).AddTicks(7172));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 15, 17, 17, 48, 6, DateTimeKind.Unspecified).AddTicks(7173));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 16,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 15, 17, 17, 48, 6, DateTimeKind.Unspecified).AddTicks(7175));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 17,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 15, 17, 17, 48, 6, DateTimeKind.Unspecified).AddTicks(7177));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 18,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 15, 17, 17, 48, 6, DateTimeKind.Unspecified).AddTicks(7178));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 19,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 15, 17, 17, 48, 6, DateTimeKind.Unspecified).AddTicks(7180));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 20,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 15, 17, 17, 48, 6, DateTimeKind.Unspecified).AddTicks(7182));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 21,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 15, 17, 17, 48, 6, DateTimeKind.Unspecified).AddTicks(7186));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 22,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 15, 17, 17, 48, 6, DateTimeKind.Unspecified).AddTicks(7188));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 11, 15, 17, 17, 48, 123, DateTimeKind.Unspecified).AddTicks(9135), "$2a$11$FSFBH3u85wy57eYeId4bPejjBp33638kKB.R2oBCdOVnN2GgAEguu" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 11, 15, 17, 17, 48, 241, DateTimeKind.Unspecified).AddTicks(558), "$2a$11$wmzad//kOCeJUpk7H/SPhujNxP7KFfxiiMNUNvB59hHHNvDfzpuRG" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 11, 15, 17, 17, 48, 358, DateTimeKind.Unspecified).AddTicks(1971), "$2a$11$kzQ5mafpi4uWJ0ItDVdNKORk1qigdUMFpCjATMepzl/eqBu2X6rhS" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsSelectTime",
                table: "TestResults");

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
    }
}
