/**
 * CORRECTED Google Apps Script Code
 * This should be in your Google Apps Script project
 */

function doPost(e) {
  console.log('POST request received:', e);
  
  try {
    // Handle POST data
    let postData = {};
    
    if (e.postData && e.postData.contents) {
      try {
        postData = JSON.parse(e.postData.contents);
        console.log('Parsed JSON POST data:', postData);
      } catch (jsonError) {
        console.log('Not JSON, checking form data...');
        // Handle form-encoded data
        if (e.parameter) {
          postData = e.parameter;
          console.log('Using form parameter data:', postData);
        }
      }
    } else if (e.parameter) {
      postData = e.parameter;
      console.log('Using parameter data:', postData);
    }
    
    const action = postData.action || 'addCustomer';
    console.log('Action:', action);
    
    if (action === 'addCustomer') {
      return handleAddCustomer(postData);
    } else if (action === 'updateCustomer') {
      return handleUpdateCustomer(postData);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Unknown POST action: ' + action
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('POST error:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: 'POST processing error: ' + error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

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
          // Convert to your expected format (matching YOUR exact column order)
          // Your Columns: A=ID, B=First, C=Last, D=Phone, E=Email, F=Address, G=City, H=State, I=Zip, J=Service, K=Status, L=Priority, M=Notes, N=Date Added, O=Budget, P=Preferred Date
          const customers = data.slice(1).map((row, index) => {
            try {
              return {
                id: row[0] || '',           // Column A: ID
                firstName: row[1] || '',    // Column B: First
                lastName: row[2] || '',     // Column C: Last
                phone: row[3] || '',        // Column D: Phone
                email: row[4] || '',        // Column E: Email
                address: row[5] || '',      // Column F: Address
                city: row[6] || '',         // Column G: City
                state: row[7] || '',        // Column H: State
                zip: row[8] || '',          // Column I: Zip
                serviceType: row[9] || '',  // Column J: Service (mapped to serviceType)
                status: normalizeStatus(row[10]) || 'initial',      // Column K: Status (normalized)
                priority: normalizePriority(row[11]) || 'medium',    // Column L: Priority (normalized)
                notes: row[12] || '',       // Column M: Notes
                dateAdded: row[13] || '',   // Column N: Date Added
                budget: row[14] || '',      // Column O: Budget
                preferredDate: row[15] || '' // Column P: Preferred Date
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
    } else if (action === 'updateCustomer') {
      // Update existing customer in Google Sheets
      try {
        const sheet = SpreadsheetApp.openById('1vP2KCZAYfrWFtThDs1fMUCPspVWYOZbdg12UZuMnDWc').getActiveSheet();
        const customerId = e.parameter.id;
        
        // Find existing customer by ID
        const data = sheet.getDataRange().getValues();
        const customerRowIndex = data.findIndex(row => row[0] === customerId);
        
        if (customerRowIndex === -1) {
          result = {
            status: 'error',
            message: 'Customer not found in Google Sheets',
            customerId: customerId,
            timestamp: new Date().toISOString()
          };
        } else {
          // Update customer data (matching YOUR exact header order)
          const customerData = [
            customerId,                                              // Column A: ID
            e.parameter.firstName || '',                             // Column B: First  
            e.parameter.lastName || '',                              // Column C: Last
            e.parameter.phone || '',                                 // Column D: Phone
            e.parameter.email || '',                                 // Column E: Email
            e.parameter.address || '',                               // Column F: Address
            e.parameter.city || '',                                  // Column G: City
            e.parameter.state || '',                                 // Column H: State
            e.parameter.zip || '',                                   // Column I: Zip
            e.parameter.serviceType || e.parameter.service || '',    // Column J: Service
            e.parameter.status || '',                                // Column K: Status
            e.parameter.priority || '',                              // Column L: Priority
            e.parameter.notes || '',                                 // Column M: Notes
            e.parameter.dateAdded || new Date().toISOString(),       // Column N: Date Added
            e.parameter.budget || '',                                // Column O: Budget
            e.parameter.preferredDate || ''                          // Column P: Preferred Date
          ];
          
          // Update the row (customerRowIndex + 1 because getRange is 1-based)
          sheet.getRange(customerRowIndex + 1, 1, 1, customerData.length).setValues([customerData]);
          
          result = {
            status: 'success',
            message: 'Customer updated in Google Sheets',
            customerId: customerId,
            timestamp: new Date().toISOString()
          };
        }
      } catch (error) {
        console.error('Error updating customer in sheet:', error);
        result = {
          status: 'error',
          message: 'Failed to update customer in Google Sheets: ' + error.toString(),
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
          // Get customer data from parameters (matching YOUR exact header order)
          // Your Headers: ID, First, Last, Phone, Email, Address, City, State, Zip, Service, Status, Priority, Notes, Date Added, Budget, Preferred Date
          const customerData = [
            customerId || '',                                        // Column A: ID
            e.parameter.firstName || '',                             // Column B: First  
            e.parameter.lastName || '',                              // Column C: Last
            e.parameter.phone || '',                                 // Column D: Phone
            e.parameter.email || '',                                 // Column E: Email
            e.parameter.address || '',                               // Column F: Address
            e.parameter.city || '',                                  // Column G: City
            e.parameter.state || '',                                 // Column H: State
            e.parameter.zip || '',                                   // Column I: Zip
            e.parameter.serviceType || e.parameter.service || '',    // Column J: Service
            e.parameter.status || '',                                // Column K: Status
            e.parameter.priority || '',                              // Column L: Priority
            e.parameter.notes || '',                                 // Column M: Notes
            e.parameter.dateAdded || new Date().toISOString(),       // Column N: Date Added
            e.parameter.budget || '',                                // Column O: Budget
            e.parameter.preferredDate || ''                          // Column P: Preferred Date
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

function handleUpdateCustomer(data) {
  try {
    const sheet = SpreadsheetApp.openById('1vP2KCZAYfrWFtThDs1fMUCPspVWYOZbdg12UZuMnDWc').getActiveSheet();
    const customerId = data.id;
    
    console.log('Updating customer with data:', data);
    
    // Find existing customer by ID
    const existingData = sheet.getDataRange().getValues();
    const customerRowIndex = existingData.findIndex(row => row[0] === customerId);
    
    if (customerRowIndex === -1) {
      console.log('Customer not found for update:', customerId);
      return ContentService
        .createTextOutput(JSON.stringify({
          status: 'error',
          message: 'Customer not found in Google Sheets',
          customerId: customerId,
          timestamp: new Date().toISOString()
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Normalize status and priority
    const normalizedStatus = normalizeStatus(data.status);
    const normalizedPriority = normalizePriority(data.priority);
    
    // Prepare updated customer data with correct column mapping
    const customerData = [
      customerId,                                          // Column A: ID
      data.firstName || '',                                // Column B: First  
      data.lastName || '',                                 // Column C: Last
      data.phone || '',                                    // Column D: Phone
      data.email || '',                                    // Column E: Email
      data.address || '',                                  // Column F: Address
      data.city || '',                                     // Column G: City
      data.state || '',                                    // Column H: State
      data.zip || '',                                      // Column I: Zip
      data.serviceType || data.service || '',              // Column J: Service
      normalizedStatus,                                    // Column K: Status (normalized)
      normalizedPriority,                                  // Column L: Priority (normalized)
      data.notes || '',                                    // Column M: Notes
      data.dateAdded || new Date().toLocaleDateString(),   // Column N: Date Added
      data.budget || '',                                   // Column O: Budget
      data.preferredDate || ''                             // Column P: Preferred Date
    ];
    
    console.log('Updating row', customerRowIndex + 1, 'with data:', customerData);
    
    // Update the row (customerRowIndex + 1 because getRange is 1-based)
    sheet.getRange(customerRowIndex + 1, 1, 1, customerData.length).setValues([customerData]);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Customer updated in Google Sheets',
        customerId: customerId,
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error updating customer:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Failed to update customer: ' + error.toString(),
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function normalizeStatus(status) {
  if (!status) return 'initial';
  
  const statusLower = status.toLowerCase();
  const statusMap = {
    'new lead': 'initial',
    'initial contact': 'initial',
    'initial': 'initial',
    'quote provided': 'quoted',
    'quoted': 'quoted',
    'work scheduled': 'scheduled',
    'scheduled': 'scheduled',
    'in progress': 'in-progress',
    'in-progress': 'in-progress',
    'completed': 'completed',
    'follow-up needed': 'follow-up',
    'follow-up': 'follow-up'
  };
  
  return statusMap[statusLower] || 'initial';
}

function normalizePriority(priority) {
  if (!priority) return 'medium';
  
  // If numeric priority (1-5), convert to text
  if (!isNaN(priority)) {
    const numPriority = parseInt(priority);
    const priorityMap = {
      1: 'low',
      2: 'low', 
      3: 'medium',
      4: 'high',
      5: 'emergency'
    };
    return priorityMap[numPriority] || 'medium';
  }
  
  // If already text, normalize it
  const priorityLower = priority.toLowerCase();
  const textMap = {
    'low': 'low',
    'medium': 'medium',
    'high': 'high',
    'urgent': 'emergency',
    'emergency': 'emergency'
  };
  
  return textMap[priorityLower] || 'medium';
}

function handleAddCustomer(data) {
  try {
    const sheet = SpreadsheetApp.openById('1vP2KCZAYfrWFtThDs1fMUCPspVWYOZbdg12UZuMnDWc').getActiveSheet();
    const customerId = data.id || Date.now().toString();
    
    console.log('Adding customer with data:', data);
    
    // Check for existing customer by ID
    const existingData = sheet.getDataRange().getValues();
    const existingCustomer = existingData.find(row => row[0] === customerId);
    
    if (existingCustomer) {
      console.log('Customer already exists:', customerId);
      return ContentService
        .createTextOutput(JSON.stringify({
          status: 'duplicate',
          message: 'Customer already exists in Google Sheets',
          customerId: customerId,
          timestamp: new Date().toISOString()
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Normalize status and priority
    const normalizedStatus = normalizeStatus(data.status);
    const normalizedPriority = normalizePriority(data.priority);
    
    // Prepare customer data with correct column mapping
    const customerData = [
      customerId,                                          // Column A: ID
      data.firstName || '',                                // Column B: First  
      data.lastName || '',                                 // Column C: Last
      data.phone || '',                                    // Column D: Phone
      data.email || '',                                    // Column E: Email
      data.address || '',                                  // Column F: Address
      data.city || '',                                     // Column G: City
      data.state || '',                                    // Column H: State
      data.zip || '',                                      // Column I: Zip
      data.serviceType || data.service || '',              // Column J: Service
      normalizedStatus,                                    // Column K: Status (normalized)
      normalizedPriority,                                  // Column L: Priority (normalized)
      data.notes || '',                                    // Column M: Notes
      data.dateAdded || new Date().toLocaleDateString(),   // Column N: Date Added
      data.budget || '',                                   // Column O: Budget
      data.preferredDate || ''                             // Column P: Preferred Date
    ];
    
    console.log('Appending row with data:', customerData);
    sheet.appendRow(customerData);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Customer added to Google Sheets',
        customerId: customerId,
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error adding customer:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Failed to add customer: ' + error.toString(),
        timestamp: new Date().toISOString()
      }))
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