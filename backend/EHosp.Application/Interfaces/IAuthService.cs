using EHosp.Application.DTOs;

namespace EHosp.Application.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponseDto> LoginAsync(LoginDto loginDto);
        Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto);
        Task<bool> ValidateTokenAsync(string token);
    }
}