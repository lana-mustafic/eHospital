using EHosp.Api.Middleware;
using EHosp.Api.Data;
using EHosp.Application.Interfaces;
using EHosp.Application.Profiles;
using EHosp.Application.Services;
using EHosp.Infrastructure.Data;
using EHosp.Infrastructure.Repositories;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();

// CORS configuration to allow Angular dev server
const string FrontendPolicy = "FrontendOrigin";
builder.Services.AddCors(options =>
{
    options.AddPolicy(FrontendPolicy, policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Database Context
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));


builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key not configured")))
        };
    });

// Authorization
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
    options.AddPolicy("DoctorOnly", policy => policy.RequireRole("Doctor"));
    options.AddPolicy("NurseOnly", policy => policy.RequireRole("Nurse"));
    options.AddPolicy("ReceptionistOnly", policy => policy.RequireRole("Receptionist"));
    options.AddPolicy("PatientOnly", policy => policy.RequireRole("Patient"));
    options.AddPolicy("MedicalStaff", policy => policy.RequireRole("Admin", "Doctor", "Nurse"));
    options.AddPolicy("Staff", policy => policy.RequireRole("Admin", "Doctor", "Nurse", "Receptionist"));
});


// Add AutoMapper
builder.Services.AddAutoMapper(typeof(MappingProfile));
// Add this after builder services
builder.Services.AddAutoMapper(typeof(EHosp.Application.Profiles.MappingProfile));

// Repositories
builder.Services.AddScoped(typeof(IRepository<>), typeof(BaseRepository<>));
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IDoctorRepository, DoctorRepository>();
builder.Services.AddScoped<IPatientRepository, PatientRepository>();
builder.Services.AddScoped<IDepartmentRepository, DepartmentRepository>();
builder.Services.AddScoped<IMedicalRecordRepository, MedicalRecordRepository>();
builder.Services.AddScoped<IMedicationRepository, MedicationRepository>();
builder.Services.AddScoped<IPrescriptionRepository, PrescriptionRepository>();
builder.Services.AddScoped<IDoctorScheduleRepository, DoctorScheduleRepository>();
builder.Services.AddScoped<IDiagnosisRepository, DiagnosisRepository>();
        builder.Services.AddScoped<IAppointmentRepository, AppointmentRepository>();
        builder.Services.AddScoped<IQueueRepository, QueueRepository>();
        builder.Services.AddScoped<IEDVisitRepository, EDVisitRepository>();

// Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IDoctorService, DoctorService>();
builder.Services.AddScoped<IPatientService, PatientService>();
builder.Services.AddScoped<IDepartmentService, DepartmentService>();
builder.Services.AddScoped<IMedicalRecordService, MedicalRecordService>();
builder.Services.AddScoped<IMedicationService, MedicationService>();
builder.Services.AddScoped<IPrescriptionService, PrescriptionService>();
builder.Services.AddScoped<IDoctorScheduleService, DoctorScheduleService>();
builder.Services.AddScoped<IDiagnosisService, DiagnosisService>();
        builder.Services.AddScoped<IAppointmentService, AppointmentService>();
        builder.Services.AddScoped<IQueueService, QueueService>();
        builder.Services.AddScoped<IEDVisitService, EDVisitService>();
        builder.Services.AddScoped<IVitalSignsRepository, VitalSignsRepository>();
        builder.Services.AddScoped<IVitalSignsService, VitalSignsService>();
        builder.Services.AddScoped<ILabTestRepository, LabTestRepository>();
        builder.Services.AddScoped<ILabTestService, LabTestService>();
        builder.Services.AddScoped<IInvoiceRepository, InvoiceRepository>();
        builder.Services.AddScoped<IPaymentRepository, PaymentRepository>();
        builder.Services.AddScoped<IInvoiceService, InvoiceService>();
        builder.Services.AddScoped<IAuditLogRepository, AuditLogRepository>();
        builder.Services.AddScoped<IAuditService, AuditService>();
        builder.Services.AddScoped<IPatientAllergyRepository, PatientAllergyRepository>();
        builder.Services.AddScoped<IPatientAllergyService, PatientAllergyService>();
        builder.Services.AddScoped<IChronicConditionRepository, ChronicConditionRepository>();
        builder.Services.AddScoped<IChronicConditionService, ChronicConditionService>();
        builder.Services.AddScoped<IFamilyMedicalHistoryRepository, FamilyMedicalHistoryRepository>();
        builder.Services.AddScoped<IFamilyMedicalHistoryService, FamilyMedicalHistoryService>();
        builder.Services.AddScoped<IDischargeSummaryRepository, DischargeSummaryRepository>();
        builder.Services.AddScoped<IDischargeSummaryService, DischargeSummaryService>();
        builder.Services.AddScoped<INotificationRepository, NotificationRepository>();
        builder.Services.AddScoped<INotificationPreferenceRepository, NotificationPreferenceRepository>();
        builder.Services.AddScoped<INotificationService, NotificationService>();
        builder.Services.AddScoped<IEmailService, EmailService>();
        builder.Services.AddScoped<ISmsService, SmsService>();
        builder.Services.AddScoped<IAppointmentReminderService, AppointmentReminderService>();
        builder.Services.AddScoped<IRoomTypeRepository, RoomTypeRepository>();
        builder.Services.AddScoped<IRoomRepository, RoomRepository>();
        builder.Services.AddScoped<IBedRepository, BedRepository>();
        builder.Services.AddScoped<IAdmissionRepository, AdmissionRepository>();
        builder.Services.AddScoped<IRoomTransferRepository, RoomTransferRepository>();
        builder.Services.AddScoped<IRoomTypeService, RoomTypeService>();
        builder.Services.AddScoped<IRoomService, RoomService>();
        builder.Services.AddScoped<IBedService, BedService>();
        builder.Services.AddScoped<IAdmissionService, AdmissionService>();
        builder.Services.AddScoped<IRoomTransferService, RoomTransferService>();
        builder.Services.AddScoped<ISupplierRepository, SupplierRepository>();
        builder.Services.AddScoped<IInventoryItemRepository, InventoryItemRepository>();
        builder.Services.AddScoped<IPurchaseOrderRepository, PurchaseOrderRepository>();
        builder.Services.AddScoped<IStockMovementRepository, StockMovementRepository>();
        builder.Services.AddScoped<ISupplierService, SupplierService>();
        builder.Services.AddScoped<IInventoryItemService, InventoryItemService>();
        builder.Services.AddScoped<IPurchaseOrderService, PurchaseOrderService>();
        builder.Services.AddScoped<IStockMovementService, StockMovementService>();
        builder.Services.AddScoped<IDrugInteractionRepository, DrugInteractionRepository>();
        builder.Services.AddScoped<IDrugInteractionService, DrugInteractionService>();
        builder.Services.AddScoped<PrescriptionSafetyService>();
        builder.Services.AddScoped<IClinicalDecisionSupportService, ClinicalDecisionSupportService>();
        builder.Services.AddScoped<IInsuranceProviderRepository, InsuranceProviderRepository>();
        builder.Services.AddScoped<IInsuranceProviderService, InsuranceProviderService>();
        builder.Services.AddScoped<IPatientInsuranceRepository, PatientInsuranceRepository>();
        builder.Services.AddScoped<IPatientInsuranceService, PatientInsuranceService>();
        builder.Services.AddScoped<IClaimRepository, ClaimRepository>();
        builder.Services.AddScoped<IClaimService, ClaimService>();
        builder.Services.AddScoped<IPriorAuthorizationRepository, PriorAuthorizationRepository>();
        builder.Services.AddScoped<IPriorAuthorizationService, PriorAuthorizationService>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

await DatabaseSeeder.SeedAsync(app.Services);

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

var httpsPort = builder.Configuration.GetValue<int?>("ASPNETCORE_HTTPS_PORT");
if (httpsPort.HasValue && httpsPort.Value > 0)
{
    app.UseHttpsRedirection();
}

app.UseCors(FrontendPolicy);
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.UseMiddleware<ExceptionHandlingMiddleware>();

app.Run();