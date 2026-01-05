using System.ComponentModel.DataAnnotations;

namespace AirQualityMap.Api.DTOs;

/// <summary>
/// Data Transfer Object for updating user profile information.
/// </summary>
public class UpdateUserDto
{
    [StringLength(50, MinimumLength = 3)]
    public string? Username { get; set; }

    [EmailAddress]
    public string? Email { get; set; }
}
