import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import {
  Title,
  Text,
  Button,
  DataTable,
  Menu,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const months = [
  'January', 'February', 'March', 'April',
  'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December'
];

// Helper functions
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const [dd, mm, yyyy] = dateStr.split('-');
  return `${dd}-${mm}-${yyyy}`;
};

const getMonthNumber = (monthName) => {
  return months.indexOf(monthName) + 1;
};

const ReportScreen = () => {
  const [inflows, setInflows] = useState([]);
  const [outflows, setOutflows] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalOutcome, setTotalOutcome] = useState(0);
  const [remainingBalance, setRemainingBalance] = useState(0);

  // Initially selected month is null (no selection)
  const [selectedMonth, setSelectedMonth] = useState(null);

  const [menuVisible, setMenuVisible] = useState(false);

  const fetchData = async () => {
    if (!selectedMonth) {
      Alert.alert('Select Month', 'Please select a month before fetching the report.');
      return;
    }
    try {
      const monthNumber = getMonthNumber(selectedMonth);
      const monthStr = monthNumber < 10 ? `0${monthNumber}` : monthNumber.toString();
      const currentYear = new Date().getFullYear().toString();

      const inflowString = await AsyncStorage.getItem('customersData');
      const outflowString = await AsyncStorage.getItem('cash_outflows');

      const inflowDataRaw = inflowString ? JSON.parse(inflowString) : [];
      const outflowDataRaw = outflowString ? JSON.parse(outflowString) : [];

      // Filter data by selected month and current year (date format dd-MM-yyyy)
      const filteredInflows = inflowDataRaw.filter(entry => {
        if (!entry.date) return false;
        const [day, month, year] = entry.date.split('-');
        return (month === monthStr && year === currentYear);
      });

      const filteredOutflows = outflowDataRaw.filter(entry => {
        if (!entry.date) return false;
        const [day, month, year] = entry.date.split('-');
        return (month === monthStr && year === currentYear);
      });

      // Map inflow data with calculated totalRent and rentPaid numbers
      const inflowData = filteredInflows.map(entry => ({
        ...entry,
        totalRent:
          (Number(entry.rentMonth) || 0) +
          (Number(entry.parkingBill) || 0) +
          (Number(entry.electricityBill) || 0) +
          (Number(entry.maintenance) || 0),
        rentPaid: Number(entry.rentPaid) || 0,
      }));

      // Calculate totals
      const totalIncomeValue = inflowData.reduce((sum, entry) => sum + entry.rentPaid, 0);
      const totalOutcomeValue = filteredOutflows.reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0);

      setInflows(inflowData);
      setOutflows(filteredOutflows);
      setTotalIncome(totalIncomeValue);
      setTotalOutcome(totalOutcomeValue);
      setRemainingBalance(totalIncomeValue - totalOutcomeValue);

    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to fetch report data.');
    }
  };

  const generateHTML = () => {
    const inflowRows = inflows.map(i =>
      `<tr>
        <td>${i.roomNumber}</td>
        <td>${i.name}</td>
        <td>${formatDate(i.date)}</td>
        <td>₹${i.totalRent}</td>
        <td>₹${i.rentPaid}</td>
        <td>₹${i.totalRent - i.rentPaid}</td>
      </tr>`
    ).join('');

    const outflowRows = outflows.map(o =>
      `<tr>
        <td>${o.person}</td>
        <td>${o.purpose}</td>
        <td>${formatDate(o.date)}</td>
        <td>₹${o.amount}</td>
      </tr>`
    ).join('');

    return `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1, h2, h3 { text-align: center; }
            .branding { background-color: #4B0082; color: white; padding: 10px 0; text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
            p { font-size: 16px; font-weight: bold; }
            .report-period { text-align: center; font-size: 18px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="branding">Ramesh Sankhla & Others</div>
          <h1>Financial Report</h1>
          <div class="report-period">For ${selectedMonth} ${new Date().getFullYear()}</div>

          <h2>Cash Inflow</h2>
          <table>
            <tr>
              <th>Flat No</th><th>Person</th><th>Date</th>
              <th>Total Rent</th><th>Rent Paid</th><th>Remaining</th>
            </tr>
            ${inflowRows}
          </table>
          <p>Total Income: ₹${totalIncome}</p>

          <h2>Cash Outflow</h2>
          <table>
            <tr><th>Person</th><th>Purpose</th><th>Date</th><th>Amount</th></tr>
            ${outflowRows}
          </table>
          <p>Total Outcome: ₹${totalOutcome}</p>

          <h3>Remaining Balance: ₹${remainingBalance}</h3>
        </body>
      </html>
    `;
  };

  const handleExport = async () => {
    try {
      const htmlContent = generateHTML();
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error('PDF export error:', error);
      Alert.alert('Error', 'Failed to generate or share PDF');
    }
  };

  const handlePrint = async () => {
    try {
      const html = generateHTML();
      await Print.printAsync({ html });
    } catch (error) {
      console.error('Print error:', error);
      Alert.alert('Error', 'Failed to print');
    }
  };

  const handleClearReports = async () => {
    Alert.alert(
      'Confirm',
      'Are you sure you want to delete all reports?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('customersData');
              await AsyncStorage.removeItem('cash_outflows');
              setInflows([]);
              setOutflows([]);
              setTotalIncome(0);
              setTotalOutcome(0);
              setRemainingBalance(0);
              setSelectedMonth(null); // Reset month selection too
              Alert.alert('Success', 'All reports cleared successfully.');
            } catch (error) {
              console.error('Clear reports error:', error);
              Alert.alert('Error', 'Failed to clear reports.');
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Title style={styles.title}>Financial Report</Title>

      <View style={styles.filterContainer}>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Button
              onPress={() => setMenuVisible(true)}
              style={styles.monthButton}
              mode="outlined"
            >
              {selectedMonth || 'Please select month'}
            </Button>
          }
        >
          {months.map((month) => (
            <Menu.Item
              key={month}
              onPress={() => {
                setSelectedMonth(month);
                setMenuVisible(false);
              }}
              title={month}
            />
          ))}
        </Menu>

        <Button
          mode="contained"
          onPress={fetchData}
          style={styles.fetchButton}
        >
          Fetch Report
        </Button>
      </View>

      <Text style={styles.sectionTitle}>Cash Inflow</Text>
      <DataTable>
        <DataTable.Header>
          <DataTable.Title>Flat No</DataTable.Title>
          <DataTable.Title>Person</DataTable.Title>
          <DataTable.Title>Date</DataTable.Title>
          <DataTable.Title numeric>Total Rent</DataTable.Title>
          <DataTable.Title numeric>Rent Paid</DataTable.Title>
          <DataTable.Title numeric>Remaining</DataTable.Title>
        </DataTable.Header>
        {inflows.map((item, index) => (
          <DataTable.Row key={index}>
            <DataTable.Cell>{item.roomNumber}</DataTable.Cell>
            <DataTable.Cell>{item.name}</DataTable.Cell>
            <DataTable.Cell>{formatDate(item.date)}</DataTable.Cell>
            <DataTable.Cell numeric>₹{item.totalRent}</DataTable.Cell>
            <DataTable.Cell numeric>₹{item.rentPaid}</DataTable.Cell>
            <DataTable.Cell numeric>₹{item.totalRent - item.rentPaid}</DataTable.Cell>
          </DataTable.Row>
        ))}
      </DataTable>

      <Text style={styles.totalText}>Total Income: ₹{totalIncome}</Text>

      <Text style={styles.sectionTitle}>Cash Outflow</Text>
      <DataTable>
        <DataTable.Header>
          <DataTable.Title>Person</DataTable.Title>
          <DataTable.Title>Purpose</DataTable.Title>
          <DataTable.Title>Date</DataTable.Title>
          <DataTable.Title numeric>Amount</DataTable.Title>
        </DataTable.Header>
        {outflows.map((item, index) => (
          <DataTable.Row key={index}>
            <DataTable.Cell>{item.person}</DataTable.Cell>
            <DataTable.Cell>{item.purpose}</DataTable.Cell>
            <DataTable.Cell>{formatDate(item.date)}</DataTable.Cell>
            <DataTable.Cell numeric>₹{item.amount}</DataTable.Cell>
          </DataTable.Row>
        ))}
      </DataTable>

      <Text style={styles.totalText}>Total Outcome: ₹{totalOutcome}</Text>

      <Text style={styles.remainingText}>Remaining Balance: ₹{remainingBalance}</Text>

      <View style={styles.buttonRow}>
        <Button mode="contained" onPress={handleExport} style={styles.actionButton}>
          Export as PDF
        </Button>
        <Button mode="outlined" onPress={handlePrint} style={styles.actionButton}>
          Print
        </Button>
        <Button
          mode="contained"
          onPress={handleClearReports}
          style={{ marginBottom: 50 }}
          buttonColor="red"
          disabled={inflows.length === 0 && outflows.length === 0}
        >
          Clear All Reports
        </Button>
      </View>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: '#fff',
  },
  title: {
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: 'bold',
    fontSize: 24,
  },
  filterContainer: {
    flexDirection: 'column',   // change here
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,                  // vertical spacing between buttons
  },
  monthButton: {
    marginBottom: 10,         // spacing below month button
  },
  fetchButton: {
    width: '100%',
  },
  sectionTitle: {
    marginTop: 20,
    fontWeight: 'bold',
    fontSize: 20,
  },
  totalText: {
    marginTop: 10,
    fontWeight: 'bold',
    fontSize: 16,
  },
  remainingText: {
    marginTop: 15,
    fontWeight: 'bold',
    fontSize: 18,
    color: 'green',
    textAlign: 'center',
  },
  buttonRow: {
    marginTop: 30,
    flexDirection: 'column',  // change here
    justifyContent: 'center',
    marginBottom: 30,
    alignItems: 'stretch',
    gap: 10,                  // vertical spacing between buttons
  },
  actionButton: {
    marginVertical: 5,
    width: '100%',
  },
});

export default ReportScreen;
