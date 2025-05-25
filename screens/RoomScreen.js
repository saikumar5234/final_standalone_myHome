import React from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions } from 'react-native';
import { Button } from 'react-native-paper';  // Import Button from react-native-paper

const { width } = Dimensions.get('window');

const RoomScreen = ({ navigation }) => {
  // Create an array with room numbers from 101 to 105, 201 to 205, 301 to 305, and 401 to 405
  const rooms = [
    ...Array.from({ length: 6 }, (_, i) => 101 + i),  // Rooms 101-106
    ...Array.from({ length: 6 }, (_, i) => 201 + i),  // Rooms 201-206
    ...Array.from({ length: 6 }, (_, i) => 301 + i),  // Rooms 301-306
    ...Array.from({ length: 6 }, (_, i) => 401 + i),  // Rooms 401-406
    ...Array.from({ length: 6 }, (_, i) => 501 + i),  // Rooms 501-406
    ...Array.from({ length: 2 }, (_, i) => 601 + i),  // Rooms 601-602
  ];

  const handleRoomPress = (roomNumber) => {
    navigation.navigate('CustomerForm', { roomNumber });
  };

  const renderRoomButton = ({ item }) => (
    <Button
      mode="outlined"  // Use the 'contained' style for a filled button
      onPress={() => handleRoomPress(item)}
      
      style={styles.button}
      labelStyle={styles.buttonText}
      contentStyle={styles.buttonContent}  // Adjust content style for better spacing
    >
      Flat {item}
    </Button>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={rooms}
        renderItem={renderRoomButton}
        keyExtractor={(item) => item.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={{ alignItems: 'center', marginTop: 20 }}
      />
    </View>
  );
};

export default RoomScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    backgroundColor:'#F5F5F5',

    padding: 16,  // Add some padding around the edges for better spacing
    marginBottom: 40,
  },
  row: {
    justifyContent: 'space-around',
    width: width * 0.9,
    marginBottom: 20,
  },
  button: {
    width: width * 0.4,  // Adjust the width of buttons
    marginBottom: 15,  // Add spacing between buttons
    borderRadius: 10,  // Rounded corners for the button
  },
  buttonText: {
    fontSize: 20,  // Slightly smaller text for better readability
    fontWeight: 'bold',
  },
  buttonContent: {
    backgroundColor: '#fff',
    paddingVertical: 24,  // Adjust vertical padding for a better balance
  },
});
