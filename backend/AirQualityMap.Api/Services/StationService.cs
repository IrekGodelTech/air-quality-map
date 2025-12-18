using Microsoft.EntityFrameworkCore;
using AirQualityMap.Api.Data;
using AirQualityMap.Api.DTOs;
using AirQualityMap.Api.Models;
using AirQualityMap.Api.Services.Contracts;

namespace AirQualityMap.Api.Services;

/// <summary>
/// Service for managing air quality stations with Entity Framework Core.
/// </summary>
public class StationService : IStationService
{
    private readonly AppDbContext _context;

    public StationService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<StationDto>> GetAllStationsAsync()
    {
        var stations = await _context.Stations
            .Select(s => MapToDto(s))
            .ToListAsync();

        return stations;
    }

    public async Task<StationDto?> GetStationByIdAsync(int id)
    {
        var station = await _context.Stations.FindAsync(id);
        return station is null ? null : MapToDto(station);
    }

    public async Task<StationDto> CreateStationAsync(StationDto dto, int userId)
    {
        var station = new AirQualityStation
        {
            Name = dto.Name,
            Description = dto.Description,
            Latitude = dto.Latitude,
            Longitude = dto.Longitude,
            MeasurementEndpoint = dto.MeasurementEndpoint,
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Stations.Add(station);
        await _context.SaveChangesAsync();

        return MapToDto(station);
    }

    public async Task<StationDto?> UpdateStationAsync(int id, StationDto dto, int userId)
    {
        var station = await _context.Stations.FindAsync(id);
        if (station is null || station.UserId != userId)
        {
            return null;
        }

        station.Name = dto.Name;
        station.Description = dto.Description;
        station.Latitude = dto.Latitude;
        station.Longitude = dto.Longitude;
        station.MeasurementEndpoint = dto.MeasurementEndpoint;

        _context.Stations.Update(station);
        await _context.SaveChangesAsync();

        return MapToDto(station);
    }

    public async Task<bool> DeleteStationAsync(int id, int userId)
    {
        var station = await _context.Stations.FindAsync(id);
        if (station is null || station.UserId != userId)
        {
            return false;
        }

        _context.Stations.Remove(station);
        await _context.SaveChangesAsync();

        return true;
    }

    private static StationDto MapToDto(AirQualityStation station)
    {
        return new StationDto
        {
            Id = station.Id,
            Name = station.Name,
            Description = station.Description,
            Latitude = station.Latitude,
            Longitude = station.Longitude,
            MeasurementEndpoint = station.MeasurementEndpoint,
            CreatedAt = station.CreatedAt
        };
    }
}
