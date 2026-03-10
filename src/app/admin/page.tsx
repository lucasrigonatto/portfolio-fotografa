"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { BookingRequest, BookingStatus, PortfolioItem } from "@/lib/types";

type AdminData = {
  bookings: BookingRequest[];
  portfolio: PortfolioItem[];
};

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [data, setData] = useState<AdminData>({ bookings: [], portfolio: [] });

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [place, setPlace] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);

  async function loadDashboard(providedKey = adminKey) {
    setLoading(true);
    setMessage("");

    try {
      const [bookingsResponse, portfolioResponse] = await Promise.all([
        fetch("/api/bookings", { headers: { "x-admin-key": providedKey } }),
        fetch("/api/portfolio"),
      ]);

      const bookingsPayload = await bookingsResponse.json();
      const portfolioPayload = await portfolioResponse.json();

      if (!bookingsResponse.ok) {
        throw new Error(bookingsPayload.error || "Acesso negado ao painel.");
      }
      if (!portfolioResponse.ok) {
        throw new Error(portfolioPayload.error || "Erro ao carregar portfólio.");
      }

      setData({
        bookings: bookingsPayload.data || [],
        portfolio: portfolioPayload.data || [],
      });
      setIsUnlocked(true);
    } catch (error) {
      setMessage((error as Error).message);
      setIsUnlocked(false);
    } finally {
      setLoading(false);
    }
  }

  async function handleUnlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await loadDashboard(adminKey);
  }

  async function updateBookingStatus(id: string, status: BookingStatus) {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify({ status }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Não foi possível atualizar o status.");
      }

      setMessage("Status atualizado com sucesso.");
      await loadDashboard(adminKey);
    } catch (error) {
      setMessage((error as Error).message);
      setLoading(false);
    }
  }

  async function handleUploadPortfolio(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!image) {
      setMessage("Selecione uma foto para upload.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.set("title", title);
      formData.set("category", category);
      formData.set("place", place);
      formData.set("description", description);
      formData.set("image", image);

      const response = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "x-admin-key": adminKey },
        body: formData,
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Erro ao enviar item para portfólio.");
      }

      setTitle("");
      setCategory("");
      setPlace("");
      setDescription("");
      setImage(null);
      setMessage("Item de portfólio enviado com sucesso.");
      await loadDashboard(adminKey);
    } catch (error) {
      setMessage((error as Error).message);
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-10 text-white md:px-10">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold">Painel administrativo</h1>
        <Link href="/" className="text-[var(--color-accent)] underline">
          Voltar ao site
        </Link>
      </header>

      <section className="rounded-2xl border border-white/10 bg-[var(--color-surface)] p-6">
        <p className="text-sm text-white/70">
          Use a chave de administrador para aprovar reuniões e publicar fotos no portfólio.
        </p>
        <form onSubmit={handleUnlock} className="mt-4 flex flex-wrap gap-3">
          <input
            type="password"
            value={adminKey}
            onChange={(event) => setAdminKey(event.target.value)}
            className="min-w-[260px] flex-1 rounded-xl border border-white/20 bg-black/20 px-4 py-2.5 outline-none focus:border-[var(--color-accent)]"
            placeholder="Digite sua ADMIN_DASHBOARD_KEY"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-[var(--color-accent)] px-4 py-2.5 font-semibold text-black transition hover:brightness-110"
          >
            {loading ? "Carregando..." : "Entrar no painel"}
          </button>
        </form>
        {message ? <p className="mt-3 text-sm text-white/80">{message}</p> : null}
      </section>

      {isUnlocked ? (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-white/10 bg-[var(--color-surface)] p-6">
            <h2 className="text-xl font-semibold">Solicitações de reunião</h2>
            <div className="mt-4 grid gap-3">
              {data.bookings.length === 0 ? (
                <p className="rounded-xl border border-dashed border-white/20 p-4 text-sm text-white/65">
                  Nenhuma solicitação recebida ainda.
                </p>
              ) : (
                data.bookings.map((booking) => (
                  <article key={booking.id} className="rounded-xl border border-white/15 p-4">
                    <p className="font-medium">{booking.name}</p>
                    <p className="text-sm text-white/70">{booking.email}</p>
                    <p className="mt-1 text-sm text-white/70">
                      {booking.requested_slot} - {booking.service_type}
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-wider text-[var(--color-accent)]">
                      Status: {booking.status}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => updateBookingStatus(booking.id, "approved")}
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white"
                      >
                        Aprovar
                      </button>
                      <button
                        type="button"
                        onClick={() => updateBookingStatus(booking.id, "rejected")}
                        className="rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-semibold text-white"
                      >
                        Recusar
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-[var(--color-surface)] p-6">
            <h2 className="text-xl font-semibold">Novo item de portfólio</h2>
            <form onSubmit={handleUploadPortfolio} className="mt-4 grid gap-3">
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="rounded-xl border border-white/20 bg-black/20 px-4 py-2.5 outline-none focus:border-[var(--color-accent)]"
                placeholder="Título do trabalho"
                required
              />
              <input
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="rounded-xl border border-white/20 bg-black/20 px-4 py-2.5 outline-none focus:border-[var(--color-accent)]"
                placeholder="Categoria (ex.: Casamentos)"
                required
              />
              <input
                value={place}
                onChange={(event) => setPlace(event.target.value)}
                className="rounded-xl border border-white/20 bg-black/20 px-4 py-2.5 outline-none focus:border-[var(--color-accent)]"
                placeholder="Local"
                required
              />
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="min-h-24 rounded-xl border border-white/20 bg-black/20 px-4 py-2.5 outline-none focus:border-[var(--color-accent)]"
                placeholder="Descrição"
                required
              />
              <input
                type="file"
                accept="image/*"
                onChange={(event) => setImage(event.target.files?.[0] || null)}
                className="rounded-xl border border-white/20 bg-black/20 px-4 py-2.5"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-[var(--color-accent)] px-4 py-2.5 font-semibold text-black transition hover:brightness-110"
              >
                {loading ? "Enviando..." : "Publicar no portfólio"}
              </button>
            </form>
          </section>
        </div>
      ) : null}
    </main>
  );
}
