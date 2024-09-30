import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {ActivityIndicator, Avatar} from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import Toast from 'react-native-toast-message';
import {server} from '../constants/config';
import axios from 'axios';
import {userExists, userNotExists} from '../redux/reducers/auth';
import {transformImage} from '../lib/features';
import {useTheme} from '../lib/themeContext';
import {getSocket} from '../socket';

const EditProfile = ({navigation, route}) => {
  const {user} = useSelector(state => state.auth);

  const [avatar, setAvatar] = useState(user?.avatar?.url);
  const [isEdit, setIsEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name,
    username: user?.username,
    bio: user?.bio,
  });

  const dispatch = useDispatch()

  const {theme} = useTheme();

  const handleChange = (name, value) => {
    setFormData({...formData, [name]: value});
  };

  const handleImage = () => {
    navigation.navigate('camera', {
      screen: 'editprofile',
    });
  };

  const handleUpdateProfile = async () => {
    setIsLoading(true); 
    try {
      if (!formData.name || !formData.username || !formData.bio) {
        Toast.show({
          bottomOffset: 100,
          type: 'error',
          text1: 'Please fill in all fields.',
          position: 'bottom',
        });
        setIsLoading(false); 
        return;
      }

      const myForm = new FormData();
      myForm.append('name', formData.name);
      myForm.append('username', formData.username);
      myForm.append('bio', formData.bio);

      if (avatar) {
        myForm.append('avatar', {
          uri: avatar,
          name: `profile.jpg`,
          type: `image/jpeg`,
        });
      }

      const config = {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      const response = await axios.put(
        `${server}/api/v1/user/me/editprofile`,
        myForm,
        config,
      );

      setIsEdit(false);

      
      Toast.show({
        bottomOffset: 100,
        type: 'success',
        text1: response.data.message,
        position: 'bottom',
      });

      dispatch(userExists(response.data.user));
      navigation.goBack();
    } catch (error) {
      Toast.show({
        bottomOffset: 100,
        type: 'error',
        text1: error?.response?.data?.message || 'Something went wrong',
        position: 'bottom',
      });
    } finally {
      setIsLoading(false);
    }
  };
  const details = [
    { icon: 'person', text: formData?.name, label: "Name", val: "name" },
    { icon: 'at', text: formData?.username, label: "Username", val: "username" },
    { icon: 'chatbox-ellipses', text: formData?.bio, label: "Bio", val: "bio" },
  ];



  useEffect(() => {
    if (route.params) {
      if (route.params.image) {
        setAvatar(route.params.image);
      }
    }
  }, [route]);

  return (
    <View style={[styles.container, {backgroundColor: theme.background}]}>
      <SafeAreaView
        style={[styles.container, {backgroundColor: theme.background}]}>
        <View style={styles.appBar}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
            }}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="chevron-back-outline" size={30} color={theme.icon} />
            </TouchableOpacity>
            <Text style={[styles.titleText, {color: theme.titleTxt}]}>
              Edit Profile
            </Text>
          </View>
        </View>

        <View style={styles.profileContainer}>
          <TouchableOpacity style={styles.avatarContainer} onPress={handleImage}>
            <View style={{position: 'relative'}}>
              <Avatar.Image
                size={140}
                style={styles.avatarStyle}
                source={{uri: transformImage(avatar)}}
              />
              <View style={{
                    position: 'absolute',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    padding: 50,
                    borderRadius: 100,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
              <Icon
                name="camera"
                size={40}
                color="#d4d4d4"
                />
                </View>
            </View>
            <Text
              style={{
                padding: 5,
                borderRadius: 10,
                color: theme.icon,
                fontWeight: '600',
                fontSize: 18,
              }}>
              Change Picture
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.detailsCard}>
          {details.map((detail, index) => (
            <View
              key={index}
              style={[
                styles.detailRow,
                { backgroundColor: index % 2 === 0 ? theme.even : theme.odd },
                { borderTopLeftRadius: index === 0 ? 12 : 0 },
                { borderTopRightRadius: index === 0 ? 12 : 0 },
                { borderBottomLeftRadius: index === details.length - 1 ? 12 : 0 },
                { borderBottomRightRadius: index === details.length - 1 ? 12 : 0 }
              ]}
            >
              <Icon name={detail.icon} size={24} color="#777" />
              <View style={styles.inputContainer}>
              <TextInput
                placeholder={detail.label}
                value={detail.text}
                onChangeText={text => handleChange(detail.val, text)}
                style={[styles.input, {color: theme.text}]}
                placeholderTextColor={theme.placeHolder}
                autoCapitalize="none"
              />
            </View>
            </View>
          ))}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.btn}
            disabled={isLoading}
            onPress={handleUpdateProfile}>
                {isLoading? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.btnTxt}>Update</Text>
                )}
                </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
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
    paddingHorizontal: 15,
    height: 50,
    borderRadius: 3,
    justifyContent: 'space-between',
  },
  profileContainer: {
    alignItems: 'center',
    gap: 20,
    marginTop: 30,
  },
  avatarContainer: {
    alignSelf: 'center',
  },
  avatarStyle: {
    alignSelf: 'center',
  },
  titleText: {
    color: '#6d28d9',
    fontSize: 30,
    fontWeight: 'bold',
    paddingHorizontal: 10,
  },
  nameText: {
    fontWeight: '700',
    fontSize: 26,
    color: '#362d28',
    textAlign: 'center',
  },
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 10,
  },
  usernameText: {
    fontSize: 18,
    color: '#777',
    marginLeft: 5,
  },
  detailsCard: {
    borderRadius: 20,
    marginHorizontal: 20,
    marginVertical: 40,
    shadowColor: 'black',
    shadowOffset: {width: 0, height: 1},
    shadowRadius: 2,
    shadowOpacity: 0.1,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    gap: 15
  },
  detailText: {
    fontSize: 18,
    color: 'rgb(55 65 81)',
    marginLeft: 15,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 10,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#6d28d9',
    justifyContent: 'center',
    position: 'relative',
    width: "80%",
    alignSelf: 'center',
  },
  iconStyle: {
    position: 'absolute',
    left: 20,
  },
  btnTxt: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  input: {
    padding: 10,
    fontSize: 18,
    width: '100%',
  },
});

export default EditProfile;
