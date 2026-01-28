export interface RoutingItem {
  from: string;
  to: string;
  dateSent: string;
  dateReceived: string;
}

export interface Veneer {
  id: string;
  name: string;
  imageUrl: string;
  description?: string;
}

export type Glossiness = 'Matte' | 'Semi-Gloss' | 'High-Gloss' | 'Custom';

export interface LineItem {
  id: string;
  itemNo: string;
  copies: number;
  date: string;
  specSection: string;
  description: string;
  veneer?: Veneer;
  glossiness?: string;
  color?: string;
  dimensions?: string; // e.g., "W5200×D1300×H780 mm"
  model?: string; // Model number/code
  itemImages?: string[]; // Product images for this specific item
  action: string;
  reviewerInitials: string;
  comments: string;

  // Invoice Fields
  barcode?: string;
  unitPrice?: number;
  discount?: number;
  taxes?: number; // Check if this should be percent or amount? Based on image "15%", likely percent.
  amount?: number;
}

export interface Deviation {
  id: string;
  no: string;
  description: string;
}

export interface SubmittalData {
  // Header
  submittalNo: string;
  specSection: string;
  submittalDescription: string;

  // Project Info
  contractNo: string;
  projectTitle: string;
  contractorName: string;

  // Routing
  routing: RoutingItem[];

  // Checkboxes
  attached: boolean;
  separateCover: boolean;
  forInfo: boolean;
  forReview: boolean;

  // Body
  remarks: string;
  lineItems: LineItem[];

  // Certification
  certificationType: 'A' | 'B';
  deviations: Deviation[];

  // Signatures
  contractorSignature: string;
  contractorSignDate: string;

  // Design
  accentColor: string;
  logo?: string; // Base64
  images: string[]; // Base64 product images

  // New Fields
  priority?: string;
  revision?: string;
  dueDate?: string;
}



export const INITIAL_DATA: SubmittalData = {
  submittalNo: "SUB-FEF-001",
  specSection: "06400",
  submittalDescription: "Custom Joinery - Main Lobby Reception Desk",
  contractNo: "CNT-2024-FE",
  projectTitle: "Luxury Hotel Renovation",
  contractorName: "Forest Edge Factory",
  routing: [
    { from: "Forest Edge", to: "Consultant", dateSent: "", dateReceived: "" },
    { from: "Consultant", to: "Client", dateSent: "", dateReceived: "" },
  ],
  attached: true,
  separateCover: false,
  forInfo: false,
  forReview: true,
  remarks: "",
  lineItems: [
    {
      id: "1",
      itemNo: "1.0",
      copies: 1,
      date: new Date().toISOString().split('T')[0],
      specSection: "06400.1",
      description: "Material Sample - Oak Veneer Finish",
      action: "",
      reviewerInitials: "",
      comments: "",
      barcode: "0000024598",
      unitPrice: 2100.00,
      discount: 0,
      taxes: 15,
      amount: 2415.00
    }
  ],
  certificationType: 'A',
  deviations: [],
  contractorSignature: "",
  contractorSignDate: new Date().toISOString().split('T')[0],
  accentColor: "#5D4037",
  logo: "/logo.png",
  images: [],
  priority: "Medium",
  revision: "0",
  dueDate: ""
};