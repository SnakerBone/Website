var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { setDarkMode, setNavbar, setHeading, LocalCache, formatDate } from "./api.js";
const GITHUB_API_REPOS_URL = 'https://api.github.com/repos';
const CACHE = new LocalCache();
class Project {
    constructor(owner, name) {
        this.owner = owner;
        this.name = name;
        this.id = name.toLowerCase();
    }
    url() {
        return `${GITHUB_API_REPOS_URL}/${this.owner}/${this.name}`;
    }
    data() {
        return __awaiter(this, void 0, void 0, function* () {
            const init = {
                "headers": {
                    'Authorization': `token ${atob('Z2hwX3I0ZlRxVWZvQ3JjY2czcm0wNFVndGpRZFhoZWVoVzFiekp2Nw==')}`,
                    'Accept': 'application/vnd.github+json',
                    'X-GitHub-Api-Version': '2022-11-28'
                }
            };
            const response = yield fetch(this.url(), init);
            return response.json();
        });
    }
    lastUpdated() {
        return __awaiter(this, void 0, void 0, function* () {
            const cachedDate = CACHE.get(this.id);
            if (cachedDate) {
                return cachedDate;
            }
            const data = yield this.data();
            const date = new Date(data.updated_at);
            const formattedDate = formatDate(date);
            CACHE.set(this.id, formattedDate, 10);
            return formattedDate;
        });
    }
}
const PROJECTS = [
    new Project('ByteSnek', 'PsychX'),
    new Project('ByteSnek', 'SnakerLib'),
    new Project('ByteSnek', 'JSnake'),
    new Project('ByteSnek', 'SnakeCrypt')
];
setDarkMode();
setNavbar();
setHeading('Projects', 4, 'main');
setTimestamps();
function setTimestamps() {
    return __awaiter(this, void 0, void 0, function* () {
        for (let i = 0; i < PROJECTS.length; i++) {
            const project = PROJECTS[i];
            const timestampId = `${project.id}-timestamp`;
            const lastUpdated = yield project.lastUpdated();
            const timestamp = document.getElementById(timestampId);
            timestamp.textContent = lastUpdated;
        }
    });
}
