FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["AirQualityMap.Api.csproj", "./"]
RUN dotnet restore "AirQualityMap.Api.csproj"
COPY . .
RUN dotnet build "AirQualityMap.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "AirQualityMap.Api.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "AirQualityMap.Api.dll"]
