import mongoose from 'mongoose';

const TokenDataSchema = new mongoose.Schema({
  timestamp: { type: Date, required: true },
  total: { type: Number, required: true },
  circulating: { type: Number, required: true },
  fdv: { type: Number, required: true },
  marketCap: { type: Number, required: true },
  liquidity: { type: Number, required: true }
});

export default mongoose.models.TokenData || mongoose.model('TokenData', TokenDataSchema);
