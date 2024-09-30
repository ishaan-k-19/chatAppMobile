import {useState} from 'react';
import * as React from 'react';
import {ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native';
import {ActivityIndicator, Button, Dialog, Portal, Text} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import {setIsAddMember} from '../../redux/reducers/misc';
import {
  useAddGroupMembersMutation,
  useAvailableFriendsQuery,
} from '../../redux/api/api';
import {useAsyncMutation, useErrors} from '../../hooks/hooks';
import UserItem from '../shared/UserItem';
import Toast from 'react-native-toast-message'; // Import Toast
import { useTheme } from '../../lib/themeContext';

const AddMemberDialog = ({chatId}) => {
  const {isAddMember} = useSelector(state => state.misc);
  const dispatch = useDispatch();

  const {theme} = useTheme()

  const {
    isLoading: isLoadingFriends,
    data,
    isError: isErrorFriends,
    error: errorFriends,
  } = useAvailableFriendsQuery(chatId);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [addMember, {isLoading: isLoadingAddMember}] = useAsyncMutation(
    useAddGroupMembersMutation,
  );

  const selectMemberHandler = id => {
    setSelectedMembers(prev =>
      prev.includes(id)
        ? prev.filter(currentElement => currentElement !== id)
        : [...prev, id],
    );
  };

  const addMemberSubmitHandler = async () => {
    if (selectedMembers.length === 0) {
      Toast.show({
        bottomOffset: 100,
        type: 'error',
        text1: 'Validation Error',
        text2: 'At least one member must be selected.',
        position: 'bottom',
      });
      return;
    }

    try {
      await addMember('Adding Members...', {members: selectedMembers, chatId});
      Toast.show({
        bottomOffset: 100,
        type: 'success',
        text1: 'Success',
        text2: 'Members added successfully.',
        position: 'bottom',
      });
      closeHandler();
    } catch (error) {
      Toast.show({
        bottomOffset: 100,
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Something went wrong.',
        position: 'bottom',
      });
    }
  };

  const closeHandler = () => {
    dispatch(setIsAddMember(false));
    setSelectedMembers([]);
  };

  useErrors([{isError: isErrorFriends, error: errorFriends}]);

  return (
    <Dialog
      visible={isAddMember}
      onDismiss={closeHandler}
      style={{backgroundColor: theme.detailcont, height: '70%'}}>
      <Dialog.Title style={{color: theme.text}}>Add Member</Dialog.Title>
      <Dialog.Content>
        {isLoadingFriends ? (
                    <ActivityIndicator size="large" color="#6d28d9" />

        ) : (
          <ScrollView
            style={{borderRadius: 5, height: '78%', paddingHorizontal: 20}}>
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
            <Text style={{color: '#777', fontWeight: 'bold', fontSize: 16}}>
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconbtn, {opacity: isLoadingAddMember ? 0.5 : 1}]} // Disable button when loading
            onPress={addMemberSubmitHandler}
            disabled={isLoadingAddMember} // Disable button when loading
          >
            {isLoadingAddMember ? (
                        <ActivityIndicator size="large" color="#6d28d9" />

            ) : (
              <Text
                style={{color: '#6d28d9', fontWeight: 'bold', fontSize: 16}}>
                Add
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </Dialog.Content>
    </Dialog>
  );
};

const styles = StyleSheet.create({
  icons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 5,
    marginTop: 10,
  },
  iconbtn: {
    width: '30%',
    height: 35,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  iconbtnSec: {
    flexDirection: 'row',
    width: '30%',
    height: 35,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
});

export default AddMemberDialog;
