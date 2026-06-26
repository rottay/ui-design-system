/**
 * Self-contained Claude Design card template.
 *
 * Each card is a standalone HTML document that:
 *  - starts with a `@dsCard` marker so the Design System pane builds its index
 *  - links the shared DS token bundle (all tenants + modern engine vars)
 *  - sets `html[data-tenant]` and exposes a tenant <select> that re-skins the
 *    component live (tenant theming is pure CSS variables)
 *
 * The component is framed inside a centered showcase panel so it reads as a
 * proper card rather than a lone element on an empty canvas.
 */

const GROUP_LABEL = {
  display: 'Display',
  inputs: 'Inputs',
  feedback: 'Feedback',
  layout: 'Layout',
  navigation: 'Navigation',
  overlay: 'Overlay',
};

function esc(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function slugForTier(tier) {
  return String(tier).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function groupLabelFor(group) {
  if (GROUP_LABEL[group]) return GROUP_LABEL[group];
  if (!group) return 'Components';
  return group.charAt(0).toUpperCase() + group.slice(1);
}

export function buildCardHtml({ group, name, subtitle, cardId, bodyHtml, cssHref }) {
  const label = groupLabelFor(group);
  return `<!-- @dsCard group="${esc(label)}" subtitle="${esc(subtitle)}" -->
<!doctype html>
<html lang="en" data-tenant="rottay" data-engine="modern">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(name)} · Rottay Design System</title>
  <link rel="stylesheet" href="${esc(cssHref)}" />
  <style>
    :root { color-scheme: light dark; }
    html, body { margin: 0; height: 100%; }
    body {
      box-sizing: border-box;
      min-height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 24px;
      background:
        radial-gradient(120% 120% at 50% 0%,
          var(--ds-color-surface, rgba(255,255,255,0.04)) 0%,
          var(--ds-color-bg-canvas, var(--ds-color-background, #0c0c0e)) 60%);
      color: var(--ds-color-text-primary, #f5f5f5);
      font-family: var(--ds-font-family-base, ui-sans-serif, system-ui, -apple-system, sans-serif);
    }
    .ds-card {
      width: 100%;
      max-width: 680px;
      background: var(--ds-color-surface, var(--ds-surface-card, #18181b));
      border: 1px solid var(--ds-color-border, rgba(255,255,255,0.10));
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 12px 40px rgba(0,0,0,0.28), 0 2px 8px rgba(0,0,0,0.18);
    }
    .ds-card__bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 12px 16px;
      border-bottom: 1px solid var(--ds-color-border, rgba(255,255,255,0.08));
    }
    .ds-card__id { display: flex; align-items: baseline; gap: 10px; min-width: 0; }
    .ds-card__name { font-size: 14px; font-weight: 600; }
    .ds-card__group {
      font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase;
      color: var(--ds-color-text-muted, var(--ds-color-text-secondary, rgba(255,255,255,0.55)));
    }
    .ds-card__tenant { display: flex; align-items: center; gap: 8px; font-size: 12px; }
    .ds-card__tenant > span { color: var(--ds-color-text-muted, rgba(255,255,255,0.55)); }
    .ds-card__tenant select {
      background: var(--ds-color-bg-canvas, #0c0c0e); color: inherit;
      border: 1px solid var(--ds-color-border, rgba(255,255,255,0.18));
      border-radius: 8px; padding: 5px 8px; font-size: 12px; font-family: inherit;
    }
    .ds-card__stage {
      display: flex; align-items: center; justify-content: center;
      flex-wrap: wrap; gap: 16px;
      min-height: 200px; padding: 40px 32px;
    }
    /* Embedded in the local gallery: full-bleed, no own frame, global tenant. */
    html[data-embed], html[data-embed] body { height: auto; }
    html[data-embed] body { min-height: 0; padding: 0; background: transparent; align-items: stretch; }
    html[data-embed] .ds-card { max-width: none; border: 0; border-radius: 0; box-shadow: none; background: transparent; }
    html[data-embed] .ds-card__tenant { display: none; }
    html[data-embed] .ds-card__stage { min-height: 180px; padding: 28px 24px; }
  </style>
</head>
<body>
  <main class="ds-card">
    <header class="ds-card__bar">
      <div class="ds-card__id">
        <span class="ds-card__name">${esc(name)}</span>
        <span class="ds-card__group">${esc(label)}</span>
      </div>
      <label class="ds-card__tenant" data-design-card-meta="${esc(cardId)}">
        <span>Tenant</span>
        <select aria-label="Tenant theme"
          onchange="document.documentElement.setAttribute('data-tenant', this.value)">
          <option value="rottay">Rottay</option>
          <option value="bithire">BitHire</option>
          <option value="evnto">Evnto</option>
        </select>
      </label>
    </header>
    <div class="ds-card__stage">
${bodyHtml}
    </div>
  </main>
  <script>
    (function () {
      var embedded = location.search.indexOf('embed') !== -1;
      if (embedded) document.documentElement.setAttribute('data-embed', '1');

      // Gallery → card: switch tenant on every card at once.
      window.addEventListener('message', function (event) {
        var tenant = event && event.data && event.data.dsTenant;
        if (!tenant) return;
        document.documentElement.setAttribute('data-tenant', tenant);
        var select = document.querySelector('.ds-card__tenant select');
        if (select) select.value = tenant;
      });

      // Card → gallery: report height so the iframe never clips the preview.
      if (embedded) {
        var report = function () {
          try {
            parent.postMessage({ dsHeight: Math.ceil(document.body.scrollHeight), dsSlug: '${esc(cardId)}' }, '*');
          } catch (e) {}
        };
        window.addEventListener('load', function () { report(); setTimeout(report, 250); });
      }
    })();
  </script>
</body>
</html>`;
}

/**
 * Local gallery index: a sidebar menu by category + a grid of every card in an
 * iframe, with one global tenant switcher that drives them all via postMessage.
 */
export function buildIndexHtml({ groups, total }) {
  const esc2 = esc;
  let navTier = null;
  const nav = groups
    .map((g) => {
      let prefix = '';
      if (g.tierLabel && g.tierLabel !== navTier) {
        navTier = g.tierLabel;
        prefix = `<div class="nav-tier">${esc2(g.tierLabel)}</div>`;
      }
      return `${prefix}<a href="#group-${esc2(g.key)}">${esc2(g.label)} <span>${g.items.length}</span></a>`;
    })
    .join('\n      ');

  let sectionTier = null;
  const sections = groups
    .map((g) => {
      let tierEyebrow = '';
      if (g.tierLabel && g.tierLabel !== sectionTier) {
        sectionTier = g.tierLabel;
        tierEyebrow = `<div class="g-tier" id="tier-${esc2(slugForTier(g.tierLabel))}">${esc2(g.tierLabel)}</div>`;
      }
      const cards = g.items
        .map(
          (item) => `
        <div class="g-card">
          <iframe loading="lazy" data-slug="${esc2(item.cardId)}" src="components/${esc2(item.tier)}/${esc2(item.slug)}/index.html?embed=1" title="${esc2(item.name)}"></iframe>
        </div>`
        )
        .join('');
      return `${tierEyebrow}
      <section id="group-${esc2(g.key)}" class="g-section">
        <h2>${esc2(g.label)} <span>${g.items.length}</span></h2>
        <div class="g-grid">${cards}
        </div>
      </section>`;
    })
    .join('\n');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Rottay Design System · ${total} components</title>
  <style>
    :root { color-scheme: dark; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; background: #0c0c0e; color: #f5f5f5; }
    .layout { display: grid; grid-template-columns: 240px 1fr; min-height: 100vh; }
    aside { position: sticky; top: 0; align-self: start; height: 100vh; overflow: auto; padding: 24px 16px; border-right: 1px solid rgba(255,255,255,0.08); }
    aside h1 { font-size: 14px; margin: 0 0 4px; }
    aside p { font-size: 12px; color: rgba(255,255,255,0.5); margin: 0 0 20px; }
    aside nav { display: flex; flex-direction: column; gap: 2px; }
    aside nav a { display: flex; justify-content: space-between; padding: 7px 10px; border-radius: 8px; color: rgba(255,255,255,0.8); text-decoration: none; font-size: 13px; }
    aside nav a:hover { background: rgba(255,255,255,0.06); }
    aside nav a span { color: rgba(255,255,255,0.4); font-variant-numeric: tabular-nums; }
    .nav-tier { margin: 16px 0 4px; padding: 0 10px; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.35); }
    .nav-tier:first-child { margin-top: 0; }
    .g-tier { margin: 40px 0 4px; font-size: 18px; font-weight: 600; letter-spacing: -0.01em; }
    .g-tier:first-of-type { margin-top: 8px; }
    main { padding: 24px 28px 80px; }
    .topbar { display: flex; align-items: center; justify-content: space-between; gap: 16px; position: sticky; top: 0; background: rgba(12,12,14,0.85); backdrop-filter: blur(8px); padding: 12px 0 16px; z-index: 5; }
    .topbar strong { font-size: 15px; }
    .topbar label { display: flex; align-items: center; gap: 8px; font-size: 13px; color: rgba(255,255,255,0.6); }
    .topbar select { background: #18181b; color: #fff; border: 1px solid rgba(255,255,255,0.18); border-radius: 8px; padding: 6px 10px; font-size: 13px; }
    .g-section { padding-top: 24px; }
    .g-section h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(255,255,255,0.55); margin: 0 0 14px; }
    .g-section h2 span { color: rgba(255,255,255,0.3); }
    .g-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 18px; align-items: start; }
    .g-card { margin: 0; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; overflow: hidden; background: #141417; transition: border-color 120ms ease; }
    .g-card:hover { border-color: rgba(255,255,255,0.22); }
    .g-card iframe { width: 100%; height: 300px; border: 0; display: block; background: transparent; transition: height 120ms ease; }
  </style>
</head>
<body>
  <div class="layout">
    <aside>
      <h1>Rottay Design System</h1>
      <p>${total} components · modern engine</p>
      <nav>
      ${nav}
      </nav>
    </aside>
    <main>
      <div class="topbar">
        <strong>Components</strong>
        <label>Tenant
          <select id="global-tenant" onchange="setTenant(this.value)">
            <option value="rottay">Rottay</option>
            <option value="bithire">BitHire</option>
            <option value="evnto">Evnto</option>
          </select>
        </label>
      </div>
      ${sections}
    </main>
  </div>
  <script>
    function setTenant(value) {
      document.querySelectorAll('iframe').forEach(function (frame) {
        try { frame.contentWindow.postMessage({ dsTenant: value }, '*'); } catch (e) {}
      });
    }
    // Auto-size each card frame to its content so nothing clips.
    window.addEventListener('message', function (event) {
      var data = event && event.data;
      if (!data || !data.dsHeight || !data.dsSlug) return;
      var frame = document.querySelector('iframe[data-slug="' + data.dsSlug + '"]');
      if (frame) frame.style.height = Math.max(200, Math.min(620, data.dsHeight)) + 'px';
    });
  </script>
</body>
</html>`;
}
