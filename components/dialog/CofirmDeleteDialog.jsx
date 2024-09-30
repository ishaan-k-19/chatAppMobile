import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Dialog, Button, Paragraph } from 'react-native-paper';
import Toast from 'react-native-toast-message'; 
import { useTheme } from '../../lib/themeContext';

const ConfirmDeleteDialog = ({ open, handleClose, deleteHandler }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const {theme} = useTheme()

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteHandler(); 
      Toast.show({
bottomOffset: 100,
        type: 'success',
        text1: 'Success',
        text2: 'Group deleted successfully.',
        position: 'bottom',
      });
      handleClose();
    } catch (error) {
      Toast.show({
bottomOffset: 100,
        type: 'error',
        text1: 'Error',
        text2: error?.message || 'Failed to delete group.',
        position: 'bottom',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog visible={open} onDismiss={handleClose} style={{backgroundColor: theme.detailcont}}>
      <Dialog.Title style={{ textAlign: 'center', fontSize: 24, paddingTop: 20 , color: theme.text}}>
        Confirm Delete
      </Dialog.Title>
      <Dialog.Content>
        <View style={{ alignItems: 'center' }}>
          <Paragraph style={{ textAlign: 'center', color: theme.text }}>
            Are you sure you want to delete this group?
          </Paragraph>
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16, paddingTop: 20 }}>
            <Button
              mode="outlined"
              onPress={handleClose}
              style={{ borderColor: '#ccc' }}
              disabled={isDeleting}
              textColor={theme.text}
            >
              No
            </Button>
            <Button
              mode="contained"
              onPress={handleDelete}
              buttonColor="red"
              loading={isDeleting} 
              disabled={isDeleting} 
            >
              {isDeleting ? 'Deleting...' : 'Yes'}
            </Button>
          </View>
        </View>
      </Dialog.Content>
    </Dialog>
  );
};

export default ConfirmDeleteDialog;
