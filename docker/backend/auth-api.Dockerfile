# Multi-stage Docker build for .NET 8 API Services
FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

# Install curl for health checks
RUN apk add --no-cache curl

FROM mcr.microsoft.com/dotnet/sdk:8.0-alpine AS build
WORKDIR /src

# Copy csproj files and restore dependencies
COPY ["src/BuildAQ.Auth.API/BuildAQ.Auth.API.csproj", "src/BuildAQ.Auth.API/"]
COPY ["src/BuildAQ.Shared/BuildAQ.Shared.csproj", "src/BuildAQ.Shared/"]
COPY ["src/BuildAQ.Infrastructure/BuildAQ.Infrastructure.csproj", "src/BuildAQ.Infrastructure/"]

RUN dotnet restore "src/BuildAQ.Auth.API/BuildAQ.Auth.API.csproj"

# Copy all source files
COPY . .

# Build the application
WORKDIR "/src/src/BuildAQ.Auth.API"
RUN dotnet build "BuildAQ.Auth.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "BuildAQ.Auth.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Create non-root user
RUN addgroup -g 1001 -S dotnetuser && \
    adduser -u 1001 -S -G dotnetuser -h /app dotnetuser && \
    chown -R dotnetuser:dotnetuser /app
USER dotnetuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

ENTRYPOINT ["dotnet", "BuildAQ.Auth.API.dll"]