using EHosp.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EHosp.Infrastructure.Data.Configurations;

public class NotificationPreferenceConfiguration : IEntityTypeConfiguration<NotificationPreference>
{
    public void Configure(EntityTypeBuilder<NotificationPreference> builder)
    {
        builder.HasKey(np => np.Id);

        builder.HasOne(np => np.User)
            .WithOne(u => u.NotificationPreference)
            .HasForeignKey<NotificationPreference>(np => np.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(np => np.UserId)
            .IsUnique();
    }
}

