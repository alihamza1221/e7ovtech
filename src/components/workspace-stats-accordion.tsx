"'use client'";

import { ArrowDownIcon } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import axios from "axios";
import { useEffect, useState } from "react";
import { TimeLog } from "@repo/db/models/timelog";
import { Task } from "@repo/db/models/task";
import { ScrollArea } from "./ui/scroll-area";

import { TaskStatus } from "@repo/db/models/task";

type WorkspaceStatsAccordionCompProps = {
  workspaceId: string;
  workspaceName?: string;
  workspaceDesc: string;
  workspaceTotMembers: number;
};
export function WorkspaceStatsAccordionComponent({
  workspaceId,
  workspaceName,
  workspaceDesc,
  workspaceTotMembers,
}: WorkspaceStatsAccordionCompProps) {
  const [workspaceTimeLogs, setWorkspaceTimeLogs] = useState<TimeLog[]>([]);
  const [workspaceTotHours, setWorkspaceTotHours] = useState<number>(0);
  const [workedHoursArray, setWorkedHoursArray] = useState<
    {
      date: string | Date;
      secs: number;
    }[]
  >();
  //// api/tasks/getTasks/.ts
  const [workspaceTasks, setWorkspaceTasks] = useState<Task[]>([]);
  const handleTasksExpanded = async () => {
    console.log("handle.......");
    const res = await axios.post("/api/tasks/getTasks", {
      workspaceIds: [workspaceId],
    });
    if (res.data.data) {
      console.log("tasks", res.data.data);
      setWorkspaceTasks(res.data.data);
    }
  };
  async function handleAccordionClick() {
    //api/track/getTimeLogs
    const res = await axios.post("/api/track/getTimeLogs", {
      workspaceIds: [workspaceId],
    });
    if (res.data.data) {
      setWorkspaceTimeLogs(res.data.data);
    }
  }
  const formattedDate = (startDate: Date) => {
    return `${startDate.getDate()}-${startDate.toLocaleString("default", {
      month: "short",
    })}-${startDate.getFullYear()}`;
  };

  useEffect(() => {
    // Calculate total hours worked
    const curworkedHoursArray = workspaceTimeLogs.map((timeLog) => ({
      date: formattedDate(new Date(timeLog.startTime)),
      secs: timeLog.endTime
        ? (new Date(timeLog.endTime).getTime() -
            new Date(timeLog.startTime).getTime()) /
          1000
        : // Convert milliseconds to secs
          0,
    }));

    setWorkedHoursArray(curworkedHoursArray);
    const totalWorkedHours = curworkedHoursArray.reduce(
      (acc, log) => acc + log.secs,
      0
    );
    setWorkspaceTotHours(Math.round(totalWorkedHours));
  }, [workspaceTimeLogs]);
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="workspace-stats">
        <AccordionTrigger
          className="text-neutral-900 dark:text-neutral-50 "
          onClick={() => {
            handleAccordionClick();
          }}
        >
          <span className="flex items-center gap-1 border border-yellow-300 shadow-lg rounded-2xl py-1 px-2 hover:no-underline">
            Workspace Statistics <ArrowDownIcon />
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <Card className="flex-1 border-neutral-900 bg-white ">
                <CardHeader>
                  <CardTitle className="text-lg">
                    Workspace Description
                  </CardTitle>
                </CardHeader>
                <CardContent>{workspaceDesc}</CardContent>
              </Card>
              <Card className="flex-1 border-neutral-900 bg-white dark:border-neutral-50">
                <CardHeader>
                  <CardTitle className="text-neutral-900 text-lg">
                    Key Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="flex flex-col">
                      <dt className="text-sm font-medium text-gray-600">
                        Total secs Worked
                      </dt>
                      <dd className="text-2xl font-semibold text-neutral-900">
                        {workspaceTotHours}
                      </dd>
                    </div>
                    <div className="flex flex-col">
                      <dt className="text-sm font-medium text-gray-600">
                        Total Members
                      </dt>
                      <dd className="text-2xl font-semibold text-neutral-900">
                        {workspaceTotMembers}
                      </dd>
                    </div>
                    <div className="flex flex-col">
                      <dt className="text-sm font-medium text-gray-600">
                        Total Tasks
                      </dt>
                      <dd className="text-2xl font-semibold text-neutral-900">
                        5
                      </dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </div>
            <Card className="border-neutral-900 bg-white ">
              <CardHeader>
                <CardTitle className="text-neutral-900">
                  secs Worked by Task
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={workedHoursArray}>
                    <CartesianGrid
                      strokeDasharray="3"
                      stroke={`gray`}
                      opacity={0.2}
                    />
                    <XAxis dataKey="date" stroke={"gray"} />
                    <YAxis stroke={"gray"} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: `1px solid ${"gray"}`,
                        borderRadius: "4px",
                      }}
                      labelStyle={{ color: "gray" }}
                      itemStyle={{ color: "gray" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="secs"
                      stroke={"gray"}
                      fill={"gray"}
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="workspace-tasks">
              <AccordionTrigger
                className="text-neutral-900 dark:text-neutral-50 "
                onClick={() => handleTasksExpanded()}
              >
                <span className="flex items-center gap-1 border border-green-300 shadow-lg rounded-2xl py-1 px-2 hover:no-underline">
                  Workspace Tasks <ArrowDownIcon />
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <ScrollArea className="max-h-[300px] overflow-scroll">
                  <div className="flex  flex-col md:flex-col  gap-1 ">
                    {workspaceTasks.map((task) => (
                      <Card
                        key={task._id as string}
                        className="flex-1 border-neutral-900 bg-white "
                      >
                        <CardHeader>
                          <CardTitle className="text-md">
                            {task.label}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {task.description}
                          <span className="px-2 py-1 rounded-2xl  block my-2">
                            {task.status}
                            <span className="px-2 py-1 rounded-2xl border border-green-200 mx-7">
                              {formattedDate(new Date(task.createdAt))}
                            </span>
                          </span>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
