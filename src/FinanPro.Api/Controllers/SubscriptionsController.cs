using FinanPro.Application.Common.Interfaces;
using FinanPro.Application.DTOs;
using FinanPro.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinanPro.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class SubscriptionsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ITenantProvider _tenantProvider;

    public SubscriptionsController(ApplicationDbContext context, ITenantProvider tenantProvider)
    {
        _context = context;
        _tenantProvider = tenantProvider;
    }

    [HttpGet("status")]
    public async Task<IActionResult> GetStatus()
    {
        var tenantId = _tenantProvider.GetTenantId();

        var tenant = await _context.Tenants
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(t => t.Id == tenantId);

        if (tenant == null) return NotFound("Empresa não encontrada.");

        var isPro = tenant.SubscriptionStatus == "PRO";
        return Ok(new TenantSubscriptionStatusDto(
            isPro ? "PRO" : "FREE",
            tenant.Id.ToString(),
            isPro
        ));
    }

    [HttpPost("simulate-checkout")]
    public async Task<IActionResult> SimulateCheckout([FromBody] SubscribeRequestDto dto)
    {
        var tenantId = _tenantProvider.GetTenantId();

        // Em produção, isso geraria uma URL de checkout no Stripe/Asaas.
        // Na simulação, retornamos o payload exato para testar o Webhook.
        var mockWebhookPayload = new WebhookEventDto(
            EventType: "payment_intent.succeeded",
            TenantId: tenantId.ToString(),
            PlanName: dto.PlanName,
            Status: "PRO"
        );

        return Ok(new
        {
            Message = "Simulação de Checkout iniciada com sucesso.",
            Instructions = "Dispare o endpoint POST /api/subscriptions/webhook usando a payload abaixo para simular a confirmação do pagamento.",
            WebhookPayloadToTest = mockWebhookPayload
        });
    }
}