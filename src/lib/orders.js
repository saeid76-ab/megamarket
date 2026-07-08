const { prisma } = require('./db');

const statusLabels = {
  PENDING_PAYMENT: 'در انتظار پرداخت',
  PAID: 'پرداخت شده',
  PROCESSING: 'در حال پردازش',
  SHIPPED: 'ارسال شده',
  DELIVERED: 'تحویل داده شده',
  CANCELLED: 'لغو شده'
};

async function getOrdersForUser(userId) {
  const orders = await prisma.order.findMany({
    where: { userId },
    include: { items: { include: { product: { include: { images: true } } } } },
    orderBy: { createdAt: 'desc' }
  });
  return orders;
}

async function getOrderById(orderId, userId) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: { include: { images: true } } } } }
  });
  if (!order) return null;
  if (userId && order.userId !== userId) return null;
  return order;
}

module.exports = { statusLabels, getOrdersForUser, getOrderById };
