import { memo } from "react"
import {
    DraftingCompass,
    LayoutDashboardIcon,
    LifeBuoy,
} from "lucide-react"
import { Link } from "react-router-dom"

import { NavMain } from "@/components/layout/nav-main"
import { NavProjects } from "@/components/layout/nav-projects"
import { NavSecondary } from "@/components/layout/nav-secondary"
import { NavUser } from "@/components/layout/nav-user"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Image } from "../ui/image"

// Move data outside component to prevent recreation on every render
const SIDEBAR_DATA = {
    navMain: [
        {
            title: "Dashboard",
            url: "/",
            icon: LayoutDashboardIcon,
        },
    ],
    projects: [
        {
            name: "CPQ",
            url: "/lift-plan",
            icon: DraftingCompass,
        }
    ],
    navSecondary: [
        {
            title: "Support",
            url: "https://emperorlifts.com/contact/",
            icon: LifeBuoy,
        },
    ]
}

export const AppSidebar = memo(function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="data-[slot=sidebar-menu-button]:!p-1.5"
                        >
                            <Link to="/">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground">
                                    <Image src="/Evanam Logo.png" alt="Evanam-logo" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">Evanam CPQ Demo</span>
                                    <span className="truncate text-xs">Enterprise</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={SIDEBAR_DATA.navMain} />
                <NavProjects items={SIDEBAR_DATA.projects} />
                <NavSecondary items={SIDEBAR_DATA.navSecondary} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    )
})
