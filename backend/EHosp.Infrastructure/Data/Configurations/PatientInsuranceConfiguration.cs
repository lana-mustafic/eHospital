using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using EHosp.Domain.Entities;

namespace EHosp.Infrastructure.Data.Configurations;

public class PatientInsuranceConfiguration : IEntityTypeConfiguration<PatientInsurance>
{
    public void Configure(EntityTypeBuilder<PatientInsurance> builder)
    {
        builder.HasKey(pi => pi.Id);

        builder.Property(pi => pi.PolicyNumber)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(pi => pi.GroupNumber)
            .HasMaxLength(100);

        builder.Property(pi => pi.SubscriberId)
            .HasMaxLength(100);

        builder.Property(pi => pi.SubscriberName)
            .HasMaxLength(200);

        builder.Property(pi => pi.CoverageType)
            .HasMaxLength(50);

        // Relationships
        builder.HasOne(pi => pi.Patient)
            .WithMany(p => p.Insurances)
            .HasForeignKey(pi => pi.PatientId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(pi => pi.InsuranceProvider)
            .WithMany(ip => ip.PatientInsurances)
            .HasForeignKey(pi => pi.InsuranceProviderId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(pi => pi.VerifiedByUser)
            .WithMany()
            .HasForeignKey(pi => pi.VerifiedByUserId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

