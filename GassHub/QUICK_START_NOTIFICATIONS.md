# Quick Start: Using Notifications in Your App

## ✅ Setup Complete!

Your GassHub app now has a complete notification system. Here's what you need to know:

## 🎯 What You Get

### Automatic Notifications For:
1. **📚 Course Materials** - "Check out new learning resources for {courseName}: {materialTitle}"
2. **💼 Internships** - "Check out new internship opportunities at {companyName} - {position}"
3. **🎯 Jobs** - "Check out new job opportunities at {companyName} - {position}"
4. **📢 Announcements** - Custom announcement messages
5. **💡 Learning Reminder** - Every 5 hours: "It's for Learning"

## 📱 How It Works

### When the App Starts
- Requests notification permissions automatically
- Schedules the learning reminder (every 5 hours)
- Sets up notification listeners

### User Settings
Users can control notifications in the Notification Settings screen:
- Toggle all notifications on/off
- Enable/disable specific types
- Control learning reminders

## 🚀 How to Use in Your Code

### Method 1: Using the Hook (Recommended)

```javascript
import useNotifications from './src/hooks/useNotifications';

function YourScreen() {
  const { sendJobNotification, sendInternshipNotification } = useNotifications();

  // When adding a new job
  const handleAddJob = async () => {
    // Your code to add job...
    
    // Send notification
    await sendJobNotification('Google', 'Software Engineer');
  };

  // When adding an internship
  const handleAddInternship = async () => {
    // Your code to add internship...
    
    // Send notification
    await sendInternshipNotification('Microsoft', 'Frontend Intern');
  };

  return (
    <View>
      <Button title="Add Job" onPress={handleAddJob} />
      <Button title="Add Internship" onPress={handleAddInternship} />
    </View>
  );
}
```

### Method 2: Using Helper Functions

```javascript
import { 
  addJobWithNotification,
  addInternshipWithNotification,
  uploadCourseMaterialWithNotification,
  createAnnouncementWithNotification
} from './src/utils/notificationHelpers';

// Add job with notification
const result = await addJobWithNotification({
  companyName: 'Amazon',
  position: 'Backend Developer',
  location: 'Remote',
  description: '...'
});

// Upload course material with notification
const result = await uploadCourseMaterialWithNotification('Mathematics', {
  title: 'Algebra Basics',
  content: '...',
  type: 'pdf'
});

// Create announcement with notification
const result = await createAnnouncementWithNotification({
  title: 'System Maintenance',
  message: 'Scheduled maintenance tonight at 2 AM'
});
```

### Method 3: Direct Service Usage

```javascript
import notificationService from './src/services/NotificationService';

// Send immediate notification
await notificationService.sendImmediateNotification(
  'Custom Title',
  'Custom message',
  { type: 'custom', data: 'here' }
);

// Send course material notification
await notificationService.notifyCourseMaterialUpload('Physics', 'Quantum Mechanics');

// Send internship notification
await notificationService.notifyInternshipUpdate('Tesla', 'Engineering Intern');

// Send job notification
await notificationService.notifyJobUpdate('Apple', 'iOS Developer');

// Send announcement
await notificationService.notifyAnnouncement('Important', 'Meeting tomorrow');
```

## 📋 Integration Checklist

### For Existing Screens:

- [ ] **DashboardScreen.js** - Maybe show recent notifications
- [ ] **LearningScreen.js** - Trigger notifications when uploading materials
- [ ] **CareersScreen.js** - Trigger notifications when posting jobs/internships
- [ ] **AnnouncementsScreen.js** - Trigger notifications when creating announcements
- [ ] **ProfileScreen.js** - Add link to Notification Settings

### Example Integration in Any Screen:

```javascript
// At the top of your component
import useNotifications from '../../hooks/useNotifications';

// Inside your component
const MyScreen = () => {
  const { sendAnnouncementNotification } = useNotifications();

  const handleSubmit = async () => {
    // Save data...
    
    // Send notification
    await sendAnnouncementNotification('New Update', 'Check this out!');
  };

  return (
    // Your UI
  );
};
```

## ⚙️ Configuration

### In app.json (Already configured):
- iOS notification permissions
- Android notification permissions
- Vibration and sound settings

### In _layout.tsx (Already setup):
- Permission requests on app start
- Learning reminder scheduling
- Notification listeners

## 🧪 Testing

### On Device:
1. Install the app on your physical device
2. Grant notification permissions when prompted
3. Go to Settings → Notifications to configure preferences
4. Use any of the notification functions above
5. Check if notifications appear!

### Troubleshooting:
- No notifications? Check device settings → GassHub → Notifications
- No sound? Check volume and notification settings
- Not appearing? Make sure app is not in foreground (some platforms don't show notifications when app is open)

## 🔔 Notification Flow

```
User Action (e.g., upload material)
    ↓
Call notification function
    ↓
Check user preferences
    ↓
If enabled → Send notification
    ↓
Shows on user's phone screen
```

## 💡 Best Practices

1. **Send Relevant Notifications** - Only notify for important updates
2. **Respect User Preferences** - The hook automatically checks settings
3. **Clear Messages** - Be specific about what the notification is for
4. **Timing** - Consider when you're sending notifications
5. **Testing** - Test on physical devices

## 📚 Files Created

```
GassHub/
├── src/
│   ├── services/
│   │   └── NotificationService.js       ← Core notification service
│   ├── hooks/
│   │   └── useNotifications.js          ← Easy-to-use hook
│   ├── utils/
│   │   └── notificationHelpers.js       ← Firebase + Notifications
│   └── screens/
│       └── NotificationSettingsScreen.js ← User settings
├── app/
│   └── _layout.tsx                      ← Initialized notifications
├── app.json                             ← Added permissions
└── NOTIFICATIONS_GUIDE.md               ← Full documentation
```

## 🎉 You're Ready!

The notification system is fully integrated and ready to use. Just call the notification functions whenever you want to notify users about updates!

For detailed documentation, see `NOTIFICATIONS_GUIDE.md`.
