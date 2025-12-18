using Microsoft.AspNetCore.Mvc;
using AirQualityMap.Api.DTOs;
using AirQualityMap.Api.Services.Contracts;

namespace AirQualityMap.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly ITokenService _tokenService;

    public AuthController(IUserService userService, ITokenService tokenService)
    {
        _userService = userService;
        _tokenService = tokenService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register(RegisterDto dto)
    {
        try
        {
            var user = await _userService.CreateUserAsync(dto.Username, dto.Email, dto.Password);
            var token = _tokenService.GenerateToken(user);

            return Ok(new AuthResponseDto
            {
                Token = token,
                Username = user.Username,
                Email = user.Email
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginDto dto)
    {
        var user = await _userService.GetUserByUsernameAsync(dto.Username);
        if (user is null || !await _userService.VerifyPasswordAsync(user.Id, dto.Password))
        {
            return Unauthorized(new { message = "Invalid username or password" });
        }

        var token = _tokenService.GenerateToken(user);

        return Ok(new AuthResponseDto
        {
            Token = token,
            Username = user.Username,
            Email = user.Email
        });
    }
}
