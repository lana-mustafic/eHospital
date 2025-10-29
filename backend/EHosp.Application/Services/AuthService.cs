using EHosp.Application.DTOs;
using EHosp.Application.Interfaces;
using EHosp.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace EHosp.Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthService> _logger;

        public AuthService(IUserRepository userRepository, IConfiguration configuration, ILogger<AuthService> logger)
        {
            _userRepository = userRepository;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<AuthResponseDto> LoginAsync(LoginDto loginDto)
        {
            var user = await _userRepository.GetByEmailAsync(loginDto.Email);
            if (user == null || !VerifyPassword(loginDto.Password, user.PasswordHash))
            {
                throw new UnauthorizedAccessException("Invalid email or password");
            }

            if (!user.IsActive)
            {
                throw new UnauthorizedAccessException("Account is deactivated");
            }

            var token = GenerateJwtToken(user);
            var userDto = MapToUserDto(user);

            return new AuthResponseDto
            {
                Token = token,
                Expires = DateTime.UtcNow.AddHours(24),
                User = userDto
            };
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto)
        {
            if (await _userRepository.UserExistsAsync(registerDto.Email))
            {
                throw new ArgumentException("User with this email already exists");
            }

            var user = new User
            {
                Email = registerDto.Email,
                PasswordHash = HashPassword(registerDto.Password),
                FirstName = registerDto.FirstName,
                LastName = registerDto.LastName,
                PhoneNumber = registerDto.PhoneNumber,
                RoleId = registerDto.RoleId,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            var createdUser = await _userRepository.AddAsync(user);
            var token = GenerateJwtToken(createdUser);
            var userDto = MapToUserDto(createdUser);

            return new AuthResponseDto
            {
                Token = token,
                Expires = DateTime.UtcNow.AddHours(24),
                User = userDto
            };
        }

        public Task<bool> ValidateTokenAsync(string token)
        {
            // Basic token validation - in production, you'd want more robust validation
            return Task.FromResult(!string.IsNullOrEmpty(token));
        }

        private string GenerateJwtToken(User user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
                _configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key not configured")));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, $"{user.FirstName} {user.LastName}"),
                new Claim(ClaimTypes.Role, user.Role?.Name ?? "Patient")
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(24),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private static string HashPassword(string password)
        {
            // In production, use proper password hashing like BCrypt
            return Convert.ToBase64String(Encoding.UTF8.GetBytes(password)); // Temporary - replace with proper hashing
        }

        private static bool VerifyPassword(string password, string passwordHash)
        {
            // In production, use proper password verification
            return HashPassword(password) == passwordHash;
        }

        private static UserDto MapToUserDto(User user) => new()
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