using EHosp.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EHosp.Infrastructure.Data.Configurations;

public class PatientAllergyConfiguration : IEntityTypeConfiguration<PatientAllergy>
{
    public void Configure(EntityTypeBuilder<PatientAllergy> builder)
    {
        builder.HasKey(pa => pa.Id);

        builder.Property(pa => pa.AllergenName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(pa => pa.AllergyType)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(pa => pa.Severity)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(pa => pa.Reaction)
            .HasMaxLength(500);

        builder.Property(pa => pa.Notes)
            .HasMaxLength(2000);

        builder.HasOne(pa => pa.Patient)
            .WithMany(p => p.Allergies)
            .HasForeignKey(pa => pa.PatientId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(pa => pa.RecordedByUser)
            .WithMany()
            .HasForeignKey(pa => pa.RecordedByUserId)
            .OnDelete(DeleteBehavior.NoAction);
    }
}

