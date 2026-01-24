using HospitalityPlatform.Ratings.DTOs;
using HospitalityPlatform.Ratings.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HospitalityPlatform.Ratings.Controllers;

[ApiController]
[Route("api/ratings")]
[Authorize]
public class UserRatingsController : ControllerBase
{
    private readonly IUserRatingsService _ratingsService;

    public UserRatingsController(IUserRatingsService ratingsService)
    {
        _ratingsService = ratingsService;
    }

    [HttpPost]
    public async Task<ActionResult<UserRatingDto>> CreateRating(CreateUserRatingDto dto)
    {
        try
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(userIdString, out var userId))
                return Unauthorized();

            var result = await _ratingsService.CreateRatingAsync(dto, userId);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while creating rating" });
        }
    }

    [HttpGet("{entityId}")]
    public async Task<ActionResult<List<UserRatingDto>>> GetRatings(Guid entityId)
    {
        var result = await _ratingsService.GetRatingsForEntityAsync(entityId);
        return Ok(result);
    }
    
    [HttpGet("{entityId}/average")]
    public async Task<ActionResult<double>> GetAverage(Guid entityId)
    {
        var result = await _ratingsService.GetAverageRatingAsync(entityId);
        return Ok(new { average = result });
    }
}
