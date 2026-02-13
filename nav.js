/* Shared Navigation Component */
function renderSidebar(activePage) {
    return `
    <aside class="w-80 bg-white border-r border-black/[0.03] flex flex-col relative z-20 shadow-sm">
        <div class="p-10">
            <div class="mb-16 group cursor-pointer">
                <a href="index.html">
                    <img src="logo.png" alt="JOBREAKER" class="h-20 w-auto transition-transform group-hover:scale-105">
                </a>
            </div>

            <nav class="space-y-3">
                <a href="dashboard.html"
                    class="flex items-center gap-4 px-6 py-4 rounded-2xl ${activePage === 'dashboard' ? 'bg-black text-white font-black shadow-xl scale-[1.02]' : 'text-charcoal font-bold hover:bg-black/5 hover:text-black'} transition-all group">
                    <iconify-icon icon="solar:feed-bold" class="text-2xl ${activePage !== 'dashboard' ? 'opacity-40 group-hover:opacity-100 transition-opacity' : ''}"></iconify-icon>
                    <span class="text-[13px] tracking-wide">FEED MATINAL</span>
                </a>
                <a href="profile.html"
                    class="flex items-center gap-4 px-6 py-4 rounded-2xl ${activePage === 'profile' ? 'bg-black text-white font-black shadow-xl scale-[1.02]' : 'text-charcoal font-bold hover:bg-black/5 hover:text-black'} transition-all group">
                    <iconify-icon icon="solar:user-bold" class="text-2xl ${activePage !== 'profile' ? 'opacity-40 group-hover:opacity-100 transition-opacity' : ''}"></iconify-icon>
                    <span class="text-[13px] tracking-wide">MON PROFIL</span>
                </a>
                <a href="settings.html"
                    class="flex items-center gap-4 px-6 py-4 rounded-2xl ${activePage === 'settings' ? 'bg-black text-white font-black shadow-xl scale-[1.02]' : 'text-charcoal font-bold hover:bg-black/5 hover:text-black'} transition-all group">
                    <iconify-icon icon="solar:settings-bold" class="text-2xl ${activePage !== 'settings' ? 'opacity-40 group-hover:opacity-100 transition-opacity' : ''}"></iconify-icon>
                    <span class="text-[13px] tracking-wide">PARAMÈTRES</span>
                </a>
                <a href="documentation.html" target="_blank"
                    class="flex items-center gap-4 px-6 py-4 rounded-2xl text-charcoal font-bold hover:bg-black/5 hover:text-black transition-all group">
                    <iconify-icon icon="solar:document-text-bold" class="text-2xl opacity-40 group-hover:opacity-100 transition-opacity"></iconify-icon>
                    <span class="text-[13px] tracking-wide">DOCUMENTATION</span>
                </a>
            </nav>
        </div>

        <div class="mt-auto p-10 border-t border-black/[0.03]">
            <button onclick="handleLogout()"
                class="flex items-center gap-4 text-charcoal font-bold hover:text-red-500 transition-colors group">
                <iconify-icon icon="solar:logout-bold" class="text-2xl opacity-40 group-hover:opacity-100 transition-opacity"></iconify-icon>
                <span class="text-[13px] tracking-wide uppercase">Déconnexion</span>
            </button>
        </div>
    </aside>
    `;
}

function handleLogout() {
    if (app.supabase) app.supabase.auth.signOut();
    app.userData = {
        id: '',
        full_name: '',
        email: '',
        target_job: '',
        location: 'Remote'
    };
    localStorage.removeItem('jobreaker_user');
    window.location.href = 'index.html';
}
