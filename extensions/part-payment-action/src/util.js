export async function getOrderDetails(orderId) {
    return await makeGraphQLQuery(
      `query Order($id: ID!) {
        order(id: $id) {
          id
          email
          createdAt
          totalPrice
          lineItems(first: 10) {
            edges {
              node {
                title
                quantity
                variant {
                  title
                  price
                }
              }
            }
          }
          customer {
            firstName
            lastName
            email
          }
          transactions {
            id
            amount
            kind
            status
          }
        }
      }
    `,
      { id: orderId }
    );
}


  
  
async function makeGraphQLQuery(query, variables) {
    const graphQLQuery = {
      query,
      variables,
    };
  
    try {
      const res = await fetch("shopify:admin/api/graphql.json", {
        method: "POST",
        body: JSON.stringify(graphQLQuery),
      });
  
      if (!res.ok) {
        throw new Error('Network error');
      }
  
      return await res.json();
    } catch (error) {
      console.error("Error fetching order details:", error.message);
      throw error; 
    }
  }
  