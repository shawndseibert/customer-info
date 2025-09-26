# Google Apps Script Setup for CORS-Free Integration

## The CORS Issue
The current Google Apps Script needs proper CORS headers and JSONP support to work with the admin panel.

## Updated Google Apps Script Code

Replace your current Google Apps Script with this code that supports both regular requests and JSONP:

```javascript
// Google Apps Script for Customer Info Management
// This script handles form submissions and provides CORS-free data access

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSheet();
    
    // Handle form data
    const data = e.parameter;
    
    // Add timestamp if not present
    if (!data.timestamp) {
      data.timestamp = new Date().toISOString();
    }
    
    // Append to sheet
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const row = headers.map(header => data[header] || '');
    sheet.appendRow(row);
    
    return ContentService
      .createTextOutput(JSON.stringify({status: 'success', message: 'Data saved successfully'}))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({status: 'error', message: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
  }
}

function doGet(e) {
  try {
    const action = e.parameter.action;
    const callback = e.parameter.callback; // For JSONP support
    
    if (action === 'getData') {
      const sheet = SpreadsheetApp.getActiveSheet();
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const rows = data.slice(1);
      
      // Convert to objects
      const customers = rows.map(row => {
        const customer = {};
        headers.forEach((header, index) => {
          customer[header] = row[index] || '';
        });
        return customer;
      }).filter(customer => customer.firstName && customer.phone); // Only valid entries
      
      const response = {
        status: 'success',
        data: customers,
        count: customers.length
      };
      
      // Handle JSONP requests
      if (callback) {
        return ContentService
          .createTextOutput(`${callback}(${JSON.stringify(response)})`)
          .setMimeType(ContentService.MimeType.JAVASCRIPT)
          .setHeaders({
            'Content-Type': 'application/javascript',
            'Access-Control-Allow-Origin': '*'
          });
      }
      
      // Handle regular JSON requests
      return ContentService
        .createTextOutput(JSON.stringify(response))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeaders({
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        });
    }
    
    // Default response
    const errorResponse = {status: 'error', message: 'Invalid action'};
    return ContentService
      .createTextOutput(JSON.stringify(errorResponse))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
      
  } catch (error) {
    const errorResponse = {status: 'error', message: error.toString()};
    
    // Handle JSONP error response
    if (e.parameter.callback) {
      return ContentService
        .createTextOutput(`${e.parameter.callback}(${JSON.stringify(errorResponse)})`)
        .setMimeType(ContentService.MimeType.JAVASCRIPT)
        .setHeaders({
          'Content-Type': 'application/javascript',
          'Access-Control-Allow-Origin': '*'
        });
    }
    
    return ContentService
      .createTextOutput(JSON.stringify(errorResponse))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
  }
}

function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    });
}
```

## Setup Instructions

1. **Open Google Apps Script**: Go to script.google.com
2. **Create New Project**: Replace the default code with the code above
3. **Set Up Spreadsheet**: Make sure your spreadsheet has these column headers in row 1:
   - firstName
   - lastName
   - phone
   - email
   - address
   - serviceType
   - urgency
   - budget
   - description
   - additionalNotes
   - heardAbout
   - timestamp

4. **Deploy Web App**:
   - Click "Deploy" → "New Deployment"
   - Choose "Web app" as the type
   - Set "Execute as" to "Me"
   - Set "Who has access" to "Anyone"
   - Click "Deploy"
   - Copy the web app URL

5. **Update the URL**: Replace the URL in both `customer-script.js` and `script.js` with your new deployment URL

## Alternative: Manual CSV Import

If the Google Apps Script still has issues, the admin panel now supports manual CSV import:

1. Export your Google Sheet as CSV (File → Download → CSV)
2. Use the "Sync Google Sheets" button in the admin panel
3. If sync fails, it will show a manual import option
4. Upload your CSV file using the import interface

## Testing the Fix

1. Try the "Sync Google Sheets" button in the admin panel
2. Check the browser console for any remaining CORS errors
3. If JSONP works, you should see successful sync messages
4. If it still fails, use the manual CSV import as a backup