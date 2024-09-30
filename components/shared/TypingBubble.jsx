import React, { useEffect, useRef } from "react";
import { View, Text, Animated, Easing, StyleSheet, Platform } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';


const TypingBubble = ({ user, group }) => {
  const bounceValue1 = useRef(new Animated.Value(0)).current;
  const bounceValue2 = useRef(new Animated.Value(0)).current;
  const bounceValue3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startBouncing = (bounceValue, duration) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceValue, {
            toValue: 1,
            duration: duration,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(bounceValue, {
            toValue: 0,
            duration: duration,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    startBouncing(bounceValue1, 500);
    startBouncing(bounceValue2, 700);
    startBouncing(bounceValue3, 1000);
  }, []);

  const bounce = (value) => {
    return value.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -5], 
    });
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.dot,
          { transform: [{ translateY: bounce(bounceValue1) }] },
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          { transform: [{ translateY: bounce(bounceValue2) }] },
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          { transform: [{ translateY: bounce(bounceValue3) }] },
        ]}
      />
      {group ? (
        <View style={styles.groupTextContainer}>
            <Icon name="at" size={5}/>
          <Text style={styles.text}>@</Text>
          <Text style={styles.text}>{user?.username}</Text>
        </View>
      ) : (
        <Text style={styles.text}>{user?.name}</Text>
      )}
      <Text style={styles.text}> is typing</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    bottom: Platform.OS === 'ios' ? 85 : 72,
    left: 15,
  },
  dot: {
    height: 5,
    width: 5,
    backgroundColor: "#737373", 
    borderRadius: 50,
    marginHorizontal: 2,
  },
  text: {
    color: "#737373", 
    fontSize: 12,
  },
  groupTextContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default TypingBubble;
