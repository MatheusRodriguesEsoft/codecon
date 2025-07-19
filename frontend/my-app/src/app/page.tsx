"use client";

import { useState } from "react";

export default function Home() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    sendAt: "",
    image: null,
  });

  const handleChange = (e: { target: { name: any; value: any; files: any; }; }) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setFormData((prev) => ({ ...prev, image: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();

    const data = new FormData();
    data.append("name", formData.name);
    data.append("email", formData.email);
    data.append("message", formData.message);
    data.append("sendAt", formData.sendAt);
    if (formData.image) {
      data.append("image", formData.image);
    }

    try {
      const response = await fetch("http://localhost:3001/api/schedule-email", {
        method: "POST",
        body: data,
      });

      if (response.ok) {
        alert("Email agendado com sucesso!");
        setFormData({
          name: "",
          email: "",
          message: "",
          sendAt: "",
          image: null,
        });
      } else {
        alert("Erro ao agendar o email.");
      }
    } catch (err) {
      console.error("Erro:", err);
      alert("Erro inesperado ao agendar o email.");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 bg-white shadow rounded-xl mt-10">
      <h1 className="text-2xl font-semibold text-center mb-6">
        Agendar Envio de Email
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 text-sm font-medium">Nome</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 text-sm"
            required
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 text-sm"
            required
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium">Mensagem</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 text-sm"
            rows={4}
            required
          ></textarea>
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium">
            Data de Envio
          </label>
          <input
            type="datetime-local"
            name="sendAt"
            value={formData.sendAt}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 text-sm"
            required
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium">
            Imagem (opcional)
          </label>
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
            className="w-full text-sm"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm"
        >
          Agendar Email
        </button>
      </form>
    </div>
  );
}
