using HospitalityPlatform.Applications.Entities;
using System;

namespace HospitalityPlatform.Applications.DTOs;

public class InterviewDto
{
    public Guid Id { get; set; }
    public Guid ApplicationId { get; set; }
    public DateTime ScheduledAt { get; set; }
    public string Type { get; set; } = string.Empty;
    public string? MeetingLink { get; set; }
    public string? Location { get; set; }
    public string? Notes { get; set; }
    public string? Feedback { get; set; }
    public bool IsCompleted { get; set; }
}

public class CreateInterviewDto
{
    public Guid ApplicationId { get; set; }
    public DateTime ScheduledAt { get; set; }
    public string Type { get; set; } = "In-Person";
    public string? MeetingLink { get; set; }
    public string? Location { get; set; }
    public string? Notes { get; set; }
}

public class UpdateInterviewFeedbackDto
{
    public string? Feedback { get; set; }
    public bool IsCompleted { get; set; }
}

public class OfferDto
{
    public Guid Id { get; set; }
    public Guid ApplicationId { get; set; }
    public decimal SalaryAmount { get; set; }
    public string SalaryCurrency { get; set; } = "GBP";
    public DateTime ProposedStartDate { get; set; }
    public string? Notes { get; set; }
    public OfferStatus Status { get; set; }
    public DateTime? DecidedAt { get; set; }
}

public class CreateOfferDto
{
    public Guid ApplicationId { get; set; }
    public decimal SalaryAmount { get; set; }
    public string SalaryCurrency { get; set; } = "GBP";
    public DateTime ProposedStartDate { get; set; }
    public string? Notes { get; set; }
}

public class DecideOfferDto
{
    public bool Accept { get; set; }
}
