using AirQualityMap.Api.Controllers;
using AirQualityMap.Api.DTOs;
using AirQualityMap.Api.Models;
using AirQualityMap.Api.Services.Contracts;
using AirQualityMap.Api.Tests.Fixtures;
using Moq;

namespace AirQualityMap.Api.Tests.Controllers;

/// <summary>
/// Unit tests for the AuthController covering registration and login operations.
/// These tests use mocked service dependencies to validate controller behavior and error handling.
/// </summary>
public class AuthControllerTests
{
    private readonly Mock<IUserService> _mockUserService;
    private readonly Mock<ITokenService> _mockTokenService;
    private readonly AuthController _authController;

    public AuthControllerTests()
    {
        _mockUserService = new Mock<IUserService>();
        _mockTokenService = new Mock<ITokenService>();
        _authController = new AuthController(_mockUserService.Object, _mockTokenService.Object);
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

        var createdUser = TestDataBuilder.CreateTestUser(username: registerDto.Username, email: registerDto.Email);
        var token = "valid_jwt_token";

        _mockUserService.Setup(s => s.CreateUserAsync(registerDto.Username, registerDto.Email, registerDto.Password))
            .ReturnsAsync(createdUser);
        _mockTokenService.Setup(s => s.GenerateToken(createdUser))
            .Returns(token);

        var result = await _authController.Register(registerDto);

        var okResult = Assert.IsType<Microsoft.AspNetCore.Mvc.OkObjectResult>(result.Result);
        var response = Assert.IsType<AuthResponseDto>(okResult.Value);

        Assert.Equal(registerDto.Username, response.Username);
        Assert.Equal(registerDto.Email, response.Email);
        Assert.Equal(token, response.Token);

        _mockUserService.Verify(s => s.CreateUserAsync(registerDto.Username, registerDto.Email, registerDto.Password), Times.Once);
        _mockTokenService.Verify(s => s.GenerateToken(createdUser), Times.Once);
    }

    [Fact]
    public async Task Register_WithDuplicateUsername_ReturnsBadRequest()
    {
        var registerDto = new RegisterDto
        {
            Username = "existinguser",
            Email = "different@example.com",
            Password = "SecurePassword123!"
        };

        _mockUserService.Setup(s => s.CreateUserAsync(registerDto.Username, registerDto.Email, registerDto.Password))
            .ThrowsAsync(new InvalidOperationException($"Username '{registerDto.Username}' already exists."));

        var result = await _authController.Register(registerDto);

        Assert.IsType<Microsoft.AspNetCore.Mvc.BadRequestObjectResult>(result.Result);
        _mockUserService.Verify(s => s.CreateUserAsync(registerDto.Username, registerDto.Email, registerDto.Password), Times.Once);
    }

    [Fact]
    public async Task Register_WithDuplicateEmail_ReturnsBadRequest()
    {
        var registerDto = new RegisterDto
        {
            Username = "newuser",
            Email = "existing@example.com",
            Password = "SecurePassword123!"
        };

        _mockUserService.Setup(s => s.CreateUserAsync(registerDto.Username, registerDto.Email, registerDto.Password))
            .ThrowsAsync(new InvalidOperationException($"Email '{registerDto.Email}' already exists."));

        var result = await _authController.Register(registerDto);

        Assert.IsType<Microsoft.AspNetCore.Mvc.BadRequestObjectResult>(result.Result);
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

        var createdUser = TestDataBuilder.CreateTestUser(username: registerDto.Username, email: registerDto.Email);
        var token = "valid_jwt_token";

        _mockUserService.Setup(s => s.CreateUserAsync(registerDto.Username, registerDto.Email, registerDto.Password))
            .ReturnsAsync(createdUser);
        _mockTokenService.Setup(s => s.GenerateToken(createdUser))
            .Returns(token);

        await _authController.Register(registerDto);

        _mockTokenService.Verify(s => s.GenerateToken(It.IsAny<User>()), Times.Once);
    }

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsToken()
    {
        var password = "SecurePassword123!";
        var user = TestDataBuilder.CreateTestUser(username: "testuser");
        var loginDto = new LoginDto
        {
            Username = "testuser",
            Password = password
        };

        var token = "valid_jwt_token";

        _mockUserService.Setup(s => s.GetUserByUsernameAsync("testuser"))
            .ReturnsAsync(user);
        _mockUserService.Setup(s => s.VerifyPasswordAsync(user.Id, password))
            .ReturnsAsync(true);
        _mockTokenService.Setup(s => s.GenerateToken(user))
            .Returns(token);

        var result = await _authController.Login(loginDto);

        var okResult = Assert.IsType<Microsoft.AspNetCore.Mvc.OkObjectResult>(result.Result);
        var response = Assert.IsType<AuthResponseDto>(okResult.Value);

        Assert.Equal(user.Username, response.Username);
        Assert.Equal(user.Email, response.Email);
        Assert.Equal(token, response.Token);

        _mockUserService.Verify(s => s.GetUserByUsernameAsync("testuser"), Times.Once);
        _mockUserService.Verify(s => s.VerifyPasswordAsync(user.Id, password), Times.Once);
        _mockTokenService.Verify(s => s.GenerateToken(user), Times.Once);
    }

    [Fact]
    public async Task Login_WithInvalidUsername_ReturnsUnauthorized()
    {
        var loginDto = new LoginDto
        {
            Username = "nonexistentuser",
            Password = "SomePassword123!"
        };

        _mockUserService.Setup(s => s.GetUserByUsernameAsync("nonexistentuser"))
            .ReturnsAsync((User?)null);

        var result = await _authController.Login(loginDto);

        Assert.IsType<Microsoft.AspNetCore.Mvc.UnauthorizedObjectResult>(result.Result);
        _mockUserService.Verify(s => s.GetUserByUsernameAsync("nonexistentuser"), Times.Once);
    }

    [Fact]
    public async Task Login_WithInvalidPassword_ReturnsUnauthorized()
    {
        var user = TestDataBuilder.CreateTestUser(username: "testuser");
        var loginDto = new LoginDto
        {
            Username = "testuser",
            Password = "WrongPassword123!"
        };

        _mockUserService.Setup(s => s.GetUserByUsernameAsync("testuser"))
            .ReturnsAsync(user);
        _mockUserService.Setup(s => s.VerifyPasswordAsync(user.Id, "WrongPassword123!"))
            .ReturnsAsync(false);

        var result = await _authController.Login(loginDto);

        Assert.IsType<Microsoft.AspNetCore.Mvc.UnauthorizedObjectResult>(result.Result);
        _mockUserService.Verify(s => s.VerifyPasswordAsync(user.Id, "WrongPassword123!"), Times.Once);
    }

    [Fact]
    public async Task Login_WithValidCredentials_CallsTokenServiceOnce()
    {
        var password = "SecurePassword123!";
        var user = TestDataBuilder.CreateTestUser(username: "testuser");
        var loginDto = new LoginDto
        {
            Username = "testuser",
            Password = password
        };

        var token = "valid_jwt_token";

        _mockUserService.Setup(s => s.GetUserByUsernameAsync("testuser"))
            .ReturnsAsync(user);
        _mockUserService.Setup(s => s.VerifyPasswordAsync(user.Id, password))
            .ReturnsAsync(true);
        _mockTokenService.Setup(s => s.GenerateToken(user))
            .Returns(token);

        await _authController.Login(loginDto);

        _mockTokenService.Verify(s => s.GenerateToken(It.IsAny<User>()), Times.Once);
    }
}
