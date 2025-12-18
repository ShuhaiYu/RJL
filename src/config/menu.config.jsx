export const MENU_SIDEBAR = [
  {
    heading: "User",
  },
  {
    title: "Dashboard",
    icon: "home",
    path: "/",
  },
  {
    title: "My Profile",
    icon: "profile-circle",
    path: "/public-profile/profiles/crm",
  },
  {
    title: "User",
    icon: "users",
    children: [
      {
        title: "User List",
        icon: "users",
        path: "/users",
        permissions: {
          user: ["create"],
        }
      },
      {
        title: "Create User",
        icon: "plus-circle",
        path: "/public-profile/profiles/create",
        permissions: {
          user: ["create"],
        }
      },
    ],
  },

  {
    title: "Agency",
    icon: "people",
    children: [
      {
        title: "Agency List",
        icon: "users",
        path: "/agencies/my-agencies",
        permissions: {
          agency: ["create"],
        }
      },
      {
        title: "Create Agency",
        icon: "plus-circle",
        path: "/agencies/create-agency",
        permissions: {
          agency: ["create"],
        }
      },
    ],
  },

  {
    title: "Property",
    icon: "home-3",
    children: [
      {
        title: "Property List",
        icon: "home-3",
        path: "/property/my-properties",
        permissions: {
          property: ["read"],
        }
      },
      {
        title: "Create Property",
        icon: "plus-circle",
        path: "/property/create",
        permissions: {
          property: ["create"],
        }
      },
    ],
  },
  {
    title: "Job Order",
    icon: "scroll",
    permissions: {
      task: ["read"],
    },
    children: [
      {
        title: "All",
        icon: "plus-circle",
        path: "/property/tasks",
      },
      {
        title: "Unknown",
        icon: "plus-circle",
        path: "/property/tasks?status=UNKNOWN",
        permissions: {
          agency: ["create"],
        },
      },
      {
        title: "Incomplete",
        icon: "plus-circle",
        path: "/property/tasks?status=INCOMPLETE",
        permissions: {
          task: ["read"],
        },
      },
      {
        title: "Processing",
        icon: "plus-circle",
        path: "/property/tasks?status=PROCESSING",
        permissions: {
          task: ["read"],
        },
      },

      {
        title: "Completed",
        icon: "plus-circle",
        path: "/property/tasks?status=COMPLETED",
        permissions: {
          task: ["read"],
        },
      },
      {
        title: "Due Soon",
        icon: "plus-circle",
        path: "/property/tasks?status=DUE_SOON",
        permissions: {
          task: ["read"],
        },
      },
      {
        title: "Expired",
        icon: "plus-circle",
        path: "/property/tasks?status=EXPIRED",
        permissions: {
          task: ["read"],
        },
      },
      {
        title: "Smoke Alarm",
        icon: "plus-circle",
        path: "/property/tasks?type=SMOKE_ALARM",
        permissions: {
          task: ["read"],
        },
      },
      {
        title: "Gas & Electricity",
        icon: "plus-circle",
        path: "/property/tasks?type=GAS_%26_ELECTRICITY",
        permissions: {
          task: ["read"],
        },
      },
      {
        title: "Create Job Order",
        icon: "plus-circle",
        path: "/property/tasks/create",
        permissions: {
          task: ["create"],
        },
      },
    ],
  },

  // ====== Inspection ======
  {
    title: "Inspection",
    icon: "calendar-tick",
    permissions: {
      inspection: ["read"],
    },
    children: [
      {
        title: "Schedules",
        icon: "calendar",
        path: "/inspection",
        permissions: {
          inspection: ["read"],
        },
      },
      {
        title: "Bookings",
        icon: "notepad-bookmark",
        path: "/inspection/bookings",
        permissions: {
          inspection: ["read"],
        },
      },
    ],
  },
  // ====== /Inspection ======

  // ====== VEU ======
  {
    title: "VEU",
    icon: "element-11",
    permissions: {
      veu_project: ["read"],
    },
    children: [
      {
        title: "VEU Dashboard",
        icon: "element-11",
        path: "/veu/dashboard",
        permissions: {
          veu_project: ["read"],
        },
      },
      {
        title: "Incomplete VEU",
        icon: "element-11",
        path: "/veu/incomplete",
        permissions: {
          veu_project: ["read"],
        },
      },
      {
        title: "Incomplete Water Heater",
        icon: "element-11",
        path: "/veu/incomplete/water-heater",
        permissions: {
          veu_project: ["read"],
        },
      },
      {
        title: "Incomplete Air Conditioner",
        icon: "element-11",
        path: "/veu/incomplete/air-conditioner",
        permissions: {
          veu_project: ["read"],
        },
      },
    ],
  },
  // ====== /VEU ======

  {
    title: "Email List",
    icon: "sms",
    path: "/emails",
  },

  {
    title: "Settings",
    icon: "setting-2",
    children: [
      {
        title: "System Setting",
        icon: "setting-2",
        path: "/setting/system",
        permissions: {
          // 需要setting: ["update"]权限才能显示system setting
          setting: ["update"],
        },
      },
      {
        title: "Data Import",
        icon: "setting-2",
        path: "/setting/import",
        permissions: {
          task: ["create"],
        },
      }
    ],
  },

  // {
  //   title: "Create Contact",
  //   icon: "plus-circle",
  //   path: "/contacts/create",
  //   permissions: {
  //     contact: ["create"],
  //   },
  // },
];
