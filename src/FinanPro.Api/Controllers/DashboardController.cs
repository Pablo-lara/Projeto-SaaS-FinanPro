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
public class DashboardController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public DashboardController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("overview")]
    public async Task<ActionResult<DashboardOverviewDto>> GetOverview()
    {
        // 1. Saldo Total
        var currentBalance = await _context.Accounts
            .SumAsync(a => (decimal?)a.Balance) ?? 0m;

        // 2. Transações do mês atual
        var now = DateTime.UtcNow;
        var transactions = await _context.Transactions
            .Include(t => t.Category) // Inclui a Categoria para poder agrupar depois
            .Where(t => t.Date.Year == now.Year && t.Date.Month == now.Month)
            .ToListAsync();

        // 3. Totais de Receitas e Despesas
        var totalIncome = transactions
            .Where(t => t.Type == TransactionType.Income)
            .Sum(t => t.Amount);

        var totalExpenses = transactions
            .Where(t => t.Type == TransactionType.Expense)
            .Sum(t => t.Amount);

        // 4. Agrupamento de Despesas por Categoria para o quarto parâmetro do DTO
        var expensesByCategory = transactions
            .Where(t => t.Type == TransactionType.Expense && t.Category != null)
            .GroupBy(t => t.Category!.Name)
            .Select(g => new CategorySummaryDto(
                g.Key,
                g.Sum(t => t.Amount)
            ))
            .ToList();

        // 5. Instanciação do DTO via Construtor Posicional
        var overview = new DashboardOverviewDto(
            currentBalance,
            totalIncome,
            totalExpenses,
            expensesByCategory
        );

        return Ok(overview);
    }
}