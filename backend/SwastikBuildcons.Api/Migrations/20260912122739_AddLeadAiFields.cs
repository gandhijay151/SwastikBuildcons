using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SwastikBuildcons.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddLeadAiFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AiPriority",
                table: "Leads",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AiSummary",
                table: "Leads",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AiPriority",
                table: "Leads");

            migrationBuilder.DropColumn(
                name: "AiSummary",
                table: "Leads");
        }
    }
}
