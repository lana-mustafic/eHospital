using EHosp.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EHosp.Infrastructure.Data.Configurations;

public class FamilyMedicalHistoryConfiguration : IEntityTypeConfiguration<FamilyMedicalHistory>
{
    public void Configure(EntityTypeBuilder<FamilyMedicalHistory> builder)
    {
        builder.HasKey(fmh => fmh.Id);

        builder.Property(fmh => fmh.Relationship)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(fmh => fmh.ConditionName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(fmh => fmh.Category)
            .HasMaxLength(100);

        builder.Property(fmh => fmh.AgeOfOnset)
            .HasMaxLength(50);

        builder.Property(fmh => fmh.Status)
            .HasMaxLength(50);

        builder.Property(fmh => fmh.Notes)
            .HasMaxLength(2000);

        builder.HasOne(fmh => fmh.Patient)
            .WithMany(p => p.FamilyMedicalHistories)
            .HasForeignKey(fmh => fmh.PatientId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(fmh => fmh.RecordedByUser)
            .WithMany()
            .HasForeignKey(fmh => fmh.RecordedByUserId)
            .OnDelete(DeleteBehavior.NoAction);
    }
}

