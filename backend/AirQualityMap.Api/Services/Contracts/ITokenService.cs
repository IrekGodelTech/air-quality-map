using AirQualityMap.Api.Models;

namespace AirQualityMap.Api.Services.Contracts;

public interface ITokenService
{
    string GenerateToken(User user);
}
