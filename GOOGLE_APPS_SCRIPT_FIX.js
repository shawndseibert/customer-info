/**
 * CORRECTED Google Apps Script Code
 * This should be in your Google Apps Script project
 */

function doGet(e) {
  try {
    const action = e.parameter.action || 'getData';
    const callback = e.parameter.callback;
    
    console.log('Action:', action, 'Callback:', callback);
    
    let result;
    
    if (action === 'getData') {
      // Get data from your Google Sheets
      const sheet = SpreadsheetApp.openById('1vP2KCZAYfrWFtThDs1fMUCPspVWYOZbdg12UZuMnDWc').getActiveSheet();
      const data = sheet.getDataRange().getValues();
      
      console.log('Sheet data retrieved:', data.length, 'rows');
      console.log('First row (headers):', data[0]);
      
      // Check if sheet has data
      if (data.length === 0) {
        result = {
          status: 'success',
          data: [],
          message: 'Google Sheets is empty',
          timestamp: new Date().toISOString()
        };
      } else if (data.length === 1) {
        // Only headers, no data rows
        result = {
          status: 'success',
          data: [],
          message: 'Google Sheets has headers but no data rows',
          headers: data[0],
          timestamp: new Date().toISOString()
        };
      } else {
        // Convert to your expected format
        const customers = data.slice(1).map((row, index) => {
          try {
            return {
              id: row[0] || '',
              firstName: row[1] || '',
              lastName: row[2] || '',
              phone: row[3] || '',
              email: row[4] || '',
              address: row[5] || '',
              city: row[6] || '',
              state: row[7] || '',
              zip: row[8] || '',
              service: row[9] || '',
              status: row[10] || '',
              priority: row[11] || '',
              notes: row[12] || '',
              dateAdded: row[13] || '',
              budget: row[14] || '',
              preferredDate: row[15] || ''
            };
          } catch (error) {
            console.error('Error processing row', index + 2, ':', error, 'Row data:', row);
            return null;
          }
        }).filter(customer => customer !== null);
        
        result = {
          status: 'success',
          data: customers,
          totalRows: data.length,
          processedCustomers: customers.length,
          timestamp: new Date().toISOString()
        };
      }
    } else if (action === 'addCustomer') {
      // Add new customer to Google Sheets (with duplicate check)
      try {
        const sheet = SpreadsheetApp.openById('1vP2KCZAYfrWFtThDs1fMUCPspVWYOZbdg12UZuMnDWc').getActiveSheet();
        const customerId = e.parameter.id;
        
        // Check for existing customer by ID
        const data = sheet.getDataRange().getValues();
        const existingCustomer = data.find(row => row[0] === customerId);
        
        if (existingCustomer) {
          result = {
            status: 'duplicate',
            message: 'Customer already exists in Google Sheets',
            customerId: customerId,
            timestamp: new Date().toISOString()
          };
        } else {
          // Get customer data from parameters
          const customerData = [
            customerId || '',
            e.parameter.firstName || '',
            e.parameter.lastName || '',
            e.parameter.phone || '',
            e.parameter.email || '',
            e.parameter.address || '',
            e.parameter.city || '',
            e.parameter.state || '',
            e.parameter.zip || '',
            e.parameter.service || '',
            e.parameter.status || '',
            e.parameter.priority || '',
            e.parameter.notes || '',
            e.parameter.dateAdded || new Date().toISOString(),
            e.parameter.budget || '',
            e.parameter.preferredDate || ''
          ];
          
          // Add the new row to the sheet
          sheet.appendRow(customerData);
          
          result = {
            status: 'success',
            message: 'Customer added to Google Sheets',
            customerId: customerId,
            timestamp: new Date().toISOString()
          };
        }
      } catch (error) {
        console.error('Error adding customer to sheet:', error);
        result = {
          status: 'error',
          message: 'Failed to add customer to Google Sheets: ' + error.toString(),
          timestamp: new Date().toISOString()
        };
      }
    } else if (action === 'setupHeaders') {
      // Set up proper headers in Google Sheets
      try {
        const sheet = SpreadsheetApp.openById('1vP2KCZAYfrWFtThDs1fMUCPspVWYOZbdg12UZuMnDWc').getActiveSheet();
        
        const headers = [
          'ID', 'First', 'Last', 'Phone', 'Email', 
          'Address', 'City', 'State', 'Zip', 'Service', 
          'Status', 'Priority', 'Notes', 'Date Added', 'Budget', 'Preferred Date'
        ];
        
        // Clear first row and set headers
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        
        result = {
          status: 'success',
          message: 'Headers set up in Google Sheets',
          headers: headers,
          timestamp: new Date().toISOString()
        };
      } catch (error) {
        console.error('Error setting up headers:', error);
        result = {
          status: 'error',
          message: 'Failed to set up headers: ' + error.toString(),
          timestamp: new Date().toISOString()
        };
      }
    } else if (action === 'test') {
      result = {
        status: 'success',
        data: 'Google Apps Script is working!',
        timestamp: new Date().toISOString()
      };
    } else {
      result = {
        status: 'error',
        message: 'Unknown action: ' + action
      };
    }
    
    // CRITICAL: Return JSONP for callback requests
    if (callback) {
      const jsonpResponse = callback + '(' + JSON.stringify(result) + ');';
      return ContentService
        .createTextOutput(jsonpResponse)
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    
    // Return regular JSON if no callback
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Script error:', error);
    
    const errorResult = {
      status: 'error',
      message: error.toString(),
      timestamp: new Date().toISOString()
    };
    
    // Handle JSONP error response
    if (e.parameter.callback) {
      const jsonpError = e.parameter.callback + '(' + JSON.stringify(errorResult) + ');';
      return ContentService
        .createTextOutput(jsonpError)
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify(errorResult))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Example helper function to get customer data from Google Sheets
 * Replace with your actual sheet ID and structure
 */
function getCustomerData() {
  try {
    // Your Google Sheets ID
    const SHEET_ID = '1vP2KCZAYfrWFtThDs1fMUCPspVWYOZbdg12UZuMnDWc';
    const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);
    
    return rows.map(row => {
      const customer = {};
      headers.forEach((header, index) => {
        customer[header] = row[index];
      });
      return customer;
    });
  } catch (error) {
    console.error('Error getting customer data:', error);
    return [];
  }
}