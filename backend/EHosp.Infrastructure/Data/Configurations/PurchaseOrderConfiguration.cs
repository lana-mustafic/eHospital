using EHosp.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EHosp.Infrastructure.Data.Configurations;

public class PurchaseOrderConfiguration : IEntityTypeConfiguration<PurchaseOrder>
{
    public void Configure(EntityTypeBuilder<PurchaseOrder> builder)
    {
        builder.HasKey(po => po.Id);

        builder.Property(po => po.OrderNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(po => po.Status)
            .IsRequired()
            .HasMaxLength(50)
            .HasDefaultValue("Pending");

        builder.Property(po => po.TotalAmount)
            .HasColumnType("decimal(18,2)");

        builder.Property(po => po.DiscountAmount)
            .HasColumnType("decimal(18,2)");

        builder.Property(po => po.TaxAmount)
            .HasColumnType("decimal(18,2)");

        builder.Property(po => po.GrandTotal)
            .HasColumnType("decimal(18,2)");

        builder.HasIndex(po => po.OrderNumber)
            .IsUnique();

        builder.HasOne(po => po.Supplier)
            .WithMany(s => s.PurchaseOrders)
            .HasForeignKey(po => po.SupplierId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(po => po.CreatedBy)
            .WithMany()
            .HasForeignKey(po => po.CreatedByUserId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne(po => po.ApprovedBy)
            .WithMany()
            .HasForeignKey(po => po.ApprovedByUserId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne(po => po.ReceivedBy)
            .WithMany()
            .HasForeignKey(po => po.ReceivedByUserId)
            .OnDelete(DeleteBehavior.NoAction);
    }
}

