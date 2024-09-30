import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useDispatch} from 'react-redux';
import {useResetPasswordMutation} from '../redux/api/api';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useAsyncMutation} from '../hooks/hooks';
import {useTheme} from '../lib/themeContext';
import {useNavigation} from '@react-navigation/native';

const ResetPassword = () => {
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // New state for newPassword visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // New state for confirmPassword visibility

  const [resetPassword, isLoading, data] = useAsyncMutation(useResetPasswordMutation);
  const navigation = useNavigation();
  const {theme} = useTheme();

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New Password and Confirm Password did not match');
      return;
    }
    resetPassword('Changing Password...', {otp: otp, newPassword: newPassword});
  };

  useEffect(() => {
    if (data) {
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      navigation.navigate('login');
    }
  }, [data]);

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: theme.background}]}>
      <View style={styles.appBar}>
        <TouchableOpacity onPress={() => navigation.navigate('login')}>
          <Icon name="chevron-back-outline" size={24} color={theme.icon} />
        </TouchableOpacity>
        <Text style={[styles.titleText, {color: theme.titleTxt}]}>Reset Password</Text>
      </View>

      <View style={styles.form}>
        <Text style={[styles.label, {color: theme.lastMessage}]}>OTP</Text>
        <TextInput
          style={[styles.input, {backgroundColor: theme.srchbarbg, color: theme.text}]}
          value={otp}
          keyboardType="number-pad"
          onChangeText={setOtp}
          placeholder="Enter OTP"
          maxLength={6}
          placeholderTextColor={theme.placeHolder}
        />

        <Text style={[styles.label, {color: theme.lastMessage}]}>New Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.input, styles.passwordInput, {backgroundColor: theme.srchbarbg, color: theme.text}]}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showPassword} // Toggles password visibility
            placeholder="Enter new password"
            placeholderTextColor={theme.placeHolder}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(prevState => !prevState)}>
            <Icon name={showPassword ? 'eye-off' : 'eye'} size={24} color={theme.icon} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.label, {color: theme.lastMessage}]}>Confirm New Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.input, styles.passwordInput, {backgroundColor: theme.srchbarbg, color: theme.text}]}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword} // Toggles confirm password visibility
            placeholder="Confirm new password"
            placeholderTextColor={theme.placeHolder}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowConfirmPassword(prevState => !prevState)}>
            <Icon name={showConfirmPassword ? 'eye-off' : 'eye'} size={24} color={theme.icon} />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <ActivityIndicator size="medium" color="#6d28d9" />
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
            <Text style={styles.buttonText}>Change Password</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    height: 50,
    borderRadius: 3,
  },
  titleText: {
    color: '#6d28d9',
    fontSize: 24,
    fontWeight: 'bold',
    paddingHorizontal: 10,
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 18,
    color: '#333',
    marginBottom: 5,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
  },
  eyeButton: {
    position: 'absolute',
    right: 10,
    top: 8,
  },
  button: {
    backgroundColor: '#6d28d9',
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default ResetPassword;
