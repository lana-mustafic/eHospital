using EHosp.Application.DTOs;

namespace EHosp.Application.Interfaces;

public interface IQueueService
{
    Task<IEnumerable<QueueDto>> GetAllQueuesAsync();
    Task<IEnumerable<QueueDto>> GetQueuesByDoctorAsync(int doctorId, DateTime? date = null);
    Task<IEnumerable<QueueDto>> GetQueuesByDateAsync(DateTime date);
    Task<QueueDto?> GetQueueByIdAsync(int id);
    Task<QueueDto> CreateQueueAsync(CreateQueueDto createQueueDto);
    Task<QueueDto> UpdateQueueStatusAsync(int id, UpdateQueueStatusDto updateDto);
    Task<bool> DeleteQueueAsync(int id);
    Task<QueueDto> CallNextPatientAsync(int doctorId);
    Task<bool> ReorderQueueAsync(int doctorId, ReorderQueueDto reorderDto);
    Task<IEnumerable<QueueDto>> GetActiveQueuesAsync();
    Task<QueueDto> SkipQueueAsync(int id);
}

