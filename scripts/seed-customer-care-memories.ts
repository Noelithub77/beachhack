import { Supermemory } from 'supermemory';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.SUPERMEMORY_API_KEY || '';

interface CustomerMemory {
  content: string;
  containerTag: string;
  metadata: {
    type: string;
    customerId: string;
    ticketId?: string;
    category: string;
    priority?: string;
    timestamp: number;
    [key: string]: unknown;
  };
}

const customerMemories: CustomerMemory[] = [
  {
    content: `Customer Profile: Sarah Johnson (cust_001)

Customer since March 2024. Premium subscription holder. Prefers email communication over phone. Has purchased 3 products: SmartHome Hub, Weather Station, and Security Camera. Previous issues resolved: 2 technical support tickets, 1 billing inquiry. Customer satisfaction rating: 4.5/5. Prefers detailed explanations and written documentation.`,
    containerTag: 'cust_001',
    metadata: {
      type: 'customer_profile',
      customerId: 'cust_001',
      category: 'profile',
      priority: 'medium',
      timestamp: Date.now(),
      customerName: 'Sarah Johnson',
      customerSince: '2024-03-15',
      subscription: 'premium',
      products: ['SmartHome Hub', 'Weather Station', 'Security Camera'],
      satisfactionRating: 4.5,
      communicationPreference: 'email'
    }
  },
  {
    content: `Ticket #TKT-001: SmartHome Hub Not Connecting to WiFi

Customer: Sarah Johnson (cust_001)
Issue: Device unable to connect to home WiFi network
Date: 2024-12-10
Resolution: Guided customer through router settings reset and device re-pairing. Issue resolved in 45 minutes.
Follow-up: Customer confirmed working, satisfaction rating 5/5.
Notes: Customer has dual-band router, needed to switch to 2.4GHz band.`,
    containerTag: 'cust_001',
    metadata: {
      type: 'ticket_resolution',
      customerId: 'cust_001',
      ticketId: 'TKT-001',
      category: 'technical_support',
      priority: 'high',
      timestamp: Date.now() - 86400000 * 20,
      issue: 'WiFi connection',
      resolutionTime: 45,
      satisfaction: 5
    }
  },
  {
    content: `Ticket #TKT-002: Billing Question - Unexpected Charge

Customer: Sarah Johnson (cust_001)
Issue: Customer questioned $19.99 charge on credit card statement
Date: 2024-12-15
Resolution: Explained charge was for premium subscription renewal. Customer had forgotten about annual renewal. Provided invoice details and renewal date.
Follow-up: Customer satisfied, no further questions.
Notes: Customer appreciates clear billing explanations.`,
    containerTag: 'cust_001',
    metadata: {
      type: 'ticket_resolution',
      customerId: 'cust_001',
      ticketId: 'TKT-002',
      category: 'billing',
      priority: 'medium',
      timestamp: Date.now() - 86400000 * 15,
      issue: 'billing inquiry',
      resolutionTime: 20,
      satisfaction: 5
    }
  },
  {
    content: `Customer Profile: Michael Chen (cust_002)

Customer since January 2024. Standard subscription. Technical-savvy, prefers quick solutions. Has purchased 2 products: Weather Station and Smart Thermostat. Previous issues: 1 setup assistance, 1 firmware update question. Customer satisfaction rating: 4.0/5. Often provides technical feedback on products.`,
    containerTag: 'cust_002',
    metadata: {
      type: 'customer_profile',
      customerId: 'cust_002',
      category: 'profile',
      priority: 'medium',
      timestamp: Date.now(),
      customerName: 'Michael Chen',
      customerSince: '2024-01-20',
      subscription: 'standard',
      products: ['Weather Station', 'Smart Thermostat'],
      satisfactionRating: 4.0,
      communicationPreference: 'chat',
      technicalLevel: 'advanced'
    }
  },
  {
    content: `Ticket #TKT-003: Weather Station Data Not Syncing

Customer: Michael Chen (cust_002)
Issue: Weather station not uploading data to cloud dashboard
Date: 2024-12-08
Resolution: Customer had outdated firmware. Guided through firmware update process. Issue resolved in 30 minutes.
Follow-up: Customer suggested adding auto-update feature to firmware.
Notes: Customer provided valuable feedback on product improvement.`,
    containerTag: 'cust_002',
    metadata: {
      type: 'ticket_resolution',
      customerId: 'cust_002',
      ticketId: 'TKT-003',
      category: 'technical_support',
      priority: 'medium',
      timestamp: Date.now() - 86400000 * 22,
      issue: 'data sync',
      resolutionTime: 30,
      satisfaction: 4,
      customerFeedback: 'Add auto-update feature'
    }
  },
  {
    content: `Customer Profile: Emma Rodriguez (cust_003)

Customer since November 2024. New customer, first-time buyer. Purchased Security Camera System. Previous issues: None. Customer satisfaction rating: 5/5. Very patient and appreciative of detailed guidance. Prefers phone support.`,
    containerTag: 'cust_003',
    metadata: {
      type: 'customer_profile',
      customerId: 'cust_003',
      category: 'profile',
      priority: 'medium',
      timestamp: Date.now(),
      customerName: 'Emma Rodriguez',
      customerSince: '2024-11-05',
      subscription: 'standard',
      products: ['Security Camera System'],
      satisfactionRating: 5.0,
      communicationPreference: 'phone',
      experienceLevel: 'beginner'
    }
  },
  {
    content: `Ticket #TKT-004: Security Camera Setup Assistance

Customer: Emma Rodriguez (cust_003)
Issue: Customer needed help setting up security camera system
Date: 2024-11-10
Resolution: Provided step-by-step phone guidance for camera placement, app installation, and network configuration. Setup completed in 60 minutes.
Follow-up: Customer very satisfied, left positive review.
Notes: Customer mentioned this was first security camera purchase.`,
    containerTag: 'cust_003',
    metadata: {
      type: 'ticket_resolution',
      customerId: 'cust_003',
      ticketId: 'TKT-004',
      category: 'setup',
      priority: 'high',
      timestamp: Date.now() - 86400000 * 50,
      issue: 'setup assistance',
      resolutionTime: 60,
      satisfaction: 5
    }
  },
  {
    content: `Customer Profile: James Wilson (cust_004)

Customer since October 2024. Premium subscription. Business customer, purchased 5 Weather Stations for office locations. Previous issues: 2 bulk order inquiries, 1 multi-site setup. Customer satisfaction rating: 4.2/5. Requires priority support due to business needs.`,
    containerTag: 'cust_004',
    metadata: {
      type: 'customer_profile',
      customerId: 'cust_004',
      category: 'profile',
      priority: 'high',
      timestamp: Date.now(),
      customerName: 'James Wilson',
      customerSince: '2024-10-01',
      subscription: 'premium',
      products: ['Weather Station x5'],
      satisfactionRating: 4.2,
      communicationPreference: 'email',
      customerType: 'business',
      prioritySupport: true
    }
  },
  {
    content: `Ticket #TKT-005: Bulk Order Discount Inquiry

Customer: James Wilson (cust_004)
Issue: Customer asked about volume discounts for additional Weather Stations
Date: 2024-10-15
Resolution: Provided bulk pricing tiers: 10+ units 15% off, 25+ units 20% off, 50+ units 25% off. Customer considering larger order.
Follow-up: Customer thanked for quick response, will decide next quarter.
Notes: Business customer with expansion plans.`,
    containerTag: 'cust_004',
    metadata: {
      type: 'ticket_resolution',
      customerId: 'cust_004',
      ticketId: 'TKT-005',
      category: 'sales',
      priority: 'medium',
      timestamp: Date.now() - 86400000 * 75,
      issue: 'bulk pricing',
      resolutionTime: 15,
      satisfaction: 4,
      customerType: 'business'
    }
  },
  {
    content: `Customer Profile: Lisa Park (cust_005)

Customer since December 2024. Standard subscription. Elderly customer, purchased Smart Thermostat for home. Previous issues: 1 setup help, 2 usage questions. Customer satisfaction rating: 4.8/5. Requires patient, simple explanations. Daughter often assists with technical issues.`,
    containerTag: 'cust_005',
    metadata: {
      type: 'customer_profile',
      customerId: 'cust_005',
      category: 'profile',
      priority: 'medium',
      timestamp: Date.now(),
      customerName: 'Lisa Park',
      customerSince: '2024-12-01',
      subscription: 'standard',
      products: ['Smart Thermostat'],
      satisfactionRating: 4.8,
      communicationPreference: 'phone',
      experienceLevel: 'beginner',
      ageGroup: 'senior',
      hasFamilyAssistance: true
    }
  },
  {
    content: `Ticket #TKT-006: Smart Thermostat Programming Help

Customer: Lisa Park (cust_005)
Issue: Customer needed help programming thermostat schedules
Date: 2024-12-05
Resolution: Daughter called on customer's behalf. Provided simplified programming guide with pictures. Setup completed successfully.
Follow-up: Customer happy with thermostat, daughter expressed appreciation for patience.
Notes: Consider adding senior-friendly setup guides.`,
    containerTag: 'cust_005',
    metadata: {
      type: 'ticket_resolution',
      customerId: 'cust_005',
      ticketId: 'TKT-006',
      category: 'setup',
      priority: 'medium',
      timestamp: Date.now() - 86400000 * 25,
      issue: 'programming help',
      resolutionTime: 35,
      satisfaction: 5,
      assistance: 'daughter'
    }
  },
  {
    content: `Customer Profile: David Thompson (cust_006)

Customer since September 2024. Premium subscription. Technical professional, purchased all product types. Previous issues: 3 advanced technical questions, 2 feature requests. Customer satisfaction rating: 3.8/5. Very knowledgeable but critical of product limitations. Often suggests improvements.`,
    containerTag: 'cust_006',
    metadata: {
      type: 'customer_profile',
      customerId: 'cust_006',
      category: 'profile',
      priority: 'medium',
      timestamp: Date.now(),
      customerName: 'David Thompson',
      customerSince: '2024-09-10',
      subscription: 'premium',
      products: ['SmartHome Hub', 'Weather Station', 'Security Camera', 'Smart Thermostat'],
      satisfactionRating: 3.8,
      communicationPreference: 'email',
      technicalLevel: 'expert',
      feedbackStyle: 'critical'
    }
  },
  {
    content: `Ticket #TKT-007: API Integration Request

Customer: David Thompson (cust_006)
Issue: Customer requested API access for custom home automation integration
Date: 2024-09-20
Resolution: Explained API availability for premium customers, provided documentation link. Customer successfully integrated with Home Assistant.
Follow-up: Customer provided positive feedback on API documentation quality.
Notes: Customer suggested additional API endpoints for future releases.`,
    containerTag: 'cust_006',
    metadata: {
      type: 'ticket_resolution',
      customerId: 'cust_006',
      ticketId: 'TKT-007',
      category: 'technical_support',
      priority: 'medium',
      timestamp: Date.now() - 86400000 * 100,
      issue: 'API integration',
      resolutionTime: 25,
      satisfaction: 4,
      integration: 'Home Assistant'
    }
  },
  {
    content: `Customer Profile: Amanda White (cust_007)

Customer since February 2024. Standard subscription. Small business owner, purchased 3 Security Cameras for retail store. Previous issues: 1 installation question, 1 remote access setup. Customer satisfaction rating: 4.6/5. Needs weekend support availability.`,
    containerTag: 'cust_007',
    metadata: {
      type: 'customer_profile',
      customerId: 'cust_007',
      category: 'profile',
      priority: 'medium',
      timestamp: Date.now(),
      customerName: 'Amanda White',
      customerSince: '2024-02-20',
      subscription: 'standard',
      products: ['Security Camera x3'],
      satisfactionRating: 4.6,
      communicationPreference: 'email',
      customerType: 'business',
      businessType: 'retail',
      supportNeeds: 'weekend'
    }
  },
  {
    content: `Ticket #TKT-008: Remote Camera Access Setup

Customer: Amanda White (cust_007)
Issue: Customer needed help setting up remote viewing for store cameras
Date: 2024-02-25
Resolution: Guided through port forwarding and app setup. Customer now monitoring store remotely.
Follow-up: Customer satisfied, mentioned improved store security.
Notes: Weekend support would have been helpful for this setup.`,
    containerTag: 'cust_007',
    metadata: {
      type: 'ticket_resolution',
      customerId: 'cust_007',
      ticketId: 'TKT-008',
      category: 'setup',
      priority: 'high',
      timestamp: Date.now() - 86400000 * 340,
      issue: 'remote access',
      resolutionTime: 45,
      satisfaction: 5,
      businessType: 'retail'
    }
  },
  {
    content: `Customer Profile: Robert Garcia (cust_008)

Customer since January 2025. New customer, first-time buyer. Purchased SmartHome Hub. Previous issues: None yet. Customer satisfaction rating: N/A. Young professional, tech-savvy, prefers chat support.`,
    containerTag: 'cust_008',
    metadata: {
      type: 'customer_profile',
      customerId: 'cust_008',
      category: 'profile',
      priority: 'low',
      timestamp: Date.now(),
      customerName: 'Robert Garcia',
      customerSince: '2025-01-15',
      subscription: 'standard',
      products: ['SmartHome Hub'],
      satisfactionRating: null,
      communicationPreference: 'chat',
      technicalLevel: 'intermediate',
      ageGroup: 'young_adult'
    }
  }
];

async function seedCustomerCareMemories() {
  if (!API_KEY) {
    console.error('Error: SUPERMEMORY_API_KEY environment variable is required');
    process.exit(1);
  }

  console.log('Seeding customer care demo memories...');

  const client = new Supermemory({ apiKey: API_KEY });

  let successCount = 0;
  let errorCount = 0;

  for (const memory of customerMemories) {
    try {
      await client.memories.add({
        content: memory.content,
        containerTag: memory.containerTag,
        metadata: memory.metadata
      });
      successCount++;
      console.log(`✓ Added memory ${successCount}/${customerMemories.length}`);
    } catch (error) {
      errorCount++;
      console.error(`✗ Failed to add memory:`, error);
    }
  }

  console.log(`\nSeeding complete!`);
  console.log(`Successfully added: ${successCount} memories`);
  console.log(`Failed: ${errorCount} memories`);
}

seedCustomerCareMemories();
