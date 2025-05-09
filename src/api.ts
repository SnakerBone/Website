type CacheEntry<T> = 
{
    value: T;
    expiration: number | null;
};

export class LocalCache
{
    private prefix: string;

    public constructor(prefix = 'cache_')
    {
        this.prefix = prefix;
    }

    public set<T>(key: string, value: T, ttl?: number): T
    {
        const expiresAt: number | null = ttl ? Date.now() + ttl * 60 * 1000 : null;
        const entry: CacheEntry<T> = { value, expiration: expiresAt };

        localStorage.setItem(this.prefix + key, JSON.stringify(entry));

        return value;
    }

    public get<T>(key: string): T | null
    {
        const raw: string | null = localStorage.getItem(this.prefix + key);

        if (!raw) 
        {
            return null;
        }

        try {
            const entry: CacheEntry<T> = JSON.parse(raw);

            if (entry.expiration && Date.now() > entry.expiration) 
            {
                localStorage.removeItem(this.prefix + key);

                return null;
            }

            return entry.value;
        } catch {
            return null;
        }
    }

    public remove(key: string): void
    {
        localStorage.removeItem(this.prefix + key);
    }

    public clear(): void
    {
        Object.keys(localStorage).forEach(key =>
        {
            if (key.startsWith(this.prefix)) {
                localStorage.removeItem(key);
            }
        });
    }
}

class NavbarLink 
{
    private name: string;
    private id: string;
    private href: string;

    constructor(name: string, id: string, href: string) 
    {
        this.name = name;
        this.id = id;
        this.href = href;
    }

    public getName(): string
    {
        return this.name;
    }

    public getId(): string
    {
        return this.id;
    }

    public getHref(): string
    {
        return isProduction() ? this.href : `${this.href}.html`;
    }
}

const NAVBAR_LINKS: NavbarLink[] =
    [
        new NavbarLink('Home', 'index', './index'),
        new NavbarLink('Projects', 'projects', './projects'),
        new NavbarLink('About', 'about', './about')
    ];

export function setHeading(title: string, marginSize: number, parentId: string): HTMLElement
{
    const section: HTMLElement = document.createElement('section');
    const heading: HTMLHeadingElement = document.createElement('h1');
    const margin: string = `m-${marginSize}`;
    let parent: HTMLElement | null = document.getElementById(parentId);

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

export function setDarkMode(): void
{
    const body: HTMLElement = getBody();

    body.classList.add('dark');
    body.setAttribute('data-bs-theme', 'dark');
}

export function setNavbar(): HTMLElement
{
    const body: HTMLElement = getBody();
    const navbar: HTMLElement = document.createElement('nav');
    const navbarInner: HTMLDivElement = document.createElement('div');
    const navbarBrand: HTMLAnchorElement = document.createElement('a');
    const navbarNav = setNavbarNav();
    const divider: HTMLDivElement = document.createElement('div');

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
        const navbarLink: NavbarLink = NAVBAR_LINKS[i];
        const navLink: HTMLAnchorElement = setNavLink(navbarLink.getName(), navbarLink.getId(), navbarLink.getHref());

        navbarNav.appendChild(navLink);
    }

    return navbar;
}

function setNavbarNav(): HTMLDivElement
{
    const navbarNav: HTMLDivElement = document.createElement('div');

    navbarNav.classList.add('navbar-nav');
    navbarNav.classList.add('inline');

    return navbarNav;
}

function setNavLink(name: string, id: string, href: string): HTMLAnchorElement
{
    const navLink: HTMLAnchorElement = document.createElement('a');
    const active: boolean = getCurrentFileName() === id;

    navLink.textContent = name;
    navLink.classList.add('nav-link');
    navLink.classList.add('inline');
    navLink.setAttribute('href', active ? '' : href);

    if (active) {
        navLink.classList.add('active');
    }

    return navLink;
}

export function isProduction(): boolean
{
    const hostname: string = window.location.hostname;
    const pattern: RegExp = /\d/;

    return hostname === 'snaker.xyz' || !pattern.test(hostname);
}

export function getCurrentFileName(): string
{
    return window.location.pathname.substring(1).replace('.html', '').toLowerCase();
}

export function getBody(): HTMLElement 
{
    return document.body;
}

export function formatDate(date: Date): string
{
    const now: Date = new Date();
    const pastDate: Date = new Date(date);

    const yearsDiff: number = now.getFullYear() - pastDate.getFullYear();
    const monthsDiff: number = now.getMonth() - pastDate.getMonth() + (12 * yearsDiff);

    if (monthsDiff < 1) {
        return "less than a month ago";
    } else if (monthsDiff === 1) {
        return "1 month ago";
    } else {
        return `${monthsDiff} months ago`;
    }
}