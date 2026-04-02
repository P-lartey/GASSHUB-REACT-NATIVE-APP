import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../services/FirebaseConfig';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sign up function with additional user details
  const signUp = async (email, password, firstName, lastName, gender, level) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Store additional user details including gender and level
      const userDetails = {
        uid: user.uid,
        email: user.email,
        firstName,
        lastName,
        gender,
        level,
        createdAt: new Date().toISOString()
      };
      
      await AsyncStorage.setItem('userDetails', JSON.stringify(userDetails));
      setUserDetails(userDetails);
      
      return { success: true, user };
    } catch (error) {
      let errorMessage = 'Failed to create account';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already registered';
          break;
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters';
          break;
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection';
          break;
        default:
          errorMessage = error.message;
      }
      
      return { success: false, error: errorMessage };
    }
  };

  // Sign in function
  const signIn = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Retrieve stored user details
      const storedDetails = await AsyncStorage.getItem('userDetails');
      if (storedDetails) {
        const userDetails = JSON.parse(storedDetails);
        if (userDetails.uid === user.uid) {
          setUserDetails(userDetails);
        }
      }
      
      return { success: true, user };
    } catch (error) {
      let errorMessage = 'Failed to sign in';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection';
          break;
        default:
          errorMessage = error.message;
      }
      
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await signOut(auth);
      // Don't remove user details from storage - keep them for persistent display
      setUserDetails(null);
      setCurrentUser(null);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Password reset function
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true, message: 'Password reset email sent successfully. Check your inbox.' };
    } catch (error) {
      let errorMessage = 'Failed to send reset email';
      
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection';
          break;
        default:
          errorMessage = error.message;
      }
      
      return { success: false, error: errorMessage };
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return currentUser !== null;
  };

  // Get user's first name for welcome message
  const getUserFirstName = () => {
    return userDetails?.firstName || 'User';
  };

  // Get user's first name with async fallback
  const getUserFirstNameAsync = async () => {
    if (userDetails?.firstName) {
      return userDetails.firstName;
    }
    
    // Fallback to storage if userDetails is not loaded yet
    const storedDetails = await AsyncStorage.getItem('userDetails');
    if (storedDetails) {
      const parsedDetails = JSON.parse(storedDetails);
      return parsedDetails.firstName || 'User';
    }
    
    return 'User';
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Load user details from storage
        const storedDetails = await AsyncStorage.getItem('userDetails');
        if (storedDetails) {
          const userDetails = JSON.parse(storedDetails);
          if (userDetails.uid === user.uid) {
            setUserDetails(userDetails);
          }
        }
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userDetails,
    loading,
    signUp,
    signIn,
    logout,
    resetPassword,
    isAuthenticated,
    getUserFirstName,
    getUserFirstNameAsync,
    setUserDetails
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};