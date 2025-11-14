using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using Microsoft.Extensions.Logging;
using BCrypt.Net;

namespace EHosp.Application.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly ILogger<UserService> _logger;

        public UserService(IUserRepository userRepository, ILogger<UserService> logger)
        {
            _userRepository = userRepository;
            _logger = logger;
        }

        public async Task<UserDto?> GetUserByIdAsync(int id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            return user != null ? MapToDto(user) : null;
        }

        public async Task<IEnumerable<UserDto>> GetAllUsersAsync()
        {
            var users = await _userRepository.GetAllAsync();
            return users.Select(MapToDto);
        }

        public async Task<UserDto> CreateUserAsync(CreateUserDto createUserDto)
        {
            var user = new User
            {
                Email = createUserDto.Email,
                PasswordHash = BCrypt.Net.BCrypt.EnhancedHashPassword(createUserDto.Password, 13),
                FirstName = createUserDto.FirstName,
                LastName = createUserDto.LastName,
                PhoneNumber = createUserDto.PhoneNumber,
                RoleId = createUserDto.RoleId,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            var createdUser = await _userRepository.AddAsync(user);
            return MapToDto(createdUser);
        }

        public async Task UpdateUserAsync(int id, UpdateUserDto updateUserDto)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null) throw new ArgumentException("User not found");

            user.FirstName = updateUserDto.FirstName;
            user.LastName = updateUserDto.LastName;
            user.PhoneNumber = updateUserDto.PhoneNumber;
            user.IsActive = updateUserDto.IsActive;

            await _userRepository.UpdateAsync(user);
        }

        public async Task DeleteUserAsync(int id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user != null)
            {
                await _userRepository.DeleteAsync(user);
            }
        }

        public async Task<bool> UserExistsAsync(int id) => await _userRepository.ExistsAsync(id);

        private static UserDto MapToDto(User user) => new()
        {
            Id = user.Id,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            PhoneNumber = user.PhoneNumber,
            RoleName = user.Role?.Name ?? "Unknown",
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        };
    }
}