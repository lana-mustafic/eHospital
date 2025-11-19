using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using EHosp.Domain.Entities;

namespace EHosp.Infrastructure.Data.Configurations;

public class EDVisitConfiguration : IEntityTypeConfiguration<EDVisit>
{
    public void Configure(EntityTypeBuilder<EDVisit> builder)
    {
        builder.ToTable("EDVisits");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.TriagePriority)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(e => e.ChiefComplaint)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(e => e.TriageNotes)
            .HasMaxLength(1000);

        builder.Property(e => e.Status)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(e => e.Disposition)
            .HasMaxLength(50);

        builder.Property(e => e.DispositionNotes)
            .HasMaxLength(2000);

        builder.Property(e => e.TreatmentNotes)
            .HasMaxLength(2000);

        builder.Property(e => e.Diagnosis)
            .HasMaxLength(500);

        builder.Property(e => e.MedicationsGiven)
            .HasMaxLength(1000);

        builder.Property(e => e.ProceduresPerformed)
            .HasMaxLength(1000);

        builder.Property(e => e.ArrivalTime)
            .IsRequired();

        // Relationships
        builder.HasOne(e => e.Patient)
            .WithMany()
            .HasForeignKey(e => e.PatientId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.TriageNurse)
            .WithMany()
            .HasForeignKey(e => e.TriageNurseId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne(e => e.AssignedDoctor)
            .WithMany()
            .HasForeignKey(e => e.AssignedDoctorId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne(e => e.TreatedByDoctor)
            .WithMany()
            .HasForeignKey(e => e.TreatedByDoctorId)
            .OnDelete(DeleteBehavior.NoAction);

        // Configure decimal precision for vital signs
        builder.Property(e => e.BloodPressureSystolic)
            .HasPrecision(5, 2);
        builder.Property(e => e.BloodPressureDiastolic)
            .HasPrecision(5, 2);
        builder.Property(e => e.Temperature)
            .HasPrecision(5, 2);
        builder.Property(e => e.HeartRate)
            .HasPrecision(5, 2);
        builder.Property(e => e.RespiratoryRate)
            .HasPrecision(5, 2);
        builder.Property(e => e.OxygenSaturation)
            .HasPrecision(5, 2);
        builder.Property(e => e.PainScale)
            .HasPrecision(3, 1);

        // Indexes
        builder.HasIndex(e => new { e.PatientId, e.ArrivalTime });
        builder.HasIndex(e => new { e.Status, e.ArrivalTime });
        builder.HasIndex(e => new { e.TriagePriority, e.Status });
        builder.HasIndex(e => e.AssignedDoctorId);
    }
}

