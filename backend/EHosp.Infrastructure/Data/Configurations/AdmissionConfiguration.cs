using EHosp.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EHosp.Infrastructure.Data.Configurations;

public class AdmissionConfiguration : IEntityTypeConfiguration<Admission>
{
    public void Configure(EntityTypeBuilder<Admission> builder)
    {
        builder.HasKey(a => a.Id);

        builder.Property(a => a.Status)
            .IsRequired()
            .HasMaxLength(50)
            .HasDefaultValue("Admitted");

        builder.Property(a => a.ReasonForAdmission)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(a => a.Diagnosis)
            .HasMaxLength(500);

        builder.HasOne(a => a.Patient)
            .WithMany(p => p.Admissions)
            .HasForeignKey(a => a.PatientId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.Room)
            .WithMany(r => r.Admissions)
            .HasForeignKey(a => a.RoomId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.Bed)
            .WithMany(b => b.Admissions)
            .HasForeignKey(a => a.BedId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.AdmittingDoctor)
            .WithMany(d => d.AdmissionsAsAdmittingDoctor)
            .HasForeignKey(a => a.AdmittingDoctorId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne(a => a.DischargingDoctor)
            .WithMany(d => d.AdmissionsAsDischargingDoctor)
            .HasForeignKey(a => a.DischargingDoctorId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne(a => a.CreatedBy)
            .WithMany()
            .HasForeignKey(a => a.CreatedByUserId)
            .OnDelete(DeleteBehavior.NoAction);
    }
}

