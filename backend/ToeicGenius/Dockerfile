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

# Install OpenSSL to create self-signed certificate
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Create directory for certificates
RUN mkdir -p /app/certs

# Generate self-signed certificate for HTTPS
RUN openssl req -x509 -newkey rsa:4096 -keyout /app/certs/key.pem -out /app/certs/cert.pem -days 365 -nodes \
    -subj "/C=VN/ST=State/L=City/O=Organization/CN=localhost"

# Configure ASP.NET Core to listen on both HTTP and HTTPS
ENV ASPNETCORE_URLS=http://+:8080;https://+:8443
ENV ASPNETCORE_Kestrel__Certificates__Default__Path=/app/certs/cert.pem
ENV ASPNETCORE_Kestrel__Certificates__Default__KeyPath=/app/certs/key.pem

COPY --from=build /app/publish .

EXPOSE 8080 8443

ENTRYPOINT ["dotnet", "ToeicGenius.dll"]

