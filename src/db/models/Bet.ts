import mongoose from 'mongoose';

const BetSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  gameId: { type: String, required: true },
  amount: { type: Number, required: true },
  cashoutMultiplier: { type: Number, default: null },
});

export default mongoose.model('Bet', BetSchema);
