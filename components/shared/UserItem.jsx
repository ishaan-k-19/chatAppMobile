import React, { memo } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Avatar } from 'react-native-paper'; 
import { transformImage } from '../../lib/features';
import { useTheme } from '../../lib/themeContext';

const UserItem = ({ user, handler, handlerIsLoading, isAdded = false, styling, usern = false }) => {
  const { name, _id, avatar, username } = user;
  const newAvatar = avatar.url ? avatar.url : avatar;

  const {theme} = useTheme()

  return (
    <View style={{ marginVertical: 1 }}>
      <View
        style={[
          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor:theme.background },
          styling, 
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Avatar.Image
            size={50}
            source={{ uri: transformImage(newAvatar, 50) }}
            style={{
                elevation: 2,
                shadowOpacity: 0.1,
                shadowRadius: 7,
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                marginVertical: 8,
            }}
          />
          <View style={{ flexShrink: 1 }}>
            <Text
              numberOfLines={1}
              style={{
                fontSize: 18,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                color: theme.text
              }}
            >
              {name}
            </Text>
            {usern && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 1, marginTop: -5 }}>
                <Icon name="at-outline" size={14} color="#888" />
                <Text style={{ color: '#888', fontSize: 14 }}>{username}</Text>
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity
          onPress={() => handler(_id)}
          disabled={handlerIsLoading}
          style={{
            backgroundColor: isAdded? 'red' : '#6d28d9',
            paddingHorizontal: 2,
            paddingVertical: 2,
            borderRadius: 50,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {handlerIsLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : isAdded ? (
            <Icon name="remove" size={30} color="#fff" />
          ) : (
            <Icon name="add" size={30} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default memo(UserItem);
