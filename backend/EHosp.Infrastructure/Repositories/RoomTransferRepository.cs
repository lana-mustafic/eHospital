using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EHosp.Infrastructure.Repositories;

public class RoomTransferRepository : BaseRepository<RoomTransfer>, IRoomTransferRepository
{
    public RoomTransferRepository(ApplicationDbContext context) : base(context) { }

    public async Task<RoomTransfer?> GetRoomTransferWithDetailsAsync(int id)
        => await _dbSet.Include(rt => rt.Admission)
                      .ThenInclude(a => a.Patient)
                      .ThenInclude(p => p.User)
                      .Include(rt => rt.FromRoom)
                      .ThenInclude(r => r.RoomType)
                      .Include(rt => rt.ToRoom)
                      .ThenInclude(r => r.RoomType)
                      .Include(rt => rt.FromBed)
                      .Include(rt => rt.ToBed)
                      .Include(rt => rt.TransferredByDoctor)
                      .ThenInclude(d => d.User)
                      .Include(rt => rt.CreatedBy)
                      .FirstOrDefaultAsync(rt => rt.Id == id);

    public async Task<IEnumerable<RoomTransfer>> GetAllRoomTransfersWithDetailsAsync()
        => await _dbSet.Include(rt => rt.Admission)
                      .ThenInclude(a => a.Patient)
                      .ThenInclude(p => p.User)
                      .Include(rt => rt.FromRoom)
                      .ThenInclude(r => r.RoomType)
                      .Include(rt => rt.ToRoom)
                      .ThenInclude(r => r.RoomType)
                      .Include(rt => rt.FromBed)
                      .Include(rt => rt.ToBed)
                      .Include(rt => rt.TransferredByDoctor)
                      .ThenInclude(d => d.User)
                      .OrderByDescending(rt => rt.TransferDate)
                      .ToListAsync();

    public async Task<IEnumerable<RoomTransfer>> GetRoomTransfersByAdmissionAsync(int admissionId)
        => await _dbSet.Include(rt => rt.Admission)
                      .ThenInclude(a => a.Patient)
                      .ThenInclude(p => p.User)
                      .Include(rt => rt.FromRoom)
                      .ThenInclude(r => r.RoomType)
                      .Include(rt => rt.ToRoom)
                      .ThenInclude(r => r.RoomType)
                      .Include(rt => rt.FromBed)
                      .Include(rt => rt.ToBed)
                      .Include(rt => rt.TransferredByDoctor)
                      .ThenInclude(d => d.User)
                      .Where(rt => rt.AdmissionId == admissionId)
                      .OrderByDescending(rt => rt.TransferDate)
                      .ToListAsync();

    public async Task<IEnumerable<RoomTransfer>> GetRoomTransfersByRoomAsync(int roomId)
        => await _dbSet.Include(rt => rt.Admission)
                      .ThenInclude(a => a.Patient)
                      .ThenInclude(p => p.User)
                      .Include(rt => rt.FromRoom)
                      .ThenInclude(r => r.RoomType)
                      .Include(rt => rt.ToRoom)
                      .ThenInclude(r => r.RoomType)
                      .Include(rt => rt.FromBed)
                      .Include(rt => rt.ToBed)
                      .Include(rt => rt.TransferredByDoctor)
                      .ThenInclude(d => d.User)
                      .Where(rt => rt.FromRoomId == roomId || rt.ToRoomId == roomId)
                      .OrderByDescending(rt => rt.TransferDate)
                      .ToListAsync();
}

