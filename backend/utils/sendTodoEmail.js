import nodemailer from "nodemailer";
import User from "../models/User.js";

export async function sendTodoEmail(userId, action, title) {
  try {
    // Find the currently logged-in user's email
    const user = await User.findById(userId).select("name email");

    if (!user?.email) {
      console.error("User email not found");
      return;
    }

    if (!process.env.MAIL_USER || !process.env.MAIL_APP_PASSWORD) {
      console.error("Email credentials are missing");
      return;
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"Todo App" <${process.env.MAIL_USER}>`,
      to: user.email,
      subject: `Todo ${action} notification`,
      text: `Hi ${user.name || "there"},

Your Todo "${title}" was ${action}.

Thank you,
Todo App`,
    });

    console.log("Todo email sent to:", user.email);
  } catch (error) {
    console.log("Message ID:", result.messageId);
    console.log("Accepted:", result.accepted);
    console.log("Rejected:", result.rejected);
  }
}
