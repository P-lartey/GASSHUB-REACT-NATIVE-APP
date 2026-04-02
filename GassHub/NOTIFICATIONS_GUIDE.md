# Notification System Guide

## Overview
The GassHub app now has a comprehensive notification system that sends push notifications for:
- 📚 Course material uploads
- 💼 Internship opportunities
- 🎯 Job opportunities
- 📢 Announcements and news
- 💡 Learning reminders (every 5 hours)

## Setup Complete ✅

### Installed Packages
- `expo-notifications` - For handling local and push notifications

### Files Created/Modified

1. **NotificationService.js** (`src/services/NotificationService.js`)
   - Core notification service
   - Handles all notification types
   - Manages permissions and scheduling

2. **useNotifications.js** (`src/hooks/useNotifications.js`)
   - React hook for easy notification usage
   - Respects user preferences
   - Type-safe notification sending

3. **NotificationSettingsScreen.js** (`src/screens/NotificationSettingsScreen.js`)
   - User settings for notifications
   - Toggle individual notification types
   - Manage learning reminders

4. **app.json**
   - Added notification permissions for iOS and Android
   - Configured notification display messages

5. **_layout.tsx**
   - Initialized notification system on app start
   - Scheduled learning reminders
   - Setup notification listeners

## How to Send Notifications

### From Any Component or Screen

```javascript
import useNotifications from '@/src/hooks/useNotifications';

function YourComponent() {
  const { 
    sendCourseMaterialNotification,
    sendInternshipNotification,
    sendJobNotification,
    sendAnnouncementNotification,
    sendCustomNotification 
  } = useNotifications();

  // Send course material notification
  const handleMaterialUpload = async () => {
    await sendCourseMaterialNotification('Mathematics', 'Calculus Chapter 3');
    // Shows: "📚 New Learning Resource - Check out new learning resources for Mathematics: Calculus Chapter 3"
  };

  // Send internship notification
  const handleNewInternship = async () => {
    await sendInternshipNotification('Google', 'Software Engineering Intern');
    // Shows: "💼 New Internship Opportunity - Check out new internship opportunities at Google - Software Engineering Intern"
  };

  // Send job notification
  const handleNewJob = async () => {
    await sendJobNotification('Microsoft', 'Senior Developer');
    // Shows: "🎯 New Job Opportunity - Check out new job opportunities at Microsoft - Senior Developer"
  };

  // Send announcement
  const handleAnnouncement = async () => {
    await sendAnnouncementNotification('System Update', 'Scheduled maintenance tonight');
    // Shows: "📢 Announcement - Scheduled maintenance tonight"
  };

  // Send custom notification
  const handleCustom = async () => {
    await sendCustomNotification(
      'Custom Title', 
      'Custom message body',
      { type: 'custom', customData: 'value' }
    );
  };

  return (
    <View>
      <Button title="Upload Material" onPress={handleMaterialUpload} />
      <Button title="Add Internship" onPress={handleNewInternship} />
      <Button title="Post Job" onPress={handleNewJob} />
      <Button title="Announce" onPress={handleAnnouncement} />
    </View>
  );
}
```

### Direct Service Usage (Advanced)

```javascript
import notificationService from '@/src/services/NotificationService';

// Send immediate notification
await notificationService.sendImmediateNotification(
  'Title',
  'Body message',
  { type: 'custom', data: 'here' }
);

// Schedule delayed notification
await notificationService.scheduleLocalNotification(
  'Reminder',
  'This will show after 5 seconds',
  {},
  5 // delay in seconds
);
```

## Notification Messages

### Course Material Upload
- **Title**: 📚 New Learning Resource
- **Body**: Check out new learning resources for {courseName}: {materialTitle}

### Internship Update
- **Title**: 💼 New Internship Opportunity
- **Body**: Check out new internship opportunities at {companyName} - {position}

### Job Update
- **Title**: 🎯 New Job Opportunity
- **Body**: Check out new job opportunities at {companyName} - {position}

### Announcement
- **Title**: 📢 Announcement
- **Body**: {message}

### Learning Reminder (Every 5 Hours)
- **Title**: 💡 It's for Learning
- **Body**: Time to explore new opportunities and enhance your skills on GassHub!

## User Settings

Users can control notifications through the Settings screen:
- Toggle all notifications on/off
- Enable/disable specific notification types
- Control learning reminders
- Check permission status

## Testing Notifications

### On Physical Device
1. Run the app on your device
2. Grant notification permissions when prompted
3. Navigate to Notification Settings to configure preferences
4. Use the notification functions in your code

### On Simulator/Emulator
- iOS Simulator: Supports local notifications
- Android Emulator: Supports local notifications
- Push notifications require a physical device or proper Firebase setup

## Adding to Firebase Data Updates

To automatically send notifications when data changes in Firebase:

```javascript
// Example: In your Firebase update function
import useNotifications from '@/src/hooks/useNotifications';

const addNewJob = async (jobData) => {
  const { sendJobNotification } = useNotifications();
  
  // Add job to Firebase
  await addDoc(collection(db, 'jobs'), jobData);
  
  // Send notification
  await sendJobNotification(jobData.companyName, jobData.position);
};

const uploadCourseMaterial = async (courseName, materialTitle) => {
  const { sendCourseMaterialNotification } = useNotifications();
  
  // Upload material logic here
  await uploadToFirebase(materialData);
  
  // Send notification
  await sendCourseMaterialNotification(courseName, materialTitle);
};
```

## Important Notes

1. **Permissions**: The app requests notification permissions on first launch
2. **Physical Device**: Push notifications require a physical device
3. **Background**: Notifications work even when the app is in background
4. **Learning Reminder**: Automatically scheduled every 5 hours when enabled
5. **User Control**: Users can disable any notification type in settings

## Troubleshooting

### Notifications Not Showing
1. Check notification permissions in device settings
2. Verify notification is enabled in app settings
3. Ensure you're testing on a physical device for push notifications
4. Check console logs for errors

### Learning Reminder Not Working
1. Check if learning reminder is enabled in settings
2. Restart the app to reschedule notifications
3. Check AsyncStorage for saved settings

### Custom Sounds
- Default sound is used currently
- For custom sounds, add audio files to project and configure in NotificationService

## Next Steps

1. Integrate notification calls into your existing Firebase update functions
2. Test on physical devices
3. Configure Firebase Cloud Messaging for production push notifications
4. Add notification tap handling for deep linking to specific screens
