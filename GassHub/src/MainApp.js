import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  Dimensions, 
  FlatList, 
  Image, 
  ImageBackground, 
  Linking, 
  Modal, 
  StatusBar, 
  SafeAreaView,
  Animated,
  Easing
} from 'react-native';

import WebView from 'react-native-webview';
import LoginScreen from './screens/LoginScreen';
import SignInScreen from './screens/SignInScreen';
import SignUpScreen from './screens/SignUpScreen';
import PasswordResetScreen from './screens/PasswordResetScreen';
import DashboardScreen from './screens/DashboardScreen';
import LearningScreen from './screens/LearningScreen';
import CareersScreen from './screens/CareersScreen';
import AnnouncementsScreen from './screens/AnnouncementsScreen';
import ChatScreen from './screens/ChatScreen';
import ProfileScreen from './screens/ProfileScreen';
import PersonalInfoScreen from './screens/PersonalInfoScreen';
import AboutUsScreen from './screens/AboutUsScreen';
import ReportConcernScreen from './screens/ReportConcern';
import { useTheme } from './theme/ThemeContext';
import { useAnnouncements } from './hooks/useFirestoreData';
import { useCareerCenterData } from './hooks/useFirestoreData';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const { width, height } = Dimensions.get('window');

// Create a custom gradient component using native View
const GradientHeader = ({ children, style }) => {
  return ( 
    <View style ={style}>
        {children}
    </View>
  );
};

// Main App Component with Authentication
const MainAppContent = () => {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const { isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('login');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWebViewModalVisible, setIsWebViewModalVisible] = useState(false);
  const [webViewUrl, setWebViewUrl] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const fadeAnim = useState(new Animated.Value(1))[0];
  const slideAnim = useState(new Animated.Value(0))[0];

  // Update active tab based on authentication state
  useEffect(() => {
    if (!loading) {
      if (isAuthenticated()) {
        setActiveTab('dashboard');
      } else {
        setActiveTab('login');
      }
    }
  }, [isAuthenticated, loading]);

  // Handle login success
  const handleLoginSuccess = () => {
    setActiveTab('dashboard');
    animateTransition();
  };

  // Handle logout
  const handleLogout = () => {
    setActiveTab('login');
    animateTransition();
  };

  // Animation for screen transitions
  const animateTransition = () => {
    setIsAnimating(true);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      })
    ]).start(() => setIsAnimating(false));
  };

  // Reset animation values
  const resetAnimations = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(height);
  };

  // Handle tab changes with animations
  const handleTabChange = (tab) => {
    console.log('handleTabChange called with tab:', tab);
    if (tab !== activeTab) {
      console.log('Changing from', activeTab, 'to', tab);
      setActiveTab(tab);
      animateTransition();
    }
  };

  // Render different screens based on activeTab
  const renderActiveScreen = () => {
    // Show loading screen while auth state is being determined
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      );
    }
    
    switch (activeTab) {
      case 'login':
        return (
          <Animated.View 
            style={[
              styles.screenContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <LoginScreen navigation={{ navigate: handleTabChange }} />
          </Animated.View>
        );
      case 'SignIn':
        return (
          <Animated.View 
            style={[
              styles.screenContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <SignInScreen navigation={{ navigate: handleTabChange, goBack: () => handleTabChange('login') }} />
          </Animated.View>
        );
      case 'SignUp':
        return (
          <Animated.View 
            style={[
              styles.screenContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <SignUpScreen navigation={{ navigate: handleTabChange, goBack: () => handleTabChange('login') }} />
          </Animated.View>
        );
      case 'PasswordReset':
        return (
          <Animated.View 
            style={[
              styles.screenContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <PasswordResetScreen navigation={{ navigate: handleTabChange, goBack: () => handleTabChange('SignIn') }} />
          </Animated.View>
        );
      case 'dashboard':
        return (
          <Animated.View 
            style={[
              styles.screenContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <DashboardScreen 
              navigation={{ navigate: handleTabChange }} 
              onLogout={handleLogout}
            />
          </Animated.View>
        );
      case 'learning':
        return (
          <Animated.View 
            style={[
              styles.screenContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <LearningScreen onBackPress={() => handleTabChange('dashboard')} />
          </Animated.View>
        );
      case 'careers':
        return (
          <Animated.View 
            style={[
              styles.screenContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <CareersScreen onBackPress={() => handleTabChange('dashboard')} />
          </Animated.View>
        );
      case 'announcements':
        return (
          <Animated.View 
            style={[
              styles.screenContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <AnnouncementsScreen onBackPress={() => handleTabChange('dashboard')} />
          </Animated.View>
        );
      case 'chat':
        return (
          <Animated.View 
            style={[
              styles.screenContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <ChatScreen onBackPress={() => handleTabChange('dashboard')} />
          </Animated.View>
        );
      case 'profile':
        return (
          <Animated.View 
            style={[
              styles.screenContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <ProfileScreen 
              navigation={{ navigate: handleTabChange }} 
              onBackPress={() => handleTabChange('dashboard')} 
            />
          </Animated.View>
        );
      case 'personal-info':
        return (
          <Animated.View 
            style={[
              styles.screenContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <PersonalInfoScreen 
              navigation={{ navigate: handleTabChange }} 
              onBackPress={() => handleTabChange('profile')} 
            />
          </Animated.View>
        );
      case 'AboutUs':
        return (
          <Animated.View 
            style={[
              styles.screenContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <AboutUsScreen 
              navigation={{ navigate: handleTabChange }} 
              onBackPress={() => handleTabChange('profile')} 
            />
          </Animated.View>
        );
      case 'report-concern':
        return (
          <Animated.View 
            style={[
              styles.screenContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <ReportConcernScreen 
              navigation={{ navigate: handleTabChange }} 
              onBackPress={() => handleTabChange('profile')} 
            />
          </Animated.View>
        );
      default:
        return (
          <Animated.View 
            style={[
              styles.screenContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <LoginScreen navigation={{ navigate: handleTabChange }} />
          </Animated.View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle={isDarkMode ? "light-content" : "dark-content"} 
        backgroundColor={isDarkMode ? "#000000" : "#FFFFFF"}
      />
      
      {renderActiveScreen()}

      {/* WebView Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={isWebViewModalVisible}
        onRequestClose={() => setIsWebViewModalVisible(false)}
      >
        <View style={styles.webViewContainer}>
          <View style={styles.webViewHeader}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setIsWebViewModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          {webViewUrl ? (
            <WebView
              source={{ uri: webViewUrl }}
              style={styles.webView}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={true}
              scalesPageToFit={true}
            />
          ) : null}
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// Main App Wrapper with Auth Provider
const MainApp = () => {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  screenContainer: {
    flex: 1,
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  webViewHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 10,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  closeButton: {
    padding: 10,
    backgroundColor: '#FF6B6B',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    fontSize: 18,
    color: '#666666',
  },
});

export default MainApp;