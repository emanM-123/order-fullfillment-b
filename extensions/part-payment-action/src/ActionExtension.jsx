import { useEffect, useState } from 'react';
import {
  reactExtension,
  AdminAction,
  BlockStack,
  Button,
  Text,
  Select,
  useApi,
  TextField,
  Checkbox
} from '@shopify/ui-extensions-react/admin';


import { getOrderDetails } from "./util.js";

const TARGET = 'admin.order-details.action.render';

export default reactExtension(TARGET, () => <App />);

function App() {

  const { i18n, close, data, } = useApi(TARGET);
  const [amount, setAmount] = useState(0);
  const [orderTitle, setOrderTitle] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [editableAmount, setEditableAmount] = useState(0);
  const [showAdditionalFields, setShowAdditionalFields] = useState(false);
  const [selectedOtherOptions, setSelectedOtherOptions] = useState([]);
  const [customerEmail, setCustomerEmail] = useState(null);
  const [walletAmountOptions, setWalletAmountOptions] = useState([]);
  const [selectedWallets, setSelectedWallets] = useState([]);
  const [walletPrice, setWalletPrice] = useState(0);
  const [totalSelectedWalletPrices, setTotalSelectedWalletPrice] = useState(0);



  useEffect(() => {
    if (data.selected && data.selected.length > 0) {
      const orderId = data.selected[0].id;
      setOrderTitle(`Order Id : ${orderId}`);
      (async function getOrderInfo() {
        const orderDetails = await getOrderDetails(orderId);
        if (orderDetails?.data?.order) {
          const order = orderDetails.data.order;
          const customerEmail = order.email;
          setCustomerEmail(customerEmail);
          const totalPaidAmount = order.transactions.reduce((total, transaction) => {
            if (transaction.kind === 'CAPTURE' && transaction.status === 'SUCCESS') {
              return total + parseFloat(transaction.amount);
            }
            return total;
          }, 0);
          const totalOrderAmount = parseFloat(order.totalPrice);
          const calculatedBalanceAmount = totalOrderAmount - totalPaidAmount;
          setEditableAmount(calculatedBalanceAmount);
          setAmount(calculatedBalanceAmount);
        } else {
          console.error('Failed to fetch order details');
        }
      })();
    }
  }, [data.selected]);

  useEffect(() => {
    if (customerEmail) {
      fetchWalletAmountOptions();
    }
  }, [customerEmail]);


  const fetchWalletAmountOptions = async () => {
    try {
      console.log(customerEmail);
      const url = `https://transaction-api-wp4bffpqkq-uc.a.run.app/app/get-wallet-amount?customerEmail=${customerEmail}`;
      const response = await fetch(url);
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        const walletOptions = data.reduce((options, entry) => {
          Object.entries(entry).forEach(([orderId, price]) => {
            options.push({
              label: `${orderId} - ${price}`,
              value: orderId
            });
          });
          return options;
        }, []);
        setWalletAmountOptions(walletOptions);
      } else {
        console.error('No wallet amount data found');
      }
    } catch (error) {
      console.error('Error fetching wallet amount data:', error);
    }
  };

  const createTransaction = async () => {
    try {
      const orderId = data.selected[0].id;
      let reg = new RegExp(/(?<=Order\/).*$/gm);
      let oid = orderId.match(reg)[0];
      const url = 'https://transaction-api-wp4bffpqkq-uc.a.run.app/create-transaction-b';

      const uniqueSelectedWallets = [...new Set(selectedWallets)];
      const remainingWalletsObjs = walletAmountOptions
        .filter(wallet => !uniqueSelectedWallets.includes(wallet.value))
        .reduce((obj, wallet) => {
          obj[wallet.value] = wallet.label.split(' - ')[1];
          return obj;
        }, {});
      console.log("remainingWalletsObjs", remainingWalletsObjs);
      let totalPriceOfSelectedWallets = 0;
      const metafieldObject = uniqueSelectedWallets.reduce((walletsObj, walletId) => {
        const walletOption = walletAmountOptions.find(wallet => wallet.value === walletId);
        console.log(walletOption, "walletOption");
        if (walletOption) {
          const price = parseFloat(walletOption.label.split(' - ')[1].replace('₹', '').replace(/,/g, ''));
          totalPriceOfSelectedWallets += price;
          const updatedAmount = Math.max(totalPriceOfSelectedWallets - amount, 0);
          if (updatedAmount > 0) {
            walletsObj[walletId] = `₹${updatedAmount.toFixed(2)}`;
          }
        }
        return walletsObj;
      }, remainingWalletsObjs);

      console.log("metafieldObject", metafieldObject, totalPriceOfSelectedWallets);
      let totalAmount = 0;
      if (editableAmount == 0) {
        totalAmount = parseFloat(amount);
      } else {
        totalAmount = parseFloat(editableAmount) + parseFloat(walletPrice);
      }
      const options = {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: oid,
          amount: totalAmount,
          paymentMode: paymentMode,
          wallets: metafieldObject,
          customerEmail: customerEmail
        })
      };

      fetch(url, options)
        .then(response => response.json())
        .then(transactionResponse => {
          console.log(transactionResponse);
        })
        .catch(error => {
          console.error(error);
        });
    } catch (error) {
      console.error(error);
    }
  };
x`x`
  const handlePaymentModeChange = (value) => {
    setPaymentMode(value);
    if (value !== 'select') {
      setShowAdditionalFields(true);
    } else {
      setShowAdditionalFields(false);
    }
  };

  const handleAmountChange = (value) => {
    setEditableAmount(value);
  };


  const handleCheckboxChange = (value) => {
    var totalSelectedWalletPrice = 0; 
    if (editableAmount === 0) {
      return;
    }
  
    var totalSelectedWalletPrice = 0; 
    if (selectedOtherOptions.includes(value)) {
      //for deselect
      const walletOption = walletAmountOptions.find(wallet => wallet.value === value);
      if (walletOption) {
        const price = parseFloat(walletOption.label.split(' - ')[1].replace('₹', '').replace(/,/g, ''));
        if (editableAmount === 0) {
          if(amount < price){
            setEditableAmount(amount)
          }else{
            setEditableAmount(totalSelectedWalletPrices);
          }          
        } else {
          const updatedEditableAmount1 = editableAmount + price;
          setEditableAmount(updatedEditableAmount1);
        }
        setWalletPrice(price);
      }
      setSelectedOtherOptions(prevSelected => prevSelected.filter(option => option !== value));
      setSelectedWallets(prevWallets => prevWallets.filter(wallet => wallet !== value)); // Remove from selectedWallets
    } else {
      //for select
      const walletOption = walletAmountOptions.find(wallet => wallet.value === value);
      if (walletOption) {
        const price = parseFloat(walletOption.label.split(' - ')[1].replace('₹', '').replace(/,/g, ''));

        const updatedEditableAmount = editableAmount - price;
        setEditableAmount(updatedEditableAmount < 0 ? 0 : updatedEditableAmount);
        setWalletPrice(price);
      }
      setSelectedWallets(prevWallets => [...prevWallets, value]);
      setSelectedOtherOptions(prevSelected => [...prevSelected, value]);
    } 
    selectedWallets.forEach(walletId => {
      const walletOption = walletAmountOptions.find(wallet => wallet.value === walletId);
      if (walletOption) {
        const price = parseFloat(walletOption.label.split(' - ')[1].replace('₹', '').replace(/,/g, ''));
        totalSelectedWalletPrice += price; // Update total price
      }
    });
    setTotalSelectedWalletPrice(totalSelectedWalletPrice);
    
  };


  return (
    <AdminAction
      primaryAction={
        <Button
          class="make-payment-button"
          onPress={() => {
            createTransaction();
            close();
          }}>
          Make Payment
        </Button>}
      secondaryAction={
        <Button
          onPress={() => {
            console.log('closing');
            close();
          }}
        >
          Close
        </Button>
      }
    >
      <BlockStack>
        <Text>{orderTitle}</Text>
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
        {showAdditionalFields && (
          <BlockStack direction="column" spacing="tight">
            <Text>Wallet Amount</Text>
            <BlockStack direction="row" spacing="tight" wrap>
              {walletAmountOptions.map(option => (
                <Checkbox
                  key={option.value}
                  label={option.label}
                  checked={selectedOtherOptions.includes(option.value)}
                  onChange={() => handleCheckboxChange(option.value)}
                  disabled={editableAmount === 0} 
                />
              ))}
            </BlockStack>
          </BlockStack>
        )}


        <TextField
          label="Balance"
          type="number"
          value={editableAmount}
          onChange={handleAmountChange}
        />
      </BlockStack>
    </AdminAction>
  );
}