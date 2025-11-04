import cron from "node-cron";
import mongoose from "mongoose";
import VendorDues from "../models/VendorDues.model.js";
import Order from "../models/Order.model.js";
import Vendor from "../models/Vendor.model.js";
import { startOfDay, endOfDay, subDays } from "date-fns";
import pkg from "date-fns-tz";
const { zonedTimeToUtc } = pkg;

// delivered orders (paymentDetails.method in ["COD","UPI"]) that have no dueId set.
async function generateVendorDues({ dryRun = false } = {}) {
  // We group orders by vendor where status=delivered and payment method is COD/UPI and dueId is null
  const match = {
    status: "delivered",
    "paymentDetails.method": { $in: ["COD", "UPI"] },
    dueId: null, // matches documents where dueId is null OR doesn't exist
  };

  const pipeline = [
    { $match: match },
    {
      $group: {
        _id: "$vendor",
        orders: { $push: "$_id" },
        amountDue: { $sum: { $ifNull: ["$vendorOwes", 0] } }, // handle undefined/null vendorOwes
        periodStartDate: { $min: "$createdAt" }, // compute min directly in aggregation
        periodEndDate: { $max: "$createdAt" }, // compute max directly in aggregation
      },
    },
  ];

  const results = await Order.aggregate(pipeline).exec();

  const created = [];
  for (const r of results) {
    if (!r._id) continue;
    const vendorId = r._id;
    const ordersIncluded = r.orders || [];
    const amountDue = r.amountDue || 0;
    const periodStart = r.periodStartDate || new Date();
    const periodEnd = r.periodEndDate || new Date();

    if (amountDue <= 0 || ordersIncluded.length === 0) continue;

    const doc = {
      vendor: vendorId,
      periodStartDate: periodStart,
      periodEndDate: periodEnd,
      amountDue,
      ordersIncluded,
      status: "pending",
    };

    if (dryRun) {
      created.push(doc);
      continue;
    }

    // Use transaction for atomicity (create VendorDues + mark orders in one atomic operation)
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const saved = await VendorDues.create([doc], { session });
        // mark orders with dueId to prevent double counting
        await Order.updateMany(
          { _id: { $in: ordersIncluded } },
          { $set: { dueId: saved[0]._id } },
          { session }
        ).exec();
        created.push(saved[0]);
      });
    } finally {
      session.endSession();
    }
  }

  return created;
}

function scheduleVendorDuesJob() {
  // Runs at 00:00 on Thu and Sat in Asia/Kolkata
  const expression = "0 0 * * 4,6"; // minute hour day month day-of-week
  const task = cron.schedule(
    expression,
    async () => {
      try {
        console.log("[vendorDuesJob] starting generation job (cron)");
        const created = await generateVendorDues();
        console.log(`[vendorDuesJob] created ${created.length} dues entries`);
      } catch (err) {
        console.error("[vendorDuesJob] error", err);
      }
    },
    { timezone: "Asia/Kolkata" }
  );

  return task;
}

export { generateVendorDues, scheduleVendorDuesJob };
