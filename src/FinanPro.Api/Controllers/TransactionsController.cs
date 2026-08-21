using FinanPro.Application.DTOs;
using FinanPro.Application.Services;
using FinanPro.Domain.Entities;
using FinanPro.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinanPro.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TransactionsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly PlanValidationService _planValidationService;

    public TransactionsController(ApplicationDbContext context, PlanValidationService planValidationService)
    {
        _context = context;
        _planValidationService = planValidationService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var transactions = await _context.Transactions
            .Include(t => t.Account)
            .Include(t => t.Category)
            .OrderByDescending(t => t.Date)
            .Select(t => new TransactionResponseDto(
                t.Id, t.Description, t.Amount, t.Type,
                t.Account.Name, t.Category.Name, t.Date))
            .ToListAsync();

        return Ok(transactions);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTransactionDto dto)
    {
        // 1. Busca a conta ignorando o filtro para recuperar o TenantId real dela
        var account = await _context.Accounts
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(a => a.Id == dto.AccountId);

        if (account == null) return BadRequest("Conta não encontrada.");

        // 2. Busca o Tenant para validar a assinatura
        var tenant = await _context.Tenants
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(t => t.Id == account.TenantId);

        if (tenant == null) return BadRequest("Tenant não localizado.");

        bool isPro = string.Equals(tenant.SubscriptionStatus, "PRO", StringComparison.OrdinalIgnoreCase);

        // 3. Validação do limite FREE
        if (!isPro)
        {
            var totalTransactions = await _context.Transactions
                .IgnoreQueryFilters()
                .CountAsync(t => t.AccountId == dto.AccountId);

            if (totalTransactions >= 5)
            {
                return BadRequest("Você atingiu o limite de 5 transações do Plano FREE. Faça o upgrade para o Plano PRO!");
            }
        }

        var transactionDate = dto.Date != default && dto.Date > new DateTime(1900, 1, 1)
            ? dto.Date
            : DateTime.UtcNow;

        // 4. Criação da transação vinculando o TenantId correto
        var transaction = new Transaction
        {
            Id = Guid.NewGuid(),
            TenantId = account.TenantId,
            Description = dto.Description,
            Amount = dto.Amount,
            Type = dto.Type,
            AccountId = dto.AccountId,
            CategoryId = dto.CategoryId,
            Date = transactionDate
        };

        if ((int)dto.Type == 0)
        {
            account.Balance += dto.Amount;
        }
        else
        {
            account.Balance -= dto.Amount;
        }

        _context.Transactions.Add(transaction);
        await _context.SaveChangesAsync();

        return Ok(transaction);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        // 1. Busca a transação existente junto com a conta relacionada
        var transaction = await _context.Transactions.FindAsync(id);
        if (transaction == null)
        {
            return NotFound("Transação não encontrada.");
        }

        var account = await _context.Accounts.FindAsync(transaction.AccountId);
        if (account != null)
        {
            // 2. Reverte o saldo na conta de acordo com o tipo deletado
            // Se era Receita (0), subtrai o valor devolvido.
            // Se era Despesa (1), devolve/soma o valor de volta.
            if ((int)transaction.Type == 0)
            {
                account.Balance -= transaction.Amount;
            }
            else
            {
                account.Balance += transaction.Amount;
            }
        }

        // 3. Remove a transação e salva as alterações
        _context.Transactions.Remove(transaction);
        await _context.SaveChangesAsync();

        return NoContent(); // Retorna HTTP 204
    }
}