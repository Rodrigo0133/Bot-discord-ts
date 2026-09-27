import { Schema, model, connect } from "mongoose";
export async function ligarBaseDados() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI não definida.");
  }

  await connect(mongoUri);
  console.log("MongoDB ligado");
}

const userSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },

  guildId: {
    type: String,
    required: true,
  },

  ultimaUtilizacao: {
    type: Number,
    default: 0,
  },

  tickets: {
    type: Number,
    default: 0,
    min: 0,
  },
  pity:{
    type: Number,
    default: 0,
    min: 0,
  }
});

export const User = model("User", userSchema);
