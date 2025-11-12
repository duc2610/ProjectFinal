using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ToeicGenius.Migrations
{
    /// <inheritdoc />
    public partial class AddFlashcardTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FlashcardProgresses_Flashcards_FlashcardId",
                table: "FlashcardProgresses");

            migrationBuilder.DropIndex(
                name: "IX_FlashcardProgresses_FlashcardId",
                table: "FlashcardProgresses");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "FlashcardSets");

            migrationBuilder.RenameColumn(
                name: "MediaUrl",
                table: "Flashcards",
                newName: "Notes");

            migrationBuilder.RenameColumn(
                name: "FrontText",
                table: "Flashcards",
                newName: "ImageUrl");

            migrationBuilder.RenameColumn(
                name: "BackText",
                table: "Flashcards",
                newName: "Examples");

            migrationBuilder.RenameColumn(
                name: "FlashcardId",
                table: "FlashcardProgresses",
                newName: "ReviewCount");

            migrationBuilder.AlterColumn<string>(
                name: "Title",
                table: "FlashcardSets",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<string>(
                name: "Language",
                table: "FlashcardSets",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "TotalCards",
                table: "FlashcardSets",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Flashcards",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "Definition",
                table: "Flashcards",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Pronunciation",
                table: "Flashcards",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Term",
                table: "Flashcards",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Flashcards",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WordType",
                table: "Flashcards",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "FlashcardProgresses",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CardId",
                table: "FlashcardProgresses",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "CorrectCount",
                table: "FlashcardProgresses",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "FlashcardProgresses",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<int>(
                name: "IncorrectCount",
                table: "FlashcardProgresses",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastReviewedAt",
                table: "FlashcardProgresses",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "NextReviewAt",
                table: "FlashcardProgresses",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "FlashcardProgresses",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "UserId",
                table: "FlashcardProgresses",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

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

            migrationBuilder.CreateIndex(
                name: "IX_FlashcardProgresses_CardId",
                table: "FlashcardProgresses",
                column: "CardId");

            migrationBuilder.CreateIndex(
                name: "IX_FlashcardProgresses_UserId",
                table: "FlashcardProgresses",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_FlashcardProgresses_Flashcards_CardId",
                table: "FlashcardProgresses",
                column: "CardId",
                principalTable: "Flashcards",
                principalColumn: "CardId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_FlashcardProgresses_Users_UserId",
                table: "FlashcardProgresses",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FlashcardProgresses_Flashcards_CardId",
                table: "FlashcardProgresses");

            migrationBuilder.DropForeignKey(
                name: "FK_FlashcardProgresses_Users_UserId",
                table: "FlashcardProgresses");

            migrationBuilder.DropIndex(
                name: "IX_FlashcardProgresses_CardId",
                table: "FlashcardProgresses");

            migrationBuilder.DropIndex(
                name: "IX_FlashcardProgresses_UserId",
                table: "FlashcardProgresses");

            migrationBuilder.DropColumn(
                name: "Language",
                table: "FlashcardSets");

            migrationBuilder.DropColumn(
                name: "TotalCards",
                table: "FlashcardSets");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Flashcards");

            migrationBuilder.DropColumn(
                name: "Definition",
                table: "Flashcards");

            migrationBuilder.DropColumn(
                name: "Pronunciation",
                table: "Flashcards");

            migrationBuilder.DropColumn(
                name: "Term",
                table: "Flashcards");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Flashcards");

            migrationBuilder.DropColumn(
                name: "WordType",
                table: "Flashcards");

            migrationBuilder.DropColumn(
                name: "CardId",
                table: "FlashcardProgresses");

            migrationBuilder.DropColumn(
                name: "CorrectCount",
                table: "FlashcardProgresses");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "FlashcardProgresses");

            migrationBuilder.DropColumn(
                name: "IncorrectCount",
                table: "FlashcardProgresses");

            migrationBuilder.DropColumn(
                name: "LastReviewedAt",
                table: "FlashcardProgresses");

            migrationBuilder.DropColumn(
                name: "NextReviewAt",
                table: "FlashcardProgresses");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "FlashcardProgresses");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "FlashcardProgresses");

            migrationBuilder.RenameColumn(
                name: "Notes",
                table: "Flashcards",
                newName: "MediaUrl");

            migrationBuilder.RenameColumn(
                name: "ImageUrl",
                table: "Flashcards",
                newName: "FrontText");

            migrationBuilder.RenameColumn(
                name: "Examples",
                table: "Flashcards",
                newName: "BackText");

            migrationBuilder.RenameColumn(
                name: "ReviewCount",
                table: "FlashcardProgresses",
                newName: "FlashcardId");

            migrationBuilder.AlterColumn<string>(
                name: "Title",
                table: "FlashcardSets",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "FlashcardSets",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "FlashcardProgresses",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 11, 10, 58, 9, 854, DateTimeKind.Utc).AddTicks(7944));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 11, 10, 58, 9, 854, DateTimeKind.Utc).AddTicks(7946));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 11, 10, 58, 9, 854, DateTimeKind.Utc).AddTicks(7947));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 11, 10, 58, 9, 854, DateTimeKind.Utc).AddTicks(7947));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 11, 10, 58, 9, 854, DateTimeKind.Utc).AddTicks(7948));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 11, 10, 58, 9, 854, DateTimeKind.Utc).AddTicks(7949));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 11, 10, 58, 9, 854, DateTimeKind.Utc).AddTicks(7950));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 8,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 11, 10, 58, 9, 854, DateTimeKind.Utc).AddTicks(7951));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 9,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 11, 10, 58, 9, 854, DateTimeKind.Utc).AddTicks(7952));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 10,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 11, 10, 58, 9, 854, DateTimeKind.Utc).AddTicks(7953));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 11, 10, 58, 9, 854, DateTimeKind.Utc).AddTicks(7954));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 11, 10, 58, 9, 854, DateTimeKind.Utc).AddTicks(7955));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 11, 10, 58, 9, 854, DateTimeKind.Utc).AddTicks(7956));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 11, 10, 58, 9, 854, DateTimeKind.Utc).AddTicks(7957));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 11, 10, 58, 9, 854, DateTimeKind.Utc).AddTicks(7958));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 16,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 11, 10, 58, 9, 854, DateTimeKind.Utc).AddTicks(7959));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 17,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 11, 10, 58, 9, 854, DateTimeKind.Utc).AddTicks(7960));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 18,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 11, 10, 58, 9, 854, DateTimeKind.Utc).AddTicks(7961));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 19,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 11, 10, 58, 9, 854, DateTimeKind.Utc).AddTicks(7962));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 20,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 11, 10, 58, 9, 854, DateTimeKind.Utc).AddTicks(7963));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 21,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 11, 10, 58, 9, 854, DateTimeKind.Utc).AddTicks(7963));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 22,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 11, 10, 58, 9, 854, DateTimeKind.Utc).AddTicks(7964));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 11, 10, 58, 9, 854, DateTimeKind.Utc).AddTicks(7763));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 11, 10, 58, 9, 854, DateTimeKind.Utc).AddTicks(7765));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 11, 10, 58, 9, 854, DateTimeKind.Utc).AddTicks(7766));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 11, 10, 58, 9, 854, DateTimeKind.Utc).AddTicks(7767));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 11, 10, 58, 9, 854, DateTimeKind.Utc).AddTicks(7795));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 11, 10, 58, 9, 854, DateTimeKind.Utc).AddTicks(7800));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 11, 10, 58, 9, 854, DateTimeKind.Utc).AddTicks(7801));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 11, 10, 58, 9, 854, DateTimeKind.Utc).AddTicks(7802));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 11, 10, 58, 9, 854, DateTimeKind.Utc).AddTicks(7803));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 11, 10, 58, 9, 854, DateTimeKind.Utc).AddTicks(7804));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 11, 10, 58, 9, 854, DateTimeKind.Utc).AddTicks(7805));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 11, 10, 58, 9, 854, DateTimeKind.Utc).AddTicks(7831));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 11, 10, 58, 9, 854, DateTimeKind.Utc).AddTicks(7832));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 11, 10, 58, 9, 854, DateTimeKind.Utc).AddTicks(7834));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 11, 10, 58, 9, 854, DateTimeKind.Utc).AddTicks(7835));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 11, 10, 58, 9, 854, DateTimeKind.Utc).AddTicks(7836));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 16,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 11, 10, 58, 9, 854, DateTimeKind.Utc).AddTicks(7837));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 17,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 11, 10, 58, 9, 854, DateTimeKind.Utc).AddTicks(7838));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 18,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 11, 10, 58, 9, 854, DateTimeKind.Utc).AddTicks(7840));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 19,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 11, 10, 58, 9, 854, DateTimeKind.Utc).AddTicks(7841));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 20,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 11, 10, 58, 9, 854, DateTimeKind.Utc).AddTicks(7842));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 21,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 11, 10, 58, 9, 854, DateTimeKind.Utc).AddTicks(7849));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 22,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 11, 10, 58, 9, 854, DateTimeKind.Utc).AddTicks(7908));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 11, 11, 10, 58, 9, 971, DateTimeKind.Utc).AddTicks(9230), "$2a$11$YG1nS5uvt8ItXbnY34VjbefAJiEo8BbKG44eIevlxtmzbgYfkI9EW" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 11, 11, 10, 58, 10, 88, DateTimeKind.Utc).AddTicks(3225), "$2a$11$pJU9yvFi3vdFwYwP6dIscO6nHs/.JulsG50chtxRtFpLVZ5cKiWVe" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 11, 11, 10, 58, 10, 204, DateTimeKind.Utc).AddTicks(8325), "$2a$11$m8USJYqOdJL8SLoCUkUpp.g7EVrAP9BOHYDOULMl1dS/CHc.9hltW" });

            migrationBuilder.CreateIndex(
                name: "IX_FlashcardProgresses_FlashcardId",
                table: "FlashcardProgresses",
                column: "FlashcardId");

            migrationBuilder.AddForeignKey(
                name: "FK_FlashcardProgresses_Flashcards_FlashcardId",
                table: "FlashcardProgresses",
                column: "FlashcardId",
                principalTable: "Flashcards",
                principalColumn: "CardId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
