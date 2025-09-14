
export type User = {
  id: string
  fullName: string
  email: string
  avatar: string
  role: "admin" | "staff" | "client"
  organization: string
  lastLogin: string
  status: "active" | "inactive"
}

export const users: User[] = [
  {
    id: "user_1",
    fullName: "John Doe",
    email: "john.doe@innovate.com",
    avatar: "https://picsum.photos/seed/101/40/40",
    role: "staff",
    organization: "Innovate Inc.",
    lastLogin: "3 hours ago",
    status: "active",
  },
  {
    id: "user_2",
    fullName: "Jane Smith",
    email: "jane.smith@finsol.com",
    avatar: "https://picsum.photos/seed/102/40/40",
    role: "client",
    organization: "Finance Solutions",
    lastLogin: "1 day ago",
    status: "active",
  },
  {
    id: "user_3",
    fullName: "Admin User",
    email: "admin@givanas.com",
    avatar: "https://picsum.photos/seed/103/40/40",
    role: "admin",
    organization: "Givanas Nigeria LTD",
    lastLogin: "5 minutes ago",
    status: "active",
  },
  {
    id: "user_4",
    fullName: "Peter Jones",
    email: "peter.jones@innovate.com",
    avatar: "https://picsum.photos/seed/104/40/40",
    role: "staff",
    organization: "Innovate Inc.",
    lastLogin: "2 weeks ago",
    status: "inactive",
  },
  {
    id: "user_5",
    fullName: "Mary Garcia",
    email: "mary.garcia@healthwell.com",
    avatar: "https://picsum.photos/seed/105/40/40",
    role: "client",
    organization: "HealthWell Group",
    lastLogin: "1 hour ago",
    status: "active",
  },
    {
    id: "user_6",
    fullName: "David Wilson",
    email: "david.wilson@retailgroup.com",
    avatar: "https://picsum.photos/seed/106/40/40",
    role: "client",
    organization: "Retail Emporium",
    lastLogin: "5 days ago",
    status: "active",
  },
]
