import { NotificationService } from "./notification.service.js";
import { InMemoryNotificationRepository } from "./in-memory-notification.repository.js";

export const notificationRepository = new InMemoryNotificationRepository();
export const notificationService = new NotificationService(notificationRepository);
