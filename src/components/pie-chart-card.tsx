import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Task, TaskStatus } from "@repo/db/models/task";
import { UserTasksDataByWorkspace } from "./user-dashboard";

const COLORS = [
  "hsl(var(--accent))",
  "hsl(var(--primary))",
  "hsl(var(--muted))",
];

const PieCharCard = ({
  taskData,
}: {
  taskData: Task[] | UserTasksDataByWorkspace[];
}) => {
  let curTasksStats;
  const isTaskArray = (data: any[]): data is Task[] => {
    return data.length > 0 && "status" in data[0];
  };
  // Type guard to check if an array is of type UserTasksDataByWorkspace[]
  const isUserTasksDataByWorkspaceArray = (
    data: any[]
  ): data is UserTasksDataByWorkspace[] => {
    return data.length > 0 && "tasks" in data[0];
  };

  if (isTaskArray(taskData)) {
    curTasksStats = taskData.reduce(
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

    console.log(curTasksStats);
  } else if (isUserTasksDataByWorkspaceArray(taskData)) {
    curTasksStats = taskData.reduce(
      (acc, workspaceTask) => {
        // Initialize the accumulator if it hasn't been already
        if (!acc.completed) acc.completed = 0;
        if (!acc.inProgress) acc.inProgress = 0;
        if (!acc.pending) acc.pending = 0;

        // Iterate over the tasks array within each workspaceTask
        workspaceTask.tasks.forEach((task) => {
          // Increment the appropriate counter based on the task's status
          if (task.status === TaskStatus.Completed) {
            acc.completed += 1;
          } else if (task.status === TaskStatus.InProgress) {
            acc.inProgress += 1;
          } else if (task.status === TaskStatus.Pending) {
            acc.pending += 1;
          }
        });

        return acc;
      },
      { completed: 0, inProgress: 0, pending: 0 }
    );
  }
  const newTaskData = [
    {
      name: "Completed",
      value: taskData.length != 0 ? curTasksStats?.completed : 1,
    },
    { name: "In-Progress", value: curTasksStats?.inProgress },
    { name: "Pending", value: curTasksStats?.pending },
  ];
  const tot = newTaskData.reduce((acc, cur) => acc + (cur.value ?? 0), 0);
  return (
    <>
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
                  data={newTaskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {newTaskData.map((entry, index) => (
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
            {newTaskData.map((entry, index) => (
              <div key={`legend-${index}`} className="flex items-center">
                <div
                  className="w-3 h-3 mr-2"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                <span>
                  {entry.name}: {Math.round(((entry.value ?? 0) / tot) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default PieCharCard;
