#!/bin/bash
# Package the Chrome extension into a .zip for distribution
set -e

cd "$(dirname "$0")/.."

echo "🪲 Packaging AI Slop Radar extension..."

cd extension
zip -r ../slop-radar-extension.zip . \
  -x "generate-icons.html" \
  -x ".DS_Store" \
  -x "*.map"

cd ..
echo "✅ Created slop-radar-extension.zip ($(du -h slop-radar-extension.zip | cut -f1))"
echo ""
echo "To install:"
echo "  1. Open chrome://extensions/"
echo "  2. Enable Developer mode"
echo "  3. Drag & drop slop-radar-extension.zip"
echo "  — or —"
echo "  3. Click 'Load unpacked' and select the extension/ folder"
