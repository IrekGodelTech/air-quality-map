using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using AirQualityMap.Api.DTOs;
using AirQualityMap.Api.Services.Contracts;

namespace AirQualityMap.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StationsController : ControllerBase
{
    private readonly IStationService _stationService;

    public StationsController(IStationService stationService)
    {
        _stationService = stationService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<StationDto>>> GetStations()
    {
        var stations = await _stationService.GetAllStationsAsync();
        return Ok(stations);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<StationDto>> GetStation(int id)
    {
        var station = await _stationService.GetStationByIdAsync(id);
        if (station is null)
        {
            return NotFound();
        }

        return Ok(station);
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<StationDto>> CreateStation(StationDto dto)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim is null || !int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var station = await _stationService.CreateStationAsync(dto, userId);
        return CreatedAtAction(nameof(GetStation), new { id = station.Id }, station);
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateStation(int id, StationDto dto)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim is null || !int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var updated = await _stationService.UpdateStationAsync(id, dto, userId);
        if (updated is null)
        {
            return Forbid();
        }

        return NoContent();
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteStation(int id)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim is null || !int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var deleted = await _stationService.DeleteStationAsync(id, userId);
        if (!deleted)
        {
            return Forbid();
        }

        return NoContent();
    }
}
