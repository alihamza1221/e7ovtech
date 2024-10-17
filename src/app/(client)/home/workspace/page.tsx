import { WorkspaceChatComponent } from "@repo/components/workspace-chat";

const WorkspaceChatRoom = () => {
  return (
    <div className="max-w-full max-h-[650px] rounded-2xl space-y-4 mt-4 w-[768px] mx-auto border border-gray-300 shadow-lg outline-2 backdrop:bottom-1">
      <WorkspaceChatComponent />
    </div>
  );
};

export default WorkspaceChatRoom;
