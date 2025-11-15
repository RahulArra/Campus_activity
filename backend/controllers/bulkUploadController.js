const csv = require("csv-parser");
const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const UploadSummary = require("../models/UploadSummary");
const { Readable } = require("stream");
const chalk = require("chalk");

exports.bulkUpload = async (req, res) => {
  try {
    if (!req.file) {
      console.error(chalk.red("❌ No file uploaded"));
      return res.status(400).json({ message: "No file uploaded" });
    }

    const results = [];
    const errors = [];

    console.log(chalk.yellow("📤 Starting CSV parsing..."));

    // Convert buffer → string → remove BOM
    const csvString = req.file.buffer.toString("utf8").replace(/^\uFEFF/, "");
    const stream = Readable.from(csvString);

    stream
      .pipe(
        csv({
          mapHeaders: ({ header }) => header.trim().replace(/^\uFEFF/, ""),
        })
      )
      .on("data", (row) => {
        // Clean row values
        Object.keys(row).forEach((key) => {
          if (typeof row[key] === "string") {
            row[key] = row[key].trim().replace(/,$/, "");
          }
        });

        console.debug(chalk.cyan("🧾 Row read:"), row);
        results.push(row);
      })
      .on("end", async () => {
        console.log(
          chalk.green(`✅ CSV parsing done. Total rows: ${results.length}`)
        );

        try {
          // Process each row
          for (const [index, row] of results.entries()) {
            try {
              if (row.role) row.role = row.role.trim().toLowerCase();

              if (row.role === "student") {
                const { name, rollNo, department, section, year, email } = row;

                if (!rollNo || !name || !email)
                  throw new Error("Missing name, rollNo or email");

                const exists = await User.findOne({ rollNo });
                if (exists) throw new Error(`Duplicate rollNo: ${rollNo}`);

                const hashed = await bcrypt.hash(rollNo, 10);

                await User.create({
                  name,
                  rollNo,
                  department,
                  section,
                  year,
                  email,
                  password: hashed,
                  role: "student",
                });

              } else if (row.role === "teacher") {
                const { name, teacherId, department, classTeacher, email } = row;

                if (!teacherId || !name || !email)
                  throw new Error("Missing name, teacherId or email");

                const exists = await User.findOne({ teacherId });
                if (exists) throw new Error(`Duplicate teacherId: ${teacherId}`);

                const hashed = await bcrypt.hash(teacherId, 10);

                await User.create({
                  name,
                  teacherId,
                  department,
                  email,
                  password: hashed,
                  role: "teacher",
                  classTeacher:
                    String(classTeacher).trim().toLowerCase() === "true",
                });

              } else {
                throw new Error(`Unknown role: "${row.role}"`);
              }

            } catch (err) {
              errors.push({ row, error: err.message });
            }
          }

          // SUMMARY INFO
          const successCount = results.length - errors.length;
          const successData = results.slice(0, successCount);

          // Detect department safely
          const department =
            successData[0]?.department ||
            errors[0]?.row?.department ||
            "Unknown";

          console.table({
            total: results.length,
            success: successCount,
            failed: errors.length,
          });

          // Save summary to DB
          await UploadSummary.create({
            department,
            uploadedCount: successCount,
            errorCount: errors.length,
          });

          // Final Response
          return res.status(200).json({
            message: "Bulk upload completed",
            total: results.length,
            success: successCount,
            successData,
            errors,
          });

        } catch (innerErr) {
          console.error("❌ Error in processing rows:", innerErr);
          return res.status(500).json({
            message: "Error processing CSV data",
            error: innerErr.message,
          });
        }
      });
  } catch (error) {
    console.error(chalk.red("❌ Unexpected error:"), error);
    res.status(500).json({ message: error.message });
  }
};
