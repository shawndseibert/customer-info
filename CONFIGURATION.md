# 📋 Configuration Quick Reference

## 🔧 **What You Need to Configure:**

### 1. Google Sheets Integration
**File:** `customer-script.js` (line ~289)
```javascript
const response = await fetch('YOUR_GOOGLE_SCRIPT_URL', {
```
**Replace with:** Your Google Apps Script Web App URL from Step 3 of GOOGLE-SHEETS-SETUP.md

### 2. EmailJS Integration  
**File:** `customer-script.js` (lines ~307, ~336, ~654)

**A) Your Email Address (line ~307):**
```javascript
to_email: 'YOUR_EMAIL@gmail.com', // Replace with your email
```

**B) EmailJS Credentials (line ~336):**
```javascript
const response = await emailjs.send(
    'YOUR_SERVICE_ID',    // Your EmailJS service ID
    'YOUR_TEMPLATE_ID',   // Your EmailJS template ID
    emailData,
    'YOUR_PUBLIC_KEY'     // Your EmailJS public key
);
```

**C) EmailJS Initialization (line ~654):**
```javascript
emailjs.init('YOUR_PUBLIC_KEY'); // Replace with your actual public key
```

## 📝 **Step-by-Step:**

### Complete Google Sheets Setup First:
1. Follow GOOGLE-SHEETS-SETUP.md
2. Get your Google Apps Script URL
3. Update `customer-script.js` line ~289

### Then Complete EmailJS Setup:
1. Follow EMAILJS-SETUP.md  
2. Get Service ID, Template ID, and Public Key
3. Update `customer-script.js` lines ~307, ~336, ~654
4. Update your email address

## ✅ **Final Configuration Example:**

```javascript
// Line ~289 - Google Sheets URL
const response = await fetch('https://script.google.com/macros/s/AKfycbz.../exec', {

// Line ~307 - Your email  
to_email: 'john@example.com',

// Line ~336 - EmailJS credentials
const response = await emailjs.send(
    'service_abc123',
    'template_xyz789', 
    emailData,
    'user_def456'
);

// Line ~654 - EmailJS init
emailjs.init('user_def456');
```

## 🚀 **After Configuration:**

1. **Test the form** - submit a quote request
2. **Check Google Sheets** - data should appear
3. **Check your email** - notification should arrive  
4. **Both should work simultaneously!**

## 🔍 **Troubleshooting:**

- **Google Sheets not working?** Check the Web App URL
- **Email not sending?** Verify EmailJS credentials
- **Both failing?** Check browser console for errors

Your customer form will now:
- ✅ Save all data to Google Sheets (organized records)
- ✅ Send you instant email notifications
- ✅ Keep local backup in browser
- ✅ Work on mobile devices perfectly