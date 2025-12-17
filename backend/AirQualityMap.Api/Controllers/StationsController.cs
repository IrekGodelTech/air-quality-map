using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using AirQualityMap.Api.Data;
using AirQualityMap.Api.DTOs;
using AirQualityMap.Api.Models;

namespace AirQualityMap.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StationsController : ControllerBase
{
    private readonly AppDbContext _context;

    public StationsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<StationDto>>> GetStations()
    {
        var stations = await _context.Stations
            .Select(s => new StationDto
            {
                Id = s.Id,
                Name = s.Name,
                Description = s.Description,
                Latitude = s.Latitude,
                Longitude = s.Longitude,
                MeasurementEndpoint = s.MeasurementEndpoint,
                CreatedAt = s.CreatedAt
            })
            .ToListAsync();

        return Ok(stations);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<StationDto>> GetStation(int id)
    {
        var station = await _context.Stations.FindAsync(id);

        if (station == null)
        {
            return NotFound();
        }

        return Ok(new StationDto
        {
            Id = station.Id,
            Name = station.Name,
            Description = station.Description,
            Latitude = station.Latitude,
            Longitude = station.Longitude,
            MeasurementEndpoint = station.MeasurementEndpoint,
            CreatedAt = station.CreatedAt
        });
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<StationDto>> CreateStation(StationDto dto)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var station = new AirQualityStation
        {
            Name = dto.Name,
            Description = dto.Description,
            Latitude = dto.Latitude,
            Longitude = dto.Longitude,
            MeasurementEndpoint = dto.MeasurementEndpoint,
            UserId = userId
        };

        _context.Stations.Add(station);
        await _context.SaveChangesAsync();

        dto.Id = station.Id;
        dto.CreatedAt = station.CreatedAt;

        return CreatedAtAction(nameof(GetStation), new { id = station.Id }, dto);
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateStation(int id, StationDto dto)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var station = await _context.Stations.FindAsync(id);

        if (station == null)
        {
            return NotFound();
        }

        if (station.UserId != userId)
        {
            return Forbid();
        }

        station.Name = dto.Name;
        station.Description = dto.Description;
        station.Latitude = dto.Latitude;
        station.Longitude = dto.Longitude;
        station.MeasurementEndpoint = dto.MeasurementEndpoint;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteStation(int id)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var station = await _context.Stations.FindAsync(id);

        if (station == null)
        {
            return NotFound();
        }

        if (station.UserId != userId)
        {
            return Forbid();
        }

        _context.Stations.Remove(station);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
