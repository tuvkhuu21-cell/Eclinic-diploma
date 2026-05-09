import { NotificationItem } from "./NotificationItem";

export function NotificationBox() {
  return <div className="grid gap-3"><NotificationItem text="Таны цаг баталгаажлаа" time="5 минутын өмнө" /><NotificationItem text="Шинжилгээний хариу бэлэн боллоо" time="Өчигдөр" /><NotificationItem text="Видео зөвлөгөөний хүсэлт ирлээ" time="2026-05-07" /></div>;
}

