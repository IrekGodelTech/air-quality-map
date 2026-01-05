using System.ComponentModel.DataAnnotations;

namespace AirQualityMap.Api.DTOs;

/// <summary>
/// Data Transfer Object for changing user password.
/// </summary>
public class ChangePasswordDto
{
    [Required]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required]
    [StringLength(100, MinimumLength = 6)]
    public string NewPassword { get; set; } = string.Empty;
}
