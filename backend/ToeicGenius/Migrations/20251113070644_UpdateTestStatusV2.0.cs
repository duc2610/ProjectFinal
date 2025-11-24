using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ToeicGenius.Migrations
{
    /// <inheritdoc />
    public partial class UpdateTestStatusV20 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Status",
                table: "Tests",
                newName: "VisibilityStatus");

            migrationBuilder.AddColumn<int>(
                name: "CreationStatus",
                table: "Tests",
                type: "int",
                nullable: false,
                defaultValue: 0);

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreationStatus",
                table: "Tests");

            migrationBuilder.RenameColumn(
                name: "VisibilityStatus",
                table: "Tests",
                newName: "Status");

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 12, 20, 17, 40, 148, DateTimeKind.Utc).AddTicks(2932));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 12, 20, 17, 40, 148, DateTimeKind.Utc).AddTicks(2937));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 12, 20, 17, 40, 148, DateTimeKind.Utc).AddTicks(2939));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 12, 20, 17, 40, 148, DateTimeKind.Utc).AddTicks(2940));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 12, 20, 17, 40, 148, DateTimeKind.Utc).AddTicks(2941));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 12, 20, 17, 40, 148, DateTimeKind.Utc).AddTicks(2942));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 12, 20, 17, 40, 148, DateTimeKind.Utc).AddTicks(2943));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 8,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 12, 20, 17, 40, 148, DateTimeKind.Utc).AddTicks(2945));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 9,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 12, 20, 17, 40, 148, DateTimeKind.Utc).AddTicks(2997));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 10,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 12, 20, 17, 40, 148, DateTimeKind.Utc).AddTicks(2998));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 12, 20, 17, 40, 148, DateTimeKind.Utc).AddTicks(3000));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 12, 20, 17, 40, 148, DateTimeKind.Utc).AddTicks(3003));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 12, 20, 17, 40, 148, DateTimeKind.Utc).AddTicks(3004));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 12, 20, 17, 40, 148, DateTimeKind.Utc).AddTicks(3005));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 12, 20, 17, 40, 148, DateTimeKind.Utc).AddTicks(3006));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 16,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 12, 20, 17, 40, 148, DateTimeKind.Utc).AddTicks(3007));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 17,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 12, 20, 17, 40, 148, DateTimeKind.Utc).AddTicks(3009));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 18,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 12, 20, 17, 40, 148, DateTimeKind.Utc).AddTicks(3010));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 19,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 12, 20, 17, 40, 148, DateTimeKind.Utc).AddTicks(3011));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 20,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 12, 20, 17, 40, 148, DateTimeKind.Utc).AddTicks(3012));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 21,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 12, 20, 17, 40, 148, DateTimeKind.Utc).AddTicks(3013));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 22,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 12, 20, 17, 40, 148, DateTimeKind.Utc).AddTicks(3014));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 12, 20, 17, 40, 148, DateTimeKind.Utc).AddTicks(2778));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 12, 20, 17, 40, 148, DateTimeKind.Utc).AddTicks(2781));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 12, 20, 17, 40, 148, DateTimeKind.Utc).AddTicks(2782));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 12, 20, 17, 40, 148, DateTimeKind.Utc).AddTicks(2783));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 12, 20, 17, 40, 148, DateTimeKind.Utc).AddTicks(2824));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 12, 20, 17, 40, 148, DateTimeKind.Utc).AddTicks(2829));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 12, 20, 17, 40, 148, DateTimeKind.Utc).AddTicks(2830));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 12, 20, 17, 40, 148, DateTimeKind.Utc).AddTicks(2831));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 12, 20, 17, 40, 148, DateTimeKind.Utc).AddTicks(2832));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 12, 20, 17, 40, 148, DateTimeKind.Utc).AddTicks(2834));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 12, 20, 17, 40, 148, DateTimeKind.Utc).AddTicks(2835));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 12, 20, 17, 40, 148, DateTimeKind.Utc).AddTicks(2865));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 12, 20, 17, 40, 148, DateTimeKind.Utc).AddTicks(2866));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 12, 20, 17, 40, 148, DateTimeKind.Utc).AddTicks(2868));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 12, 20, 17, 40, 148, DateTimeKind.Utc).AddTicks(2873));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 12, 20, 17, 40, 148, DateTimeKind.Utc).AddTicks(2874));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 16,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 12, 20, 17, 40, 148, DateTimeKind.Utc).AddTicks(2875));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 17,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 12, 20, 17, 40, 148, DateTimeKind.Utc).AddTicks(2877));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 18,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 12, 20, 17, 40, 148, DateTimeKind.Utc).AddTicks(2878));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 19,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 12, 20, 17, 40, 148, DateTimeKind.Utc).AddTicks(2879));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 20,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 12, 20, 17, 40, 148, DateTimeKind.Utc).AddTicks(2881));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 21,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 12, 20, 17, 40, 148, DateTimeKind.Utc).AddTicks(2882));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 22,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 12, 20, 17, 40, 148, DateTimeKind.Utc).AddTicks(2883));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 11, 12, 20, 17, 40, 329, DateTimeKind.Utc).AddTicks(1744), "$2a$11$Bts6Ha5YoLiWgzMvfua9Jur/4p8ACGK1xRuM5ME0FLcAPVXPZGl/i" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 11, 12, 20, 17, 40, 500, DateTimeKind.Utc).AddTicks(5721), "$2a$11$C.rQnc9SIi5N8IZO9HAgUu.AFasbbo5f5/pTO7GxePaviKWILyiwS" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 11, 12, 20, 17, 40, 670, DateTimeKind.Utc).AddTicks(4171), "$2a$11$SgmJC5htaYikyIzoulP7JuBGaGD.MQiRnWNvKN28WDSz9Ez2hoIDO" });
        }
    }
}
