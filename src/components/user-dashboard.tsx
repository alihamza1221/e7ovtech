"use client";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Role } from "@repo/db/models/user";
import { Priority, TaskStatus } from "@repo/db/models/task";
import UserWorkspaceTable from "./user-workspace-table";
import PieCharCard from "./pie-chart-card";
import mongoose from "mongoose";
import { TimeLog } from "@repo/db/models/timelog";

// Mock data for the feature points
const featureData = {
  tasksCreated: 150,
  tasksCompleted: 75,
  activeProjects: 5,
  teamMembers: 12,
};

// Mock data for the user table
const inituserData = [
  { id: 1, name: "John Doe", role: "Admin", email: "john@example.com" },
  { id: 2, name: "Jane Smith", role: "Manager", email: "jane@example.com" },
  { id: 3, name: "Bob Johnson", role: "Developer", email: "bob@example.com" },
  { id: 4, name: "Alice Brown", role: "Designer", email: "alice@example.com" },
  {
    id: 5,
    name: "Charlie Wilson",
    role: "Developer",
    email: "charlie@example.com",
  },
];

const COLORS = [
  "hsl(var(--accent))",
  "hsl(var(--primary))",
  "hsl(var(--muted))",
];

interface TaskData {
  _id: string;
  label: string;
  priority: Priority;
  status: TaskStatus;
  deadLine: Date | string;
  createdAt: Date | string; // Same as above
  description: string;
}

export interface UserTasksDataByWorkspace {
  _id: string;
  tasks: TaskData[];
  workspaceId: string;
  workspaceName: string;
  workspaceDescription: string;
}
export function UserDashboardComponent() {
  const [allWorkspaceData, setAllWorkspaceData] = useState<
    UserTasksDataByWorkspace[]
  >([]);

  const [userWorkedHours, setUserWorkedHours] = useState<number>(0);
  const searParams = useSearchParams();
  const userId = searParams.get("userId");

  //getworkspaces data to render in workspaces table
  useEffect(() => {
    const renderWorkspaces = async () => {
      try {
        const userWorkspaces = await axios.get(
          `/api/tasks/assignedTasks?userId=${userId}`
        );
        if (userWorkspaces.data.data) {
          setAllWorkspaceData(userWorkspaces.data.data);

          const hoursWorked = await axios.get(
            `/api/track/gethours?userId=${userId}`
          );
          if (hoursWorked.data.data) {
            setUserWorkedHours(hoursWorked.data.data);
            console.log(hoursWorked.data.data);
          }
        }
      } catch (err) {
        console.log(err);
      }
    };
    renderWorkspaces();
  }, [userId]);
  return (
    <div className="p-6 space-y-6 bg-white dark:bg-neutral-950">
      <h1 className="text-3xl font-bold">User Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pie Chart Card */}
        <PieCharCard taskData={allWorkspaceData} />
        {/* Feature Points Card */}
        <Card>
          <CardHeader>
            <CardTitle>Task Overview</CardTitle>
            <CardDescription>Key metrics at a glance</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4 pb-2">
              <li className="flex justify-between items-center">
                <span>Total Projects Assigned:</span>
                <span className="font-semibold">{allWorkspaceData.length}</span>
              </li>
              <li className="flex justify-between items-center">
                <span>Hours Worked:</span>
                <span className="font-semibold">
                  {userWorkedHours.toFixed(1)}
                </span>
              </li>
              <li className="flex justify-between items-center">
                <span>Tasks Assigned</span>
                <span className="font-semibold">
                  {allWorkspaceData.reduce((acc, workspace) => {
                    return acc + workspace.tasks.length;
                  }, 0)}
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <UserWorkspaceTable
        userId={userId as string}
        workspaceData={allWorkspaceData}
        onChange={setAllWorkspaceData}
      />
    </div>
  );
}
