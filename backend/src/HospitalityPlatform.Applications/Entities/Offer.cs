using System;
using HospitalityPlatform.Core.Entities;

namespace HospitalityPlatform.Applications.Entities;

public enum OfferStatus
{
    Pending = 1,
    Accepted = 2,
    Declined = 3,
    Withdrawn = 4
}

public class Offer : BaseEntity
{
    public Guid ApplicationId { get; set; }
    public decimal SalaryAmount { get; set; }
    public string SalaryCurrency { get; set; } = "GBP";
    public DateTime ProposedStartDate { get; set; }
    public string? Notes { get; set; }
    public OfferStatus Status { get; set; } = OfferStatus.Pending;
    public DateTime? DecidedAt { get; set; }
}
