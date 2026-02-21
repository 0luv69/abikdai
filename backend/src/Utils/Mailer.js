import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_ADDR,
    pass: process.env.GMAIL_PASS,
  },
});

export const sendPickupCompletedEmail = async (userEmail, userName, pickup) => {
  if (!process.env.GMAIL_ADDR || !process.env.GMAIL_PASS) return;

  const date = new Date(pickup.scheduledDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const html = `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; background: #f9fafb; border-radius: 12px; overflow: hidden;">
      <div style="background: #16a34a; padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 22px;">🌿 EcoCollect</h1>
      </div>
      <div style="padding: 28px;">
        <h2 style="color: #166534; margin: 0 0 12px;">Pickup Completed! ✅</h2>
        <p style="color: #374151; line-height: 1.6;">Hi <strong>${userName}</strong>,</p>
        <p style="color: #374151; line-height: 1.6;">Your waste pickup has been successfully completed. Here are the details:</p>
        <div style="background: white; border-radius: 8px; padding: 16px; margin: 16px 0; border: 1px solid #e5e7eb;">
          <p style="margin: 6px 0; color: #374151;"><strong>Waste Type:</strong> ${pickup.wasteType}</p>
          <p style="margin: 6px 0; color: #374151;"><strong>Date:</strong> ${date}</p>
          ${pickup.address ? `<p style="margin: 6px 0; color: #374151;"><strong>Address:</strong> ${pickup.address}</p>` : ""}
        </div>
        <p style="color: #374151; line-height: 1.6;">Thank you for contributing to a cleaner environment! 🌍</p>
      </div>
      <div style="background: #f3f4f6; padding: 16px; text-align: center;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">EcoCollect — Smart Waste Management</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"EcoCollect" <${process.env.GMAIL_ADDR}>`,
      to: userEmail,
      subject: " Your Waste Pickup is Completed — EcoCollect",
      html,
    });
  } catch (err) {
    console.error("Email send failed:", err.message);
  }
};
