require("dotenv").config(); // 👈 Add this as the FIRST line

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { Parser } = require("json2csv");
const PDFDocument = require("pdfkit");

const {
  connectDB,
  init,
  getUserByEmail,
  getUserById,
  getAllUsers,
  updateUser,
} = require("./db");
const { sign, verifyToken, requireRole } = require("./auth");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 4000;

(async () => {
  // Connect to MongoDB
  await connectDB();

  // Seed admin + employee if collection is empty
  await init();

  // Login endpoint
  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });

    const user = await getUserByEmail(email);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = sign({
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    // Update last login
    user.last_login = new Date();
    await updateUser(user);

    res.json({ token });
  });

  // Get current user
  app.get("/api/me", verifyToken, async (req, res) => {
    const user = await getUserById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      last_login: user.last_login,
    });
  });

  // Admin: list users
  app.get("/api/users", verifyToken, requireRole("admin"), async (req, res) => {
    const users = await getAllUsers();
    const sanitized = users.map((u) => ({
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      last_login: u.last_login,
    }));
    res.json(sanitized);
  });

  // Enhanced CSV Export with better formatting
  app.get(
    "/api/reports/employees.csv",
    verifyToken,
    requireRole("admin"),
    async (req, res) => {
      try {
        const users = await getAllUsers();

        // Enhanced data formatting
        const formattedData = users.map((u) => ({
          "Full Name": u.name,
          "Email Address": u.email,
          Role: u.role.toUpperCase(),
          "Last Login": u.last_login
            ? new Date(u.last_login).toLocaleString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Never",
          "Account Status": u.last_login ? "Active" : "Inactive",
          "Created At": u.createdAt
            ? new Date(u.createdAt).toLocaleDateString("en-US")
            : "N/A",
        }));

        const fields = [
          "Full Name",
          "Email Address",
          "Role",
          "Last Login",
          "Account Status",
          "Created At",
        ];
        const parser = new Parser({ fields });
        const csv = parser.parse(formattedData);

        // Add BOM for Excel compatibility
        const csvWithBOM = "\uFEFF" + csv;

        res.header("Content-Type", "text/csv; charset=utf-8");
        res.attachment(
          `employees_report_${new Date().toISOString().split("T")[0]}.csv`
        );
        res.send(csvWithBOM);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to generate CSV" });
      }
    }
  );

  // Ultra Enhanced PDF Export
  app.get(
    "/api/reports/employees.pdf",
    verifyToken,
    requireRole("admin"),
    async (req, res) => {
      try {
        const users = await getAllUsers();
        const doc = new PDFDocument({
          size: "A4",
          margin: 50,
          bufferPages: true,
        });

        res.header("Content-Type", "application/pdf");
        res.attachment(
          `employees_report_${new Date().toISOString().split("T")[0]}.pdf`
        );
        doc.pipe(res);

        // Colors
        const primaryColor = "#667eea";
        const secondaryColor = "#764ba2";
        const textDark = "#1e293b";
        const textLight = "#64748b";
        const borderColor = "#e2e8f0";

        // Header with gradient effect (simulated with rectangles)
        doc.rect(0, 0, doc.page.width, 120).fill(primaryColor);
        doc
          .rect(0, 0, doc.page.width, 120)
          .fillOpacity(0.1)
          .fill(secondaryColor);

        // Logo/Title Section
        doc
          .fillColor("white")
          .fontSize(32)
          .font("Helvetica-Bold")
          .text("Employee Report", 50, 40);

        doc
          .fontSize(12)
          .font("Helvetica")
          .text("MyApp Platform • Confidential", 50, 75);

        // Report Info Box
        const reportDate = new Date().toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        doc.fontSize(10).text(`Generated: ${reportDate}`, 50, 95);

        // Statistics Box
        const statsY = 140;
        const adminCount = users.filter((u) => u.role === "admin").length;
        const employeeCount = users.filter((u) => u.role === "employee").length;
        const activeCount = users.filter((u) => u.last_login).length;

        // Stats Background
        doc
          .fillColor("#f8fafc")
          .rect(50, statsY, doc.page.width - 100, 80)
          .fill();

        // Stats Border
        doc
          .strokeColor(borderColor)
          .lineWidth(1)
          .rect(50, statsY, doc.page.width - 100, 80)
          .stroke();

        // Stats Title
        doc
          .fillColor(textDark)
          .fontSize(14)
          .font("Helvetica-Bold")
          .text("Quick Statistics", 60, statsY + 15);

        // Stats Grid
        const statStartX = 60;
        const statY = statsY + 40;
        const statSpacing = 130;

        // Total Users
        doc
          .fillColor(primaryColor)
          .fontSize(24)
          .font("Helvetica-Bold")
          .text(users.length.toString(), statStartX, statY);
        doc
          .fillColor(textLight)
          .fontSize(10)
          .font("Helvetica")
          .text("Total Users", statStartX, statY + 28);

        // Admins
        doc
          .fillColor("#f093fb")
          .fontSize(24)
          .font("Helvetica-Bold")
          .text(adminCount.toString(), statStartX + statSpacing, statY);
        doc
          .fillColor(textLight)
          .fontSize(10)
          .font("Helvetica")
          .text("Admins", statStartX + statSpacing, statY + 28);

        // Employees
        doc
          .fillColor("#4facfe")
          .fontSize(24)
          .font("Helvetica-Bold")
          .text(employeeCount.toString(), statStartX + statSpacing * 2, statY);
        doc
          .fillColor(textLight)
          .fontSize(10)
          .font("Helvetica")
          .text("Employees", statStartX + statSpacing * 2, statY + 28);

        // Active Users
        doc
          .fillColor("#10b981")
          .fontSize(24)
          .font("Helvetica-Bold")
          .text(activeCount.toString(), statStartX + statSpacing * 3, statY);
        doc
          .fillColor(textLight)
          .fontSize(10)
          .font("Helvetica")
          .text("Active", statStartX + statSpacing * 3, statY + 28);

        // Employee Directory Title
        let currentY = statsY + 110;
        doc
          .fillColor(textDark)
          .fontSize(16)
          .font("Helvetica-Bold")
          .text("Employee Directory", 50, currentY);

        currentY += 30;

        // Table Header
        const tableTop = currentY;
        const colWidths = {
          name: 140,
          email: 160,
          role: 80,
          status: 70,
          lastLogin: 140,
        };

        // Header Background
        doc
          .fillColor("#f8fafc")
          .rect(50, tableTop, doc.page.width - 100, 25)
          .fill();

        // Header Border
        doc
          .strokeColor(borderColor)
          .lineWidth(1)
          .rect(50, tableTop, doc.page.width - 100, 25)
          .stroke();

        // Header Text
        let colX = 60;
        doc.fillColor(textLight).fontSize(9).font("Helvetica-Bold");

        doc.text("NAME", colX, tableTop + 8);
        colX += colWidths.name;
        doc.text("EMAIL", colX, tableTop + 8);
        colX += colWidths.email;
        doc.text("ROLE", colX, tableTop + 8);
        colX += colWidths.role;
        doc.text("STATUS", colX, tableTop + 8);
        colX += colWidths.status;
        doc.text("LAST LOGIN", colX, tableTop + 8);

        currentY = tableTop + 35;

        // Table Rows
        users.forEach((user, index) => {
          // Check if we need a new page
          if (currentY > doc.page.height - 100) {
            doc.addPage();
            currentY = 50;
          }

          // Alternating row colors
          if (index % 2 === 0) {
            doc
              .fillColor("#ffffff")
              .rect(50, currentY - 5, doc.page.width - 100, 30)
              .fill();
          } else {
            doc
              .fillColor("#f8fafc")
              .rect(50, currentY - 5, doc.page.width - 100, 30)
              .fill();
          }

          // Row Border
          doc
            .strokeColor("#f1f5f9")
            .lineWidth(0.5)
            .moveTo(50, currentY + 25)
            .lineTo(doc.page.width - 50, currentY + 25)
            .stroke();

          colX = 60;

          // Name
          doc
            .fillColor(textDark)
            .fontSize(10)
            .font("Helvetica-Bold")
            .text(user.name, colX, currentY, {
              width: colWidths.name - 10,
              ellipsis: true,
            });

          colX += colWidths.name;

          // Email
          doc
            .fillColor(textLight)
            .fontSize(9)
            .font("Helvetica")
            .text(user.email, colX, currentY, {
              width: colWidths.email - 10,
              ellipsis: true,
            });

          colX += colWidths.email;

          // Role with badge effect
          const roleText = user.role.toUpperCase();
          const roleBgColor = user.role === "admin" ? "#fef3c7" : "#dbeafe";
          const roleTextColor = user.role === "admin" ? "#92400e" : "#1e40af";

          doc
            .fillColor(roleBgColor)
            .roundedRect(colX, currentY - 2, 60, 18, 3)
            .fill();

          doc
            .fillColor(roleTextColor)
            .fontSize(8)
            .font("Helvetica-Bold")
            .text(roleText, colX + 8, currentY + 2);

          colX += colWidths.role;

          // Status badge
          const isActive = user.last_login ? true : false;
          const statusBgColor = isActive ? "#d1fae5" : "#fee2e2";
          const statusTextColor = isActive ? "#065f46" : "#991b1b";
          const statusText = isActive ? "ACTIVE" : "INACTIVE";

          doc
            .fillColor(statusBgColor)
            .roundedRect(colX, currentY - 2, 58, 18, 3)
            .fill();

          doc
            .fillColor(statusTextColor)
            .fontSize(8)
            .font("Helvetica-Bold")
            .text(statusText, colX + 6, currentY + 2);

          colX += colWidths.status;

          // Last Login
          const lastLoginText = user.last_login
            ? new Date(user.last_login).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Never";

          doc
            .fillColor(textLight)
            .fontSize(8)
            .font("Helvetica")
            .text(lastLoginText, colX, currentY);

          currentY += 30;
        });

        // Footer on last page
        const footerY = doc.page.height - 50;
        doc
          .strokeColor(borderColor)
          .lineWidth(1)
          .moveTo(50, footerY)
          .lineTo(doc.page.width - 50, footerY)
          .stroke();

        doc
          .fillColor(textLight)
          .fontSize(8)
          .font("Helvetica")
          .text("MyApp Platform • Employee Report", 50, footerY + 10);

        doc.text(
          `Page ${
            doc.bufferedPageRange().count
          } • Generated on ${new Date().toLocaleString("en-US")}`,
          50,
          footerY + 10,
          { align: "right" }
        );

        // Finalize PDF
        doc.end();
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to generate PDF" });
      }
    }
  );

  // -------------------------------
  app.listen(PORT, () => console.log(`Server started on ${PORT}`));
})();
