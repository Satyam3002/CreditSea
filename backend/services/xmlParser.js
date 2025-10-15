// Import required libraries
const xml2js = require('xml2js');

// Simple XML Parser Service for Credit Reports
class XMLParserService {
  constructor() {
    // Setup XML parser with simple options
    this.parser = new xml2js.Parser({
      explicitArray: false,  // Don't always make arrays
      mergeAttrs: true,      // Merge attributes
      explicitRoot: false    // Don't include root element
    });
  }

  // Main function to parse XML and get credit data
  async parseCreditReport(xmlContent, fileName) {
    try {
      console.log(`Starting to parse file: ${fileName}`);
      
      // Step 1: Convert XML string to JavaScript object
      const parsedData = await this.parser.parseStringPromise(xmlContent);
      console.log('XML converted to object successfully');
      
      // Step 2: Extract the credit information we need
      const creditData = this.extractCreditData(parsedData);
      console.log('Credit data extracted successfully');
      
      // Step 3: Return the result
      return {
        success: true,
        data: creditData,
        originalData: parsedData // Keep original data for debugging
      };
    } catch (error) {
      console.error(`Error parsing file ${fileName}:`, error.message);
      throw new Error(`Failed to parse XML: ${error.message}`);
    }
  }

  // Extract all the credit information we need
  extractCreditData(parsedData) {
    try {
      console.log('Starting to extract credit data...');
      
      // Make sure we have the right XML structure
      const data = this.normalizeXMLStructure(parsedData);
      
      // Extract each piece of information step by step
      const creditData = {
        // Person's basic information
        name: this.extractName(data),
        mobilePhone: this.extractMobilePhone(data),
        pan: this.extractPAN(data),
        creditScore: this.extractCreditScore(data),
        
        // Summary of all accounts
        reportSummary: this.extractReportSummary(data),
        
        // List of all credit accounts
        creditAccounts: this.extractCreditAccounts(data),
        
        // List of addresses
        addresses: this.extractAddresses(data),
        
        // When the report was generated
        reportDate: this.extractReportDate(data)
      };
      
      console.log('Credit data extraction completed');
      return creditData;
    } catch (error) {
      console.error('Error extracting credit data:', error);
      throw new Error(`Data extraction failed: ${error.message}`);
    }
  }

  // Make sure we have the right XML structure
  normalizeXMLStructure(data) {
    console.log('Checking XML structure...');
    
    // List of possible root elements in different XML formats
    const possibleRoots = ['creditReport', 'report', 'creditData', 'experianReport', 'data', 'INProfileResponse'];
    
    // Check each possible root
    for (const root of possibleRoots) {
      if (data[root]) {
        console.log(`Found XML root: ${root}`);
        return data[root];
      }
    }
    
    // If no known root found, return data as is
    console.log('No known root found, using data as is');
    return data;
  }

  // Extract person's name from XML
  extractName(data) {
    console.log('Extracting name...');
    
    // Try to get name from Experian XML structure first
    if (data.Current_Application && data.Current_Application.Current_Application_Details && data.Current_Application.Current_Application_Details.Current_Applicant_Details) {
      const applicant = data.Current_Application.Current_Application_Details.Current_Applicant_Details;
      const firstName = applicant.First_Name || '';
      const lastName = applicant.Last_Name || '';
      const fullName = `${firstName} ${lastName}`.trim();
      
      if (fullName) {
        console.log(`Found name: ${fullName}`);
        return fullName;
      }
    }
    
    // If not found, try other common field names
    const nameFields = ['name', 'fullName', 'customerName', 'applicantName', 'personName'];
    const name = this.extractField(data, nameFields) || 'N/A';
    console.log(`Name extracted: ${name}`);
    return name;
  }

  // Extract mobile phone number from XML
  extractMobilePhone(data) {
    console.log('Extracting mobile phone...');
    
    // Try to get phone from Experian XML structure first
    if (data.Current_Application && data.Current_Application.Current_Application_Details && data.Current_Application.Current_Application_Details.Current_Applicant_Details) {
      const applicant = data.Current_Application.Current_Application_Details.Current_Applicant_Details;
      const mobilePhone = applicant.MobilePhoneNumber;
      
      if (mobilePhone) {
        const formattedPhone = this.formatPhoneNumber(mobilePhone);
        console.log(`Found mobile phone: ${formattedPhone}`);
        return formattedPhone;
      }
    }
    
    // If not found, try other common field names
    const phoneFields = ['mobilePhone', 'mobile', 'phone', 'contactNumber', 'phoneNumber'];
    const phone = this.extractField(data, phoneFields);
    const result = phone ? this.formatPhoneNumber(phone) : 'N/A';
    console.log(`Mobile phone extracted: ${result}`);
    return result;
  }

  // Extract PAN number from XML
  extractPAN(data) {
    console.log('Extracting PAN number...');
    
    // Try to get PAN from Experian XML structure first
    if (data.CAIS_Account && data.CAIS_Account.CAIS_Account_DETAILS) {
      // Make sure we have an array to work with
      let accounts = data.CAIS_Account.CAIS_Account_DETAILS;
      if (!Array.isArray(accounts)) {
        accounts = [accounts]; // Convert single account to array
      }
      
      // Look through all accounts to find PAN
      for (const account of accounts) {
        if (account.CAIS_Holder_Details && account.CAIS_Holder_Details.Income_TAX_PAN) {
          const pan = account.CAIS_Holder_Details.Income_TAX_PAN;
          const cleanPAN = pan.toString().toUpperCase().replace(/[^A-Z0-9]/g, '');
          console.log(`Found PAN: ${cleanPAN}`);
          return cleanPAN;
        }
      }
    }
    
    // If not found, try other common field names
    const panFields = ['pan', 'panNumber', 'pancard', 'panCard', 'permanentAccountNumber'];
    const pan = this.extractField(data, panFields);
    const result = pan ? pan.toString().toUpperCase().replace(/[^A-Z0-9]/g, '') : 'N/A';
    console.log(`PAN extracted: ${result}`);
    return result;
  }

  // Extract credit score from XML
  extractCreditScore(data) {
    console.log('Extracting credit score...');
    
    // Try to get score from Experian XML structure first
    if (data.SCORE && data.SCORE.BureauScore) {
      const score = this.parseNumericValue(data.SCORE.BureauScore);
      console.log(`Found credit score: ${score}`);
      return score;
    }
    
    // If not found, try other common field names
    const scoreFields = ['creditScore', 'score', 'creditRating', 'cibilScore'];
    const score = this.extractField(data, scoreFields);
    const result = this.parseNumericValue(score);
    console.log(`Credit score extracted: ${result}`);
    return result;
  }

  extractReportSummary(data) {
    // Handle Experian XML structure
    if (data.CAIS_Account?.CAIS_Summary) {
      const summary = data.CAIS_Account.CAIS_Summary;
      const creditAccount = summary.Credit_Account || {};
      const outstandingBalance = summary.Total_Outstanding_Balance || {};
      
      return {
        totalAccounts: this.parseNumericValue(creditAccount.CreditAccountTotal),
        activeAccounts: this.parseNumericValue(creditAccount.CreditAccountActive),
        closedAccounts: this.parseNumericValue(creditAccount.CreditAccountClosed),
        currentBalanceAmount: this.parseNumericValue(outstandingBalance.Outstanding_Balance_All),
        securedAccountsAmount: this.parseNumericValue(outstandingBalance.Outstanding_Balance_Secured),
        unsecuredAccountsAmount: this.parseNumericValue(outstandingBalance.Outstanding_Balance_UnSecured),
        lastSevenDaysCreditEnquiries: this.parseNumericValue(data.TotalCAPS_Summary?.TotalCAPSLast7Days)
      };
    }
    
    // Fallback to other possible structures
    const summary = data.reportSummary || data.summary || data.creditSummary || {};
    
    return {
      totalAccounts: this.parseNumericValue(summary.totalAccounts || summary.totalAccountsCount),
      activeAccounts: this.parseNumericValue(summary.activeAccounts || summary.activeAccountsCount),
      closedAccounts: this.parseNumericValue(summary.closedAccounts || summary.closedAccountsCount),
      currentBalanceAmount: this.parseNumericValue(summary.currentBalanceAmount || summary.currentBalance),
      securedAccountsAmount: this.parseNumericValue(summary.securedAccountsAmount || summary.securedBalance),
      unsecuredAccountsAmount: this.parseNumericValue(summary.unsecuredAccountsAmount || summary.unsecuredBalance),
      lastSevenDaysCreditEnquiries: this.parseNumericValue(summary.lastSevenDaysCreditEnquiries || summary.recentEnquiries)
    };
  }

  extractCreditAccounts(data) {
    // Handle Experian XML structure
    if (data.CAIS_Account?.CAIS_Account_DETAILS) {
      const accounts = Array.isArray(data.CAIS_Account.CAIS_Account_DETAILS) 
        ? data.CAIS_Account.CAIS_Account_DETAILS 
        : [data.CAIS_Account.CAIS_Account_DETAILS];
      
      return accounts.map(account => ({
        accountNumber: account.Account_Number || 'N/A',
        bankName: account.Subscriber_Name || 'N/A',
        currentBalance: this.parseNumericValue(account.Current_Balance),
        amountOverdue: this.parseNumericValue(account.Amount_Past_Due),
        accountType: this.getAccountTypeDescription(account.Account_Type),
        status: this.getAccountStatusDescription(account.Account_Status)
      }));
    }
    
    // Fallback to other possible structures
    const accounts = data.creditAccounts || data.accounts || data.creditCards || [];
    
    if (!Array.isArray(accounts)) {
      return [];
    }

    return accounts.map(account => ({
      accountNumber: this.extractAccountNumber(account),
      bankName: this.extractBankName(account),
      currentBalance: this.parseNumericValue(account.currentBalance || account.balance),
      amountOverdue: this.parseNumericValue(account.amountOverdue || account.overdue || account.outstanding),
      accountType: account.accountType || account.type || 'Credit Card',
      status: account.status || account.accountStatus || 'Active'
    }));
  }

  extractAddresses(data) {
    // Handle Experian XML structure
    if (data.CAIS_Account?.CAIS_Account_DETAILS) {
      const accounts = Array.isArray(data.CAIS_Account.CAIS_Account_DETAILS) 
        ? data.CAIS_Account.CAIS_Account_DETAILS 
        : [data.CAIS_Account.CAIS_Account_DETAILS];
      
      const addresses = [];
      accounts.forEach(account => {
        if (account.CAIS_Holder_Address_Details) {
          const addressDetails = account.CAIS_Holder_Address_Details;
          addresses.push({
            type: 'Current',
            address: [
              addressDetails.First_Line_Of_Address_non_normalized,
              addressDetails.Second_Line_Of_Address_non_normalized,
              addressDetails.Third_Line_Of_Address_non_normalized
            ].filter(Boolean).join(', '),
            city: addressDetails.City_non_normalized || 'N/A',
            state: addressDetails.State_non_normalized || 'N/A',
            pincode: addressDetails.ZIP_Postal_Code_non_normalized || 'N/A',
            country: addressDetails.CountryCode_non_normalized === 'IB' ? 'India' : 'N/A'
          });
        }
      });
      return addresses;
    }
    
    // Fallback to other possible structures
    const addresses = data.addresses || data.address || [];
    
    if (!Array.isArray(addresses)) {
      return [];
    }

    return addresses.map(address => ({
      type: address.type || address.addressType || 'Current',
      address: this.formatAddress(address),
      city: address.city || 'N/A',
      state: address.state || 'N/A',
      pincode: address.pincode || address.pinCode || 'N/A',
      country: address.country || 'India'
    }));
  }

  extractReportDate(data) {
    // Handle Experian XML structure
    if (data.Header?.ReportDate) {
      const dateStr = data.Header.ReportDate;
      // Convert YYYYMMDD format to Date
      if (dateStr && dateStr.length === 8) {
        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);
        const day = dateStr.substring(6, 8);
        const date = new Date(`${year}-${month}-${day}`);
        if (!isNaN(date.getTime())) return date;
      }
    }
    
    // Fallback to other possible structures
    const dateFields = ['reportDate', 'generatedDate', 'reportGeneratedOn', 'date'];
    const dateStr = this.extractField(data, dateFields);
    
    if (dateStr) {
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? new Date() : date;
    }
    
    return new Date();
  }

  // Helper function to find a field with multiple possible names
  extractField(data, possibleFields) {
    // Try each possible field name
    for (const field of possibleFields) {
      if (data[field]) {
        return data[field]; // Return the first one found
      }
    }
    return null; // Return null if none found
  }

  // Helper function to get account number
  extractAccountNumber(account) {
    const accountFields = ['accountNumber', 'accountNo', 'cardNumber', 'creditCardNumber'];
    return this.extractField(account, accountFields) || 'N/A';
  }

  // Helper function to get bank name
  extractBankName(account) {
    const bankFields = ['bankName', 'bank', 'issuer', 'cardIssuer', 'institution'];
    return this.extractField(account, bankFields) || 'N/A';
  }

  // Clean up phone number format
  formatPhoneNumber(phone) {
    if (!phone) return 'N/A';
    
    // Remove all non-numbers
    const cleaned = phone.toString().replace(/[^0-9]/g, '');
    
    // Return cleaned number if it's 10 digits, otherwise return original
    return cleaned.length === 10 ? cleaned : phone.toString();
  }

  // Format address into a readable string
  formatAddress(address) {
    if (typeof address === 'string') return address;
    
    // Combine all address parts
    const parts = [
      address.line1 || address.addressLine1,
      address.line2 || address.addressLine2,
      address.area || address.locality,
      address.city,
      address.state,
      address.pincode || address.pinCode
    ].filter(Boolean); // Remove empty parts
    
    return parts.join(', ');
  }

  // Convert string to number safely
  parseNumericValue(value) {
    if (value === null || value === undefined || value === '') return 0;
    
    // Remove everything except numbers, dots, and minus signs
    const cleaned = value.toString().replace(/[^0-9.-]/g, '');
    const num = parseFloat(cleaned);
    
    // Return 0 if not a valid number
    return isNaN(num) ? 0 : num;
  }

  // Convert account type code to readable description
  getAccountTypeDescription(accountType) {
    const typeMap = {
      '10': 'Credit Card',
      '51': 'Personal Loan',
      '52': 'Home Loan',
      '53': 'Auto Loan',
      '54': 'Education Loan',
      '55': 'Business Loan'
    };
    
    // Return readable name if found, otherwise return code
    return typeMap[accountType] || `Account Type ${accountType}`;
  }

  // Convert account status code to readable description
  getAccountStatusDescription(accountStatus) {
    const statusMap = {
      '11': 'Active',
      '13': 'Closed',
      '53': 'Written Off',
      '71': 'Settled'
    };
    
    // Return readable status if found, otherwise return code
    return statusMap[accountStatus] || `Status ${accountStatus}`;
  }

  // Check if the extracted data is valid
  validateCreditData(data) {
    console.log('Validating extracted data...');
    const errors = [];
    
    // Check if name is present
    if (!data.name || data.name === 'N/A') {
      errors.push('Name is required');
    }
    
    // Check if PAN is present
    if (!data.pan || data.pan === 'N/A') {
      errors.push('PAN is required');
    }
    
    // Check if mobile phone is present
    if (!data.mobilePhone || data.mobilePhone === 'N/A') {
      errors.push('Mobile phone is required');
    }
    
    console.log(`Validation completed. Errors: ${errors.length}`);
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = new XMLParserService();
