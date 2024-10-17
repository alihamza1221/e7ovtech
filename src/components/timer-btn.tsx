import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { TaskStatus } from "@repo/db/models/task";

interface TimerButtonProps {
  task_id: string;
  task_status: TaskStatus;
  workspace_id: string;
  handleToggleTimer: (data: {
    startTime: Date;
    taskId: string;
    workspaceId: string;
  }) => void;
}

const TimerButton: React.FC<TimerButtonProps> = ({
  task_id,
  task_status,
  workspace_id,
  handleToggleTimer,
}) => {
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (startTime) {
      interval = setInterval(() => {
        const timePassed = new Date().getTime() - startTime.getTime();
        setElapsedTime(timePassed);
      }, 1000);
    } else {
      setElapsedTime(0);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [startTime]);

  const handleStartClick = () => {
    const now = new Date();
    setStartTime(now);
    handleToggleTimer({
      startTime: now,
      taskId: task_id,
      workspaceId: workspace_id,
    });
  };

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  };

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={
        task_status === TaskStatus.Completed ||
        task_status === TaskStatus.InProgress
      }
      onClick={handleStartClick}
      className="border-[1px] border-green-400 rounded-3xl flex justify-start items-center"
    >
      <span>Start {formatTime(elapsedTime)}</span>
    </Button>
  );
};

export default TimerButton;
