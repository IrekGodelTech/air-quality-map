using AirQualityMap.Api.Models;

namespace AirQualityMap.Api.Services;

public interface ITokenService
{
    string GenerateToken(User user);
}
