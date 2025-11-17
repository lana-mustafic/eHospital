using EHosp.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EHosp.Infrastructure.Data.Configurations;

public class VitalSignsConfiguration : IEntityTypeConfiguration<VitalSigns>
{
    public void Configure(EntityTypeBuilder<VitalSigns> builder)
    {
        builder.HasKey(vs => vs.Id);

        builder.Property(vs => vs.RecordedDate)
            .IsRequired();

        builder.Property(vs => vs.BloodPressureSystolic)
            .HasColumnType("decimal(5,2)");

        builder.Property(vs => vs.BloodPressureDiastolic)
            .HasColumnType("decimal(5,2)");

        builder.Property(vs => vs.Temperature)
            .HasColumnType("decimal(5,2)");

        builder.Property(vs => vs.HeartRate)
            .HasColumnType("decimal(5,2)");

        builder.Property(vs => vs.RespiratoryRate)
            .HasColumnType("decimal(5,2)");

        builder.Property(vs => vs.Weight)
            .HasColumnType("decimal(5,2)");

        builder.Property(vs => vs.Height)
            .HasColumnType("decimal(5,2)");

        builder.Property(vs => vs.OxygenSaturation)
            .HasColumnType("decimal(5,2)");

        builder.Property(vs => vs.BloodGlucose)
            .HasColumnType("decimal(5,2)");

        builder.Property(vs => vs.Notes)
            .HasMaxLength(2000);

        builder.HasOne(vs => vs.Patient)
            .WithMany(p => p.VitalSigns)
            .HasForeignKey(vs => vs.PatientId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(vs => vs.MedicalRecord)
            .WithMany(mr => mr.VitalSigns)
            .HasForeignKey(vs => vs.MedicalRecordId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(vs => vs.RecordedBy)
            .WithMany()
            .HasForeignKey(vs => vs.RecordedByUserId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

