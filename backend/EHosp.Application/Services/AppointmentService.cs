using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace EHosp.Application.Services
{
    public class AppointmentService : IAppointmentService
    {
        private readonly IAppointmentRepository _appointmentRepository;
        private readonly IDoctorRepository _doctorRepository;
        private readonly IPatientRepository _patientRepository;
        private readonly ILogger<AppointmentService> _logger;

        public AppointmentService(
            IAppointmentRepository appointmentRepository,
            IDoctorRepository doctorRepository,
            IPatientRepository patientRepository,
            ILogger<AppointmentService> logger)
        {
            _appointmentRepository = appointmentRepository;
            _doctorRepository = doctorRepository;
            _patientRepository = patientRepository;
            _logger = logger;
        }

        public async Task<AppointmentDto?> GetAppointmentByIdAsync(int id)
        {
            var appointment = await _appointmentRepository.GetByIdAsync(id);
            return appointment != null ? MapToDto(appointment) : null;
        }

        public async Task<IEnumerable<AppointmentDto>> GetAppointmentsByDoctorAsync(int doctorId, DateTime date)
        {
            var appointments = await _appointmentRepository.GetAppointmentsByDoctorAsync(doctorId, date);
            return appointments.Select(MapToDto);
        }

        public async Task<IEnumerable<AppointmentDto>> GetAppointmentsByPatientAsync(int patientId)
        {
            var appointments = await _appointmentRepository.GetAppointmentsByPatientAsync(patientId);
            return appointments.Select(MapToDto);
        }

        public async Task<IEnumerable<AppointmentDto>> GetAppointmentsByDateAsync(DateTime date)
        {
            var appointments = await _appointmentRepository.GetAppointmentsByDateAsync(date);
            return appointments.Select(MapToDto);
        }

        public async Task<AppointmentDto> CreateAppointmentAsync(CreateAppointmentDto createAppointmentDto)
        {
            // Check if time slot is available
            var isAvailable = await _appointmentRepository.IsTimeSlotAvailableAsync(
                createAppointmentDto.DoctorId,
                createAppointmentDto.AppointmentDate,
                createAppointmentDto.StartTime,
                createAppointmentDto.EndTime);

            if (!isAvailable)
            {
                throw new ArgumentException("The selected time slot is not available");
            }

            var appointment = new Appointment
            {
                AppointmentDate = createAppointmentDto.AppointmentDate,
                StartTime = createAppointmentDto.StartTime,
                EndTime = createAppointmentDto.EndTime,
                Status = "Scheduled",
                Reason = createAppointmentDto.Reason,
                PatientId = createAppointmentDto.PatientId,
                DoctorId = createAppointmentDto.DoctorId,
                CreatedAt = DateTime.UtcNow
            };

            var createdAppointment = await _appointmentRepository.AddAsync(appointment);
            return MapToDto(createdAppointment);
        }

        public async Task UpdateAppointmentStatusAsync(int id, UpdateAppointmentDto updateAppointmentDto)
        {
            var appointment = await _appointmentRepository.GetByIdAsync(id);
            if (appointment == null) throw new ArgumentException("Appointment not found");

            appointment.Status = updateAppointmentDto.Status;
            appointment.Notes = updateAppointmentDto.Notes;

            await _appointmentRepository.UpdateAsync(appointment);
        }

        public async Task<bool> IsTimeSlotAvailableAsync(int doctorId, DateTime date, TimeSpan startTime, TimeSpan endTime)
            => await _appointmentRepository.IsTimeSlotAvailableAsync(doctorId, date, startTime, endTime);

        private static AppointmentDto MapToDto(Appointment appointment) => new()
        {
            Id = appointment.Id,
            AppointmentDate = appointment.AppointmentDate,
            StartTime = appointment.StartTime,
            EndTime = appointment.EndTime,
            Status = appointment.Status,
            Reason = appointment.Reason,
            Notes = appointment.Notes,
            PatientName = $"{appointment.Patient?.User?.FirstName} {appointment.Patient?.User?.LastName}",
            DoctorName = $"{appointment.Doctor?.User?.FirstName} {appointment.Doctor?.User?.LastName}",
            DoctorSpecialization = appointment.Doctor?.Specialization ?? string.Empty
        };
    }
}