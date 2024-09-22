export class SynchedTaggle 
{
    private locked: boolean;

    public constructor(initialValue: boolean) 
    {
        this.locked = initialValue;
    }

    public isLocked(): boolean
    {
        return this.locked;
    }

    public isUnlocked(): boolean 
    {
        return !this.locked;
    }

    public async lock(): Promise<void>
    {
        if (this.isLocked()) {
            return;
        }

        await new Promise(this.lock0);
    }

    public async unlock(): Promise<void> 
    {
        if (this.isUnlocked()) {
            return;
        }

        await new Promise(this.unlock0);
    }

    private lock0(executor: any) 
    {
        this.locked = true;
        executor();
    }

    private unlock0(executor: any) 
    {
        this.locked = false;
        executor();
    }
}

export class Logo 
{
    private path: string;
    private hash: string | null | undefined;
    private fallback: string | null | undefined;

    public constructor(path: string, hash: string | null | undefined, fallback: string | null | undefined)
    {
        this.path = path;
        this.hash = hash;
        this.fallback = fallback;
    }

    public getPath(): string
    {
        return this.path;
    }

    public getHash(): string | null | undefined
    {
        return this.hash;
    }

    public getFallback(): string | null | undefined
    {
        return this.fallback;
    }

    public hasFallback(): boolean 
    {
        if (this.fallback) {
            return true;
        } else {
            return false;
        }
    }
}

export class Repository 
{
    private vendor: string;
    private name: string;
    private id: string;
    private cacheKey: string;
    private branch: RepositoryBranch;

    public constructor(vendor: string, name: string, branch: RepositoryBranch) 
    {
        this.vendor = vendor;
        this.name = name;
        this.id = `${vendor}/${name}`;
        this.cacheKey = this.id.replace('/', '.').toLowerCase();
        this.branch = branch;
    }

    public getVendor(): string
    {
        return this.vendor;
    }

    public getName(): string
    {
        return this.name;
    }

    public getId(): string
    {
        return this.id;
    }

    public getCacheKey(): string
    {
        return this.cacheKey;
    }

    public getBranch(): RepositoryBranch 
    {
        return this.branch;
    }
}

export class RepositoryBranch 
{
    private name: string;
    private protect: boolean;

    public constructor(name: string, protect: boolean) 
    {
        this.name = name;
        this.protect = protect;
    }

    public getName(): string 
    {
        return this.name;
    }

    public isProtected(): boolean 
    {
        return this.protect;
    }
}

export class SnakerCache
{
    private cache: Storage;

    public constructor() 
    {
        this.cache = localStorage;
    }

    public set(key: any, value: any) 
    {
        this.cache.setItem(key, value);
    }

    public get(key: any): string 
    {
        return this.cache.getItem(key) as string;
    }

    public has(key: any): boolean 
    {
        return this.cache.getItem(key) != null;
    }

    public size(): number
    {
        return this.cache.length;
    }

    public clear() 
    {
        this.cache.clear();
    }
}