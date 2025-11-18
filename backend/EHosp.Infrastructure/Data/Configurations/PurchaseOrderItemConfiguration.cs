using EHosp.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EHosp.Infrastructure.Data.Configurations;

public class PurchaseOrderItemConfiguration : IEntityTypeConfiguration<PurchaseOrderItem>
{
    public void Configure(EntityTypeBuilder<PurchaseOrderItem> builder)
    {
        builder.HasKey(poi => poi.Id);

        builder.Property(poi => poi.UnitPrice)
            .HasColumnType("decimal(18,2)");

        builder.Property(poi => poi.LineTotal)
            .HasColumnType("decimal(18,2)");

        builder.Property(poi => poi.DiscountPercent)
            .HasColumnType("decimal(5,2)");

        builder.HasOne(poi => poi.PurchaseOrder)
            .WithMany(po => po.Items)
            .HasForeignKey(poi => poi.PurchaseOrderId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(poi => poi.InventoryItem)
            .WithMany(i => i.PurchaseOrderItems)
            .HasForeignKey(poi => poi.InventoryItemId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

