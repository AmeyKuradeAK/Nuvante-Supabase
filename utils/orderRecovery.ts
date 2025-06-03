interface FailedOrder {
  orderId: string;
  paymentId: string;
  timestamp: string;
  amount: number;
  retryCount: number;
  error: string;
}

export const attemptOrderRecovery = async (): Promise<void> => {
  try {
    // Get all failed orders from localStorage
    const failedOrders: FailedOrder[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('failed_order_')) {
        try {
          const orderData = JSON.parse(localStorage.getItem(key) || '');
          failedOrders.push(orderData);
        } catch (error) {
          console.error('Failed to parse order data:', error);
          // Remove corrupted data
          localStorage.removeItem(key);
        }
      }
    }

    if (failedOrders.length === 0) {
      return;
    }

    console.log(`Found ${failedOrders.length} failed orders, attempting recovery...`);

    // Attempt to recover each failed order
    for (const order of failedOrders) {
      try {
        const response = await fetch('/api/recover-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId: order.orderId,
            paymentId: order.paymentId,
            amount: order.amount,
            timestamp: order.timestamp
          }),
        });

        if (response.ok) {
          const result = await response.json();
          console.log(`Order ${order.orderId} recovery result:`, result);
          
          // Remove from localStorage if successfully recovered or already exists
          if (result.recovered || result.exists) {
            localStorage.removeItem(`failed_order_${order.orderId}`);
          }
        } else {
          console.error(`Failed to recover order ${order.orderId}:`, response.statusText);
        }
      } catch (error) {
        console.error(`Error recovering order ${order.orderId}:`, error);
      }
    }
  } catch (error) {
    console.error('Error in order recovery process:', error);
  }
};

export const clearOldFailedOrders = (): void => {
  try {
    const cutoffTime = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days ago
    
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith('failed_order_')) {
        try {
          const orderData = JSON.parse(localStorage.getItem(key) || '');
          const orderTime = new Date(orderData.timestamp).getTime();
          
          if (orderTime < cutoffTime) {
            localStorage.removeItem(key);
            console.log(`Removed old failed order: ${key}`);
          }
        } catch (error) {
          // Remove corrupted data
          localStorage.removeItem(key);
        }
      }
    }
  } catch (error) {
    console.error('Error cleaning up old failed orders:', error);
  }
};

export const getFailedOrdersCount = (): number => {
  try {
    let count = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('failed_order_')) {
        count++;
      }
    }
    return count;
  } catch (error) {
    console.error('Error counting failed orders:', error);
    return 0;
  }
}; 