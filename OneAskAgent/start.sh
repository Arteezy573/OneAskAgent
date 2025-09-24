#!/bin/bash
echo "Starting OneAsk Agent (.NET Backend)"
echo "====================================="
echo

echo "Checking .NET installation..."
dotnet --version
if [ $? -ne 0 ]; then
    echo "ERROR: .NET is not installed or not in PATH"
    echo "Please install .NET 8.0 or higher from https://dotnet.microsoft.com/download"
    exit 1
fi
echo

echo "Checking configuration..."
if [ ! -f "appsettings.json" ]; then
    echo "WARNING: appsettings.json not found!"
    echo "Please copy appsettings.example.json to appsettings.json and configure your Azure OpenAI settings"
    read -p "Press Enter to continue..."
fi
echo

echo "Building and running OneAsk Agent..."
dotnet run --urls http://localhost:5000