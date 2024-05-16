import { useEffect, useState } from 'react';
import { Page, Layout, Card, Button, Select, TextField } from '@shopify/polaris';


function AppActionPage() {
    const [paymentMode, setPaymentMode] = useState('');
    const [editableAmount, setEditableAmount] = useState(0);

    const handlePaymentModeChange = (value) => {
        setPaymentMode(value);
    };

    const handleAmountChange = (value) => {
        setEditableAmount(value);
    };

    return (
        <Page title="Order Details">
            <Layout>
                <Layout.Section>
                    <Card >
                        <div>
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
                        </div>
                        <Button>Make Payment</Button>
                    </Card>
                </Layout.Section>
            </Layout>
        </Page>
    );
}

export default AppActionPage;
