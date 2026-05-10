export const navItems = [
  { label: "Нүүр", href: "/" },
  { label: "Эмч", href: "/doctors" },
  { label: "Эмнэлэг", href: "/hospitals" },
  { label: "Шинжилгээний хариу авах", href: "/dashboard/patient?section=labs" },
  { label: "Зөвлөгөө авах", href: "/consultation" },
];

export const specialties = ["Зүрх судас", "Хүүхэд", "Дотор", "Мэдрэл", "Нүд", "Арьс харшил"];

export const hospitals = [
  { id: "1", name: "MediCare Hospital", type: "Нэгдсэн эмнэлэг", district: "Сүхбаатар", departments: 14, rating: 4.8, lat: 47.9186, lng: 106.9176 },
  { id: "2", name: "Нарны эмнэлэг", type: "Хүүхэд, эх барих", district: "Баянзүрх", departments: 9, rating: 4.7, lat: 47.9228, lng: 106.9522 },
  { id: "3", name: "City Med Center", type: "Оношилгоо, зөвлөгөө", district: "Хан-Уул", departments: 11, rating: 4.6, lat: 47.8931, lng: 106.9156 },
];
