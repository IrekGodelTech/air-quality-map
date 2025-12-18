using Microsoft.EntityFrameworkCore;
using AirQualityMap.Api.Data;
using AirQualityMap.Api.DTOs;
using AirQualityMap.Api.Models;
using AirQualityMap.Api.Services.Contracts;

namespace AirQualityMap.Api.Services;

/// <summary>
/// Service for managing station measurements with Entity Framework Core.
/// </summary>
public class MeasurementService : IMeasurementService
{
    private readonly AppDbContext _context;

    public MeasurementService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<MeasurementDto>> GetMeasurementsByStationAsync(int stationId)
    {
        var measurements = await _context.Measurements
            .Where(m => m.StationId == stationId)
            .OrderByDescending(m => m.CreatedAt)
            .Select(m => MapToDto(m))
            .ToListAsync();

        return measurements;
    }

    public async Task<MeasurementDto?> GetMeasurementByIdAsync(int id)
    {
        var measurement = await _context.Measurements.FindAsync(id);
        return measurement is null ? null : MapToDto(measurement);
    }

    public async Task<MeasurementDto> CreateMeasurementAsync(MeasurementDto dto)
    {
        // Validate station exists
        var stationExists = await _context.Stations.AnyAsync(s => s.Id == dto.StationId);
        if (!stationExists)
        {
            throw new InvalidOperationException($"Station with ID {dto.StationId} not found.");
        }

        var measurement = new Measurement
        {
            PM25 = dto.PM25,
            PM10 = dto.PM10,
            Temperature = dto.Temperature,
            StationId = dto.StationId ?? 0,
            CreatedAt = DateTime.UtcNow
        };

        _context.Measurements.Add(measurement);
        await _context.SaveChangesAsync();

        return MapToDto(measurement);
    }

    public async Task<MeasurementDto?> UpdateMeasurementAsync(int id, MeasurementDto dto)
    {
        var measurement = await _context.Measurements.FindAsync(id);
        if (measurement is null)
        {
            return null;
        }

        measurement.PM25 = dto.PM25;
        measurement.PM10 = dto.PM10;
        measurement.Temperature = dto.Temperature;

        _context.Measurements.Update(measurement);
        await _context.SaveChangesAsync();

        return MapToDto(measurement);
    }

    public async Task<bool> DeleteMeasurementAsync(int id)
    {
        var measurement = await _context.Measurements.FindAsync(id);
        if (measurement is null)
        {
            return false;
        }

        _context.Measurements.Remove(measurement);
        await _context.SaveChangesAsync();

        return true;
    }

    private static MeasurementDto MapToDto(Measurement measurement)
    {
        return new MeasurementDto
        {
            Id = measurement.Id,
            CreatedAt = measurement.CreatedAt,
            PM25 = measurement.PM25,
            PM10 = measurement.PM10,
            Temperature = measurement.Temperature,
            StationId = measurement.StationId
        };
    }
}
