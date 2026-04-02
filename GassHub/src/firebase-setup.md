# Firebase Setup Instructions for GASSHUB

## Setting up Firebase Backend

To connect your GASSHUB app to Firebase for real-time data synchronization, follow these steps:

### 1. Create a Firebase Project
- Go to [Firebase Console](https://console.firebase.google.com/)
- Click "Add project" or select an existing project
- Follow the setup wizard to create your project

### 2. Register Your App
- In the Firebase Console, click on "Project Overview" and then "+ Add app"
- Select either Android or iOS depending on your target platform
- For Android: Register with package name `com.gasshub` (or your app's package name)
- For iOS: Register with bundle ID `com.gasshub.GASSHUB` (or your app's bundle ID)

### 3. Configure Firebase SDK
- Download the configuration file:
  - Android: `google-services.json` (place in `android/app/`)
  - iOS: `GoogleService-Info.plist` (drag into Xcode project in the `ios/` folder)
- Install the Firebase config file by replacing the placeholder values in `src/services/FirebaseConfig.js`

### 4. Update Firebase Configuration
Replace the placeholder values in `src/services/FirebaseConfig.js` with your actual Firebase project configuration:

```javascript
const firebaseConfig = {
  apiKey: "your_actual_api_key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your_sender_id",
  appId: "your_app_id",
  measurementId: "your_measurement_id"
};
```

### 5. Set Up Firestore Collections
Create the following collections in Cloud Firestore with sample documents:

#### Course Materials Collection: `courseMaterials`
Sample document structure:
```javascript
{
  "material_id": "unique_id",
  "title": "Course Title",
  "subject": "Mathematics",
  "instructor": "Dr. John Doe",
  "description": "Detailed course description",
  "file_url": "https://example.com/material.pdf",
  "created_at": "2025-01-15",
  "updated_at": "2025-01-15",
  "is_active": true
}
```

#### Announcements Collection: `announcements`
Sample document structure:
```javascript
{
  "announcement_id": "unique_id",
  "title": "Important Announcement",
  "author": "Admin",
  "content": "Detailed announcement content",
  "timestamp": "2025-01-15T10:30:00Z",
  "category": "Academic",
  "is_urgent": false,
  "is_active": true
}
```

#### Job Opportunities Collection: `jobOpportunities`
Sample document structure:
```javascript
{
  "job_id": "unique_id",
  "title": "Job Title",
  "company": "Company Name",
  "location": "City, Country",
  "job_type": "full-time",
  "experience_level": "entry",
  "salary_range": "$50,000 - $70,000",
  "description": "Job description",
  "requirements": ["Requirement 1", "Requirement 2"],
  "benefits": ["Benefit 1", "Benefit 2"],
  "apply_link": "https://company.com/apply",
  "posted_date": "2025-01-15",
  "deadline": "2025-02-15",
  "is_active": true,
  "is_urgent": false
}
```

#### Internships Collection: `internships`
Sample document structure similar to job opportunities.

#### Skill Development Resources Collection: `skillDevelopment`
Sample document structure:
```javascript
{
  "course_id": "unique_id",
  "title": "Course Title",
  "platform": "Platform Name",
  "category": ["Category1", "Category2"],
  "description": "Course description",
  "link": "https://platform.com/course",
  "duration": "Duration",
  "level": "Beginner",
  "is_free": true,
  "cost": "Free or Cost",
  "added_date": "2025-01-15",
  "is_active": true,
  "featured": false
}
```

#### Resume Building Resources Collection: `resumeResources`
Sample document structure:
```javascript
{
  "resource_id": "unique_id",
  "type": "video|tool|template",
  "title": "Resource Title",
  "description": "Resource description",
  "url": "https://example.com/resource",
  "category": "Category",
  "duration": "Duration (for videos)",
  "author": "Author Name",
  "language": "Language",
  "file_url": "Direct file URL",
  "is_active": true
}
```

#### Career Tips Collection: `careerTips`
Sample document structure:
```javascript
{
  "tip_id": "unique_id",
  "title": "Tip Title",
  "description": "Tip description",
  "videoUrl": "YouTube embed URL",
  "cvLink": "CV building tool link",
  "category": "Interview|CV|Networking"
}
```

#### Career Center General Info Document: `careerCenter/generalInfo`
Document structure:
```javascript
{
  "partnershipInfo": {
    "title": "Partnership Opportunities",
    "description": "Partnership description",
    "provides": ["What we provide to partners"],
    "offers": ["What partners offer us"],
    "contactEmail": "contact@email.com"
  }
}
```

### 6. Set Up Security Rules
In the Firebase Console under Firestore Database, update your security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to all documents
    match /{document=**} {
      allow read, write: if true;  // Adjust as needed for production
    }
  }
}
```

⚠️ **Security Warning**: The above rules allow read/write access to all users. For production, implement proper authentication and authorization rules.

### 7. Run the App
After setting up Firebase:
1. Make sure all required dependencies are installed
2. Build and run your React Native app
3. The app will now fetch data in real-time from your Firebase collections

### Troubleshooting
- If the app doesn't connect to Firebase, verify your network connection and configuration values
- Check the device logs for any Firebase connection errors
- Ensure your Firestore security rules allow read access to the collections
- Make sure you've added the required Google Services files to the native project directories

Changes made in your Firebase collections will now reflect in real-time in your GASSHUB app!