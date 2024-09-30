import React, { createContext, useState, useEffect, useContext } from 'react';
import { useColorScheme } from 'react-native';

const lightTheme = {
    background: '#ffffff',
    text: '#000000',
    icon: '#6d28d9',
    toggleIcon: 'moon', 
    toggleText: 'Dark',
    seperator: '#ccc',
    seperatorHeight: 0.7, 
    lastMessage: '#777',
    leftBubble: "#f0f0f0", 
    name: '#6d28d9',
    titleTxt: '#6d28d9',
    menuIcon: '#6d28d9',
    menubg: '#fff',
    footericon: '#6d28d9',
    selfootericon: '#f5f5f5',
    srchbarbg: '#f0f0f0',
    footerbg: '#ffffff',
    datebg: '#e2e8f0',
    datetext: "#404040" ,
    border: '#a3a3a3',
    placeHolder: '#525252',
    timetext: "#525252",
    detailcont: "#f0f0f0",
    even: 'rgb(241 245 249)',
    odd: '#fff',
    logoutbtn: 'rgba(109, 40, 217, 0.25)',
    signupbtn: '#6d28d9'
    
  };
  
  const darkTheme = {
    background: '#171717', 
    text: '#e5e5e5',
    icon: '#e5e5e5', 
    toggleIcon: 'sunny', 
    toggleText: 'Light',
    lastMessage: '#737373',
    seperator: '#777',
    seperatorHeight: 0.35, 
    leftBubble: "#292828", 
    name: '#a063ff',
    titleTxt: '#e5e5e5',
    menuIcon: '#e5e5e5',
    menubg: '#404040',
    footericon: '#e5e5e5',
    selfootericon: '#e5e5e5',
    srchbarbg: '#404040',
    footerbg:  '#262626',
    datebg: '#525252',
    datetext: "#e5e5e5" ,
    border: '#404040',
    placeHolder: '#737373',
    timetext: "#d4d4d4",
    detailcont: "#262626",
    even: '#262626',
    odd: '#171717',
    logoutbtn: 'rgba(256,256, 256, 0.2)',
    signupbtn: 'transparent'

  };
  
  const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const deviceTheme = useColorScheme(); 
  const [isDarkMode, setIsDarkMode] = useState(deviceTheme === 'dark');

  const toggleTheme = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  useEffect(() => {
    setIsDarkMode(deviceTheme === 'dark');
  }, [deviceTheme]);

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        theme: isDarkMode ? darkTheme : lightTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
