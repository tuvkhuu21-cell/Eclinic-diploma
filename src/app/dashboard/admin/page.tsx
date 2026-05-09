import { Card } from "@/components/ui/Card";

export default function AdminDashboardPage() {
  const stats = [["Хэрэглэгч", "1,240"], ["Эмч", "86"], ["Эмнэлэг", "34"], ["Цаг захиалга", "5,820"]];
  return <section className="mx-auto max-w-7xl px-4 py-10"><h1 className="text-3xl font-bold text-navy">Админы самбар</h1><div className="mt-6 grid gap-4 md:grid-cols-4">{stats.map(([label, value]) => <Card key={label} className="p-5"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold text-navy">{value}</p></Card>)}</div><Card className="mt-6 p-5"><h2 className="font-bold text-navy">Системийн хяналт</h2><p className="mt-2 text-slate-600">RBAC, хэрэглэгчийн төлөв, эмчийн баталгаажуулалт, мэдэгдлийн урсгалыг админ удирдана.</p></Card></section>;
}

