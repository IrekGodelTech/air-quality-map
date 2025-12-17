using System.IdentityModel.Tokens.Jwt;
using AirQualityMap.Api.Models;
using AirQualityMap.Api.Services;
using Microsoft.Extensions.Configuration;
using Moq;

namespace AirQualityMap.Api.Tests.Services;

/// <summary>
/// Unit tests for the TokenService class, which handles JWT token generation.
/// Tests validate token creation, claims population, and configuration handling.
/// </summary>
public class TokenServiceTests
{
    private readonly Mock<IConfiguration> _mockConfiguration;
    private readonly TokenService _tokenService;

    public TokenServiceTests()
    {
        _mockConfiguration = new Mock<IConfiguration>();
        _tokenService = new TokenService(_mockConfiguration.Object);
    }

    private void SetupJwtConfiguration()
    {
        var jwtKey = "YourSuperSecretKeyThatIsAtLeast32CharactersLong!";
        var jwtIssuer = "AirQualityMapApi";
        var jwtAudience = "AirQualityMapClient";

        _mockConfiguration.Setup(x => x["Jwt:Key"]).Returns(jwtKey);
        _mockConfiguration.Setup(x => x["Jwt:Issuer"]).Returns(jwtIssuer);
        _mockConfiguration.Setup(x => x["Jwt:Audience"]).Returns(jwtAudience);
    }

    [Fact]
    public void GenerateToken_WithValidUser_ReturnsValidToken()
    {
        SetupJwtConfiguration();
        var user = new User
        {
            Id = 1,
            Username = "testuser",
            Email = "test@example.com",
            PasswordHash = "hash"
        };

        var token = _tokenService.GenerateToken(user);

        Assert.NotEmpty(token);
        Assert.IsType<string>(token);
    }

    [Fact]
    public void GenerateToken_WithValidUser_ContainsCorrectClaims()
    {
        SetupJwtConfiguration();
        var user = new User
        {
            Id = 42,
            Username = "testuser",
            Email = "test@example.com",
            PasswordHash = "hash"
        };

        var token = _tokenService.GenerateToken(user);
        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(token);

        Assert.NotNull(jwtToken);
        Assert.Equal("42", jwtToken.Claims.First(c => c.Type == System.Security.Claims.ClaimTypes.NameIdentifier).Value);
        Assert.Equal("testuser", jwtToken.Claims.First(c => c.Type == System.Security.Claims.ClaimTypes.Name).Value);
        Assert.Equal("test@example.com", jwtToken.Claims.First(c => c.Type == System.Security.Claims.ClaimTypes.Email).Value);
    }

    [Fact]
    public void GenerateToken_WithValidUser_TokenHasCorrectIssuer()
    {
        SetupJwtConfiguration();
        var user = new User
        {
            Id = 1,
            Username = "testuser",
            Email = "test@example.com",
            PasswordHash = "hash"
        };

        var token = _tokenService.GenerateToken(user);
        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(token);

        Assert.Equal("AirQualityMapApi", jwtToken.Issuer);
    }

    [Fact]
    public void GenerateToken_WithValidUser_TokenHasCorrectAudience()
    {
        SetupJwtConfiguration();
        var user = new User
        {
            Id = 1,
            Username = "testuser",
            Email = "test@example.com",
            PasswordHash = "hash"
        };

        var token = _tokenService.GenerateToken(user);
        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(token);

        Assert.Contains("AirQualityMapClient", jwtToken.Audiences);
    }

    [Fact]
    public void GenerateToken_WithValidUser_TokenExpiresInSevenDays()
    {
        SetupJwtConfiguration();
        var user = new User
        {
            Id = 1,
            Username = "testuser",
            Email = "test@example.com",
            PasswordHash = "hash"
        };

        var beforeGeneration = DateTime.UtcNow;
        var token = _tokenService.GenerateToken(user);
        var afterGeneration = DateTime.UtcNow;

        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(token);

        var expectedExpiration = beforeGeneration.AddDays(7);
        var toleranceWindow = TimeSpan.FromSeconds(5);

        Assert.True(jwtToken.ValidTo >= expectedExpiration - toleranceWindow);
        Assert.True(jwtToken.ValidTo <= afterGeneration.AddDays(7) + toleranceWindow);
    }

    [Fact]
    public void GenerateToken_WithoutJwtKeyConfiguration_ThrowsInvalidOperationException()
    {
        _mockConfiguration.Setup(x => x["Jwt:Key"]).Returns((string?)null);

        var user = new User
        {
            Id = 1,
            Username = "testuser",
            Email = "test@example.com",
            PasswordHash = "hash"
        };

        Assert.Throws<InvalidOperationException>(() => _tokenService.GenerateToken(user));
    }
}
