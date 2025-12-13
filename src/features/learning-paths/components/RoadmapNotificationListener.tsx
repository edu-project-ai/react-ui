import { useEffect } from "react";
import toast from "react-hot-toast";
import { signalRService } from "../../../services/signalrService";
import { useSignalR } from "../../../context/SignalRContext";

interface RoadmapUpdateMessage {
  type: "RoadmapProgress" | "RoadmapCompleted" | "RoadmapError" | "RoadmapPreview";
  correlationId: string;
  status: string;
  message: string;
  data?: any;
}

export const RoadmapNotificationListener = () => {
  const { isConnected } = useSignalR();

  useEffect(() => {
    if (!isConnected) return;

    const handleUpdate = (data: RoadmapUpdateMessage) => {
      switch (data.type) {
        case "RoadmapProgress":
          toast.loading(data.message, { id: `roadmap-${data.correlationId}` }); 
          break;
        case "RoadmapCompleted":
          toast.dismiss(`roadmap-${data.correlationId}`);
          toast.success(data.message, { duration: 5000 });
          break;
        case "RoadmapError":
          toast.dismiss(`roadmap-${data.correlationId}`);
          toast.error(`Error: ${data.message}`);
          break;
        case "RoadmapPreview":
            toast.success(data.message);
            break;
        default:
          break;
      }
    };

    signalRService.on("RoadmapUpdate", handleUpdate);

    return () => {
      signalRService.off("RoadmapUpdate", handleUpdate);
    };
  }, [isConnected]);

  return null;
};
