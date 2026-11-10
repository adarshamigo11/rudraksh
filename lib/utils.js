export const formatPrice = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

export const slugify = (s = '') =>
  String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export const discountPercent = (price, compare) =>
  compare > price && compare > 0 ? Math.round(((compare - price) / compare) * 100) : 0;

export const serialize = (d) => JSON.parse(JSON.stringify(d));

export const escapeRegex = (s = '') => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const imgSrc = (u) => u || '/placeholder.svg';

export const digits = (s = '') => String(s).replace(/\D/g, '');

export const totalStock = (p) =>
  p.variants?.length ? p.variants.reduce((s, v) => s + (v.stock || 0), 0) : p.stock || 0;

export const inStock = (p) => totalStock(p) > 0;

export function escapeHtml(s = '') {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const inline = (s) =>
  escapeHtml(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[\s(])\*(?!\s)(.+?)\*(?=[\s).,!?]|$)/g, '$1<em>$2</em>');

/**
 * Tiny, safe formatter for product descriptions written in the admin panel.
 *   ## Heading      - bullet      **bold**      *italic*      ![alt](image-url)
 */
export function renderDescription(text = '') {
  const lines = String(text).replace(/\r/g, '').split('\n');
  let html = '';
  let list = false;
  const close = () => {
    if (list) {
      html += '</ul>';
      list = false;
    }
  };
  for (const raw of lines) {
    const l = raw.trim();
    if (!l) {
      close();
      continue;
    }
    let m;
    if ((m = l.match(/^!\[(.*?)\]\((\S+?)\)$/))) {
      close();
      if (/^(https:\/\/|\/api\/images\/|\/[^/])/.test(m[2])) {
        html += `<img src="${escapeHtml(m[2])}" alt="${escapeHtml(m[1])}" loading="lazy"/>`;
      }
    } else if (l.startsWith('## ')) {
      close();
      html += `<h3>${inline(l.slice(3))}</h3>`;
    } else if (/^[-*] /.test(l)) {
      if (!list) {
        html += '<ul>';
        list = true;
      }
      html += `<li>${inline(l.slice(2))}</li>`;
    } else {
      close();
      html += `<p>${inline(l)}</p>`;
    }
  }
  close();
  return html;
}

export const STATUS_FLOW = ['pending', 'confirmed', 'packed', 'shipped', 'delivered'];
