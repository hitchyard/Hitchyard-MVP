/**
 * Salesforce Integration Client
 * 
 * Provides authenticated access to Salesforce API using jsforce library.
 * Handles SOQL queries, DML operations, and token management.
 * 
 * This replaces the Airtable integration with Salesforce as the Single Source of Truth.
 */

import jsforce, { Connection } from 'jsforce';

/**
 * Global connection instance (singleton pattern)
 * Reuses connection across requests to avoid re-authentication
 */
let salesforceConnection: Connection | null = null;

/**
 * Initialize Salesforce connection
 * Supports both OAuth2 and username/password authentication
 */
async function getSalesforceConnection(): Promise<Connection> {
  // Return existing connection if available
  if (salesforceConnection && salesforceConnection.accessToken) {
    return salesforceConnection;
  }

  const conn = new jsforce.Connection({
    instanceUrl: process.env.SALESFORCE_INSTANCE_URL,
    accessToken: process.env.SALESFORCE_ACCESS_TOKEN,
    version: '60.0', // Summer 2024 API version
  });

  // Validate connection is working
  try {
    await conn.identity();
    salesforceConnection = conn;
    return conn;
  } catch (error) {
    console.error('Salesforce connection failed:', error);
    throw new Error('Failed to establish Salesforce connection');
  }
}

/**
 * OAuth2 Authentication Flow (for production)
 * Use this if you prefer token-based auth instead of username/password
 */
export async function authenticateSalesforceOAuth(): Promise<string> {
  const conn = new jsforce.Connection({
    clientId: process.env.SALESFORCE_CLIENT_ID,
    clientSecret: process.env.SALESFORCE_CLIENT_SECRET,
    redirectUri: process.env.SALESFORCE_REDIRECT_URI,
  });

  try {
    const userInfo = await conn.authenticate({
      username: process.env.SALESFORCE_USERNAME!,
      password: process.env.SALESFORCE_PASSWORD! + process.env.SALESFORCE_SECURITY_TOKEN!,
    });

    // Store accessToken in environment or secure storage
    process.env.SALESFORCE_ACCESS_TOKEN = conn.accessToken;
    return conn.accessToken;
  } catch (error) {
    console.error('Salesforce OAuth authentication failed:', error);
    throw error;
  }
}

/**
 * SCREENING AGENT: Query carrier by DOT number
 * Verify Safety_Status__c and Insurance_Expiration__c
 */
export async function queryCarrierByDOT(dotNumber: string) {
  const conn = await getSalesforceConnection();

  const query = `
    SELECT Id, Name, Safety_Status__c, Trust_Score__c, Insurance_Expiration__c, 
           Ansonia_Credit_Score__c, Ansonia_DTP_Days__c, Last_Vetting_Check__c
    FROM Carrier__c
    WHERE DOT_Number__c = '${dotNumber}'
    LIMIT 1
  `;

  try {
    const result = await conn.query(query);
    return result.records[0] || null;
  } catch (error) {
    console.error('Salesforce query failed:', error);
    throw error;
  }
}

/**
 * Create new Carrier__c record during onboarding
 */
export async function createCarrier(carrierData: {
  name: string;
  supabaseId: string;
  dotNumber?: string;
  ein?: string;
  safetyStatus?: string;
}) {
  const conn = await getSalesforceConnection();

  const record = {
    Name: carrierData.name,
    Supabase_ID__c: carrierData.supabaseId,
    DOT_Number__c: carrierData.dotNumber,
    EIN__c: carrierData.ein,
    Safety_Status__c: carrierData.safetyStatus || 'Pending',
    Trust_Score__c: 0,
  };

  try {
    const result = await conn.sobject('Carrier__c').create(record);
    return result;
  } catch (error) {
    console.error('Failed to create Carrier record:', error);
    throw error;
  }
}

/**
 * MATCHMAKING AGENT: Find active carriers by trust score
 * Returns top candidates for load matching
 */
export async function findActiveCarriers(limit: number = 10) {
  const conn = await getSalesforceConnection();

  const query = `
    SELECT Id, Name, Trust_Score__c, Performance_OnTime_Rate__c, 
           Ansonia_Credit_Score__c, Insurance_Expiration__c
    FROM Carrier__c
    WHERE Safety_Status__c = 'Active' 
      AND Insurance_Expiration__c >= TODAY
    ORDER BY Trust_Score__c DESC, Performance_OnTime_Rate__c DESC
    LIMIT ${limit}
  `;

  try {
    const result = await conn.query(query);
    return result.records;
  } catch (error) {
    console.error('Failed to find active carriers:', error);
    throw error;
  }
}

/**
 * Update Carrier trust score and safety status
 * Called after credit check, compliance verification, etc.
 */
export async function updateCarrierVettingStatus(
  carrierId: string,
  updates: {
    trustScore?: number;
    safetyStatus?: string;
    ansoniaCreditScore?: number;
    ansoniaDTPDays?: number;
    lastVettingCheck?: string;
  }
) {
  const conn = await getSalesforceConnection();

  const record: any = {
    Id: carrierId,
  };

  if (updates.trustScore !== undefined) record.Trust_Score__c = updates.trustScore;
  if (updates.safetyStatus) record.Safety_Status__c = updates.safetyStatus;
  if (updates.ansoniaCreditScore !== undefined) record.Ansonia_Credit_Score__c = updates.ansoniaCreditScore;
  if (updates.ansoniaDTPDays !== undefined) record.Ansonia_DTP_Days__c = updates.ansoniaDTPDays;
  if (updates.lastVettingCheck) record.Last_Vetting_Check__c = updates.lastVettingCheck;

  try {
    const result = await conn.sobject('Carrier__c').update(record);
    return result;
  } catch (error) {
    console.error('Failed to update Carrier vetting status:', error);
    throw error;
  }
}

/**
 * TRACKING AGENT: Create or update Load__c record
 */
export async function createLoad(loadData: {
  loadNumber: string;
  shipperId: string;
  carrierId?: string;
  originCity: string;
  originState: string;
  destinationCity: string;
  destinationState: string;
  laneData?: string;
  marketRateSuggested?: number;
}) {
  const conn = await getSalesforceConnection();

  const record = {
    Load_Number__c: loadData.loadNumber,
    Shipper_ID__c: loadData.shipperId,
    Carrier_ID__c: loadData.carrierId,
    Origin_City__c: loadData.originCity,
    Origin_State__c: loadData.originState,
    Destination_City__c: loadData.destinationCity,
    Destination_State__c: loadData.destinationState,
    Live_Status__c: 'Pending',
    Lane_Data__c: loadData.laneData,
    Market_Rate_Suggested__c: loadData.marketRateSuggested,
  };

  try {
    const result = await conn.sobject('Load__c').create(record);
    return result;
  } catch (error) {
    console.error('Failed to create Load record:', error);
    throw error;
  }
}

/**
 * Update Load status (for Tracking Agent)
 * Called when GPS updates received or status changes
 */
export async function updateLoadStatus(
  loadId: string,
  status: 'In-Transit' | 'Delayed' | 'Delivered',
  lastGpsUpdate?: string
) {
  const conn = await getSalesforceConnection();

  const record: any = {
    Id: loadId,
    Live_Status__c: status,
  };

  if (lastGpsUpdate) {
    record.Last_GPS_Update__c = lastGpsUpdate;
  }

  if (status === 'Delivered') {
    record.Actual_Delivery__c = new Date().toISOString();
  }

  try {
    const result = await conn.sobject('Load__c').update(record);
    return result;
  } catch (error) {
    console.error('Failed to update Load status:', error);
    throw error;
  }
}

/**
 * FORECASTING AGENT: Get historical lane data for pricing
 */
export async function getLaneHistory(originState: string, destinationState: string) {
  const conn = await getSalesforceConnection();

  const query = `
    SELECT Lane_Data__c, Bid_Rate_Accepted__c, Actual_Delivery__c, CreatedDate
    FROM Load__c
    WHERE Origin_State__c = '${originState}' 
      AND Destination_State__c = '${destinationState}'
      AND Live_Status__c = 'Delivered'
    ORDER BY CreatedDate DESC
    LIMIT 50
  `;

  try {
    const result = await conn.query(query);
    return result.records;
  } catch (error) {
    console.error('Failed to get lane history:', error);
    throw error;
  }
}

/**
 * EXCEPTION AGENT: Find recently delayed loads
 */
export async function findDelayedLoads() {
  const conn = await getSalesforceConnection();

  const query = `
    SELECT Id, Load_Number__c, Carrier_ID__c, Estimated_Delivery__c, LastModifiedDate
    FROM Load__c
    WHERE Live_Status__c = 'Delayed'
      AND CreatedDate = LAST_N_DAYS:7
    ORDER BY LastModifiedDate DESC
    LIMIT 20
  `;

  try {
    const result = await conn.query(query);
    return result.records;
  } catch (error) {
    console.error('Failed to find delayed loads:', error);
    throw error;
  }
}

/**
 * Reassign load to different carrier (Exception Agent recovery)
 */
export async function reassignLoad(loadId: string, newCarrierId: string) {
  const conn = await getSalesforceConnection();

  try {
    const result = await conn.sobject('Load__c').update({
      Id: loadId,
      Carrier_ID__c: newCarrierId,
    });
    return result;
  } catch (error) {
    console.error('Failed to reassign load:', error);
    throw error;
  }
}

/**
 * Log agent workflow execution for audit trail
 */
export async function logAgentWorkflow(workflowData: {
  workflowType: string;
  relatedLoadId?: string;
  relatedCarrierId?: string;
  executionStatus: string;
  actionTaken?: string;
}) {
  const conn = await getSalesforceConnection();

  const record = {
    Workflow_Type__c: workflowData.workflowType,
    Related_Load__c: workflowData.relatedLoadId,
    Related_Carrier__c: workflowData.relatedCarrierId,
    Execution_Status__c: workflowData.executionStatus,
    Action_Taken__c: workflowData.actionTaken,
  };

  try {
    const result = await conn.sobject('Agent_Workflow__c').create(record);
    return result;
  } catch (error) {
    console.error('Failed to log workflow:', error);
    // Don't throw - logging failures should not block main operations
    console.warn('Workflow logging failed but operation continues');
  }
}

/**
 * Generic SOQL query for advanced use cases
 */
export async function executeSOQL(soqlQuery: string) {
  const conn = await getSalesforceConnection();

  try {
    const result = await conn.query(soqlQuery);
    return result.records;
  } catch (error) {
    console.error('SOQL query failed:', error);
    throw error;
  }
}

/**
 * Export connection for direct use in advanced scenarios
 */
export async function getConnection(): Promise<Connection> {
  return getSalesforceConnection();
}
