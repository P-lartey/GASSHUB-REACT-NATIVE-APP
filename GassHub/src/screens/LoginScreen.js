import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
  Animated
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  
  // Animation for bouncing text
  const bounceAnim = useRef(new Animated.Value(0)).current;

  // Check if user is already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      // User is already logged in, navigate to dashboard
      navigation.navigate('dashboard');
    }
  }, [isAuthenticated, navigation]);
  
  // Start bouncing animation
  useEffect(() => {
    const bounceAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -10,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    
    bounceAnimation.start();
    
    return () => {
      bounceAnimation.stop();
    };
  }, []);

  const handleSignIn = () => {
    navigation.navigate('SignIn');
  };

  const handleSignUp = () => {
    navigation.navigate('SignUp');
  };

  // Show loading indicator while checking auth state
  if (isAuthenticated()) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0078FF" />
        <Text style={styles.loadingText}>Checking authentication...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        backgroundColor="#0078FF" 
        barStyle="light-content" 
      />
      
      <View style={styles.mainContainer}>
        <View style={styles.scrollContainer}>
          {/* Blue Header Section */}
          <View style={styles.blueHeader}>
            <View style={styles.headerContent}>
              <Animated.View style={[styles.brandContainer, { transform: [{ translateY: bounceAnim }] }]}>
                <Text style={styles.brandTextFull}>GASSHUB</Text>
              </Animated.View>
              <Text style={styles.motoText}>Learn. Grow. Lead.</Text>
            </View>
          </View>

          {/* White Content Section */}
          <View style={styles.whiteContainer}>
            <View style={styles.contentArea}>
              <Text style={styles.welcomeTitle}>Welcome</Text>
              <Text style={styles.welcomeSubtitle}>Get started with your account</Text>
              
              {/* Sign In Button */}
              <TouchableOpacity 
                style={styles.signInButton} 
                onPress={handleSignIn}
              >
                <Text style={styles.buttonText}>Sign in</Text>
              </TouchableOpacity>
              
              {/* Sign Up Button */}
              <TouchableOpacity 
                style={styles.secondaryButton} 
                onPress={handleSignUp}
              >
                <Text style={styles.secondaryButtonText}>Sign up</Text>
              </TouchableOpacity>
              
            </View>
          </View>
        </View>
      </View>
      
      {/* Static white background for phone navigation area */}
      <View style={styles.bottomBackground} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0078FF',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0078FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 10,
  },
  mainContainer: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  blueHeader: {
    backgroundColor: '#0078FF',
    height: height * 0.45,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  headerContent: {
    alignItems: 'center',
  },
  brandContainer: {
    alignItems: 'center',
  },
  brandTextFull: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -1,
    marginTop: 10,
  },
  motoText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    marginTop: 5,
    textAlign: 'center',
  },
  whiteContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    flex: 1,
    marginTop: 20,
    marginBottom: 0,
  },
  contentArea: {
    padding: 30,
    paddingTop: 50,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 10,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 40,
  },
  signInButton: {
    backgroundColor: '#0078FF',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#0078FF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  secondaryButtonText: {
    color: '#0078FF',
    fontSize: 18,
    fontWeight: '600',
  },
  // Bottom white background to cover phone navigation area
  bottomBackground: {
    backgroundColor: '#FFFFFF',
    height: 60, // Reduced height to prevent covering buttons
    width: '100%',
  },
});

export default LoginScreen;