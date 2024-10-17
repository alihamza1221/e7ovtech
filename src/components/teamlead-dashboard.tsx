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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
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
import WorkspaceTable from "./workspaces_table";
import { Workspace } from "./workspaces_table";
import TeamLeadWorkspaceTable from "./teamlead-workspace-table";
// Mock data for the pie chart
const taskData = [
  { name: "Completed", value: 75 },
  { name: "In-Progress", value: 25 },
  { name: "Pending", value: 10 },
];

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
  useEffect(() => {
    const renderWorkspaces = async () => {
      try {
        const TeamLeadWorkspaces = await axios.get("/api/teamlead/getData");
        if (TeamLeadWorkspaces.data.data)
          setAllWorkspaceData(TeamLeadWorkspaces.data.data);
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
        <Card>
          <CardHeader>
            <CardTitle>Tracked Tasks</CardTitle>
            <CardDescription>
              Status : Pending | In-Progress | Completed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {taskData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        color={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex justify-center space-x-4">
              {taskData.map((entry, index) => (
                <div key={`legend-${index}`} className="flex items-center">
                  <div
                    className="w-3 h-3 mr-2"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span>
                    {entry.name}: {entry.value}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Feature Points Card */}
        <Card>
          <CardHeader>
            <CardTitle>Task Overview</CardTitle>
            <CardDescription>Key metrics at a glance</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4 pb-2">
              <li className="flex justify-between items-center">
                <span>Tasks Created:</span>
                <span className="font-semibold">
                  {featureData.tasksCreated}
                </span>
              </li>
              <li className="flex justify-between items-center">
                <span>Tasks Completed:</span>
                <span className="font-semibold">
                  {featureData.tasksCompleted}
                </span>
              </li>
              <li className="flex justify-between items-center">
                <span>Active Projects:</span>
                <span className="font-semibold">
                  {featureData.activeProjects}
                </span>
              </li>
              <li className="flex justify-between items-center ">
                <span>Team Members:</span>
                <span className="font-semibold">{featureData.teamMembers}</span>
              </li>
            </ul>
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
              <div className="create-add members flex justify-between">
                <span>Add Existing User to Workspace:</span>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                  <DialogTrigger asChild>
                    <Button>_Add</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogDescription></DialogDescription>
                    <DialogHeader>
                      <DialogTitle>Add Existing User to Workspace</DialogTitle>
                    </DialogHeader>
                    <form
                      onSubmit={handleExistingUserAddFormSubmit}
                      className="space-y-4"
                    >
                      <div>
                        <Label htmlFor="workspace_name">Workspace Name</Label>
                        <Input
                          id="workspace_name"
                          name="workspace_name"
                          value={newTeamMemberAdd.workspace_name}
                          onChange={handleExistingUserAddFormInputChange}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">TeamMember Email</Label>
                        <Input
                          id="email"
                          name="email"
                          value={newTeamMemberAdd.email}
                          onChange={handleExistingUserAddFormInputChange}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="role">Role</Label>
                        <Select
                          onValueChange={handleRoleChange}
                          value={newMember.role}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Admin">{Role.Admin}</SelectItem>
                            <SelectItem value="TeamLead">
                              {Role.TeamLead}
                            </SelectItem>
                            <SelectItem value="TeamMember">
                              {Role.TeamMember}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button type="submit">Proceed</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
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
