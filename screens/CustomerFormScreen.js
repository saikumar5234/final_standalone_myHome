import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Image, Modal, TouchableOpacity, Alert } from 'react-native';
import { TextInput, Button, Switch, Text, Menu, Provider, Card } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import { IconButton } from 'react-native-paper';

const STORAGE_KEY = 'customersData';

const CustomerFormScreen = ({ route }) => {
    const { roomNumber } = route.params;

    const [allCustomers, setAllCustomers] = useState([]);

    // Form states
    const [name, setName] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [rentAdvance, setRentAdvance] = useState('');
    const [firstRentAdvance, setFirstRentAdvance] = useState(null);
    const [rentMonth, setRentMonth] = useState('');
    const [rentPaid, setRentPaid] = useState('');
    const [maintenance, setMaintenance] = useState('');
    const [electricityBill, setElectricityBill] = useState('');
    const [firstRentMonth, setFirstRentMonth] = useState(null);
    const [parkingBill, setParkingBill] = useState('');
    const [date, setDate] = useState(format(new Date(), 'dd-MM-yyyy'));
    const [paymentStatus, setPaymentStatus] = useState(false);
    const [paymentMode, setPaymentMode] = useState('');
    const [chequeNumber, setChequeNumber] = useState('');
    const [uploadedImage, setUploadedImage] = useState(null);

    const [menuVisible, setMenuVisible] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);

    const [modalVisible, setModalVisible] = useState(false);
    const [fullImageUri, setFullImageUri] = useState('');

    // New state for dynamic placeholder of Required Monthly Rent
    const [rentMonthPlaceholder, setRentMonthPlaceholder] = useState('Required Monthly Rent');

    // Fetch saved customers from AsyncStorage on mount & when roomNumber changes
    useEffect(() => {
        loadCustomersFromStorage();
    }, [roomNumber]);



    const loadCustomersFromStorage = async () => {
        try {
            const jsonData = await AsyncStorage.getItem(STORAGE_KEY);
            const data = jsonData ? JSON.parse(jsonData) : [];
            const roomCustomers = data.filter(c => c.roomNumber === roomNumber);
            setAllCustomers(roomCustomers.reverse());

            if (roomCustomers.length > 0) {
                const first = roomCustomers[roomCustomers.length - 1];

                setFirstRentAdvance(first.rentAdvance);
                setFirstRentMonth(first.rentMonth);

                if (!rentAdvance) setRentAdvance(first.rentAdvance?.toString() || '');
                if (!rentMonth) setRentMonth(first.rentMonth?.toString() || '');

                setName(first.name);
                setMobileNumber(first.mobileNumber);

                setRentMonthPlaceholder(`Required Monthly Rent is ₹${first.rentMonth}`);

                const latest = roomCustomers[0];

                setFirstRentAdvance(latest.rentAdvance);
                setFirstRentMonth(latest.rentMonth);

                if (!rentAdvance) setRentAdvance(latest.rentAdvance?.toString() || '');
                if (!rentMonth) setRentMonth(latest.rentMonth?.toString() || '');

                setName(latest.name);
                setMobileNumber(latest.mobileNumber);

                setRentMonthPlaceholder(`Required Monthly Rent is ₹${latest.rentMonth}`);

            } else {
                setFirstRentAdvance(null);
                setFirstRentMonth(null);
                setRentAdvance('');
                setRentMonth('');
                setName('');
                setMobileNumber('');
                setRentMonthPlaceholder('Required Monthly Rent');
            }
        } catch (e) {
            Alert.alert('Error', 'Failed to load customers from storage');
        }
    };

    // Save all customers (including new or updated) to AsyncStorage
    const saveCustomersToStorage = async (newData) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
            setAllCustomers(newData.filter(c => c.roomNumber === roomNumber).reverse());
        } catch (e) {
            Alert.alert('Error', 'Failed to save customer');
        }
    };

    const isFormValid = () => {
        if (
            !name.trim() ||
            !mobileNumber.trim() ||
            !rentAdvance.trim() ||
            !rentMonth.trim() ||
            !rentPaid.trim() ||
            !maintenance.trim() ||
            !electricityBill.trim() ||
            !parkingBill.trim() ||
            !date.trim() ||
            !paymentMode
        ) {
            return false;
        }
        if (paymentMode === 'Cheque' && !chequeNumber.trim()) {
            return false;
        }
        return true;
    };

    // Submit form: add new or update existing
    const handleSubmit = async () => {
        if (
            !name.trim() ||
            !mobileNumber.trim() ||
            !rentAdvance.trim() ||
            !rentMonth.trim() ||
            !rentPaid.trim() ||
            !maintenance.trim() ||
            !electricityBill.trim() ||
            !parkingBill.trim() ||
            !date.trim() ||
            !paymentMode ||
            (paymentMode === 'Cheque' && !chequeNumber.trim())
        ) {
            Alert.alert('Error', 'Please fill all required fields.');
            return;
        }

        const customerData = {
            id: editMode ? editId : Date.now().toString(), // unique id based on timestamp
            roomNumber,
            name,
            mobileNumber,
            rentAdvance: parseFloat(rentAdvance),
            rentMonth: parseFloat(rentMonth),
            rentPaid: parseFloat(rentPaid),
            maintenance: parseFloat(maintenance),
            electricityBill: parseFloat(electricityBill),
            parkingBill: parseFloat(parkingBill),
            paymentStatus: paymentStatus ? 'Paid' : 'Not Paid',
            paymentMode,
            chequeNumber: paymentMode === 'Cheque' ? chequeNumber : '',
            uploadedImage: uploadedImage || '',
            date,
        };

        try {
            const jsonData = await AsyncStorage.getItem(STORAGE_KEY);
            const data = jsonData ? JSON.parse(jsonData) : [];

            let newData = [];
            if (editMode) {
                // Update existing customer
                newData = data.map(c => (c.id === editId ? customerData : c));
            } else {
                // Add new customer
                newData = [...data, customerData];
            }

            await saveCustomersToStorage(newData);
            Alert.alert('Success', editMode ? 'Customer updated!' : 'Customer added!');

            // Update placeholder after successful submit
            setRentMonthPlaceholder(`Required Monthly Rent is ${rentMonth}`);

            resetForm();
        } catch (e) {
            Alert.alert('Error', 'Failed to save customer.');
        }
    };

    const resetForm = () => {
        setName(name);
        setMobileNumber(mobileNumber);
        setRentAdvance(rentAdvance ? rentAdvance.toString() : '');
        setRentPaid(firstRentMonth ? firstRentMonth.toString() : '');
        setRentPaid('');
        setMaintenance('');
        setElectricityBill('');
        setParkingBill('');
        setDate(format(new Date(), 'dd-MM-yyyy'));
        setPaymentStatus(false);
        setPaymentMode('');
        setChequeNumber('');
        setUploadedImage(null);
        setEditMode(false);
        setEditId(null);
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
        });

        if (!result.canceled) {
            setUploadedImage(result.assets[0].uri);
        }
    };

    const startEdit = (cust) => {
        setEditId(cust.id);
        setName(cust.name);
        setMobileNumber(cust.mobileNumber);
        setRentAdvance(cust.rentAdvance.toString());
        setRentMonth(cust.rentMonth.toString());
        setRentPaid(cust.rentPaid?.toString() || '');
        setMaintenance(cust.maintenance?.toString() || '');
        setElectricityBill(cust.electricityBill?.toString() || '');
        setParkingBill(cust.parkingBill?.toString() || '');
        setDate(cust.date);
        setPaymentStatus(cust.paymentStatus === 'Paid');
        setPaymentMode(cust.paymentMode);
        setChequeNumber(cust.chequeNumber || '');
        setUploadedImage(cust.uploadedImage || null);
        setEditMode(true);

        // Update placeholder to current rentMonth of the editing customer
        setRentMonthPlaceholder(`Required Monthly Rent is ${cust.rentMonth}`);
    };

    const isRentAdvanceDisabled = allCustomers.length > 0;
    const isNameDisabled = allCustomers.length > 0;
    const isMobileDisabled = allCustomers.length > 0;

    // Show upload image only if payment mode is Cheque or Online
    const showUploadImage = paymentMode === 'Cheque' || paymentMode === 'Online';

    return (
        <Provider>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.heading}>Flat {roomNumber} - Customer Form</Text>

                {/* Form inputs */}
                <TextInput
                    label="Customer Name"
                    value={name}
                    onChangeText={setName}
                    mode="outlined"
                    style={styles.input}
                    disabled={isNameDisabled}
                />

                <TextInput
                    label="Mobile Number"
                    value={mobileNumber}
                    onChangeText={setMobileNumber}
                    mode="outlined"
                    keyboardType="phone-pad"
                    style={styles.input}
                    disabled={isMobileDisabled}
                />
                <TextInput
                    label="Rent Advance"
                    value={rentAdvance}
                    onChangeText={setRentAdvance}
                    mode="outlined"
                    keyboardType="numeric"
                    style={styles.input}
                    disabled={isRentAdvanceDisabled}
                />
                <TextInput
                    label={rentMonthPlaceholder}
                    value={rentMonth}
                    onChangeText={setRentMonth}
                    mode="outlined"
                    keyboardType="numeric"
                    style={styles.input}
                    placeholder={rentMonthPlaceholder}
                />
                <TextInput
                    label="Rent Paid"
                    value={rentPaid}
                    onChangeText={setRentPaid}
                    mode="outlined"
                    keyboardType="numeric"
                    style={styles.input}
                />
                <TextInput
                    label="Maintenance"
                    value={maintenance}
                    onChangeText={setMaintenance}
                    mode="outlined"
                    keyboardType="numeric"
                    style={styles.input}
                />
                <TextInput
                    label="Electricity Bill"
                    value={electricityBill}
                    onChangeText={setElectricityBill}
                    mode="outlined"
                    keyboardType="numeric"
                    style={styles.input}
                />
                <TextInput
                    label="Parking Bill"
                    value={parkingBill}
                    onChangeText={setParkingBill}
                    mode="outlined"
                    keyboardType="numeric"
                    style={styles.input}
                />
                <TextInput
                    label="Date (dd-MM-yyyy)"
                    value={date}
                    onChangeText={setDate}
                    mode="outlined"
                    style={styles.input}
                />

                {/* <View style={styles.row}>
                    <Text>Payment Status:</Text>
                    <Switch value={paymentStatus} onValueChange={setPaymentStatus} />
                </View> */}

                <Menu
                    visible={menuVisible}
                    onDismiss={() => setMenuVisible(false)}
                    anchor={
                        <Button mode="outlined" onPress={() => setMenuVisible(true)} style={{ marginVertical: 10 }}>
                            {paymentMode ? paymentMode : 'Select Payment Mode'}
                        </Button>
                    }>
                    <Menu.Item onPress={() => { setPaymentMode('Cash'); setMenuVisible(false); }} title="Cash" />
                    <Menu.Item onPress={() => { setPaymentMode('Cheque'); setMenuVisible(false); }} title="Cheque" />
                    <Menu.Item onPress={() => { setPaymentMode('Online'); setMenuVisible(false); }} title="UPI" />
                </Menu>

                {paymentMode === 'Cheque' && (
                    <TextInput
                        label="Cheque Number"
                        value={chequeNumber}
                        onChangeText={setChequeNumber}
                        mode="outlined"
                        keyboardType="numeric"
                        style={styles.input}
                    />
                )}

                {/* Show upload image only for Cheque or Online payment mode */}
                {showUploadImage && (
                    <View style={{ marginVertical: 10 }}>
                        <Button mode="contained" onPress={pickImage}>
                            Upload Image
                        </Button>
                        {uploadedImage && <Image source={{ uri: uploadedImage }} style={styles.image} />}
                    </View>
                )}

                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                    <Text style={{ fontSize: 16 }}>Payment Status</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Switch value={paymentStatus} onValueChange={setPaymentStatus} />
                        <Text style={{ marginLeft: 10, fontSize: 16 }}>
                            {paymentStatus ? 'Paid' : 'Not Paid'}
                        </Text>
                    </View>
                </View>

                <Button mode="contained" disabled={!isFormValid()} onPress={handleSubmit} style={{ marginBottom: 20 }}>
                    {editMode ? 'Update Customer' : 'Add Customer'}
                </Button>

                {/* Show all customers for this room */}
                {/* Show all customers for this room */}
                <Text style={styles.heading}>Customer Details</Text>
                {allCustomers.length === 0 && <Text>No customers yet</Text>}
                {allCustomers.map((cust, index) => {
                    const entryNumber = allCustomers.length - index;

                    return (
                        <Card key={cust.id} style={styles.card}>
                            <Card.Content>
                                <Text style={styles.entryTitle}>#Entry {entryNumber}</Text>

                                <View style={styles.row}><Text style={styles.label}>Name</Text><Text style={styles.colon}>:</Text><Text style={styles.value}>{cust.name}</Text></View>
                                <View style={styles.row}><Text style={styles.label}>Mobile</Text><Text style={styles.colon}>:</Text><Text style={styles.value}>{cust.mobileNumber}</Text></View>
                                <View style={styles.row}><Text style={styles.label}>Rent Advance</Text><Text style={styles.colon}>:</Text><Text style={styles.value}>₹{cust.rentAdvance}</Text></View>
                                <View style={styles.row}><Text style={styles.label}>Rent Month</Text><Text style={styles.colon}>:</Text><Text style={styles.value}>₹{cust.rentMonth}</Text></View>
                                <View style={styles.row}><Text style={styles.label}>Rent Paid</Text><Text style={styles.colon}>:</Text><Text style={styles.value}>₹{cust.rentPaid}</Text></View>
                                <View style={styles.row}><Text style={styles.label}>Maintenance</Text><Text style={styles.colon}>:</Text><Text style={styles.value}>₹{cust.maintenance}</Text></View>
                                <View style={styles.row}><Text style={styles.label}>Electricity Bill</Text><Text style={styles.colon}>:</Text><Text style={styles.value}>₹{cust.electricityBill}</Text></View>
                                <View style={styles.row}><Text style={styles.label}>Parking Bill</Text><Text style={styles.colon}>:</Text><Text style={styles.value}>₹{cust.parkingBill}</Text></View>
                                <View style={styles.row}><Text style={styles.label}>Date</Text><Text style={styles.colon}>:</Text><Text style={styles.value}>{cust.date}</Text></View>
                                <View style={styles.row}><Text style={styles.label}>Payment Status</Text><Text style={styles.colon}>:</Text><Text style={styles.value}>{cust.paymentStatus}</Text></View>
                                <View style={styles.row}><Text style={styles.label}>Payment Mode</Text><Text style={styles.colon}>:</Text><Text style={styles.value}>{cust.paymentMode}</Text></View>

                                {cust.paymentMode === 'Cheque' && (
                                    <View style={styles.row}>
                                        <Text style={styles.label}>Cheque No</Text>
                                        <Text style={styles.colon}>:</Text>
                                        <Text style={styles.value}>{cust.chequeNumber}</Text>
                                    </View>
                                )}

                                {cust.uploadedImage && (
                                    <TouchableOpacity
                                        onPress={() => {
                                            setFullImageUri(cust.uploadedImage);
                                            setModalVisible(true);
                                        }}
                                        style={styles.imageContainer}
                                    >
                                        <Image source={{ uri: cust.uploadedImage }} style={styles.smallImage} />
                                    </TouchableOpacity>
                                )}

                                <Button onPress={() => startEdit(cust)} mode="outlined" style={styles.editButton}>
                                    Edit
                                </Button>
                            </Card.Content>
                        </Card>
                    );
                })}
                {/* Modal for full screen image */}
                <Modal visible={modalVisible} transparent={true} animationType="fade">
                    <View style={styles.modalContainer}>
                        {/* Background to close modal when tapped outside image */}
                        <TouchableOpacity
                            style={styles.modalBackground}
                            activeOpacity={1}
                            onPress={() => setModalVisible(false)}
                        />

                        {/* Close icon button */}
                        <IconButton
                            icon="close"
                            size={30}
                            color="red"
                            onPress={() => setModalVisible(false)}
                            style={styles.closeIcon}
                        />

                        {/* Fullscreen image */}
                        <Image
                            source={{ uri: fullImageUri }}
                            style={styles.fullImage}
                            resizeMode="contain"
                        />
                    </View>
                </Modal>


            </ScrollView>
        </Provider>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#fff',
    },
    heading: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    input: {
        marginBottom: 10,
    },
    closeIcon: {
        position: 'absolute',
        top: 40,       // adjust for status bar / top padding
        right: 20,
        zIndex: 2,
        backgroundColor: 'rgba(0,0,0,0.5)', // optional translucent background
        borderRadius: 20,
    },
    image: {
        width: 150,
        height: 150,
        marginTop: 10,
    },
    smallImage: {
        width: 80,
        height: 80,
        marginTop: 10,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',  // semi-transparent black background
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBackground: {
        ...StyleSheet.absoluteFillObject,  // fills entire container
    },
    entryTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
        color: 'black',
    },
    fullImage: {
        width: '90%',
        height: '80%',
        borderRadius: 10,
    },
    card: {
        marginBottom: 12,
        padding: 10,
        borderRadius: 12,
        elevation: 3,
    },
    name: {
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 8,
        color: '#333',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 4,
    },
    label: {
        flex: 1,
        textAlign: 'left',
        fontWeight: '600',
        fontSize: 14,
    },
    colon: {
        width: 10,
        textAlign: 'center',
        fontWeight: '600',
        color: '#555',
        fontSize: 16,
        fontWeight: 'bold',
    },
    value: {
        flex: 1,
        color: '#222',
        fontSize: 15,
        fontWeight: 'bold',
        marginLeft: 20,
    },
    imageContainer: {
        marginTop: 10,
        alignItems: 'center',
    },
    smallImage: {
        width: 300,
        height: 170,
        resizeMode: 'cover',
        borderRadius: 8,
        marginTop: 5,
    },
    editButton: {
        marginTop: 12,
        alignSelf: 'auto',
        borderRadius: 10,
        fontWeight: 'bold',
    },
});


export default CustomerFormScreen;
