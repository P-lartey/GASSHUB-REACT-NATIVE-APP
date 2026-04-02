# Quick Build Commands - Copy & Paste

## Prerequisites Already Done:
✅ Dependencies updated
✅ Icons fixed  
✅ Configuration validated
✅ EAS CLI installed

---

## Step 1: Login (DO THIS NOW)

The terminal is currently waiting. Enter your credentials:
- Email or username: [YOUR_EXPO_EMAIL]
- Password: [YOUR_PASSWORD]

If you don't have an account, create one at: https://expo.dev/signup

---

## Step 2: After Login Completes

Run these commands in order:

```bash
# Navigate to project
cd c:\Users\KINGSLEY\BESTVERSION\GassHub

# Configure EAS build (first time only)
eas build:configure

# Build Android for Google Play Store
eas build --platform android --profile production
```

---

## Step 3: Optional - Build iOS Later

After Android build completes:

```bash
# Build iOS for App Store
eas build --platform ios --profile production
```

---

## Step 4: Submit to Stores

### Option A: Auto-submit

```bash
# Submit Android to Play Store
eas submit --platform android --latest

# Submit iOS to App Store  
eas submit --platform ios --latest
```

### Option B: Manual Submission (Recommended First Time)

**Android:**
1. Download .aab from EAS build link
2. Go to https://play.google.com/console
3. Create new app → Upload to Production
4. Fill store listing → Submit

**iOS:**
1. Build auto-uploads to App Store Connect
2. Go to https://appstoreconnect.apple.com
3. Select app → Complete info → Submit

---

## Testing Commands (Optional)

```bash
# Test on device before production build
npx expo run:android
npx expo run:ios

# Development builds
eas build --platform android --profile development
eas build --platform ios --profile development
```

---

## Monitor Your Build

- Build progress: Link will appear in terminal
- All builds: https://expo.dev/accounts/[your-account]/projects/gasshub/builds
- Build history: Check EAS dashboard

---

## Expected Timeline

- Login: 1 minute
- Configuration: 1 minute  
- Android build: 15-30 minutes
- iOS build: 20-40 minutes (optional)
- Store review: 1-3 days (Android), 1-7 days (iOS)

---

**START WITH: Complete the login in your terminal now!**
