using EHosp.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EHosp.Infrastructure.Data.Configurations;

public class ChronicConditionConfiguration : IEntityTypeConfiguration<ChronicCondition>
{
    public void Configure(EntityTypeBuilder<ChronicCondition> builder)
    {
        builder.HasKey(cc => cc.Id);

        builder.Property(cc => cc.ConditionName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(cc => cc.Category)
            .HasMaxLength(100);

        builder.Property(cc => cc.Status)
            .HasMaxLength(50);

        builder.Property(cc => cc.Treatment)
            .HasMaxLength(2000);

        builder.Property(cc => cc.Notes)
            .HasMaxLength(2000);

        builder.HasOne(cc => cc.Patient)
            .WithMany(p => p.ChronicConditions)
            .HasForeignKey(cc => cc.PatientId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(cc => cc.DiagnosedByDoctor)
            .WithMany(d => d.DiagnosedChronicConditions)
            .HasForeignKey(cc => cc.DiagnosedByDoctorId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(cc => cc.RecordedByUser)
            .WithMany()
            .HasForeignKey(cc => cc.RecordedByUserId)
            .OnDelete(DeleteBehavior.NoAction);
    }
}

