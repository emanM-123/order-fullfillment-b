


import React, { useState, useEffect } from 'react';
import { Page, Layout, Card, Button, Select, TextField } from '@shopify/polaris';


export default function AdditionalPage() {
  const [orderID, setOrderID] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [editableAmount, setEditableAmount] = useState(0);

  useEffect(() => {
    const fullUrl = window.location.href;
    const url = new URL(fullUrl);
    const pageLink = `${url.origin}${url.pathname}?id=${url.searchParams.get('id')}`;
    const params = new URLSearchParams(pageLink.split('?')[1]);
    const orderId = params.get('id');
    if (orderId) {
      setOrderID(`Order Id : ${orderId}`);
      const oid = `gid://shopify/Order/${orderId}`;
      (async function getOrderInfo() {
        const orderDetailsResponse = await fetch(`https://transaction-api-wp4bffpqkq-uc.a.run.app/app/order-details?orderId=${oid}`);
        if (!orderDetailsResponse.ok) {
          throw new Error('Failed to fetch order details');
        }
        const orderDetails = await orderDetailsResponse.json();
        if (orderDetails?.data?.order) {
          const balanceAmount = orderDetails.data.order.totalPrice - orderDetails.data.order.transactions.reduce((total, transaction) => {
            if (transaction.kind === 'CAPTURE' && transaction.status === 'SUCCESS') {
              console.log('Adding transaction amount:', total + parseFloat(transaction.amount));
              return total + parseFloat(transaction.amount);
            }
            return total;
          }, 0);
          console.log('Final balance amount:', balanceAmount);
          setEditableAmount(balanceAmount);
        } else {
          console.error('Failed to fetch order details');
        }
      })();

    }
  }, []);

  const handleOrderIDChange = (value) => {
    setOrderID(value);
  };

  const handlePaymentModeChange = (value) => {
    setPaymentMode(value);
  };

  const handleAmountChange = (value) => {
    setEditableAmount(value);
  };

  const handleMakePayment = (event) => {
    event.preventDefault();
    console.log('Order ID:', orderID);
    console.log('Payment Mode:', paymentMode);
    console.log('Editable Amount:', editableAmount);
    try {
      const url = 'https://transaction-api-wp4bffpqkq-uc.a.run.app/create-transaction-b';
      const options = {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderID,
          amount: editableAmount,
          paymentMode: paymentMode,
        })
      };

      fetch(url, options)
        .then(response => response.json())
        .then(transactionResponse => {
          console.log(transactionResponse);
          setOrderID('');
          setPaymentMode('');
          setEditableAmount(0);
        })
        .catch(error => {
          console.error(error);
        });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Page title="Partial Payment">
      <Layout>
        <Layout.Section>
          <Card>
            <TextField
              label="Order ID"
              type="text"
              value={orderID}
              onChange={handleOrderIDChange}
            />
            <Select
              label="Payment Mode"
              options={[
                { label: 'Select', value: 'select' },
                { label: 'Credit Card (HDFC)', value: 'credit_card_hdfc' },
                { label: 'Credit Card (ICICI)', value: 'credit_card_icici' },
                { label: 'Debit Card (HDFC)', value: 'debit_card_hdfc' },
                { label: 'Debit Card (ICICI)', value: 'debit_card_icici' },
                { label: 'UPI', value: 'upi' },
                { label: 'Cash', value: 'cash' },
                { label: 'Bank Transfer', value: 'bank_transfer' },
                { label: 'Gate Way', value: 'get_way' },
                { label: 'Store Credit', value: 'store_credit' },
                { label: 'Send Email', value: 'send_email' },
              ]}
              onChange={handlePaymentModeChange}
              value={paymentMode}
            />
            <TextField
              label="Balance"
              type="number"
              value={editableAmount}
              onChange={handleAmountChange}
            />
            <div style={{ marginTop: '16px' }}>
              <Button onClick={(event) => handleMakePayment(event)}>Make Payment</Button>
            </div>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
