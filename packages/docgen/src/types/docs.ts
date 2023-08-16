import { ProjectParser } from 'typedoc-json-parser';

export interface Docs extends ProjectParser.Json {
    parsedAt: number;
    customPages: {
        category: string;
        files: {
            id: string;
            name: string;
            content: string;
        }[];
    }[];
}

export type DocsParserCustomPagesData = DocsParserCustomPagesCategoryData[];

export interface DocsParserCustomPagesCategoryData {
    category: string;
    files: {
        id: string;
        name: string;
        file: string;
    }[];
}
