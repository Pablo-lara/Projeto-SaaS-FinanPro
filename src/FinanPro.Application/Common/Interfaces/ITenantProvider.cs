namespace FinanPro.Application.Common.Interfaces;

public interface ITenantProvider
{
    Guid GetTenantId();
}