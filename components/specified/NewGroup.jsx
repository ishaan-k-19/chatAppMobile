import {React, useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import {Avatar, Dialog, Text} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import {setIsNewGroup} from '../../redux/reducers/misc';
import {
  useAvailableFriendsQuery,
  useMyChatsQuery,
  useMyGroupsQuery,
} from '../../redux/api/api';
import {useErrors} from '../../hooks/hooks';
import Toast from 'react-native-toast-message';
import UserItem from '../shared/UserItem';
import Icon from 'react-native-vector-icons/Ionicons';
import {launchImageLibrary as _launchImageLibrary} from 'react-native-image-picker';
import axios from 'axios';
import {server} from '../../constants/config';
import {transformImage} from '../../lib/features';
import { useTheme } from '../../lib/themeContext';

let launchImageLibrary = _launchImageLibrary;

const NewGroup = () => {
  const dispatch = useDispatch();
  const {isNewGroup} = useSelector(state => state.misc);
  const [avatar, setAvatar] = useState('');
  const {isError, isLoading, error, data} = useAvailableFriendsQuery();
  const [isLoadingNewGroup, setIsLoadingNewGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);

  const errors = [{isError, error}];
  useErrors(errors);
  const myChats = useMyChatsQuery('');
  const myGroups = useMyGroupsQuery('');
  const {theme} = useTheme()

  const selectMemberHandler = id => {
    setSelectedMembers(prev =>
      prev.includes(id)
        ? prev.filter(currentElement => currentElement !== id)
        : [...prev, id],
    );
  };

  const openImagePicker = async () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchImageLibrary(options, handleResponse);
  };

  const handleResponse = response => {
    if (response.didCancel) {
      console.log('User cancelled image picker');
    } else if (response.error) {
      console.log('Image picker error: ', response.error);
    } else {
      let imageUri = response.uri || response.assets?.[0]?.uri;
      setAvatar(imageUri);
    }
  };

  const submitHandler = async () => {
    if (!groupName) {
      return Toast.show({
        bottomOffset: 100,
        type: 'error',
        text1: 'Group name is required',
        position: 'bottom',
      });
    }
    if (!avatar) {
      return Toast.show({
        bottomOffset: 100,
        type: 'error',
        text1: 'Group name is required',
        position: 'bottom',
      });
    }

    if (selectedMembers.length < 2) {
      return Toast.show({
        bottomOffset: 100,
        type: 'error',
        text1: 'Group must have at least 3 members',
        position: 'bottom',
      });
    }

    setIsLoadingNewGroup(true); // Disable button and show loader

    const formData = new FormData();
    formData.append('name', groupName);
    formData.append('members', JSON.stringify(selectedMembers));

    if (avatar) {
      formData.append('avatar', {
        uri: avatar,
        name: 'profile.jpg',
        type: 'image/jpeg',
      });
    }

    const config = {
      withCredentials: true,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };

    try {
      const response = await axios.post(
        `${server}/api/v1/chat/new`,
        formData,
        config,
      );
      Toast.show({
        bottomOffset: 100,
        type: 'success',
        text1: response.data.message,
        position: 'bottom',
      });
      myChats.refetch();
      myGroups.refetch();
      setSelectedMembers([]);
      setAvatar('');
      setGroupName('');
      closeHandler();
    } catch (error) {
      console.log(error);
      Toast.show({
        bottomOffset: 100,
        type: 'error',
        text1: error.message || 'Something went wrong',
        position: 'bottom',
      });
    } finally {
      setIsLoadingNewGroup(false);
    }
  };

  const closeHandler = () => {
    dispatch(setIsNewGroup(false));
  };

  return (
    <Dialog
      visible={isNewGroup}
      onDismiss={closeHandler}
      style={{backgroundColor: theme.detailcont, height: 550}}>
      <Dialog.Title style={{color: theme.text}}>New Group</Dialog.Title>
      <Dialog.Content>
        <View style={styles.groupHeader}>
          <TouchableOpacity
            style={[styles.avatarButton, {borderColor: theme.icon}]}
            onPress={openImagePicker}>
            {avatar ? (
              <Avatar.Image
                size={40}
                style={styles.avatar}
                source={{uri: transformImage(avatar, 50)}}
              />
            ) : (
              <Icon name="camera" size={24} color={theme.icon}/>
            )}
          </TouchableOpacity>
          <TextInput
            style={[styles.input, {backgroundColor: theme.srchbar, color: theme.text}]}
            placeholderTextColor={theme.placeHolder}
            onChangeText={setGroupName}
            value={groupName}
            placeholder="Group Name"
          />
        </View>
        {isLoading ? (
          <ActivityIndicator size="large" color="#6d28d9" />
        ) : (
          <ScrollView style={styles.membersList}>
            {data?.friends?.map(i => (
              <UserItem
                key={i._id}
                user={i}
                handler={selectMemberHandler}
                isAdded={selectedMembers.includes(i._id)}
                styling={{
                  backgroundColor: "transparent",
                }}
              />
            ))}
          </ScrollView>
        )}
        <View style={styles.icons}>
          <TouchableOpacity style={styles.iconbtnSec} onPress={closeHandler}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconbtn, isLoadingNewGroup && {opacity: 0.5}]}
            onPress={submitHandler}
            disabled={isLoadingNewGroup}>
            {isLoadingNewGroup ? (
              <ActivityIndicator size="small" color="#6d28d9" />
            ) : (
              <Text style={styles.createText}>Create</Text>
            )}
          </TouchableOpacity>
        </View>
      </Dialog.Content>
    </Dialog>
  );
};

const styles = StyleSheet.create({
  groupHeader: {
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    width: '90%',
    alignSelf: 'center',
  },
  avatarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 50,
    width: 40,
    height: 40,
  },
  avatar: {
    backgroundColor: '#362d28',
    alignSelf: 'center',
  },
  input: {
    backgroundColor: '#f4f7f9',
    borderWidth: 1,
    padding: 10,
    borderColor: '#362d28',
    paddingLeft: 15,
    borderRadius: 100,
    fontSize: 15,
    width: '80%',
    alignSelf: 'center',
    marginLeft: 8,
  },
  membersList: {
    borderRadius: 5,
    height: '69%',
    paddingHorizontal: 20,
  },
  icons: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    height: 50,
    borderRadius: 3,
    alignSelf: 'center',
  },
  iconbtn: {
    width: '30%',
    height: 35,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  iconbtnSec: {
    flexDirection: 'row',
    width: '30%',
    height: 35,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: {
    color: '#777',
    fontWeight: 'bold',
    fontSize: 16,
  },
  createText: {
    color: '#6d28d9',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default NewGroup;
