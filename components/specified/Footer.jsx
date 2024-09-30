import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import React from 'react';
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation, useNavigationState } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { useTheme } from '../../lib/themeContext';

const Footer = () => {
  const navigation = useNavigation();
  const {user} = useSelector((state) => state.auth)

  const {theme} = useTheme()
  
  // Safely access the navigation state
  const navigationState = useNavigationState((state) => state);
  const currentRoute = navigationState?.routes?.[navigationState.index]?.name;

  const iconStyles = (routeName) => ({
    backgroundColor: currentRoute === routeName ? "rgba(109, 40, 217, 0.8)" : "transparent",
    borderRadius: 30,
    paddingHorizontal: 25,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowRadius: 2,
    shadowOpacity: currentRoute === routeName ? 0.5 : 0,
    elevation: currentRoute === routeName ? 2 : 0,
  });

  const iconColor = (routeName) => (currentRoute === routeName ? theme.selfootericon : theme.footericon);
  const iconSize = (routeName) => (currentRoute === routeName ? 28 : 25);
  const show = (currentRoute === 'home' || currentRoute === 'groups' || currentRoute === 'profile');

  return (
    <>
    {show && <View style={[styles.footer, {backgroundColor: theme.footerbg}]}>
    <TouchableOpacity onPress={() => navigation.navigate('home')} style={iconStyles("home")}>
      <Icon name="home" size={iconSize('home')} color={iconColor("home")} />
    </TouchableOpacity>
    <TouchableOpacity onPress={() => navigation.navigate('groups')} style={iconStyles("groups")}>
      <Icon name="people" size={iconSize('groups')} color={iconColor("groups")} />
    </TouchableOpacity>
    <TouchableOpacity onPress={() => navigation.navigate('profile')} style={iconStyles("profile")}>
      <Icon name="person-circle" size={iconSize('profile')} color={iconColor("profile")} />
    </TouchableOpacity>
  </View>}
    </>
  );
};

const styles = StyleSheet.create({
  footer: {
    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
    paddingTop: 12,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-around",
    elevation: 10,
    zIndex: 10, 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 }, 
    shadowRadius: 2, 
    shadowOpacity: 0.2, 
  },
});


export default Footer;
