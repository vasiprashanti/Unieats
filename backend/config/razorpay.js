import Razorpay from "razorpay";
import crypto from "crypto";

let razorpayInstance = null;

export const initializeRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.warn(
      "Razorpay credentials not found in environment. Online payments will not work."
    );
    return null;
  }

  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  console.log("Razorpay initialized successfully");
  return razorpayInstance;
};

export const getRazorpayInstance = () => {
  if (!razorpayInstance) {
    razorpayInstance = initializeRazorpay();
  }
  return razorpayInstance;
};

export const createRazorpayOrder = async (amount, orderId) => {
  const instance = getRazorpayInstance();

  if (!instance) {
    throw new Error(
      "Razorpay is not configured. Please add credentials to environment."
    );
  }

  try {
    const options = {
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: orderId.toString(),
      notes: {
        order_id: orderId.toString(),
      },
    };

    const razorpayOrder = await instance.orders.create(options);
    return razorpayOrder;
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    throw new Error("Failed to create Razorpay order");
  }
};

export const verifyRazorpaySignature = (
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature
) => {
  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      throw new Error("Razorpay key secret not found");
    }

    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    return generatedSignature === razorpaySignature;
  } catch (error) {
    console.error("Error verifying Razorpay signature:", error);
    return false;
  }
};

export const fetchPaymentDetails = async (paymentId) => {
  const instance = getRazorpayInstance();

  if (!instance) {
    throw new Error("Razorpay is not configured");
  }

  try {
    const payment = await instance.payments.fetch(paymentId);
    return payment;
  } catch (error) {
    console.error("Error fetching payment details:", error);
    throw new Error("Failed to fetch payment details");
  }
};
