using EHosp.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EHosp.Infrastructure.Data.Configurations;

public class DischargeSummaryConfiguration : IEntityTypeConfiguration<DischargeSummary>
{
    public void Configure(EntityTypeBuilder<DischargeSummary> builder)
    {
        builder.HasKey(ds => ds.Id);

        builder.Property(ds => ds.DischargeNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(ds => ds.DischargeNumber)
            .IsUnique();

        builder.Property(ds => ds.DischargeType)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(ds => ds.ConditionOnDischarge)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(ds => ds.Status)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(ds => ds.ChiefComplaint)
            .HasMaxLength(1000);

        builder.Property(ds => ds.HistoryOfPresentIllness)
            .HasMaxLength(2000);

        builder.Property(ds => ds.HospitalCourse)
            .HasMaxLength(2000);

        builder.Property(ds => ds.ProceduresPerformed)
            .HasMaxLength(1000);

        builder.Property(ds => ds.DischargeDiagnosis)
            .HasMaxLength(1000);

        builder.Property(ds => ds.PostDischargeInstructions)
            .HasMaxLength(2000);

        builder.Property(ds => ds.ActivityRestrictions)
            .HasMaxLength(1000);

        builder.Property(ds => ds.DietInstructions)
            .HasMaxLength(1000);

        builder.Property(ds => ds.MedicationInstructions)
            .HasMaxLength(2000);

        builder.Property(ds => ds.WarningSigns)
            .HasMaxLength(1000);

        builder.Property(ds => ds.FollowUpInstructions)
            .HasMaxLength(1000);

        builder.Property(ds => ds.AdditionalNotes)
            .HasMaxLength(2000);

        builder.HasOne(ds => ds.Patient)
            .WithMany(p => p.DischargeSummaries)
            .HasForeignKey(ds => ds.PatientId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(ds => ds.DischargingDoctor)
            .WithMany(d => d.DischargeSummariesAsDischargingDoctor)
            .HasForeignKey(ds => ds.DischargingDoctorId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(ds => ds.FollowUpDoctor)
            .WithMany(d => d.DischargeSummariesAsFollowUpDoctor)
            .HasForeignKey(ds => ds.FollowUpDoctorId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(ds => ds.MedicalRecord)
            .WithMany(mr => mr.DischargeSummaries)
            .HasForeignKey(ds => ds.MedicalRecordId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(ds => ds.Appointment)
            .WithMany(a => a.DischargeSummaries)
            .HasForeignKey(ds => ds.AppointmentId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(ds => ds.CreatedByUser)
            .WithMany()
            .HasForeignKey(ds => ds.CreatedByUserId)
            .OnDelete(DeleteBehavior.NoAction);
    }
}

