namespace AirQualityMap.Api.Models;

/// <summary>
/// Represents a single air quality measurement reading from a station.
/// </summary>
public class Measurement
{
    public int Id { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    /// <summary>
    /// PM2.5 particulate matter concentration in µg/m³.
    /// </summary>
    public float PM25 { get; set; }
    
    /// <summary>
    /// PM10 particulate matter concentration in µg/m³.
    /// </summary>
    public float PM10 { get; set; }
    
    /// <summary>
    /// Temperature in Celsius. Can be null if not available.
    /// </summary>
    public float? Temperature { get; set; }
    
    public int StationId { get; set; }
    public AirQualityStation Station { get; set; } = null!;
}
