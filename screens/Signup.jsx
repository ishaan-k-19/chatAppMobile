import axios from 'axios';
import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  Platform,
  StatusBar,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {Avatar, Button, Card} from 'react-native-paper';
import {useDispatch} from 'react-redux';
import {server} from '../constants/config';
import {userExists} from '../redux/reducers/auth';
import {transformImage} from '../lib/features';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTheme} from '../lib/themeContext';
import { getSocket } from '../socket';
import defaultAvatar from '../images/default.png';
import Ionicons from 'react-native-vector-icons/Ionicons'; 


const Signup = ({navigation, route}) => {
  const [avatar, setAvatar] = useState('');
  const [isPasswordVisible, setPasswordVisible] = useState(false); 
  const [isConfirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const [loading, setLoading] = useState(false); 
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    bio: 'Hey There!',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const DEFAULT_IMAGE = Image.resolveAssetSource(defaultAvatar).uri;




  const dispatch = useDispatch();
  const {theme} = useTheme();
  const socket = getSocket();

  const handleChange = (name, value) => {
    setFormData({...formData, [name]: value});
  };

  const handleSignup = async () => {
    // Validation
    if (
      !formData.username ||
      !formData.bio ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      Alert.alert('Validation Error', 'Please fill in all fields.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Validation Error', 'Passwords do not match.');
      return;
    }

    setLoading(true); // Start loading and disable button

    try {
      const myForm = new FormData();
      myForm.append('name', formData.name || formData.username);
      myForm.append('username', formData.username);
      myForm.append('bio', formData.bio);
      myForm.append('email', formData.email);
      myForm.append('password', formData.password);

      if (avatar) {
        myForm.append('avatar', {
          uri: avatar,
          name: `profile.jpg`,
          type: `image/jpeg`,
        });
      }
      else {
        myForm.append('avatar', {
          uri: DEFAULT_IMAGE,
          name: 'default.png',
          type: 'image/png',
        });
      }

      const config = {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      const response = await axios.post(
        `${server}/api/v1/user/new`,
        myForm,
        config,
      );
      dispatch(userExists(response.data.user));

      setLoading(false); 
      Alert.alert('Success', response.data.message);
      socket.connect();
      navigation.navigate('home');
    } catch (error) {
      setLoading(false); // Stop loading
      Alert.alert(
        'Error',
        error?.response?.data?.message || 'Something went wrong',
      );
    }
  };

  const handleImage = () => {
    navigation.navigate('camera', {
      screen: 'signup',
    });
  };

  useEffect(() => {
    if (route.params && route.params.image) {
      setAvatar(route.params.image);
    }
  }, [route]);

  return (
    <View style={[styles.background, {backgroundColor: theme.background}]}>
      <SafeAreaView
        style={[styles.container, {backgroundColor: theme.background}]}>
        <Card style={[styles.formCard, {backgroundColor: theme.detailcont}]}>
          <Card.Content>
            <Text style={[styles.title, {color: theme.text}]}>Sign Up</Text>
            <TouchableOpacity onPress={handleImage}>
              {avatar ? (
                <Avatar.Image
                  size={100}
                  style={styles.avatar}
                  source={{uri: avatar ? transformImage(avatar) : null}}
                />
              ) : (
                <Avatar.Icon
                  size={100}
                  icon="camera"
                  style={styles.avatar}
                  color="#ccc"
                />
              )}
            </TouchableOpacity>

            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Name"
                value={formData.name}
                onChangeText={text => handleChange('name', text)}
                style={[styles.input, {color: theme.text}]}
                placeholderTextColor={theme.placeHolder}
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Username"
                value={formData.username}
                onChangeText={text => handleChange('username', text)}
                style={[styles.input, {color: theme.text}]}
                placeholderTextColor={theme.placeHolder}
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Bio"
                value={formData.bio}
                onChangeText={text => handleChange('bio', text)}
                style={[styles.input, {color: theme.text}]}
                placeholderTextColor={theme.placeHolder}
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Email"
                value={formData.email}
                onChangeText={text => handleChange('email', text)}
                style={[styles.input, {color: theme.text}]}
                placeholderTextColor={theme.placeHolder}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="Password"
                secureTextEntry={!isPasswordVisible} 
                value={formData.password}
                onChangeText={(text) => handleChange('password', text)}
                style={[styles.input, { color: theme.text, flex: 1 }]}
                autoCapitalize="none"
                placeholderTextColor={theme.placeHolder}
              />
              <TouchableOpacity
                onPress={() => setPasswordVisible(!isPasswordVisible)} 
                style={styles.eyeButton}
              >
                <Ionicons
                  name={isPasswordVisible ? 'eye-off' : 'eye'} 
                  size={24}
                  color={theme.icon}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="Password"
                secureTextEntry={!isConfirmPasswordVisible} 
                value={formData.confirmPassword}
                onChangeText={(text) => handleChange('confirmPassword', text)}
                style={[styles.input, { color: theme.text, flex: 1 }]}
                autoCapitalize="none"
                placeholderTextColor={theme.placeHolder}
              />
              <TouchableOpacity
                onPress={() => setConfirmPasswordVisible(!isConfirmPasswordVisible)} 
                style={styles.eyeButton}
              >
                <Ionicons
                  name={isConfirmPasswordVisible ? 'eye-off' : 'eye'} 
                  size={24}
                  color={theme.icon}
                />
              </TouchableOpacity>
            </View>
          </View>

            {formData.avatar && (
              <Image
                source={{uri: transformImage(formData.avatar)}}
                style={styles.avatarPreview}
              />
            )}

            <View style={{alignItems: 'center'}}>
              <Button
                mode="contained"
                onPress={handleSignup}
                contentStyle={styles.buttonContent}
                style={styles.button}
                disabled={loading} // Disable button while loading
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  'Sign Up'
                )}
              </Button>

              <Button
                mode="outlined"
                onPress={() => navigation.navigate('login')}
                contentStyle={styles.buttonContent}
            style={[styles.outlineButton, {borderColor: theme.signupbtn}]}
            textColor={theme.icon}

                >
                Back to Login
              </Button>
            </View>
          </Card.Content>
        </Card>
      </SafeAreaView>
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
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    paddingHorizontal: 20,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  inputContainer: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  input: {
    padding: 10,
    fontSize: 16,
    width: '100%',
  },
  button: {
    marginTop: 5,
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
    borderColor: '#6A0DAD',
    width: '60%',
  },
  avatar: {
    backgroundColor: '#362d28',
    alignSelf: 'center',
  },
  avatarPreview: {
    marginTop: 5,
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
  },
  eyeButton: {
    marginLeft: 10,
    padding: 5,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default Signup;
