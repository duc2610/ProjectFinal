FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution + restore
COPY ToeicGenius.sln ./
COPY ToeicGenius.csproj ./ToeicGenius.csproj
RUN dotnet restore ToeicGenius.csproj

# Copy the rest of the source
COPY . .

# Publish app
RUN dotnet publish ToeicGenius.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Configure ASP.NET Core to listen on port 8080 inside the container
ENV ASPNETCORE_URLS=http://+:8080

COPY --from=build /app/publish .

EXPOSE 8080

ENTRYPOINT ["dotnet", "ToeicGenius.dll"]

