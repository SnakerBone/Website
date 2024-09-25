const cacheTTL = (24 * 60 * 60 * 1000) / 2;
let atomicFetchLock = false;

document.addEventListener("DOMContentLoaded", () =>
{
    addProjects();
});

function addProjects() 
{
    addProject('ByteSnek', 'PsychX');
    addProject('ByteSnek', 'SnakerLib');
    addProject('ByteSnek', 'JSnake');
    addProject('ByteSnek', 'SnakeCrypt');
}

function addProject(vendor, name) 
{
    const timestampKey = `${vendor.toLowerCase()}.${name.toLowerCase()}.timestamp`;
    const timestampElement = document.getElementById(`${name.toLowerCase()}-timestamp`);
    
    if (!timestampElement) {
        console.warn(`Could not find timestamp element ${name.toLowerCase()}-timestamp. Ignoring!`);
        return;
    }

    if (!localStorage.getItem(timestampKey)) {
        fetchTimestamp(vendor, name);
    }

    timestampElement.textContent = localStorage.getItem(timestampKey);
}

function fetchTimestamp(vendor, name) 
{
    const url = `https://api.github.com/repos/${vendor}/${name}`;
    const auth = atob('Z2hwX2tNcVlSYnlpdFlFS2hSTDVEY2lpaFBjQlhDYkpvYjNPWlBHQw==');
    const errors = [];
    const request = { 
        headers: { 
            'Authorization': `token ${auth}` 
        } 
    };

    if (atomicFetchLock === true) {
        return;
    } else {
        lock();
    }

    fetch(url, request)
        .then(response => response.json())
        .then(handleJson)
        .catch(errors.push)
        .finally(unlock);
}

function handleJson(json) 
{
    const lastUpdatedDate = new Date(json.updated_at);
    const fullName = json.full_name;
    const key = fullName.toLowerCase().replace('/', '.') + '.timestamp';

    localStorage.setItem(key, getDate(lastUpdatedDate));
}

async function lock() 
{
    if (atomicFetchLock === true) {
        return;
    }

    const promise = new Promise(exec => {
        atomicFetchLock = true;
        exec();
    });

    await promise;
}

async function unlock() 
{
    if (atomicFetchLock === false) {
        return;
    }

    const promise = new Promise(exec => {
        atomicFetchLock = false;
        exec();
    });

    await promise;
}

function invalidateCache() 
{
    if (atomicFetchLock === true) {
        atomicFetchLock = false;
    }

    if (localStorage.length != 0) {
        localStorage.clear();
    }

    addProjects();
}

setTimeout(() =>
{
    invalidateCache();
    setInterval(invalidateCache, cacheTTL);

}, cacheTTL);

function getDate(date)
{
    return getDateString(date.getUTCFullYear(), date.getMonth(), date.getDay());
}

function getDateString(year, month, day)
{
    return getSmallMonthName(month) + ' ' + day + ' ' + (new Date().getUTCFullYear() != year ? '' : year);
}

function getSmallMonthName(index)
{
    switch (index) {
        case 0: {
            return "Jan";
        }
        case 1: {
            return "Feb";
        }
        case 2: {
            return "Mar";
        }
        case 3: {
            return "Apr";
        }
        case 4: {
            return "May";
        }
        case 5: {
            return "Jun";
        }
        case 6: {
            return "Jul";
        }
        case 7: {
            return "Aug";
        }
        case 8: {
            return "Sep";
        }
        case 9: {
            return "Oct";
        }
        case 10: {
            return "Nov";
        }
        case 11: {
            return "Dec";
        }
        default: {
            return "Unknown";
        }
    }
}