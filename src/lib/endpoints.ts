export const endpoints = {
  auth: {
    me: "/api/auth/me"
  },
  homestays: {
    list: "/api/homestays",
    detail: (id: string) => `/api/homestays/${id}`
  },
  bookings: {
    create: "/api/bookings",
    mine: "/api/me/bookings",
    detail: (id: string) => `/api/bookings/${id}`,
    addService: (id: string) => `/api/bookings/${id}/services`,
    serviceStatus: (id: string, serviceOrderId: string) => `/api/bookings/${id}/services/${serviceOrderId}/status`,
    status: (id: string) => `/api/bookings/${id}/status`
  },
  owner: {
    homestays: "/api/owner/homestays",
    homestay: (homestayId: string) => `/api/owner/homestays/${homestayId}`,
    images: (homestayId: string) => `/api/owner/homestays/${homestayId}/images`,
    rooms: (homestayId: string) => `/api/owner/homestays/${homestayId}/rooms`,
    room: (homestayId: string, roomId: string) => `/api/owner/homestays/${homestayId}/rooms/${roomId}`,
    rates: (homestayId: string, roomId: string) => `/api/owner/homestays/${homestayId}/rooms/${roomId}/rates`,
    services: (homestayId: string) => `/api/owner/homestays/${homestayId}/services`,
    service: (homestayId: string, serviceId: string) => `/api/owner/homestays/${homestayId}/services/${serviceId}`,
    bookings: "/api/owner/bookings",
    bookingStatus: (id: string) => `/api/owner/bookings/${id}/status`,
    proxyBookings: "/api/owner/proxy-bookings"
  },
  payments: {
    initiate: "/api/payments/initiate",
    status: (bookingId: string) => `/api/payments/${bookingId}/status`,
    manualPaid: (bookingId: string) => `/api/payments/${bookingId}/manual-paid`
  },
  cms: {
    articles: "/api/cms/articles",
    publicArticles: "/api/cms/articles/public",
    publicArticle: (slug: string) => `/api/cms/articles/public/${slug}`,
    article: (id: string) => `/api/cms/articles/${id}`,
    publish: (id: string) => `/api/cms/articles/${id}/publish`,
    unpublish: (id: string) => `/api/cms/articles/${id}/unpublish`
  },
  admin: {
    dashboard: "/api/admin/dashboard",
    users: "/api/admin/users",
    user: (id: string) => `/api/admin/users/${id}`,
    ban: (id: string) => `/api/admin/users/${id}/ban`,
    unban: (id: string) => `/api/admin/users/${id}/unban`,
    role: (id: string) => `/api/admin/users/${id}/role`,
    reports: "/api/admin/reports",
    resolveReport: (id: string) => `/api/admin/reports/${id}/resolve`
  }
} as const;
