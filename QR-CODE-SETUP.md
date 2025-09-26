# QR Code Setup Instructions

## Your Customer Quote System URLs

### Customer-Facing Form (Simplified)
**URL:** `https://yourusername.github.io/customer-info/customer.html`

### Admin Management System (Full Features)
**URL:** `https://yourusername.github.io/customer-info/index.html`

## QR Code Generation

### Method 1: Online QR Code Generator (Recommended)
1. Go to [QR Code Generator](https://www.qr-code-generator.com/) or [QRCode Monkey](https://www.qrcode-monkey.com/)
2. Enter your customer form URL: `https://yourusername.github.io/customer-info/customer.html`
3. Customize the design:
   - Add your business logo in the center
   - Choose colors that match your brand
   - Add a frame with text like "Get Your Free Quote"
4. Download as high-resolution PNG or PDF
5. Print and use in your marketing materials

### Method 2: Google Charts API (Free)
Use this URL to generate a QR code automatically:
```
https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=https://yourusername.github.io/customer-info/customer.html&choe=UTF-8
```

Replace `yourusername` with your actual GitHub username.

### Method 3: Browser Extension
- Install "QR Code Generator" extension in Chrome/Edge
- Navigate to your customer form page
- Click the extension to generate QR code
- Save the image

## QR Code Usage Ideas

### 1. Business Cards
- Add QR code to back of business cards
- Text: "Scan for Free Quote"

### 2. Vehicle Signage
- Add to your work truck/van
- Include: "Scan with phone camera for instant quote"

### 3. Door Hangers/Flyers
- Perfect for neighborhood marketing
- "Get your free door & window quote instantly"

### 4. Yard Signs
- When working on projects
- "Interested in door/window work? Scan here!"

### 5. Email Signatures
- Include QR code in professional emails
- Great for follow-up communications

### 6. Social Media
- Post QR code on Facebook, Instagram
- Include in business profile photos

## Testing Your QR Code

1. **Test with Multiple Devices:**
   - iPhone camera app
   - Android camera app
   - QR code reader apps

2. **Check Different Distances:**
   - Make sure it works from 6 inches to 3 feet away
   - Test in different lighting conditions

3. **Verify the URL:**
   - Ensure it opens the customer form, not the admin panel
   - Test that the form works properly on mobile devices

## Customer Instructions

### For Business Cards/Flyers
**"Get Your Free Quote Instantly!"**
1. Open your phone's camera
2. Point it at this QR code
3. Tap the notification that appears
4. Fill out the simple form
5. We'll contact you within 24 hours!

### For Social Media Posts
**"Skip the phone tag! 📱 Get your door & window quote instantly by scanning this QR code. Takes 2 minutes, and we'll respond within 24 hours with your personalized estimate! #DoorReplacement #WindowReplacement #HomeImprovement"**

## Marketing Tips

### 1. Call-to-Action Text
Always include text with your QR code:
- "Scan for Free Quote"
- "Get Instant Estimate"
- "Quick Quote - 2 Minutes"
- "No Phone Calls Needed"

### 2. Value Proposition
- "24-Hour Response Guaranteed"
- "Licensed & Insured"
- "Free Consultation"
- "No Obligation Quote"

### 3. Visual Design
- Make QR code large enough (minimum 1 inch square)
- Ensure high contrast with background
- Add your business colors/logo
- Include clear instructions

## Analytics & Tracking

### Customer Submissions
- Customer submissions are automatically saved
- Access admin panel to view all submissions
- Export data as CSV for your records

### Viewing Submissions (Admin Only)
1. Go to your admin URL: `https://yourusername.github.io/customer-info/index.html`
2. Customer submissions will appear as new records
3. Use the search/filter features to manage leads

### Exporting Customer Data
**From Customer Form Page (Hidden Feature):**
- Press `Ctrl+Shift+E` to export customer submissions
- This downloads all QR code leads as CSV

**From Admin Panel:**
- Click the "Export" button for all customer data
- Includes both manual entries and QR code submissions

## Security & Privacy

### Data Storage
- All data stored locally in browser
- No external servers involved
- Customer data is private and secure

### Customer Privacy
- Form includes privacy notice
- Data only used for quotes
- No sharing or selling of information

## Troubleshooting

### QR Code Not Working
1. **Check URL:** Make sure you replaced "yourusername" with your actual GitHub username
2. **Test URL:** Open the URL directly in a browser first
3. **Regenerate:** Create a new QR code if the old one doesn't work
4. **Size:** Make sure QR code is large enough to scan

### Form Not Loading
1. **GitHub Pages:** Ensure GitHub Pages is enabled in your repository settings
2. **Files:** Confirm all files are uploaded correctly
3. **URL:** Double-check the exact URL structure

### Mobile Issues
1. **Responsive Design:** The form is optimized for mobile devices
2. **Loading:** Allow a few seconds for the form to load completely
3. **Internet:** Customers need internet connection to submit

## Customization

### Adding Your Business Info
Edit the `customer.html` file to include:
- Your actual business name
- Real phone number
- Actual email address
- Service area information
- Your business hours

### Branding Colors
Edit `customer-styles.css` to match your brand:
- Look for gradient color codes
- Replace with your business colors
- Update to match your logo/branding

---

**Pro Tip:** Print QR codes on weather-resistant materials for outdoor use, and always test them before mass printing!