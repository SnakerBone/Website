export class LocalCache {
    constructor(prefix = 'cache_') {
        this.prefix = prefix;
    }
    set(key, value, ttl) {
        const expiresAt = ttl ? Date.now() + ttl * 60 * 1000 : null;
        const entry = { value, expiration: expiresAt };
        localStorage.setItem(this.prefix + key, JSON.stringify(entry));
        return value;
    }
    get(key) {
        const raw = localStorage.getItem(this.prefix + key);
        if (!raw) {
            return null;
        }
        try {
            const entry = JSON.parse(raw);
            if (entry.expiration && Date.now() > entry.expiration) {
                localStorage.removeItem(this.prefix + key);
                return null;
            }
            return entry.value;
        }
        catch (_a) {
            return null;
        }
    }
    remove(key) {
        localStorage.removeItem(this.prefix + key);
    }
    clear() {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(this.prefix)) {
                localStorage.removeItem(key);
            }
        });
    }
}
class NavbarLink {
    constructor(name, id, href) {
        this.name = name;
        this.id = id;
        this.href = href;
    }
    getName() {
        return this.name;
    }
    getId() {
        return this.id;
    }
    getHref() {
        return isProduction() ? this.href : `${this.href}.html`;
    }
}
const NAVBAR_LINKS = [
    new NavbarLink('Home', 'index', './index'),
    new NavbarLink('Projects', 'projects', './projects'),
    new NavbarLink('About', 'about', './about')
];
export function setHeading(title, marginSize, parentId) {
    const section = document.createElement('section');
    const heading = document.createElement('h1');
    const margin = `m-${marginSize}`;
    let parent = document.getElementById(parentId);
    if (!parent) {
        parent = getBody();
    }
    section.classList.add(margin);
    section.classList.add('text-center');
    heading.classList.add('neue-hxt');
    heading.textContent = title;
    section.appendChild(heading);
    parent.prepend(section);
    return section;
}
export function setDarkMode() {
    const body = getBody();
    body.classList.add('dark');
    body.setAttribute('data-bs-theme', 'dark');
}
export function setNavbar() {
    const body = getBody();
    const navbar = document.createElement('nav');
    const navbarInner = document.createElement('div');
    const navbarBrand = document.createElement('a');
    const navbarNav = setNavbarNav();
    const divider = document.createElement('div');
    navbar.classList.add('navbar');
    navbar.classList.add('navbar-expand-lg');
    navbar.classList.add('dark');
    navbarInner.classList.add('container-fluid');
    navbarInner.classList.add('neue-xt');
    navbarBrand.textContent = 'Snaker.xyz';
    navbarBrand.classList.add('navbar-brand');
    divider.classList.add('divider');
    body.prepend(navbar);
    navbar.after(divider);
    navbar.appendChild(navbarInner);
    navbarInner.appendChild(navbarBrand);
    navbarInner.appendChild(navbarNav);
    for (let i = 0; i < NAVBAR_LINKS.length; i++) {
        const navbarLink = NAVBAR_LINKS[i];
        const navLink = setNavLink(navbarLink.getName(), navbarLink.getId(), navbarLink.getHref());
        navbarNav.appendChild(navLink);
    }
    return navbar;
}
function setNavbarNav() {
    const navbarNav = document.createElement('div');
    navbarNav.classList.add('navbar-nav');
    navbarNav.classList.add('inline');
    return navbarNav;
}
function setNavLink(name, id, href) {
    const navLink = document.createElement('a');
    const active = getCurrentFileName() === id;
    navLink.textContent = name;
    navLink.classList.add('nav-link');
    navLink.classList.add('inline');
    navLink.setAttribute('href', active ? '' : href);
    if (active) {
        navLink.classList.add('active');
    }
    return navLink;
}
export function isProduction() {
    const hostname = window.location.hostname;
    const pattern = /\d/;
    return hostname === 'snaker.xyz' || !pattern.test(hostname);
}
export function getCurrentFileName() {
    return window.location.pathname.substring(1).replace('.html', '').toLowerCase();
}
export function getBody() {
    return document.body;
}
export function formatDate(date) {
    const now = new Date();
    const pastDate = new Date(date);
    const yearsDiff = now.getFullYear() - pastDate.getFullYear();
    const monthsDiff = now.getMonth() - pastDate.getMonth() + (12 * yearsDiff);
    if (monthsDiff < 1) {
        return "less than a month ago";
    }
    else if (monthsDiff === 1) {
        return "1 month ago";
    }
    else {
        return `${monthsDiff} months ago`;
    }
}
