export const navItems = [
  { label: "Нүүр", href: "/" },
  { label: "Эмч", href: "/doctors" },
  { label: "Эмнэлэг", href: "/hospitals" },
  { label: "Шинжилгээний хариу авах", href: "/lab-results" },
  { label: "Зөвлөгөө авах", href: "/consultation" },
];

export const specialties = ["Зүрх судас", "Хүүхэд", "Дотор", "Мэдрэл", "Нүд", "Арьс харшил"];

export const doctors = [
  { id: "1", name: "Д. Энхтуяа", specialty: "Зүрх судасны эмч", hospital: "MediCare Hospital", rating: 4.9, experience: "12 жил", online: true, fee: "45,000₮" },
  { id: "2", name: "Б. Тэмүүлэн", specialty: "Хүүхдийн эмч", hospital: "Нарны эмнэлэг", rating: 4.8, experience: "9 жил", online: true, fee: "35,000₮" },
  { id: "3", name: "С. Болормаа", specialty: "Мэдрэлийн эмч", hospital: "City Med Center", rating: 4.7, experience: "15 жил", online: false, fee: "50,000₮" },
  { id: "4", name: "Г. Ананд", specialty: "Дотрын эмч", hospital: "MediConnect Clinic", rating: 4.9, experience: "7 жил", online: true, fee: "40,000₮" },
];

export const hospitals = [
  { id: "1", name: "MediCare Hospital", type: "Нэгдсэн эмнэлэг", district: "Сүхбаатар", departments: 14, rating: 4.8, lat: 47.9186, lng: 106.9176 },
  { id: "2", name: "Нарны эмнэлэг", type: "Хүүхэд, эх барих", district: "Баянзүрх", departments: 9, rating: 4.7, lat: 47.9228, lng: 106.9522 },
  { id: "3", name: "City Med Center", type: "Оношилгоо, зөвлөгөө", district: "Хан-Уул", departments: 11, rating: 4.6, lat: 47.8931, lng: 106.9156 },
];

