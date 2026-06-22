#!/usr/bin/env bash
set -e

echo "=== Super Bear Adventure - Instalador ==="

# Detectar OS
OS="$(uname -s)"

# Verificar .NET 8
if ! command -v dotnet &>/dev/null; then
    echo ""
    echo "ERROR: .NET 8 SDK no encontrado."
    echo "Descargalo desde: https://dotnet.microsoft.com/download/dotnet/8.0"
    exit 1
fi

DOTNET_VER=$(dotnet --version | cut -d. -f1)
if [ "$DOTNET_VER" -lt 8 ]; then
    echo "ERROR: Se requiere .NET 8 o superior (tienes $(dotnet --version))"
    exit 1
fi
echo "✓ .NET $(dotnet --version) encontrado"

# Instalar dependencias del sistema en Linux
if [ "$OS" = "Linux" ]; then
    echo "Instalando dependencias de MonoGame para Linux..."
    sudo apt-get install -y libsdl2-2.0-0 libopenal1 libglu1-mesa 2>/dev/null || \
    sudo dnf install -y SDL2 openal-soft mesa-libGLU 2>/dev/null || \
    echo "  (instala manualmente: libsdl2, libopenal, libglu)"
    echo "✓ Dependencias instaladas"
fi

# Instalar herramienta mgcb
echo "Instalando herramienta de contenido MonoGame (mgcb)..."
dotnet tool restore
echo "✓ mgcb instalado"

# Compilar
echo "Compilando el juego..."
cd "$(dirname "$0")/SuperBearAdventure"
dotnet build -c Release
echo "✓ Compilación exitosa"

echo ""
echo "=== Listo! Para jugar ejecuta: ==="
echo "   cd SuperBearAdventure && dotnet run -c Release"
echo ""
echo "Controles: WASD/Flechas=Mover  Space/W=Saltar  Esc=Pausa"
