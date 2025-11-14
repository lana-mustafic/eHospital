using EHosp.Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EHosp.Api.Data;

public static class DatabaseSeeder
{
    private const string DefaultAdminEmail = "admin@ehospital.com";
    private const string DefaultAdminPassword = "Admin@123";

    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        await context.Database.MigrateAsync();

        if (!await context.Users.AnyAsync(u => u.Email == DefaultAdminEmail))
        {
            var adminRoleId = await context.Roles
                .Where(r => r.Name == "Admin")
                .Select(r => r.Id)
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

