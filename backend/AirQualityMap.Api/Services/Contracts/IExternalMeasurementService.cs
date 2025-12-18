namespace AirQualityMap.Api.Services.Contracts;

/// <summary>
/// Service for fetching and syncing air quality measurements from external endpoints.
/// </summary>
public interface IExternalMeasurementService
{
    /// <summary>
    /// Fetches measurements from all stations with configured endpoints and saves them to the database.
    /// Only saves measurements that are newer than the most recent one in the database.
    /// </summary>
    Task FetchAndSyncMeasurementsAsync();
}
