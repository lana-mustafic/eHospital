using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using EHosp.Domain.Entities;

namespace EHosp.Infrastructure.Data.Configurations;

public class ClaimConfiguration : IEntityTypeConfiguration<Claim>
{
    public void Configure(EntityTypeBuilder<Claim> builder)
    {
        builder.HasKey(c => c.Id);

        builder.Property(c => c.ClaimNumber)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(c => c.ExternalClaimId)
            .HasMaxLength(100);

        builder.Property(c => c.Status)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(c => c.TotalCharges)
            .HasColumnType("decimal(18,2)");

        builder.Property(c => c.ApprovedAmount)
            .HasColumnType("decimal(18,2)");

        builder.Property(c => c.PaidAmount)
            .HasColumnType("decimal(18,2)");

        builder.Property(c => c.PatientResponsibility)
            .HasColumnType("decimal(18,2)");

        // Relationships
        builder.HasOne(c => c.Invoice)
            .WithMany(i => i.Claims)
            .HasForeignKey(c => c.InvoiceId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(c => c.PatientInsurance)
            .WithMany(pi => pi.Claims)
            .HasForeignKey(c => c.PatientInsuranceId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(c => c.SubmittedByUser)
            .WithMany()
            .HasForeignKey(c => c.SubmittedByUserId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

