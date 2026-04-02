import React from 'react';
import MainApp from '../src/MainApp';
import { ThemeProvider } from '../src/theme/ThemeContext';

export default function HomeScreen() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}