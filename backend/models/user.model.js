const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  rollNo: {
    type: String,
    unique: true,
    sparse: true,
  },
  teacherId: {
    type: String,
    unique: true,
    sparse: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  department: {
    type: String,
  },
  section: {
    type: String,
  },
  year: {
    type: String,
  },
  classTeacher: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    enum: ['superadmin', 'deptadmin', 'teacher', 'student'],
    default: 'student',
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
  },
  profileImage: {
    type: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
