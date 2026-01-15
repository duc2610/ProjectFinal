#!/bin/bash
# Bash script to create migrations for both SQL Server and PostgreSQL
# Usage: ./scripts/create-migration.sh AddNewFeature

if [ -z "$1" ]; then
    echo "Usage: $0 <MigrationName>"
    echo "Example: $0 AddNewFeature"
    exit 1
fi

MIGRATION_NAME=$1
PROJECT_PATH="backend/ToeicGenius/ToeicGenius.csproj"

echo "========================================"
echo "Creating Migrations for: $MIGRATION_NAME"
echo "========================================"

# Create SQL Server migration
echo ""
echo "[1/2] Creating SQL Server migration..."
dotnet ef migrations add "${MIGRATION_NAME}_SqlServer" \
    -c ToeicGeniusDbContextSqlServer \
    -o Migrations/SqlServer \
    --project "$PROJECT_PATH"

if [ $? -ne 0 ]; then
    echo "Failed to create SQL Server migration!"
    exit 1
fi

# Create PostgreSQL migration
echo ""
echo "[2/2] Creating PostgreSQL migration..."
dotnet ef migrations add "${MIGRATION_NAME}_Postgres" \
    -c ToeicGeniusDbContextPostgres \
    -o Migrations/Postgres \
    --project "$PROJECT_PATH"

if [ $? -ne 0 ]; then
    echo "Failed to create PostgreSQL migration!"
    exit 1
fi

echo ""
echo "========================================"
echo "✓ Migrations created successfully!"
echo "========================================"
echo "SQL Server: Migrations/SqlServer/${MIGRATION_NAME}_SqlServer.cs"
echo "PostgreSQL: Migrations/Postgres/${MIGRATION_NAME}_Postgres.cs"
