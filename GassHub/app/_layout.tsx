import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import notificationService from '@/src/services/NotificationService';
import * as Notifications from 'expo-notifications';

// Removed tabs configuration since main navigation is handled in Dashboard

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    // Initialize notifications when app starts
    const initializeNotifications = async () => {
      try {
        // Request permissions for local notifications
        await notificationService.registerForPushNotifications();

        // Schedule the regular learning reminder (every 5 hours)
        // For testing, we'll schedule it for 10 seconds instead of 5 hours
        // Uncomment the line below and comment out the test line for production
        await notificationService.scheduleLearningReminder();
        
        // TEST MODE: Schedule in 10 seconds for testing (remove in production)
        // await notificationService.scheduleLocalNotification(
        //   "💡 It's time for Learning",
        //   'Time to explore new opportunities and enhance your skills on GassHub!',
        //   { type: 'learning_reminder' },
        //   10 // 10 seconds for testing
        // );
        
        console.log('Notifications initialized successfully');
      } catch (error) {
        console.error('Error initializing notifications:', error);
      }
    };

    initializeNotifications();

    // Setup notification listeners
    const handleNotificationReceived = (notification: Notifications.Notification) => {
      console.log('Notification received:', notification);
    };

    const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
      const notificationData = response.notification.request.content.data;
      console.log('User tapped on notification:', notificationData);
      // Handle navigation based on notification data
      if (notificationData) {
        // You can add navigation logic here based on notification type
      }
    };

    notificationService.setupNotificationListeners(
      handleNotificationReceived,
      handleNotificationResponse
    );

    // Cleanup listeners on unmount
    return () => {
      notificationService.removeNotificationListeners();
    };
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
