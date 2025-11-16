using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EHosp.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuditController : ControllerBase
    {
        private readonly IAuditService _auditService;
        public AuditController(IAuditService auditService)
        {
            _auditService = auditService;
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<AuditLog>>> GetAudit()
        {
            var logs = await _auditService.GetAllAsync();
            return Ok(logs.OrderByDescending(l => l.TimestampUtc));
        }
    }
}

