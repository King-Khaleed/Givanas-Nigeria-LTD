
export type Organization = {
  id: string
  name: string
  industry: string
  admin: {
    name: string
    email: string
    avatar: string
  }
  totalRecords: number
  lastActivity: string
  status: "active" | "inactive"
}

export const organizations: Organization[] = [
  {
    id: "org_1",
    name: "Innovate Inc.",
    industry: "Technology",
    admin: {
      name: "Alex Johnson",
      email: "alex@innovate.com",
      avatar: "https://picsum.photos/seed/101/40/40",
    },
    totalRecords: 125,
    lastActivity: "2 hours ago",
    status: "active",
  },
  {
    id: "org_2",
    name: "Finance Solutions",
    industry: "Finance",
    admin: {
      name: "Samantha Miller",
      email: "samantha@finsol.com",
      avatar: "https://picsum.photos/seed/102/40/40",
    },
    totalRecords: 340,
    lastActivity: "1 day ago",
    status: "active",
  },
  {
    id: "org_3",
    name: "HealthWell Group",
    industry: "Healthcare",
    admin: {
      name: "Michael Brown",
      email: "michael@healthwell.com",
      avatar: "https://picsum.photos/seed/103/40/40",
    },
    totalRecords: 88,
    lastActivity: "5 days ago",
    status: "inactive",
  },
  {
    id: "org_4",
    name: "Retail Emporium",
    industry: "Retail",
    admin: {
      name: "Jessica Davis",
      email: "jessica@retailgroup.com",
      avatar: "https://picsum.photos/seed/104/40/40",
    },
    totalRecords: 512,
    lastActivity: "1 hour ago",
    status: "active",
  },
  {
    id: "org_5",
    name: "EducaWorld",
    industry: "Education",
    admin: {
      name: "Chris Wilson",
      email: "chris@educaworld.com",
      avatar: "https://picsum.photos/seed/105/40/40",
    },
    totalRecords: 45,
    lastActivity: "3 weeks ago",
    status: "inactive",
  },
]
