// ============================================================
// Lurnexa eBook Rental System — Core Data & Utilities
// ============================================================

// ─── Rental Plan Definitions ─────────────────────────────────

export interface RentalPlan {
  planCode: string;        // '1_month', '3_months', '6_months'
  displayName: string;     // '1 Month', '3 Months', '6 Months'
  durationDays: number;    // 30, 90, 180
  price: number;           // 59, 99, 149
  currency: string;
  perMonthPrice: number;   // Calculated: price / (durationDays / 30)
  savingsPercent: number;  // vs. monthly rate
  badge?: string;          // e.g., 'Best Value', 'Most Popular'
  isActive: boolean;
  sortOrder: number;
}

export const RENTAL_PLANS: RentalPlan[] = [
  {
    planCode: '1_month',
    displayName: '1 Month',
    durationDays: 30,
    price: 59,
    currency: 'INR',
    perMonthPrice: 59,
    savingsPercent: 0,
    isActive: true,
    sortOrder: 1
  },
  {
    planCode: '3_months',
    displayName: '3 Months',
    durationDays: 90,
    price: 99,
    currency: 'INR',
    perMonthPrice: 33,
    savingsPercent: 44,
    badge: 'Most Popular',
    isActive: true,
    sortOrder: 2
  },
  {
    planCode: '6_months',
    displayName: '6 Months',
    durationDays: 180,
    price: 149,
    currency: 'INR',
    perMonthPrice: 24.83,
    savingsPercent: 58,
    badge: 'Best Value',
    isActive: true,
    sortOrder: 3
  }
];

export function getActiveRentalPlans(): RentalPlan[] {
  return RENTAL_PLANS.filter(p => p.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getRentalPlanByCode(planCode: string): RentalPlan | undefined {
  return RENTAL_PLANS.find(p => p.planCode === planCode);
}

// ─── Rental Status ───────────────────────────────────────────

export type RentalStatus = 'pending' | 'active' | 'expired' | 'renewed' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface BookRental {
  id?: number;
  rentalId: string;           // 'RENT_<timestamp>_<random>'
  userEmail: string;
  userPhone?: string;
  userName?: string;
  bookId: string;
  planCode: string;           // '1_month', '3_months', '6_months'

  // Lifecycle
  status: RentalStatus;
  startedAt?: string;         // ISO timestamp — set on activation
  expiresAt?: string;         // ISO timestamp — startedAt + durationDays

  // Payment
  amountPaid: number;
  gstAmount: number;
  totalAmount: number;
  cashfreeOrderId?: string;
  cashfreePaymentId?: string;
  paymentStatus: PaymentStatus;

  // Renewal tracking
  isRenewal: boolean;
  parentRentalId?: string;    // Links to original rental if renewed
  renewalCount: number;

  // Notification tracking
  expiry7dSent: boolean;
  expiry1dSent: boolean;
  expirySent: boolean;

  // Metadata
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RentalSession {
  id?: number;
  rentalId: string;
  sessionToken: string;
  userEmail: string;
  ipAddress?: string;
  userAgent?: string;
  lastActiveAt: string;
  expiresAt: string;
  createdAt: string;
}

// ─── Rental ID Generation ────────────────────────────────────

export function generateRentalId(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `RENT_${timestamp}_${random}`;
}

export function generateSessionToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `rsess_${token}_${Date.now()}`;
}

// ─── Rental Time Calculations ────────────────────────────────

export function calculateExpiryDate(startDate: Date | string, durationDays: number): Date {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const expiry = new Date(start.getTime());
  expiry.setDate(expiry.getDate() + durationDays);
  return expiry;
}

export function isRentalExpired(expiresAt: string | Date): boolean {
  const expiry = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
  return new Date() > expiry;
}

export function isRentalExpiringSoon(expiresAt: string | Date, thresholdDays: number = 7): boolean {
  const expiry = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
  const now = new Date();
  const threshold = new Date(now.getTime() + thresholdDays * 24 * 60 * 60 * 1000);
  return expiry <= threshold && expiry > now;
}

export interface TimeRemaining {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  isExpired: boolean;
  isExpiringSoon: boolean;  // < 7 days
  isUrgent: boolean;        // < 24 hours
  displayText: string;
}

export function getRentalTimeRemaining(expiresAt: string | Date): TimeRemaining {
  const expiry = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
  const now = new Date();
  const totalMs = expiry.getTime() - now.getTime();

  if (totalMs <= 0) {
    const expiredMs = Math.abs(totalMs);
    const expiredDays = Math.floor(expiredMs / (24 * 60 * 60 * 1000));
    return {
      totalMs: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      isExpired: true,
      isExpiringSoon: false,
      isUrgent: false,
      displayText: expiredDays > 0 ? `Expired ${expiredDays} day${expiredDays !== 1 ? 's' : ''} ago` : 'Expired today'
    };
  }

  const days = Math.floor(totalMs / (24 * 60 * 60 * 1000));
  const hours = Math.floor((totalMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((totalMs % (60 * 60 * 1000)) / (60 * 1000));

  let displayText = '';
  if (days > 0) {
    displayText = `${days}d ${hours}h left`;
  } else if (hours > 0) {
    displayText = `${hours}h ${minutes}m left`;
  } else {
    displayText = `${minutes}m left`;
  }

  return {
    totalMs,
    days,
    hours,
    minutes,
    isExpired: false,
    isExpiringSoon: days < 7,
    isUrgent: days === 0,
    displayText
  };
}

// ─── Renewal Calculations ────────────────────────────────────

/**
 * For early renewal (before expiry), the new period extends from the current expiresAt.
 * For late renewal (after expiry), the new period starts from now.
 */
export function calculateRenewalExpiry(
  currentExpiresAt: string | Date | undefined,
  newPlanCode: string
): { newStartDate: Date; newExpiryDate: Date; isEarlyRenewal: boolean } {
  const plan = getRentalPlanByCode(newPlanCode);
  if (!plan) throw new Error(`Invalid plan code: ${newPlanCode}`);

  const now = new Date();
  let isEarlyRenewal = false;
  let newStartDate: Date;

  if (currentExpiresAt) {
    const currentExpiry = typeof currentExpiresAt === 'string' ? new Date(currentExpiresAt) : currentExpiresAt;
    if (currentExpiry > now) {
      // Early renewal: extend from current expiry
      newStartDate = currentExpiry;
      isEarlyRenewal = true;
    } else {
      // Late renewal: start from now
      newStartDate = now;
    }
  } else {
    newStartDate = now;
  }

  const newExpiryDate = calculateExpiryDate(newStartDate, plan.durationDays);

  return { newStartDate, newExpiryDate, isEarlyRenewal };
}

// ─── Pricing Utilities ───────────────────────────────────────

export function getRentalGST(basePrice: number): number {
  return Math.round(basePrice * 0.18);
}

// Same 2% online processing fee applied to soft-copy/physical purchases, computed on
// (base price + GST) — kept as a single source of truth so create/renew/checkout-display
// never drift from each other.
export function getRentalOnlineFee(basePrice: number): number {
  return Math.round((basePrice + getRentalGST(basePrice)) * 0.02);
}

export function getRentalTotal(basePrice: number): number {
  return basePrice + getRentalGST(basePrice) + getRentalOnlineFee(basePrice);
}

export function formatRentalPrice(price: number): string {
  return `₹${price}`;
}

// ─── Status Display Helpers ──────────────────────────────────

export function getRentalStatusColor(status: RentalStatus, expiresAt?: string): string {
  if (status === 'active' && expiresAt) {
    const remaining = getRentalTimeRemaining(expiresAt);
    if (remaining.isUrgent) return 'red';
    if (remaining.isExpiringSoon) return 'amber';
    return 'green';
  }
  switch (status) {
    case 'active': return 'green';
    case 'expired': return 'red';
    case 'renewed': return 'blue';
    case 'pending': return 'gray';
    case 'cancelled': return 'gray';
    default: return 'gray';
  }
}

export function getRentalStatusLabel(status: RentalStatus, expiresAt?: string): string {
  if (status === 'active' && expiresAt) {
    const remaining = getRentalTimeRemaining(expiresAt);
    if (remaining.isUrgent) return 'Expiring Today';
    if (remaining.isExpiringSoon) return 'Expiring Soon';
    return 'Active';
  }
  switch (status) {
    case 'active': return 'Active';
    case 'expired': return 'Expired';
    case 'renewed': return 'Renewed';
    case 'pending': return 'Pending Payment';
    case 'cancelled': return 'Cancelled';
    default: return status;
  }
}

// ─── Email Template Generators ───────────────────────────────

export function generateRentalActivationEmail(rental: BookRental, bookTitle: string): {
  subject: string;
  html: string;
} {
  const expiryDate = rental.expiresAt ? new Date(rental.expiresAt).toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  }) : 'N/A';

  const plan = getRentalPlanByCode(rental.planCode);

  return {
    subject: `✅ Your rental of "${bookTitle}" is now active!`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
        <div style="background: linear-gradient(135deg, #7c3aed, #4f46e5); padding: 32px 24px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">📚 Rental Activated!</h1>
        </div>
        <div style="padding: 32px 24px;">
          <p style="color: #334155; font-size: 16px;">Hi ${rental.userName || 'Reader'},</p>
          <p style="color: #64748b; font-size: 14px; line-height: 1.6;">Your rental has been successfully activated. Here are your details:</p>
          
          <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #e2e8f0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #64748b; font-size: 13px;">Book</td><td style="padding: 8px 0; color: #0f172a; font-weight: 600; font-size: 13px; text-align: right;">${bookTitle}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b; font-size: 13px;">Plan</td><td style="padding: 8px 0; color: #0f172a; font-weight: 600; font-size: 13px; text-align: right;">${plan?.displayName || rental.planCode}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b; font-size: 13px;">Expires On</td><td style="padding: 8px 0; color: #0f172a; font-weight: 600; font-size: 13px; text-align: right;">${expiryDate}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b; font-size: 13px;">Amount Paid</td><td style="padding: 8px 0; color: #0f172a; font-weight: 600; font-size: 13px; text-align: right;">₹${rental.totalAmount}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b; font-size: 13px;">Rental ID</td><td style="padding: 8px 0; color: #0f172a; font-weight: 600; font-size: 13px; text-align: right;">${rental.rentalId}</td></tr>
            </table>
          </div>

          <div style="text-align: center; margin: 24px 0;">
            <a href="https://lurnexa.in/textbooks/library" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #4f46e5); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 700; font-size: 14px;">📖 Go to My Library</a>
          </div>

          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 24px;">You can access your rented book anytime from your library at lurnexa.in</p>
        </div>
        <div style="background: #f8fafc; padding: 16px 24px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #94a3b8; font-size: 11px; margin: 0;">© ${new Date().getFullYear()} Lurnexa Publications. All rights reserved.</p>
        </div>
      </div>
    `
  };
}

export function generateExpiryWarningEmail(rental: BookRental, bookTitle: string, daysRemaining: number): {
  subject: string;
  html: string;
} {
  const urgentPrefix = daysRemaining <= 1 ? '⚠️ ' : '';
  const expiryDate = rental.expiresAt ? new Date(rental.expiresAt).toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  }) : 'N/A';

  return {
    subject: `${urgentPrefix}Your rental of "${bookTitle}" expires in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
        <div style="background: linear-gradient(135deg, ${daysRemaining <= 1 ? '#dc2626, #ef4444' : '#f59e0b, #d97706'}); padding: 32px 24px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">⏰ Rental Expiring ${daysRemaining <= 1 ? 'Tomorrow!' : 'Soon'}</h1>
        </div>
        <div style="padding: 32px 24px;">
          <p style="color: #334155; font-size: 16px;">Hi ${rental.userName || 'Reader'},</p>
          <p style="color: #64748b; font-size: 14px; line-height: 1.6;">Your rental of <strong>"${bookTitle}"</strong> will expire on <strong>${expiryDate}</strong>.</p>
          <p style="color: #64748b; font-size: 14px; line-height: 1.6;">Renew now to continue reading without interruption. If you renew before expiry, your remaining time will roll over!</p>
          
          <div style="text-align: center; margin: 24px 0;">
            <a href="https://lurnexa.in/textbooks/library" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #4f46e5); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 700; font-size: 14px;">🔄 Renew Now</a>
          </div>

          <div style="background: #fefce8; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="color: #92400e; font-size: 13px; margin: 0;"><strong>What happens after expiry?</strong><br/>You'll lose access to the book's content. You can always renew or purchase a permanent digital copy from our store.</p>
          </div>
        </div>
        <div style="background: #f8fafc; padding: 16px 24px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #94a3b8; font-size: 11px; margin: 0;">© ${new Date().getFullYear()} Lurnexa Publications. All rights reserved.</p>
        </div>
      </div>
    `
  };
}

export function generateRentalExpiredEmail(rental: BookRental, bookTitle: string): {
  subject: string;
  html: string;
} {
  return {
    subject: `Your rental of "${bookTitle}" has expired`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
        <div style="background: linear-gradient(135deg, #64748b, #475569); padding: 32px 24px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">📕 Rental Expired</h1>
        </div>
        <div style="padding: 32px 24px;">
          <p style="color: #334155; font-size: 16px;">Hi ${rental.userName || 'Reader'},</p>
          <p style="color: #64748b; font-size: 14px; line-height: 1.6;">Your rental of <strong>"${bookTitle}"</strong> has expired. You no longer have access to this book's content.</p>
          
          <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #e2e8f0;">
            <h3 style="color: #0f172a; font-size: 15px; margin: 0 0 12px;">Options to continue reading:</h3>
            <ul style="color: #64748b; font-size: 13px; line-height: 1.8; padding-left: 20px; margin: 0;">
              <li><strong>Renew</strong> your rental starting at just ₹59/month</li>
              <li><strong>Buy a permanent digital copy</strong> for lifetime access</li>
              <li><strong>Buy a paperback</strong> for a physical copy delivered to you</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 24px 0; display: flex; gap: 12px; justify-content: center;">
            <a href="https://lurnexa.in/textbooks/library" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #4f46e5); color: white; text-decoration: none; padding: 14px 24px; border-radius: 8px; font-weight: 700; font-size: 14px;">🔄 Renew Rental</a>
            <a href="https://lurnexa.in/textbooks/store" style="display: inline-block; background: #0f172a; color: white; text-decoration: none; padding: 14px 24px; border-radius: 8px; font-weight: 700; font-size: 14px;">🛒 Visit Store</a>
          </div>
        </div>
        <div style="background: #f8fafc; padding: 16px 24px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #94a3b8; font-size: 11px; margin: 0;">© ${new Date().getFullYear()} Lurnexa Publications. All rights reserved.</p>
        </div>
      </div>
    `
  };
}

export function generateRenewalConfirmationEmail(rental: BookRental, bookTitle: string): {
  subject: string;
  html: string;
} {
  const newExpiryDate = rental.expiresAt ? new Date(rental.expiresAt).toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  }) : 'N/A';

  const plan = getRentalPlanByCode(rental.planCode);

  return {
    subject: `✅ Your rental has been renewed! "${bookTitle}"`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
        <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 32px 24px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🔄 Rental Renewed!</h1>
        </div>
        <div style="padding: 32px 24px;">
          <p style="color: #334155; font-size: 16px;">Hi ${rental.userName || 'Reader'},</p>
          <p style="color: #64748b; font-size: 14px; line-height: 1.6;">Your rental has been successfully renewed! Here are the updated details:</p>
          
          <div style="background: #f0fdf4; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #bbf7d0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #64748b; font-size: 13px;">Book</td><td style="padding: 8px 0; color: #0f172a; font-weight: 600; font-size: 13px; text-align: right;">${bookTitle}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b; font-size: 13px;">New Plan</td><td style="padding: 8px 0; color: #0f172a; font-weight: 600; font-size: 13px; text-align: right;">${plan?.displayName || rental.planCode}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b; font-size: 13px;">New Expiry</td><td style="padding: 8px 0; color: #059669; font-weight: 700; font-size: 13px; text-align: right;">${newExpiryDate}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b; font-size: 13px;">Amount Paid</td><td style="padding: 8px 0; color: #0f172a; font-weight: 600; font-size: 13px; text-align: right;">₹${rental.totalAmount}</td></tr>
            </table>
          </div>

          <div style="text-align: center; margin: 24px 0;">
            <a href="https://lurnexa.in/textbooks/library" style="display: inline-block; background: linear-gradient(135deg, #059669, #10b981); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 700; font-size: 14px;">📖 Continue Reading</a>
          </div>
        </div>
        <div style="background: #f8fafc; padding: 16px 24px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #94a3b8; font-size: 11px; margin: 0;">© ${new Date().getFullYear()} Lurnexa Publications. All rights reserved.</p>
        </div>
      </div>
    `
  };
}
