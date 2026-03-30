export interface User {
  id: string;
  name: string;
  phone: string;
  budget: number; // in INR
  preferences: string[];
}

export interface Property {
  id: string;
  title: string;
  location: string;
  price: number; // in INR
  bhk: number;
  bathrooms: number;
  status: 'Available' | 'Pending' | 'Sold';
  description: string;
}

export const MockUsers: User[] = [
  {
    id: "u1",
    name: "Rahul Sharma",
    phone: "+919876543210",
    budget: 15000000, // 1.5 CR
    preferences: ["gated community", "vaastu compliant", "hyderabad", "amenities"]
  },
  {
    id: "u2",
    name: "Priya Patel",
    phone: "+919988776655",
    budget: 8500000, // 85 Lakhs
    preferences: ["bengaluru", "near metro", "apartment"]
  }
];

export const MockProperties: Property[] = [
  {
    id: "p1",
    title: "Prestige High Fields Apartment",
    location: "hyderabad",
    price: 18000000, // 1.8 CR
    bhk: 3,
    bathrooms: 3,
    status: "Available",
    description: "A premium 3 BHK apartment in Gachibowli, Hyderabad. Fully Vaastu compliant with world-class amenities and 24/7 security."
  },
  {
    id: "p2",
    title: "Lodha Bellissimo Flats",
    location: "mumbai",
    price: 45000000, // 4.5 CR
    bhk: 4,
    bathrooms: 4,
    status: "Available",
    description: "Luxury 4 BHK flat in Mahalaxmi, Mumbai with stunning sea views and exceptional layout."
  },
  {
    id: "p3",
    title: "Brigade Gateway Apartment",
    location: "bengaluru",
    price: 12000000, // 1.2 CR
    bhk: 2,
    bathrooms: 2,
    status: "Pending",
    description: "Spacious 2 BHK located in Rajajinagar, Bengaluru. Very close to the metro station and IT parks."
  },
  {
    id: "p4",
    title: "Aparna Sarovar Zenith Flat",
    location: "hyderabad",
    price: 10500000, // 1.05 CR
    bhk: 2,
    bathrooms: 2,
    status: "Sold",
    description: "A beautiful, newly constructed 2 BHK flat in Nallagandla. Excellent community and lake view."
  }
];
