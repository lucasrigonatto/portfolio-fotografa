"use client";

import Link from "next/link";
import Image from "next/image";
import { FormEvent, PointerEvent, useEffect, useMemo, useRef, useState } from "react";
import { PortfolioItem } from "@/lib/types";

const fallbackPortfolioItems: PortfolioItem[] = [
  {
    id: "1",
    title: "Luz de Fim de Tarde",
    category: "Retratos",
    place: "Parque das Águas",
    description: "Ensaio espontâneo com tons quentes e estética editorial.",
    image_url: "",
    created_at: "",
  },
  {
    id: "2",
    title: "Cerimônia Intimista",
    category: "Casamentos",
    place: "Capela São Bento",
    description: "Registro documental de momentos autênticos e emotivos.",
    image_url: "",
    created_at: "",
  },
  {
    id: "3",
    title: "Marca em Movimento",
    category: "Branding",
    place: "Estúdio Urbano",
    description: "Fotos para posicionamento profissional e presença digital.",
    image_url: "",
    created_at: "",
  },
  {
    id: "4",
    title: "Noite na Cidade",
    category: "Eventos",
    place: "Centro Cultural",
    description: "Cobertura com foco em energia, detalhes e atmosfera.",
    image_url: "",
    created_at: "",
  },
];

const availableSlots = [
  { date: "15/03", period: "10:00" },
  { date: "15/03", period: "15:00" },
  { date: "18/03", period: "11:00" },
  { date: "20/03", period: "17:30" },
];

type Highlight = {
  id: string;
  title: string;
  subtitle: string;
  cover: string;
  gallery: string[];
};

const highlightedSessions: Highlight[] = [
  {
    id: "entre-votos",
    title: "Entre Votos e Memórias",
    subtitle: "Casamento intimista com estética clássica",
    cover:
      "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    id: "jardim-antigo",
    title: "Jardim Antigo",
    subtitle: "Ensaio externo com luz natural e narrativa romântica",
    cover:
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    id: "salao-real",
    title: "Salão Real",
    subtitle: "Celebração noturna com direção editorial",
    cover:
      "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1472653431158-6364773b2a56?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1525258946800-98cfd641d0de?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=1200&q=80",
    ],
  },
];

export default function Home() {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>(
    fallbackPortfolioItems,
  );
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("Ensaio externo");
  const [message, setMessage] = useState("");
  const [date, setDate] = useState(availableSlots[0].date + " - " + availableSlots[0].period);
  const [serviceType, setServiceType] = useState("Ensaio fotográfico");
  const [submitMessage, setSubmitMessage] = useState("");
  const [loadingBooking, setLoadingBooking] = useState(false);
  const [selectedHighlight, setSelectedHighlight] = useState<Highlight | null>(null);
  const [beforeAfterPosition, setBeforeAfterPosition] = useState(52);
  const [isDraggingBeforeAfter, setIsDraggingBeforeAfter] = useState(false);
  const beforeAfterRef = useRef<HTMLDivElement | null>(null);

  const categories = useMemo(
    () => ["Todos", ...new Set(portfolioItems.map((item) => item.category))],
    [portfolioItems],
  );

  const filteredItems = useMemo(
    () =>
      activeCategory === "Todos"
        ? portfolioItems
        : portfolioItems.filter((item) => item.category === activeCategory),
    [activeCategory, portfolioItems],
  );

  useEffect(() => {
    async function loadPortfolio() {
      try {
        const response = await fetch("/api/portfolio");
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error || "Falha ao carregar portfólio.");
        }
        if (Array.isArray(payload.data) && payload.data.length > 0) {
          setPortfolioItems(payload.data);
        }
      } catch {
        setPortfolioItems(fallbackPortfolioItems);
      }
    }

    loadPortfolio();
  }, []);

  useEffect(() => {
    if (!selectedHighlight) {
      return;
    }
    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedHighlight(null);
      }
    }
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [selectedHighlight]);

  async function handleBookingSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setLoadingBooking(true);
      setSubmitMessage("");
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          requestedSlot: date,
          serviceType,
          notes: `Telefone: ${phone}\nLocal: ${location}\nMensagem: ${message || "Sem mensagem."}`,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Não foi possível enviar sua solicitação.");
      }
      setName("");
      setEmail("");
      setPhone("");
      setLocation("Ensaio externo");
      setMessage("");
      setDate(availableSlots[0].date + " - " + availableSlots[0].period);
      setServiceType("Ensaio fotográfico");
      setSubmitMessage(
        "Solicitação enviada com sucesso. A reunião ficará pendente até a confirmação da fotógrafa.",
      );
    } catch (error) {
      setSubmitMessage((error as Error).message);
    } finally {
      setLoadingBooking(false);
    }
  }

  function BrandLogo() {
    return (
      <div className="flex items-center gap-3">
        <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-[var(--color-accent)]/65 bg-black/25 shadow-lg shadow-black/45">
          <svg viewBox="0 0 120 120" className="h-9 w-9 text-[var(--color-accent)]">
            <path
              d="M83 25c-13-2-26 4-29 14-2 7 2 12 11 16l11 5c10 5 15 10 15 19 0 13-12 22-27 21-8 0-16-3-23-9"
              fill="none"
              stroke="currentColor"
              strokeWidth="5.6"
              strokeLinecap="round"
            />
            <path
              d="M38 25c13-2 26 4 29 14 2 7-2 12-11 16l-11 5c-10 5-15 10-15 19 0 13 12 22 27 21 8 0 16-3 23-9"
              fill="none"
              stroke="currentColor"
              strokeWidth="5.6"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <p className="text-4xl leading-none text-[var(--color-accent)] md:text-5xl">
          <span className="font-brand text-5xl md:text-6xl">S</span>abrina{" "}
          <span className="font-brand text-5xl md:text-6xl">S</span>chreiner
        </p>
      </div>
    );
  }

  function BeforeAfterSlider() {
    function updateBeforeAfterPosition(clientX: number) {
      if (!beforeAfterRef.current) {
        return;
      }
      const rect = beforeAfterRef.current.getBoundingClientRect();
      const raw = ((clientX - rect.left) / rect.width) * 100;
      setBeforeAfterPosition(Math.min(100, Math.max(0, raw)));
    }

    function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      setIsDraggingBeforeAfter(true);
      updateBeforeAfterPosition(event.clientX);
    }

    function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
      if (!isDraggingBeforeAfter) {
        return;
      }
      updateBeforeAfterPosition(event.clientX);
    }

    function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      setIsDraggingBeforeAfter(false);
    }

    return (
      <section className="mt-14 rounded-3xl border border-white/10 bg-[var(--color-surface)] p-5 md:p-8">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-2xl font-semibold">Antes e Depois da Edição</h3>
          <p className="text-xs uppercase tracking-[0.18em] text-white/60">Arraste para comparar</p>
        </div>

        <div
          ref={beforeAfterRef}
          className="relative overflow-hidden rounded-2xl border border-white/10 touch-none select-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <img
            src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=2000&q=80&sat=25&contrast=120&brightness=105"
            alt="Foto com edição"
            className="pointer-events-none h-[340px] w-full object-cover md:h-[440px]"
            draggable={false}
          />
          <div
            className="pointer-events-none absolute inset-y-0 left-0 overflow-hidden"
            style={{ width: `${beforeAfterPosition}%` }}
          >
            <img
              src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=2000&q=80"
              alt="Foto sem edição"
              className="pointer-events-none h-[340px] w-[1100px] max-w-none object-cover md:h-[440px]"
              draggable={false}
            />
          </div>
          <div
            className="pointer-events-none absolute inset-y-0 z-10 w-0.5 bg-white/90"
            style={{ left: `${beforeAfterPosition}%` }}
          >
            <span className="absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/60 bg-black/45 text-xs">
              ◄►
            </span>
          </div>
          <span className="absolute left-3 top-3 rounded-md bg-black/50 px-2 py-1 text-xs">
            Sem edição
          </span>
          <span className="absolute right-3 top-3 rounded-md bg-black/50 px-2 py-1 text-xs">
            Com edição
          </span>
        </div>
      </section>
    );
  }

  return (
    <main className="pb-16 text-white">
      <section className="-mx-6 overflow-hidden md:-mx-10">
        <div className="relative h-[100vh]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=2400&q=90')",
              backgroundSize: "cover",
              backgroundPosition: "center center",
              filter: "grayscale(24%) brightness(0.75) contrast(0.9)",
            }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(102deg,rgba(7,7,10,0.86)_0%,rgba(7,7,10,0.48)_50%,rgba(7,7,10,0.76)_100%)]" />
          <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col px-6 py-6 md:px-10 md:py-7">
            <header className="animate-soft-in">
              <nav className="flex flex-wrap items-center justify-between gap-4 text-sm">
                <BrandLogo />
                <div className="flex flex-wrap items-center gap-4 md:gap-5">
                  <a
                    href="#destaques"
                    className="relative py-1 text-[13px] font-medium uppercase tracking-[0.14em] text-white/90 transition hover:text-[var(--color-accent)] after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-[var(--color-accent)] after:transition-all hover:after:w-full"
                  >
                    Destaques
                  </a>
                  <a
                    href="#portfolio"
                    className="relative py-1 text-[13px] font-medium uppercase tracking-[0.14em] text-white/90 transition hover:text-[var(--color-accent)] after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-[var(--color-accent)] after:transition-all hover:after:w-full"
                  >
                    Portfólio
                  </a>
                  <a
                    href="#bio"
                    className="relative py-1 text-[13px] font-medium uppercase tracking-[0.14em] text-white/90 transition hover:text-[var(--color-accent)] after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-[var(--color-accent)] after:transition-all hover:after:w-full"
                  >
                    Bio
                  </a>
                  <a
                    href="#projetos"
                    className="relative py-1 text-[13px] font-medium uppercase tracking-[0.14em] text-white/90 transition hover:text-[var(--color-accent)] after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-[var(--color-accent)] after:transition-all hover:after:w-full"
                  >
                    Projetos
                  </a>
                  <Link
                    href="/admin"
                    className="rounded-full border border-white/20 px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.12em] text-white/90 transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                  >
                    Admin
                  </Link>
                </div>
              </nav>
            </header>

            <div className="mt-14 grid flex-1 gap-8 md:mt-20 md:grid-cols-[1fr_420px]">
              <div className="animate-fade-up flex h-full items-end">
                <div className="space-y-4 pb-1">
                  <p className="text-sm uppercase tracking-[0.25em] text-[var(--color-accent)]">
                    Fotografia com alma
                  </p>
                  <h1 className="max-w-2xl text-4xl font-semibold leading-tight md:text-6xl">
                    Somos a soma das nossas memórias em conjunto.
                  </h1>
                </div>
              </div>

              <div className="animate-fade-up md:ml-auto md:flex md:h-full md:w-[380px] md:translate-x-10 md:flex-col md:justify-end lg:translate-x-14">
                <div className="animate-soft-in max-h-[66vh] overflow-y-auto rounded-3xl border border-white/15 bg-black/20 p-4 backdrop-blur-md">
                  <h2 className="text-xl font-semibold">Solicitar Reunião</h2>
                  <p className="mt-1 text-xs text-white/75">
                    Envie os dados e aguarde a confirmação.
                  </p>
                  <form onSubmit={handleBookingSubmit} className="mt-3 grid gap-2">
                    <input
                      required
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Nome completo"
                      className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none placeholder:text-white/45 focus:border-[var(--color-accent)]"
                    />
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="E-mail"
                      className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none placeholder:text-white/45 focus:border-[var(--color-accent)]"
                    />
                    <input
                      required
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="Telefone"
                      className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none placeholder:text-white/45 focus:border-[var(--color-accent)]"
                    />
                    <select
                      value={location}
                      onChange={(event) => setLocation(event.target.value)}
                      className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
                    >
                      <option className="bg-white text-black">Ensaio externo</option>
                      <option className="bg-white text-black">Cerimônia de casamento</option>
                      <option className="bg-white text-black">Estúdio</option>
                      <option className="bg-white text-black">Evento</option>
                    </select>
                    <select
                      value={date}
                      onChange={(event) => setDate(event.target.value)}
                      className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
                    >
                      {availableSlots.map((slot) => (
                        <option
                          key={slot.date + slot.period}
                          value={`${slot.date} - ${slot.period}`}
                          className="bg-white text-black"
                        >
                          {slot.date} - {slot.period}
                        </option>
                      ))}
                    </select>
                    <select
                      value={serviceType}
                      onChange={(event) => setServiceType(event.target.value)}
                      className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
                    >
                      <option className="bg-white text-black">Ensaio fotográfico</option>
                      <option className="bg-white text-black">Reunião para casamento</option>
                      <option className="bg-white text-black">Fotografia de branding</option>
                      <option className="bg-white text-black">Cobertura de evento</option>
                    </select>
                    <textarea
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      placeholder="Mensagem (opcional)"
                      className="min-h-16 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none placeholder:text-white/45 focus:border-[var(--color-accent)]"
                    />
                    <button
                      type="submit"
                      disabled={loadingBooking}
                      className="mt-1 rounded-xl bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:brightness-110"
                    >
                      {loadingBooking ? "Enviando..." : "Solicitar Reunião"}
                    </button>
                  </form>
                  {submitMessage ? (
                    <p className="mt-3 rounded-lg border border-white/15 bg-black/25 p-3 text-xs text-white/90">
                      {submitMessage}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-52 bg-[linear-gradient(to_bottom,rgba(31,24,24,0)_0%,rgba(31,24,24,0.45)_55%,rgba(18,16,22,0.92)_100%)]" />
        </div>
      </section>

      <div className="-mx-6 -mt-8 h-36 bg-gradient-to-b from-[#121018] via-[#121119] to-transparent md:-mx-10" />

      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <section id="destaques" className="animate-fade-up mt-6">
          <h2 className="text-center text-4xl font-semibold">Destaques</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {highlightedSessions.map((highlight) => (
              <button
                key={highlight.id}
                type="button"
                onClick={() => setSelectedHighlight(highlight)}
                className="group overflow-hidden rounded-3xl border border-white/10 bg-[var(--color-surface)] text-left transition duration-300 hover:-translate-y-1 hover:border-white/30 hover:shadow-2xl hover:shadow-black/25"
              >
                <Image
                  src={highlight.cover}
                  alt={highlight.title}
                  width={600}
                  height={500}
                  unoptimized
                  className="h-72 w-full object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="p-5">
                  <h3 className="text-2xl font-medium">{highlight.title}</h3>
                  <p className="mt-2 text-sm text-white/75">{highlight.subtitle}</p>
                  <p className="mt-3 text-sm font-medium text-[var(--color-accent)]">
                    Abrir ensaio completo
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>

        <BeforeAfterSlider />

        <section id="portfolio" className="animate-fade-up mt-14">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-3xl font-semibold">Portfólio por especialidade</h2>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`rounded-full border px-4 py-1.5 text-sm transition ${
                    activeCategory === category
                      ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-black"
                      : "border-white/20 text-white/80 hover:bg-white/10"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <article
                key={item.id}
                className="group rounded-2xl border border-white/10 bg-[var(--color-surface)] p-4 transition duration-300 hover:-translate-y-1 hover:border-white/30 hover:shadow-xl hover:shadow-black/30"
              >
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt={item.title}
                    width={400}
                    height={240}
                    unoptimized
                    className="h-40 w-full rounded-xl object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="h-40 rounded-xl bg-gradient-to-br from-neutral-700 via-neutral-800 to-neutral-900" />
                )}
                <p className="mt-4 text-xs uppercase tracking-wider text-[var(--color-accent)]">
                  {item.category} - {item.place}
                </p>
                <h3 className="mt-2 text-xl font-medium">{item.title}</h3>
                <p className="mt-2 text-sm text-white/70">{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="bio"
          className="animate-fade-up mt-14 grid gap-6 rounded-3xl border border-white/10 bg-[var(--color-surface)] p-8 md:grid-cols-2"
        >
          <div>
            <h2 className="text-3xl font-semibold">Bio</h2>
            <p className="mt-4 leading-relaxed text-white/80">
              Fotógrafa especializada em retratos, casamentos e fotografia de marca.
              O trabalho une estética editorial com uma abordagem humana.
            </p>
            <p className="mt-4 leading-relaxed text-white/80">
              Cada projeto é pensado para traduzir identidade, emoção e memória,
              com atenção aos detalhes desde o planejamento até a entrega final.
            </p>
          </div>
          <div className="grid gap-3 text-sm">
            <div className="rounded-xl border border-white/10 bg-black/20 p-4 transition hover:bg-black/30">
              <p className="text-white/60">Experiência</p>
              <p className="mt-1 text-xl font-semibold">+7 anos</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-4 transition hover:bg-black/30">
              <p className="text-white/60">Ensaios realizados</p>
              <p className="mt-1 text-xl font-semibold">+350 projetos</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-4 transition hover:bg-black/30">
              <p className="text-white/60">Estilo</p>
              <p className="mt-1 text-xl font-semibold">Editorial, documental e afetivo</p>
            </div>
          </div>
        </section>

        <section
          id="projetos"
          className="animate-fade-up mt-14 rounded-3xl border border-white/10 bg-[var(--color-surface)] p-8"
        >
          <h2 className="text-3xl font-semibold">Projetos</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <article className="rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:-translate-y-0.5 hover:bg-black/30">
              <h3 className="text-lg font-medium">Mentoria para iniciantes</h3>
              <p className="mt-2 text-sm text-white/70">
                Aulas práticas sobre direção de pessoas, luz natural e edição.
              </p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:-translate-y-0.5 hover:bg-black/30">
              <h3 className="text-lg font-medium">Projeto social retratos</h3>
              <p className="mt-2 text-sm text-white/70">
                Ensaio gratuito para mulheres empreendedoras em começo de carreira.
              </p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:-translate-y-0.5 hover:bg-black/30">
              <h3 className="text-lg font-medium">Exposição autoral anual</h3>
              <p className="mt-2 text-sm text-white/70">
                Curadoria de série fotográfica com narrativa sensível e contemporânea.
              </p>
            </article>
          </div>
        </section>
      </div>

      {selectedHighlight ? (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 p-5"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedHighlight(null);
            }
          }}
        >
          <div className="max-h-[90vh] w-full max-w-5xl overflow-auto rounded-2xl border border-white/20 bg-[var(--color-surface)] p-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-3xl font-semibold">{selectedHighlight.title}</h3>
                <p className="mt-1 text-white/75">{selectedHighlight.subtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedHighlight(null)}
                className="rounded-lg border border-white/20 px-3 py-1.5 text-sm hover:bg-white/10"
                aria-label="Fechar modal"
              >
                Fechar ✕
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {selectedHighlight.gallery.map((imageUrl) => (
                <Image
                  key={imageUrl}
                  src={imageUrl}
                  alt={selectedHighlight.title}
                  width={1000}
                  height={700}
                  unoptimized
                  className="h-64 w-full rounded-xl object-cover md:h-72"
                />
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
