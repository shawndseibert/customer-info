# EmailJS Setup Guide

## 🚀 **Instant Email Notifications Setup**

Get real-time email alerts whenever a customer submits a quote request through your QR code form!

## 📧 **What You'll Get:**

- **Instant notifications** when customers submit forms
- **Detailed customer info** in every email
- **Mobile-friendly** - receive emails anywhere
- **Professional appearance** with branded templates
- **Free service** for up to 200 emails/month

## ⚡ **Setup Steps (15 minutes):**

### Step 1: Create EmailJS Account

1. **Go to [EmailJS.com](https://www.emailjs.com/)**
2. **Click "Sign Up"** (it's free!)
3. **Use your Gmail account** or create new credentials
4. **Verify your email address**

### Step 2: Add Email Service

1. **In your EmailJS dashboard, click "Email Services"**
2. **Click "Add New Service"**
3. **Choose "Gmail"** (recommended) or your preferred email provider
4. **Connect your email account:**
   - Click "Connect Account"
   - Log in with your Gmail
   - Grant permissions
5. **Service ID will be auto-generated** - **COPY THIS!** (looks like: `service_abc123`)

### Step 3: Create Email Template

1. **Click "Email Templates"** in the sidebar
2. **Click "Create New Template"**
3. **Template Settings:**
   - **Template Name:** "New Customer Quote Request"
   - **Template ID:** Copy this! (looks like: `template_xyz789`)

4. **Subject Line:**
   ```
   🚨 NEW QUOTE REQUEST from {{customer_name}}
   ```

5. **Email Content (copy/paste this):**
   ```html
   <h2>🎯 New Customer Quote Request!</h2>
   
   <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
       <h3>📋 CUSTOMER DETAILS:</h3>
       <p><strong>Name:</strong> {{customer_name}}</p>
       <p><strong>Phone:</strong> {{customer_phone}}</p>
       <p><strong>Email:</strong> {{customer_email}}</p>
       <p><strong>Address:</strong> {{customer_address}}</p>
   </div>
   
   <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
       <h3>🔧 SERVICE REQUEST:</h3>
       <p><strong>Service Type:</strong> {{service_type}}</p>
       <p><strong>Urgency:</strong> {{urgency}}</p>
       <p><strong>Budget Range:</strong> {{budget}}</p>
       <p><strong>Preferred Date:</strong> {{preferred_date}}</p>
   </div>
   
   <div style="background: #f0f8f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
       <h3>📝 PROJECT DETAILS:</h3>
       <p><strong>Description:</strong><br>{{description}}</p>
       <p><strong>Additional Notes:</strong><br>{{additional_notes}}</p>
   </div>
   
   <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
       <h3>📞 CONTACT PREFERENCES:</h3>
       <p><strong>Preferred Contact:</strong> {{contact_preference}}</p>
       <p><strong>Best Time to Call:</strong> {{contact_time}}</p>
       <p><strong>How They Found Us:</strong> {{heard_about}}</p>
   </div>
   
   <div style="background: #e6e6e6; padding: 15px; border-radius: 8px; margin: 20px 0;">
       <p><strong>📅 Submitted:</strong> {{submission_time}}</p>
       <p><strong>📱 Source:</strong> {{form_source}}</p>
   </div>
   
   <hr style="margin: 30px 0;">
   
   <h3>🎯 NEXT STEPS:</h3>
   <ol>
       <li>📞 <strong>Call customer within 2 hours</strong> (if urgent) or 24 hours</li>
       <li>📋 <strong>Update status</strong> in your Google Sheet</li>
       <li>📝 <strong>Create quote</strong> based on their requirements</li>
       <li>📅 <strong>Schedule site visit</strong> if needed</li>
   </ol>
   
   <p style="color: #666; font-size: 12px; margin-top: 30px;">
       This email was automatically generated from your customer quote form.
   </p>
   ```

6. **Click "Save"** - Your template is ready!

### Step 4: Get Your Public Key

1. **Click "Account"** in the sidebar
2. **Find "Public Key"** section
3. **Copy your public key** (looks like: `abc123DEF456`)

### Step 5: Update Your Customer Form

Now you have 3 pieces of information:
- **Service ID:** `service_abc123`
- **Template ID:** `template_xyz789` 
- **Public Key:** `abc123DEF456`

1. **Open `customer-script.js`**
2. **Find these lines:**
   ```javascript
   // Replace these with your actual EmailJS credentials
   const response = await emailjs.send(
       'YOUR_SERVICE_ID',    // Your EmailJS service ID
       'YOUR_TEMPLATE_ID',   // Your EmailJS template ID
       emailData,
       'YOUR_PUBLIC_KEY'     // Your EmailJS public key
   );
   ```

3. **Replace with your actual values:**
   ```javascript
   // Replace these with your actual EmailJS credentials
   const response = await emailjs.send(
       'service_abc123',    // Your actual service ID
       'template_xyz789',   // Your actual template ID
       emailData,
       'abc123DEF456'       // Your actual public key
   );
   ```

4. **Also update your email address:**
   ```javascript
   to_email: 'your-actual-email@gmail.com', // Replace with your email
   ```

### Step 6: Test the Integration

1. **Deploy your site** to GitHub Pages
2. **Open customer.html** on your phone
3. **Fill out a test quote** request
4. **Check your email** - you should receive the notification instantly!

## 📱 **Your Complete Workflow:**

1. **Customer scans QR code** → Opens form
2. **Customer submits quote** → Triggers both:
   - 📊 **Data saved to Google Sheets** (for organization)
   - 📧 **Email sent to you instantly** (for immediate action)
3. **You get email notification** on your phone
4. **You can respond immediately** or check Google Sheets for details
5. **Update status in Google Sheets** as you progress

## 🎯 **Email Features:**

### Professional Layout:
- **Color-coded sections** for easy scanning
- **All customer details** in one place
- **Action items** clearly listed
- **Mobile-friendly** formatting

### Smart Information:
- **Urgency highlighted** for priority leads
- **Budget range** for quote preparation
- **Contact preferences** for best response method
- **Referral source** for marketing insights

## 💡 **Pro Tips:**

### Email Management:
- **Create Gmail filter** for quote emails
- **Auto-label** as "New Leads" 
- **Set up mobile notifications** for instant alerts
- **Use Gmail templates** for quick responses

### Response Strategy:
- **Call within 2 hours** for urgent requests
- **Email within 4 hours** for non-urgent
- **Always update Google Sheet** after contact
- **Send follow-up** if no initial response

### Template Customization:
- **Add your logo** to email template
- **Include your contact info** in signature
- **Adjust colors** to match your branding
- **Add emergency contact** for urgent requests

## 🔧 **Troubleshooting:**

### Common Issues:

**❌ Emails not sending?**
- Check service ID, template ID, and public key
- Verify Gmail account is connected
- Check EmailJS dashboard for errors

**❌ Wrong email format?**
- Review template variables in EmailJS dashboard
- Ensure all {{variable}} names match exactly

**❌ Emails going to spam?**
- Add your EmailJS sender to contacts
- Check Gmail's spam folder
- Use more professional subject line

### Testing Tips:
- **Test from different devices** (phone, tablet)
- **Try different browsers** 
- **Check EmailJS usage dashboard** for send status
- **Monitor both email AND Google Sheets** 

## 📊 **Free Plan Limits:**

EmailJS Free Plan includes:
- **200 emails/month** (perfect for most small businesses)
- **2 email services** (Gmail + backup)
- **Unlimited templates**
- **Analytics dashboard**

If you need more, paid plans start at $15/month.

## 🎉 **Final Result:**

Every customer quote request now triggers:

1. **📊 Google Sheets entry** - All leads organized in one place
2. **📧 Instant email** - Get notified immediately on your phone
3. **💾 Local backup** - Data saved in browser as backup

You'll never miss a lead again!

## 🔗 **Quick Links:**

- **EmailJS Dashboard:** [emailjs.com/docs](https://www.emailjs.com/docs/)
- **Gmail Filters:** [Gmail Settings > Filters](https://mail.google.com/mail/u/0/#settings/filters)
- **Mobile Notifications:** Gmail App Settings > Notifications

## ✅ **Setup Checklist:**

- [ ] Create EmailJS account
- [ ] Connect Gmail service and copy Service ID
- [ ] Create email template and copy Template ID
- [ ] Copy Public Key from Account settings
- [ ] Update customer-script.js with your IDs
- [ ] Update your email address in the script
- [ ] Test form submission and check email
- [ ] Set up Gmail filters and mobile notifications

**Result:** Instant professional email notifications + organized Google Sheets = Perfect lead management system!

Need help with any of these steps?