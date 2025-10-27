using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using EHosp.Domain.Entities;

namespace EHosp.Infrastructure.Data.Configurations
{
    public class MedicalRecordConfiguration : IEntityTypeConfiguration<MedicalRecord>
    {
        public void Configure(EntityTypeBuilder<MedicalRecord> builder)
        {
            builder.HasKey(mr => mr.Id);

            // Fix cascade delete issue - use Restrict for both
            builder.HasOne(mr => mr.Patient)
                .WithMany(p => p.MedicalRecords)
                .HasForeignKey(mr => mr.PatientId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(mr => mr.Doctor)
                .WithMany(d => d.MedicalRecords)  
                .HasForeignKey(mr => mr.DoctorId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(mr => mr.Diagnosis)
                .WithMany(d => d.MedicalRecords)
                .HasForeignKey(mr => mr.DiagnosisId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}