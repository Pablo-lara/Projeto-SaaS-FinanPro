using FinanPro.Domain.Entities;
using System.Text.Json.Serialization;

namespace FinanPro.Application.DTOs;

// Contas e Categorias
public record CreateAccountDto(string Name, decimal InitialBalance);
public record AccountResponseDto(Guid Id, string Name, decimal Balance);

public record CreateCategoryDto(string Name, TransactionType Type);
public record CategoryResponseDto(Guid Id, string Name, TransactionType Type);

// Transações
public record CreateTransactionDto(
    string Description,
    decimal Amount,
    TransactionType Type,
    Guid AccountId,
    Guid CategoryId,
    [property: JsonPropertyName("date")] DateTime Date
);

public record TransactionResponseDto(
    Guid Id,
    string Description,
    decimal Amount,
    TransactionType Type,
    string AccountName,
    string CategoryName,
    DateTime Date
);