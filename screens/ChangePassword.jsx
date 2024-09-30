import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDispatch } from 'react-redux';
import { useUpdatePasswordMutation } from '../redux/api/api'; 
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../lib/themeContext';

const ChangePassword = ({ navigation }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [isOldPasswordVisible, setOldPasswordVisible] = useState(false);
  const [isNewPasswordVisible, setNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const [updatePassword] = useUpdatePasswordMutation();
  const dispatch = useDispatch();
  const {theme} = useTheme();

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New Password and Confirm Password did not match');
      return;
    }

    setIsLoading(true);

    try {
      const res = await updatePassword({ oldPassword, newPassword }).unwrap();
      Alert.alert('Success', 'Password changed successfully');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: theme.background}]}>
      <View style={styles.appBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back-outline" size={24} color={theme.icon} />
        </TouchableOpacity>
        <Text style={[styles.titleText, {color: theme.titleTxt}]}>Change Password</Text>
      </View>

      <View style={styles.form}>
        <Text style={[styles.label, {color: theme.lastMessage}]}>Old Password</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, {backgroundColor: theme.srchbarbg, color: theme.text}]}
            value={oldPassword}
            onChangeText={setOldPassword}
            secureTextEntry={!isOldPasswordVisible}
            placeholder="Enter old password"
            placeholderTextColor={theme.placeHolder}
          />
          <TouchableOpacity style={styles.eyeButton} onPress={() => setOldPasswordVisible(!isOldPasswordVisible)}>
            <Icon name={isOldPasswordVisible ? "eye-off" : "eye"} size={24} color={theme.icon} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.label, {color: theme.lastMessage}]}>New Password</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, {backgroundColor: theme.srchbarbg, color: theme.text}]}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!isNewPasswordVisible}
            placeholder="Enter new password"
            placeholderTextColor={theme.placeHolder}
          />
          <TouchableOpacity style={styles.eyeButton} onPress={() => setNewPasswordVisible(!isNewPasswordVisible)}>
            <Icon name={isNewPasswordVisible ? "eye-off" : "eye"} size={24} color={theme.icon} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.label, {color: theme.lastMessage}]}>Confirm New Password</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, {backgroundColor: theme.srchbarbg, color: theme.text}]}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!isConfirmPasswordVisible}
            placeholder="Confirm new password"
            placeholderTextColor={theme.placeHolder}
          />
          <TouchableOpacity style={styles.eyeButton} onPress={() => setConfirmPasswordVisible(!isConfirmPasswordVisible)}>
            <Icon name={isConfirmPasswordVisible ? "eye-off" : "eye"} size={24} color={theme.icon} />
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
  },
  button: {
    backgroundColor: '#6d28d9',
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
    width: '70%',
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  eyeButton: {
    position: 'absolute',
    right: 10,
    top: 8,
  },
});

export default ChangePassword;
