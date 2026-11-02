import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { jsPDF } from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    // Support both direct invocation and entity automation payload
    const booking_id = body.booking_id || body.event?.entity_id || body.data?.id;

    if (!booking_id) {
      return Response.json({ error: 'booking_id is required' }, { status: 400 });
    }

    const bookings = await base44.asServiceRole.entities.BookingRequest.filter({ id: booking_id });
    const booking = bookings[0];

    if (!booking) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Generate PDF invoice
    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(30, 80, 50);
    doc.rect(0, 0, pageW, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('CookConnect', 20, 20);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Private Chef Service Invoice', 20, 32);

    // Invoice meta
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(10);
    const invoiceDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    doc.text(`Invoice Date: ${invoiceDate}`, 20, 55);
    doc.text(`Booking ID: ${booking.id}`, 20, 63);
    doc.text(`Status: PAID`, pageW - 20, 55, { align: 'right' });

    // Divider
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 70, pageW - 20, 70);

    // Customer & Cook info
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Billed To', 20, 82);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(booking.customer_name || booking.customer_email, 20, 90);
    doc.text(booking.customer_email, 20, 97);
    if (booking.customer_address) doc.text(booking.customer_address, 20, 104);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Service Provider', pageW / 2 + 10, 82);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(booking.cook_email, pageW / 2 + 10, 90);

    // Divider
    doc.line(20, 115, pageW - 20, 115);

    // Event details
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Event Details', 20, 126);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Date: ${booking.requested_date} at ${booking.requested_time || 'TBC'}`, 20, 135);
    doc.text(`Guests: ${booking.number_of_people || 'N/A'}`, 20, 143);
    doc.text(`Location: ${booking.customer_address || 'N/A'}`, 20, 151);

    // Dishes table
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Dishes', 20, 167);

    let y = 175;
    doc.setFillColor(245, 245, 245);
    doc.rect(20, y - 5, pageW - 40, 10, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Dish', 25, y + 1);
    doc.text('Servings', pageW - 60, y + 1);
    doc.text('Notes', pageW / 2, y + 1);
    y += 10;

    doc.setFont('helvetica', 'normal');
    (booking.dishes || []).forEach((dish) => {
      doc.text(dish.name || '', 25, y);
      doc.text(String(dish.servings || ''), pageW - 60, y);
      doc.text(dish.notes || '', pageW / 2, y);
      y += 9;
    });

    // Total
    doc.line(20, y + 5, pageW - 20, y + 5);
    y += 15;
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Total Paid', 20, y);
    doc.setTextColor(30, 80, 50);
    doc.text(`$${(booking.final_price || booking.quoted_price || 0).toFixed(2)}`, pageW - 20, y, { align: 'right' });

    // Special requests
    if (booking.special_requests) {
      y += 18;
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.text(`Special requests: ${booking.special_requests}`, 20, y);
    }

    // Footer
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Thank you for using CookConnect! We hope you enjoyed your private chef experience.', pageW / 2, 280, { align: 'center' });

    const pdfBase64 = doc.output('datauristring').split(',')[1];

    // Send email with invoice
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: booking.customer_email,
      subject: `Your CookConnect Invoice — Booking on ${booking.requested_date}`,
      body: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #1e5032; padding: 24px; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">CookConnect</h1>
    <p style="color: rgba(255,255,255,0.7); margin: 6px 0 0;">Private Chef Service — Invoice</p>
  </div>
  <div style="background: #f9f9f9; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #e5e5e5;">
    <p style="color: #333;">Hi ${booking.customer_name || 'there'},</p>
    <p style="color: #555;">Thank you for booking with CookConnect! Your payment has been confirmed and your invoice is attached to this email.</p>
    <div style="background: white; border: 1px solid #e5e5e5; border-radius: 8px; padding: 16px; margin: 20px 0;">
      <p style="margin: 0 0 8px; color: #333;"><strong>Date:</strong> ${booking.requested_date} at ${booking.requested_time || 'TBC'}</p>
      <p style="margin: 0 0 8px; color: #333;"><strong>Guests:</strong> ${booking.number_of_people || 'N/A'}</p>
      <p style="margin: 0 0 8px; color: #333;"><strong>Location:</strong> ${booking.customer_address || 'N/A'}</p>
      <p style="margin: 0; color: #1e5032; font-size: 18px; font-weight: bold;">Total Paid: $${(booking.final_price || booking.quoted_price || 0).toFixed(2)}</p>
    </div>
    <p style="color: #888; font-size: 13px;">We hope you enjoy your private chef experience!</p>
    <p style="color: #888; font-size: 13px;">— The CookConnect Team</p>
  </div>
</div>
      `,
    });

    return Response.json({ success: true, message: 'Invoice sent successfully' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});