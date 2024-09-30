import React, { useEffect } from 'react';
import { ScrollView, View, TouchableOpacity, StyleSheet } from 'react-native';
import { Dialog, Button, Text, Avatar, ActivityIndicator } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { setIsNotification } from '../../redux/reducers/misc';
import { useGetNotificationsQuery, useAcceptFriendRequestMutation } from '../../redux/api/api';
import { useAsyncMutation, useErrors } from '../../hooks/hooks'; 
import Icon from "react-native-vector-icons/Ionicons";
import { decrementNotification } from '../../redux/reducers/chat';
import { transformImage } from '../../lib/features';
import { useTheme } from '../../lib/themeContext';


const Notification = () => {
  const dispatch = useDispatch();
  const { isNotification } = useSelector((state) => state.misc);
  const { isLoading, data, error, isError, refetch } = useGetNotificationsQuery();
  const [acceptRequest] = useAsyncMutation(useAcceptFriendRequestMutation);
  const {theme} = useTheme()


  const closeHandler = () => {
    dispatch(setIsNotification(false));
  };

  const friendRequestHandler = async ({ _id, accept }) => {
    dispatch(setIsNotification(false));
    dispatch(decrementNotification());
    await acceptRequest("Accepting...", { requestId: _id, accept: accept });
  };

  useEffect(() => {
    if (isNotification) {
      refetch();
    }
  }, [isNotification, refetch]);

  useErrors([{ error, isError }]);

  return (
    <Dialog visible={isNotification} onDismiss={closeHandler} style={{backgroundColor: theme.detailcont}}>
      <Dialog.Title style={[styles.title, {color:theme.text}]}>Notifications</Dialog.Title>
      <Dialog.Content>
        {isLoading ? (
          <ActivityIndicator size="small" color={theme.icon} />
        ) : (
          <ScrollView style={styles.scrollArea}>
            {data?.allRequests.length > 0 ? (
              data?.allRequests.map((request) => (
                <NotificationItem
                  key={request._id}
                  sender={request.sender}
                  _id={request._id}
                  handler={friendRequestHandler}
                />
              ))
            ) : (
              <Text style={{color: theme.text}}>No Notifications</Text>
            )}
          </ScrollView>
        )}
      </Dialog.Content>
    </Dialog>
  );
};

const NotificationItem = ({ sender, _id, handler }) => {
  const { name, avatar } = sender;
  const {theme} = useTheme()


  return (
    <View style={styles.notificationItem}>
      <View style={styles.notificationContent}>
        <Avatar.Image source={{ uri: transformImage(avatar, 50) }} size={35} />
        <Text style={[styles.notificationText, {color:theme.text}]}>{`${name} sent you a friend request`}</Text>
      </View>
      <View style={styles.buttonGroup}>
        <TouchableOpacity onPress={() => handler({ _id, accept: true })} style={styles.acceptButton}>
          <Icon name="checkmark" color="#fff" size={20}/>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handler({ _id, accept: false })} style={styles.rejectButton}>
          <Icon name="close-outline" color="red" size={20}/>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollArea: {
    maxHeight: 400,
  },
  notificationItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
    width: "75%",
  },
  notificationContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  notificationText: {
    marginLeft: 10,
    flex: 1,
    flexWrap: "wrap",
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  acceptButton: {
    backgroundColor: "#6d28d9",
    paddingHorizontal: 5,
    paddingVertical: 5,
    borderRadius: 50,
  },
  rejectButton: {
    paddingHorizontal: 5,
    paddingVertical: 5,
    borderRadius: 50,
  },
});

export default Notification;
