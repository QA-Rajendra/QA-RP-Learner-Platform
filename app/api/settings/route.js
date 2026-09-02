import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Setting from '@/models/Setting';

export const dynamic = 'force-dynamic';

const DEFAULT_PAYMENT_SETTINGS = {
  paymentEnabled: true,
  commonFeeAmount: 499,
  currency: 'INR',
  currencySymbol: '₹',
  paymentType: 'One-time',
  paidContentAccess: 'After successful payment',
  confirmationPopup: true,
};

const DEFAULT_SETTINGS = {
  siteName: 'QA RP Learner Platform',
  tagline: 'Next-Generation Learning Experience with Next.js & MongoDB',
  supportEmail: 'admin@example.com',
  allowRegistration: true,
  defaultRole: 'USER',
  requireEmailVerification: false,
  courseAutoEnroll: true,
  maintenanceMode: false,
  maxUploadSizeMB: 50,
  theme: 'dark',
  enablePublicBrowsing: true,
  allowUserReviews: true,
  paymentSettings: DEFAULT_PAYMENT_SETTINGS,
};

export async function GET() {
  try {
    await connectDB();

    // Find existing setting document or create default
    let setting = await Setting.findOne().lean();

    if (!setting) {
      const created = await Setting.create(DEFAULT_SETTINGS);
      setting = created.toJSON();
    } else {
      const siteName = (!setting.siteName || setting.siteName === 'QARP eLearning Platform') ? 'QA RP Learner Platform' : setting.siteName;
      setting = {
        ...setting,
        _id: setting._id.toString(),
        siteName,
        paymentSettings: setting.paymentSettings ?? DEFAULT_PAYMENT_SETTINGS,
      };
    }

    return NextResponse.json(setting);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '403 Forbidden - Admin access required' }, { status: 403 });
    }

    await connectDB();
    const body = await request.json();

    // Update the correct document (siteName-based)
    let setting = await Setting.findOne({ siteName: { $exists: true } });
    if (!setting) {
      setting = await Setting.create({ ...DEFAULT_SETTINGS, ...body });
    } else {
      Object.assign(setting, body);
      await setting.save();
    }

    return NextResponse.json(setting.toJSON());
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
