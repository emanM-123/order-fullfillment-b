import {useEffect, useState } from 'react';
import {
  reactExtension,
  useApi,
  AdminAction,
  BlockStack,
  Button,
  Text,
} from '@shopify/ui-extensions-react/admin';

const TARGET = 'admin.order-details.action.render';

export default reactExtension(TARGET, () => <App />);

function App() {
  const {i18n, close, data} = useApi(TARGET);
  console.log({data});
  const [productTitle, setProductTitle] = useState('');
  
  useEffect(() => {
    (async function getProductInfo() {
      const getProductQuery = {
        query: `query Product($id: ID!) {
          product(id: $id) {
            title
          }
        }`,
        variables: {id: data.selected[0].id},
      };     

      const res = await fetch("shopify:admin/api/graphql.json", {
        method: "POST",
        body: JSON.stringify(getProductQuery),
      });

      if (!res.ok) {
        console.error('Network error');
      }

      const productData = await res.json();
      setProductTitle(productData.data.product.title);
    })();
  }, [data.selected]);
  return (
    <AdminAction
      primaryAction={
        <Button
          onPress={() => {
            console.log('saving');
            close();
          }}
        >
          Cancel Order
        </Button>
      }
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
        <Text fontWeight="bold">{i18n.translate('welcome', {TARGET})}</Text>
        <Text>Current product: {productTitle}</Text>
      </BlockStack>
    </AdminAction>
  );
}