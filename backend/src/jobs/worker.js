const { Worker } = require('bullmq');
const { connection } = require('./queue');
const prisma = require('../prisma');
const { sendEmail, sendSms } = require('../utils/notifications');

const worker = new Worker(
  'notifications',
  async job => {
    if (job.name === 'bookingConfirmation') {
      const bookingId = job.data.bookingId;
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { user: true, zone: true }
      });

      if (!booking || !booking.user) return;

      const subject = `Hive Booking Confirmed`;
      const body = `Hi ${booking.user.name}, your booking for ${booking.zone.name} on ${booking.date.toDateString()} at ${booking.startTime} is confirmed.`;

      await sendEmail(booking.user.email || null, subject, body);
      await sendSms(booking.user.phone, body);
    }

    if (job.name === 'reminder') {
      const bookingId = job.data.bookingId;
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { user: true, zone: true }
      });

      if (!booking || !booking.user || booking.reminderSent) return;

      const body = `Reminder: your Hive booking for ${booking.zone.name} at ${booking.startTime} is in 1 hour.`;
      await sendEmail(booking.user.email || null, 'Booking reminder', body);
      await sendSms(booking.user.phone, body);

      await prisma.booking.update({
        where: { id: bookingId },
        data: { reminderSent: true }
      });
    }
  },
  { connection }
);

worker.on('completed', job => console.log('Job completed', job.id));
worker.on('failed', (job, err) => console.error('Job failed', job?.id, err));
