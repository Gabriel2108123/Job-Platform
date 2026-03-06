using HospitalityPlatform.Messaging.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HospitalityPlatform.Messaging.Services;

public interface IMessageTemplateService
{
    Task<MessageTemplateDto> CreateTemplateAsync(Guid organizationId, CreateMessageTemplateDto dto, string userId);
    Task<MessageTemplateDto?> GetTemplateAsync(Guid organizationId, Guid templateId);
    Task<IEnumerable<MessageTemplateDto>> GetOrganizationTemplatesAsync(Guid organizationId);
    Task<MessageTemplateDto> UpdateTemplateAsync(Guid organizationId, Guid templateId, UpdateMessageTemplateDto dto, string userId);
    Task DeleteTemplateAsync(Guid organizationId, Guid templateId, string userId);
}
