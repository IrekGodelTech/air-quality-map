using AirQualityMap.Api.DTOs;

namespace AirQualityMap.Api.Services.Contracts;

/// <summary>
/// Service interface for managing station measurements with CRUD operations.
/// </summary>
public interface IMeasurementService
{
    /// <summary>
    /// Retrieves all measurements for a specific station.
    /// </summary>
    Task<IEnumerable<MeasurementDto>> GetMeasurementsByStationAsync(int stationId);
    
    /// <summary>
    /// Retrieves the most recent measurement for a specific station.
    /// </summary>
    Task<MeasurementDto?> GetLastMeasurementByStationAsync(int stationId);
    
    /// <summary>
    /// Retrieves a specific measurement by ID.
    /// </summary>
    Task<MeasurementDto?> GetMeasurementByIdAsync(int id);
    
    /// <summary>
    /// Creates a new measurement for a station.
    /// </summary>
    Task<MeasurementDto> CreateMeasurementAsync(MeasurementDto dto);
    
    /// <summary>
    /// Updates an existing measurement.
    /// </summary>
    Task<MeasurementDto?> UpdateMeasurementAsync(int id, MeasurementDto dto);
    
    /// <summary>
    /// Deletes a measurement by ID.
    /// </summary>
    Task<bool> DeleteMeasurementAsync(int id);
}
