# Google Sheets Integration Setup

## 🎯 **Perfect for Your Workflow!**

This setup automatically saves all customer quote requests directly to a Google Sheet that you can access from anywhere.

## 📊 **What You'll Get:**

A Google Sheet with columns for:
- Submission Date/Time
- Customer Name & Contact Info
- Service Details & Requirements
- Budget & Timeline
- Contact Preferences
- Status (New Lead, Contacted, Quoted, etc.)
- Source (QR Code Form)

## 🚀 **Setup Steps (20 minutes):**

### Step 1: Create Your Google Sheet

1. **Go to [Google Sheets](https://sheets.google.com)**
2. **Create a new blank spreadsheet**
3. **Name it:** "Customer Quote Requests" or similar
4. **Set up column headers** in Row 1:

| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Timestamp | First Name | Last Name | Phone | Email | Address | Service Type | Urgency | Description | Budget | Preferred Date | Contact Method | Contact Time | How Found Us | Notes | Status |

### Step 2: Create Google Apps Script

1. **In your Google Sheet, click Extensions → Apps Script**
2. **Delete the default code** and paste this:

```javascript
function doPost(e) {
  try {
    // Get the active spreadsheet
    const sheet = SpreadsheetApp.getActiveSheet();
    
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);
    
    // Create row data in the same order as your headers
    const rowData = [
      data.timestamp,
      data.firstName,
      data.lastName,
      data.phone,
      data.email,
      data.address,
      data.serviceType,
      data.urgency,
      data.description,
      data.budget,
      data.preferredDate,
      data.contactPreference,
      data.contactTime,
      data.heardAbout,
      data.additionalNotes,
      data.status
    ];
    
    // Add the data to the sheet
    sheet.appendRow(rowData);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Data saved successfully'
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

3. **Save the script** (Ctrl+S or File → Save)
4. **Name your project:** "Customer Form Integration"

### Step 3: Deploy as Web App

1. **Click the "Deploy" button** (top right)
2. **Choose "New deployment"**
3. **Settings:**
   - Type: "Web app"
   - Description: "Customer quote form integration"
   - Execute as: "Me"
   - Who has access: "Anyone" (this allows your form to submit data)
4. **Click "Deploy"**
5. **Copy the Web App URL** (looks like: `https://script.google.com/macros/s/ABC123.../exec`)

### Step 4: Update Your Customer Form

1. **Open `customer-script.js`**
2. **Find this line:**
   ```javascript
   const response = await fetch('YOUR_GOOGLE_SCRIPT_URL', {
   ```
3. **Replace `'YOUR_GOOGLE_SCRIPT_URL'`** with your actual Web App URL:
   ```javascript
   const response = await fetch('https://script.google.com/macros/s/ABC123.../exec', {
   ```

### Step 5: Test the Integration

1. **Deploy your site** to GitHub Pages
2. **Open the customer form** on your phone
3. **Fill out and submit** a test quote request
4. **Check your Google Sheet** - the data should appear automatically!

## 📱 **Your New Workflow:**

1. **Customer scans QR code** → Opens form on their device
2. **Customer submits** → Data instantly appears in your Google Sheet
3. **You get notification** (optional: set up Google Sheets email notifications)
4. **You access sheet** from any device to review leads
5. **You follow up** and update status in the sheet

## 🎨 **Sheet Formatting Tips:**

### Make it Professional:
1. **Freeze the header row:** View → Freeze → 1 row
2. **Add filters:** Data → Create a filter
3. **Color-code status:** Format → Conditional formatting
   - New Lead = Red background
   - Contacted = Yellow background  
   - Quoted = Blue background
   - Scheduled = Green background

### Add Formulas:
- **Column Q - Days Since Submission:** `=TODAY()-A2`
- **Column R - Full Name:** `=B2&" "&C2`
- **Column S - Follow-up Due:** `=A2+1` (next day)

## 📧 **Optional: Email Notifications**

If you want to get emails when new customers submit forms, add this email function:

### Step 1: Add Email Function to Your Script

1. **In your Apps Script editor** (same place where you pasted the doPost function)
2. **Add this additional function** (paste it BELOW your existing doPost function):

```javascript
function sendEmailNotification() {
  // This function runs automatically when new rows are added
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();
  
  // Get data from the most recent submission (last row)
  const customerName = sheet.getRange(lastRow, 2).getValue() + ' ' + sheet.getRange(lastRow, 3).getValue();
  const phone = sheet.getRange(lastRow, 4).getValue();
  const email = sheet.getRange(lastRow, 5).getValue();
  const service = sheet.getRange(lastRow, 7).getValue();
  const urgency = sheet.getRange(lastRow, 8).getValue();
  const budget = sheet.getRange(lastRow, 10).getValue();
  
  MailApp.sendEmail({
    to: 'your-email@gmail.com', // ⚠️ REPLACE WITH YOUR ACTUAL EMAIL
    subject: `🚨 New Quote Request from ${customerName}`,
    body: `New customer quote request received!

CUSTOMER INFO:
Name: ${customerName}
Phone: ${phone}
Email: ${email}
Service: ${service}
Urgency: ${urgency}
Budget: ${budget}

View full details: ${sheet.getUrl()}

---
This email was sent automatically from your customer quote form.`
  });
}
```

### Step 2: Set Up the Trigger

1. **In Apps Script, click the clock icon** ⏰ (Triggers) in the left sidebar
2. **Click "Add Trigger"**
3. **Configure the trigger:**
   - Choose function: `sendEmailNotification`
   - Choose event source: `From spreadsheet`
   - Choose event type: `On form submit`
   - Choose failure notification: `Notify me immediately`
4. **Click "Save"**
5. **Grant permissions** when prompted

### Step 3: Test the Email (Optional)

You can test the email function manually:
1. **In Apps Script, select the `sendEmailNotification` function**
2. **Click the "Run" button** ▶️
3. **Check your email** - you should receive a test email with data from the last row

## 🔒 **Security & Privacy:**

- **Your Google Sheet is private** - only you can access it
- **Script permissions** - only runs when form is submitted
- **No customer data** stored in GitHub repository
- **Google's security** protects all customer information

## 💡 **Pro Tips:**

### Data Analysis:
- **Sort by urgency** to prioritize emergency requests
- **Filter by service type** to batch similar quotes
- **Track conversion rates** by referral source

### Mobile Access:
- **Google Sheets app** works great on phones
- **Offline access** - view leads even without internet
- **Quick updates** - change status on the go

### Backup:
- **Download as Excel** for backup (File → Download)
- **Share with team** if you have employees
- **Import to other tools** easily

## 🎯 **Why This Beats Email:**

| Feature | Google Sheets | Email |
|---------|---------------|-------|
| All leads in one place | ✅ | ❌ |
| Sortable/Filterable | ✅ | ❌ |
| Status tracking | ✅ | ❌ |
| Mobile friendly | ✅ | ✅ |
| No inbox clutter | ✅ | ❌ |
| Easy to analyze | ✅ | ❌ |
| Team sharing | ✅ | ❌ |

## 🚀 **Quick Start Checklist:**

- [ ] Create Google Sheet with headers
- [ ] Set up Apps Script with provided code
- [ ] Deploy as Web App and copy URL
- [ ] Update customer-script.js with your URL
- [ ] Test with form submission
- [ ] Deploy to GitHub Pages
- [ ] Create QR code pointing to customer.html

**Result:** Every customer submission appears instantly in your Google Sheet, accessible from any device!

Need help with any of these steps?