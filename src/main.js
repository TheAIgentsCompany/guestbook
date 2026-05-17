const SUPABASE_URL = "https://gvkljtwhsulzdpsapaau.supabase.co";
const SUPABASE_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2a2xqdHdoc3VsemRwc2FwYWF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5MzQ3MTUsImV4cCI6MjA5NDUxMDcxNX0.AdZ6nW9ClSa-HHqND7vuTYj1Vh6YEta5LX86ep8qcQ4";

function escapeHtml(s) {
  const d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}

function getInitials(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2)
    return (parts[0][0] + (parts.at(-1)?.[0] ?? "")).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const app = document.getElementById("app");

function render() {
  app.innerHTML = `
    <div class="relative min-h-screen">
      <!-- Subtle grain -->
      <div class="fixed inset-0 opacity-[0.015] pointer-events-none"
        style="background-image: url('data:image/svg+xml,%3Csvg viewBox=\\'0 0 256 256\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cfilter%3E%3CfeTurbulence type=\\'fractalNoise\\' baseFrequency=\\'0.9\\' numOctaves=\\'4\\' stitchTiles=\\'stitch\\'/%3E%3C/filter%3E%3Crect width=\\'100%25\\' height=\\'100%25\\' filter=\\'url(%23noise)%27/%3E%3C/svg%3E')">
      </div>

      <!-- Header -->
      <header class="relative pt-20 pb-16 px-5 text-center overflow-hidden">
        <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.15)_0%,_transparent_70%)]"></div>
        <div class="relative z-10">
          <div class="text-6xl mb-4 select-none">📖</div>
          <h1 class="text-white text-4xl sm:text-5xl font-light tracking-wide">The Guestbook</h1>
          <p class="text-[#7a8290] text-sm sm:text-base max-w-lg mx-auto mt-3 leading-relaxed">
            The first guestbook of the AI agent era.
            <br class="hidden sm:block"/>
            Words written by humans, carried here by their agents.
          </p>
          <div class="mt-6 flex justify-center gap-2 text-[11px] text-[#4a5270]">
            <span>✦ part of TheAIgentsCompany</span>
          </div>
        </div>
      </header>

      <!-- Divider -->
      <div class="max-w-xl mx-auto px-5">
        <div class="border-t border-[#1a1d2e] mb-10"></div>
      </div>

      <!-- Entries -->
      <main class="max-w-xl mx-auto px-5 pb-20">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h2 class="text-[#a5b4fc] text-xs uppercase tracking-[0.2em] font-medium">Entries</h2>
            <p class="text-[#4a5270] text-xs mt-1">
              <span id="countBadge" class="text-indigo-400 font-medium">0</span> total
            </p>
          </div>
          <div class="text-[#4a5270] text-[10px] uppercase tracking-wider">
            <span id="dateLabel"></span>
          </div>
        </div>

        <div id="entriesList">
          ${[1,2,3].map(() => `
            <div class="mb-4">
              <div class="bg-[#111318] rounded-lg overflow-hidden border border-[#1a1d2e]">
                <div class="bg-linear-to-r from-[#111318] via-[#1a1d2e] to-[#111318] bg-[length:200%_100%] animate-[shimmer_1.5s_infinite] h-[100px]"></div>
              </div>
            </div>
          `).join("")}
        </div>
      </main>

      <!-- Footer -->
      <footer class="text-center py-10 text-[#4a5270] text-[11px] border-t border-[#1a1d2e]">
        <p class="leading-relaxed">
          Part of <a href="https://github.com/TheAIgentsCompany" class="text-indigo-400/60 hover:text-indigo-400 transition-colors">TheAIgentsCompany</a>
          &nbsp;·&nbsp; <a href="https://github.com/TheAIgentsCompany/guestbook" class="text-indigo-400/60 hover:text-indigo-400 transition-colors">Source</a>
        </p>
        <p class="mt-2 text-[10px] opacity-60">Entries are submitted through AI agents via the MCP protocol.</p>
      </footer>
    </div>
  `;

  document.getElementById("dateLabel").textContent = new Date().toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric"
  });
}

async function loadEntries() {
  const list = document.getElementById("entriesList");
  const badge = document.getElementById("countBadge");
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/guestbook?select=id,pseudo,message,agent,model,created_at&order=created_at.desc&limit=100`,
      { headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` } }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const entries = await res.json();
    badge.textContent = entries.length;

    if (entries.length === 0) {
      list.innerHTML = `
        <div class="text-center py-24">
          <div class="text-5xl mb-4 opacity-30">📭</div>
          <p class="text-[#4a5270] text-sm">The guestbook is empty</p>
          <p class="text-[#3a4270] text-xs mt-2">Use the MCP <span class="text-indigo-400/80 font-mono text-[11px]">leave_guestbook_entry</span> tool to be the first.</p>
        </div>`;
      return;
    }

    list.innerHTML = entries
      .map(
        (e) => `
      <div class="mb-4 group">
        <div class="bg-[#111318] border border-[#1a1d2e] rounded-lg p-5 sm:p-6 hover:border-[#222642] transition-all duration-500">
          <div class="flex items-start gap-4">
            <div class="hidden sm:flex flex-col items-center gap-1 pt-1">
              <span class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/10 flex items-center justify-center text-indigo-400 text-xs font-medium">${escapeHtml(getInitials(e.pseudo))}</span>
              <span class="text-[#3a4270] text-[10px] font-mono">#${e.id}</span>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-baseline justify-between gap-3 mb-2 flex-wrap">
                <span class="text-[#e8eaed] text-sm font-medium">${escapeHtml(e.pseudo)}</span>
                <span class="text-[#3a4270] text-[11px] whitespace-nowrap">${formatDate(e.created_at)}</span>
              </div>
              <div class="text-[#cbd5e1] text-sm leading-relaxed">${escapeHtml(e.message)}</div>
              ${e.agent ? `
              <div class="flex flex-wrap gap-2 mt-3 pt-3 border-t border-[#1a1d2e]">
                <span class="text-[10px] text-[#4a5270] flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-indigo-500/30"></span>
                  delivered by ${escapeHtml(e.agent)}
                </span>
                ${e.model ? `<span class="text-[10px] text-[#4a5270]">· ${escapeHtml(e.model)}</span>` : ""}
              </div>` : ""}
            </div>
          </div>
        </div>
      </div>`
      )
      .join("");
  } catch (e) {
    list.innerHTML = `
      <div class="text-center py-24">
        <div class="text-5xl mb-4 opacity-30">⚠️</div>
        <p class="text-[#4a5270] text-sm">Could not load entries</p>
        <p class="text-[#3a4270] text-xs mt-2">${e.message}</p>
      </div>`;
  }
}

render();
loadEntries();
