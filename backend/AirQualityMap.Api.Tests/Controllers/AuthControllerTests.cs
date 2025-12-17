using AirQualityMap.Api.Controllers;
using AirQualityMap.Api.Data;
using AirQualityMap.Api.DTOs;
using AirQualityMap.Api.Services;
using AirQualityMap.Api.Tests.Fixtures;
using BCrypt.Net;
using Microsoft.Extensions.Configuration;
using Moq;

namespace AirQualityMap.Api.Tests.Controllers;

/// <summary>
/// Integration tests for the AuthController covering registration and login operations.
/// These tests validate business logic for user authentication without relying on external dependencies.
/// </summary>
public class AuthControllerTests
{
    private readonly AppDbContext _dbContext;
    private readonly Mock<ITokenService> _mockTokenService;
    private readonly AuthController _authController;

    public AuthControllerTests()
    {
        _dbContext = InMemoryDbContextFactory.CreateDbContext();
        _mockTokenService = new Mock<ITokenService>();
        _authController = new AuthController(_dbContext, _mockTokenService.Object);
    }

    [Fact]
    public async Task Register_WithValidData_CreatesUserAndReturnsToken()
    {
        var registerDto = new RegisterDto
        {
            Username = "newuser",
            Email = "new@example.com",
            Password = "SecurePassword123!"
        };

        var token = "valid_jwt_token";
        _mockTokenService.Setup(s => s.GenerateToken(It.IsAny<AirQualityMap.Api.Models.User>()))
            .Returns(token);

        var result = await _authController.Register(registerDto);

        var okResult = Assert.IsType<Microsoft.AspNetCore.Mvc.OkObjectResult>(result.Result);
        var response = Assert.IsType<AuthResponseDto>(okResult.Value);

        Assert.Equal(registerDto.Username, response.Username);
        Assert.Equal(registerDto.Email, response.Email);
        Assert.Equal(token, response.Token);
    }

    [Fact]
    public async Task Register_WithDuplicateUsername_ReturnsBadRequest()
    {
        var existingUser = TestDataBuilder.CreateTestUser(username: "existinguser");
        _dbContext.Users.Add(existingUser);
        await _dbContext.SaveChangesAsync();

        var registerDto = new RegisterDto
        {
            Username = "existinguser",
            Email = "different@example.com",
            Password = "SecurePassword123!"
        };

        var result = await _authController.Register(registerDto);

        Assert.IsType<Microsoft.AspNetCore.Mvc.BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task Register_WithDuplicateEmail_ReturnsBadRequest()
    {
        var existingUser = TestDataBuilder.CreateTestUser(email: "existing@example.com");
        _dbContext.Users.Add(existingUser);
        await _dbContext.SaveChangesAsync();

        var registerDto = new RegisterDto
        {
            Username = "newuser",
            Email = "existing@example.com",
            Password = "SecurePassword123!"
        };

        var result = await _authController.Register(registerDto);

        Assert.IsType<Microsoft.AspNetCore.Mvc.BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task Register_WithValidData_SavesUserToDatabaseWithHashedPassword()
    {
        var registerDto = new RegisterDto
        {
            Username = "newuser",
            Email = "new@example.com",
            Password = "SecurePassword123!"
        };

        _mockTokenService.Setup(s => s.GenerateToken(It.IsAny<AirQualityMap.Api.Models.User>()))
            .Returns("token");

        await _authController.Register(registerDto);

        var savedUser = _dbContext.Users.FirstOrDefault(u => u.Username == "newuser");
        Assert.NotNull(savedUser);
        Assert.NotEqual(registerDto.Password, savedUser.PasswordHash);
        Assert.True(BCrypt.Net.BCrypt.Verify(registerDto.Password, savedUser.PasswordHash));
    }

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsToken()
    {
        var password = "SecurePassword123!";
        var user = TestDataBuilder.CreateTestUser(
            username: "testuser",
            passwordHash: BCrypt.Net.BCrypt.HashPassword(password)
        );
        _dbContext.Users.Add(user);
        await _dbContext.SaveChangesAsync();

        var loginDto = new LoginDto
        {
            Username = "testuser",
            Password = password
        };

        var token = "valid_jwt_token";
        _mockTokenService.Setup(s => s.GenerateToken(It.IsAny<AirQualityMap.Api.Models.User>()))
            .Returns(token);

        var result = await _authController.Login(loginDto);

        var okResult = Assert.IsType<Microsoft.AspNetCore.Mvc.OkObjectResult>(result.Result);
        var response = Assert.IsType<AuthResponseDto>(okResult.Value);

        Assert.Equal(user.Username, response.Username);
        Assert.Equal(user.Email, response.Email);
        Assert.Equal(token, response.Token);
    }

    [Fact]
    public async Task Login_WithInvalidUsername_ReturnsUnauthorized()
    {
        var loginDto = new LoginDto
        {
            Username = "nonexistentuser",
            Password = "SomePassword123!"
        };

        var result = await _authController.Login(loginDto);

        Assert.IsType<Microsoft.AspNetCore.Mvc.UnauthorizedObjectResult>(result.Result);
    }

    [Fact]
    public async Task Login_WithInvalidPassword_ReturnsUnauthorized()
    {
        var password = "CorrectPassword123!";
        var user = TestDataBuilder.CreateTestUser(
            username: "testuser",
            passwordHash: BCrypt.Net.BCrypt.HashPassword(password)
        );
        _dbContext.Users.Add(user);
        await _dbContext.SaveChangesAsync();

        var loginDto = new LoginDto
        {
            Username = "testuser",
            Password = "WrongPassword123!"
        };

        var result = await _authController.Login(loginDto);

        Assert.IsType<Microsoft.AspNetCore.Mvc.UnauthorizedObjectResult>(result.Result);
    }

    [Fact]
    public async Task Register_WithValidData_CallsTokenServiceOnce()
    {
        var registerDto = new RegisterDto
        {
            Username = "newuser",
            Email = "new@example.com",
            Password = "SecurePassword123!"
        };

        _mockTokenService.Setup(s => s.GenerateToken(It.IsAny<AirQualityMap.Api.Models.User>()))
            .Returns("token");

        await _authController.Register(registerDto);

        _mockTokenService.Verify(s => s.GenerateToken(It.IsAny<AirQualityMap.Api.Models.User>()), Times.Once);
    }

    [Fact]
    public async Task Login_WithValidCredentials_CallsTokenServiceOnce()
    {
        var password = "SecurePassword123!";
        var user = TestDataBuilder.CreateTestUser(
            username: "testuser",
            passwordHash: BCrypt.Net.BCrypt.HashPassword(password)
        );
        _dbContext.Users.Add(user);
        await _dbContext.SaveChangesAsync();

        var loginDto = new LoginDto
        {
            Username = "testuser",
            Password = password
        };

        _mockTokenService.Setup(s => s.GenerateToken(It.IsAny<AirQualityMap.Api.Models.User>()))
            .Returns("token");

        await _authController.Login(loginDto);

        _mockTokenService.Verify(s => s.GenerateToken(It.IsAny<AirQualityMap.Api.Models.User>()), Times.Once);
    }
}
