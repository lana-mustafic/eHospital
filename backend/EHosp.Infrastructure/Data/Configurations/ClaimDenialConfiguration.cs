using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using EHosp.Domain.Entities;

namespace EHosp.Infrastructure.Data.Configurations;

public class ClaimDenialConfiguration : IEntityTypeConfiguration<ClaimDenial>
{
    public void Configure(EntityTypeBuilder<ClaimDenial> builder)
    {
        builder.HasKey(cd => cd.Id);

        builder.Property(cd => cd.DenialCode)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(cd => cd.DenialReason)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(cd => cd.Status)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(cd => cd.DeniedAmount)
            .HasColumnType("decimal(18,2)");

        // Relationships
        builder.HasOne(cd => cd.Claim)
            .WithMany(c => c.Denials)
            .HasForeignKey(cd => cd.ClaimId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(cd => cd.ResolvedByUser)
            .WithMany()
            .HasForeignKey(cd => cd.ResolvedByUserId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

