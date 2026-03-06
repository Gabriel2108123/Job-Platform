using HospitalityPlatform.Messaging.DTOs;
using HospitalityPlatform.Messaging.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HospitalityPlatform.Messaging.Services;

public class MessageTemplateService : IMessageTemplateService
{
    private readonly IMessagingDbContext _dbContext;
    private readonly ILogger<MessageTemplateService> _logger;

    public MessageTemplateService(
        IMessagingDbContext dbContext,
        ILogger<MessageTemplateService> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task<MessageTemplateDto> CreateTemplateAsync(Guid organizationId, CreateMessageTemplateDto dto, string userId)
    {
        var template = new MessageTemplate
        {
            Id = Guid.NewGuid(),
            OrganizationId = organizationId,
            Name = dto.Name,
            Subject = dto.Subject,
            Content = dto.Content,
            CreatorUserId = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _dbContext.MessageTemplates.Add(template);
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Message template {TemplateId} created for organization {OrgId} by user {UserId}", 
            template.Id, organizationId, userId);

        return MapToDto(template);
    }

    public async Task<MessageTemplateDto?> GetTemplateAsync(Guid organizationId, Guid templateId)
    {
        var template = await _dbContext.MessageTemplates
            .FirstOrDefaultAsync(t => t.Id == templateId && t.OrganizationId == organizationId);

        return template != null ? MapToDto(template) : null;
    }

    public async Task<IEnumerable<MessageTemplateDto>> GetOrganizationTemplatesAsync(Guid organizationId)
    {
        var templates = await _dbContext.MessageTemplates
            .Where(t => t.OrganizationId == organizationId)
            .OrderBy(t => t.Name)
            .ToListAsync();

        return templates.Select(MapToDto);
    }

    public async Task<MessageTemplateDto> UpdateTemplateAsync(Guid organizationId, Guid templateId, UpdateMessageTemplateDto dto, string userId)
    {
        var template = await _dbContext.MessageTemplates
            .FirstOrDefaultAsync(t => t.Id == templateId && t.OrganizationId == organizationId);

        if (template == null)
        {
            throw new InvalidOperationException("Message template not found");
        }

        template.Name = dto.Name;
        template.Subject = dto.Subject;
        template.Content = dto.Content;
        template.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Message template {TemplateId} updated by user {UserId}", templateId, userId);

        return MapToDto(template);
    }

    public async Task DeleteTemplateAsync(Guid organizationId, Guid templateId, string userId)
    {
        var template = await _dbContext.MessageTemplates
            .FirstOrDefaultAsync(t => t.Id == templateId && t.OrganizationId == organizationId);

        if (template == null) return;

        _dbContext.MessageTemplates.Remove(template);
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Message template {TemplateId} deleted by user {UserId}", templateId, userId);
    }

    private MessageTemplateDto MapToDto(MessageTemplate template)
    {
        return new MessageTemplateDto
        {
            Id = template.Id,
            Name = template.Name,
            Subject = template.Subject,
            Content = template.Content,
            CreatorUserId = template.CreatorUserId,
            CreatedAt = template.CreatedAt,
            UpdatedAt = template.UpdatedAt ?? DateTime.UtcNow
        };
    }
}
