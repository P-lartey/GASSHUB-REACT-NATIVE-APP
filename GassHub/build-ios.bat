@echo off
REM ========================================
REM  iOS Build Script for GassHub
REM  Quick Start - One Command Build
REM ========================================

echo.
echo ========================================
echo   GassHub iOS Build Launcher
echo ========================================
echo.

REM Check if EAS CLI is installed
where eas >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] EAS CLI not found!
    echo Installing EAS CLI...
    npm install -g eas-cli
    echo.
)

echo [INFO] EAS CLI Version:
eas --version
echo.

REM Navigate to project directory
cd /d "%~dp0"
echo [INFO] Working directory: %CD%
echo.

REM Prompt user for build type
echo Choose build type:
echo 1. Production (App Store) - Recommended
echo 2. Preview (TestFlight/Testing)
echo 3. Development (Simulator)
echo.
set /p BUILD_TYPE="Enter choice (1-3): "

if "%BUILD_TYPE%"=="1" goto PRODUCTION
if "%BUILD_TYPE%"=="2" goto PREVIEW
if "%BUILD_TYPE%"=="3" goto DEVELOPMENT

echo [ERROR] Invalid choice. Please run again.
pause
exit /b 1

:PRODUCTION
echo.
echo [INFO] Building for PRODUCTION (App Store)...
echo This will create an .ipa file optimized for App Store submission.
echo.
goto BUILD

:PREVIEW
echo.
echo [INFO] Building for PREVIEW (TestFlight/Testing)...
echo This will create a build suitable for TestFlight distribution.
echo.
goto BUILD

:DEVELOPMENT
echo.
echo [INFO] Building for DEVELOPMENT (Simulator)...
echo This creates a development build for testing on simulators.
echo.
goto BUILD

:BUILD
echo ========================================
echo   Starting iOS Build Process
echo ========================================
echo.

REM Check if logged in to EAS
echo [CHECK] Verifying EAS login status...
eas whoami >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ACTION REQUIRED] You need to login to EAS first!
    echo.
    echo Opening login prompt...
    echo.
    eas login
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Login failed. Please try again.
        pause
        exit /b 1
    )
    echo [SUCCESS] Logged in successfully!
    echo.
) else (
    echo [OK] Already logged in to EAS
    echo.
)

REM Configure credentials if needed
echo [CHECK] Checking iOS credentials...
eas credentials --non-interactive >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [INFO] Setting up iOS credentials for the first time...
    echo This will create your Apple certificates and provisioning profiles.
    echo.
    echo Please follow the prompts carefully.
    echo You'll need your Apple Developer account credentials.
    echo.
    pause
    eas credentials
    echo.
)

REM Start the build
echo ========================================
echo   Starting Build on EAS Servers
echo ========================================
echo.
echo [INFO] Uploading code to Expo servers...
echo [INFO] This typically takes 10-20 minutes.
echo [INFO] You can close this window and check back later.
echo.

if "%BUILD_TYPE%"=="1" (
    eas build --platform ios --profile production --non-interactive
) else if "%BUILD_TYPE%"=="2" (
    eas build --platform ios --profile preview --non-interactive
) else if "%BUILD_TYPE%"=="3" (
    eas build --platform ios --profile development --non-interactive
)

echo.
echo ========================================
echo   Build Complete!
echo ========================================
echo.
echo [SUCCESS] Your iOS build has been created!
echo.
echo Next steps:
echo 1. Download the .ipa file from the link above
echo 2. Upload to App Store Connect using Transporter app
echo 3. Submit for review in App Store Connect
echo.
echo For detailed instructions, see: IOS_BUILD_GUIDE_2026.md
echo.
pause
