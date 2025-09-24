@echo off
echo Starting OneAsk Agent (.NET Backend)
echo =====================================
echo.
echo Checking .NET installation...
dotnet --version
if errorlevel 1 (
    echo ERROR: .NET is not installed or not in PATH
    echo Please install .NET 8.0 or higher from https://dotnet.microsoft.com/download
    pause
    exit /b 1
)
echo.

echo Checking configuration...
if not exist "appsettings.json" (
    echo WARNING: appsettings.json not found!
    echo Please copy appsettings.example.json to appsettings.json and configure your Azure OpenAI settings
    pause
)
echo.

echo Building and running OneAsk Agent...
dotnet run --urls http://localhost:5000

pause