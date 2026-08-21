namespace FinanPro.Application.DTOs;

public record SubscribeRequestDto(string PlanName);

public record WebhookEventDto(
    string EventType,
    string TenantId,
    string PlanName,
    string Status
);

public record TenantSubscriptionStatusDto(
    string PlanName,
    string SubscriptionStatus,
    bool IsPro
);