using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AirQualityMap.Api.Data;
using AirQualityMap.Api.DTOs;
using AirQualityMap.Api.Models;
using AirQualityMap.Api.Services;
using BCrypt.Net;

namespace AirQualityMap.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ITokenService _tokenService;

    public AuthController(AppDbContext context, ITokenService tokenService)
    {
        _context = context;
        _tokenService = tokenService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register(RegisterDto dto)
    {
        if (await _context.Users.AnyAsync(u => u.Username == dto.Username))
        {
            return BadRequest(new { message = "Username already exists" });
        }

        if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
        {
            return BadRequest(new { message = "Email already exists" });
        }

        var user = new User
        {
            Username = dto.Username,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var token = _tokenService.GenerateToken(user);

        return Ok(new AuthResponseDto
        {
            Token = token,
            Username = user.Username,
            Email = user.Email
        });
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == dto.Username);

        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
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
