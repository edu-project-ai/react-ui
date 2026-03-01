import { useEffect } from "react";
import toast from "react-hot-toast";
import { signalRService } from "../../../services/signalrService";
import { useSignalR } from "../../../context/SignalRContext";
import { useAppDispatch } from "@/hooks/useReduxHooks";
import { addNotification } from "@/features/notifications";
import type { NotificationPayload } from "@/features/notifications";

interface RoadmapUpdateMessage {
  type: "RoadmapProgress" | "RoadmapCompleted" | "RoadmapError" | "RoadmapPreview";
  correlationId: string;
  status: string;
  message: string;
  data?: NotificationPayload;
}

export const RoadmapNotificationListener = () => {
  const { isConnected } = useSignalR();
  const dispatch = useAppDispatch();

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

      let notificationType: "info" | "success" | "warning" | "error" = "info";
      
      if (data.type === "RoadmapCompleted") notificationType = "success";
      if (data.type === "RoadmapError") notificationType = "error";

      dispatch(addNotification({
        type: notificationType,
        title: getTitleByType(data.type),
        message: data.message,
        data: data.data
      }));
    };

    // SignalR конвертує C# метод ReceiveRoadmapUpdate в camelCase
    signalRService.on("receiveroadmapupdate", handleUpdate as (...args: unknown[]) => void);

    return () => {
      signalRService.off("receiveroadmapupdate", handleUpdate as (...args: unknown[]) => void);
    };
  }, [isConnected, dispatch]);

  return null;
};

const getTitleByType = (type: RoadmapUpdateMessage["type"]): string => {
    switch (type) {
        case "RoadmapProgress": return "Генерація роутмапу";
        case "RoadmapCompleted": return "Роутмап готовий";
        case "RoadmapError": return "Помилка";
        case "RoadmapPreview": return "Прев'ю готове";
        default: return "Сповіщення";
    }
}


