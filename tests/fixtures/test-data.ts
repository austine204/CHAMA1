export const testUsers = {
  admin: {
    email: "admin@sacco.local",
    password: "admin123",
    role: "ADMIN",
  },
  member: {
    email: "member@sacco.local",
    password: "member123",
    role: "MEMBER",
  },
}

export const testMembers = [
  {
    memberNumber: "MBR-001",
    firstName: "John",
    lastName: "Doe",
    nationalId: "ID12345678",
    phone: "0712345678",
    email: "john.doe@example.com",
    address: "P.O. Box 123, Nairobi",
    status: "ACTIVE",
    kycVerified: true,
  },
  {
    memberNumber: "MBR-002",
    firstName: "Jane",
    lastName: "Smith",
    nationalId: "ID87654321",
    phone: "0787654321",
    email: "jane.smith@example.com",
    address: "P.O. Box 456, Mombasa",
    status: "ACTIVE",
    kycVerified: false,
  },
]

export const testLoans = [
  {
    principal: 50000,
    interestRate: 12,
    termMonths: 12,
    repaymentFrequency: "MONTHLY",
  },
  {
    principal: 100000,
    interestRate: 15,
    termMonths: 24,
    repaymentFrequency: "MONTHLY",
  },
]

export const testContributions = [
  {
    amount: 5000,
    type: "MONTHLY",
    source: "MANUAL",
  },
  {
    amount: 10000,
    type: "SHARES",
    source: "MPESA",
  },
]
