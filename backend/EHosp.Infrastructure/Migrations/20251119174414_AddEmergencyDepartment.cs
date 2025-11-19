using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EHosp.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddEmergencyDepartment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "EDVisits",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ArrivalTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TriageTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TreatmentStartTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DischargeTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TriagePriority = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ChiefComplaint = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    TriageNotes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    BloodPressureSystolic = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: true),
                    BloodPressureDiastolic = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: true),
                    Temperature = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: true),
                    HeartRate = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: true),
                    RespiratoryRate = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: true),
                    OxygenSaturation = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: true),
                    PainScale = table.Column<decimal>(type: "decimal(3,1)", precision: 3, scale: 1, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Disposition = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    DispositionNotes = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    TreatmentNotes = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    Diagnosis = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    MedicationsGiven = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ProceduresPerformed = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    WaitTimeToTriage = table.Column<int>(type: "int", nullable: true),
                    WaitTimeToTreatment = table.Column<int>(type: "int", nullable: true),
                    TotalEDStayTime = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PatientId = table.Column<int>(type: "int", nullable: false),
                    TriageNurseId = table.Column<int>(type: "int", nullable: true),
                    AssignedDoctorId = table.Column<int>(type: "int", nullable: true),
                    TreatedByDoctorId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EDVisits", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EDVisits_Doctors_AssignedDoctorId",
                        column: x => x.AssignedDoctorId,
                        principalTable: "Doctors",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_EDVisits_Doctors_TreatedByDoctorId",
                        column: x => x.TreatedByDoctorId,
                        principalTable: "Doctors",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_EDVisits_Patients_PatientId",
                        column: x => x.PatientId,
                        principalTable: "Patients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EDVisits_Users_TriageNurseId",
                        column: x => x.TriageNurseId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_EDVisits_AssignedDoctorId",
                table: "EDVisits",
                column: "AssignedDoctorId");

            migrationBuilder.CreateIndex(
                name: "IX_EDVisits_PatientId_ArrivalTime",
                table: "EDVisits",
                columns: new[] { "PatientId", "ArrivalTime" });

            migrationBuilder.CreateIndex(
                name: "IX_EDVisits_Status_ArrivalTime",
                table: "EDVisits",
                columns: new[] { "Status", "ArrivalTime" });

            migrationBuilder.CreateIndex(
                name: "IX_EDVisits_TreatedByDoctorId",
                table: "EDVisits",
                column: "TreatedByDoctorId");

            migrationBuilder.CreateIndex(
                name: "IX_EDVisits_TriageNurseId",
                table: "EDVisits",
                column: "TriageNurseId");

            migrationBuilder.CreateIndex(
                name: "IX_EDVisits_TriagePriority_Status",
                table: "EDVisits",
                columns: new[] { "TriagePriority", "Status" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EDVisits");
        }
    }
}
