# Email Integration Setup Guide

## The Problem
With localStorage-only storage, customer submissions on their devices don't automatically reach your computer. Here are the solutions:

## 🎯 **Recommended Solution: Email Integration**

### How It Works:
1. Customer submits form on their phone
2. **Automatic email sent to you** with all their information
3. You receive instant notification of new leads
4. You can manually add them to your admin system

### Setup Steps:

#### 1. Sign Up for EmailJS (Free)
- Go to [EmailJS.com](https://www.emailjs.com/)
- Create free account (500 emails/month free)
- Verify your email address

#### 2. Create Email Service
- Dashboard → Email Services → Add New Service
- Choose "Gmail" (or your email provider)
- Connect your email account
- Note the **Service ID** (e.g., `service_xyz123`)

#### 3. Create Email Template
- Dashboard → Email Templates → Create New Template
- Template Name: "New Customer Quote Request"
- Subject: `New Quote Request from {{customer_name}}`
- Email Body Template:
```
New customer quote request received!

CUSTOMER INFORMATION:
Name: {{customer_name}}
Phone: {{customer_phone}}
Email: {{customer_email}}
Address: {{customer_address}}

SERVICE DETAILS:
Service Type: {{service_type}}
Urgency: {{urgency}}
Description: {{description}}
Budget: {{budget}}
Preferred Date: {{preferred_date}}

CONTACT PREFERENCES:
Preferred Contact Method: {{contact_preference}}
Best Contact Time: {{contact_time}}
How They Found Us: {{heard_about}}

ADDITIONAL NOTES:
{{additional_notes}}

Submitted: {{submission_date}}

---
This was sent automatically from your customer quote form.
```
- Note the **Template ID** (e.g., `template_abc456`)

#### 4. Get Public Key
- Dashboard → Account → General
- Copy your **Public Key** (e.g., `user_def789`)

#### 5. Update Your Code
In `customer-script.js`, replace these lines:
```javascript
// Replace these with your actual EmailJS credentials:
await emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams, 'YOUR_PUBLIC_KEY');
```

With your actual IDs:
```javascript
await emailjs.send('service_xyz123', 'template_abc456', templateParams, 'user_def789');
```

### 📧 **What You'll Receive**
Every time a customer submits the form, you'll get an email like:

```
Subject: New Quote Request from John Smith

New customer quote request received!

CUSTOMER INFORMATION:
Name: John Smith
Phone: (555) 123-4567
Email: john@example.com
Address: 123 Main St, Anytown, ST 12345

SERVICE DETAILS:
Service Type: New Door Installation
Urgency: Within 2-3 weeks
Description: Looking to replace front door with steel door, energy efficient
Budget: $1,000 - $2,500
Preferred Date: 2025-10-15

CONTACT PREFERENCES:
Preferred Contact Method: Phone Call
Best Contact Time: Evening (5pm-8pm)
How They Found Us: Friend/Family Referral

ADDITIONAL NOTES:
Please call after 6pm weekdays

Submitted: 9/26/2025, 2:30:15 PM
```

## 🔄 **Alternative Solutions**

### Option 2: Google Sheets Integration
- Use Google Apps Script to save submissions to a Google Sheet
- You can access the sheet from any device
- More complex setup but gives you a database-like view

### Option 3: Shared Link System
- Generate a unique code for each submission
- Customer gets a link they can share with you
- You can view their submission via the link
- Simpler but requires customer to share the link

### Option 4: QR Code with Pre-filled Admin Form
- QR code links to admin form with customer fields pre-populated
- Customer fills out form on your device during visit
- Data goes directly to your admin system
- Good for in-person consultations

## 🎯 **Recommended Workflow with Email**

1. **Setup EmailJS** (one-time, 15 minutes)
2. **Customer submits form** → You get instant email
3. **Read email** → Get all customer details
4. **Open admin system** → Manually add customer (copy from email)
5. **Follow up** within 24 hours

### Benefits:
- ✅ **Instant notifications** - know immediately when someone requests a quote
- ✅ **All information preserved** - nothing gets lost
- ✅ **Works on any device** - emails sync everywhere
- ✅ **Professional** - automated responses maintain your brand
- ✅ **Free** - EmailJS free tier handles hundreds of submissions

### Limitations:
- Requires manual entry into admin system (but email has all the info)
- Depends on email service (but very reliable)

## 🚀 **Quick Start**

**If you want to get started immediately:**
1. Set up EmailJS (15 minutes)
2. Update the three IDs in customer-script.js
3. Test with a form submission
4. Deploy to GitHub Pages

**Result:** Every customer submission will email you instantly with all their information, and you can manually add them to your admin system when convenient.

Would you like me to help you set up any of these options?