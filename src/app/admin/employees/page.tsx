"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, MoreHorizontal } from "lucide-react";

const employees = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah@coco.com",
    role: "rep_l1",
    tickets: 127,
    rating: 4.8,
    status: "active",
  },
  {
    id: 2,
    name: "Mike Chen",
    email: "mike@coco.com",
    role: "rep_l1",
    tickets: 98,
    rating: 4.6,
    status: "active",
  },
  {
    id: 3,
    name: "Emily Davis",
    email: "emily@coco.com",
    role: "rep_l2",
    tickets: 85,
    rating: 4.9,
    status: "active",
  },
  {
    id: 4,
    name: "Alex Kumar",
    email: "alex@coco.com",
    role: "rep_l1",
    tickets: 142,
    rating: 4.5,
    status: "active",
  },
  {
    id: 5,
    name: "Lisa Wang",
    email: "lisa@coco.com",
    role: "rep_l3",
    tickets: 45,
    rating: 4.7,
    status: "inactive",
  },
];

const roleLabels: Record<string, string> = {
  rep_l1: "L1 Support",
  rep_l2: "L2 Support",
  rep_l3: "L3 Support",
  admin_manager: "Manager",
};

export default function AdminEmployees() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Employees</h1>
          <p className="text-muted-foreground">Manage support team members</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Employee
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search employees..." className="pl-9" />
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="p-4 font-medium">Employee</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium">Tickets</th>
                <th className="p-4 font-medium">Rating</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium" />
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr
                  key={emp.id}
                  className="border-b last:border-0 hover:bg-muted/50"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-xs text-primary">
                          {emp.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{emp.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {emp.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">{roleLabels[emp.role]}</td>
                  <td className="p-4">{emp.tickets}</td>
                  <td className="p-4">{emp.rating}</td>
                  <td className="p-4">
                    <Badge
                      variant={
                        emp.status === "active" ? "default" : "secondary"
                      }
                    >
                      {emp.status}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
