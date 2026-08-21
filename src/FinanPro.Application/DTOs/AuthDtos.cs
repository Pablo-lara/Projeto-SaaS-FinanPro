namespace FinanPro.Application.DTOs;

public record RegisterDto(string FullName, string Email, string Password, string CompanyName);

public record LoginDto(string Email, string Password);

public record AuthResponseDto(string Token, string FullName, string Email, string CompanyName);