import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Name of the sequence (e.g., 'orderId')
  seq: { type: Number, default: 0 }, // The last used sequence number
});

// Helper method to get the next sequence number
counterSchema.statics.getNextSequenceValue = async function (sequenceName) {
  const sequenceDocument = await this.findByIdAndUpdate(
    sequenceName,
    { $inc: { seq: 1 } },
    { new: true, upsert: true } // Return the updated doc, create if doesn't exist
  );
  return sequenceDocument.seq;
};

const Counter = mongoose.model("Counter", counterSchema);
export default Counter;
