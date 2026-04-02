import React, {useState, useEffect, useRef, useCallback, useMemo} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, SafeAreaView, StatusBar, Image, ImageBackground, Animated, PanResponder} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

const {width} = Dimensions.get('window');

// Animated Bar Graph Component with Color Cycling
const BarGraph = ({ width, height, barCount = 12 }) => {
  const [barValues, setBarValues] = useState([]);
  const [currentColorIndex, setCurrentColorIndex] = useState(0);
  
  // Color cycle: green -> blue -> white
  const colors = ['#10B981', '#3B82F6', '#FFFFFF'];
  
  // Initialize random bar values
  useEffect(() => {
    const initialValues = [];
    for (let i = 0; i < barCount; i++) {
      initialValues.push(Math.random() * 0.8 + 0.2); // Random values between 0.2 and 1.0
    }
    setBarValues(initialValues);
  }, [barCount]);
  
  // Animate bars and cycle colors
  useEffect(() => {
    const valueInterval = setInterval(() => {
      setBarValues(prev => 
        prev.map(() => Math.random() * 0.8 + 0.2)
      );
    }, 800); // Update values every 800ms
    
    const colorInterval = setInterval(() => {
      setCurrentColorIndex(prev => (prev + 1) % colors.length);
    }, 1500); // Cycle colors every 1500ms
    
    return () => {
      clearInterval(valueInterval);
      clearInterval(colorInterval);
    };
  }, [colors.length]);
  
  const barWidth = width / barCount - 2; // Space between bars
  const currentColor = colors[currentColorIndex];
  
  return (
    <View style={{ width, height, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around' }}>
      {barValues.map((value, index) => (
        <Animated.View
          key={index}
          style={{
            width: barWidth,
            height: value * height * 0.8, // Max 80% of container height
            backgroundColor: currentColor,
            borderRadius: 2,
            opacity: 0.9,
          }}
        />
      ))}
    </View>
  );
};

const DashboardScreen = ({navigation}) => {
  const { colors, isDarkMode } = useTheme();
  const { getUserFirstName, getUserFirstNameAsync, logout } = useAuth();
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);
  const [userName, setUserName] = useState('User');
  const intervalRef = useRef(null);
  const lastNavigationTime = useRef(0);
  const bounceValue = useRef(new Animated.Value(0)).current;
  
  // Debounced navigation function to prevent double taps
  const navigateWithDebounce = useCallback((screen) => {
    const now = Date.now();
    // Prevent navigation if called within 500ms of last navigation
    if (now - lastNavigationTime.current < 500) {
      return;
    }
    lastNavigationTime.current = now;
    navigation.navigate(screen);
  }, [navigation]);

  // Images for the slideshow
  const slideshowImages = [
    require('../../assets/images/dash1.jpg'),
    require('../../assets/images/dash2.jpg'),
    require('../../assets/images/dash3.jpg'),
    require('../../assets/images/dash4.jpg'),
    require('../../assets/images/dash5.jpg'),
    require('../../assets/images/dash6.jpg'),
    require('../../assets/images/dash7.jpg'),
    require('../../assets/images/dash9.jpeg'),
  ];
  
  // Button images
  const slideImage = require('../../assets/images/slideimage.jpg');
  const careerImage = require('../../assets/images/careerimage.jpg');
  const chatImage = require('../../assets/images/chatimage.jpg');
  const announceImage = require('../../assets/images/anounceimage.jpg');

  // Auto-rotate the slideshow
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % slideshowImages.length);
    }, 3000); // Change image every 3 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Bounce animation for welcome text
  useEffect(() => {
    const bounceAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(bounceValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    
    bounceAnimation.start();
    
    return () => bounceAnimation.stop();
  }, [bounceValue]);

  // Load user's first name
  useEffect(() => {
    const loadUserName = async () => {
      const firstName = await getUserFirstNameAsync();
      setUserName(firstName);
    };
    loadUserName();
  }, []);

  // Mock data for the dashboard metrics
  const metrics = [];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E40AF" />
        
      {/* Status Bar Area */}
      <View style={styles.statusBarArea}>
        <SafeAreaView>
          <View style={styles.statusBarContent}>
            <TouchableOpacity 
              style={styles.notificationButton}
              onPress={() => navigateWithDebounce('announcements')}
            >
              <View style={styles.notificationIconContainer}>
                <View style={styles.notificationBellWrapper}>
                  <Text style={styles.notificationBellIcon}>🔔</Text>
                </View>
                <View style={styles.notificationDot} />
              </View>
            </TouchableOpacity>
            
            <View style={styles.headerCenter}>
              <View style={styles.titleWrapper}>
                <Text style={styles.appTitle}>GASSHUB</Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.profileButton}
              onPress={() => navigation.navigate('profile')}
            >
              <View style={styles.profileIconWrapper}>
                <Text style={styles.profileIcon}>👤</Text>
              </View>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
      
      {/* Logout Menu - Removed as per requirement */}
      {/* {showLogoutMenu && (
        <View style={styles.logoutMenuContainer}>
          <TouchableOpacity 
            style={styles.logoutMenuItem}
            onPress={() => {
              // Handle logout logic here
              console.log('User logged out');
              setShowLogoutMenu(false);
              // You can add navigation to login screen here
              // navigation.navigate('login') or similar
            }}
          >
            <Text style={styles.logoutMenuText}>Logout</Text>
          </TouchableOpacity>
        </View>
      )} */}
      {/* Slideshow Header */}
      <View style={styles.slideshowContainer}>
        <View style={styles.slideshowHeaderWave} />
        <View style={styles.slideshowContent}>
          <Image 
            source={slideshowImages[currentIndex]}
            style={styles.slideshowImage}
            resizeMode="cover"
          />
          <View style={styles.slideshowOverlay}>
            {/* Yo Button at Top Left Corner */}
            <View style={styles.yoButton}>
              <Animated.Text 
                style={[styles.yoText, {
                  transform: [{
                    translateY: bounceValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -5]
                    })
                  }]
                }]}
              >
                Yo {userName}
              </Animated.Text>
            </View>
            
            {/* Love Button at Top Right Corner */}
            <TouchableOpacity style={styles.loveButton}>
              <Text style={styles.loveIcon}>🤍</Text>
            </TouchableOpacity>
            
            <View style={styles.welcomeTextContainer}>
              <Text style={styles.welcomeToGasshub}>Welcome to GASSHUB</Text>
            </View>
            
            {/* Animated Bar Graph below subtitle */}
            <View style={styles.graphContainerBelow}>
              <BarGraph 
                width={width - 80} 
                height={40} 
                barCount={12}
              />
            </View>
          </View>
          <View style={styles.indicatorContainer}>
            {slideshowImages.map((_, index) => (
              <View 
                key={index}
                style={[
                  styles.indicatorDot,
                  currentIndex === index ? styles.activeIndicatorDot : styles.inactiveIndicatorDot
                ]}
              />
            ))}
          </View>
        </View>
      </View>
  
      {/* Content Container */}
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Quick Action Buttons */}
        <View style={styles.quickActionsContainer}>
          <View style={styles.quickAccessGlassContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Access</Text>
          </View>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={styles.imageButtonContainer}
              onPress={() => navigateWithDebounce('learning')}
            >
              <ImageBackground 
                source={slideImage}
                style={styles.imageButton}
                imageStyle={styles.imageButtonImage}
              >
                <View style={styles.imageButtonTopOverlay}>
                  <Text style={styles.imageButtonIcon}>📚</Text>
                </View>
                <View style={styles.imageButtonBottomOverlay}>
                  <Text style={styles.imageButtonText}>Course Materials</Text>
                </View>
              </ImageBackground>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.imageButtonContainer}
              onPress={() => navigateWithDebounce('careers')}
            >
              <ImageBackground 
                source={careerImage}
                style={styles.imageButton}
                imageStyle={styles.imageButtonImage}
              >
                <View style={styles.imageButtonTopOverlay}>
                  <Text style={styles.imageButtonIcon}>💼</Text>
                </View>
                <View style={styles.imageButtonBottomOverlay}>
                  <Text style={styles.imageButtonText}>Career Centre</Text>
                </View>
              </ImageBackground>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.imageButtonContainer}
              onPress={() => navigateWithDebounce('announcements')}
            >
              <ImageBackground 
                source={announceImage}
                style={styles.imageButton}
                imageStyle={styles.imageButtonImage}
              >
                <View style={styles.imageButtonTopOverlay}>
                  <Text style={styles.imageButtonIcon}>📢</Text>
                </View>
                <View style={styles.imageButtonBottomOverlay}>
                  <Text style={styles.imageButtonText}>Updates</Text>
                </View>
              </ImageBackground>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.imageButtonContainer}
              onPress={() => navigateWithDebounce('chat')}
            >
              <ImageBackground 
                source={chatImage}
                style={styles.imageButton}
                imageStyle={styles.imageButtonImage}
              >
                <View style={styles.imageButtonTopOverlay}>
                  <Text style={styles.imageButtonIcon}>💬</Text>
                </View>
                <View style={styles.imageButtonBottomOverlay}>
                  <Text style={styles.imageButtonText}>Chat</Text>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  statusBarArea: {
    backgroundColor: '#1E40AF',
    paddingTop: StatusBar.currentHeight || 0,
  },
  statusBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  profileButton: {
    padding: 8,
  },
  profileIconWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  titleWrapper: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  appTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  notificationButton: {
    padding: 8,
  },
  notificationIconContainer: {
    position: 'relative',
  },
  notificationBellWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBellIcon: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  notificationDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#1E40AF',
  },
  logoutMenuContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    zIndex: 100,
  },
  logoutMenuItem: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  logoutMenuText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '600',
  },
  profileIcon: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  orangeHeader: {
    backgroundColor: '#1E40AF',
    paddingBottom: 30,
  },
  headerWave: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
    backgroundColor: '#F8F9FA',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  profitCard: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: 'rgba(255, 107, 53, 0.9)',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    position: 'relative',
  },
  profitLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 10,
    fontWeight: '500',
  },
  profitAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  trendArrow: {
    fontSize: 16,
    color: '#4ADE80',
    marginRight: 5,
  },
  trendText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  progressIndicator: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    opacity: 0.7,
  },
  scrollContent: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 20,
  },
  metricCard: {
    width: (Dimensions.get('window').width - 60) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  metricIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  metricIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  metricInfo: {
    flex: 1,
  },
  metricTitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 5,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  metricChangeContainer: {
    alignItems: 'flex-end',
  },
  metricChange: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: 'bold',
  },
  updateText: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'left',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  navItem: {
    alignItems: 'center',
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 5,
    color: '#999999',
  },
  navText: {
    fontSize: 12,
    color: '#999999',
  },
  activeNav: {
    color: '#FF6B6B',
  },
  activeNavText: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
  quickActionsContainer: {
    flex: 1,
    marginTop: -20, // Move Quick Access buttons upward
  },
  quickAccessGlassContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    // Glass effect
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    alignSelf: 'flex-start', // Tighten container to text width
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  imageButtonContainer: {
    width: (width - 60) / 2,
    height: 120,
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageButtonImage: {
    borderRadius: 15,
  },
  imageButtonTopOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
  },
  imageButtonBottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF', // White background instead of blue
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  imageButtonIcon: {
    fontSize: 32,
    marginBottom: 8,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  imageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333333', // Dark text for better contrast on white background
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  slideshowContainer: {
    backgroundColor: '#1E40AF',
    paddingBottom: 30,
    position: 'relative',
    top: -30, // Move only blue background upward
  },
  slideshowHeaderWave: {
    position: 'absolute',
    bottom: -10, // Return to original position below slideshow
    left: 0,
    right: 0,
    height: 30,
    backgroundColor: '#F8F9FA',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  slideshowContent: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    height: 240, // Increased height for larger surface area
  },
  slideshowImage: {
    width: '100%',
    height: '100%',
  },
  slideshowOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  slideshowTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 5,
  },
  welcomeSubtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  welcomeTextContainer: {
    alignItems: 'center',
    marginBottom: 5,
  },
  yoButton: {
    position: 'absolute',
    top: 15,
    left: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  yoText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  welcomeToGasshub: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  loveButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loveIcon: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  slideshowSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  graphContainerBelow: {
    marginTop: 15,
    alignItems: 'center',
    zIndex: 1,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeIndicatorDot: {
    backgroundColor: '#FFFFFF',
  },
  inactiveIndicatorDot: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
});

export default DashboardScreen;