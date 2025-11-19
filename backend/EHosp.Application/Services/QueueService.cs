using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace EHosp.Application.Services;

public class QueueService : IQueueService
{
    private readonly IQueueRepository _queueRepository;
    private readonly IAppointmentRepository _appointmentRepository;
    private readonly IDoctorRepository _doctorRepository;
    private readonly IPatientRepository _patientRepository;
    private readonly ILogger<QueueService> _logger;

    public QueueService(
        IQueueRepository queueRepository,
        IAppointmentRepository appointmentRepository,
        IDoctorRepository doctorRepository,
        IPatientRepository patientRepository,
        ILogger<QueueService> logger)
    {
        _queueRepository = queueRepository;
        _appointmentRepository = appointmentRepository;
        _doctorRepository = doctorRepository;
        _patientRepository = patientRepository;
        _logger = logger;
    }

    public async Task<IEnumerable<QueueDto>> GetAllQueuesAsync()
    {
        var queues = await _queueRepository.GetAllAsync();
        return queues.Select(MapToDto);
    }

    public async Task<IEnumerable<QueueDto>> GetQueuesByDoctorAsync(int doctorId, DateTime? date = null)
    {
        var queues = await _queueRepository.GetByDoctorAsync(doctorId, date);
        return queues.Select(MapToDto);
    }

    public async Task<IEnumerable<QueueDto>> GetQueuesByDateAsync(DateTime date)
    {
        var queues = await _queueRepository.GetByDateAsync(date);
        return queues.Select(MapToDto);
    }

    public async Task<QueueDto?> GetQueueByIdAsync(int id)
    {
        var queue = await _queueRepository.GetByIdAsync(id);
        return queue != null ? MapToDto(queue) : null;
    }

    public async Task<QueueDto> CreateQueueAsync(CreateQueueDto createQueueDto)
    {
        // Check if appointment exists
        var appointment = await _appointmentRepository.GetByIdAsync(createQueueDto.AppointmentId);
        if (appointment == null)
        {
            throw new ArgumentException("Appointment not found");
        }

        // Check if queue already exists for this appointment
        var existingQueue = (await _queueRepository.GetAllAsync())
            .FirstOrDefault(q => q.AppointmentId == createQueueDto.AppointmentId && 
                                 q.Status != "Completed" && 
                                 q.Status != "Cancelled");
        
        if (existingQueue != null)
        {
            throw new InvalidOperationException("Queue already exists for this appointment");
        }

        // Get next queue number
        var queueNumber = await _queueRepository.GetNextQueueNumberAsync(
            createQueueDto.DoctorId, 
            createQueueDto.QueueDate);

        // Calculate estimated wait time (average 15 minutes per patient)
        var waitingCount = (await _queueRepository.GetByDoctorAsync(
            createQueueDto.DoctorId, 
            createQueueDto.QueueDate))
            .Count(q => q.Status == "Waiting" || q.Status == "InProgress");

        var queue = new Queue
        {
            AppointmentId = createQueueDto.AppointmentId,
            DoctorId = createQueueDto.DoctorId,
            PatientId = createQueueDto.PatientId,
            QueueNumber = queueNumber,
            Status = "Waiting",
            QueueDate = createQueueDto.QueueDate.Date,
            EstimatedWaitTimeMinutes = waitingCount * 15,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var createdQueue = await _queueRepository.AddAsync(queue);
        _logger.LogInformation("Queue created: {QueueId} for Appointment {AppointmentId}", 
            createdQueue.Id, createQueueDto.AppointmentId);

        return MapToDto(createdQueue);
    }

    public async Task<QueueDto> UpdateQueueStatusAsync(int id, UpdateQueueStatusDto updateDto)
    {
        var queue = await _queueRepository.GetByIdAsync(id);
        if (queue == null)
        {
            throw new ArgumentException("Queue not found");
        }

        var oldStatus = queue.Status;
        queue.Status = updateDto.Status;
        queue.UpdatedAt = DateTime.UtcNow;

        if (!string.IsNullOrEmpty(updateDto.Notes))
        {
            queue.Notes = updateDto.Notes;
        }

        // Update timestamps based on status
        switch (updateDto.Status)
        {
            case "InProgress":
                if (queue.StartedAt == null)
                {
                    queue.StartedAt = DateTime.UtcNow;
                    queue.CalledAt = DateTime.UtcNow;
                    if (queue.CreatedAt != default)
                    {
                        queue.ActualWaitTimeMinutes = (int)(DateTime.UtcNow - queue.CreatedAt).TotalMinutes;
                    }
                }
                break;
            case "Completed":
                queue.CompletedAt = DateTime.UtcNow;
                if (queue.StartedAt.HasValue)
                {
                    queue.ActualWaitTimeMinutes = (int)(DateTime.UtcNow - queue.StartedAt.Value).TotalMinutes;
                }
                break;
        }

        await _queueRepository.UpdateAsync(queue);
        _logger.LogInformation("Queue {QueueId} status updated from {OldStatus} to {NewStatus}", 
            id, oldStatus, updateDto.Status);

        return MapToDto(queue);
    }

    public async Task<bool> DeleteQueueAsync(int id)
    {
        var queue = await _queueRepository.GetByIdAsync(id);
        if (queue == null)
        {
            return false;
        }

        await _queueRepository.DeleteAsync(queue);
        _logger.LogInformation("Queue {QueueId} deleted", id);
        return true;
    }

    public async Task<QueueDto> CallNextPatientAsync(int doctorId)
    {
        // Get the next waiting patient
        var queues = await _queueRepository.GetByDoctorAsync(doctorId, DateTime.Today);
        var nextQueue = queues
            .Where(q => q.Status == "Waiting")
            .OrderBy(q => q.QueueNumber)
            .FirstOrDefault();

        if (nextQueue == null)
        {
            throw new InvalidOperationException("No patients waiting in queue");
        }

        // Complete current patient if any
        var currentQueue = await _queueRepository.GetCurrentPatientAsync(doctorId);
        if (currentQueue != null)
        {
            currentQueue.Status = "Completed";
            currentQueue.CompletedAt = DateTime.UtcNow;
            await _queueRepository.UpdateAsync(currentQueue);
        }

        // Call next patient
        var updateDto = new UpdateQueueStatusDto { Status = "InProgress" };
        return await UpdateQueueStatusAsync(nextQueue.Id, updateDto);
    }

    public async Task<bool> ReorderQueueAsync(int doctorId, ReorderQueueDto reorderDto)
    {
        var queues = await _queueRepository.GetByDoctorAsync(doctorId, DateTime.Today);
        var queueDict = queues.ToDictionary(q => q.Id);

        for (int i = 0; i < reorderDto.QueueIds.Count; i++)
        {
            var queueId = reorderDto.QueueIds[i];
            if (queueDict.TryGetValue(queueId, out var queue))
            {
                queue.QueueNumber = i + 1;
                queue.UpdatedAt = DateTime.UtcNow;
                await _queueRepository.UpdateAsync(queue);
            }
        }

        _logger.LogInformation("Queue reordered for Doctor {DoctorId}", doctorId);
        return true;
    }

    public async Task<IEnumerable<QueueDto>> GetActiveQueuesAsync()
    {
        var queues = await _queueRepository.GetActiveQueuesAsync();
        return queues.Select(MapToDto);
    }

    public async Task<QueueDto> SkipQueueAsync(int id)
    {
        var queue = await _queueRepository.GetByIdAsync(id);
        if (queue == null)
        {
            throw new ArgumentException("Queue not found");
        }

        queue.Status = "Skipped";
        queue.UpdatedAt = DateTime.UtcNow;
        await _queueRepository.UpdateAsync(queue);

        _logger.LogInformation("Queue {QueueId} skipped", id);
        return MapToDto(queue);
    }

    private QueueDto MapToDto(Queue queue)
    {
        return new QueueDto
        {
            Id = queue.Id,
            AppointmentId = queue.AppointmentId,
            DoctorId = queue.DoctorId,
            PatientId = queue.PatientId,
            QueueNumber = queue.QueueNumber,
            Status = queue.Status,
            QueueDate = queue.QueueDate,
            CalledAt = queue.CalledAt,
            StartedAt = queue.StartedAt,
            CompletedAt = queue.CompletedAt,
            EstimatedWaitTimeMinutes = queue.EstimatedWaitTimeMinutes,
            ActualWaitTimeMinutes = queue.ActualWaitTimeMinutes,
            Notes = queue.Notes,
            CreatedAt = queue.CreatedAt,
            UpdatedAt = queue.UpdatedAt,
            PatientName = $"{queue.Patient?.User?.FirstName} {queue.Patient?.User?.LastName}".Trim(),
            DoctorName = $"{queue.Doctor?.User?.FirstName} {queue.Doctor?.User?.LastName}".Trim(),
            DoctorSpecialization = queue.Doctor?.Specialization ?? "",
            AppointmentReason = queue.Appointment?.Reason ?? "",
            AppointmentTime = queue.Appointment != null 
                ? $"{queue.Appointment.StartTime:hh\\:mm} - {queue.Appointment.EndTime:hh\\:mm}"
                : ""
        };
    }
}

