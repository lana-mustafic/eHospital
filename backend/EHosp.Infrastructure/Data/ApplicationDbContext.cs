using Microsoft.EntityFrameworkCore;
using EHosp.Domain.Entities;

namespace Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            base.OnConfiguring(optionsBuilder);
            
            // Suppress the pending model changes warning in development
            // This allows the app to run even if there are minor model differences
            optionsBuilder.ConfigureWarnings(warnings =>
                warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
        }

        // DbSets will be added here as we create entities
        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Doctor> Doctors { get; set; }
        public DbSet<Patient> Patients { get; set; }
        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<DoctorSchedule> DoctorSchedules { get; set; }
        public DbSet<Department> Departments { get; set; }
        public DbSet<MedicalRecord> MedicalRecords { get; set; }
        public DbSet<Diagnosis> Diagnoses { get; set; }
        public DbSet<Medication> Medications { get; set; }
        public DbSet<Prescription> Prescriptions { get; set; }
        public DbSet<VitalSigns> VitalSigns { get; set; }
        public DbSet<LabTest> LabTests { get; set; }
        public DbSet<Invoice> Invoices { get; set; }
        public DbSet<InvoiceItem> InvoiceItems { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Apply all configurations from the Configurations folder
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);

            // Seed data
            SeedData(modelBuilder);
        }

        private void SeedData(ModelBuilder modelBuilder)
        {
            // Seed Roles
            modelBuilder.Entity<Role>().HasData(
                new Role { Id = 1, Name = "Admin", Description = "System Administrator - Full access to all features" },
                new Role { Id = 2, Name = "Doctor", Description = "Medical Doctor - Can view patients, add medical notes, prescribe medications" },
                new Role { Id = 3, Name = "Patient", Description = "Patient - Can view own data and appointments" },
                new Role { Id = 4, Name = "Nurse", Description = "Nurse/Technician - Can assist doctors, update vitals, check-in patients" },
                new Role { Id = 5, Name = "Receptionist", Description = "Receptionist/Front Desk - Can register patients and schedule appointments" }
            );

            // Seed Departments
            modelBuilder.Entity<Department>().HasData(
                new Department { Id = 1, Name = "Cardiology", Description = "Heart and cardiovascular care", PhoneNumber = "123-456-7890", Email = "cardiology@ehospital.com" },
                new Department { Id = 2, Name = "Neurology", Description = "Brain and nervous system care", PhoneNumber = "123-456-7891", Email = "neurology@ehospital.com" },
                new Department { Id = 3, Name = "Pediatrics", Description = "Child healthcare", PhoneNumber = "123-456-7892", Email = "pediatrics@ehospital.com" }
            );
        }
    
    }
}