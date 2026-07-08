// شبیه‌سازی درگاه پرداخت
// =====================
// این فایل به‌جای اتصال واقعی به درگاهی مثل زرین‌پال یک رفتار مشابه را تقلید می‌کند:
// ۱) requestPayment یک "authority"/شناسه تراکنش برمی‌گرداند و کاربر را به صفحه پرداخت شبیه‌سازی‌شده هدایت می‌کند
// ۲) verifyPayment صحت تراکنش را بررسی و آن را تایید می‌کند
//
// برای اتصال به زرین‌پال واقعی:
// - مقدار PAYMENT_GATEWAY_MODE در .env را به "zarinpal" تغییر دهید
// - ZARINPAL_MERCHANT_ID را با مرچنت کد واقعی پر کنید
// - این دو تابع را با فراخوانی API زرین‌پال (https://www.zarinpal.com/docs/paymentGateway/) جایگزین کنید
//   مسیرهای واقعی API: POST https://api.zarinpal.com/pg/v4/payment/request.json
//                       POST https://api.zarinpal.com/pg/v4/payment/verify.json

const MODE = process.env.PAYMENT_GATEWAY_MODE || 'mock';

async function requestPayment({ orderId, amount, description, callbackUrl }) {
  if (MODE === 'mock') {
    // شناسه تراکنش ساختگی - شبیه authority زرین‌پال
    const authority = 'MOCK-' + orderId + '-' + Date.now();
    return {
      success: true,
      authority,
      // در حالت واقعی اینجا کاربر به درگاه زرین‌پال هدایت می‌شود؛
      // در حالت mock مستقیماً به صفحه تایید شبیه‌سازی‌شده می‌رویم
      paymentUrl: `/checkout/mock-gateway?authority=${authority}&orderId=${orderId}&amount=${amount}&callback=${encodeURIComponent(callbackUrl)}`
    };
  }

  // TODO: اتصال واقعی به زرین‌پال در اینجا اضافه شود
  throw new Error('درگاه پرداخت واقعی هنوز پیکربندی نشده است');
}

async function verifyPayment({ authority, amount }) {
  if (MODE === 'mock') {
    // در حالت شبیه‌سازی، هر authority که با MOCK- شروع شود را تایید می‌کنیم
    const isValid = typeof authority === 'string' && authority.startsWith('MOCK-');
    return {
      success: isValid,
      refId: isValid ? 'REF-' + Math.floor(Math.random() * 1000000000) : null
    };
  }

  // TODO: اتصال واقعی به زرین‌پال در اینجا اضافه شود
  throw new Error('درگاه پرداخت واقعی هنوز پیکربندی نشده است');
}

module.exports = { requestPayment, verifyPayment };
