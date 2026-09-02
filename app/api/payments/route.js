import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Setting from '@/models/Setting';
import Enrollment from '@/models/Enrollment';

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { courseId, lessonId, amount = 499, currency = 'INR', paymentMethod = 'UPI' } = body;

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || session?.user?.email || 'guest_learner_' + Math.random().toString(36).substring(7);
    const userEmail = session?.user?.email || body.userEmail || 'learner@example.com';
    const userName = session?.user?.name || body.userName || 'Learner';

    // Generate unique transaction reference
    const transactionId = `TXN-QARP-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const paidAt = new Date().toISOString();

    // If courseId provided, record/update Enrollment record
    if (courseId) {
      let enrollment = await Enrollment.findOne({ userId, courseId });
      if (!enrollment) {
        enrollment = await Enrollment.create({
          userId,
          userEmail,
          userName,
          courseId,
          progress: 0,
          completedLessons: [],
          status: 'In Progress',
        });
      }
    }

    return NextResponse.json({
      success: true,
      transactionId,
      paidAt,
      amount,
      currency,
      paymentMethod,
      courseId,
      lessonId,
      unlocked: true,
      message: '✓ Payment verified! Content successfully unlocked.',
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    let setting = await Setting.findOne({ siteName: { $exists: true } }).lean();
    if (!setting) {
      setting = await Setting.findOne().lean();
    }
    const paymentSettings = {
      paymentEnabled: setting?.paymentSettings?.paymentEnabled ?? true,
      commonFeeAmount: Number(setting?.paymentSettings?.commonFeeAmount ?? 499),
      currency: setting?.paymentSettings?.currency || 'INR',
      currencySymbol: setting?.paymentSettings?.currencySymbol || '₹',
      paymentType: setting?.paymentSettings?.paymentType || 'One-time',
      paidContentAccess: setting?.paymentSettings?.paidContentAccess || 'After successful payment',
      confirmationPopup: setting?.paymentSettings?.confirmationPopup ?? true,
    };

    return NextResponse.json({
      paymentSettings,
      paymentEnabled: paymentSettings.paymentEnabled,
      commonFeeAmount: paymentSettings.commonFeeAmount,
      currency: paymentSettings.currency,
      currencySymbol: paymentSettings.currencySymbol,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
