using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;

namespace EHosp.Application.Services
{
    public class AuditService : IAuditService
    {
        private readonly IAuditLogRepository _repo;
        public AuditService(IAuditLogRepository repo)
        {
            _repo = repo;
        }

        public async Task<IEnumerable<AuditLog>> GetAllAsync()
            => await _repo.GetAllAsync();

        public async Task WriteAsync(string actorUserId, string actorRole, string action, string entityType, string entityId, string details)
        {
            var log = new AuditLog
            {
                ActorUserId = actorUserId,
                ActorRole = actorRole,
                Action = action,
                EntityType = entityType,
                EntityId = entityId,
                Details = details,
                TimestampUtc = DateTime.UtcNow
            };
            await _repo.AddAsync(log);
        }
    }
}

