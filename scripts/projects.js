import { setDarkMode, setNavbar, setHeading, LocalCache, formatDate } from "./api.js";
const GITHUB_API_REPOS_URL = 'https://api.github.com/repos';
const CACHE = new LocalCache();
class Project {
    constructor(owner, name, archived) {
        this.owner = owner;
        this.name = name;
        this.id = name.toLowerCase();
        this.archived = archived ? true : false;
    }
    url() {
        return `${GITHUB_API_REPOS_URL}/${this.owner}/${this.name}`;
    }
    async data() {
        const response = await fetch(this.url());
        return response.json();
    }
    async lastUpdated() {
        const cachedDate = CACHE.get(this.id);
        if (cachedDate) {
            return cachedDate;
        }
        const data = await this.data();
        const date = new Date(data.updated_at);
        const formattedDate = formatDate(date);
        CACHE.set(this.id, formattedDate, 60);
        return formattedDate;
    }
    isArchived() {
        return this.archived;
    }
}
const PROJECTS = [
    new Project('ByteSnek', 'JSnake'),
    new Project('ByteSnek', 'SnakeCrypt')
];
setDarkMode();
setNavbar();
setHeading('Projects', 4, 'main');
setTimestamps();
async function setTimestamps() {
    for (let i = 0; i < PROJECTS.length; i++) {
        const project = PROJECTS[i];
        const timestampId = `${project.id}-timestamp`;
        const lastUpdated = await project.lastUpdated();
        const timestamp = document.getElementById(timestampId);
        timestamp.textContent = lastUpdated;
    }
}
