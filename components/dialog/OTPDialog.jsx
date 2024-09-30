import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Dialog, Paragraph } from 'react-native-paper';
import { useAsyncMutation } from '../../hooks/hooks';
import { useVerifyUserMutation } from '../../redux/api/api';
import { useDispatch } from 'react-redux';
import { userExists } from '../../redux/reducers/auth';
import { useTheme } from '../../lib/themeContext';

const OTPDialog = () => {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verifyUser, loading, userData] = useAsyncMutation(useVerifyUserMutation)
  const dispatch = useDispatch();

  const {theme} = useTheme();

  const submitHandler = async () => {
    if (otp.length !== 6 || isNaN(Number(otp))) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);

    try {
      await verifyUser("Verfying OTP...", {data: {otp: otp}});
      setOtp('');

    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to verify OTP');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(()=>{
    if(userData?.user?.verified){
        dispatch(userExists(userData?.user))
    }
},[userData])

  return (
    <Dialog visible={true} onDismiss={() => { /*  dismiss */ }} style={{backgroundColor: theme.detailcont}}>
      <Dialog.Title style={{color: theme.text}}>Verify Your Account</Dialog.Title>
      <Dialog.Content>
        <Paragraph  style={{color: theme.text}}>
          Please enter the one-time password sent to your email.
        </Paragraph>
        <TextInput
          style={[styles.input, {backgroundColor: theme.srchbarbg, color: theme.text}]}
          keyboardType="number-pad"
          value={otp}
          onChangeText={setOtp}
          maxLength={6}
          placeholder='Enter OTP'
          placeholderTextColor={theme.placeHolder}
        />
      </Dialog.Content>
      <Dialog.Actions>
        {isLoading ? (
          <ActivityIndicator size="large" color="#6d28d9" />
        ) : (
          <TouchableOpacity style={styles.button} onPress={submitHandler}>
            <Text style={styles.buttonText}>Verify Account</Text>
          </TouchableOpacity>
        )}
      </Dialog.Actions>
    </Dialog>
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#6d28d9',
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default OTPDialog;
