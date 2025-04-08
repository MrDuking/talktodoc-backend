export default () => ({
    vnpay: {
      tmnCode: process.env.VNP_TMNCODE,
      hashSecret: process.env.VNP_HASH_SECRET,
      url: process.env.VNP_URL,
      returnUrl: process.env.VNP_RETURN_URL,
      ipnUrl: process.env.VNP_IPN_URL,
    },
  });