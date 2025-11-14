using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace EHosp.Application.Services
{
    public class DepartmentService : IDepartmentService
    {
        private readonly IDepartmentRepository _departmentRepository;
        private readonly ILogger<DepartmentService> _logger;

        public DepartmentService(IDepartmentRepository departmentRepository, ILogger<DepartmentService> logger)
        {
            _departmentRepository = departmentRepository;
            _logger = logger;
        }

        public async Task<DepartmentDto?> GetDepartmentByIdAsync(int id)
        {
            var department = await _departmentRepository.GetDepartmentWithDoctorsAsync(id);
            return department != null ? MapToDto(department) : null;
        }

        public async Task<IEnumerable<DepartmentDto>> GetAllDepartmentsAsync()
        {
            var departments = await _departmentRepository.GetAllAsync();
            return departments.Select(MapToDto);
        }

        public async Task<DepartmentDto> CreateDepartmentAsync(CreateDepartmentDto createDepartmentDto)
        {
            var department = new Department
            {
                Name = createDepartmentDto.Name,
                Description = createDepartmentDto.Description,
                PhoneNumber = createDepartmentDto.PhoneNumber,
                Email = createDepartmentDto.Email
            };

            var createdDepartment = await _departmentRepository.AddAsync(department);
            return MapToDto(createdDepartment);
        }

        public async Task UpdateDepartmentAsync(int id, UpdateDepartmentDto updateDepartmentDto)
        {
            var department = await _departmentRepository.GetByIdAsync(id);
            if (department == null)
            {
                throw new ArgumentException("Department not found");
            }

            if (!string.IsNullOrEmpty(updateDepartmentDto.Name))
                department.Name = updateDepartmentDto.Name;
            if (!string.IsNullOrEmpty(updateDepartmentDto.Description))
                department.Description = updateDepartmentDto.Description;
            if (!string.IsNullOrEmpty(updateDepartmentDto.PhoneNumber))
                department.PhoneNumber = updateDepartmentDto.PhoneNumber;
            if (!string.IsNullOrEmpty(updateDepartmentDto.Email))
                department.Email = updateDepartmentDto.Email;

            await _departmentRepository.UpdateAsync(department);
        }

        public async Task DeleteDepartmentAsync(int id)
        {
            var department = await _departmentRepository.GetByIdAsync(id);
            if (department == null)
            {
                throw new ArgumentException("Department not found");
            }

            // Check if department has doctors
            var departmentWithDoctors = await _departmentRepository.GetDepartmentWithDoctorsAsync(id);
            if (departmentWithDoctors != null && departmentWithDoctors.Doctors.Any())
            {
                throw new InvalidOperationException("Cannot delete department with assigned doctors. Please reassign doctors first.");
            }

            await _departmentRepository.DeleteAsync(department);
        }

        private static DepartmentDto MapToDto(Department department) => new()
        {
            Id = department.Id,
            Name = department.Name,
            Description = department.Description,
            PhoneNumber = department.PhoneNumber,
            Email = department.Email,
            DoctorCount = department.Doctors?.Count ?? 0
        };
    }
}

