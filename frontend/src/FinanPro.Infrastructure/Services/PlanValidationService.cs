using FinanPro.Application.Common.Interfaces;
using FinanPro.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FinanPro.Application.Services;

public class PlanValidationService
{
    private readonly ApplicationDbContext _context;
    private readonly ITenantProvider _tenantProvider;

    public PlanValidationService(ApplicationDbContext context, ITenantProvider tenantProvider)
    {
        _context = context;
        _tenantProvider = tenantProvider;
    }

    public async Task<bool> CanCreateTransactionAsync()
    {
        var tenantId = _tenantProvider.GetTenantId();

        // Ignora filtro global para buscar dados da empresa/plano
        var tenant = await _context.Tenants
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(t => t.Id == tenantId);

        if (tenant == null) return false;

        // Se for PRO (ou simulação de assinatura ativa), não há limites
        if (tenant.SubscriptionStatus == "PRO") return true;

        // Regra do Plano FREE: Máximo 100 lançamentos no mês vigente
        var now = DateTime.UtcNow;
        var firstDayOfMonth = new DateTime(now.Year, now.Month, 1);
        var lastDayOfMonth = firstDayOfMonth.AddMonths(1).AddDays(-1);

        var monthlyTransactionsCount = await _context.Transactions
            .CountAsync(t => t.Date >= firstDayOfMonth && t.Date <= lastDayOfMonth);

        return monthlyTransactionsCount < 100;
    }
}