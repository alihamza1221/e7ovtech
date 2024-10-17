import { Task, TaskStatus } from "@repo/db/models/task";
import { TimeLog } from "@repo/db/models/timelog";
import { Workspace } from "./workspaces_table";
import React from "react";
export function getTasksStatsData(tasksData: Task[]) {
  return tasksData.reduce(
    (acc, task) => {
      // Initialize the accumulator if it hasn't been already
      if (!acc.completed) acc.completed = 0;
      if (!acc.inProgress) acc.inProgress = 0;
      if (!acc.pending) acc.pending = 0;

      // Increment the appropriate counter based on the task's status
      if (task.status === TaskStatus.Completed) {
        acc.completed += 1;
      } else if (task.status === TaskStatus.InProgress) {
        acc.inProgress += 1;
      } else if (task.status === TaskStatus.Pending) {
        acc.pending += 1;
      }

      return acc;
    },
    { completed: 0, inProgress: 0, pending: 0 }
  );
}
const FeatureData = ({
  tasksData,
  timelogs,
  workspacesData,
}: {
  tasksData: Task[];
  timelogs?: TimeLog[];
  workspacesData: Workspace[];
}) => {
  const curTasksStats = getTasksStatsData(tasksData);
  const uniqueMemberIds = workspacesData.reduce((acc, workspace) => {
    workspace.members.forEach((member) => {
      acc.add(member.userId._id);
    });
    return acc;
  }, new Set());
  return (
    <>
      <ul className="space-y-4 pb-2">
        <li className="flex justify-between items-center">
          <span>Tasks Created:</span>
          <span className="font-semibold">{tasksData.length}</span>
        </li>
        <li className="flex justify-between items-center">
          <span>Tasks Completed:</span>
          <span className="font-semibold">{curTasksStats.completed}</span>
        </li>
        <li className="flex justify-between items-center">
          <span>Active Projects:</span>
          <span className="font-semibold">{workspacesData.length}</span>
        </li>
        <li className="flex justify-between items-center ">
          <span>Active Members:</span>
          <span className="font-semibold">{uniqueMemberIds.size}</span>
        </li>
      </ul>
    </>
  );
};

export default FeatureData;
