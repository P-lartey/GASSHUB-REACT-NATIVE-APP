import React from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Show alert for immediate feedback
    Alert.alert(
      'App Error',
      `Something went wrong: ${error.message}\n\nPlease restart the app.`,
      [{ text: 'OK' }]
    );
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // Render error UI
      return (
        <View style={styles.container}>
          <Text style={styles.title}>⚠️ Something went wrong!</Text>
          <Text style={styles.errorText}>Error: {this.state.error?.toString()}</Text>
          <Text style={styles.errorText}>Component Stack: {this.state.errorInfo?.componentStack}</Text>
          <Button 
            title="Reload App" 
            onPress={() => {
              this.setState({ hasError: false, error: null, errorInfo: null });
            }} 
          />
          <Button 
            title="Show Details" 
            onPress={() => {
              Alert.alert(
                'Error Details',
                `Error: ${this.state.error?.toString()}\n\nStack: ${this.state.errorInfo?.componentStack}`,
                [{ text: 'OK' }]
              );
            }} 
          />
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
    maxWidth: '90%',
  },
});

export default ErrorBoundary;