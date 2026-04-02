import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  Animated
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

const { width, height } = Dimensions.get('window');

const SignInScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const glowAnimation = useRef(new Animated.Value(0)).current;
  
  const { signIn } = useAuth();
  
  useEffect(() => {
    const blinkAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );
    
    blinkAnimation.start();
    
    return () => {
      blinkAnimation.stop();
    };
  }, []);

  const validateForm = () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    
    if (!password) {
      Alert.alert('Error', 'Please enter your password');
      return false;
    }
    
    return true;
  };

  const handleSignIn = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const result = await signIn(email, password);
      
      if (result.success) {
        // Navigate to dashboard on successful sign-in
        navigation.navigate('dashboard');
        console.log('Sign in successful');
      } else {
        Alert.alert('Sign In Failed', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        backgroundColor="rgba(0,0,0,0.5)" 
        barStyle="light-content" 
      />
      
      <KeyboardAvoidingView 
        style={styles.mainContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView 
          style={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Image Background Header Section */}
          <ImageBackground 
            source={require('../../assets/images/loginpage1.jpg')}
            style={styles.imageHeader}
            resizeMode="cover"
          >
            <View style={styles.overlay}>
              <View style={styles.headerContentWithoutBackButton}>
                <Animated.Text 
                                style={[
                                  styles.animatedBrandText,
                                  {
                                    textShadowRadius: glowAnimation.interpolate({
                                      inputRange: [0, 1],
                                      outputRange: [2, 10]
                                    }),
                                    opacity: glowAnimation.interpolate({
                                      inputRange: [0, 1],
                                      outputRange: [0.8, 1]
                                    })
                                  }
                                ]}
                              >
                                GASSHUB
                              </Animated.Text>
                <Text style={styles.motoText}>Welcome Back</Text>
              </View>
            </View>
          </ImageBackground>

          {/* White Content Section */}
          <View style={styles.whiteContainer}>
            <View style={styles.contentArea}>
              <Text style={styles.welcomeTitle}>Sign In</Text>
              <Text style={styles.welcomeSubtitle}>Access your account</Text>
              
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              
              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
              
              {/* Forgot Password Link */}
              <TouchableOpacity 
                style={styles.forgotPasswordContainer}
                onPress={() => navigation.navigate('PasswordReset')}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
              
              {/* Sign In Button */}
              <TouchableOpacity 
                style={[styles.signInButton, isLoading && styles.disabledButton]} 
                onPress={handleSignIn}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Text>
              </TouchableOpacity>
              
              {/* Sign Up Link */}
              <View style={styles.signUpContainer}>
                <Text style={styles.signUpText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                  <Text style={styles.signUpLink}>Sign Up</Text>
                </TouchableOpacity>
              </View>
              
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* Static white background for phone navigation area */}
      <View style={styles.bottomBackground} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  imageHeader: {
    minHeight: height * 0.3,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  headerContent: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  headerContentWithoutBackButton: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  backButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  brandTextFull: {
    fontSize: 48,
    fontWeight: '700',
    color: '#0078FF',
    letterSpacing: -1,
    marginTop: 20,
  },
  animatedBrandText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -1,
    marginTop: 20,
    textShadowColor: '#0078FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
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
    marginTop: -20,
    minHeight: height * 0.4,
  },
  // Bottom white background to cover phone navigation area
  bottomBackground: {
    backgroundColor: '#FFFFFF',
    height: 100, // Adjust this value based on your phone's navigation bar height
    width: '100%',
  },
  contentArea: {
    padding: 20,
    paddingTop: 30,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#6B5C5C',
    textAlign: 'center',
    marginBottom: 10,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6B5C5C',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B5C5C',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderRadius: 25,
    padding: 14,
    fontSize: 15,
    color: '#6B5C5C',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#6B5C5C',
    fontWeight: '500',
  },
  signInButton: {
    backgroundColor: '#0078FF',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
    shadowColor: '#0078FF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    fontSize: 16,
    color: '#666666',
  },
  signUpLink: {
    fontSize: 16,
    color: '#0078FF',
    fontWeight: '600',
  },
});

export default SignInScreen;