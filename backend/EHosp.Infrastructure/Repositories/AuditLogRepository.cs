using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using Infrastructure.Data;

namespace EHosp.Infrastructure.Repositories
{
    public class AuditLogRepository : BaseRepository<AuditLog>, IAuditLogRepository
    {
        public AuditLogRepository(ApplicationDbContext context) : base(context) { }
    }
}

