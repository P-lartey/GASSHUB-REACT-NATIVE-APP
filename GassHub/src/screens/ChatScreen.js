import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Alert, ImageBackground, Image, SafeAreaView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as Location from 'expo-location';
import { Audio } from 'expo-av';

// Emoji data for WhatsApp-style emoji picker
const emojiCategories = {
  smileys: ['😀', '😂', '🥰', '😎', '🤩', '😍', '🤗', '🤔', '😐', '😑', '🙄', '😮', '🤐', '😴', '🤤'],
  animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵'],
  food: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝'],
  activities: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🥅', '🏒', '🏑', '🏏', '⛳'],
  travel: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎', '🚓', '🚑', '🚒', '🚐', '🚚', '🚛', '🚜', '🛴', 'バイク'],
  objects: ['⌚', '📱', '💻', '⌨', '🖥', '🖨', '🖱', '🖲', '🕹', '🗜', '💽', '💾', '💿', 'DVD', '📼']
};

const ChatScreen = React.memo(({ onBackPress, currentUser }) => {
  const { colors, isDarkMode } = useTheme();
  const { getUserFirstName, getUserFirstNameAsync } = useAuth();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState([
    { id: '1', text: 'Hello! Welcome to GASSHUB Chat', sender: 'system', timestamp: new Date().toLocaleTimeString() },
    { id: '2', text: 'How can I help you today?', sender: 'system', timestamp: new Date().toLocaleTimeString() },
  ]);
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeEmojiCategory, setActiveEmojiCategory] = useState('smileys');
  const [attachedImage, setAttachedImage] = useState(null);
  const flatListRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  const [readReceipts, setReadReceipts] = useState({});
  const [websocket, setWebsocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [isCameraOpening, setIsCameraOpening] = useState(false);
  
  // Debug logging for mount/unmount
  useEffect(() => {
    console.log('ChatScreen mounted');
    return () => {
      console.log('ChatScreen unmounting');
    };
  }, []);
  
  // Debug logging for camera state
  useEffect(() => {
    console.log('Camera opening state:', isCameraOpening);
  }, [isCameraOpening]);
  
  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const [recordedUri, setRecordedUri] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingTimerRef = useRef(null);
  
  // Initialize WebSocket connection
  useEffect(() => {
    // In a real app, you would connect to your WebSocket server
    // const ws = new WebSocket('ws://your-websocket-server-url');
    // 
    // ws.onopen = () => {
    //   setConnectionStatus('connected');
    //   console.log('WebSocket connected');
    // };
    // 
    // ws.onmessage = (event) => {
    //   const data = JSON.parse(event.data);
    //   handleMessageReceived(data);
    // };
    // 
    // ws.onclose = () => {
    //   setConnectionStatus('disconnected');
    //   console.log('WebSocket disconnected');
    // };
    // 
    // ws.onerror = (error) => {
    //   setConnectionStatus('error');
    //   console.log('WebSocket error:', error);
    // };
    // 
    // setWebsocket(ws);
    // 
    // return () => {
    //   ws.close();
    // };
    
    // For demo purposes, we'll simulate a connection
    setConnectionStatus('connected');
    
    return () => {
      // Cleanup simulation
    };
  }, []);
  
  // Simulate typing indicator
  useEffect(() => {
    const typingTimer = setTimeout(() => {
      setIsTyping(false);
    }, 3000);
    
    return () => clearTimeout(typingTimer);
  }, [isTyping]);
  
  // Cleanup effect for recording
  useEffect(() => {
    return () => {
      // Force cleanup when component unmounts
      forceCleanupRecording();
    };
  }, []);
  
  // Voice recording functions
  const startRecording = async () => {
    try {
      // Prevent multiple simultaneous recordings
      if (isRecording) {
        console.log('Already recording, ignoring start request');
        return;
      }
      
      // Clean up any existing recording session
      if (recording) {
        try {
          console.log('Cleaning up existing recording session');
          await recording.stopAndUnloadAsync();
        } catch (cleanupError) {
          console.log('Cleanup error (ignored):', cleanupError);
        }
        setRecording(null);
      }
      
      console.log('Requesting audio permissions...');
      // Request audio recording permissions
      const { status } = await Audio.requestPermissionsAsync();
      console.log('Permission status:', status);
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission required', 
          'Audio recording permission is needed to record voice notes. Please enable microphone access in your device settings.',
          [
            { text: 'OK', style: 'cancel' }
          ]
        );
        return;
      }

      console.log('Setting audio mode...');
      // Set audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Creating new recording session...');
      const newRecording = new Audio.Recording();
      
      console.log('Preparing recording...');
      // Try with basic recording options first
      try {
        await newRecording.prepareToRecordAsync({
          android: {
            extension: '.m4a',
            outputFormat: Audio.AndroidOutputFormat.MPEG_4,
            audioEncoder: Audio.AndroidAudioEncoder.AAC,
            sampleRate: 44100,
            numberOfChannels: 2,
            bitRate: 128000,
          },
          ios: {
            extension: '.m4a',
            audioQuality: Audio.IOSAudioQuality.HIGH,
            sampleRate: 44100,
            numberOfChannels: 2,
            bitRate: 128000,
            linearPCMBitDepth: 16,
            linearPCMIsBigEndian: false,
            linearPCMIsFloat: false,
          },
        });
      } catch (prepareError) {
        console.log('Basic prepare failed, trying preset...');
        // Fallback to preset
        await newRecording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      }
      
      console.log('Starting recording...');
      await newRecording.startAsync();
      
      setRecording(newRecording);
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      console.log('Recording started successfully');
    } catch (error) {
      console.error('Failed to start recording:', error);
      
      // More specific error handling
      let errorMessage = 'Failed to start recording. Please try again.';
      
      if (error.message && error.message.includes('permission')) {
        errorMessage = 'Microphone permission denied. Please enable microphone access in settings.';
      } else if (error.message && error.message.includes('prepare')) {
        errorMessage = 'Failed to prepare recording. Please check if another app is using the microphone.';
      } else if (error.message && error.message.includes('one recording')) {
        errorMessage = 'Another recording is already in progress. Please wait and try again.';
      } else if (error.message) {
        errorMessage = `Recording error: ${error.message}`;
      }
      
      Alert.alert('Error', errorMessage);
      
      // Reset state on error
      setIsRecording(false);
      setRecording(null);
      setRecordingTime(0);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  const stopRecording = async () => {
    try {
      // Prevent multiple stop attempts
      if (!isRecording || !recording) {
        console.log('No active recording to stop');
        return;
      }
      
      console.log('Stopping recording...');
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      console.log('Recording saved to:', uri);
      
      setRecordedUri(uri);
      setRecording(null);
      setIsRecording(false);
      
      // Stop timer
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      
      // Send the voice note
      sendVoiceNote(uri);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to stop recording.');
      
      // Ensure cleanup even on error
      setIsRecording(false);
      setRecording(null);
      setRecordingTime(0);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  const sendVoiceNote = async (uri) => {
    try {
      const newMessage = {
        id: String(Date.now()),
        type: 'voice',
        uri: uri,
        duration: recordingTime,
        sender: currentUserInfo.id,
        senderName: currentUserInfo.name,
        senderAvatar: currentUserInfo.avatar,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'sending'
      };
      
      // Add voice note to UI immediately
      setMessages(prevMessages => [...prevMessages, newMessage]);
      setRecordingTime(0);
      
      // In a real app, you would upload the audio file here
      // For demo purposes, we'll just update the status
      setTimeout(() => {
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === newMessage.id ? {...msg, status: 'sent'} : msg
          )
        );
      }, 1000);
      
      // Simulate a response
      setTimeout(() => {
        const responseMessage = {
          id: String(Date.now() + 1),
          text: "Thanks for your voice message! This is a simulated response.",
          sender: 'other',
          senderName: 'Support Team',
          senderAvatar: '🤖',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'received'
        };
        setMessages(prevMessages => [...prevMessages, responseMessage]);
        
        setReadReceipts(prev => ({
          ...prev,
          [responseMessage.id]: true
        }));
        
        setTimeout(() => {
          if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: true });
          }
        }, 100);
      }, 1500);
      
    } catch (error) {
      console.error('Failed to send voice note:', error);
      Alert.alert('Error', 'Failed to send voice note.');
    }
  };

  const formatRecordingTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const forceCleanupRecording = async () => {
    try {
      console.log('Force cleaning up recording session...');
      
      if (recording) {
        try {
          await recording.stopAndUnloadAsync();
          console.log('Recording session stopped and unloaded');
        } catch (error) {
          console.log('Error stopping recording (ignored):', error);
        }
        setRecording(null);
      }
      
      setIsRecording(false);
      setRecordingTime(0);
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      
      console.log('Recording cleanup completed');
    } catch (error) {
      console.error('Force cleanup error:', error);
    }
  };

  const checkMicrophoneAvailability = async () => {
    try {
      // Check if we can access the microphone
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        return { available: false, reason: 'Permission not granted' };
      }
      
      // Try to create a simple recording session to test availability
      const testRecording = new Audio.Recording();
      try {
        await testRecording.prepareToRecordAsync({
          android: {
            extension: '.m4a',
            outputFormat: Audio.AndroidOutputFormat.MPEG_4,
            audioEncoder: Audio.AndroidAudioEncoder.AAC,
            sampleRate: 22050,
            numberOfChannels: 1,
            bitRate: 64000,
          },
          ios: {
            extension: '.m4a',
            audioQuality: Audio.IOSAudioQuality.MIN,
            sampleRate: 22050,
            numberOfChannels: 1,
            bitRate: 64000,
          },
        });
        
        await testRecording.startAsync();
        await testRecording.stopAndUnloadAsync();
        
        return { available: true, reason: 'Microphone is available' };
      } catch (testError) {
        console.log('Microphone test failed:', testError);
        return { available: false, reason: testError.message || 'Microphone unavailable' };
      }
    } catch (error) {
      console.log('Permission check failed:', error);
      return { available: false, reason: error.message || 'Permission check failed' };
    }
  };

  const checkPermissions = async () => {
    try {
      const { status } = await Audio.getPermissionsAsync();
      Alert.alert(
        'Permission Status',
        `Microphone permission is currently: ${status}`,
        [
          {
            text: 'Request Permission',
            onPress: async () => {
              const { status: newStatus } = await Audio.requestPermissionsAsync();
              Alert.alert('Permission Result', `Permission is now: ${newStatus}`);
            }
          },
          { text: 'OK', style: 'cancel' }
        ]
      );
    } catch (error) {
      console.error('Error checking permissions:', error);
      Alert.alert('Error', 'Failed to check permissions.');
    }
  };
  
  const openCamera = async () => {
    try {
      console.log('Opening camera...');
      
      // Prevent multiple simultaneous camera operations
      if (isCameraOpening) {
        console.log('Camera already opening, ignoring request');
        return;
      }
      
      setIsCameraOpening(true);
      
      // Store current state before opening camera
      const previousMessages = [...messages];
      console.log('Current messages count:', messages.length);
      
      // Request camera permissions using the correct method
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Camera permission is needed to take photos. Please enable camera access in your device settings.');
        setIsCameraOpening(false);
        return;
      }

      console.log('Launching camera...');
      // Launch camera with better configuration
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: false,
        saveToPhotos: false, // Don't save to gallery, just use for sending
        exif: false, // Disable EXIF data to reduce processing
        base64: false, // Don't include base64 data
      });

      console.log('Camera result received:', result);
      setIsCameraOpening(false);
      
      // Check if user cancelled or if there was an error
      if (result.canceled) {
        console.log('User cancelled camera');
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        console.log('Image captured:', imageUri);
        
        // Create image message
        const newMessage = {
          id: String(Date.now()),
          type: 'image',
          imageUrl: imageUri,
          text: '',
          sender: currentUserInfo.id,
          senderName: currentUserInfo.name,
          senderAvatar: currentUserInfo.avatar,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'sending'
        };
        
        // Add image message to chat using functional update to preserve state
        setMessages(prevMessages => {
          const updatedMessages = [...prevMessages, newMessage];
          console.log('Messages updated, total:', updatedMessages.length);
          return updatedMessages;
        });
        
        // Scroll to bottom after a short delay
        setTimeout(() => {
          if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: true });
          }
        }, 100);
        
        // Simulate sending (in real app, you'd upload the image)
        setTimeout(() => {
          setMessages(prevMessages => 
            prevMessages.map(msg => 
              msg.id === newMessage.id ? {...msg, status: 'sent'} : msg
            )
          );
        }, 1000);
        
        // Simulate a response
        setTimeout(() => {
          const responseMessage = {
            id: String(Date.now() + 1),
            text: "Thanks for sharing the image!",
            sender: 'other',
            senderName: 'Support Team',
            senderAvatar: '🤖',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'received'
          };
          setMessages(prevMessages => [...prevMessages, responseMessage]);
          
          setReadReceipts(prev => ({
            ...prev,
            [responseMessage.id]: true
          }));
          
          setTimeout(() => {
            if (flatListRef.current) {
              flatListRef.current.scrollToEnd({ animated: true });
            }
          }, 100);
        }, 1500);
      }
    } catch (error) {
      console.error('Camera error:', error);
      setIsCameraOpening(false);
      Alert.alert('Error', 'Failed to capture image. Please try again.');
    }
  };

  const openImageLibrary = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        console.log('Image selected:', imageUri);
        // In a real app, you would upload the image here
        Alert.alert('Success', 'Image selected successfully!');
      } else if (result.canceled) {
        console.log('User cancelled image picker');
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const selectDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      
      if (result.canceled) {
        console.log('User cancelled document picker');
        return;
      }
      
      const file = result.assets[0];
      console.log(
        file.uri,
        file.mimeType,
        file.name,
        file.size
      );
      Alert.alert('Success', `File selected: ${file.name}`);
      // In a real app, you would upload the file here
    } catch (err) {
      console.log('Document picker error: ', err);
      Alert.alert('Error', 'Failed to select file. Please try again.');
    }
  };

  const shareLocation = async () => {
    try {
      // Request permission first
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to share your location.');
        return;
      }
      
      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 15000,
      });
      
      const { latitude, longitude } = location.coords;
      const locationMessage = `📍 Location: Latitude ${latitude.toFixed(6)}, Longitude ${longitude.toFixed(6)}`;
      
      // In a real app, you would send this as a message
      Alert.alert('Location Shared', `Latitude: ${latitude.toFixed(6)}\nLongitude: ${longitude.toFixed(6)}`);
      console.log('Location shared:', locationMessage);
    } catch (error) {
      console.log('Geolocation error:', error);
      Alert.alert('Error', 'Unable to get your location. Please check your location settings.');
    }
  };

  // Sample users for demo purposes
  const sampleUsers = {
    student1: { id: 'student1', name: 'Gass Connect', role: 'Student', avatar: '👨‍🎓' },
    lecturer1: { id: 'lecturer1', name: 'Dr. Lecturer', role: 'Lecturer', avatar: '👩‍🏫' },
    user1: { id: 'user1', name: getUserFirstName(), role: 'Student', avatar: '👤' }
  };

  // Get current user info
  const currentUserInfo = currentUser || sampleUsers.user1;
  
  // Update user info when auth state changes
  useEffect(() => {
    sampleUsers.user1.name = getUserFirstName();
  }, [getUserFirstName]);

  // Load user name on mount
  useEffect(() => {
    const loadUserName = async () => {
      const name = await getUserFirstNameAsync();
      sampleUsers.user1.name = name;
    };
    loadUserName();
  }, []);

  const [messageReactions, setMessageReactions] = useState({});
  
  const toggleReaction = (messageId, reaction) => {
    setMessageReactions(prev => {
      const currentReactions = prev[messageId] || [];
      const reactionIndex = currentReactions.indexOf(reaction);
      
      if (reactionIndex > -1) {
        // Remove reaction
        const newReactions = [...currentReactions];
        newReactions.splice(reactionIndex, 1);
        return {
          ...prev,
          [messageId]: newReactions
        };
      } else {
        // Add reaction
        return {
          ...prev,
          [messageId]: [...currentReactions, reaction]
        };
      }
    });
  };

  const addEmoji = (emoji) => {
    setInputText(prevText => prevText + emoji);
  };

  const handleMessageReceived = (messageData) => {
    // Add received message to the messages list
    setMessages(prevMessages => [...prevMessages, messageData]);
    
    // Mark message as read
    setReadReceipts(prev => ({
      ...prev,
      [messageData.id]: true
    }));
    
    // Scroll to bottom
    setTimeout(() => {
      if (flatListRef.current) {
        flatListRef.current.scrollToEnd({ animated: true });
      }
    }, 100);
  };

  const handleSend = () => {
    if (inputText.trim()) {
      const newMessage = {
        id: String(Date.now()),
        text: inputText,
        sender: currentUserInfo.id,
        senderName: currentUserInfo.name,
        senderAvatar: currentUserInfo.avatar,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'sending'
      };
      
      // Add message to UI immediately (optimistic update)
      setMessages(prevMessages => [...prevMessages, newMessage]);
      setInputText('');
      setShowEmojiPicker(false);
      
      // Send message via WebSocket
      if (websocket && websocket.readyState === WebSocket.OPEN) {
        websocket.send(JSON.stringify({
          type: 'message',
          content: inputText,
          sender: currentUserInfo.id,
          timestamp: new Date().toISOString()
        }));
        // Update message status to 'sent'
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === newMessage.id ? {...msg, status: 'sent'} : msg
          )
        );
      } else {
        // Fallback for demo purposes
        console.log('WebSocket not connected, using fallback');
        // Update message status to 'sent'
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === newMessage.id ? {...msg, status: 'sent'} : msg
          )
        );
      }
      
      // Show typing indicator
      setIsTyping(true);
      
      // Simulate a response after a short delay
      setTimeout(() => {
        const responseMessage = {
          id: String(Date.now() + 1),
          text: "Thanks for your message. This is a simulated response.",
          sender: 'other',
          senderName: 'Support Team',
          senderAvatar: '🤖',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'received'
        };
        setMessages(prevMessages => [...prevMessages, responseMessage]);
        
        // Mark message as read
        setReadReceipts(prev => ({
          ...prev,
          [responseMessage.id]: true
        }));
        
        // Scroll to bottom
        setTimeout(() => {
          if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: true });
          }
        }, 100);
      }, 1000);
    }
  };

  const renderMessage = ({ item }) => {
    const isUser = item.sender === currentUserInfo.id;
    const isSystem = item.sender === 'system';
    const reactions = messageReactions[item.id] || [];
    
    // Determine status indicator based on message status
    const getStatusIndicator = () => {
      if (!isUser) return null;
      
      switch (item.status) {
        case 'sending':
          return <Text style={styles.messageStatus}>●</Text>;
        case 'sent':
          return <Text style={styles.messageStatus}>✓</Text>;
        case 'delivered':
          return <Text style={styles.messageStatus}>✓✓</Text>;
        case 'read':
          return <Text style={[styles.messageStatus, styles.readStatus]}>✓✓</Text>;
        default:
          return <Text style={styles.messageStatus}>✓✓</Text>;
      }
    };
    
    // Render message content based on type
    const renderMessageContent = () => {
      switch (item.type) {
        case 'image':
          return (
            <>
              <Text style={[
                styles.messageText,
                { color: isDarkMode ? '#e7e9ea' : '#0f1419' }
              ]}>
                {item.text}
              </Text>
              {item.imageUrl && (
                <Image 
                  source={{ uri: item.imageUrl }} 
                  style={styles.messageImage}
                  resizeMode="cover"
                />
              )}
            </>
          );
        case 'gif':
          return (
            <>
              <Text style={[
                styles.messageText,
                { color: isDarkMode ? '#e7e9ea' : '#0f1419' }
              ]}>
                {item.text}
              </Text>
              {item.gifUrl && (
                <Image 
                  source={{ uri: item.gifUrl }} 
                  style={styles.messageGif}
                  resizeMode="cover"
                />
              )}
            </>
          );
        case 'voice':
          return (
            <View style={styles.voiceMessageContainer}>
              <View style={styles.voiceMessageContent}>
                <Text style={[styles.voiceMessageIcon, { color: isUser ? '#ffffff' : (isDarkMode ? '#e7e9ea' : '#0f1419') }]}>
                  🔊
                </Text>
                <View style={styles.voiceMessageInfo}>
                  <Text style={[styles.voiceMessageText, { color: isUser ? '#ffffff' : (isDarkMode ? '#e7e9ea' : '#0f1419') }]}>
                    Voice message
                  </Text>
                  <Text style={[styles.voiceMessageDuration, { color: isUser ? 'rgba(255,255,255,0.8)' : (isDarkMode ? '#71767b' : '#536471') }]}>
                    {formatRecordingTime(item.duration)}
                  </Text>
                </View>
              </View>
            </View>
          );
        default: // text message
          return (
            <Text style={[
              styles.messageText,
              { color: isDarkMode ? '#e7e9ea' : '#0f1419' }
            ]}>
              {item.text}
            </Text>
          );
      }
    };
    
    return (
      <View style={[
        styles.messageContainer,
        isUser && styles.userMessageContainer,
        isSystem && styles.systemMessageContainer,
        !isUser && !isSystem && styles.otherMessageContainer
      ]}>
        {!isUser && !isSystem && (
          <View style={styles.senderAvatarContainer}>
            <Text style={styles.senderAvatar}>{item.senderAvatar || '👤'}</Text>
            <View style={[styles.onlineIndicator, { backgroundColor: '#10B981', borderColor: isDarkMode ? '#000000' : '#ffffff' }]} />
          </View>
        )}
        <View style={[
          styles.messageBubble,
          isUser ? styles.userMessageBubble : styles.otherMessageBubble,
          { 
            backgroundColor: isUser ? 
              (isDarkMode ? 'rgba(29, 155, 240, 0.2)' : 'rgba(29, 155, 240, 0.2)') : 
              (isSystem ? 
                (isDarkMode ? '#202327' : '#f7f9f9') : 
                (isDarkMode ? '#202327' : '#f7f9f9')),
            borderColor: isDarkMode ? '#2f3336' : '#eff3f4',
          },
          isSystem && styles.systemMessageBubble
        ]}>
          {!isUser && !isSystem && (
            <Text style={[styles.senderName, { color: '#1d9bf0' }]}>{item.senderName || 'Unknown'}</Text>
          )}
          {renderMessageContent()}
          <View style={styles.messageFooter}>
            <Text style={[
              styles.timestamp,
              { color: isDarkMode ? '#71767b' : '#536471' }
            ]}>
              {item.timestamp}
            </Text>
            {getStatusIndicator()}
          </View>
        </View>
        {/* Message Reactions */}
        {reactions.length > 0 && (
          <View style={[styles.reactionsContainer, isUser && styles.userReactionsContainer]}>
            {reactions.map((reaction, index) => (
              <View key={index} style={[styles.reactionBubble, { backgroundColor: isDarkMode ? '#202327' : '#f7f9f9' }]}>
                <Text style={[styles.reactionText, { color: isDarkMode ? '#e7e9ea' : '#0f1419' }]}>{reaction}</Text>
              </View>
            ))}
          </View>
        )}
        {/* Reaction Picker */}
        <View style={[styles.reactionPicker, isUser && styles.userReactionPicker]}>
          {['👍', '❤️', '😂', '😮', '😢', '👏'].map((reaction) => (
            <TouchableOpacity 
              key={reaction}
              style={styles.reactionOption}
              onPress={() => toggleReaction(item.id, reaction)}
            >
              <Text style={[styles.reactionOptionText, { color: isDarkMode ? '#e7e9ea' : '#0f1419' }]}>{reaction}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderEmojiCategory = (category, emojis) => (
    <View key={category} style={styles.emojiCategory}>
      <Text style={[styles.emojiCategoryTitle, { color: isDarkMode ? '#94A3B8' : '#64748B' }]}>
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </Text>
      <View style={styles.emojiRow}>
        {emojis.map((emoji, index) => (
          <TouchableOpacity
            key={index}
            style={styles.emojiButton}
            onPress={() => addEmoji(emoji)}
          >
            <Text style={styles.emoji}>{emoji}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const [refreshing, setRefreshing] = useState(false);
  
  const onRefresh = () => {
    setRefreshing(true);
    // Simulate refreshing messages
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView 
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
      {/* Twitter-style Header */}
      <View style={[styles.twitterHeader, { 
        backgroundColor: isDarkMode ? '#000000' : '#ffffff',
        borderBottomColor: isDarkMode ? '#2f3336' : '#eff3f4'
      }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
            <Text style={[styles.backButtonText, { color: isDarkMode ? '#e7e9ea' : '#0f1419' }]}>⇦</Text>
          </TouchableOpacity>
          <View style={styles.headerUserInfo}>
            <View style={styles.userAvatarContainer}>
              <Text style={styles.userAvatar}>{currentUserInfo.avatar}</Text>
              <View style={[styles.onlineIndicator, { backgroundColor: '#10B981', borderColor: isDarkMode ? '#000000' : '#ffffff' }]} />
            </View>
            <View>
              <View style={styles.headerTitleContainer}>
                <Text style={[styles.headerTitle, { color: isDarkMode ? '#e7e9ea' : '#0f1419' }]}>{currentUserInfo.name}</Text>
                {/* Twitter-style verification badge */}
                <View style={styles.verificationBadge}>
                  <Text style={styles.verificationBadgeText}>✓</Text>
                </View>
              </View>
              <Text style={[styles.headerSubtitle, { color: isDarkMode ? '#71767b' : '#536471' }]}>
                @{currentUserInfo.name.replace(/\s+/g, '').toLowerCase()}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerIcon}>
            <Text style={[styles.headerIconText, { color: isDarkMode ? '#e7e9ea' : '#0f1419' }]}>📞</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Text style={[styles.headerIconText, { color: isDarkMode ? '#e7e9ea' : '#0f1419' }]}>ⓘ</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Twitter-like Background with Gasshub Branding */}
      <View style={styles.chatBackgroundContainer}>
        <View style={[styles.twitterBackground, { backgroundColor: isDarkMode ? '#000000' : '#FFFFFF' }]}>
          {/* Subtle Twitter-like pattern with Gasshub branding */}
          {[...Array(30)].map((_, index) => (
            <Text 
              key={index} 
              style={[
                styles.backgroundPatternText,
                {
                  position: 'absolute',
                  top: `${(index * 11) % 100}%`,
                  left: `${(index * 17) % 100}%`,
                  transform: [{ rotate: `${(index * 23) % 360}deg` }],
                  opacity: isDarkMode ? 0.02 : 0.03,
                  color: isDarkMode ? '#1DA1F2' : '#1DA1F2',
                  fontSize: 20 + (index % 7),
                }
              ]}
            >
              Gasshub
            </Text>
          ))}
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContainer}
          inverted={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          refreshing={refreshing}
          onRefresh={onRefresh}
          keyboardShouldPersistTaps="handled"
        />
        {/* Typing Indicator */}
        {isTyping && (
          <View style={[styles.typingIndicator, { backgroundColor: isDarkMode ? '#334155' : '#FFFFFF' }]}>
            <Text style={[styles.typingText, { color: isDarkMode ? '#94A3B8' : '#64748B' }]}>
              Support Team is typing
            </Text>
            <View style={styles.typingDots}>
              <Text style={styles.dot}>.</Text>
              <Text style={styles.dot}>.</Text>
              <Text style={styles.dot}>.</Text>
            </View>
          </View>
        )}
      </View>

      {showEmojiPicker && (
        <View style={[styles.emojiPicker, { backgroundColor: isDarkMode ? '#000000' : '#ffffff' }]}>
          <View style={[styles.emojiCategories, { borderBottomColor: isDarkMode ? '#2f3336' : '#eff3f4' }]}>
            {Object.keys(emojiCategories).map(category => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.emojiCategoryButton,
                  activeEmojiCategory === category && { backgroundColor: '#1d9bf0' }
                ]}
                onPress={() => setActiveEmojiCategory(category)}
              >
                <Text style={[
                  styles.emojiCategoryButtonText,
                  { color: activeEmojiCategory === category ? '#ffffff' : (isDarkMode ? '#71767b' : '#536471') }
                ]}>
                  {category.charAt(0).toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.emojiContent}>
            {renderEmojiCategory(activeEmojiCategory, emojiCategories[activeEmojiCategory])}
          </View>
          {/* Twitter-style emoji toolbar */}
          <View style={[styles.emojiToolbar, { borderTopColor: isDarkMode ? '#2f3336' : '#eff3f4' }]}>
            <TouchableOpacity 
              style={styles.emojiToolbarButton}
              onPress={() => setShowEmojiPicker(false)}
            >
              <Text style={[styles.emojiToolbarText, { color: isDarkMode ? '#71767b' : '#536471' }]}>×</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={[styles.inputContainer, { 
        backgroundColor: isDarkMode ? '#000000' : '#ffffff',
        borderTopColor: isDarkMode ? '#2f3336' : '#eff3f4',
        paddingBottom: Math.max(insets.bottom, 15),
        paddingHorizontal: Math.max(insets.left, 20),
      }]}>
        <View style={styles.inputToolbar}>
          <TouchableOpacity style={styles.toolbarButton} onPress={openCamera}>
            <Text style={[styles.toolbarIcon, { color: isDarkMode ? '#71767b' : '#536471' }]}>📷</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolbarButton} onPress={selectDocument}>
            <Text style={[styles.toolbarIcon, { color: isDarkMode ? '#71767b' : '#536471' }]}>📎</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolbarButton} onPress={shareLocation}>
            <Text style={[styles.toolbarIcon, { color: isDarkMode ? '#71767b' : '#536471' }]}>📍</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.inputArea}>
          {isRecording && (
            <View style={styles.recordingIndicator}>
              <Text style={[styles.recordingText, { color: isDarkMode ? '#EF4444' : '#DC2626' }]}>
                🎙 Recording... {formatRecordingTime(recordingTime)}
              </Text>
            </View>
          )}
          <TextInput
            style={[styles.textInput, { 
              backgroundColor: isDarkMode ? '#202327' : '#f7f9f9',
              color: isDarkMode ? '#e7e9ea' : '#0f1419'
            }]}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Start a new message"
            placeholderTextColor={isDarkMode ? '#71767b' : '#536471'}
            multiline
            scrollEnabled={false}
            editable={true}
            selectTextOnFocus={true}
            autoFocus={false}
            enablesReturnKeyAutomatically={true}
            returnKeyType="default"
            blurOnSubmit={false}
          />
          <TouchableOpacity 
            style={[styles.sendButton, { 
              backgroundColor: inputText.trim() ? '#1d9bf0' : (isRecording ? '#EF4444' : (isDarkMode ? '#202327' : '#f7f9f9'))
            }]}
            onPress={inputText.trim() ? handleSend : (isRecording ? stopRecording : startRecording)}
            disabled={false}
          >
            <Text style={[styles.sendButtonText, { 
              color: inputText.trim() ? '#ffffff' : (isRecording ? '#ffffff' : (isDarkMode ? '#71767b' : '#536471'))
            }]}>
              {inputText.trim() ? 'Send' : (isRecording ? '⏹' : '🎙')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  twitterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    zIndex: 10,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  userAvatarContainer: {
    position: 'relative',
  },
  userAvatar: {
    fontSize: 24,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 5,
  },
  verificationBadge: {
    backgroundColor: '#1d9bf0',
    borderRadius: 50,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verificationBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerIcon: {
    padding: 10,
  },
  headerIconText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  chatBackgroundContainer: {
    flex: 1,
    position: 'relative',
  },
  twitterBackground: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  backgroundPatternText: {
    fontWeight: 'bold',
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    padding: 20,
  },
  messageContainer: {
    marginBottom: 15,
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  userMessageContainer: {
    alignItems: 'flex-end',
    flexDirection: 'row-reverse',
  },
  systemMessageContainer: {
    alignItems: 'center',
  },
  otherMessageContainer: {
    alignItems: 'flex-start',
  },
  senderAvatarContainer: {
    position: 'relative',
    marginRight: 10,
    marginTop: 15,
  },
  senderAvatar: {
    fontSize: 24,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 18,
    padding: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  userMessageBubble: {
    borderTopLeftRadius: 0,
  },
  otherMessageBubble: {
    borderTopRightRadius: 0,
  },
  systemMessageBubble: {
    minWidth: '60%',
    alignItems: 'center',
  },
  senderName: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 5,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 5,
  },
  timestamp: {
    fontSize: 12,
    textAlign: 'right',
  },
  messageStatus: {
    fontSize: 12,
    marginLeft: 5,
    color: '#1d9bf0',
  },
  readStatus: {
    color: '#1d9bf0',
  },
  reactionPicker: {
    flexDirection: 'row',
    marginTop: 5,
    marginLeft: 50,
    opacity: 0,
  },
  userReactionPicker: {
    marginRight: 50,
    marginLeft: 0,
  },
  reactionOption: {
    padding: 5,
    marginRight: 5,
  },
  reactionOptionText: {
    fontSize: 16,
  },
  reactionsContainer: {
    flexDirection: 'row',
    marginTop: 5,
    marginLeft: 50,
  },
  userReactionsContainer: {
    marginRight: 50,
    marginLeft: 0,
    alignSelf: 'flex-end',
  },
  reactionBubble: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 5,
  },
  reactionText: {
    fontSize: 14,
  },
  emojiPicker: {
    maxHeight: 250,
    padding: 10,
  },
  emojiCategories: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  emojiCategoryButton: {
    padding: 8,
    borderRadius: 20,
  },
  emojiCategoryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emojiContent: {
    flex: 1,
  },
  emojiCategory: {
    marginBottom: 10,
  },
  emojiCategoryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  emojiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  emojiButton: {
    padding: 5,
    margin: 2,
  },
  emoji: {
    fontSize: 24,
  },
  emojiToolbar: {
    borderTopWidth: 1,
    paddingVertical: 10,
    alignItems: 'flex-end',
  },
  emojiToolbarButton: {
    padding: 5,
  },
  emojiToolbarText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  inputContainer: {
    padding: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
  },
  inputToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  toolbarButton: {
    padding: 5,
    marginRight: 10,
  },
  toolbarIcon: {
    fontSize: 24,
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 101,
  },
  textInput: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    fontWeight: 'bold',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  typingText: {
    fontSize: 14,
    marginRight: 5,
  },
  typingDots: {
    flexDirection: 'row',
  },
  dot: {
    fontSize: 16,
    lineHeight: 16,
    animationDuration: 1000,
  },
  // Voice message styles
  voiceMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  voiceMessageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  voiceMessageIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  voiceMessageInfo: {
    flex: 1,
  },
  voiceMessageText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  voiceMessageDuration: {
    fontSize: 12,
  },
  // Recording indicator styles
  recordingIndicator: {
    position: 'absolute',
    top: -30,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  recordingText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ChatScreen;