using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ToeicGenius.Migrations
{
    /// <inheritdoc />
    public partial class AddQuestionReportTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "QuestionReports",
                columns: table => new
                {
                    ReportId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TestQuestionId = table.Column<int>(type: "int", nullable: false),
                    ReportedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ReportType = table.Column<string>(type: "nvarchar(50)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    ReviewedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ReviewerNotes = table.Column<string>(type: "nvarchar(1000)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ReviewedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuestionReports", x => x.ReportId);
                    table.ForeignKey(
                        name: "FK_QuestionReports_TestQuestions_TestQuestionId",
                        column: x => x.TestQuestionId,
                        principalTable: "TestQuestions",
                        principalColumn: "TestQuestionId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_QuestionReports_Users_ReportedBy",
                        column: x => x.ReportedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_QuestionReports_Users_ReviewedBy",
                        column: x => x.ReviewedBy,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

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

            migrationBuilder.CreateIndex(
                name: "IX_QuestionReports_ReportedBy",
                table: "QuestionReports",
                column: "ReportedBy");

            migrationBuilder.CreateIndex(
                name: "IX_QuestionReports_ReviewedBy",
                table: "QuestionReports",
                column: "ReviewedBy");

            migrationBuilder.CreateIndex(
                name: "IX_QuestionReports_TestQuestionId",
                table: "QuestionReports",
                column: "TestQuestionId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "QuestionReports");

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
    }
}
