import React, { useEffect } from 'react';
import { Button, Dialog, Portal, Paragraph } from 'react-native-paper';
import { setIsDeleteMenu } from '../../redux/reducers/misc';
import { useDispatch, useSelector } from 'react-redux';
import { useDeleteChatMutation, useLeaveGroupMutation } from '../../redux/api/api';
import { useAsyncMutation } from '../../hooks/hooks';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../lib/themeContext';

const DeleteChatMenu = ({ chatId, isGroup }) => {

  const { isDeleteMenu } = useSelector((state) => state.misc);

  const [deleteChat, _, deleteChatData] = useAsyncMutation(useDeleteChatMutation);
  const [leaveGroup, __, leaveGroupData] = useAsyncMutation(useLeaveGroupMutation);

  const {theme} = useTheme()

  const navigation = useNavigation();
  const dispatch = useDispatch();

  const closeHandler = () => {
    dispatch(setIsDeleteMenu(false));
  };

  const leaveGroupHandler = () => {
    closeHandler();
    leaveGroup("Leaving Group...", chatId);
    navigation.navigate('home'); 
  };

  const deleteChatHandler = () => {
    closeHandler();
    deleteChat("Deleting Chat...", chatId);
  };

  useEffect(() => {
    if (deleteChatData || leaveGroupData) {
      navigation.navigate('home'); 
    }
  }, [deleteChatData, leaveGroupData, navigation]);

  return (
      <Dialog visible={isDeleteMenu} onDismiss={closeHandler} style={{backgroundColor: theme.detailcont}}>
        <Dialog.Title style={{color: theme.text}}>Are you absolutely sure?</Dialog.Title>
        <Dialog.Content>
          <Paragraph style={{color: theme.text}}>
            Are you sure you want to {isGroup ? 'leave this group?' : 'delete this chat?'}
          </Paragraph>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={closeHandler} textColor={theme.text}>Cancel</Button>
          <Button onPress={isGroup ? leaveGroupHandler : deleteChatHandler} textColor='red'>
            {isGroup ? 'Leave Group' : 'Delete Chat'}
          </Button>
        </Dialog.Actions>
      </Dialog>
  );
};

export default DeleteChatMenu;
