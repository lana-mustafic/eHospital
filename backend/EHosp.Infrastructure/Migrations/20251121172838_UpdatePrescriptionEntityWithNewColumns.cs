using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EHosp.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdatePrescriptionEntityWithNewColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PurchaseOrders_Users_UserId",
                table: "PurchaseOrders");

            migrationBuilder.DropForeignKey(
                name: "FK_PurchaseOrders_Users_UserId1",
                table: "PurchaseOrders");

            migrationBuilder.DropForeignKey(
                name: "FK_PurchaseOrders_Users_UserId2",
                table: "PurchaseOrders");

            migrationBuilder.DropForeignKey(
                name: "FK_Rooms_Departments_DepartmentId1",
                table: "Rooms");

            migrationBuilder.DropForeignKey(
                name: "FK_StockMovements_Prescriptions_PrescriptionId1",
                table: "StockMovements");

            migrationBuilder.DropIndex(
                name: "IX_StockMovements_PrescriptionId1",
                table: "StockMovements");

            migrationBuilder.DropIndex(
                name: "IX_Rooms_DepartmentId1",
                table: "Rooms");

            migrationBuilder.DropIndex(
                name: "IX_PurchaseOrders_UserId",
                table: "PurchaseOrders");

            migrationBuilder.DropIndex(
                name: "IX_PurchaseOrders_UserId1",
                table: "PurchaseOrders");

            migrationBuilder.DropIndex(
                name: "IX_PurchaseOrders_UserId2",
                table: "PurchaseOrders");

            migrationBuilder.DropColumn(
                name: "PrescriptionId1",
                table: "StockMovements");

            migrationBuilder.DropColumn(
                name: "DepartmentId1",
                table: "Rooms");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "PurchaseOrders");

            migrationBuilder.DropColumn(
                name: "UserId1",
                table: "PurchaseOrders");

            migrationBuilder.DropColumn(
                name: "UserId2",
                table: "PurchaseOrders");

            migrationBuilder.AddColumn<string>(
                name: "AllergyAlert",
                table: "Prescriptions",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "AllergyChecked",
                table: "Prescriptions",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DispensedAt",
                table: "Prescriptions",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DispensedByUserId",
                table: "Prescriptions",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "InteractionAlert",
                table: "Prescriptions",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "InteractionChecked",
                table: "Prescriptions",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "PharmacistNotes",
                table: "Prescriptions",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "Prescriptions",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "VerifiedAt",
                table: "Prescriptions",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "VerifiedByUserId",
                table: "Prescriptions",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ActiveIngredient",
                table: "Medications",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "DrugInteractions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Medication1Id = table.Column<int>(type: "int", nullable: false),
                    Medication2Id = table.Column<int>(type: "int", nullable: false),
                    Severity = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    ClinicalSignificance = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Management = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DrugInteractions", x => x.Id);
                    table.CheckConstraint("CK_DrugInteraction_DifferentMedications", "[Medication1Id] != [Medication2Id]");
                    table.ForeignKey(
                        name: "FK_DrugInteractions_Medications_Medication1Id",
                        column: x => x.Medication1Id,
                        principalTable: "Medications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DrugInteractions_Medications_Medication2Id",
                        column: x => x.Medication2Id,
                        principalTable: "Medications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "InsuranceProviders",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Address = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    City = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    State = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ZipCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhoneNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Website = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PayerId = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    ContactPerson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InsuranceProviders", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PatientInsurances",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PolicyNumber = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    GroupNumber = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    SubscriberId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    SubscriberName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    EffectiveDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ExpirationDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CopayAmount = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Deductible = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Coinsurance = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CoverageType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsVerified = table.Column<bool>(type: "bit", nullable: false),
                    VerifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    VerifiedByUserId = table.Column<int>(type: "int", nullable: true),
                    VerificationNotes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PatientId = table.Column<int>(type: "int", nullable: false),
                    InsuranceProviderId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PatientInsurances", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PatientInsurances_InsuranceProviders_InsuranceProviderId",
                        column: x => x.InsuranceProviderId,
                        principalTable: "InsuranceProviders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PatientInsurances_Patients_PatientId",
                        column: x => x.PatientId,
                        principalTable: "Patients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PatientInsurances_Users_VerifiedByUserId",
                        column: x => x.VerifiedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "Claims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ClaimNumber = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ExternalClaimId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ServiceDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    SubmissionDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TotalCharges = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ApprovedAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    PaidAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    PatientResponsibility = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    StatusReason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DiagnosisCodes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ProcedureCodes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    SubmittedByUserId = table.Column<int>(type: "int", nullable: true),
                    InvoiceId = table.Column<int>(type: "int", nullable: false),
                    PatientInsuranceId = table.Column<int>(type: "int", nullable: false),
                    InsuranceProviderId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Claims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Claims_InsuranceProviders_InsuranceProviderId",
                        column: x => x.InsuranceProviderId,
                        principalTable: "InsuranceProviders",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Claims_Invoices_InvoiceId",
                        column: x => x.InvoiceId,
                        principalTable: "Invoices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Claims_PatientInsurances_PatientInsuranceId",
                        column: x => x.PatientInsuranceId,
                        principalTable: "PatientInsurances",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Claims_Users_SubmittedByUserId",
                        column: x => x.SubmittedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "PriorAuthorizations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AuthorizationNumber = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    RequestNumber = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    RequestDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ApprovalDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ExpirationDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ServiceType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ServiceDescription = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DiagnosisCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ProcedureCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RequestedAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    ApprovedAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Units = table.Column<int>(type: "int", nullable: true),
                    DenialReason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RequestedByUserId = table.Column<int>(type: "int", nullable: true),
                    PatientInsuranceId = table.Column<int>(type: "int", nullable: false),
                    RelatedInvoiceId = table.Column<int>(type: "int", nullable: true),
                    RelatedAppointmentId = table.Column<int>(type: "int", nullable: true),
                    InsuranceProviderId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PriorAuthorizations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PriorAuthorizations_Appointments_RelatedAppointmentId",
                        column: x => x.RelatedAppointmentId,
                        principalTable: "Appointments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_PriorAuthorizations_InsuranceProviders_InsuranceProviderId",
                        column: x => x.InsuranceProviderId,
                        principalTable: "InsuranceProviders",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_PriorAuthorizations_Invoices_RelatedInvoiceId",
                        column: x => x.RelatedInvoiceId,
                        principalTable: "Invoices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_PriorAuthorizations_PatientInsurances_PatientInsuranceId",
                        column: x => x.PatientInsuranceId,
                        principalTable: "PatientInsurances",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PriorAuthorizations_Users_RequestedByUserId",
                        column: x => x.RequestedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "ClaimDenials",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DenialCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    DenialReason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    AdjustmentCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeniedAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DenialDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    AppealNotes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AppealDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ResolutionNotes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ResolvedByUserId = table.Column<int>(type: "int", nullable: true),
                    ClaimId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClaimDenials", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ClaimDenials_Claims_ClaimId",
                        column: x => x.ClaimId,
                        principalTable: "Claims",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ClaimDenials_Users_ResolvedByUserId",
                        column: x => x.ResolvedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "ClaimPayments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PaymentReference = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PaymentDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CheckNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EFTReference = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PostedByUserId = table.Column<int>(type: "int", nullable: true),
                    ClaimId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClaimPayments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ClaimPayments_Claims_ClaimId",
                        column: x => x.ClaimId,
                        principalTable: "Claims",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ClaimPayments_Users_PostedByUserId",
                        column: x => x.PostedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Prescriptions_DispensedByUserId",
                table: "Prescriptions",
                column: "DispensedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Prescriptions_VerifiedByUserId",
                table: "Prescriptions",
                column: "VerifiedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ClaimDenials_ClaimId",
                table: "ClaimDenials",
                column: "ClaimId");

            migrationBuilder.CreateIndex(
                name: "IX_ClaimDenials_ResolvedByUserId",
                table: "ClaimDenials",
                column: "ResolvedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ClaimPayments_ClaimId",
                table: "ClaimPayments",
                column: "ClaimId");

            migrationBuilder.CreateIndex(
                name: "IX_ClaimPayments_PostedByUserId",
                table: "ClaimPayments",
                column: "PostedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Claims_InsuranceProviderId",
                table: "Claims",
                column: "InsuranceProviderId");

            migrationBuilder.CreateIndex(
                name: "IX_Claims_InvoiceId",
                table: "Claims",
                column: "InvoiceId");

            migrationBuilder.CreateIndex(
                name: "IX_Claims_PatientInsuranceId",
                table: "Claims",
                column: "PatientInsuranceId");

            migrationBuilder.CreateIndex(
                name: "IX_Claims_SubmittedByUserId",
                table: "Claims",
                column: "SubmittedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_DrugInteractions_Medication1Id",
                table: "DrugInteractions",
                column: "Medication1Id");

            migrationBuilder.CreateIndex(
                name: "IX_DrugInteractions_Medication2Id",
                table: "DrugInteractions",
                column: "Medication2Id");

            migrationBuilder.CreateIndex(
                name: "IX_PatientInsurances_InsuranceProviderId",
                table: "PatientInsurances",
                column: "InsuranceProviderId");

            migrationBuilder.CreateIndex(
                name: "IX_PatientInsurances_PatientId",
                table: "PatientInsurances",
                column: "PatientId");

            migrationBuilder.CreateIndex(
                name: "IX_PatientInsurances_VerifiedByUserId",
                table: "PatientInsurances",
                column: "VerifiedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_PriorAuthorizations_InsuranceProviderId",
                table: "PriorAuthorizations",
                column: "InsuranceProviderId");

            migrationBuilder.CreateIndex(
                name: "IX_PriorAuthorizations_PatientInsuranceId",
                table: "PriorAuthorizations",
                column: "PatientInsuranceId");

            migrationBuilder.CreateIndex(
                name: "IX_PriorAuthorizations_RelatedAppointmentId",
                table: "PriorAuthorizations",
                column: "RelatedAppointmentId");

            migrationBuilder.CreateIndex(
                name: "IX_PriorAuthorizations_RelatedInvoiceId",
                table: "PriorAuthorizations",
                column: "RelatedInvoiceId");

            migrationBuilder.CreateIndex(
                name: "IX_PriorAuthorizations_RequestedByUserId",
                table: "PriorAuthorizations",
                column: "RequestedByUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Prescriptions_Users_DispensedByUserId",
                table: "Prescriptions",
                column: "DispensedByUserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Prescriptions_Users_VerifiedByUserId",
                table: "Prescriptions",
                column: "VerifiedByUserId",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Prescriptions_Users_DispensedByUserId",
                table: "Prescriptions");

            migrationBuilder.DropForeignKey(
                name: "FK_Prescriptions_Users_VerifiedByUserId",
                table: "Prescriptions");

            migrationBuilder.DropTable(
                name: "ClaimDenials");

            migrationBuilder.DropTable(
                name: "ClaimPayments");

            migrationBuilder.DropTable(
                name: "DrugInteractions");

            migrationBuilder.DropTable(
                name: "PriorAuthorizations");

            migrationBuilder.DropTable(
                name: "Claims");

            migrationBuilder.DropTable(
                name: "PatientInsurances");

            migrationBuilder.DropTable(
                name: "InsuranceProviders");

            migrationBuilder.DropIndex(
                name: "IX_Prescriptions_DispensedByUserId",
                table: "Prescriptions");

            migrationBuilder.DropIndex(
                name: "IX_Prescriptions_VerifiedByUserId",
                table: "Prescriptions");

            migrationBuilder.DropColumn(
                name: "AllergyAlert",
                table: "Prescriptions");

            migrationBuilder.DropColumn(
                name: "AllergyChecked",
                table: "Prescriptions");

            migrationBuilder.DropColumn(
                name: "DispensedAt",
                table: "Prescriptions");

            migrationBuilder.DropColumn(
                name: "DispensedByUserId",
                table: "Prescriptions");

            migrationBuilder.DropColumn(
                name: "InteractionAlert",
                table: "Prescriptions");

            migrationBuilder.DropColumn(
                name: "InteractionChecked",
                table: "Prescriptions");

            migrationBuilder.DropColumn(
                name: "PharmacistNotes",
                table: "Prescriptions");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Prescriptions");

            migrationBuilder.DropColumn(
                name: "VerifiedAt",
                table: "Prescriptions");

            migrationBuilder.DropColumn(
                name: "VerifiedByUserId",
                table: "Prescriptions");

            migrationBuilder.DropColumn(
                name: "ActiveIngredient",
                table: "Medications");

            migrationBuilder.AddColumn<int>(
                name: "PrescriptionId1",
                table: "StockMovements",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DepartmentId1",
                table: "Rooms",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "PurchaseOrders",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UserId1",
                table: "PurchaseOrders",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UserId2",
                table: "PurchaseOrders",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_StockMovements_PrescriptionId1",
                table: "StockMovements",
                column: "PrescriptionId1");

            migrationBuilder.CreateIndex(
                name: "IX_Rooms_DepartmentId1",
                table: "Rooms",
                column: "DepartmentId1");

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseOrders_UserId",
                table: "PurchaseOrders",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseOrders_UserId1",
                table: "PurchaseOrders",
                column: "UserId1");

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseOrders_UserId2",
                table: "PurchaseOrders",
                column: "UserId2");

            migrationBuilder.AddForeignKey(
                name: "FK_PurchaseOrders_Users_UserId",
                table: "PurchaseOrders",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_PurchaseOrders_Users_UserId1",
                table: "PurchaseOrders",
                column: "UserId1",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_PurchaseOrders_Users_UserId2",
                table: "PurchaseOrders",
                column: "UserId2",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Rooms_Departments_DepartmentId1",
                table: "Rooms",
                column: "DepartmentId1",
                principalTable: "Departments",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_StockMovements_Prescriptions_PrescriptionId1",
                table: "StockMovements",
                column: "PrescriptionId1",
                principalTable: "Prescriptions",
                principalColumn: "Id");
        }
    }
}
