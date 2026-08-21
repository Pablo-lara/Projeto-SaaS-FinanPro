using System.Security.Claims;
using FinanPro.Application.DTOs;
using FinanPro.Domain.Entities;
using FinanPro.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinanPro.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class AccountsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AccountsController(ApplicationDbContext context) => _context = context;

    // Método auxiliar para extrair o TenantId das Claims do Token JWT do usuário logado
    private Guid GetCurrentTenantId()
    {
        var tenantClaim = User.FindFirst("tenantId")?.Value
                       ?? User.FindFirst("TenantId")?.Value
                       ?? User.FindFirst(ClaimTypes.GroupSid)?.Value
                       ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (Guid.TryParse(tenantClaim, out var tenantId))
        {
            return tenantId;
        }

        return Guid.Empty;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var accounts = await _context.Accounts
            .Select(a => new AccountResponseDto(a.Id, a.Name, a.Balance))
            .ToListAsync();

        return Ok(accounts);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAccountDto dto)
    {
        var currentTenantId = GetCurrentTenantId();

        if (currentTenantId == Guid.Empty)
        {
            return BadRequest("Não foi possível identificar o Tenant no token de autenticação.");
        }

        var account = new Account
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            Balance = dto.InitialBalance,
            TenantId = currentTenantId // Associa a nova conta ao Tenant correto do usuário logado
        };

        _context.Accounts.Add(account);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAll), new AccountResponseDto(account.Id, account.Name, account.Balance));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var account = await _context.Accounts.FirstOrDefaultAsync(a => a.Id == id);
        if (account == null) return NotFound();

        _context.Accounts.Remove(account);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}