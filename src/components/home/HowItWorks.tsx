const steps = ["Эмч эсвэл эмнэлгээ хайна", "Тохиромжтой цаг, үйлчилгээг сонгоно", "Баталгаажуулж мэдэгдэл авна", "Зөвлөгөө, шинжилгээ, хяналтаа үргэлжлүүлнэ"];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <h2 className="text-3xl font-bold text-navy">Хэрхэн ажилладаг вэ?</h2>
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        {steps.map((step, index) => <div key={step} className="rounded-lg border border-sky-100 bg-white p-5"><span className="grid h-10 w-10 place-items-center rounded-full bg-medical font-bold text-white">{index + 1}</span><p className="mt-4 font-semibold text-navy">{step}</p></div>)}
      </div>
    </section>
  );
}

