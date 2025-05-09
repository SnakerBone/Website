import { setDarkMode, setNavbar, setHeading, LocalCache, formatDate } from "./api.js";

const GITHUB_API_REPOS_URL: string = 'https://api.github.com/repos';
const CACHE: LocalCache = new LocalCache();

class Project 
{
    public owner: string;
    public name: string;
    public id: string;

    public constructor(owner: string, name: string) 
    {
        this.owner = owner;
        this.name = name;
        this.id = name.toLowerCase();
    }

    public url(): string
    {
        return `${GITHUB_API_REPOS_URL}/${this.owner}/${this.name}`;
    }

    public async data(): Promise<any>
    {
        const init: RequestInit = 
        {
            "headers": {
                'Authorization': `token ${atob('Z2hwX3I0ZlRxVWZvQ3JjY2czcm0wNFVndGpRZFhoZWVoVzFiekp2Nw==')}`,
                'Accept': 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28'
            }
        };
        const response: Response = await fetch(this.url(), init);
        
        return response.json();
    }

    public async lastUpdated(): Promise<string>
    {
        const cachedDate: string | null = CACHE.get<string>(this.id);

        if (cachedDate) 
        {
            return cachedDate;
        }

        const data: any = await this.data();
        const date: Date = new Date(data.updated_at);
        const formattedDate: string = formatDate(date);

        CACHE.set(this.id, formattedDate, 10);

        return formattedDate;
    }
}

const PROJECTS: Project[] =
[
    new Project('ByteSnek', 'PsychX'),
    new Project('ByteSnek', 'SnakerLib'),
    new Project('ByteSnek', 'JSnake'),
    new Project('ByteSnek', 'SnakeCrypt')
];

setDarkMode();
setNavbar();
setHeading('Projects', 4, 'main');
setTimestamps();

async function setTimestamps(): Promise<void>
{
    for (let i = 0; i < PROJECTS.length; i++) 
    {
        const project: Project = PROJECTS[i];
        const timestampId: string = `${project.id}-timestamp`;
        const lastUpdated: string = await project.lastUpdated();
        const timestamp: HTMLElement = document.getElementById(timestampId) as HTMLElement;

        timestamp.textContent = lastUpdated;
    }
}