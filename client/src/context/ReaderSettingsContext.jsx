import React, { createContext, useContext, useState, useEffect } from 'react';

const ReaderSettingsContext = createContext();

export const ReaderSettingsProvider = ({ children }) => {
  const [fontSize, setFontSize] = useState(() => {
    return parseFloat(localStorage.getItem('pe_reader_font_size') || '1.125'); // in rem (18px)
  });

  const [lineHeight, setLineHeight] = useState(() => {
    return parseFloat(localStorage.getItem('pe_reader_line_height') || '1.9'); // default 1.9 for Devanagari
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('pe_reader_theme') || 'light'; // light, dark, sepia
  });

  const [fontFamily, setFontFamily] = useState(() => {
    return localStorage.getItem('pe_reader_font_family') || 'Noto Sans Devanagari';
  });

  useEffect(() => {
    localStorage.setItem('pe_reader_font_size', fontSize.toString());
    document.documentElement.style.setProperty('--reader-font-size', `${fontSize}rem`);
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('pe_reader_line_height', lineHeight.toString());
    document.documentElement.style.setProperty('--reader-line-height', lineHeight.toString());
  }, [lineHeight]);

  useEffect(() => {
    localStorage.setItem('pe_reader_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('pe_reader_font_family', fontFamily);
    document.documentElement.style.setProperty('--reader-font-family', `"${fontFamily}", sans-serif`);
  }, [fontFamily]);

  const resetDefaults = () => {
    setFontSize(1.125);
    setLineHeight(1.9);
    setTheme('light');
    setFontFamily('Noto Sans Devanagari');
  };

  return (
    <ReaderSettingsContext.Provider
      value={{
        fontSize,
        setFontSize,
        lineHeight,
        setLineHeight,
        theme,
        setTheme,
        fontFamily,
        setFontFamily,
        resetDefaults
      }}
    >
      {children}
    </ReaderSettingsContext.Provider>
  );
};

export const useReaderSettings = () => useContext(ReaderSettingsContext);
