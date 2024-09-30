import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,  
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {
  useChatDetailsQuery,
  useDeleteChatMutation,
  useMyGroupsQuery,
  useRemoveGroupMemberMutation,
} from '../redux/api/api';
import {useAsyncMutation} from '../hooks/hooks';
import {setIsAddMember} from '../redux/reducers/misc';
import {Avatar} from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import UserItem from '../components/shared/UserItem';
import AddMemberDialog from '../components/dialog/AddMemberDialog';
import ConfirmDeleteDialog from '../components/dialog/CofirmDeleteDialog';
import axios from 'axios';
import {server} from '../constants/config';
import Toast from 'react-native-toast-message';  
import { transformImage } from '../lib/features';
import { useTheme } from '../lib/themeContext';
import  mime  from "mime";


const GroupManagement = ({navigation, route}) => {
  const dispatch = useDispatch();
  const [chatId, setChatId] = useState( route?.params?.chatId);

  const groupDetails = useChatDetailsQuery(
    {chatId, populate: true},
    {skip: !chatId},
  );

  const [removeMember, isLoadingRemoveMember] = useAsyncMutation(
    useRemoveGroupMemberMutation,
  );

  const [deleteGroup, isLoadingDeleteGroup] = useAsyncMutation(
    useDeleteChatMutation,
  );

  const [isEdit, setIsEdit] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupNameUpdatedValue, setGroupNameUpdatedValue] = useState('');
  const [confirmDeleteHandler, setConfirmDeleteHandler] = useState(false);
  const [members, setMembers] = useState([]);
  const [avatar, setAvatar] = useState('');
  const [loading, setLoading] = useState(false);
  const {theme} = useTheme()

  const groupData = groupDetails.data;
  useEffect(() => {
    if (groupData) {
      setGroupName(groupData.chat.name);
      setGroupNameUpdatedValue(groupData.chat.name);
      setMembers(groupData.chat.members);
    }

    return () => {
      setGroupName('');
      setGroupNameUpdatedValue('');
      setMembers([]);
      setIsEdit(false);
    };
  }, [groupDetails.data]);

  const openConfirmDeleteHandler = () => {
    setConfirmDeleteHandler(true);
  };

  const closeConfirmDeleteHandler = () => {
    setConfirmDeleteHandler(false);
  };

  const openAddMemberHandler = () => {
    dispatch(setIsAddMember(true));
  };

  const deleteHandler = () => {
    setLoading(true); 
    deleteGroup('Deleting Group...', chatId).then(() => {
      setLoading(false);  
      closeConfirmDeleteHandler();
      navigation.navigate('groups');
    });
  };

  const removeMemberHandler = userId => {
    setLoading(true); 
    removeMember('Removing Member...', {chatId, userId}).finally(() => {
      setLoading(false); 
    });
  };

  const handleChange = (field, value) => {
    if (field === 'name') {
      setGroupNameUpdatedValue(value);
    }
  };

  const handleImage = () => {
    navigation.navigate('camera', {
      screen: 'groupmanagement',
      chatId: chatId,
    });
  };

  const myGroups = useMyGroupsQuery("");

  const updateGroupName = async () => {
    if (!groupNameUpdatedValue.trim()) {  
      Toast.show({
        bottomOffset: 100,
        type: 'error',
        text1: 'Validation Error',
        text2: 'Group name is required',
      });
      return;
    }
  
    const formData = new FormData();
    
    if (avatar) {
        formData.append('avatar', {
          uri: avatar,
          name: 'profile.jpg',
          type: 'image/jpeg',
        });
    } 
    formData.append('name', groupNameUpdatedValue);
  
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
  
    setLoading(true);  
    try {
      const response = await axios.put(`${server}/api/v1/chat/${chatId}`, formData, config);
      
      Toast.show({
        bottomOffset: 50,
        type: 'success',
        text1: 'Success',
        text2: response.data.message,
        position: 'bottom',
      });
  
      setIsEdit(false);
      myGroups.refetch();
      groupDetails.refetch();
    } catch (error) {
      console.log(error?.response?.data?.message)
      Toast.show({
        bottomOffset: 50,
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Something went wrong',
        position: 'bottom',
      });
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    if (route.params) {
      if (route.params.image) {
        setAvatar(route.params.image);
      }
      if (route.params.id) {
        setChatId(route.params.id);
      }
    }
  }, [route]);

  return (
    <View style={[styles.container, {backgroundColor: theme.background}]}>
      <SafeAreaView style={{flex: 1}}>
        <View style={styles.appBar}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
            }}>
            <TouchableOpacity onPress={() => navigation.navigate('groups')}>
              <Icon name="chevron-back-outline" size={30} color={theme.icon} />
            </TouchableOpacity>
            <Text style={[styles.titleText, {color: theme.text}]}>Manage Group</Text>
          </View>
          {isEdit ? (
            <TouchableOpacity 
            onPress={updateGroupName} 
            disabled={loading}
            >
              {loading ? ( 
                <ActivityIndicator size="small" color={theme.icon} />
              ) : (
                <Icon name="checkmark" size={30} color={theme.icon} />
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setIsEdit(true)}>
              <Icon name="create-outline" size={30} color={theme.icon} />
            </TouchableOpacity>
          )}
        </View>
        {isEdit ? (
          <View style={styles.grpInfo}>
            <TouchableOpacity
              style={styles.avatarContainer}
              onPress={handleImage}>
                <View style={{position: 'relative'}}>
              <Avatar.Image
                size={80}
                style={styles.avatarStyle}
                source={{uri: avatar ? transformImage(avatar, 80) : transformImage(groupData?.chat?.avatar?.url,80)}}
                />
              <View style={{
                position: 'absolute',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                padding: 24,
                borderRadius: 100,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Icon
                name="camera"
                size={30}
                color="#d4d4d4"
                />
                </View>
                </View>
            </TouchableOpacity>
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Group Name"
                style={[styles.input, {fontWeight: 500, color: theme.text}]}
                value={groupNameUpdatedValue}
                onChangeText={text => handleChange('name', text)}
              />
            </View>
          </View>
        ) : (
          <View style={styles.grpInfo}>
            <TouchableOpacity style={styles.avatarContainer}>
              <Avatar.Image
                size={80}
                style={styles.avatarStyle}
                source={{uri: transformImage(groupData?.chat?.avatar?.url, 80)}}
              />
            </TouchableOpacity>
            <Text style={[styles.grpName, {color: theme.text}]}>{groupName}</Text>
          </View>
        )}
        <View style={styles.memberContainer}>
          <Text
            style={{
              fontWeight: 'bold',
              paddingVertical: 5,
              paddingHorizontal: 30,
              fontSize: 26,
              textAlign: 'center',
              color: theme.text,
            }}>
            Members
          </Text>
          <ScrollView
            style={{
              paddingVertical: 10,
              marginBottom: 10,
              borderRadius: 5,
            }}
            contentContainerStyle={{paddingBottom: 20}}>
            <View>
              {members.map(member => (
                <UserItem
                  key={member._id}
                  user={member}
                  isAdded
                  handler={removeMemberHandler}
                  usern={true}
                  styling={{
                    width: '90%',
                    alignSelf: 'center',
                    paddingHorizontal: 15,
                    borderRadius: 15,
                    marginBottom: 2,
                  }}
                />
              ))}
            </View>
          </ScrollView>
        </View>
        <View style={styles.icons}>
          <TouchableOpacity
            style={styles.iconbtnSec}
            onPress={openConfirmDeleteHandler}
            disabled={loading}
            >
            {loading ? (  
              <ActivityIndicator size="small" color="red" />
            ) : (
              <>
                <Icon name="trash" size={24} color="red" />
                <Text style={{color: 'red', fontWeight: 'bold', fontSize: 16}}>
                  Delete
                </Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconbtn}
            onPress={openAddMemberHandler}>
            <Icon name="person-add" size={24} color="#fff" />
            <Text
              style={{
                color: '#fff',
                fontWeight: 'bold',
                fontSize: 16,
              }}>
              Add
            </Text>
          </TouchableOpacity>
        </View>
        <AddMemberDialog chatId={chatId} />
        <ConfirmDeleteDialog
          open={confirmDeleteHandler}
          handleClose={closeConfirmDeleteHandler}
          deleteHandler={deleteHandler}
        />
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
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    height: 70,
    borderRadius: 3,
  },
  grpInfo: {
    alignItems: 'center',
    gap: 20,
    flexDirection: 'row',
    paddingHorizontal: 30,
    marginBottom: 20,
  },
  grpName: {
    fontSize: 28,
    fontWeight: '500',
  },
  titleText: {
    color: '#6d28d9',
    fontSize: 30,
    fontWeight: 'bold',
  },
  avatarContainer: {
    borderRadius: 50,
    width: 80,
    height: 80,
    alignSelf: 'center',
  },
  iconContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  scrollView: {
    flex: 1,
  },
  icons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  iconbtn: {
    backgroundColor: '#6d28d9',
    width: '40%',
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  iconbtnSec: {
    flexDirection: 'row',
    width: '40%',
    borderColor: 'red',
    borderStyle: 'solid',
    borderWidth: 2,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  memberContainer: {
    backgroundColor: 'rgba(112, 128, 144, 0.1)',
    paddingVertical: 10,
    marginHorizontal: 15,
    borderRadius: 10,
    maxHeight: '65%',
  },
  inputContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    width: '60%',
  },
  input: {
    padding: 10,
    fontSize: 22,
    width: '100%',
  },
});

export default GroupManagement;
