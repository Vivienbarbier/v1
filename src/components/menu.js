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
        id: 7,
        isLayout: true
    },
    {
        id: 8,
        label: "menuitems.apps.text",
        isTitle: true
    },
    {
        id: 9,
        label: "menuitems.case.text",
        icon: "bx-briefcase-alt-2",
        subItems: [
            {
                id: 41,
                label: "menuitems.case.list.create",
                link: "/",
                parentId: 37
            },
            {
                id: 39,
                label: "menuitems.case.list.list",
                link: "/",
                parentId: 37
            },
            {
                id: 39,
                label: "menuitems.case.list.grid",
                link: "/",
                parentId: 37
            }
        ]
    },    
    {
        id: 10,
        label: "menuitems.planning.text",
        icon: "bx bx-calendar",
        link: "/",
    },
    {
        id: 34,
        label: "menuitems.invoicing.text",
        icon: "bx-receipt",
        link: "/",
    },
    {
        id: 7,
        isLayout: true
    },
   {
        id: 11,
        label: "menuitems.settings.text",
        link: "/",
        icon: "bx bx-slider"
    }
];

