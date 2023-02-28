import path from 'path';
import { rootDir } from '../index.js';
import { FileReader } from './base/FileReader.js';
import axios from 'axios';

export interface RepositoryData {
    url: string;
    data: {
        [moduleName: string]: string;
    }
}

export class Registry extends FileReader<Record<string, RepositoryData>> {
    public data: Record<string, RepositoryData> = JSON.parse(this.read());

    constructor(registryFile: string = path.join(rootDir, 'registry.json')) {
        super(registryFile, JSON.stringify({
            'reciple': {
                url: 'https://raw.githubusercontent.com/FalloutStudios/reciple-modules/main/repository.json',
                data: {}
            }
        }));
    }

    public async update(...repositories: string[]): Promise<{ updated: string[]; failed: { repository: string; reason: Error; }[]; }> {
        const updated: string[] = [];
        const failed: { repository: string; reason: Error }[] = [];

        for (const repositoryName of Object.keys(this.data)) {
            if (repositories.length && !repositories.includes(repositoryName)) continue;

            const repository = this.data[repositoryName];
            if (!repository) continue;

            const fetchData = await axios.get<Record<string, string>>(repository.url)
                .then(res => res.data)
                .catch(err => {
                    failed.push({
                        repository: repositoryName,
                        reason: err
                    });
                    return null;
                });

            if (fetchData === null) continue;

            this.data[repositoryName].data = fetchData;
            updated.push(repositoryName);
        }

        this.save(JSON.stringify(this.data));

        return { updated, failed };
    }

    public async remove(...repositories: string[]): Promise<{ removed: Record<string, RepositoryData>; }> {
        const removed: Record<string, RepositoryData> = {};

        for (const repositoryName of Object.keys(this.data)) {
            if (repositories.length && !repositories.includes(repositoryName)) continue;

            const repository = this.data[repositoryName];
            if (!repository) continue;

            removed[repositoryName] = repository;
            delete(this.data[repositoryName]);
        }

        this.save(JSON.stringify(this.data));

        return { removed };
    }

    public async add(...repositories: { name: string; repository: RepositoryData; }[]): Promise<void> {
        for (const repository of repositories) {
            this.data[repository.name] = repository.repository;
        }

        await this.update(...repositories.map(r => r.name)).catch(err => null);
    }

    public getModule(module: string, repositories: string[] = []): { repository: string; name: string; url: string; }[] {
        const modules: { repository: string; name: string; url: string; }[] = [];

        for (const repositoryName of Object.keys(this.data)) {
            if (repositories.length && !repositories.includes(repositoryName)) continue;

            const repository = this.data[repositoryName];
            if (!repository) continue;

            const moduleURL = repository.data[module];
            if (!moduleURL) continue;

            modules.push({
                name: module,
                repository: repositoryName,
                url: moduleURL
            });
        }

        return modules;
    }
}
