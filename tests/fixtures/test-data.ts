export const testUsers = {
  admin: {
    email: "admin@sacco.com",
    password: "admin123",
    name: "System Administrator",
    role: "ADMIN",
  },
  manager: {
    email: "manager@sacco.com",
    password: "manager123",
    name: "SACCO Manager",
    role: "MANAGER",
  },
  member: {
    email: "member@sacco.com",
    password: "member123",
    name: "John Doe",
    role: "MEMBER",
  },
}

export const testMembers = {
  newMember: {
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "+254712345678",
    nationalId: "12345678",
    address: "123 Test Street, Nairobi",
  },
  existingMember: {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+254787654321",
    nationalId: "87654321",
    address: "456 Sample Avenue, Mombasa",
  },
}

export const testLoans = {
  personalLoan: {
    amount: 50000,
    purpose: "Business expansion",
    term: 12,
    interestRate: 12,
  },
  emergencyLoan: {
    amount: 25000,
    purpose: "Medical emergency",
    term: 6,
    interestRate: 15,
  },
}

export const testContributions = {
  monthly: {
    amount: 5000,
    type: "MONTHLY",
    description: "Monthly contribution",
  },
  special: {
    amount: 10000,
    type: "SPECIAL",
    description: "Special project contribution",
  },
}
