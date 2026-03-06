using HospitalityPlatform.Applications.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HospitalityPlatform.Applications.Services;

public interface IInterviewService
{
    Task<InterviewDto> ScheduleInterviewAsync(Guid organizationId, CreateInterviewDto dto, string userId);
    Task<InterviewDto?> GetInterviewAsync(Guid organizationId, Guid interviewId);
    Task<IEnumerable<InterviewDto>> GetApplicationInterviewsAsync(Guid organizationId, Guid applicationId);
    Task<InterviewDto> UpdateFeedbackAsync(Guid organizationId, Guid interviewId, UpdateInterviewFeedbackDto dto, string userId);
    Task DeleteInterviewAsync(Guid organizationId, Guid interviewId, string userId);
}
