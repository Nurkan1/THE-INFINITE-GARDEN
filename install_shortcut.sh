#!/bin/bash
PROJECT_DIR="/home/nurcan/JUEGO UNIC"
DESKTOP_DIR="$HOME/Desktop"

echo "Installing BitBloom to Desktop..."

# Ensure AppImage is executable
chmod +x "$PROJECT_DIR/dist/BitBloom-1.0.0.AppImage"

# Copy .desktop file
cp "$PROJECT_DIR/BitBloom.desktop" "$DESKTOP_DIR/BitBloom.desktop"

# Mark .desktop as trusted/executable (Gnome/KDE quirk)
chmod +x "$DESKTOP_DIR/BitBloom.desktop"

echo "Done! You should see 'BitBloom' on your Desktop."
