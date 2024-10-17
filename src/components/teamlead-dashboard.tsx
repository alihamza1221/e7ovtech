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
import { useEffect, useState } from "react";
import { Role } from "@repo/db/models/user";

import { Workspace } from "./workspaces_table";
import TeamLeadWorkspaceTable from "./teamlead-workspace-table";
import PieCharCard from "./pie-chart-card";
import FeatureData, { getTasksStatsData } from "./feature-data";

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

export function TeamLeadDashboardComponent() {
  const [userData, setUserData] = useState(inituserData);
  const [allWorkspaceData, setAllWorkspaceData] = useState<Workspace[]>([]);

  const [workspaceData, setWorkspaceData] = useState<any>([]);
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    role: "",
    image: "",
  });
  const [newTeamMemberAdd, setNewTeamMemberAdd] = useState({
    workspace_name: "",
    email: "",
    role: "",
  });
  const [newWorkspace, setNewWorkspace] = useState({
    name: "",
    description: "",
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isWorkspaceFormOpen, setIsWorkspaceFormOpen] = useState(false);
  const [tasksData, setTasksData] = useState<any>([]);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMember({ ...newMember, [e.target.name]: e.target.value });
  };
  const handleWorkspaceFormInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNewWorkspace({ ...newWorkspace, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (value: string) => {
    setNewMember({ ...newMember, role: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser = {
      id: userData.length + 1,
      ...newMember,
    };
    setUserData([...userData, newUser]);
    setNewMember({ name: "", email: "", role: "", image: "" });
    setIsOpen(false);
  };

  const handleWorkspaceFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/admin/workspace", newWorkspace);

      if (res.data?.data) {
        console.log("res.data.data", res.data.data);

        setWorkspaceData([...workspaceData, res.data.data]);
      }
    } catch (err) {
      console.log("[post] api/workspaces", err);
    }

    setNewWorkspace({ name: "", description: "" });
    setIsWorkspaceFormOpen(false);
  };

  const handleExistingUserAddFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  };
  const handleExistingUserAddFormInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNewTeamMemberAdd({
      ...newTeamMemberAdd,
      [e.target.name]: e.target.value,
    });
  };

  //getworkspaces data to render in workspaces table
  function getTasksData(workspaceIds: string[]) {
    console.log("teamlead space ids:", workspaceIds);
    axios
      .post("/api/tasks/getTasks", { workspaceIds })
      .then((res) => {
        setTasksData(res.data.data);
      })
      .catch((err) => {
        console.log("err", err);
      });
  }

  useEffect(() => {
    const renderWorkspaces = async () => {
      try {
        const TeamLeadWorkspaces = await axios.get("/api/teamlead/getData");
        if (TeamLeadWorkspaces.data.data) {
          setAllWorkspaceData(TeamLeadWorkspaces.data.data);

          getTasksData(
            TeamLeadWorkspaces.data.data.map(
              (workspace: Workspace) => workspace._id
            )
          );
        }

        console.log("TeamLeadWorkspaces", TeamLeadWorkspaces.data.data);
      } catch (err) {
        console.log(err);
      }
    };
    renderWorkspaces();
  }, []);
  return (
    <div className="p-6 space-y-6 bg-white dark:bg-neutral-950">
      <h1 className="text-3xl font-bold">Team Lead Dashboard</h1>

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

      <TeamLeadWorkspaceTable
        workspaceData={allWorkspaceData}
        onChange={setAllWorkspaceData}
      />
    </div>
  );
}
