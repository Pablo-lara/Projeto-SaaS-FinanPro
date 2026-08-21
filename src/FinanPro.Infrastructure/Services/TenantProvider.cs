using FinanPro.Application.Common.Interfaces;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

public class TenantProvider : ITenantProvider
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public TenantProvider(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid GetTenantId()
    {
            var user = _httpContextAccessor.HttpContext?.User;

            if (user == null || !user.Identity.IsAuthenticated)
            {
                return Guid.Empty;
            }

            // Busca a claim por diferentes nomes padrões
            var tenantClaim = user.FindFirst("tenantId")?.Value
                           ?? user.FindFirst("TenantId")?.Value
                           ?? user.FindFirst(ClaimTypes.GroupSid)?.Value
                           ?? user.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (Guid.TryParse(tenantClaim, out var parsedGuid))
            {
                return parsedGuid;
            }

            return Guid.Empty;
    }
}