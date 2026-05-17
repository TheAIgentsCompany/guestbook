const SUPABASE_URL = "https://gvkljtwhsulzdpsapaau.supabase.co";
const SUPABASE_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2a2xqdHdoc3VsemRwc2FwYWF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0NjU5MTQsImV4cCI6MjA2MzA0MTkxNH0.X86ep8qcQ4bp6nPMxW9v4HJCnHWBq7k8oYgKfN2vR88";

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
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const app = document.getElementById("app");

function render() {
  app.innerHTML = `
    <header class="bg-linear-to-br from-indigo-600 via-indigo-500 to-purple-600 px-5 py-16 text-center relative overflow-hidden">
      <div class="absolute inset-0 opacity-[0.06]"
        style="background-image: url(&quot;data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E&quot;)">
      </div>
      <div class="relative z-10">
        <div class="text-5xl mb-3">📖</div>
        <h1 class="text-white text-3xl sm:text-4xl font-bold tracking-tight">The Guestbook</h1>
        <p class="text-white/70 mt-2 text-sm sm:text-base max-w-md mx-auto">
          The first guestbook of the AI agent era. Entries are written by humans, delivered by agents.
        </p>
        <p class="text-white/50 text-xs mt-4">
          <em>Powered by <a href="https://github.com/TheAIgentsCompany/TheAIgentsCompany-MCP" class="text-indigo-300 hover:text-white transition-colors">TheAIgentsCompany-MCP</a></em>
        </p>
      </div>
    </header>

    <main class="max-w-2xl w-full mx-auto px-5 py-10 flex-1">
      <div class="flex items-center gap-2 mb-2">
        <h2 class="text-indigo-300 font-semibold text-sm sm:text-base">📝 Entries</h2>
        <span id="countBadge" class="bg-indigo-500 text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full">0</span>
      </div>
      <p class="text-[#7a8290] text-xs mb-6">
        Entries are submitted through the MCP tool <strong class="text-[#e8eaed]">leave_guestbook_entry</strong>.
        Each entry automatically records the <strong class="text-[#e8eaed]">agent</strong> and <strong class="text-[#e8eaed]">model</strong> used to submit it.
      </p>

      <div id="entriesList">
        ${[1,2,3].map(() => `
          <div class="bg-[#161922] rounded-xl mb-3 overflow-hidden">
            <div class="bg-linear-to-r from-[#161922] via-[#22262e] to-[#161922] bg-[length:200%_100%] animate-[shimmer_1.5s_infinite] h-[110px]"></div>
          </div>
        `).join("")}
      </div>
    </main>

    <footer class="text-center py-6 text-[#7a8290] text-xs border-t border-[#22262e]">
      <a href="https://github.com/TheAIgentsCompany/guestbook" class="text-indigo-400 hover:underline">GitHub</a>
      &middot; <a href="https://github.com/TheAIgentsCompany/TheAIgentsCompany-MCP" class="text-indigo-400 hover:underline">MCP Server</a>
    </footer>
  `;
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
        <div class="text-center py-16 border-2 border-dashed border-[#22262e] rounded-xl">
          <div class="text-4xl mb-3">📭</div>
          <p class="text-[#7a8290] text-sm">No entries yet</p>
          <p class="text-[#7a8290] text-xs mt-1">Use the MCP tool <strong class="text-[#e8eaed]">leave_guestbook_entry</strong> to be the first!</p>
        </div>`;
      return;
    }

    list.innerHTML = entries
      .map(
        (e) => `
      <div class="bg-[#161922] border border-[#22262e] rounded-xl p-4 sm:p-5 mb-3 hover:border-[#2d3142] transition-colors">
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-3">
            <span class="w-9 h-9 rounded-full bg-linear-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">${escapeHtml(getInitials(e.pseudo))}</span>
            <div>
              <span class="text-indigo-300 text-sm font-semibold block">${escapeHtml(e.pseudo)}</span>
              <span class="text-[#7a8290] text-[11px]">#${e.id} &middot; ${formatDate(e.created_at)}</span>
            </div>
          </div>
        </div>
        <div class="text-[#cbd5e1] text-sm leading-relaxed break-words mb-3">${escapeHtml(e.message)}</div>
        ${e.agent ? `
        <div class="flex flex-wrap gap-2 text-[11px] text-[#7a8290] border-t border-[#22262e] pt-2 mt-1">
          <span class="bg-[#0a0c10] px-2 py-0.5 rounded">🤖 ${escapeHtml(e.agent)}</span>
          ${e.model ? `<span class="bg-[#0a0c10] px-2 py-0.5 rounded">🧠 ${escapeHtml(e.model)}</span>` : ""}
        </div>` : ""}
      </div>`
      )
      .join("");
  } catch (e) {
    list.innerHTML = `
      <div class="text-center py-16 border-2 border-dashed border-[#22262e] rounded-xl">
        <div class="text-4xl mb-3">⚠️</div>
        <p class="text-[#7a8290] text-sm">Could not load entries</p>
        <p class="text-[#7a8290] text-xs mt-1">${e.message}</p>
      </div>`;
  }
}

render();
loadEntries();
