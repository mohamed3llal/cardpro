import nodemailer from "nodemailer";
import { logger } from "@config/logger";

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configure email transporter (use environment variables in production)
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  /**
   * Send a generic email
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const info = await this.transporter.sendMail({
        from: process.env.SMTP_FROM || '"CardPro" <noreply@cardpro.com>',
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });

      logger.info(`✅ Email sent: ${info.messageId}`);
      return true;
    } catch (error) {
      logger.error("❌ Failed to send email:", error);
      return false;
    }
  }

  /**
   * Send subscription confirmation email
   */
  async sendSubscriptionConfirmation(
    email: string,
    userName: string,
    packageName: string,
    packagePrice: number
  ): Promise<boolean> {
    const subject = `Welcome to ${packageName}!`;
    const html = `
      <h1>Subscription Confirmed</h1>
      <p>Hi ${userName},</p>
      <p>Thank you for subscribing to the <strong>${packageName}</strong>!</p>
      <p>Your subscription details:</p>
      <ul>
        <li>Plan: ${packageName}</li>
        <li>Price: $${packagePrice}/month</li>
        <li>Status: Active</li>
      </ul>
      <p>You can now enjoy all the features of your plan.</p>
      <p>Best regards,<br>The CardPro Team</p>
    `;

    return this.sendEmail({ to: email, subject, html });
  }

  /**
   * Send subscription renewal reminder
   */
  async sendRenewalReminder(
    email: string,
    userName: string,
    packageName: string,
    daysUntilRenewal: number
  ): Promise<boolean> {
    const subject = `Your ${packageName} subscription renews in ${daysUntilRenewal} days`;
    const html = `
      <h1>Subscription Renewal Reminder</h1>
      <p>Hi ${userName},</p>
      <p>This is a reminder that your <strong>${packageName}</strong> subscription will renew in <strong>${daysUntilRenewal} days</strong>.</p>
      <p>If you have any questions or want to make changes to your subscription, please visit your account settings.</p>
      <p>Best regards,<br>The CardPro Team</p>
    `;

    return this.sendEmail({ to: email, subject, html });
  }

  /**
   * Send subscription expiration notice
   */
  async sendExpirationNotice(
    email: string,
    userName: string,
    packageName: string
  ): Promise<boolean> {
    const subject = `Your ${packageName} subscription has expired`;
    const html = `
      <h1>Subscription Expired</h1>
      <p>Hi ${userName},</p>
      <p>Your <strong>${packageName}</strong> subscription has expired.</p>
      <p>To continue enjoying premium features, please renew your subscription.</p>
      <p>Best regards,<br>The CardPro Team</p>
    `;

    return this.sendEmail({ to: email, subject, html });
  }

  /**
   * Send limit warning email
   */
  async sendLimitWarning(
    email: string,
    userName: string,
    limitType: "cards" | "boosts",
    current: number,
    max: number
  ): Promise<boolean> {
    const subject = `You're approaching your ${limitType} limit`;
    const html = `
      <h1>Usage Limit Warning</h1>
      <p>Hi ${userName},</p>
      <p>You're approaching your ${limitType} limit:</p>
      <ul>
        <li>Current usage: ${current}</li>
        <li>Maximum allowed: ${max}</li>
      </ul>
      <p>Consider upgrading your plan to increase your limits.</p>
      <p>Best regards,<br>The CardPro Team</p>
    `;

    return this.sendEmail({ to: email, subject, html });
  }

  /**
   * Send upgrade offer email
   */
  async sendUpgradeOffer(
    email: string,
    userName: string,
    currentPlan: string,
    suggestedPlan: string
  ): Promise<boolean> {
    const subject = `Upgrade to ${suggestedPlan} for more features!`;
    const html = `
      <h1>Upgrade Your Plan</h1>
      <p>Hi ${userName},</p>
      <p>You're currently on the <strong>${currentPlan}</strong>.</p>
      <p>Upgrade to <strong>${suggestedPlan}</strong> to unlock:</p>
      <ul>
        <li>More cards</li>
        <li>Additional boosts</li>
        <li>Priority support</li>
        <li>Advanced analytics</li>
      </ul>
      <p>Visit your account to upgrade today!</p>
      <p>Best regards,<br>The CardPro Team</p>
    `;

    return this.sendEmail({ to: email, subject, html });
  }

  /**
   * Send cancellation confirmation
   */
  async sendCancellationConfirmation(
    email: string,
    userName: string,
    packageName: string,
    endDate: Date
  ): Promise<boolean> {
    const subject = `Your ${packageName} subscription has been cancelled`;
    const html = `
      <h1>Subscription Cancelled</h1>
      <p>Hi ${userName},</p>
      <p>Your <strong>${packageName}</strong> subscription has been cancelled.</p>
      <p>You'll continue to have access until <strong>${endDate.toLocaleDateString()}</strong>.</p>
      <p>We're sorry to see you go! If you change your mind, you can resubscribe anytime.</p>
      <p>Best regards,<br>The CardPro Team</p>
    `;

    return this.sendEmail({ to: email, subject, html });
  }
}
