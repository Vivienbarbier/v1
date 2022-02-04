export const menuItems = [
    {
        id: 1,
        label: "menuitems.menu.text",
        isTitle: true
    },
    {
        id: 2,
        label: "menuitems.dashboard.text",
        icon: "bx-home-circle",
        link: "/"
    },
    {
        id: 4,
        label: "menuitems.apps.text",
        isTitle: true
    },
    {
        id: 5,
        label: "menuitems.case.list.create",
        icon: "bx-briefcase-alt-2",
        link: "/case/create",
    },
    {
        id: 52,
        label: "menuitems.case.list.list",
        icon: "bx-briefcase-alt-2",
        link: "/case",
    },    
    {
        id: 6,
        label: "menuitems.planning.text",
        icon: "bx bx-calendar",
        link: "/planning",
    },
    {
        id: 7,
        label: "menuitems.billing.text",
        icon: "bx-receipt",
        link: "/billing",
    },
    {
        id: 8,
        label: "menuitems.admin.text",
        link: "/",
        icon: "bx bx-sitemap",
        subItems: [
            {
                id: 41,
                label: "menuitems.admin.list.groups",
                link: "/admin/groups",
                icon: "bx bx-sitemap",
                parentId: 8
            }
        ]
    }
];

