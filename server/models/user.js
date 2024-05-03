import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  id: { type: String },
  dateOfBirth: { type: Date },
  address: { type: String },
  phoneNumber: { type: String },
  isAdmin: { type: Boolean, default: false },
  isOrganizer: { type: Boolean, default: false },
  userImage: { type: String },
  isActive: { type: Boolean, default: false, required: true },
  bio: { type: String }, 
  interests: [{ type: String }], 
  joinedAt: { type: Date, default: Date.now },
  organizations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Organizer' }],
  googleId: { type: String },
});

const User = mongoose.model("User", userSchema);

export default User;