import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Timer, TimerOff } from "lucide-react";
import axios from "axios";

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
import { Priority, Task, TaskStatus } from "@repo/db/models/task";

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

import { UserTasksDataByWorkspace } from "./user-dashboard";
import { format } from "date-fns";

interface UserWorkspaceTableProps {
  userId: string;
  workspaceData: UserTasksDataByWorkspace[];
  onChange: React.Dispatch<React.SetStateAction<UserTasksDataByWorkspace[]>>;
}
const UserWorkspaceTable: React.FC<UserWorkspaceTableProps> = ({
  workspaceData,
  userId,
  onChange,
}) => {
  console.log("workspaceData: ", workspaceData);
  const [isOpen, setIsOpen] = useState(false);
  const [isRemveLoading, setIsRemoveLoading] = useState(false);
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    role: "",
    image: "",
  });

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
  async function handleToggleTimer({
    startTime,
    endTime,
    taskId,
    workspaceId,
  }: {
    startTime?: Date;
    endTime?: Date;
    taskId: string;
    workspaceId: string;
  }) {
    // const { startTime, endTime, workspaceId } = await req.json();

    if (startTime) {
      const res = await axios.post(`/api/track/toggletime?taskId=${taskId}`, {
        startTime,
        workspaceId,
        userId,
      });
      if (res.data.data) {
        console.log("Success Timer Started", res.data.data);
      }
    } else if (endTime) {
      const res = await axios.post(`/api/track/toggletime?taskId=${taskId}`, {
        endTime,
        workspaceId,
        userId,
      });
      if (res.data.data) {
        console.log("Success Timer Stopped", res.data.data);
      }
    }
  }

  return (
    <div className="space-y-6 border-t-2 border-gray-400 rounded-xl">
      {workspaceData.length == 0 ? (
        <div className=" text-3xl m-5"> No Tasks Pending...</div>
      ) : (
        workspaceData.map((workspace) => (
          <Card key={workspace?._id}>
            <CardHeader>
              <CardTitle>Workspace: {workspace.workspaceName}</CardTitle>
              <CardDescription>
                {workspace.workspaceDescription}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>DeadLine</TableHead>
                    <TableHead>Start Timer</TableHead>
                    <TableHead>Stop Timer</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workspace.tasks.map((task, idx) => (
                    <TableRow key={task._id}>
                      <TableCell className="font-medium">
                        {task.label}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`border px-2 py-1 rounded-2xl ${
                            task.priority == Priority.Important
                              ? "border-blue-400"
                              : task.priority == Priority.Moderate
                              ? "border-yellow-400"
                              : "border-gray-400"
                          }`}
                        >
                          {task.priority}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`border px-2 py-1 rounded-2xl ${
                            task.status == TaskStatus.Completed
                              ? "border-green-400"
                              : task.status == TaskStatus.InProgress
                              ? "border-blue-400"
                              : "border-gray-400"
                          }`}
                        >
                          {task.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`border-b-2 px-2 py-1  border-red-200`}
                        >
                          {format(new Date(task.deadLine), "dd MMM yyyy")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={
                            task.status == TaskStatus.Completed ||
                            task.status == TaskStatus.InProgress
                          }
                          onClick={() =>
                            handleToggleTimer({
                              startTime: new Date(),
                              taskId: task._id,
                              workspaceId: workspace._id,
                            })
                          }
                          className="border-[1px] border-green-400 rounded-3xl flex justify-start items-center"
                        >
                          <span>Start </span>
                          <Timer />
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[1px] border-yellow-400 rounded-3xl flex justify-start items-center"
                          onClick={() =>
                            handleToggleTimer({
                              endTime: new Date(),
                              taskId: task._id,
                              workspaceId: workspace._id,
                            })
                          }
                          disabled={
                            task.status == TaskStatus.Completed ||
                            task.status == TaskStatus.Pending
                          }
                        >
                          <span>End </span>
                          <TimerOff />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};
export default UserWorkspaceTable;
