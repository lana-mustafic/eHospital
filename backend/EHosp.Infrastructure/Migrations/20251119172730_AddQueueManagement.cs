using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EHosp.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddQueueManagement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Queues",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AppointmentId = table.Column<int>(type: "int", nullable: false),
                    DoctorId = table.Column<int>(type: "int", nullable: false),
                    PatientId = table.Column<int>(type: "int", nullable: false),
                    QueueNumber = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    QueueDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CalledAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    StartedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EstimatedWaitTimeMinutes = table.Column<int>(type: "int", nullable: false),
                    ActualWaitTimeMinutes = table.Column<int>(type: "int", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Queues", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Queues_Appointments_AppointmentId",
                        column: x => x.AppointmentId,
                        principalTable: "Appointments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Queues_Doctors_DoctorId",
                        column: x => x.DoctorId,
                        principalTable: "Doctors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Queues_Patients_PatientId",
                        column: x => x.PatientId,
                        principalTable: "Patients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Queues_AppointmentId",
                table: "Queues",
                column: "AppointmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Queues_DoctorId_QueueDate_Status",
                table: "Queues",
                columns: new[] { "DoctorId", "QueueDate", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Queues_PatientId",
                table: "Queues",
                column: "PatientId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Queues");
        }
    }
}
