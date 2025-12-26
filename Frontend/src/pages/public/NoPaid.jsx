import React from "react";
import Robot from "../../assets/robotimg/img.png";
import br from "../../assets/logo/br.png";

export default function NoPaid({ reason }) {
  return (
    <div
      className="min-h-screen overflow-hidden antialiased"
      style={{
        background:
          "radial-gradient(800px 420px at 10% -10%, color-mix(in oklab, #64c1d7, transparent 82%), transparent 60%)," +
          "radial-gradient(620px 330px at 110% 10%, color-mix(in oklab, #d0b079, transparent 82%), transparent 60%)," +
          "#0f1014",
        color: "#e9eef7",
      }}
    >
      {/* Grid decorativa */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px) 0 0 / 22px 22px," +
            "linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px) 0 0 / 22px 22px",
          WebkitMask:
            "radial-gradient(620px 440px at 50% 18%, black, transparent 78%)",
          mask: "radial-gradient(620px 440px at 50% 18%, black, transparent 78%)",
        }}
      />

      <div className="relative grid min-h-screen grid-rows-[auto,1fr,auto]">
        {/* Header */}
        <header className="py-2 max-[700px]:py-1">
          <div className="mx-auto flex w-[min(94vw,1100px)] items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <div className="grid h-7 w-7 place-items-center rounded-lg">
                <img src={br} alt="" />
              </div>

              <h1 className="truncate text-[0.95rem] font-semibold tracking-tight max-[700px]:text-[0.9rem]">
                Blanco &amp; Ramirez — En construcción
              </h1>
            </div>

            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.72rem] font-bold"
              style={{
                border: "1px solid rgba(255,255,255,0.08)",
                background: "color-mix(in oklab, #d0b079, #fff 86%)",
                color: "color-mix(in oklab, #1f3b57, #000 35%)",
              }}
            >
              ⚒️ En progreso
            </span>
          </div>
        </header>

        {/* Main */}
        <main className="grid place-items-center px-2">
          <div
            className="mx-auto w-[min(94vw,1100px)] rounded-[14px] border shadow-[0_8px_24px_rgba(0,0,0,0.30)]"
            style={{
              borderColor: "rgba(255,255,255,0.08)",
              background: "#151821",
            }}
          >
            <div className="grid h-[calc(100svh-140px)] grid-cols-1 gap-3 p-3 md:h-[calc(100svh-160px)] md:grid-cols-2 md:gap-4 md:p-4 max-[700px]:h-[calc(100svh-120px)]">
              {/* Texto */}
              <section className="flex min-w-0 flex-col justify-center">
                <h2 className="mb-1 text-[clamp(18px,3.2vw,26px)] font-bold leading-tight">
                  Estamos preparando una nueva{" "}
                  <span className="bg-gradient-to-r from-[#d0b079] to-[#64c1d7] bg-clip-text text-transparent">
                    experiencia legal
                  </span>
                  .
                </h2>

                <p className="mb-2 text-[clamp(12px,1.4vw,14px)] text-[#a9b3c7]">
                  Aún no está lista, pero el caso ya está en curso. Si necesitas
                  asesoría ahora, contáctanos y te respondemos a la velocidad de
                  una cautelar bien redactada.
                </p>

                {reason && (
                  <p className="mb-2 text-xs text-[#a9b3c7]">
                    Motivo:{" "}
                    <span className="font-mono text-[#e9eef7]">{reason}</span>
                  </p>
                )}

                {/* CTA */}
                <div className="mt-3 flex flex-wrap gap-2 max-[700px]:mt-2">
                  <a
                    className="inline-flex min-w-[150px] items-center justify-center gap-2 rounded-lg px-3 py-2 text-[0.86rem] font-bold transition-transform hover:-translate-y-[1px]"
                    style={{
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: "#25D366",
                      color: "#0f1014",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.30)",
                    }}
                    href="https://wa.me/+573022795673"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg
                      className="h-[18px] w-[18px]"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        fill="#111827"
                        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.149-.672.15-.198.297-.771.966-.944 1.164-.173.199-.347.224-.644.075-.297-.149-1.255-.463-2.39-1.477-.883-.788-1.48-1.761-1.653-2.059-.173-.298-.018-.459.13-.607.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.672-1.62-.921-2.22-.242-.58-.487-.501-.672-.51l-.572-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.71.306 1.264.489 1.696.626.712.226 1.36.194 1.872.118.571-.085 1.758-.718 2.006-1.41.248-.694.248-1.289.173-1.414-.074-.124-.272-.198-.57-.347z"
                      />
                      <path
                        fill="#111827"
                        d="M20.52 3.48C18.29 1.25 15.24 0 12 0 5.37 0 0 5.37 0 12c0 2.12.55 4.19 1.6 6.02L0 24l6.17-1.6C7.96 23.45 9.96 24 12 24c6.63 0 12-5.37 12-12 0-3.24-1.25-6.29-3.48-8.52zM12 22.06c-1.86 0-3.68-.5-5.27-1.44l-.38-.23-3.66.95.98-3.56-.25-.37C2.39 15.77 1.94 13.91 1.94 12 1.94 6.47 6.47 1.94 12 1.94c2.69 0 5.22 1.05 7.12 2.96a10.02 10.02 0 0 1 2.94 7.1c0 5.53-4.53 10.06-10.06 10.06z"
                      />
                    </svg>
                    WhatsApp
                  </a>

                  <a
                    className="inline-flex min-w-[150px] items-center justify-center gap-2 rounded-lg px-3 py-2 text-[0.86rem] font-bold transition-transform hover:-translate-y-[1px]"
                    style={{
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: "rgba(255,255,255,0.10)",
                      color: "#e9eef7",
                    }}
                    href="mailto:contacto@blancoramirezlegal.com"
                  >
                    <svg
                      className="h-[18px] w-[18px] fill-current"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M12 13.5 2 6.75V18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6.75L12 13.5z" />
                      <path d="M22 6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2l10 7 10-7z" />
                    </svg>
                    Escríbenos
                  </a>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    className="rounded-lg px-3 py-2 text-[0.86rem] font-bold transition-transform hover:-translate-y-[1px]"
                    style={{
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: "rgba(255,255,255,0.08)",
                      color: "#e9eef7",
                    }}
                    onClick={() => window.location.reload()}
                  >
                    Reintentar
                  </button>
                </div>
              </section>

              {/* Side */}
              <aside className="flex min-w-0 flex-col justify-center gap-2">
                <figure
                  className="relative w-full overflow-hidden rounded-lg border"
                  style={{
                    borderColor: "rgba(255,255,255,0.08)",
                    background:
                      "linear-gradient(180deg, color-mix(in oklab, #10131b, #151821 80%), #151821)",
                  }}
                >
                  <div className="relative w-full aspect-[4/3] md:aspect-[3/2] p-2 shadow-[0_8px_24px_rgba(0,0,0,0.30)]">
                    <img
                      src={Robot}
                      alt="Representación visual de servicios legales en construcción"
                      className="absolute inset-0 m-auto max-h-[calc(100%-1rem)] max-w-[calc(100%-1rem)] h-auto w-auto object-contain"
                      loading="eager"
                    />
                  </div>
                </figure>

                <div
                  className="flex items-center gap-2 rounded-lg border px-2.5 py-2 text-[0.8rem]"
                  style={{
                    borderColor: "rgba(255,255,255,0.08)",
                    background: "rgba(255,255,255,0.05)",
                  }}
                >
                  <svg
                    className="h-4 w-4 fill-current"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5l-8-3Zm0 17.1A8.7 8.7 0 0 1 6 11.3V6.5l6-2.3 6 2.3v4.8a8.7 8.7 0 0 1-6 7.8Z" />
                  </svg>
                  <span>
                    Tu consulta será tratada con absoluta confidencialidad.
                  </span>
                </div>
              </aside>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-2 max-[700px]:py-1">
          <div
            className="mx-auto flex w-[min(94vw,1100px)] items-center justify-between gap-2 rounded-[14px] border px-3 py-2 text-[0.84rem] shadow-[0_8px_24px_rgba(0,0,0,0.30)]"
            style={{
              borderColor: "rgba(255,255,255,0.08)",
              background: "#151821",
              color: "#a9b3c7",
            }}
          >
            <div>
              © {new Date().getFullYear()} Blanco &amp; Ramirez · Todos los
              derechos reservados
            </div>

            <nav
              className="flex flex-wrap items-center gap-3"
              aria-label="Enlaces legales"
            >
              <a className="hover:underline" href="#" rel="nofollow">
                Aviso legal
              </a>
              <a className="hover:underline" href="#" rel="nofollow">
                Política de privacidad
              </a>
              <a className="hover:underline" href="#" rel="nofollow">
                Términos
              </a>
            </nav>

            <div
              className="flex items-center gap-2"
              aria-label="Contacto rápido"
            >
              <a
                href="https://wa.me/+573022795673"
                aria-label="WhatsApp"
                title="WhatsApp"
                className="grid h-[26px] w-[26px] place-items-center rounded-md border transition-transform hover:-translate-y-[1px]"
                style={{ borderColor: "rgba(255,255,255,0.08)" }}
                target="_blank"
                rel="noreferrer"
              >
                <svg
                  className="h-4 w-4 fill-current"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.149-.672.15-.198.297-.771.966-.944 1.164-.173.199-.347.224-.644.075-.297-.149-1.255-.463-2.39-1.477-.883-.788-1.48-1.761-1.653-2.059-.173-.298-.018-.459.13-.607.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.672-1.62-.921-2.22-.242-.58-.487-.501-.672-.51l-.572-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.71.306 1.264.489 1.696.626.712.226 1.36.194 1.872.118.571-.085 1.758-.718 2.006-1.41.248-.694.248-1.289.173-1.414-.074-.124-.272-.198-.57-.347z" />
                  <path d="M20.52 3.48C18.29 1.25 15.24 0 12 0 5.37 0 0 5.37 0 12c0 2.12.55 4.19 1.6 6.02L0 24l6.17-1.6C7.96 23.45 9.96 24 12 24c6.63 0 12-5.37 12-12 0-3.24-1.25-6.29-3.48-8.52zM12 22.06c-1.86 0-3.68-.5-5.27-1.44l-.38-.23-3.66.95.98-3.56-.25-.37C2.39 15.77 1.94 13.91 1.94 12 1.94 6.47 6.47 1.94 12 1.94c2.69 0 5.22 1.05 7.12 2.96a10.02 10.02 0 0 1 2.94 7.1c0 5.53-4.53 10.06-10.06 10.06z" />
                </svg>
              </a>

              <a
                href="mailto:contacto@blancoramirezlegal.com"
                aria-label="Email"
                title="Email"
                className="grid h-[26px] w-[26px] place-items-center rounded-md border transition-transform hover:-translate-y-[1px]"
                style={{ borderColor: "rgba(255,255,255,0.08)" }}
              >
                <svg
                  className="h-4 w-4 fill-current"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 13.5 2 6.75V18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6.75L12 13.5z" />
                  <path d="M22 6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2l10 7 10-7z" />
                </svg>
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
