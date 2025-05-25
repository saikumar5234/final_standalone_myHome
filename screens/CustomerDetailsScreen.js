import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { Text } from 'react-native-paper';

const CustomerDetailsScreen = ({ route }) => {
  const { customerData, roomNumber } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Room {roomNumber} - Customer Details</Text>

      <View style={styles.detailsContainer}>
        <Text style={styles.detailItem}>Name: {customerData.name}</Text>
        <Text style={styles.detailItem}>Payment Status: {customerData.paymentStatus}</Text>
        <Text style={styles.detailItem}>Payment Mode: {customerData.paymentMode}</Text>
        <Text style={styles.detailItem}>Advance Money: {customerData.advanceMoney}</Text>
      </View>
    </View>
  );
};

export default CustomerDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
    color: '#000',
  },
  detailsContainer: {
    width: '100%',
    padding: 20,
    borderColor: '#000',
    borderWidth: 2,
    borderRadius: 10,
  },
  detailItem: {
    fontSize: 18,
    color: '#000',
    marginVertical: 8,
  },
});
