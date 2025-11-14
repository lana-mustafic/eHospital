using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace EHosp.Application.Services
{
    public class DoctorScheduleService : IDoctorScheduleService
    {
        private readonly IDoctorScheduleRepository _doctorScheduleRepository;
        private readonly IDoctorRepository _doctorRepository;
        private readonly ILogger<DoctorScheduleService> _logger;

        public DoctorScheduleService(
            IDoctorScheduleRepository doctorScheduleRepository,
            IDoctorRepository doctorRepository,
            ILogger<DoctorScheduleService> logger)
        {
            _doctorScheduleRepository = doctorScheduleRepository;
            _doctorRepository = doctorRepository;
            _logger = logger;
        }

        public async Task<DoctorScheduleDto?> GetDoctorScheduleByIdAsync(int id)
        {
            var schedule = await _doctorScheduleRepository.GetDoctorScheduleWithDetailsAsync(id);
            return schedule != null ? MapToDto(schedule) : null;
        }

        public async Task<IEnumerable<DoctorScheduleDto>> GetSchedulesByDoctorAsync(int doctorId)
        {
            var schedules = await _doctorScheduleRepository.GetSchedulesByDoctorAsync(doctorId);
            return schedules.Select(MapToDto);
        }

        public async Task<IEnumerable<DoctorScheduleDto>> GetAvailableSchedulesByDoctorAsync(int doctorId)
        {
            var schedules = await _doctorScheduleRepository.GetAvailableSchedulesByDoctorAsync(doctorId);
            return schedules.Select(MapToDto);
        }

        public async Task<IEnumerable<DoctorScheduleDto>> GetSchedulesByDayOfWeekAsync(int doctorId, DayOfWeek dayOfWeek)
        {
            var schedules = await _doctorScheduleRepository.GetSchedulesByDayOfWeekAsync(doctorId, dayOfWeek);
            return schedules.Select(MapToDto);
        }

        public async Task<DoctorScheduleDto> CreateDoctorScheduleAsync(CreateDoctorScheduleDto createDoctorScheduleDto)
        {
            // Validate doctor exists
            var doctor = await _doctorRepository.GetByIdAsync(createDoctorScheduleDto.DoctorId);
            if (doctor == null)
            {
                throw new ArgumentException("Doctor not found");
            }

            // Validate time range
            if (createDoctorScheduleDto.StartTime >= createDoctorScheduleDto.EndTime)
            {
                throw new ArgumentException("Start time must be before end time");
            }

            // Check for overlapping schedules on the same day
            var existingSchedules = await _doctorScheduleRepository.GetSchedulesByDayOfWeekAsync(
                createDoctorScheduleDto.DoctorId, 
                createDoctorScheduleDto.DayOfWeek);

            foreach (var existing in existingSchedules)
            {
                if (IsTimeOverlapping(
                    createDoctorScheduleDto.StartTime, 
                    createDoctorScheduleDto.EndTime,
                    existing.StartTime, 
                    existing.EndTime))
                {
                    throw new InvalidOperationException(
                        $"Schedule overlaps with existing schedule on {createDoctorScheduleDto.DayOfWeek} " +
                        $"({existing.StartTime} - {existing.EndTime})");
                }
            }

            var schedule = new DoctorSchedule
            {
                DayOfWeek = createDoctorScheduleDto.DayOfWeek,
                StartTime = createDoctorScheduleDto.StartTime,
                EndTime = createDoctorScheduleDto.EndTime,
                IsAvailable = createDoctorScheduleDto.IsAvailable,
                DoctorId = createDoctorScheduleDto.DoctorId
            };

            var createdSchedule = await _doctorScheduleRepository.AddAsync(schedule);
            var scheduleWithDetails = await _doctorScheduleRepository.GetDoctorScheduleWithDetailsAsync(createdSchedule.Id);
            return MapToDto(scheduleWithDetails!);
        }

        public async Task UpdateDoctorScheduleAsync(int id, UpdateDoctorScheduleDto updateDoctorScheduleDto)
        {
            var schedule = await _doctorScheduleRepository.GetByIdAsync(id);
            if (schedule == null)
            {
                throw new ArgumentException("Doctor schedule not found");
            }

            var startTime = updateDoctorScheduleDto.StartTime ?? schedule.StartTime;
            var endTime = updateDoctorScheduleDto.EndTime ?? schedule.EndTime;
            var dayOfWeek = updateDoctorScheduleDto.DayOfWeek ?? schedule.DayOfWeek;

            // Validate time range
            if (startTime >= endTime)
            {
                throw new ArgumentException("Start time must be before end time");
            }

            // Check for overlapping schedules if time or day changed
            if (updateDoctorScheduleDto.StartTime.HasValue || 
                updateDoctorScheduleDto.EndTime.HasValue || 
                updateDoctorScheduleDto.DayOfWeek.HasValue)
            {
                var existingSchedules = await _doctorScheduleRepository.GetSchedulesByDayOfWeekAsync(
                    schedule.DoctorId, 
                    dayOfWeek);

                foreach (var existing in existingSchedules.Where(s => s.Id != id))
                {
                    if (IsTimeOverlapping(startTime, endTime, existing.StartTime, existing.EndTime))
                    {
                        throw new InvalidOperationException(
                            $"Schedule overlaps with existing schedule on {dayOfWeek} " +
                            $"({existing.StartTime} - {existing.EndTime})");
                    }
                }
            }

            if (updateDoctorScheduleDto.DayOfWeek.HasValue)
                schedule.DayOfWeek = updateDoctorScheduleDto.DayOfWeek.Value;
            if (updateDoctorScheduleDto.StartTime.HasValue)
                schedule.StartTime = updateDoctorScheduleDto.StartTime.Value;
            if (updateDoctorScheduleDto.EndTime.HasValue)
                schedule.EndTime = updateDoctorScheduleDto.EndTime.Value;
            if (updateDoctorScheduleDto.IsAvailable.HasValue)
                schedule.IsAvailable = updateDoctorScheduleDto.IsAvailable.Value;

            await _doctorScheduleRepository.UpdateAsync(schedule);
        }

        public async Task DeleteDoctorScheduleAsync(int id)
        {
            var schedule = await _doctorScheduleRepository.GetByIdAsync(id);
            if (schedule == null)
            {
                throw new ArgumentException("Doctor schedule not found");
            }

            await _doctorScheduleRepository.DeleteAsync(schedule);
        }

        private static bool IsTimeOverlapping(TimeSpan start1, TimeSpan end1, TimeSpan start2, TimeSpan end2)
        {
            return start1 < end2 && start2 < end1;
        }

        private static DoctorScheduleDto MapToDto(DoctorSchedule schedule) => new()
        {
            Id = schedule.Id,
            DayOfWeek = schedule.DayOfWeek,
            StartTime = schedule.StartTime,
            EndTime = schedule.EndTime,
            IsAvailable = schedule.IsAvailable,
            DoctorId = schedule.DoctorId,
            DoctorName = $"{schedule.Doctor?.User?.FirstName} {schedule.Doctor?.User?.LastName}".Trim(),
            DoctorSpecialization = schedule.Doctor?.Specialization ?? string.Empty
        };
    }
}

