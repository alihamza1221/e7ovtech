"use client";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

import { useEffect, useState } from "react";

import { Workspace } from "./workspaces_table";
import TeamLeadWorkspaceTable from "./teamlead-workspace-table";
import PieCharCard from "./pie-chart-card";
import FeatureData from "./feature-data";

export function TeamLeadDashboardComponent() {
  const [allWorkspaceData, setAllWorkspaceData] = useState<Workspace[]>([]);
  const [deleteUser, setDeleteUser] = useState(false);
  const [tasksData, setTasksData] = useState<any>([]);

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
  useEffect(() => {
    renderWorkspaces();
  }, [deleteUser]);

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
              {/*  */}
            </ul>
          </CardContent>
        </Card>
      </div>

      <TeamLeadWorkspaceTable
        workspaceData={allWorkspaceData}
        onChange={setAllWorkspaceData}
        setDeleteUser={setDeleteUser}
      />
    </div>
  );
}
