import VendorDues from "../models/VendorDues.model.js";
import Vendor from "../models/Vendor.model.js";
import Order from "../models/Order.model.js";

// GET /admin/vendor-dues?status=pending&page=1&limit=20
async function listVendorDues(req, res, next) {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const dues = await VendorDues.find(filter)
      .populate("vendor", "name email")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 })
      .lean();

    const total = await VendorDues.countDocuments(filter);

    res.json({ data: dues, total });
  } catch (err) {
    next(err);
  }
}

// POST /admin/vendor-dues/:id/mark-paid
async function markVendorDuePaid(req, res, next) {
  try {
    const { id } = req.params;
    const { amountPaid = 0, transactionRef } = req.body;

    const due = await VendorDues.findById(id);
    if (!due) return res.status(404).json({ message: "Vendor due not found" });

    due.amountPaid = (due.amountPaid || 0) + Number(amountPaid);
    if (due.amountPaid >= due.amountDue) {
      due.status = "paid";
      due.clearedAt = new Date();
    } else {
      due.status = "partial";
    }
    if (transactionRef) due.transactionRef = transactionRef;

    await due.save();

    // Optionally: when fully paid, we could clear dueId on orders or mark them as reconciled.

    res.json({ data: due });
  } catch (err) {
    next(err);
  }
}

export { listVendorDues, markVendorDuePaid };
