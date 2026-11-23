import mongoose from 'mongoose';

export async function ligarBaseDados() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('Falta configurar MONGODB_URI.');
  await mongoose.connect(uri);
}

export function desligarBaseDados() {
  return mongoose.disconnect();
}
