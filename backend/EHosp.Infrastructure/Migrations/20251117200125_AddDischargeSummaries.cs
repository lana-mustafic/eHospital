using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EHosp.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDischargeSummaries : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DischargeSummaries",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DischargeNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    DischargeDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AdmissionDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DischargeType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ConditionOnDischarge = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ChiefComplaint = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    HistoryOfPresentIllness = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    HospitalCourse = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    ProceduresPerformed = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    DischargeDiagnosis = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    PostDischargeInstructions = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    ActivityRestrictions = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    DietInstructions = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    MedicationInstructions = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    WarningSigns = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    FollowUpDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FollowUpDoctorId = table.Column<int>(type: "int", nullable: true),
                    FollowUpInstructions = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    AdditionalNotes = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FinalizedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PatientId = table.Column<int>(type: "int", nullable: false),
                    DischargingDoctorId = table.Column<int>(type: "int", nullable: false),
                    MedicalRecordId = table.Column<int>(type: "int", nullable: true),
                    AppointmentId = table.Column<int>(type: "int", nullable: true),
                    CreatedByUserId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DischargeSummaries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DischargeSummaries_Appointments_AppointmentId",
                        column: x => x.AppointmentId,
                        principalTable: "Appointments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_DischargeSummaries_Doctors_DischargingDoctorId",
                        column: x => x.DischargingDoctorId,
                        principalTable: "Doctors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DischargeSummaries_Doctors_FollowUpDoctorId",
                        column: x => x.FollowUpDoctorId,
                        principalTable: "Doctors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_DischargeSummaries_MedicalRecords_MedicalRecordId",
                        column: x => x.MedicalRecordId,
                        principalTable: "MedicalRecords",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_DischargeSummaries_Patients_PatientId",
                        column: x => x.PatientId,
                        principalTable: "Patients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DischargeSummaries_Users_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_DischargeSummaries_AppointmentId",
                table: "DischargeSummaries",
                column: "AppointmentId");

            migrationBuilder.CreateIndex(
                name: "IX_DischargeSummaries_CreatedByUserId",
                table: "DischargeSummaries",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_DischargeSummaries_DischargeNumber",
                table: "DischargeSummaries",
                column: "DischargeNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DischargeSummaries_DischargingDoctorId",
                table: "DischargeSummaries",
                column: "DischargingDoctorId");

            migrationBuilder.CreateIndex(
                name: "IX_DischargeSummaries_FollowUpDoctorId",
                table: "DischargeSummaries",
                column: "FollowUpDoctorId");

            migrationBuilder.CreateIndex(
                name: "IX_DischargeSummaries_MedicalRecordId",
                table: "DischargeSummaries",
                column: "MedicalRecordId");

            migrationBuilder.CreateIndex(
                name: "IX_DischargeSummaries_PatientId",
                table: "DischargeSummaries",
                column: "PatientId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DischargeSummaries");
        }
    }
}
