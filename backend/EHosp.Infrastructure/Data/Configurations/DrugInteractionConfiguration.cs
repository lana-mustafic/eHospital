using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using EHosp.Domain.Entities;

namespace EHosp.Infrastructure.Data.Configurations;

public class DrugInteractionConfiguration : IEntityTypeConfiguration<DrugInteraction>
{
    public void Configure(EntityTypeBuilder<DrugInteraction> builder)
    {
        builder.HasKey(di => di.Id);

        builder.Property(di => di.Severity)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(di => di.Description)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(di => di.ClinicalSignificance)
            .HasMaxLength(500);

        builder.Property(di => di.Management)
            .HasMaxLength(1000);

        // Relationships
        builder.HasOne(di => di.Medication1)
            .WithMany(m => m.InteractionsAsMedication1)
            .HasForeignKey(di => di.Medication1Id)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(di => di.Medication2)
            .WithMany(m => m.InteractionsAsMedication2)
            .HasForeignKey(di => di.Medication2Id)
            .OnDelete(DeleteBehavior.Restrict);

        // Ensure medication1Id != medication2Id
        builder.HasCheckConstraint("CK_DrugInteraction_DifferentMedications", 
            "[Medication1Id] != [Medication2Id]");
    }
}

