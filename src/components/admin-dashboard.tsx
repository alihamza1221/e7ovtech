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

import { useEffect, useState } from "react";
import { Role } from "@repo/db/models/user";
import WorkspaceTable from "./workspaces_table";
import { Workspace } from "./workspaces_table";
import PieCharCard from "./pie-chart-card";
import { Task } from "@repo/db/models/task";
import { TimeLog } from "@repo/db/models/timelog";
import FeatureData from "./feature-data";

export function AdminDashboardComponent() {
  const [allWorkspaceData, setAllWorkspaceData] = useState<Workspace[]>([]);

  const [newWorkspace, setNewWorkspace] = useState({
    name: "",
    description: "",
  });

  const [isWorkspaceFormOpen, setIsWorkspaceFormOpen] = useState(false);
  const [tasksData, setTasksData] = useState<Task[]>([]);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);

  const handleWorkspaceFormInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNewWorkspace({ ...newWorkspace, [e.target.name]: e.target.value });
  };

  const handleWorkspaceFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/admin/workspace", newWorkspace);

      if (res.data?.data) {
        console.log("res.data.data", res.data.data);

        setAllWorkspaceData([...allWorkspaceData, res.data.data]);
      }
    } catch (err) {
      console.log("[post] api/workspaces", err);
    }

    setNewWorkspace({ name: "", description: "" });
    setIsWorkspaceFormOpen(false);
  };

  //getworkspaces data to render in workspaces table
  function getTasksData(workspaceIds: string[]) {
    axios
      .post("/api/tasks/getTasks", { workspaceIds })
      .then((res) => {
        setTasksData(res.data.data);
      })
      .catch((err) => {
        console.log("err", err);
      });
  }
  function getTimeLogs(workspaceIds: string[]) {
    axios
      .post("/api/track/getTimeLogs", { workspaceIds })
      .then((res) => {
        console.log("res.data.data", res.data.data);
        setTimeLogs(res.data.data);
      })
      .catch((err) => {
        console.log("err", err);
      });
  }
  useEffect(() => {
    console.log("alltaskdate effe:", allWorkspaceData);
  }, [allWorkspaceData]);
  useEffect(() => {
    const renderWorkspaces = async () => {
      try {
        const AdminWorkspaces = await axios.get(
          "/api/workspace/getworkspace?isAdminWorspaces=true"
        );
        if (AdminWorkspaces.data.data) {
          setAllWorkspaceData(AdminWorkspaces.data.data);
          getTasksData(
            AdminWorkspaces.data.data.map((workspace: any) => workspace._id)
          );
          getTimeLogs(
            AdminWorkspaces.data.data.map((workspace: any) => workspace._id)
          );
        }
        console.log("AdminWorkspaces", AdminWorkspaces.data.data);
      } catch (err) {
        console.log(err);
      }
    };
    renderWorkspaces();
  }, []);
  return (
    <div className="space-y-2 px-3 bg-white ">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pie Chart Card */}
        <PieCharCard taskData={tasksData} />

        {/* Feature Points Card */}
        <Card>
          <CardHeader>
            <CardTitle>Task Overview</CardTitle>
            <CardDescription>Key metrics at a glance</CardDescription>
          </CardHeader>
          <CardContent>
            <FeatureData
              tasksData={tasksData}
              timelogs={timeLogs}
              workspacesData={allWorkspaceData}
            />
            <ul className="admin-roles space-y-3 border-t-[1px] border-gray-300 py-5">
              <div className="create-workspace flex justify-between">
                <span>Create Workspace:</span>
                <Dialog
                  open={isWorkspaceFormOpen}
                  onOpenChange={setIsWorkspaceFormOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="w-18">Build</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogDescription></DialogDescription>
                    <DialogHeader>
                      <DialogTitle>Create Your workspace</DialogTitle>
                    </DialogHeader>
                    <form
                      onSubmit={handleWorkspaceFormSubmit}
                      className="space-y-4"
                    >
                      <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          name="name"
                          value={newWorkspace.name}
                          onChange={handleWorkspaceFormInputChange}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="text">Description</Label>
                        <Input
                          id="description"
                          name="description"
                          type="text"
                          value={newWorkspace.description}
                          onChange={handleWorkspaceFormInputChange}
                          required
                        />
                      </div>

                      <Button type="submit">Proceed</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              {/*  */}
            </ul>
          </CardContent>
        </Card>
      </div>

      <WorkspaceTable
        workspaceData={allWorkspaceData}
        onChange={setAllWorkspaceData}
      />
    </div>
  );
}
