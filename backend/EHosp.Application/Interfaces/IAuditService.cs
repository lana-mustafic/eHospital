using EHosp.Domain.Entities;

namespace EHosp.Application.Interfaces
{
    public interface IAuditService
    {
        Task<IEnumerable<AuditLog>> GetAllAsync();
        Task WriteAsync(string actorUserId, string actorRole, string action, string entityType, string entityId, string details);
    }
}

