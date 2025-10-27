using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using EHosp.Domain.Entities;

namespace EHosp.Infrastructure.Data.Configurations
{
    public class MedicationConfiguration : IEntityTypeConfiguration<Medication>
    {
        public void Configure(EntityTypeBuilder<Medication> builder)
        {
            builder.HasKey(m => m.Id);

            builder.Property(m => m.Name)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(m => m.Dosage)
                .IsRequired()
                .HasMaxLength(50);

            // Fix the decimal precision warning
            builder.Property(m => m.Price)
                .HasPrecision(18, 2);  // ✅ Added precision for decimal
        }
    }
}