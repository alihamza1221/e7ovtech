"'use client'";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, addDays } from "date-fns";
import { Priority } from "@repo/db/models/task";

export interface TaskSubmissionParams {
  label: string;
  priority: Priority;
  description: string;
  deadline: Date;
  assignedTo: string;
}

interface TaskCreationPopupProps {
  isOpen: boolean;
  onOpenChange: (prev: boolean) => void;
  onSubmit: (params: TaskSubmissionParams) => void;
  userToAssign?: string;
}

export function TaskCreationPopupComponent({
  isOpen,
  onOpenChange,
  onSubmit,
  userToAssign,
}: TaskCreationPopupProps) {
  const [label, setLabel] = useState("");
  const [priority, setPriority] = useState<Priority>(Priority.Normal);
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState<Date>(addDays(new Date(), 1));
  const [assignedTo, setAssignedTo] = useState(userToAssign || "@exmaple.com");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ label, priority, description, deadline, assignedTo });
    onSubmit({ label, priority, description, deadline, assignedTo });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        <DialogDescription></DialogDescription>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="label" className="text-right">
                Label
              </Label>
              <Input
                id="label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="priority" className="text-right">
                Priority
              </Label>
              <Select
                onValueChange={(value) => setPriority(value as Priority)}
                defaultValue={Priority.Normal}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Priority.Normal}>
                    {Priority.Normal}
                  </SelectItem>
                  <SelectItem value={Priority.Important}>
                    {Priority.Important}
                  </SelectItem>
                  <SelectItem value={Priority.Moderate}>
                    {Priority.Moderate}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="deadline" className="text-right">
                Deadline
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={`col-span-3 justify-start text-left font-normal`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {deadline ? (
                      format(deadline, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={deadline}
                    onSelect={(date) => date && setDeadline(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="assignedTo" className="text-right">
                Assign To
              </Label>
              <Input
                id="assignedTo"
                type="email"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="Enter email"
                className="col-span-3"
                disabled={!!userToAssign}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Create Task</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
