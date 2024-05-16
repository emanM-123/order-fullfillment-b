// import {
//   Box,
//   Card,
//   Layout,
//   Link,
//   List,
//   Page,
//   Text,
//   BlockStack,
// } from "@shopify/polaris";

// export default function AdditionalPage() {
//   return (
//     <Page>
//       <ui-title-bar title="Additional page" />
//       <Layout>
//         <Layout.Section>
//           <Card>
//             <BlockStack gap="300">
//               <Text as="p" variant="bodyMd">
//                 The app template comes with an additional page which
//                 demonstrates how to create multiple pages within app navigation
//                 using{" "}
//                 <Link
//                   url="https://shopify.dev/docs/apps/tools/app-bridge"
//                   target="_blank"
//                   removeUnderline
//                 >
//                   App Bridge
//                 </Link>
//                 .
//               </Text>
//               <Text as="p" variant="bodyMd">
//                 To create your own page and have it show up in the app
//                 navigation, add a page inside <Code>app/routes</Code>, and a
//                 link to it in the <Code>&lt;ui-nav-menu&gt;</Code> component
//                 found in <Code>app/routes/app.jsx</Code>.
//               </Text>
//             </BlockStack>
//           </Card>
//         </Layout.Section>
//         <Layout.Section variant="oneThird">
//           <Card>
//             <BlockStack gap="200">
//               <Text as="h2" variant="headingMd">
//                 Resources
//               </Text>
//               <List>
//                 <List.Item>
//                   <Link
//                     url="https://shopify.dev/docs/apps/design-guidelines/navigation#app-nav"
//                     target="_blank"
//                     removeUnderline
//                   >
//                     App nav best practices
//                   </Link>
//                 </List.Item>
//               </List>
//             </BlockStack>
//           </Card>
//         </Layout.Section>
//       </Layout>
//     </Page>
//   );
// }

// function Code({ children }) {
//   return (
//     <Box
//       as="span"
//       padding="025"
//       paddingInlineStart="100"
//       paddingInlineEnd="100"
//       background="bg-surface-active"
//       borderWidth="025"
//       borderColor="border"
//       borderRadius="100"
//     >
//       <code>{children}</code>
//     </Box>
//   );
// }



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
      setOrderID(orderId)
      
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
          window.close();
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
