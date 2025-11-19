using EHosp.Domain.Entities;

namespace EHosp.Application.Interfaces;

public interface IQueueRepository
{
    Task<Queue?> GetByIdAsync(int id);
    Task<IEnumerable<Queue>> GetAllAsync();
    Task<IEnumerable<Queue>> GetByDoctorAsync(int doctorId, DateTime? date = null);
    Task<IEnumerable<Queue>> GetByDateAsync(DateTime date);
    Task<IEnumerable<Queue>> GetActiveQueuesAsync();
    Task<Queue> AddAsync(Queue queue);
    Task UpdateAsync(Queue queue);
    Task DeleteAsync(Queue queue);
    Task<int> GetNextQueueNumberAsync(int doctorId, DateTime date);
    Task<Queue?> GetCurrentPatientAsync(int doctorId);
}

