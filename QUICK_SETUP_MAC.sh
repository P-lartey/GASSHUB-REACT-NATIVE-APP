#!/bin/bash

# ========================================
# GassHub iOS App - Mac Quick Setup
# ========================================
# This script sets up the GassHub mobile app
# on your Mac in under 5 minutes!
# ========================================

echo ""
echo "========================================"
echo "  🍎 GassHub iOS - Mac Setup"
echo "========================================"
echo ""

# Check if Node.js is installed
echo "📦 Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo ""
    echo "   Please install Node.js first:"
    echo "   1. Go to https://nodejs.org"
    echo "   2. Download LTS version"
    echo "   3. Install like any other app"
    echo "   4. Come back and run this script again"
    echo ""
    exit 1
fi

NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
echo "✅ Node.js found: $NODE_VERSION"
echo "✅ npm found: $NPM_VERSION"
echo ""

# Navigate to GassHub folder
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR/GassHub" || { 
    echo "❌ GassHub folder not found!"
    echo "Make sure this script is in GassHub-iOS-Complete folder"
    exit 1
}

echo "📁 Working directory: $(pwd)"
echo ""

# Install dependencies
echo "========================================"
echo "  Step 1: Installing Dependencies"
echo "========================================"
echo ""
echo "This will download ~40 packages and take 2-5 minutes..."
echo ""

npm install

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Failed to install dependencies!"
    echo ""
    echo "Try these fixes:"
    echo "1. Clear cache: npm cache clean --force"
    echo "2. Delete node_modules: rm -rf node_modules package-lock.json"
    echo "3. Try again: npm install"
    echo ""
    exit 1
fi

echo ""
echo "✅ All dependencies installed successfully!"
echo ""

# Install EAS CLI globally
echo "========================================"
echo "  Step 2: Installing EAS Build Tools"
echo "========================================"
echo ""
echo "Installing EAS CLI for iOS builds..."
echo ""

npm install -g eas-cli

if [ $? -eq 0 ]; then
    echo "✅ EAS CLI installed!"
else
    echo "⚠️  EAS CLI installation failed (optional, can install later)"
    echo "   Run this later: npm install -g eas-cli"
fi
echo ""

# Summary
echo "========================================"
echo "  ✅ Setup Complete!"
echo "========================================"
echo ""
echo "🎉 Your GassHub app is ready to run!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  How to Run the App:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📱 START DEVELOPMENT SERVER:"
echo "   cd GassHub"
echo "   npx expo start"
echo ""
echo "   Or simply run:"
echo "   npm start"
echo ""
echo "📱 TEST ON YOUR iPHONE:"
echo "   1. Install 'Expo Go' from App Store"
echo "   2. Open Expo Go app"
echo "   3. Scan QR code from terminal"
echo "   4. App loads on your iPhone!"
echo ""
echo "📱 OTHER OPTIONS:"
echo "   npm run ios        # Build for iOS"
echo "   npm run android    # Build for Android"
echo "   npm run web        # Run on web browser"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  For iOS Build (App Store):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "When you're ready to build for iOS App Store:"
echo ""
echo "   1. Get Apple Developer account (\$99/year)"
echo "   2. Login to EAS:"
echo "      eas login"
echo ""
echo "   3. Configure credentials:"
echo "      eas credentials"
echo ""
echo "   4. Build:"
echo "      eas build --platform ios --profile production"
echo ""
echo "   Takes ~20 minutes, then download .ipa file!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Documentation:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "For detailed instructions, see:"
echo "   - README_IOS_COMPLETE.md (this folder)"
echo "   - IOS_BUILD_GUIDE_2026.md (GassHub folder)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Happy coding! 🚀"
echo ""
echo "Next step: Run 'npx expo start' to begin!"
echo ""
