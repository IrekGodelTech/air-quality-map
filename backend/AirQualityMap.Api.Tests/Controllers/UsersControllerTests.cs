using AirQualityMap.Api.Controllers;
using AirQualityMap.Api.DTOs;
using AirQualityMap.Api.Models;
using AirQualityMap.Api.Services.Contracts;
using AirQualityMap.Api.Tests.Fixtures;
using Microsoft.AspNetCore.Mvc;
using Moq;
using System.Security.Claims;

namespace AirQualityMap.Api.Tests.Controllers;

/// <summary>
/// Unit tests for the UsersController covering user profile management and password changes.
/// These tests validate authorization, data updates, and proper error handling.
/// </summary>
public class UsersControllerTests
{
    private readonly Mock<IUserService> _mockUserService;
    private readonly UsersController _controller;

    public UsersControllerTests()
    {
        _mockUserService = new Mock<IUserService>();
        _controller = new UsersController(_mockUserService.Object);
    }

    private void SetupUserContext(int userId, string username = "testuser")
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Name, username)
        };
        var identity = new ClaimsIdentity(claims);
        var principal = new ClaimsPrincipal(identity);
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new Microsoft.AspNetCore.Http.DefaultHttpContext { User = principal }
        };
    }

    [Fact]
    public async Task GetUser_WithValidId_ReturnsUser()
    {
        // Arrange
        var user = TestDataBuilder.CreateTestUser(id: 42, username: "testuser", email: "test@example.com");

        _mockUserService.Setup(s => s.GetUserByIdAsync(42))
            .ReturnsAsync(user);

        // Act
        var result = await _controller.GetUser(42);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        Assert.NotNull(okResult.Value);
        
        // Verify the anonymous object contains expected properties
        var userObject = okResult.Value;
        var idProperty = userObject.GetType().GetProperty("Id")?.GetValue(userObject);
        var usernameProperty = userObject.GetType().GetProperty("Username")?.GetValue(userObject);
        var emailProperty = userObject.GetType().GetProperty("Email")?.GetValue(userObject);

        Assert.Equal(42, idProperty);
        Assert.Equal("testuser", usernameProperty);
        Assert.Equal("test@example.com", emailProperty);
    }

    [Fact]
    public async Task GetUser_WithInvalidId_ReturnsNotFound()
    {
        // Arrange
        _mockUserService.Setup(s => s.GetUserByIdAsync(999))
            .ReturnsAsync((User?)null);

        // Act
        var result = await _controller.GetUser(999);

        // Assert
        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    public async Task GetProfile_WithAuthenticatedUser_ReturnsUserProfile()
    {
        // Arrange
        var userId = 1;
        SetupUserContext(userId);

        var user = TestDataBuilder.CreateTestUser(id: userId, username: "authuser", email: "auth@example.com");

        _mockUserService.Setup(s => s.GetUserByIdAsync(userId))
            .ReturnsAsync(user);

        // Act
        var result = await _controller.GetProfile();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        Assert.NotNull(okResult.Value);

        var userObject = okResult.Value;
        var usernameProperty = userObject.GetType().GetProperty("Username")?.GetValue(userObject);
        
        Assert.Equal("authuser", usernameProperty);
    }

    [Fact]
    public async Task GetProfile_WithUnauthenticatedUser_ReturnsUnauthorized()
    {
        // Arrange
        // No user context setup - simulating unauthenticated request
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new Microsoft.AspNetCore.Http.DefaultHttpContext()
        };

        // Act
        var result = await _controller.GetProfile();

        // Assert
        Assert.IsType<UnauthorizedResult>(result.Result);
    }

    [Fact]
    public async Task GetProfile_WithNonExistentUser_ReturnsNotFound()
    {
        // Arrange
        var userId = 999;
        SetupUserContext(userId);

        _mockUserService.Setup(s => s.GetUserByIdAsync(userId))
            .ReturnsAsync((User?)null);

        // Act
        var result = await _controller.GetProfile();

        // Assert
        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    public async Task UpdateUser_WithValidDataAndSameUser_UpdatesUser()
    {
        // Arrange
        var userId = 1;
        SetupUserContext(userId);

        var updateDto = new UpdateUserDto
        {
            Username = "updateduser",
            Email = "updated@example.com"
        };

        var updatedUser = TestDataBuilder.CreateTestUser(
            id: userId,
            username: "updateduser",
            email: "updated@example.com"
        );

        _mockUserService.Setup(s => s.UpdateUserAsync(userId, updateDto.Username, updateDto.Email))
            .ReturnsAsync(updatedUser);

        // Act
        var result = await _controller.UpdateUser(userId, updateDto);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);

        var userObject = okResult.Value;
        var usernameProperty = userObject.GetType().GetProperty("Username")?.GetValue(userObject);
        
        Assert.Equal("updateduser", usernameProperty);
        _mockUserService.Verify(s => s.UpdateUserAsync(userId, updateDto.Username, updateDto.Email), Times.Once);
    }

    [Fact]
    public async Task UpdateUser_WithDifferentUserId_ReturnsForbid()
    {
        // Arrange
        var authenticatedUserId = 1;
        var targetUserId = 2;
        SetupUserContext(authenticatedUserId);

        var updateDto = new UpdateUserDto
        {
            Username = "updateduser",
            Email = "updated@example.com"
        };

        // Act
        var result = await _controller.UpdateUser(targetUserId, updateDto);

        // Assert
        Assert.IsType<ForbidResult>(result);
        _mockUserService.Verify(s => s.UpdateUserAsync(It.IsAny<int>(), It.IsAny<string>(), It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task UpdateUser_WithDuplicateUsername_ReturnsBadRequest()
    {
        // Arrange
        var userId = 1;
        SetupUserContext(userId);

        var updateDto = new UpdateUserDto
        {
            Username = "existinguser",
            Email = "user@example.com"
        };

        _mockUserService.Setup(s => s.UpdateUserAsync(userId, updateDto.Username, updateDto.Email))
            .ThrowsAsync(new InvalidOperationException("Username 'existinguser' already exists."));

        // Act
        var result = await _controller.UpdateUser(userId, updateDto);

        // Assert
        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task UpdateUser_WithNonExistentUser_ReturnsNotFound()
    {
        // Arrange
        var userId = 999;
        SetupUserContext(userId);

        var updateDto = new UpdateUserDto
        {
            Username = "newuser",
            Email = "new@example.com"
        };

        _mockUserService.Setup(s => s.UpdateUserAsync(userId, updateDto.Username, updateDto.Email))
            .ReturnsAsync((User?)null);

        // Act
        var result = await _controller.UpdateUser(userId, updateDto);

        // Assert
        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public async Task ChangePassword_WithValidCredentials_ReturnsNoContent()
    {
        // Arrange
        var userId = 1;
        SetupUserContext(userId);

        var changePasswordDto = new ChangePasswordDto
        {
            CurrentPassword = "OldPassword123!",
            NewPassword = "NewPassword456!"
        };

        _mockUserService.Setup(s => s.ChangePasswordAsync(userId, changePasswordDto.CurrentPassword, changePasswordDto.NewPassword))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.ChangePassword(changePasswordDto);

        // Assert
        Assert.IsType<NoContentResult>(result);
        _mockUserService.Verify(s => s.ChangePasswordAsync(userId, changePasswordDto.CurrentPassword, changePasswordDto.NewPassword), Times.Once);
    }

    [Fact]
    public async Task ChangePassword_WithIncorrectCurrentPassword_ReturnsBadRequest()
    {
        // Arrange
        var userId = 1;
        SetupUserContext(userId);

        var changePasswordDto = new ChangePasswordDto
        {
            CurrentPassword = "WrongPassword",
            NewPassword = "NewPassword456!"
        };

        _mockUserService.Setup(s => s.ChangePasswordAsync(userId, changePasswordDto.CurrentPassword, changePasswordDto.NewPassword))
            .ReturnsAsync(false);

        // Act
        var result = await _controller.ChangePassword(changePasswordDto);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
        Assert.NotNull(badRequestResult.Value);
    }

    [Fact]
    public async Task ChangePassword_WithUnauthenticatedUser_ReturnsUnauthorized()
    {
        // Arrange
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new Microsoft.AspNetCore.Http.DefaultHttpContext()
        };

        var changePasswordDto = new ChangePasswordDto
        {
            CurrentPassword = "OldPassword123!",
            NewPassword = "NewPassword456!"
        };

        // Act
        var result = await _controller.ChangePassword(changePasswordDto);

        // Assert
        Assert.IsType<UnauthorizedResult>(result);
    }
}
