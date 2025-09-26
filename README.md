# Customer Information Manager
**Professional Door & Window Services Customer Management System**

A complete dual-interface system designed specifically for door and window service professionals: a simplified customer-facing form for quotes and leads, plus a comprehensive business management system for organizing and tracking all customer information.

## 🎯 Two-System Approach

### 1. Customer Portal (`customer.html`)
- **Simplified quote request form** optimized for mobile devices
- **QR code friendly** - perfect for business cards, flyers, and vehicle signage
- **Professional appearance** that builds trust with potential customers
- **Auto-saves progress** so customers never lose their information
- **24-hour response promise** to set clear expectations

### 2. Business Admin System (`admin.html`)
- **Complete customer management** with full CRUD operations
- **Import QR code leads** automatically from customer submissions
- **Advanced search and filtering** to quickly find any customer
- **Export capabilities** for backup and external analysis
- **Business analytics dashboard** to track performance

## 🌟 Features

### Customer Information Management
- **Comprehensive Contact Forms**: Capture all essential customer details including contact information, service requirements, and project specifications
- **Service Type Tracking**: Specialized categories for doors, windows, replacement parts, and repairs
- **Priority Management**: Visual priority indicators (Low, Medium, High, Emergency) with color coding
- **Status Tracking**: Complete project lifecycle from initial contact to completion

### Smart Organization
- **Advanced Search**: Find customers by name, phone, email, or service notes
- **Status Filtering**: Quick filter by project status
- **Automatic Sorting**: Prioritized by urgency and creation date
- **Auto-save**: Never lose form data with automatic form saving

### Professional Features
- **Budget Tracking**: Capture and display customer budget ranges
- **Meeting Scheduler**: Schedule and track follow-up appointments
- **Referral Tracking**: Monitor how customers find your business
- **Timeline Management**: Track preferred start dates and project timelines

### Data Management
- **Local Storage**: All data stored securely in your browser
- **CSV Export**: Export customer data for backup or external use
- **Edit & Delete**: Full CRUD operations for customer records
- **Detailed View**: Comprehensive customer information modal

### Mobile-Responsive Design
- **Professional Appearance**: Gradient design that looks great during client meetings
- **Mobile Optimized**: Works perfectly on phones, tablets, and desktops
- **Print Friendly**: Clean printing of customer records
- **Accessibility**: Keyboard navigation and screen reader support

## 🚀 Getting Started

### Option 1: GitHub Pages (Recommended)
1. Fork this repository to your GitHub account
2. Go to your repository settings
3. Scroll down to "Pages" section
4. Select "Deploy from a branch" as source
5. Choose "main" branch and "/ (root)" folder
6. Click "Save"
7. Your site will be available at:
   - **Main Site:** `https://yourusername.github.io/customer-info/` (smart routing)
   - **Customer Form:** `https://yourusername.github.io/customer-info/customer.html`
   - **Business Admin:** `https://yourusername.github.io/customer-info/admin.html`

### Option 2: Local Development
1. Download or clone this repository
2. Open any HTML file in a modern web browser
3. Start managing your customers immediately!

## 🎯 System URLs

### For QR Codes & Customer Access
Use: `https://yourusername.github.io/customer-info/customer.html`

### For Your Business Management
Use: `https://yourusername.github.io/customer-info/admin.html`

### Smart Auto-Routing
Use: `https://yourusername.github.io/customer-info/` (automatically detects best view)

## 📱 How to Use

### Customer Portal (customer.html)
**For your customers to request quotes:**
1. Customer fills out simplified form (2-3 minutes)
2. Form auto-saves progress to prevent data loss
3. Professional "thank you" page with next steps
4. You receive notification of new lead

### Business Admin System (admin.html)
**For managing your business:**

#### Adding Customers Manually
1. Fill out the comprehensive form on the left side
2. Required fields are marked with an asterisk (*)
3. Select appropriate service type and priority level
4. Add detailed notes about customer requirements
5. Click "Save Customer Information"

#### Importing QR Code Leads
1. Click "Import QR Leads" button
2. System automatically imports customer submissions
3. Converts customer format to your business format
4. Avoids duplicates and marks source as QR code

#### Managing Existing Customers
- **Search**: Use the search box to find customers by any field
- **Filter**: Use the status dropdown to filter by project status
- **View Details**: Click any customer card to see full information
- **Edit**: Click "Edit" in the customer detail modal
- **Delete**: Click "Delete" in the customer detail modal (with confirmation)

#### Data Export
- Click the "Export" button to download all customer data as CSV
- Perfect for backup or importing into other systems
- File includes all customer information with timestamps

### QR Code Workflow
1. **Generate QR Code** pointing to your customer.html URL
2. **Add to marketing materials** (business cards, flyers, vehicle signs)
3. **Customer scans & submits** quote request
4. **You import leads** into your admin system
5. **Follow up** with customers within 24 hours

## 🛠️ Technical Details

### Technologies Used
- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Modern styling with Flexbox and Grid layouts
- **Vanilla JavaScript**: No dependencies, fast loading
- **Font Awesome**: Professional icons
- **Local Storage API**: Client-side data persistence

### Browser Compatibility
- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

### Data Storage
- All customer data is stored locally in your browser
- No data is sent to external servers
- Data persists across browser sessions
- Automatic form saving prevents data loss

## 🔐 Privacy & Security

- **100% Client-Side**: No data leaves your device
- **No Registration**: No accounts or passwords required
- **No Tracking**: No analytics or tracking scripts
- **Local Storage**: Data stays on your computer

## 🎨 Customization

### Color Scheme
The application uses a professional blue gradient theme. To customize:
1. Edit the CSS variables in `styles.css`
2. Look for the gradient definitions (lines with `linear-gradient`)
3. Replace with your brand colors

### Business Information
To add your business logo or information:
1. Edit the header section in `index.html`
2. Replace the title and subtitle with your business name
3. Add your logo by replacing the FontAwesome icon

## 📊 Business Benefits

### Improved Organization
- Never lose customer information again
- Quick access to all customer details
- Professional appearance during client meetings

### Better Customer Service
- Track customer preferences and requirements
- Set and manage follow-up reminders
- Maintain detailed service history

### Business Growth
- Monitor referral sources
- Track project completion rates
- Export data for business analysis

## 🆘 Support & Troubleshooting

### Common Issues

**Data Not Saving?**
- Ensure JavaScript is enabled in your browser
- Check that you're not in private/incognito mode (local storage is disabled)

**Site Not Loading?**
- Clear your browser cache
- Try a different browser
- Ensure you have an internet connection for CSS/fonts to load

**Export Not Working?**
- Most modern browsers support CSV download
- Try right-clicking the export button and "Save link as..."

### Data Backup
To backup your customer data:
1. Click the "Export" button regularly
2. Save the CSV files in a safe location
3. Consider setting up automated cloud backup of your downloads folder

## 🚀 Deployment to GitHub Pages

### Step-by-Step Guide

1. **Create GitHub Account** (if you don't have one)
   - Go to [github.com](https://github.com)
   - Click "Sign up" and create your account

2. **Upload Your Files**
   - Create a new repository named `customer-info`
   - Upload all files (`index.html`, `styles.css`, `script.js`, `README.md`)

3. **Enable GitHub Pages**
   - Go to repository Settings
   - Scroll to Pages section
   - Source: "Deploy from a branch"
   - Branch: "main"
   - Folder: "/ (root)"
   - Click Save

4. **Access Your Site**
   - Your site will be live at: `https://yourusername.github.io/customer-info`
   - It may take a few minutes to become available

### Custom Domain (Optional)
If you want to use your own domain:
1. Add a `CNAME` file to your repository with your domain name
2. Configure your domain's DNS to point to GitHub Pages
3. Enable HTTPS in GitHub Pages settings

## 📈 Future Enhancements

Potential features for future versions:
- Customer photo uploads
- Appointment calendar integration
- Email notifications for follow-ups
- Quote/estimate generation
- Invoice creation
- Cloud synchronization
- Multi-user support

## 📄 License

This project is open source and available under the MIT License. Feel free to modify and use for your business needs.

## 🤝 Contributing

If you have suggestions for improvements:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

**Made for door and window service professionals who want to stay organized and provide excellent customer service.**

*No technical expertise required - just open and start using!*