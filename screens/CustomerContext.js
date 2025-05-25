import React, { createContext, useState } from 'react';

export const CustomerContext = createContext();

export const CustomerProvider = ({ children }) => {
  const [customers, setCustomers] = useState({});

  const saveCustomer = (roomNumber, customerData) => {
    setCustomers((prev) => ({
      ...prev,
      [roomNumber]: customerData,
    }));
  };

  const getCustomer = (roomNumber) => customers[roomNumber];

  return (
    <CustomerContext.Provider value={{ customers, saveCustomer, getCustomer }}>
      {children}
    </CustomerContext.Provider>
  );
};
