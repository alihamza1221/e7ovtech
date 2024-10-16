"use client";
import { useSearchParams } from "next/navigation";

import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ScrollArea } from "./ui/scroll-area";
import axios from "axios";
import { useSession } from "next-auth/react";
import { TaskCreationPopupComponent } from "./task-creation-popup";
import { Role } from "@repo/db/models/user";
import { Priority } from "@repo/db/models/task";

export function WorkspaceChatComponent() {
  const searchParams = useSearchParams();
  const workspaceId = searchParams.get("workspaceId") as string;
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [showPopover, setShowPopover] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const [isCreateTaskDialogOpen, setIsCreateTaskDialogOpen] = useState(false);
  type Message = {
    _id: string;
    sender: {
      _id: string;
      name: string;
      email: string;
      image: string;
    };
    workspace: string;
    content: string;
    timestamp: Date;
    __v: number;
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setCursorPosition(e.target.selectionStart || 0);

    if (value[cursorPosition - 1] === "@") {
      setShowPopover(true);
    } else {
      setShowPopover(false);
    }
  };

  const handleMentionClick = (mention: string) => {
    const beforeMention = inputValue.slice(0, cursorPosition - 1);
    const afterMention = inputValue.slice(cursorPosition);
    setInputValue(`${beforeMention}${mention} ${afterMention}`);
    setShowPopover(false);
    inputRef.current?.focus();
  };
  const { data: session, status } = useSession();

  //build commands for user
  function getUserCommandsByRole() {
    //implement it later
    const dummyRole = Role.TeamLead;
    if (dummyRole == Role.TeamLead) {
      return ["ai", "create-task", "delete-task"];
    } else return ["getWorkspace info"];
  }

  const userCommands = getUserCommandsByRole();

  async function getChatCompletions(userMessage: string) {
    return await axios.post("/api/ai/completions", { userMessage });
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const curValue = inputValue.trim();
    if (curValue.startsWith("@")) {
      const request = curValue.slice(1);
      if (request === "create-task") {
        setIsCreateTaskDialogOpen(true);
      } else if (request.slice(1, 3) == "ai" || "AI") {
        const content = curValue;
        const userMessage = await axios.post(
          `/api/messages/send?workspaceId=${workspaceId}`,
          { content }
        );
        if (userMessage.data.data as Message) {
          setMessages([...messages, userMessage.data.data]);
        }
        setInputValue("");

        const response = await getChatCompletions(curValue);
        console.log("AI response", response.data.data);
        const res = await axios.post(
          `/api/messages/send?workspaceId=${workspaceId}`,
          { content: response.data.data as string, aiResponse: true }
        );

        if (res.data.data as Message) {
          setMessages([...messages, res.data.data]);
        }
      }
    } else if (curValue) {
      const content = curValue;

      const res = await axios.post(
        `/api/messages/send?workspaceId=${workspaceId}`,
        { content }
      );
      if (res.data.data as Message) {
        setMessages([...messages, res.data.data]);
      }
      setInputValue("");
    }
  };
  const isSender = (senderId: string): boolean => {
    return senderId === session?.user._id;
  };
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setShowPopover(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  //get all messages in workspace on render
  useEffect(() => {
    // fetch messages from server

    const getWorkspaceMessages = async () => {
      const res = await axios.get(
        `/api/messages/get?workspaceId=${workspaceId}`
      );
      /*
      interface Message extends Document {
        sender: Types.ObjectId;
        workspace: Types.ObjectId;
        content: string;
        timestamp: Date;
      } */
      if (res.data.data) setMessages([...messages, ...res.data.data]);
      else {
        console.log("No data found");
      }
    };
    getWorkspaceMessages();
  }, [workspaceId]);

  type TaskSubmissionParams = {
    label: string;
    priority: Priority;
    description: string;
    deadline: Date;
    assignedTo: string;
  };
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
  }: TaskSubmissionParams): void {
    /*{ label, priority, description, deadLine:Date, assignedTo: objectId } 
    params: workspaceId */
    try {
      createTask(
        { label, priority, description, deadline, assignedTo },
        workspaceId
      );
    } catch (err) {
      console.error(err);
    }
  }
  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto">
      <TaskCreationPopupComponent
        isOpen={isCreateTaskDialogOpen}
        onOpenChange={setIsCreateTaskDialogOpen}
        onSubmit={handleCreateTaskSubmission}
      />
      <ScrollArea className="flex-grow p-4 space-y-4 mb-[50px]">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`flex items-start space-x-2 ${
              isSender(message.sender._id) ? "justify-end" : ""
            }`}
          >
            {message.sender && (
              <Avatar>
                <AvatarImage src={`${message.sender.image}`} />
                <AvatarFallback>{message.sender.name}</AvatarFallback>
              </Avatar>
            )}
            <div
              className={`p-2 rounded-lg ${
                isSender(message.sender._id)
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary"
              }`}
            >
              <p className="text-sm font-semibold">{message.sender.name}</p>
              <p className="text-sm">{message.content}</p>
            </div>
          </div>
        ))}
      </ScrollArea>
      <form
        onSubmit={handleSubmit}
        className="p-4  rounded-2xl border-b-[1px] mb-2 border-t-[1px] w-full "
      >
        <div className="relative  w-full">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="pr-20 w-full"
          />
          <Popover open={showPopover}>
            <PopoverTrigger asChild>
              <div className="absolute inset-y-0 right-0 flex items-center">
                <Button type="submit" size="sm" className="h-8">
                  Send
                </Button>
              </div>
            </PopoverTrigger>
            <PopoverContent ref={popoverRef} className="w-56 p-0">
              <div className="grid gap-1">
                {userCommands.map((option) => (
                  <Button
                    key={option}
                    variant="ghost"
                    className="justify-start"
                    onClick={() => handleMentionClick(option)}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </form>
    </div>
  );
}
