import mongoose from 'mongoose';

export async function ligarBaseDados() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bot-natal';
  await mongoose.connect(uri);
}

export function desligarBaseDados() {
  return mongoose.disconnect();
}
