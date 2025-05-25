import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Card, Text, Provider, Dialog, Portal } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getTodayDate = () => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = today.getFullYear();
  return `${day}-${month}-${year}`;
};

const STORAGE_KEY = 'cash_outflows';

const CashOutflowForm = () => {
  const [expenses, setExpenses] = useState([
    { id: Date.now(), person: '', purpose: '', date: getTodayDate(), amount: '' },
  ]);
  const [submittedExpenses, setSubmittedExpenses] = useState([]);
  const [visibleDialog, setVisibleDialog] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  useEffect(() => {
    fetchSubmittedExpenses();
  }, []);

  const fetchSubmittedExpenses = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed = data ? JSON.parse(data) : [];
      setSubmittedExpenses(parsed);
    } catch (error) {
      console.error('Error reading local storage:', error);
      Alert.alert('Error', 'Failed to load saved expenses.');
    }
  };

  const saveExpensesToStorage = async (data) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to local storage:', error);
      Alert.alert('Error', 'Failed to save expenses.');
    }
  };

  const handleInputChange = (index, field, value) => {
    const updatedExpenses = [...expenses];
    updatedExpenses[index][field] = value;
    setExpenses(updatedExpenses);
  };

  const isSubmitDisabled = expenses.length === 0 || expenses.every((item) => item.amount.trim() === '');

  const handleSubmit = async () => {
    try {
      const newExpenses = expenses.map((expense) => ({
        ...expense,
        amount: parseFloat(expense.amount),
      }));
      const updated = [...submittedExpenses, ...newExpenses];
      setSubmittedExpenses(updated);
      await saveExpensesToStorage(updated);

      setExpenses([{ id: Date.now(), person: '', purpose: '', date: getTodayDate(), amount: '' }]);
      Alert.alert('Success', 'Expenses saved!');
    } catch (error) {
      console.error('Error saving expenses:', error);
      Alert.alert('Error', 'Failed to save expenses.');
    }
  };

  const handleDelete = async (id) => {
    if (!id) return;
    try {
      const updatedExpenses = submittedExpenses.filter((exp) => exp.id !== id);
      setSubmittedExpenses(updatedExpenses);
      await saveExpensesToStorage(updatedExpenses);
      Alert.alert('Deleted', 'Expense removed.');
    } catch (error) {
      console.error('Error deleting expense:', error);
      Alert.alert('Error', 'Failed to delete.');
    }
  };

  const showDeleteDialog = (id) => {
    setExpenseToDelete(id);
    setVisibleDialog(true);
  };

  const hideDeleteDialog = () => {
    setVisibleDialog(false);
    setExpenseToDelete(null);
  };

  const isAmountDisabled = !expenses[0].person.trim() || !expenses[0].purpose.trim();

  return (
    <Provider>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Cash Outflow Entry</Text>

        {expenses.map((expense, index) => (
          <View key={expense.id} style={styles.formCard}>
            <TextInput
              label="Person"
              value={expense.person}
              onChangeText={(text) => handleInputChange(index, 'person', text)}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Purpose"
              value={expense.purpose}
              onChangeText={(text) => handleInputChange(index, 'purpose', text)}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Date (dd-mm-yyyy)"
              value={expense.date}
              onChangeText={(text) => handleInputChange(index, 'date', text)}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Amount"
              value={expense.amount}
              onChangeText={(text) => handleInputChange(index, 'amount', text)}
              keyboardType="numeric"
              mode="outlined"
              disabled={isAmountDisabled}
              style={styles.input}
            />
          </View>
        ))}

        <Button
          mode="contained"
          onPress={handleSubmit}
          disabled={isSubmitDisabled}
          style={styles.submitButton}
        >
          Submit Expenses
        </Button>

        <Text style={styles.heading}>Submitted Expenses</Text>

        {submittedExpenses.map((item, index) => (
          <Card key={item.id} style={styles.card}>
            <Card.Title title={`Expense #${index + 1}`} />
            <Card.Content>
              <View style={styles.detailRow}>
                <Text style={styles.label}>Person</Text>
                <Text style={styles.separator}>:</Text>
                <Text style={styles.detail}>{item.person}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.label}>Purpose</Text>
                <Text style={styles.separator}>:</Text>
                <Text style={styles.detail}>{item.purpose}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.label}>Date</Text>
                <Text style={styles.separator}>:</Text>
                <Text style={styles.detail}>{item.date}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.label}>Amount</Text>
                <Text style={styles.separator}>:</Text>
                <Text style={styles.detail}>₹{item.amount}</Text>
              </View>
            </Card.Content>
            <Button
              mode="outlined"
              onPress={() => showDeleteDialog(item.id)}
              style={styles.deleteButton}
            >
              <Text> Delete Expense </Text>
            </Button>
          </Card>
        ))}

        <Portal>
          <Dialog visible={visibleDialog} onDismiss={hideDeleteDialog}>
            <Dialog.Title>Confirm Deletion</Dialog.Title>
            <Dialog.Content>
              <Text>Are you sure you want to delete this expense?</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={hideDeleteDialog}>Cancel</Button>
              <Button
                onPress={() => {
                  handleDelete(expenseToDelete);
                  hideDeleteDialog();
                }}
              >
                <Text> Yes </Text>
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </ScrollView>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 15,
  },
  input: {
    marginVertical: 10,
  },
  submitButton: {
    marginVertical: 15,
  },
  card: {
    marginVertical: 10,
    borderRadius: 10,
    elevation: 3,
  },
  formCard: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  detailRow: {
    flexDirection: 'row',
    marginVertical: 8,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  label: {
    fontSize: 16,
    width: '40%',
    textAlign: 'left',
  },
  separator: {
    fontSize: 16,
    width: '10%',
    textAlign: 'center',
  },
  detail: {
    fontWeight: 'bold',
    fontSize: 16,
    flex: 1,
    textAlign: 'left',
  },
  deleteButton: {
    margin: 10,
    width: 230,
    alignSelf: 'center',
  },
});

export default CashOutflowForm;
