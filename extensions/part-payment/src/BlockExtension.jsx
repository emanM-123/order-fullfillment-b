import {
  reactExtension,
  useApi,
  AdminBlock,
  BlockStack,
  Text,
  Button
} from '@shopify/ui-extensions-react/admin';

const TARGET = 'admin.order-details.block.render';

export default reactExtension(TARGET, () => <App />);

 function App() {
  const { navigation, data, i18n } = useApi(TARGET);
  return (
    <AdminBlock title="Part Payment">
      <BlockStack>
        <Text fontWeight="bold">{"Make your payment"}</Text>
        <Button
          onPress={() => navigation?.navigate(`extension:part-payment-action`)}
        >
          Create Transaction
        </Button>
      </BlockStack>
    </AdminBlock>
  );
}


