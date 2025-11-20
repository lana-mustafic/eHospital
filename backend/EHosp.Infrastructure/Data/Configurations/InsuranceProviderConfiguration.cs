using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using EHosp.Domain.Entities;

namespace EHosp.Infrastructure.Data.Configurations;

public class InsuranceProviderConfiguration : IEntityTypeConfiguration<InsuranceProvider>
{
    public void Configure(EntityTypeBuilder<InsuranceProvider> builder)
    {
        builder.HasKey(ip => ip.Id);

        builder.Property(ip => ip.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(ip => ip.Code)
            .HasMaxLength(50);

        builder.Property(ip => ip.PayerId)
            .HasMaxLength(50);

        builder.Property(ip => ip.PhoneNumber)
            .HasMaxLength(20);

        builder.Property(ip => ip.Email)
            .HasMaxLength(100);
    }
}

