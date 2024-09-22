export class Constants
{
    public static TOKEN: string = `token ${import.meta.env.VITE_GITHUB_TOKEN}`;

    public static KEY_ID_UPDATED_AT = "updated_at";
    public static KEY_ID_JSON = "json";
    public static KEY_ID_LOGO = "logo";

    public static CACHE_INVALIDATION_TTL = (24 * 60 * 60 * 1000) / 2; // every 12 hours, it'll do for now...

    public static getDefaultHeaders(auth: string): HeadersInit
    {
        return { Authorization: auth };
    }

    public static getCacheOptions(ttlSeconds: number) {
        return {
            ttl: ttlSeconds * 1000
        }
    }
}

export class Utils
{
    public static getRepoApiUrl(repoId: string): string
    {
        return `https://api.github.com/repos/${repoId}`;
    }

    public static getRawResource(repoId: string, branchName: string, pathToResource: string): string
    {
        return `https://raw.githubusercontent.com/${repoId}/${branchName}/${pathToResource}`;
    }

    public static toCacheKey(keyId: string, repoId: string): string
    {
        var key: string = repoId.replace("/", ".").toLowerCase();

        return `${keyId}.${key}`;
    }

    public static getDate(date: Date): string
    {
        return this.getDateString(date.getUTCFullYear(), date.getMonth(), date.getDay());
    }

    public static getDateString(year: number, month: number, day: number): string
    {
        return this.getSmallMonthName(month) + ' ' + day + ' ' + (new Date().getUTCFullYear() != year ? '' : year);
    }

    public static getSmallMonthName(index: number): string
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
}
