using System.ComponentModel.DataAnnotations;

namespace AirQualityMap.Api.DTOs;

public class StationDto
{
    public int? Id { get; set; }
    
    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string Name { get; set; } = string.Empty;
    
    [StringLength(500)]
    public string Description { get; set; } = string.Empty;
    
    [Required]
    [Range(-90, 90)]
    public double Latitude { get; set; }
    
    [Required]
    [Range(-180, 180)]
    public double Longitude { get; set; }
    
    [Required]
    [Url]
    public string MeasurementEndpoint { get; set; } = string.Empty;
    
    public DateTime? CreatedAt { get; set; }
}
