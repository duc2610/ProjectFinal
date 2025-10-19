using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ToeicGenius.Migrations
{
    /// <inheritdoc />
    public partial class SeedDefaultAccount : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 15, 8, 1, 23, 899, DateTimeKind.Utc).AddTicks(1832));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 15, 8, 1, 23, 899, DateTimeKind.Utc).AddTicks(1838));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 15, 8, 1, 23, 899, DateTimeKind.Utc).AddTicks(1840));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 15, 8, 1, 23, 899, DateTimeKind.Utc).AddTicks(1841));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 15, 8, 1, 23, 899, DateTimeKind.Utc).AddTicks(1668));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 15, 8, 1, 23, 899, DateTimeKind.Utc).AddTicks(1670));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 15, 8, 1, 23, 899, DateTimeKind.Utc).AddTicks(1671));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 15, 8, 1, 23, 899, DateTimeKind.Utc).AddTicks(1808));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 15, 8, 1, 23, 899, DateTimeKind.Utc).AddTicks(1701));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 15, 8, 1, 23, 899, DateTimeKind.Utc).AddTicks(1703));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 15, 8, 1, 23, 899, DateTimeKind.Utc).AddTicks(1705));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 15, 8, 1, 23, 899, DateTimeKind.Utc).AddTicks(1706));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 15, 8, 1, 23, 899, DateTimeKind.Utc).AddTicks(1707));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 15, 8, 1, 23, 899, DateTimeKind.Utc).AddTicks(1709));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 8,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 15, 8, 1, 23, 899, DateTimeKind.Utc).AddTicks(1710));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 9,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 15, 8, 1, 23, 899, DateTimeKind.Utc).AddTicks(1711));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 10,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 15, 8, 1, 23, 899, DateTimeKind.Utc).AddTicks(1712));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 15, 8, 1, 23, 899, DateTimeKind.Utc).AddTicks(1740));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 15, 8, 1, 23, 899, DateTimeKind.Utc).AddTicks(1741));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 15, 8, 1, 23, 899, DateTimeKind.Utc).AddTicks(1743));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 15, 8, 1, 23, 899, DateTimeKind.Utc).AddTicks(1744));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 15, 8, 1, 23, 899, DateTimeKind.Utc).AddTicks(1746));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 16,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 15, 8, 1, 23, 899, DateTimeKind.Utc).AddTicks(1778));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 17,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 15, 8, 1, 23, 899, DateTimeKind.Utc).AddTicks(1779));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 18,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 15, 8, 1, 23, 899, DateTimeKind.Utc).AddTicks(1781));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 19,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 15, 8, 1, 23, 899, DateTimeKind.Utc).AddTicks(1782));

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "CreatedAt", "Email", "FullName", "GoogleId", "PasswordHash", "Status", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2025, 10, 15, 8, 1, 24, 15, DateTimeKind.Utc).AddTicks(4869), "admin@toeicgenius.com", "System Admin", null, "$2a$11$uzcLXG9spEIzgmylHM70NuPAonE41Jk8PkywmxqYjEgSD7MG0TWaa", 1, null },
                    { new Guid("22222222-2222-2222-2222-222222222222"), new DateTime(2025, 10, 15, 8, 1, 24, 132, DateTimeKind.Utc).AddTicks(6642), "creator@toeicgenius.com", "Test Creator", null, "$2a$11$Sujlqiw4FEDnlHMrB2B.1un0OcsIahMtx29IVinoInJJE0Qg0KfM2", 1, null },
                    { new Guid("33333333-3333-3333-3333-333333333333"), new DateTime(2025, 10, 15, 8, 1, 24, 251, DateTimeKind.Utc).AddTicks(954), "examinee@toeicgenius.com", "Regular Examinee", null, "$2a$11$ARJdd.BblfqAGM/jmf73ZuJZ2VV/aTkzBibIF9k42hv8XpyiISBTu", 1, null }
                });

            migrationBuilder.InsertData(
                table: "UserRoles",
                columns: new[] { "RoleId", "UserId" },
                values: new object[,]
                {
                    { 1, new Guid("11111111-1111-1111-1111-111111111111") },
                    { 3, new Guid("22222222-2222-2222-2222-222222222222") },
                    { 2, new Guid("33333333-3333-3333-3333-333333333333") }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "UserRoles",
                keyColumns: new[] { "RoleId", "UserId" },
                keyValues: new object[] { 1, new Guid("11111111-1111-1111-1111-111111111111") });

            migrationBuilder.DeleteData(
                table: "UserRoles",
                keyColumns: new[] { "RoleId", "UserId" },
                keyValues: new object[] { 3, new Guid("22222222-2222-2222-2222-222222222222") });

            migrationBuilder.DeleteData(
                table: "UserRoles",
                keyColumns: new[] { "RoleId", "UserId" },
                keyValues: new object[] { 2, new Guid("33333333-3333-3333-3333-333333333333") });

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"));

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"));

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 14, 14, 28, 13, 890, DateTimeKind.Utc).AddTicks(5697));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 14, 14, 28, 13, 890, DateTimeKind.Utc).AddTicks(5698));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 14, 14, 28, 13, 890, DateTimeKind.Utc).AddTicks(5699));

            migrationBuilder.UpdateData(
                table: "Options",
                keyColumn: "OptionId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 14, 14, 28, 13, 890, DateTimeKind.Utc).AddTicks(5700));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 14, 14, 28, 13, 890, DateTimeKind.Utc).AddTicks(5571));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 14, 14, 28, 13, 890, DateTimeKind.Utc).AddTicks(5574));

            migrationBuilder.UpdateData(
                table: "QuestionGroups",
                keyColumn: "QuestionGroupId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 14, 14, 28, 13, 890, DateTimeKind.Utc).AddTicks(5575));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 14, 14, 28, 13, 890, DateTimeKind.Utc).AddTicks(5679));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 14, 14, 28, 13, 890, DateTimeKind.Utc).AddTicks(5597));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 14, 14, 28, 13, 890, DateTimeKind.Utc).AddTicks(5600));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 14, 14, 28, 13, 890, DateTimeKind.Utc).AddTicks(5601));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 14, 14, 28, 13, 890, DateTimeKind.Utc).AddTicks(5603));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 14, 14, 28, 13, 890, DateTimeKind.Utc).AddTicks(5604));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 14, 14, 28, 13, 890, DateTimeKind.Utc).AddTicks(5605));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 8,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 14, 14, 28, 13, 890, DateTimeKind.Utc).AddTicks(5606));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 9,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 14, 14, 28, 13, 890, DateTimeKind.Utc).AddTicks(5607));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 10,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 14, 14, 28, 13, 890, DateTimeKind.Utc).AddTicks(5608));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 14, 14, 28, 13, 890, DateTimeKind.Utc).AddTicks(5648));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 14, 14, 28, 13, 890, DateTimeKind.Utc).AddTicks(5649));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 14, 14, 28, 13, 890, DateTimeKind.Utc).AddTicks(5650));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 14, 14, 28, 13, 890, DateTimeKind.Utc).AddTicks(5652));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 14, 14, 28, 13, 890, DateTimeKind.Utc).AddTicks(5653));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 16,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 14, 14, 28, 13, 890, DateTimeKind.Utc).AddTicks(5654));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 17,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 14, 14, 28, 13, 890, DateTimeKind.Utc).AddTicks(5655));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 18,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 14, 14, 28, 13, 890, DateTimeKind.Utc).AddTicks(5656));

            migrationBuilder.UpdateData(
                table: "Questions",
                keyColumn: "QuestionId",
                keyValue: 19,
                column: "CreatedAt",
                value: new DateTime(2025, 10, 14, 14, 28, 13, 890, DateTimeKind.Utc).AddTicks(5658));
        }
    }
}
