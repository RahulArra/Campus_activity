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
   assignedSection: {
    type: String,
    default: null,
  },
  assignedYear: {
    type: String,
    default: null,
  },
  classTeacher: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    enum: ['superadmin', 'deptadmin', 'teacher', 'student', 'user'],
    default: 'student',
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
  },
  passwordChanged: {
    type: Boolean,
    default: false,
  },
  profileImage: {
    type: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
