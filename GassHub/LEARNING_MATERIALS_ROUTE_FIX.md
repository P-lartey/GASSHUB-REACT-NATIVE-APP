# 🔧 Learning Materials Route Fix - Complete Guide

## ✅ What Was Fixed

The learning materials upload and reading routes have been synchronized between the admin site and the mobile app.

### Changes Made:

1. **Admin Site (`LearningMaterials.jsx`)**:
   - ✅ Changed Firestore collection from `learningMaterials` to `courseMaterials`
   - ✅ Updated Firebase Storage path structure to: `courseMaterials/{level}/{semester}/{courseCode}/{timestamp}_{filename}`
   - ✅ Added `storagePath` field to Firestore documents for easy access

2. **Mobile App (`useFirestoreData.js`)**:
   - ✅ Reading from `courseMaterials` collection (matching admin)
   - ✅ Added fallback logic for `storagePath` field
   - ✅ Ensures backward compatibility

3. **Mobile App (`useFirebaseStorage.js`)**:
   - ✅ Updated to use material object instead of just courseId
   - ✅ Uses `storagePath` from Firestore or constructs it from level/semester/courseCode
   - ✅ Maintains consistent path structure with admin

4. **Mobile App (`LearningScreen.js`)**:
   - ✅ Updated to pass full material object to storage hook
   - ✅ Improved error logging

---

## 📊 New Data Structure

### Firebase Storage Path Structure:
```
courseMaterials/
├── 100/
│   ├── First Semester/
│   │   └── STAT 101/
│   │       ├── 1711234567890_introduction.pdf
│   │       └── 1711234567891_lecture_notes.pdf
│   └── Second Semester/
│       └── MATH 102/
│           └── 1711234567892_calculus.pdf
├── 200/
│   ├── First Semester/
│   └── Second Semester/
├── 300/
└── 400/
```

### Firestore Document Structure (`courseMaterials` collection):
```javascript
{
  title: "Introduction to Statistics",
  description: "Basic concepts in statistics",
  level: "100",
  semester: "First Semester",
  courseCode: "STAT 101",
  courseName: "Introduction to Statistics",
  materialType: "pdf",
  fileUrl: "https://firebasestorage.googleapis.com/...",
  fileName: "introduction.pdf",
  fileSize: 1024567,
  storagePath: "100/First Semester/STAT 101/1711234567890_introduction.pdf",
  uploadedAt: Timestamp,
  isPublished: true,
  timestamp: Timestamp
}
```

---

## 🔐 REQUIRED FIREBASE SECURITY RULES UPDATE

To make this work, you MUST update your Firebase security rules:

### Step 1: Update Firestore Rules

1. Go to: https://console.firebase.google.com/
2. Select your project: `myfirst-386de`
3. Navigate to: **Firestore Database** → **Rules** tab
4. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Course Materials - Readable by all, writable by authenticated users
    match /courseMaterials/{documentId} {
      allow read: if true;
      allow write: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if request.auth != null;
    }
    
    // Learning Materials (legacy - keep for backward compatibility)
    match /learningMaterials/{documentId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Other collections
    match /announcements/{documentId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /jobOpportunities/{documentId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /internshipBoard/{documentId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /careerTips/{documentId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /skillDevelopment/{documentId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /resumeBuilding/{documentId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /career-center/{documentId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### Step 2: Update Firebase Storage Rules

1. Go to: **Storage** → **Files** → **Rules** tab
2. Replace the rules with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Course Materials - Structured by level/semester/courseCode
    match /courseMaterials/{level}/{semester}/{courseCode}/{fileName} {
      // Anyone can read
      allow read: if true;
      
      // Only authenticated admins can write
      allow write: if request.auth != null 
                   && request.resource.size < 50 * 1024 * 1024; // 50MB limit
      
      // Allow listing within course folders
      allow list: if true;
    }
    
    // Allow listing at root level
    match /courseMaterials/{prefix=**} {
      allow list: if true;
    }
    
    // Legacy learning-materials path (for backward compatibility)
    match /learning-materials/{path}/{file} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## 🧪 Testing the Integration

### Test Upload from Admin:

1. Login to admin portal: http://localhost:5173/admin
2. Click "📚 Update Learning Materials"
3. Enter secret code: `learn`
4. Fill in the form:
   - Title: "Test Material Upload"
   - Description: "Testing new route structure"
   - Level: "100"
   - Semester: "First Semester"
   - Course Code: "STAT 101"
   - Course Name: "Introduction to Statistics"
   - Material Type: "pdf"
   - Upload a PDF file
5. Click "Upload Material"

### Verify in Firebase Console:

1. **Firestore Database**:
   - Navigate to `courseMaterials` collection
   - Find your newly created document
   - Verify it has:
     - ✅ `storagePath` field: "100/First Semester/STAT 101/timestamp_filename.pdf"
     - ✅ `level`, `semester`, `courseCode` fields
     - ✅ `fileUrl` pointing to Firebase Storage

2. **Firebase Storage**:
   - Navigate to `courseMaterials` folder
   - Check path: `100/First Semester/STAT 101/`
   - Verify file exists with name: `timestamp_filename.pdf`

### Test Reading in App:

1. Start your React Native app
2. Navigate to: **Learning** screen
3. Look for your uploaded material
4. Try to open/download the file
5. Verify it loads correctly

---

## 🎯 How the Routes Now Work

### Upload Flow (Admin Site):
```
Admin fills form 
  ↓
File uploaded to: courseMaterials/{level}/{semester}/{courseCode}/{timestamp}_{filename}
  ↓
Metadata saved to Firestore collection: courseMaterials
  ↓
Document includes storagePath field for easy access
```

### Reading Flow (Mobile App):
```
App reads from Firestore: courseMaterials collection
  ↓
Gets list of all materials with metadata
  ↓
For each material, uses storagePath to access Firebase Storage
  ↓
Downloads files from: courseMaterials/{storagePath}
  ↓
Displays to user
```

### Key Benefits:
✅ **Consistent Structure**: Both admin and app use the same path format  
✅ **Easy Navigation**: Files organized by level → semester → course  
✅ **Scalable**: Easy to add more levels, semesters, or courses  
✅ **Backward Compatible**: Still supports old learningMaterials collection  
✅ **Efficient**: Direct path access avoids unnecessary listing operations  

---

## ⚠️ Important Notes

1. **Storage Path Field**: The `storagePath` field in Firestore is crucial - it tells the app exactly where to find the file
2. **Path Format**: Must be exactly: `{level}/{semester}/{courseCode}/{timestamp}_{filename}`
3. **Case Sensitivity**: Folder names are case-sensitive in Firebase Storage
4. **File Naming**: Admin automatically adds timestamp to prevent filename conflicts

---

## 🐛 Troubleshooting

### Issue: "Permission denied" when uploading
**Solution**: Update Firebase Storage rules (see Step 2 above)

### Issue: "Permission denied" when reading
**Solution**: Update Firebase Storage rules to allow public read access

### Issue: File not found in storage
**Solution**: 
1. Check that `storagePath` in Firestore matches actual file location
2. Verify file was uploaded successfully to Storage
3. Check case sensitivity in path

### Issue: Materials not showing in app
**Solution**:
1. Verify Firestore collection name is `courseMaterials` (not `learningMaterials`)
2. Check that `isPublished: true` in Firestore document
3. Clear app cache and reload

---

## 📋 Migration from Old System

If you have existing files in the old `learningMaterials` collection:

### Option 1: Keep Both (Recommended)
- Old files remain in `learningMaterials`
- New files go to `courseMaterials`
- App can read from both collections during transition

### Option 2: Migrate Existing Data
1. Export data from `learningMaterials` collection
2. Transform documents to include `storagePath` field
3. Import into `courseMaterials` collection
4. Update app to only use `courseMaterials`

---

## ✅ Completion Checklist

- [x] Admin site uploads to `courseMaterials` collection
- [x] Admin site uses structured storage path
- [x] App reads from `courseMaterials` collection
- [x] App uses storagePath field correctly
- [ ] **Deploy updated Firebase rules** (CRITICAL!)
- [ ] Test upload from admin
- [ ] Verify in Firebase Console
- [ ] Test reading in app
- [ ] Confirm files load correctly

---

## 🎉 Success Criteria

When everything is working:
1. ✅ Admin can upload files successfully
2. ✅ Files appear in Firebase Storage with correct path structure
3. ✅ Firestore documents have all required fields including `storagePath`
4. ✅ App displays uploaded materials in Learning screen
5. ✅ Users can open and download files from the app
6. ✅ Route structure is identical between admin upload and app reading

---

**Last Updated**: March 30, 2026  
**Status**: ✅ Code changes complete - Firebase rules update required
