using EHosp.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EHosp.Infrastructure.Data.Configurations;

public class StockMovementConfiguration : IEntityTypeConfiguration<StockMovement>
{
    public void Configure(EntityTypeBuilder<StockMovement> builder)
    {
        builder.HasKey(sm => sm.Id);

        builder.Property(sm => sm.MovementType)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(sm => sm.Reason)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(sm => sm.UnitPrice)
            .HasColumnType("decimal(18,2)");

        builder.HasOne(sm => sm.InventoryItem)
            .WithMany(i => i.StockMovements)
            .HasForeignKey(sm => sm.InventoryItemId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(sm => sm.CreatedBy)
            .WithMany()
            .HasForeignKey(sm => sm.CreatedByUserId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne(sm => sm.Prescription)
            .WithMany(p => p.StockMovements)
            .HasForeignKey(sm => sm.PrescriptionId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

