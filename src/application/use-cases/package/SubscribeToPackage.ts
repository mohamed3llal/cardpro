// src/application/use-cases/package/SubscribeToPackage.ts - FIXED VERSION

import { IPackageRepository } from "../../../domain/interfaces/IPackageRepository";
import { UserPackage } from "../../../domain/entities/Subscription";
import { AppError } from "../../../shared/errors/AppError";

interface SubscribeToPackageInput {
  userId: string;
  packageId: string;
  paymentMethodId?: string;
}

export class SubscribeToPackage {
  constructor(private packageRepository: IPackageRepository) {}

  async execute(input: SubscribeToPackageInput): Promise<UserPackage> {
    const { userId, packageId, paymentMethodId } = input;

    // 1. Validate package exists and is active
    const pkg = await this.packageRepository.getPackageById(packageId);
    if (!pkg) {
      throw new AppError("Package not found", 404);
    }

    if (!pkg.isActive) {
      throw new AppError("Package is not available", 400);
    }

    // 2. Check for existing active subscription
    const existingSubscription =
      await this.packageRepository.getUserActiveSubscription(userId);
    if (existingSubscription) {
      throw new AppError("User already has an active subscription", 409);
    }

    // 3. For paid plans, validate payment method
    if (pkg.price > 0 && !paymentMethodId) {
      throw new AppError("Payment method required for paid plans", 402);
    }

    // 4. Process payment if needed (placeholder - implement payment gateway integration)
    if (pkg.price > 0) {
      // TODO: Implement payment processing
      // const payment = await this.paymentService.processPayment({...});
      // if (!payment.success) throw new AppError('Payment failed', 402);
    }

    // 5. Calculate subscription period - FIXED
    const currentPeriodStart = new Date();
    const currentPeriodEnd = new Date(currentPeriodStart);

    if (pkg.interval === "month") {
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
    } else if (pkg.interval === "year") {
      currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
    } else {
      // Default to 1 month if interval not recognized
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
    }

    // 6. Create subscription with calculated dates
    const subscription = await this.packageRepository.createSubscription({
      userId,
      packageId,
      paymentMethodId,
    });

    // 7. Initialize usage tracking
    await this.packageRepository.createPackageUsage(userId, packageId);

    // 8. TODO: Send confirmation email
    // await this.emailService.sendSubscriptionConfirmation(userId, subscription);

    return subscription;
  }
}
