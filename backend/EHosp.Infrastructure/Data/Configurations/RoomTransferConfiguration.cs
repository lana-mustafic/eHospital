using EHosp.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EHosp.Infrastructure.Data.Configurations;

public class RoomTransferConfiguration : IEntityTypeConfiguration<RoomTransfer>
{
    public void Configure(EntityTypeBuilder<RoomTransfer> builder)
    {
        builder.HasKey(rt => rt.Id);

        builder.Property(rt => rt.Reason)
            .IsRequired()
            .HasMaxLength(500);

        builder.HasOne(rt => rt.Admission)
            .WithMany(a => a.RoomTransfers)
            .HasForeignKey(rt => rt.AdmissionId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(rt => rt.FromRoom)
            .WithMany()
            .HasForeignKey(rt => rt.FromRoomId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(rt => rt.ToRoom)
            .WithMany()
            .HasForeignKey(rt => rt.ToRoomId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(rt => rt.FromBed)
            .WithMany()
            .HasForeignKey(rt => rt.FromBedId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(rt => rt.ToBed)
            .WithMany()
            .HasForeignKey(rt => rt.ToBedId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(rt => rt.TransferredByDoctor)
            .WithMany(d => d.RoomTransfers)
            .HasForeignKey(rt => rt.TransferredByDoctorId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne(rt => rt.CreatedBy)
            .WithMany()
            .HasForeignKey(rt => rt.CreatedByUserId)
            .OnDelete(DeleteBehavior.NoAction);
    }
}

