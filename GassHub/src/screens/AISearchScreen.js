import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  Keyboard,
  Dimensions,
  Modal,
  Linking,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';

const AISearchScreen = ({ onClose }) => {
  const { colors } = useTheme();
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const scrollViewRef = useRef();
  const { width, height } = Dimensions.get('window');

  // Handle keyboard events
  React.useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Handle attachment selection
  const handleAttachment = (type) => {
    setShowAttachmentMenu(false);
    switch (type) {
      case 'camera':
        // Open camera
        Alert.alert('Camera', 'Opening camera...');
        break;
      case 'file':
        // Open file picker
        Alert.alert('Files', 'Opening file browser...');
        break;
      case 'image':
        // Open image gallery
        Alert.alert('Images', 'Opening image gallery...');
        break;
      default:
        break;
    }
  };

  // Function to send message to our backend
  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    try {
      setIsLoading(true);
      
      // Add user message to conversation
      const userMessage = { role: 'user', content: inputMessage };
      const updatedConversation = [...conversation, userMessage];
      setConversation(updatedConversation);
      
      // Clear input
      setInputMessage('');
      
      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);

      // Check if this is an Velli related message
      const lowerCaseMessage = inputMessage.toLowerCase();
      if (lowerCaseMessage.includes('velli') || lowerCaseMessage.includes('ai') || lowerCaseMessage.includes('assistant')) {
        // Custom response for Velli inquiries
        const customResponse = "Please call Xtra.dev @ 0257454231 or Gabby @ 0270754667";
        
        // Add custom AI response to conversation
        setTimeout(() => {
          const aiMessage = { role: 'assistant', content: customResponse };
          setConversation(prev => [...prev, aiMessage]);
          
          // Scroll to bottom after response
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }, 1000);
        
        setIsLoading(false);
        return;
      }

      // Send request to our backend
      // NOTE: Update this URL to match your development machine's IP address
      // For Android emulator, use 10.0.2.2
      // For iOS simulator, use localhost
      // For physical devices, use your machine's local IP address
      const serverUrl = __DEV__ 
        ? Platform.OS === 'android' 
          ? 'http://10.0.2.2:3000/api/chat-simple'  // Android emulator
          : 'http://localhost:3000/api/chat-simple'   // iOS simulator
        : 'http://your-production-url.com/api/chat-simple';  // Production URL
      
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // Increase timeout to 30 seconds
      
      // Log the request for debugging
      console.log('Sending request to:', serverUrl);
      console.log('Message:', inputMessage);
      
      const response = await fetch(serverUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          history: updatedConversation.slice(0, -1), // Exclude the latest user message
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      const data = await response.json();
      
      if (response.ok) {
        // Add AI response to conversation
        const aiMessage = { role: 'assistant', content: data.reply };
        setConversation(prev => [...prev, aiMessage]);
      } else {
        // Handle API errors
        throw new Error(data.error || `Server error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Check if this might be a network/server issue
      if (error.name === 'AbortError' || 
          error.message.includes('Network request failed') || 
          error.message.includes('Failed to fetch')) {
        
        // Provide a helpful fallback response
        const fallbackResponse = "I'm currently having trouble connecting to my brain. Please try again in a moment, or contact support if the issue persists.";
        
        setTimeout(() => {
          const aiMessage = { role: 'assistant', content: fallbackResponse };
          setConversation(prev => [...prev, aiMessage]);
          
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }, 500);
        
        setIsLoading(false);
        return;
      }
      
      let errorMessage = 'Failed to send message. Please try again later.';
      
      if (error.name === 'AbortError') {
        errorMessage = 'Request timed out. Please check your internet connection and try again.';
      } else if (error.message.includes('Network request failed')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Could not connect to the server. Please make sure the backend is running.';
      }
      
      // Show more detailed error message
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
      // Scroll to bottom after response
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  // Function to clear conversation
  const clearConversation = () => {
    setConversation([]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: '#1E3A8A' }]}>
        <Text style={styles.headerTitle}>Hi I'm Velli</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>×</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content Area */}
      <View style={styles.mainContent}>
        {/* Conversation Area */}
        <ScrollView 
          ref={scrollViewRef}
          style={[styles.conversationArea, { marginBottom: keyboardHeight > 0 ? keyboardHeight - 20 : 0 }]}
          contentContainerStyle={styles.conversationContent}
        >
        {conversation.length === 0 ? (
          <View style={styles.welcomeContainer}>
            <Text style={[styles.welcomeText, { color: colors.text }]}>
              Hi I'm Velli!
            </Text>
            <Text style={[styles.instructions, { color: colors.textSecondary }]}>
              Ask me anything about your courses, materials, or academic topics.
            </Text>
          </View>
        ) : (
          conversation.map((message, index) => (
            <View 
              key={index} 
              style={[
                styles.messageContainer, 
                message.role === 'user' ? styles.userMessage : styles.aiMessage,
                { backgroundColor: message.role === 'user' ? colors.primary : colors.card }
              ]}
            >
              <Text style={[
                styles.messageText, 
                { color: message.role === 'user' ? '#FFFFFF' : colors.text }
              ]}>
                {message.content}
              </Text>
            </View>
          ))
        )}
        
        {isLoading && (
          <View style={[styles.messageContainer, styles.aiMessage, { backgroundColor: colors.card }]}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.messageText, { color: colors.text, marginLeft: 10 }]}>
              Thinking...
            </Text>
          </View>
        )}
      </ScrollView>
      </View>

      {/* Input Area - Modern Chat Style */}
      <View style={[styles.inputArea, { backgroundColor: colors.background }]}>
        <View style={styles.inputContainer}>
          <TouchableOpacity 
            style={styles.plusButton}
            onPress={() => setShowAttachmentMenu(true)}
          >
            <Text style={styles.plusButtonText}>+</Text>
          </TouchableOpacity>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            value={inputMessage}
            onChangeText={setInputMessage}
            placeholder="Ask anything"
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={500}
            editable={!isLoading}
          />
          <TouchableOpacity 
            style={[styles.sendButton, { backgroundColor: inputMessage.trim() ? '#1E3A8A' : '#CCCCCC' }]}
            onPress={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.sendButtonIcon}>➤</Text>
            )}
          </TouchableOpacity>
        </View>
        <Text style={[styles.disclaimer, { color: colors.textMuted }]}>Velli can make mistakes. Check important info.</Text>
      </View>

      {/* Attachment Menu Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showAttachmentMenu}
        onRequestClose={() => setShowAttachmentMenu(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          onPress={() => setShowAttachmentMenu(false)}
        >
          <View style={styles.attachmentMenu}>
            <TouchableOpacity 
              style={styles.attachmentOption}
              onPress={() => handleAttachment('camera')}
            >
              <Text style={styles.attachmentIcon}>📷</Text>
              <Text style={styles.attachmentText}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.attachmentOption}
              onPress={() => handleAttachment('image')}
            >
              <Text style={styles.attachmentIcon}>🖼️</Text>
              <Text style={styles.attachmentText}>Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.attachmentOption}
              onPress={() => handleAttachment('file')}
            >
              <Text style={styles.attachmentIcon}>📁</Text>
              <Text style={styles.attachmentText}>Files</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#1E3A8A',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '300',
  },
  mainContent: {
    flex: 1,
  },
  conversationArea: {
    flex: 1,
    paddingHorizontal: 15,
  },
  conversationContent: {
    paddingVertical: 15,
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  instructions: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  messageContainer: {
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    maxWidth: '85%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 5,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 5,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  inputArea: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  plusButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E3A8A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  plusButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E3A8A',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonIcon: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  disclaimer: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  attachmentMenu: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  attachmentOption: {
    alignItems: 'center',
    padding: 15,
  },
  attachmentIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  attachmentText: {
    fontSize: 14,
    color: '#333333',
  },
});

export default AISearchScreen;