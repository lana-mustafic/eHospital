using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using EHosp.Domain.Entities;

namespace EHosp.Infrastructure.Data.Configurations;

public class PriorAuthorizationConfiguration : IEntityTypeConfiguration<PriorAuthorization>
{
    public void Configure(EntityTypeBuilder<PriorAuthorization> builder)
    {
        builder.HasKey(pa => pa.Id);

        builder.Property(pa => pa.AuthorizationNumber)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(pa => pa.RequestNumber)
            .HasMaxLength(100);

        builder.Property(pa => pa.Status)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(pa => pa.ServiceType)
            .HasMaxLength(100);

        builder.Property(pa => pa.RequestedAmount)
            .HasColumnType("decimal(18,2)");

        builder.Property(pa => pa.ApprovedAmount)
            .HasColumnType("decimal(18,2)");

        // Relationships
        builder.HasOne(pa => pa.PatientInsurance)
            .WithMany(pi => pi.PriorAuthorizations)
            .HasForeignKey(pa => pa.PatientInsuranceId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(pa => pa.RelatedInvoice)
            .WithMany()
            .HasForeignKey(pa => pa.RelatedInvoiceId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(pa => pa.RelatedAppointment)
            .WithMany()
            .HasForeignKey(pa => pa.RelatedAppointmentId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(pa => pa.RequestedByUser)
            .WithMany()
            .HasForeignKey(pa => pa.RequestedByUserId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

