using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FinanPro.Application.DTOs;
using FinanPro.Domain.Entities;
using FinanPro.Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace FinanPro.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthController(
        UserManager<ApplicationUser> userManager,
        ApplicationDbContext context,
        IConfiguration configuration)
    {
        _userManager = userManager;
        _context = context;
        _configuration = configuration;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        // 1. Criar o Tenant (Empresa)
        var tenant = new Tenant
        {
            Name = dto.CompanyName,
            SubscriptionStatus = "Active"
        };

        _context.Tenants.Add(tenant);
        await _context.SaveChangesAsync();

        // 2. Criar o Usuário associado ao Tenant
        var user = new ApplicationUser
        {
            UserName = dto.Email,
            Email = dto.Email,
            FullName = dto.FullName,
            TenantId = tenant.Id
        };

        var result = await _userManager.CreateAsync(user, dto.Password);

        if (!result.Succeeded)
            return BadRequest(result.Errors);

        var token = GenerateJwtToken(user, dto.CompanyName);

        return Ok(new AuthResponseDto(token, user.FullName, user.Email!, dto.CompanyName));
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email);

        if (user == null || !await _userManager.CheckPasswordAsync(user, dto.Password))
            return Unauthorized("E-mail ou senha inválidos.");

        var tenant = await _context.Tenants.FindAsync(user.TenantId);

        var token = GenerateJwtToken(user, tenant?.Name ?? "Minha Empresa");

        return Ok(new AuthResponseDto(token, user.FullName, user.Email!, tenant?.Name ?? "Minha Empresa"));
    }

    private string GenerateJwtToken(ApplicationUser user, string companyName)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var key = Encoding.UTF8.GetBytes(jwtSettings["Secret"]!);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Email, user.Email!),
            new Claim("TenantId", user.TenantId.ToString()),
            new Claim("CompanyName", companyName)
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddHours(double.Parse(jwtSettings["ExpiryInHours"]!)),
            Issuer = jwtSettings["Issuer"],
            Audience = jwtSettings["Audience"],
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);

        return tokenHandler.WriteToken(token);
    }
}