using EHosp.Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace EHosp.Api.Data;

public static class DatabaseSeeder
{
    private const string DefaultAdminEmail = "admin@ehospital.com";
    private const string DefaultAdminPassword = "Admin@123";

    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        try
        {
            await context.Database.MigrateAsync();
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("pending changes"))
        {
            // If there are pending model changes, log a warning but continue
            // The developer should create a migration manually
            var logger = scope.ServiceProvider.GetService<ILogger<ApplicationDbContext>>();
            logger?.LogWarning("Database model has pending changes. Please create a migration: dotnet ef migrations add <MigrationName>");
            // Continue with seeding even if migration fails
        }

        if (!await context.Users.AnyAsync(u => u.Email == DefaultAdminEmail))
        {
            var adminRoleId = await context.Roles
                .Where(r => r.Name == "Admin")
                .Select(r => (int?)r.Id)
                .FirstOrDefaultAsync() ?? 1;

            var adminUser = new User
            {
                Email = DefaultAdminEmail,
                PasswordHash = BCrypt.Net.BCrypt.EnhancedHashPassword(DefaultAdminPassword, 13),
                FirstName = "System",
                LastName = "Administrator",
                PhoneNumber = "123-456-7890",
                RoleId = adminRoleId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            context.Users.Add(adminUser);
            await context.SaveChangesAsync();
        }
    }
}

