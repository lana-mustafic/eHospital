using AutoMapper;
using EHosp.Application.DTOs;
using EHosp.Domain.Entities;

namespace EHosp.Application.Profiles
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // User mappings
            CreateMap<User, UserDto>()
                .ForMember(dest => dest.RoleName, opt => opt.MapFrom(src => src.Role.Name));
            CreateMap<CreateUserDto, User>();
            CreateMap<UpdateUserDto, User>();

            // Doctor mappings
            CreateMap<Doctor, DoctorDto>()
                .ForMember(dest => dest.FirstName, opt => opt.MapFrom(src => src.User.FirstName))
                .ForMember(dest => dest.LastName, opt => opt.MapFrom(src => src.User.LastName))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.User.Email))
                .ForMember(dest => dest.DepartmentName, opt => opt.MapFrom(src => src.Department.Name));
            CreateMap<CreateDoctorDto, User>()
                .ForMember(dest => dest.RoleId, opt => opt.MapFrom(_ => 2)); // Default to Doctor role
            CreateMap<CreateDoctorDto, Doctor>();

            // Appointment mappings
            CreateMap<Appointment, AppointmentDto>()
                .ForMember(dest => dest.PatientName, opt => opt.MapFrom(src =>
                    $"{src.Patient.User.FirstName} {src.Patient.User.LastName}"))
                .ForMember(dest => dest.DoctorName, opt => opt.MapFrom(src =>
                    $"{src.Doctor.User.FirstName} {src.Doctor.User.LastName}"))
                .ForMember(dest => dest.DoctorSpecialization, opt => opt.MapFrom(src => src.Doctor.Specialization));
            CreateMap<CreateAppointmentDto, Appointment>();
            CreateMap<UpdateAppointmentDto, Appointment>();
        }
    }
}