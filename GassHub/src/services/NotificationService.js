import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  constructor() {
    this.notificationListener = null;
    this.responseListener = null;
  }

  // Request permissions for local notifications
  async registerForPushNotifications() {
    // Setup Android notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
      });
    }

    // Request permission
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Notification permission not granted');
      return null;
    }

    // Note: Push tokens require a development build or EAS project
    // For local notifications, we don't need a push token
    console.log('Local notifications enabled (no push token needed for testing)');
    return null;
  }

  // Schedule local notification
  async scheduleLocalNotification(title, body, data = {}, delaySeconds = 0) {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: delaySeconds > 0 ? { seconds: delaySeconds } : null,
    });

    return notificationId;
  }

  // Send immediate notification
  async sendImmediateNotification(title, body, data = {}) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
        vibrate: true,
      },
      trigger: null,
    });
  }

  // Course Material Upload Notification
  async notifyCourseMaterialUpload(courseName, materialTitle) {
    const title = '📚 New Learning Resource';
    const body = `Check out new learning resources for ${courseName}: ${materialTitle}`;
    
    await this.sendImmediateNotification(title, body, {
      type: 'course_material',
      courseName,
      materialTitle,
    });
  }

  // Internship Update Notification
  async notifyInternshipUpdate(companyName, position) {
    const title = '💼 New Internship Opportunity';
    const body = `Check out new internship opportunities at ${companyName} - ${position}`;
    
    await this.sendImmediateNotification(title, body, {
      type: 'internship',
      companyName,
      position,
    });
  }

  // Job Update Notification
  async notifyJobUpdate(companyName, position) {
    const title = '🎯 New Job Opportunity';
    const body = `Check out new job opportunities at ${companyName} - ${position}`;
    
    await this.sendImmediateNotification(title, body, {
      type: 'job',
      companyName,
      position,
    });
  }

  // News/Announcement Notification
  async notifyAnnouncement(title, message) {
    const notificationTitle = '📢 Announcement';
    
    await this.sendImmediateNotification(notificationTitle, message, {
      type: 'announcement',
    });
  }

  // Regular Learning Reminder (every 5 hours)
  async scheduleLearningReminder() {
    const title = "💡 It's time for Learning";
    const body = 'Time to explore new opportunities and enhance your skills on GassHub!';
    
    // Cancel any existing learning reminder
    await this.cancelScheduledNotification('learning_reminder');
    
    try {
      // Schedule notification for 5 hours from now
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { type: 'learning_reminder' },
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.DEFAULT,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 18000, // 5 hours
          repeats: false, // Set to false for testing, can be changed to true for production
        },
      });

      // Store notification ID for future reference
      await AsyncStorage.setItem('learning_reminder_id', notificationId);
      
      console.log('Learning reminder scheduled successfully:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling learning reminder:', error);
      throw error;
    }
  }

  // Cancel a scheduled notification
  async cancelScheduledNotification(identifier) {
    const notificationId = await AsyncStorage.getItem(`${identifier}_id`);
    if (notificationId) {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      await AsyncStorage.removeItem(`${identifier}_id`);
    }
  }

  // Cancel all scheduled notifications
  async cancelAllScheduledNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  // Get notification permission status
  async getPermissionStatus() {
    const { status } = await Notifications.getPermissionsAsync();
    return status;
  }

  // Setup notification listeners
  setupNotificationListeners(onNotificationReceived, onNotificationResponse) {
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      if (onNotificationReceived) {
        onNotificationReceived(notification);
      }
    });

    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      if (onNotificationResponse) {
        onNotificationResponse(response);
      }
    });
  }

  // Remove notification listeners
  removeNotificationListeners() {
    if (this.notificationListener && this.notificationListener.remove) {
      this.notificationListener.remove();
    }
    if (this.responseListener && this.responseListener.remove) {
      this.responseListener.remove();
    }
  }

  // Track when user opens the app from notification
  async handleNotificationOpen() {
    const initialNotification = await Notifications.getFirstNotificationAsync();
    if (initialNotification) {
      return initialNotification.data;
    }
    return null;
  }

  // Check for notification response (when app is already open)
  async checkNotificationResponse() {
    const response = await Notifications.getLastNotificationResponseAsync();
    if (response) {
      return response.notification.data;
    }
    return null;
  }
}

// Export singleton instance
const notificationService = new NotificationService();
export default notificationService;
