using System.Text.Json;
using AirQualityMap.Api.DTOs;
using AirQualityMap.Api.Services.Contracts;

namespace AirQualityMap.Api.Services;

/// <summary>
/// Service for fetching measurements from external endpoints and syncing them with the database.
/// Maps external API responses to Measurement model and only saves newer measurements.
/// </summary>
public class ExternalMeasurementService : IExternalMeasurementService
{
    private readonly IStationService _stationService;
    private readonly IMeasurementService _measurementService;
    private readonly HttpClient _httpClient;
    private readonly ILogger<ExternalMeasurementService> _logger;

    public ExternalMeasurementService(
        IStationService stationService,
        IMeasurementService measurementService,
        HttpClient httpClient,
        ILogger<ExternalMeasurementService> logger)
    {
        _stationService = stationService;
        _measurementService = measurementService;
        _httpClient = httpClient;
        _logger = logger;
    }

    /// <summary>
    /// Fetches measurements from all stations with configured endpoints and saves them to the database.
    /// Only saves measurements that are newer than the most recent one in the database for each station.
    /// </summary>
    public async Task FetchAndSyncMeasurementsAsync()
    {
        try
        {
            var allStations = await _stationService.GetAllStationsAsync();
            var stationsWithEndpoints = allStations
                .Where(s => !string.IsNullOrEmpty(s.MeasurementEndpoint))
                .ToList();

            _logger.LogInformation("Starting measurement sync for {StationCount} stations", stationsWithEndpoints.Count);

            foreach (var station in stationsWithEndpoints)
            {
                await FetchAndSaveMeasurementForStationAsync(station);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during measurement synchronization");
        }
    }

    /// <summary>
    /// Fetches a single measurement from the station's endpoint and saves it if it's newer than the latest in the database.
    /// </summary>
    private async Task FetchAndSaveMeasurementForStationAsync(StationDto station)
    {
        try
        {
            if (station.Id is null)
            {
                _logger.LogWarning("Station has no ID. Skipping measurement fetch.");
                return;
            }

            var response = await _httpClient.GetAsync(station.MeasurementEndpoint);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Failed to fetch measurement from endpoint {Endpoint} for station {StationId}. Status: {StatusCode}",
                    station.MeasurementEndpoint, station.Id, response.StatusCode);
                return;
            }

            var jsonContent = await response.Content.ReadAsStringAsync();
            var externalMeasurement = ParseExternalMeasurement(jsonContent);

            if (externalMeasurement is null)
            {
                _logger.LogWarning("Failed to parse measurement response from station {StationId}", station.Id);
                return;
            }

            // Get the most recent measurement for this station
            var measurements = await _measurementService.GetMeasurementsByStationAsync(station.Id.Value);
            var latestMeasurement = measurements.FirstOrDefault();

            // Only save if the fetched measurement is newer
            if (latestMeasurement is not null && externalMeasurement.CreatedAt <= latestMeasurement.CreatedAt)
            {
                _logger.LogDebug("Measurement from station {StationId} is not newer than the latest. Skipping.", station.Id);
                return;
            }

            var measurementDto = new MeasurementDto
            {
                CreatedAt = externalMeasurement.CreatedAt,
                PM25 = externalMeasurement.PM25,
                PM10 = externalMeasurement.PM10,
                Temperature = externalMeasurement.Temperature,
                StationId = station.Id
            };

            await _measurementService.CreateMeasurementAsync(measurementDto);

            _logger.LogInformation("Saved measurement for station {StationId} with CreatedAt: {CreatedAt}",
                station.Id, measurementDto.CreatedAt);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching measurement from station {StationId}", station.Id);
        }
    }

    /// <summary>
    /// Parses the external API response and maps fields to the Measurement model.
    /// Maps: created_at -> CreatedAt, field2 -> PM25, field3 -> PM10, field4 -> Temperature
    /// </summary>
    private ExternalMeasurementData? ParseExternalMeasurement(string json)
    {
        try
        {
            using (JsonDocument doc = JsonDocument.Parse(json))
            {
                var root = doc.RootElement;

                if (!root.TryGetProperty("created_at", out var createdAtElement) ||
                    !root.TryGetProperty("field2", out var field2Element) ||
                    !root.TryGetProperty("field3", out var field3Element) ||
                    !root.TryGetProperty("field4", out var field4Element))
                {
                    return null;
                }

                if (!DateTime.TryParse(createdAtElement.GetString(), null, System.Globalization.DateTimeStyles.RoundtripKind, out var createdAt))
                {
                    return null;
                }

                var pm25 = ParseFloatField(field2Element);
                var pm10 = ParseFloatField(field3Element);
                var temperature = ParseFloatField(field4Element);

                return new ExternalMeasurementData
                {
                    CreatedAt = createdAt,
                    PM25 = pm25,
                    PM10 = pm10,
                    Temperature = temperature
                };
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error parsing external measurement JSON");
            return null;
        }
    }

    /// <summary>
    /// Parses a JSON element as a float value.
    /// </summary>
    private static float ParseFloatField(JsonElement element)
    {
        return element.ValueKind switch
        {
            JsonValueKind.String => float.TryParse(element.GetString(), out var floatValue) ? floatValue : 0f,
            JsonValueKind.Number => element.GetSingle(),
            _ => 0f
        };
    }

    /// <summary>
    /// Internal data class for holding parsed external measurement data.
    /// </summary>
    private class ExternalMeasurementData
    {
        public required DateTime CreatedAt { get; set; }
        public required float PM25 { get; set; }
        public required float PM10 { get; set; }
        public float? Temperature { get; set; }
    }
}
