export const setupSocketManager = (io) => {

  io.on('connection', (socket) => {
    // Merchant joins specific room
    socket.on('join_merchant', () => {
      socket.join('merchant_room');
    });

    // Customer places a new order
    socket.on('new_order', (orderData) => {
      const order = { ...orderData, status: 'Pending', createdAt: new Date() };
      // Notify merchants instantly
      io.to('merchant_room').emit('order_received', order);
    });

    // Merchant updates order status
    socket.on('update_order_status', ({ orderId, status }) => {
      // Aggressively notify all clients (frontend history log listens to this)
      io.emit('order_status_changed', { orderId, status });
    });

    socket.on('disconnect', () => {
      // Client disconnected
    });

    // Merchant inventory update broadcast
    socket.on('inventory_changed', ({ shopId }) => {
      // Notify all customers inside this shop's specific room
      io.to(`shop_${shopId}`).emit('inventory_refresh');
      // Also broadcast globally if needed (fallback)
      io.emit(`inventory_refresh_${shopId}`);
    });
  });
};
