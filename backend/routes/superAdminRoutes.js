const express = require('express')
const router = express.Router()
const {
  addDepartment,
  getDepartments,
  deleteDepartment,
  resetPassword,
  getStudents,
  getTeachers
} = require("../controllers/superAdminController");
const { bulkUpload } = require('../controllers/bulkUploadController')
const upload = require('../middleware/uploadCSV') // ✅ add this line

router.post("/reset-password/:id", resetPassword);

router.post('/add-department', addDepartment)
router.get('/departments', getDepartments)
router.delete('/department/:id', deleteDepartment)
router.post('/bulk-upload', upload.single('file'), bulkUpload)
router.get("/students", getStudents);
router.get("/teachers", getTeachers);
module.exports = router
