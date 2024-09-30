import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Text, Platform, StatusBar, Alert } from 'react-native';
import { Button } from 'react-native-paper';
import axios from 'axios';
import { server } from "../constants/config";
import { useDispatch, useSelector } from 'react-redux';
import { userExists } from '../redux/reducers/auth';
import { useTheme } from '../lib/themeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { setIsForget } from '../redux/reducers/misc';
import ForgetPasswordDialog from '../components/dialog/ForgetPasswordDialog';
import { getSocket } from '../socket';
import Ionicons from 'react-native-vector-icons/Ionicons'; 

const LoginScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isPasswordVisible, setPasswordVisible] = useState(false); 

  const socket = getSocket();

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const dispatch = useDispatch();
  const { theme } = useTheme();

  const handleLogin = async () => {
    const { email, password } = formData;

    if (!email || !password) {
      Alert.alert('Error', 'Please fill in both email and password');
      return;
    }

    try {
      const response = await axios.post(`${server}/api/v1/user/login`, {
        email,
        password,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // If login is successful
      if (response.status === 200) {
        Alert.alert('Success', 'Login successful');
        dispatch(userExists(response.data.user));
        socket.connect();
        navigation.navigate('home');
      } else {
        Alert.alert('Error', 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login Error:', error);
      Alert.alert('Error', error.response?.data?.message || 'An error occurred during login');
    }
  };

  return (
    <View style={[styles.background, { backgroundColor: theme.background }]}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.formContainer, { backgroundColor: theme.detailcont }]}>
          <Text style={[styles.title, { color: theme.text }]}>Login</Text>

          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Email"
              value={formData.email}
              onChangeText={(text) => handleChange('email', text)}
              style={[styles.input, { color: theme.text }]}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={theme.placeHolder}
            />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="Password"
                secureTextEntry={!isPasswordVisible} // Toggle secure text entry
                value={formData.password}
                onChangeText={(text) => handleChange('password', text)}
                style={[styles.input, { color: theme.text, flex: 1 }]}
                autoCapitalize="none"
                placeholderTextColor={theme.placeHolder}
              />
              <TouchableOpacity
                onPress={() => setPasswordVisible(!isPasswordVisible)} // Toggle password visibility
                style={styles.eyeButton}
              >
                <Ionicons
                  name={isPasswordVisible ? 'eye-off' : 'eye'} // Change icon based on visibility
                  size={24}
                  color={theme.icon}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity onPress={() => { dispatch(setIsForget(true)) }}>
            <Text style={[styles.forgotPassword, { color: theme.icon }]}>Forgot Password?</Text>
          </TouchableOpacity>
          <View style={{ alignItems: "center" }}>
            <Button
              mode="contained"
              onPress={handleLogin}
              contentStyle={styles.buttonContent}
              style={styles.button}
            >
              Login
            </Button>

            <Button
              mode="outlined"
              onPress={() => navigation.navigate('signup')}
              contentStyle={styles.buttonContent}
              style={[styles.outlineButton, { borderColor: theme.signupbtn }]}
              textColor={theme.icon}
            >
              Sign Up
            </Button>
          </View>
        </View>
      </SafeAreaView>
      <ForgetPasswordDialog />
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    backgroundColor: '#f4f7f9',
    flex: 1,
    width: '100%',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxWidth: 400,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  input: {
    padding: 10,
    fontSize: 16,
    width: '100%',
  },
  eyeButton: {
    marginLeft: 10,
    padding: 5,
  },
  button: {
    marginTop: 10,
    borderRadius: 25,
    backgroundColor: '#6d28d9',
    width: '60%',
  },
  buttonContent: {
    height: 45,
  },
  outlineButton: {
    marginTop: 10,
    borderRadius: 25,
    width: '60%',
  },
  forgotPassword: {
    textAlign: 'right',
    marginBottom: 10,
    color: '#6A0DAD',
  },
});

export default LoginScreen;
