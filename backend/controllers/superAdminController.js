const Department = require('../models/Department')
const User = require('../models/user.model')
const bcrypt = require("bcryptjs");


exports.addDepartment = async (req, res) => {
  try {
    const { name, code } = req.body
    if (!name || !code) return res.status(400).json({ message: 'Name and code required' })

    const exists = await Department.findOne({ code })
    if (exists) return res.status(400).json({ message: 'Department code already exists' })

    const dept = await Department.create({ name, code })
    res.status(201).json({ message: 'Department added', dept })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getDepartments = async (req, res) => {
  try {
    const depts = await Department.find().sort({ createdAt: -1 })
    res.status(200).json(depts)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.deleteDepartment = async (req, res) => {
  try {
    await Department.findByIdAndDelete(req.params.id)
    res.status(200).json({ message: 'Department deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.resetPassword = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    let defaultPassword;

    if (user.role === "student") {
      defaultPassword = user.rollNo;
    } else if (user.role === "teacher") {
      defaultPassword = user.teacherId;
    } else if (user.role === "admin" || user.role === "superadmin") {
      defaultPassword = user.email;
    } else {
      return res.status(400).json({ message: "Cannot reset password for this role" });
    }

    const hashed = await bcrypt.hash(defaultPassword, 10);

    user.password = hashed;
    user.passwordChanged = false;
    await user.save();

    res.status(200).json({
      message: "Password reset successfully",
      defaultPasswordUsed: defaultPassword,
      email: user.email,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStudents = async (req, res) => {
  try {
    const { page = 1, limit = 10, department, year, section, search } = req.query;

    const query = { role: "student" };

    if (department) query.department = department;
    if (year) query.year = year;
    if (section) query.section = section;

    if (search) {
      query.$or = [
        { name: new RegExp(search, "i") },
        { rollNo: new RegExp(search, "i") },
      ];
    }

    const students = await User.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      total,
      totalPages,
      page: parseInt(page),
      limit: parseInt(limit),
      students,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getTeachers = async (req, res) => {
  try {
    const { page = 1, limit = 10, department, search } = req.query;

    const query = { role: "teacher" };

    if (department) query.department = department;

    if (search) {
      query.$or = [
        { name: new RegExp(search, "i") },
        { teacherId: new RegExp(search, "i") },
      ];
    }

    const teachers = await User.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      total,
      totalPages,
      page: parseInt(page),
      limit: parseInt(limit),
      teachers,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
