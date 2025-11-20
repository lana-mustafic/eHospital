using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using EHosp.Domain.Entities;

namespace EHosp.Infrastructure.Data.Configurations;

public class ClaimPaymentConfiguration : IEntityTypeConfiguration<ClaimPayment>
{
    public void Configure(EntityTypeBuilder<ClaimPayment> builder)
    {
        builder.HasKey(cp => cp.Id);

        builder.Property(cp => cp.PaymentReference)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(cp => cp.Amount)
            .HasColumnType("decimal(18,2)");

        // Relationships
        builder.HasOne(cp => cp.Claim)
            .WithMany(c => c.Payments)
            .HasForeignKey(cp => cp.ClaimId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(cp => cp.PostedByUser)
            .WithMany()
            .HasForeignKey(cp => cp.PostedByUserId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

