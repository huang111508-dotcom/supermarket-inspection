
export interface Standard {
    name: string;
    score: number;
    maxScore: number;
    criteria: string;
}

export interface Item {
    name: string;
    standards: Standard[];
}

export interface Deduction {
    item: string;
    standard: string;
    score: number;
    maxScore: number;
    criteria: string;
}

export interface AreaData {
    name?: string; // For display purposes
    items: Item[];
    score: number;
    maxScore: number;
    completed: boolean;
    deductions: Deduction[];
    redLine: string[];
    employee?: string; // The employee being inspected
}

// New Interface for stored records
export interface InspectionRecord extends AreaData {
    id: string; // Unique ID for the record (Firestore Doc ID)
    shop: string; // Store name
    areaKey: string; // e.g., 'vegetables'
    timestamp: string; // ISO String
    monthStr: string; // e.g. "2023-10" for easy grouping
    inspector?: string; // The person who performed this specific inspection
}

export interface Areas {
    [key: string]: AreaData;
    vegetables: AreaData;
    grocery: AreaData;
    seafood: AreaData;
    meat: AreaData;
    deli: AreaData;
    cashier: AreaData;
}

export interface InspectionData {
    inspector: string;
    shop: string;
    date: string;
    areas: Areas; // Represents the "Current Working State" of the form
    records: InspectionRecord[]; // Added: List of completed inspections
}

export type EmployeeConfig = {
    [storeName: string]: {
        [areaKey: string]: string[];
    }
}

export interface AppConfig {
    stores: string[];
    areas: { key: string; label: string; }[];
}

export type ViewState = 'inspector-info' | 'area-selection' | 'inspection' | 'results' | 'management';
