import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import axios from "axios";
import { ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { User } from "@repo/db/models/user";
import { Task } from "@repo/db/models/task";

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
import React, { useEffect, useState } from "react";
import { Role } from "@repo/db/models/user";
import {
  TaskCreationPopupComponent,
  TaskSubmissionParams,
} from "./task-creation-popup";

export interface Workspace {
  _id: string;
  name: string;
  admin: string;
  members: { userId: User; role: Role }[];
  tasks: Task[];
  description: string;
}
interface WorkspaceTableProps {
  workspaceData: Workspace[];
  onChange: React.Dispatch<React.SetStateAction<Workspace[]>>;
}
const WorkspaceTable: React.FC<WorkspaceTableProps> = ({
  workspaceData,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRemveLoading, setIsRemoveLoading] = useState(false);
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    role: "",
    image: "",
  });
  const [workspaceId, setWorkspaceId] = useState("");
  const [isCreateTaskDialogOpen, setIsCreateTaskDialogOpen] = useState(false);
  const [userToAssign, setUserToAssign] = useState("");
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMember({ ...newMember, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (value: string) => {
    setNewMember({ ...newMember, role: value });
  };

  const handleSubmit = async (e: React.FormEvent, workspace_id: string) => {
    e.preventDefault();

    const userDataToAdd = {
      user: {
        password: "Fdsa@",
        email: newMember.email,
        image: newMember.image,
        role: Role.TeamMember,
        name: newMember.name,
        workspaces: { workspace: workspace_id, role: newMember.role },
      },
      workspaceId: workspace_id,
    };
    const res = await axios.post("/api/addmember", userDataToAdd);

    if (res.data.data) {
      console.log("success added user", res.data.data);
    }

    setNewMember({ name: "", email: "", role: "", image: "" });
    setIsOpen(false);
  };

  async function handleUserRemoved(workspace_id: string, user_id: string) {
    console.log("usre remo: ", workspace_id, user_id);
    setIsRemoveLoading(true);
    const res = await axios.post("/api/admin/workspace/removeuser", {
      workspace_id,
      user_id,
    });
    if (res.data.data) {
      console.log("user removed successfully", res.data.data);
    }
    setIsRemoveLoading(false);
  }

  async function getUserIdByEmail(email: string) {
    const response = await axios.post("/api/getUserByEmail", {
      email,
    });
    if (response.data.data) {
      return response.data.data?._id;
    }
  }

  async function createTask(
    {
      label,
      priority,
      description,
      deadline,
      assignedTo,
    }: TaskSubmissionParams,
    workspaceId: string
  ) {
    const userId = await getUserIdByEmail(assignedTo);
    console.log("getusrbyid:", userId, "givenid:", assignedTo);
    const res = await axios.post(
      `/api/tasks/create?workspaceId=${workspaceId}`,
      {
        label,
        priority,
        description,
        deadline,
        assignedTo: userId,
      }
    );
    if (res.data.data) {
      console.log("Task created successfully", res.data.data);
    }
  }

  function handleCreateTaskSubmission({
    label,
    priority,
    description,
    deadline,
    assignedTo,
  }: TaskSubmissionParams) {
    /*{ label, priority, description, deadLine:Date, assignedTo: objectId } 
    params: workspaceId */
    try {
      createTask(
        { label, priority, description, deadline, assignedTo: userToAssign },
        workspaceId
      );
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-6 border-t-2 border-gray-400 rounded-xl">
      <TaskCreationPopupComponent
        isOpen={isCreateTaskDialogOpen}
        onOpenChange={setIsCreateTaskDialogOpen}
        onSubmit={handleCreateTaskSubmission}
        userToAssign={userToAssign}
      />
      {workspaceData.map((workspace) => (
        <Card key={workspace?._id}>
          <CardHeader>
            <CardTitle>Workspace: {workspace.name}</CardTitle>
            <CardDescription>{workspace.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-end mb-4">
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button>Add Member</Button>
                </DialogTrigger>
                <DialogDescription></DialogDescription>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Team Member</DialogTitle>
                  </DialogHeader>
                  <form
                    onSubmit={(e) => handleSubmit(e, workspace._id)}
                    className="space-y-4"
                  >
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={newMember.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={newMember.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="image">Image URL</Label>
                      <Input
                        id="image"
                        name="image"
                        value={newMember.image}
                        onChange={handleInputChange}
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
                    <Button type="submit">Add Member</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Check Stats</TableHead>
                  <TableHead>Assign Task</TableHead>
                  <TableHead>Remove</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workspace.members.map((member, idx) => (
                  <TableRow key={member.userId._id as string}>
                    <TableCell className="font-medium">
                      {member.userId.name}
                    </TableCell>
                    <TableCell>{member.role}</TableCell>
                    <TableCell>{member.userId.email}</TableCell>
                    <TableCell>
                      <a
                        href={`/home/userDashboard?userId=${member.userId._id}`}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-2xl border border-yellow-200"
                        >
                          Check Stats <ArrowRight color="gray" />
                        </Button>
                      </a>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-2xl border border-blue-300"
                        onClick={() => {
                          setIsCreateTaskDialogOpen(true);
                          setWorkspaceId(workspace._id);
                          setUserToAssign(member.userId.email);
                        }}
                      >
                        Assign Task +
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[1px] border-red-400 rounded-3xl"
                        onClick={() =>
                          handleUserRemoved(
                            workspace._id,
                            member.userId?._id as string
                          )
                        }
                        disabled={isRemveLoading}
                      >
                        {"_del "}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
export default WorkspaceTable;
