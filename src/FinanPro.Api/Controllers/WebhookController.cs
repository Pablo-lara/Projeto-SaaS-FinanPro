using FinanPro.Application.DTOs;
using FinanPro.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinanPro.Api.Controllers;

[AllowAnonymous]
[ApiController]
[Route("api/[controller]")]
public class WebhookController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;

    public WebhookController(ApplicationDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    [HttpPost("payment")]
    public async Task<IActionResult> HandlePaymentWebhook(
        [FromBody] WebhookEventDto payload,
        [FromHeader(Name = "X-Webhook-Secret")] string? webhookSecret)
    {
        // 1. Simulação de validação de assinatura HMAC/Secret do Gateway
        var expectedSecret = _configuration["WebhookSettings:Secret"] ?? "finanpro_webhook_secret_2026";

        if (webhookSecret != expectedSecret)
        {
            return Unauthorized("Assinatura do Webhook inválida.");
        }




        // 2. Processar alteração de plano
        if (payload.EventType == "payment_intent.succeeded")
        {
            if (!Guid.TryParse(payload.TenantId, out var tenantGuid))
            {
                return BadRequest("O formato do TenantId informado é inválido.");
            }

            var tenant = await _context.Tenants
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(t => t.Id == tenantGuid);

            if (tenant == null) return NotFound("Tenant informado não existe.");

            // Atualiza o plano da empresa para PRO
            tenant.SubscriptionStatus = "PRO";
            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = $"Assinatura confirmada com sucesso! O Tenant {tenant.Name} agora é plano PRO.",
                TenantId = tenant.Id,
                NewStatus = tenant.SubscriptionStatus
            });
        }

        return BadRequest("Tipo de evento não suportado.");
    }
}