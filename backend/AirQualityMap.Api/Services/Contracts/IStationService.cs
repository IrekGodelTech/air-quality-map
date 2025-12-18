using AirQualityMap.Api.DTOs;

namespace AirQualityMap.Api.Services.Contracts;

/// <summary>
/// Service interface for managing air quality stations with CRUD operations.
/// </summary>
public interface IStationService
{
    /// <summary>
    /// Retrieves all stations.
    /// </summary>
    Task<IEnumerable<StationDto>> GetAllStationsAsync();
    
    /// <summary>
    /// Retrieves a specific station by ID.
    /// </summary>
    Task<StationDto?> GetStationByIdAsync(int id);
    
    /// <summary>
    /// Creates a new station for the authenticated user.
    /// </summary>
    Task<StationDto> CreateStationAsync(StationDto dto, int userId);
    
    /// <summary>
    /// Updates an existing station.
    /// </summary>
    Task<StationDto?> UpdateStationAsync(int id, StationDto dto, int userId);
    
    /// <summary>
    /// Deletes a station by ID.
    /// </summary>
    Task<bool> DeleteStationAsync(int id, int userId);
}
