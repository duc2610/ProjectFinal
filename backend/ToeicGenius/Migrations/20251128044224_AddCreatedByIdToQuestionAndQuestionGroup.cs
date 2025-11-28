using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ToeicGenius.Migrations
{
    /// <inheritdoc />
    public partial class AddCreatedByIdToQuestionAndQuestionGroup : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "CreatedById",
                table: "Questions",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedById",
                table: "QuestionGroups",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Unspecified).AddTicks(4560));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Unspecified).AddTicks(4566));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Unspecified).AddTicks(4569));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Unspecified).AddTicks(4571));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Unspecified).AddTicks(4573));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Unspecified).AddTicks(4576));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Unspecified).AddTicks(4578));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 8,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Unspecified).AddTicks(4580));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 9,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Unspecified).AddTicks(4582));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 10,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Unspecified).AddTicks(4584));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Unspecified).AddTicks(4586));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Unspecified).AddTicks(4588));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Unspecified).AddTicks(4590));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Unspecified).AddTicks(4593));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Unspecified).AddTicks(4595));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 16,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Unspecified).AddTicks(4597));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 17,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Unspecified).AddTicks(4599));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 18,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Unspecified).AddTicks(4601));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 19,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Unspecified).AddTicks(4603));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 20,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Unspecified).AddTicks(4605));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 21,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Unspecified).AddTicks(4607));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 22,
                column: "CreatedAt",
                value: new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Unspecified).AddTicks(4609));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 1,
                columns: new[] { "CreatedAt", "CreatedById" },
                values: new object[] { new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Unspecified).AddTicks(4282), null });

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 2,
                columns: new[] { "CreatedAt", "CreatedById" },
                values: new object[] { new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Unspecified).AddTicks(4332), null });

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 3,
                columns: new[] { "CreatedAt", "CreatedById" },
                values: new object[] { new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Unspecified).AddTicks(4336), null });

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 4,
                columns: new[] { "CreatedAt", "CreatedById" },
                values: new object[] { new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Unspecified).AddTicks(4338), null });

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 1,
                columns: new[] { "CreatedAt", "CreatedById" },
                values: new object[] { new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Unspecified).AddTicks(4387), null });

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 2,
                columns: new[] { "CreatedAt", "CreatedById" },
                values: new object[] { new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Unspecified).AddTicks(4413), null });

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 3,
                columns: new[] { "CreatedAt", "CreatedById" },
                values: new object[] { new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Unspecified).AddTicks(4416), null });

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 4,
                columns: new[] { "CreatedAt", "CreatedById" },
                values: new object[] { new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Unspecified).AddTicks(4427), null });

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 5,
                columns: new[] { "CreatedAt", "CreatedById" },
                values: new object[] { new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Unspecified).AddTicks(4429), null });

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 6,
                columns: new[] { "CreatedAt", "CreatedById" },
                values: new object[] { new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Unspecified).AddTicks(4431), null });

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 7,
                columns: new[] { "CreatedAt", "CreatedById" },
                values: new object[] { new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Unspecified).AddTicks(4434), null });

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 11,
                columns: new[] { "CreatedAt", "CreatedById" },
                values: new object[] { new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Unspecified).AddTicks(4475), null });

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 12,
                columns: new[] { "CreatedAt", "CreatedById" },
                values: new object[] { new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Unspecified).AddTicks(4480), null });

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 13,
                columns: new[] { "CreatedAt", "CreatedById" },
                values: new object[] { new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Unspecified).AddTicks(4482), null });

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 14,
                columns: new[] { "CreatedAt", "CreatedById" },
                values: new object[] { new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Unspecified).AddTicks(4485), null });

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 15,
                columns: new[] { "CreatedAt", "CreatedById" },
                values: new object[] { new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Unspecified).AddTicks(4488), null });

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 16,
                columns: new[] { "CreatedAt", "CreatedById" },
                values: new object[] { new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Unspecified).AddTicks(4490), null });

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 17,
                columns: new[] { "CreatedAt", "CreatedById" },
                values: new object[] { new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Unspecified).AddTicks(4492), null });

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 18,
                columns: new[] { "CreatedAt", "CreatedById" },
                values: new object[] { new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Unspecified).AddTicks(4495), null });

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 19,
                columns: new[] { "CreatedAt", "CreatedById" },
                values: new object[] { new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Unspecified).AddTicks(4497), null });

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 20,
                columns: new[] { "CreatedAt", "CreatedById" },
                values: new object[] { new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Unspecified).AddTicks(4499), null });

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 21,
                columns: new[] { "CreatedAt", "CreatedById" },
                values: new object[] { new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Unspecified).AddTicks(4502), null });

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 22,
                columns: new[] { "CreatedAt", "CreatedById" },
                values: new object[] { new DateTime(2025, 11, 28, 11, 42, 18, 500, DateTimeKind.Unspecified).AddTicks(4504), null });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 11, 28, 11, 42, 18, 727, DateTimeKind.Unspecified).AddTicks(3014), "$2a$11$SM10K0UckDRQcFOXNYvCw.b6TkiaNU8.hEH2ceHvSd2JE/weCl2/K" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 11, 28, 11, 42, 18, 959, DateTimeKind.Unspecified).AddTicks(3175), "$2a$11$ZN.La1z8QVNlp43dSLMHP.yHwlH5qsLBPXkqP4cI9QRqQnFM7eC9u" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 11, 28, 11, 42, 19, 188, DateTimeKind.Unspecified).AddTicks(298), "$2a$11$C2rI4p4.MqVmq81dK22TJ.qXC2uruKsQrj3t9u2SlgWYimFxezQsu" });

            migrationBuilder.CreateIndex(
                name: "IX_Questions_CreatedById",
                table: "Questions",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_QuestionGroups_CreatedById",
                table: "QuestionGroups",
                column: "CreatedById");

            migrationBuilder.AddForeignKey(
                name: "FK_QuestionGroups_Users_CreatedById",
                table: "QuestionGroups",
                column: "CreatedById",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Questions_Users_CreatedById",
                table: "Questions",
                column: "CreatedById",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_QuestionGroups_Users_CreatedById",
                table: "QuestionGroups");

            migrationBuilder.DropForeignKey(
                name: "FK_Questions_Users_CreatedById",
                table: "Questions");

            migrationBuilder.DropIndex(
                name: "IX_Questions_CreatedById",
                table: "Questions");

            migrationBuilder.DropIndex(
                name: "IX_QuestionGroups_CreatedById",
                table: "QuestionGroups");

            migrationBuilder.DropColumn(
                name: "CreatedById",
                table: "Questions");

            migrationBuilder.DropColumn(
                name: "CreatedById",
                table: "QuestionGroups");

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
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 11, 27, 23, 29, 47, 410, DateTimeKind.Unspecified).AddTicks(8703), "$2a$11$/Ywch/DGmPnlaS/ocmCegenJS/R3nbx1ESlg/A76dAQiiEgcefgga" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 11, 27, 23, 29, 47, 528, DateTimeKind.Unspecified).AddTicks(404), "$2a$11$NoVsxKuJ5guuGTo/a4gPqOhXTXGw2CpQuulzdLrpXT2smUcZT2VZ6" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 11, 27, 23, 29, 47, 644, DateTimeKind.Unspecified).AddTicks(4456), "$2a$11$YUTZaX0o1Hu.PmbDcwk8rePVn5NqVD4IDqCsK0JCNVOkoA8OarmxG" });
        }
    }
}
