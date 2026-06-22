@echo off
echo === Super Bear Adventure - Instalador Windows ===

where dotnet >nul 2>&1
if errorlevel 1 (
    echo ERROR: .NET 8 SDK no encontrado.
    echo Descargalo desde: https://dotnet.microsoft.com/download/dotnet/8.0
    pause
    exit /b 1
)

echo Instalando herramienta de contenido MonoGame...
dotnet tool restore
if errorlevel 1 goto error

echo Compilando el juego...
cd SuperBearAdventure
dotnet build -c Release
if errorlevel 1 goto error

echo.
echo === Listo! Ejecutando el juego... ===
dotnet run -c Release
goto end

:error
echo.
echo ERROR durante la instalacion.
pause
exit /b 1

:end
