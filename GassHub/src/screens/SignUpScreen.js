import React, { useState, useRef } from 'react';
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
  Image,
  Animated
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const SignUpScreen = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedLevel, setSelectedLevel] = useState('');
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  
  const { signUp } = useAuth();

  // Form steps configuration
  const formSteps = [
    { field: 'firstName', label: 'First Name', placeholder: 'Enter your first name' },
    { field: 'lastName', label: 'Last Name', placeholder: 'Enter your last name' },
    { field: 'gender', label: 'Gender', type: 'selection' },
    { field: 'email', label: 'Email', placeholder: 'Enter your email', keyboardType: 'email-address' },
    { field: 'password', label: 'Password', placeholder: 'Create a password', isPassword: true },
    { field: 'confirmPassword', label: 'Confirm Password', placeholder: 'Confirm your password', isPassword: true, isConfirm: true },
    { field: 'level', label: 'Academic Level', type: 'levelSelection' }
  ];
  
  // Level options
  const levelOptions = [
    { id: '100', label: 'Level 100' },
    { id: '200', label: 'Level 200' },
    { id: '300', label: 'Level 300' },
    { id: '400', label: 'Level 400' },
    { id: 'postgraduate', label: 'Post Graduate' },
    { id: 'masters', label: 'Masters' }
  ];

  // Animate to next step
  const animateToNextStep = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentStep(prev => prev + 1);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  // Validate current step
  const validateCurrentStep = () => {
    switch(currentStep) {
      case 0: // First Name
        if (!firstName.trim()) {
          Alert.alert('Error', 'Please enter your first name');
          return false;
        }
        break;
      case 1: // Last Name
        if (!lastName.trim()) {
          Alert.alert('Error', 'Please enter your last name');
          return false;
        }
        break;
      case 2: // Gender
        if (!gender.trim()) {
          Alert.alert('Error', 'Please select your gender');
          return false;
        }
        break;
      case 3: // Email
        if (!email.trim()) {
          Alert.alert('Error', 'Please enter your email');
          return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          Alert.alert('Error', 'Please enter a valid email address');
          return false;
        }
        break;
      case 4: // Password
        if (!password) {
          Alert.alert('Error', 'Please enter a password');
          return false;
        }
        if (password.length < 6) {
          Alert.alert('Error', 'Password must be at least 6 characters long');
          return false;
        }
        break;
      case 5: // Confirm Password
        if (!confirmPassword) {
          Alert.alert('Error', 'Please confirm your password');
          return false;
        }
        if (password !== confirmPassword) {
          Alert.alert('Error', 'Passwords do not match');
          return false;
        }
        break;
      case 6: // Level
        if (!selectedLevel.trim()) {
          Alert.alert('Error', 'Please select your academic level');
          return false;
        }
        break;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    
    if (currentStep < formSteps.length - 1) {
      animateToNextStep();
    }
  };

  const validateForm = () => {
    if (!firstName.trim()) {
      Alert.alert('Error', 'Please enter your first name');
      return false;
    }
    
    if (!lastName.trim()) {
      Alert.alert('Error', 'Please enter your last name');
      return false;
    }
    
    if (!gender.trim()) {
      Alert.alert('Error', 'Please select your gender');
      return false;
    }
    
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
      Alert.alert('Error', 'Please enter a password');
      return false;
    }
    
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // First create the user account
      const result = await signUp(email, password, firstName, lastName);
      
      if (result.success) {
        // Update user details with gender and level
        const updatedDetails = {
          ...result.userDetails,
          firstName: firstName,
          lastName: lastName,
          gender: gender,
          level: selectedLevel
        };
        
        // Store updated details
        await AsyncStorage.setItem('userDetails', JSON.stringify(updatedDetails));
        
        Alert.alert(
          'Success', 
          'Account created successfully!',
          [{ text: 'OK', onPress: () => navigation.navigate('dashboard') }]
        );
      } else {
        Alert.alert('Sign Up Failed', result.error);
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
        backgroundColor="#0078FF" 
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
          {/* Blue Header Section with Image */}
          <View style={styles.blueHeader}>
            <Image 
              source={require('../../assets/images/loginan.png')}
              style={styles.headerImage}
              resizeMode="contain"
            />
            <View style={styles.headerContentWithoutBackButton}>
              <View style={styles.brandContainer}>
                <Text style={styles.brandTextFull}>GASSHUB</Text>
              </View>
              <Text style={styles.motoText}>Create Your Account</Text>
            </View>
          </View>

          {/* White Content Section */}
          <View style={styles.whiteContainer}>
            <View style={styles.contentArea}>
              <Text style={styles.welcomeTitle}>Sign Up</Text>
              <Text style={styles.welcomeSubtitle}>Create a new account</Text>
              
              {/* Progress Indicator */}
              <View style={styles.progressContainer}>
                {formSteps.map((_, index) => (
                  <View 
                    key={index} 
                    style={[
                      styles.progressDot,
                      {
                        backgroundColor: currentStep >= index ? '#0078FF' : '#E0E0E0',
                        width: currentStep === index ? 30 : 10
                      }
                    ]}
                  />
                ))}
              </View>
              
              {/* Step Counter */}
              <Text style={styles.stepCounter}>
                Step {currentStep + 1} of {formSteps.length}
              </Text>
              
              {/* Animated Form Content */}
              <Animated.View 
                style={[
                  styles.animatedFormContainer,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                  }
                ]}
              >
                {currentStep === 0 && (
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>First Name</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your first name"
                      placeholderTextColor="#999"
                      value={firstName}
                      onChangeText={setFirstName}
                      autoCapitalize="words"
                      autoFocus
                      onSubmitEditing={handleNext}
                      returnKeyType="next"
                    />
                  </View>
                )}
                
                {currentStep === 1 && (
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Last Name</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your last name"
                      placeholderTextColor="#999"
                      value={lastName}
                      onChangeText={setLastName}
                      autoCapitalize="words"
                      autoFocus
                      onSubmitEditing={handleNext}
                      returnKeyType="next"
                    />
                  </View>
                )}
                
                {currentStep === 2 && (
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Gender</Text>
                    <View style={styles.genderContainer}>
                      <TouchableOpacity 
                        style={[
                          styles.genderButton, 
                          gender === 'Male' && styles.selectedGenderButton,
                          { borderColor: '#E0E0E0' }
                        ]}
                        onPress={() => setGender('Male')}
                      >
                        <Text style={[styles.genderText, gender === 'Male' && styles.selectedGenderText]}>Male</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[
                          styles.genderButton, 
                          gender === 'Female' && styles.selectedGenderButton,
                          { borderColor: '#E0E0E0' }
                        ]}
                        onPress={() => setGender('Female')}
                      >
                        <Text style={[styles.genderText, gender === 'Female' && styles.selectedGenderText]}>Female</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                
                {currentStep === 3 && (
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
                      autoFocus
                      onSubmitEditing={handleNext}
                      returnKeyType="next"
                    />
                  </View>
                )}
                
                {currentStep === 4 && (
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Password</Text>
                    <View style={styles.passwordContainer}>
                      <TextInput
                        style={[styles.input, styles.passwordInput]}
                        placeholder="Create a password"
                        placeholderTextColor="#999"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        autoFocus
                        onSubmitEditing={handleNext}
                        returnKeyType="next"
                      />
                      <TouchableOpacity 
                        style={styles.eyeButton}
                        onPress={() => setShowPassword(!showPassword)}
                      >
                        <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                
                {currentStep === 5 && (
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Confirm Password</Text>
                    <View style={styles.passwordContainer}>
                      <TextInput
                        style={[styles.input, styles.passwordInput]}
                        placeholder="Confirm your password"
                        placeholderTextColor="#999"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showConfirmPassword}
                        autoFocus
                        onSubmitEditing={handleNext}
                        returnKeyType="done"
                      />
                      <TouchableOpacity 
                        style={styles.eyeButton}
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        <Text style={styles.eyeIcon}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                
                {currentStep === 6 && (
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Academic Level</Text>
                    <ScrollView 
                      horizontal 
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.levelSelectionContainer}
                    >
                      {levelOptions.map((level) => (
                        <TouchableOpacity
                          key={level.id}
                          style={[
                            styles.levelButton,
                            selectedLevel === level.id && styles.selectedLevelButton,
                            { borderColor: '#E0E0E0' }
                          ]}
                          onPress={() => setSelectedLevel(level.id)}
                        >
                          <Text
                            style={[
                              styles.levelButtonText,
                              selectedLevel === level.id && styles.selectedLevelButtonText
                            ]}
                          >
                            {level.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </Animated.View>
              
              {/* Navigation Buttons */}
              <View style={styles.navigationButtons}>
                {currentStep > 0 && currentStep < 6 && (
                  <TouchableOpacity 
                    style={[styles.backButton, { backgroundColor: '#E0E0E0' }]}
                    onPress={() => setCurrentStep(prev => prev - 1)}
                  >
                    <Text style={[styles.buttonText, { color: '#6B5C5C' }]}>Back</Text>
                  </TouchableOpacity>
                )}
                
                {currentStep < 6 ? (
                  <TouchableOpacity 
                    style={[styles.nextButton, { backgroundColor: '#0078FF' }]}
                    onPress={handleNext}
                  >
                    <Text style={styles.buttonText}>Next</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity 
                    style={[styles.signUpButtonFinal, isLoading && styles.disabledButton]} 
                    onPress={handleSignUp}
                    disabled={isLoading}
                  >
                    <Text style={styles.signUpButtonTextFinal}>
                      {isLoading ? 'Creating Account...' : 'Sign Up'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              
              {/* Sign In Link */}
              <View style={styles.signInContainer}>
                <Text style={styles.signInText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                  <Text style={styles.signInLink}>Sign In</Text>
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
    backgroundColor: '#0078FF',
  },
  mainContainer: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  blueHeader: {
    backgroundColor: '#0078FF',
    minHeight: height * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 180,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: 250,
    position: 'absolute',
    top: 90,
    zIndex: 1,
  },
  brandContainer: {
    marginTop: 150,
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
    color: '#FFFFFF',
    letterSpacing: -1,
    marginTop: 20,
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
    marginTop: 80,
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
    marginBottom: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  progressDot: {
    height: 10,
    borderRadius: 5,
    marginHorizontal: 3,
  },
  stepCounter: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
  },
  animatedFormContainer: {
    minHeight: 150,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    paddingHorizontal: 20,
    minHeight: 60,
  },
  backButton: {
    flex: 1,
    maxWidth: 150,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginRight: 10,
  },
  nextButton: {
    flex: 1,
    maxWidth: 150,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#0078FF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  signUpButtonFinal: {
    backgroundColor: '#0078FF',
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
    shadowColor: '#0078FF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  signUpButtonTextFinal: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 5,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderRadius: 25,
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  selectedGenderButton: {
    backgroundColor: '#0078FF',
    borderColor: '#0078FF',
  },
  genderText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6B5C5C',
  },
  selectedGenderText: {
    color: '#FFFFFF',
    fontWeight: '600',
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 25,
    backgroundColor: '#F8F9FA',
  },
  passwordInput: {
    flex: 1,
    borderWidth: 0,
    borderRadius: 0,
    backgroundColor: 'transparent',
    padding: 14,
    fontSize: 15,
    color: '#6B5C5C',
  },
  eyeButton: {
    padding: 14,
  },
  eyeIcon: {
    fontSize: 20,
    color: '#6B5C5C',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInText: {
    fontSize: 16,
    color: '#6B5C5C',
  },
  signInLink: {
    fontSize: 16,
    color: '#6B5C5C',
    fontWeight: '600',
  },
  levelSelectionContainer: {
    flexDirection: 'row',
    paddingHorizontal: 5,
    paddingVertical: 10,
  },
  levelButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    backgroundColor: '#F8F9FA',
    marginHorizontal: 4,
    minWidth: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedLevelButton: {
    backgroundColor: '#0078FF',
    borderColor: '#0078FF',
  },
  levelButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B5C5C',
  },
  selectedLevelButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  // Bottom white background to cover phone navigation area
  bottomBackground: {
    backgroundColor: '#FFFFFF',
    height: 100, // Adjust this value based on your phone's navigation bar height
    width: '100%',
  },
});

export default SignUpScreen;