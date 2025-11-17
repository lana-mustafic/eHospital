using EHosp.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EHosp.Infrastructure.Data.Configurations;

public class LabTestConfiguration : IEntityTypeConfiguration<LabTest>
{
    public void Configure(EntityTypeBuilder<LabTest> builder)
    {
        builder.HasKey(lt => lt.Id);

        builder.Property(lt => lt.OrderedDate)
            .IsRequired();

        builder.Property(lt => lt.TestName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(lt => lt.TestType)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(lt => lt.TestCode)
            .HasMaxLength(50);

        builder.Property(lt => lt.Status)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(lt => lt.Results)
            .HasMaxLength(5000);

        builder.Property(lt => lt.Notes)
            .HasMaxLength(2000);

        builder.Property(lt => lt.FilePath)
            .HasMaxLength(500);

        builder.Property(lt => lt.FileName)
            .HasMaxLength(255);

        builder.Property(lt => lt.FileContentType)
            .HasMaxLength(100);

        builder.HasOne(lt => lt.Patient)
            .WithMany(p => p.LabTests)
            .HasForeignKey(lt => lt.PatientId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(lt => lt.Doctor)
            .WithMany(d => d.LabTests)
            .HasForeignKey(lt => lt.DoctorId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(lt => lt.MedicalRecord)
            .WithMany(mr => mr.LabTests)
            .HasForeignKey(lt => lt.MedicalRecordId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(lt => lt.PerformedBy)
            .WithMany()
            .HasForeignKey(lt => lt.PerformedByUserId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

