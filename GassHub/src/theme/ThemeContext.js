import React, { createContext, useState, useContext } from 'react';
import PropTypes from 'prop-types';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

/**
 * Theme provider component that manages the dark/light mode state
 * @param {{children: React.ReactNode}} props - Component props
 */
const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const lightColors = {
    primary: '#1d9bf0',
    primaryLight: '#1d9bf0',
    primaryDark: '#1d9bf0',
    secondary: '#7C3AED',
    background: '#ffffff',
    card: '#f7f9f9',
    surface: '#ffffff',
    text: '#0f1419',
    textSecondary: '#536471',
    textMuted: '#71767b',
    border: '#eff3f4',
    borderLight: '#eff3f4',
    sentMessage: '#1d9bf0',
    receivedMessage: '#f7f9f9',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#1d9bf0'
  };

  const darkColors = {
    primary: '#1d9bf0',
    primaryLight: '#1d9bf0',
    primaryDark: '#1d9bf0',
    secondary: '#7C3AED',
    background: '#000000',
    card: '#202327',
    surface: '#202327',
    text: '#e7e9ea',
    textSecondary: '#71767b',
    textMuted: '#71767b',
    border: '#2f3336',
    borderLight: '#2f3336',
    sentMessage: '#1d9bf0',
    receivedMessage: '#202327',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#1d9bf0'
  };

  const theme = {
    isDarkMode,
    toggleTheme,
    colors: isDarkMode ? darkColors : lightColors,
  };

  return React.createElement(ThemeContext.Provider, { value: theme }, children);
};

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { ThemeProvider };
export default ThemeProvider;