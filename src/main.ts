import { Constants, Utils } from "./foundation.ts";
import { SynchedTaggle, Logo, Repository, RepositoryBranch, SnakerCache } from "./infrastructure.ts";

const cache = new SnakerCache();
const toggle: SynchedTaggle = new SynchedTaggle(false);

document.addEventListener("DOMContentLoaded", () =>
{
    addProjects();
});

function addProjects() 
{
    addProject('ByteSnek/SnakerLib', '1.21', true);
    addProject('ByteSnek/PsychX', '1.21', true);
    addProject('ByteSnek/JSnake', 'master', false);
    addProject('ByteSnek/SnakeCrypt', 'main', false);
}

function addProject(repoId: string, branchName: string, workInProgress: boolean)
{
    var pieces: Array<string> = repoId.split('/');

    var branch: RepositoryBranch = new RepositoryBranch(branchName, false);
    var repo: Repository = new Repository(pieces[0], pieces[1], branch);

    var path: string = `../include/img/${pieces[1].toLowerCase()}.png`;
    var logo: Logo = new Logo(path, null, null);

    var projectId = repo.getName().toLowerCase();

    var timestampElement: HTMLElement = document.getElementById(`${projectId}-timestamp`) as HTMLElement;
    var logoElement: HTMLElement = document.getElementById(`${projectId}-logo`) as HTMLElement;

    if (!cacheHasRequiredKeys(repo)) {
        fetchElements(repo, logo);
    }

    setElements(repo, timestampElement, logoElement, workInProgress);
}

function setElements(repo: Repository, timestamp: HTMLElement, logo: HTMLElement, workInProgress: boolean) 
{
    if (!timestamp || !logo) {
        return;
    }

    var cacheKey: string = repo.getCacheKey();
    var updatedAtKey: string = `${Constants.KEY_ID_UPDATED_AT}.${cacheKey}`;

    timestamp.innerText = `${cache.get(updatedAtKey)}`;

    if (workInProgress) {
        // todo: add wip badge next to project name based on the metadata file located in the projects vcs root or META-INF/metadata.yaml (idk which folder yet)
    }
}

function fetchElements(repo: Repository, logo: Logo)
{
    var cacheKey: string = repo.getCacheKey();
    var projectId: string = repo.getName().toLowerCase();

    if (!document.getElementById(`${projectId}-timestamp`) || !document.getElementById(`${projectId}-logo`)) {
        return;
    }

    var updatedAtKey: string = `${Constants.KEY_ID_UPDATED_AT}.${cacheKey}`;
    var jsonKey: string = `${Constants.KEY_ID_JSON}.${cacheKey}`;
    var logoKey: string = `${Constants.KEY_ID_LOGO}.${cacheKey}`;

    if (!cache.has(logoKey)) {
        if (logo.getPath()) {
            cache.set(logoKey, logo.getPath());
        } else {
            cache.set(logoKey, logo.getFallback() as string);
        }
    }

    if (!cache.has(updatedAtKey) || !cache.has(jsonKey)) {
        fetchDateFromApi(repo.getId(), jsonKey, updatedAtKey);
    }
}

function fetchDateFromApi(repoId: string, jsonKey: string, updatedAtKey: string)
{
    var request: RequestInit = { headers: Constants.getDefaultHeaders(Constants.TOKEN) };
    var url: string = Utils.getRepoApiUrl(repoId);

    fetch(url, request)
        .then(response => response.json())
        .then(json =>
        {
            var updatedAt: Date = new Date(json.updated_at);

            cache.set(jsonKey, JSON.stringify(json));
            cache.set(updatedAtKey, Utils.getDate(updatedAt));
            console.log(updatedAtKey);

        })
        .catch(console.error);
}

function cacheHasRequiredKeys(repo: Repository): boolean
{
    var cacheKey = repo.getCacheKey();

    var updatedAtKey: string = `${Constants.KEY_ID_UPDATED_AT}.${cacheKey}`;
    var jsonKey: string = `${Constants.KEY_ID_JSON}.${cacheKey}`;
    var logoKey: string = `${Constants.KEY_ID_LOGO}.${cacheKey}`;

    return cache.has(updatedAtKey) && cache.has(jsonKey) && cache.has(logoKey);
}

function invalidateCache() 
{
    if (toggle.isLocked()) {
        toggle.unlock();
    }

    if (cache.size() != 0) {
        cache.clear();
    }

    addProjects();
}

setTimeout(() =>
{
    invalidateCache();
    setInterval(invalidateCache, Constants.CACHE_INVALIDATION_TTL);

}, Constants.CACHE_INVALIDATION_TTL);