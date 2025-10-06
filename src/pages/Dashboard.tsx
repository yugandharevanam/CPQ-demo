import { memo } from "react"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Link } from 'react-router-dom';

const Dashboard = memo(function Dashboard() {

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card">
            <Card className="@container/card">
              <Link
                to="/doctype/Customer"
                className='w-full h-full'
              >
                <CardHeader className="relative">
                  <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                    Customers
                  </CardTitle>
                  <CardDescription>Manage your customer database</CardDescription>
                </CardHeader>
              </Link>
            </Card>
            <Card className="@container/card">
              <Link
                to="/doctype/Customer"
                className='w-full h-full'
              >
                <CardHeader className="relative">
                  <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                    Items
                  </CardTitle>
                  <CardDescription>Manage your items inventory</CardDescription>
                </CardHeader>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Dashboard;