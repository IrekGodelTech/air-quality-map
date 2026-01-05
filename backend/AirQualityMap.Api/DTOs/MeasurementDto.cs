using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace AirQualityMap.Api.DTOs;

/// <summary>
/// Data Transfer Object for air quality measurement data.
/// </summary>
public class MeasurementDto
{
    public int? Id { get; set; }

    public DateTime? CreatedAt { get; set; }

    [Required]
    [Range(0, int.MaxValue)]
    [JsonPropertyName("PM25")]
    public int PM25 { get; set; }

    [Required]
    [Range(0, int.MaxValue)]
    [JsonPropertyName("PM10")]
    public int PM10 { get; set; }

    [Range(-50, 60)]
    public float? Temperature { get; set; }

    public int? StationId { get; set; }
}
