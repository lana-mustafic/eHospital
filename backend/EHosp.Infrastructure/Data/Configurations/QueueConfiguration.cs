using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using EHosp.Domain.Entities;

namespace EHosp.Infrastructure.Data.Configurations;

public class QueueConfiguration : IEntityTypeConfiguration<Queue>
{
    public void Configure(EntityTypeBuilder<Queue> builder)
    {
        builder.ToTable("Queues");

        builder.HasKey(q => q.Id);

        builder.Property(q => q.Status)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(q => q.Notes)
            .HasMaxLength(500);

        builder.Property(q => q.QueueDate)
            .IsRequired();

        builder.HasOne(q => q.Appointment)
            .WithMany()
            .HasForeignKey(q => q.AppointmentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(q => q.Doctor)
            .WithMany()
            .HasForeignKey(q => q.DoctorId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(q => q.Patient)
            .WithMany()
            .HasForeignKey(q => q.PatientId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(q => new { q.DoctorId, q.QueueDate, q.Status });
        builder.HasIndex(q => new { q.AppointmentId });
    }
}

