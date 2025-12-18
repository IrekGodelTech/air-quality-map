using System.ComponentModel.DataAnnotations;

namespace AirQualityMap.Api.DTOs;

/// <summary>
/// Data Transfer Object for air quality measurement data.
/// </summary>
public class MeasurementDto
{
    public int? Id { get; set; }
    
    public DateTime? CreatedAt { get; set; }
    
    [Required]
    [Range(0, float.MaxValue)]
    public float PM25 { get; set; }
    
    [Required]
    [Range(0, float.MaxValue)]
    public float PM10 { get; set; }
    
    [Range(-50, 60)]
    public float? Temperature { get; set; }
    
    public int? StationId { get; set; }
}
