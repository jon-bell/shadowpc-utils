/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { error_response } from '../models/error_response';
import type { minimal_response } from '../models/minimal_response';
import type { pid } from '../models/pid';
import type { search_parameter_specification } from '../models/search_parameter_specification';
import type { search_response } from '../models/search_response';
import type { tag } from '../models/tag';
import type { tag_annotation } from '../models/tag_annotation';
import type { tag_list } from '../models/tag_list';
import type { tag_response } from '../models/tag_response';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TagsService {
    /**
     * Retrieve submission tags
     * @param p
     * @returns any
     * @returns error_response
     * @throws ApiError
     */
    public static getTags(
        p: pid,
    ): CancelablePromise<(minimal_response & tag_response) | error_response> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/{p}/tags',
            path: {
                'p': p,
            },
        });
    }
    /**
     * Change submission tags
     * @param p
     * @param formData
     * @returns any
     * @returns error_response
     * @throws ApiError
     */
    public static postTags(
        p: pid,
        formData?: {
            tags?: any;
            addtags?: any;
            deltags?: any;
            search?: any;
        },
    ): CancelablePromise<(minimal_response & tag_response & search_response) | error_response> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/{p}/tags',
            path: {
                'p': p,
            },
            formData: formData,
            mediaType: 'application/x-www-form-urlencoded',
        });
    }
    /**
     * Retrieve all visible tags
     * @returns any
     * @returns error_response
     * @throws ApiError
     */
    public static getAlltags(): CancelablePromise<(minimal_response & {
        tags: tag_list;
        readonly_tagmap?: any;
        sitewide_tagmap?: any;
    }) | error_response> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/alltags',
        });
    }
    /**
     * Change several tags
     * @param formData
     * @returns any
     * @returns error_response
     * @throws ApiError
     */
    public static postAssigntags(
        formData?: {
            /**
             * Comma-separated list of paper IDs and tag assignments
             */
            tagassignment: string;
            search?: search_parameter_specification;
        },
    ): CancelablePromise<(minimal_response & search_response & {
        'p': any;
    }) | error_response> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/assigntags',
            formData: formData,
            mediaType: 'application/x-www-form-urlencoded',
        });
    }
    /**
     * Retrieve tag annotations
     * @param tag
     * @param search
     * @returns any
     * @returns error_response
     * @throws ApiError
     */
    public static getTaganno(
        tag: tag,
        search?: search_parameter_specification,
    ): CancelablePromise<(minimal_response & search_response & {
        tag: tag;
        editable: boolean;
        anno: Array<tag_annotation>;
    }) | error_response> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/taganno',
            query: {
                'tag': tag,
                'search': search,
            },
        });
    }
    /**
     * Change tag annotations
     * @param tag
     * @param search
     * @param formData
     * @returns any
     * @returns error_response
     * @throws ApiError
     */
    public static postTaganno(
        tag: any,
        search?: any,
        formData?: {
            anno: Array<tag_annotation>;
        },
    ): CancelablePromise<(minimal_response & search_response & {
        tag: tag;
        editable: boolean;
        anno: Array<tag_annotation>;
    }) | error_response> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/taganno',
            query: {
                'tag': tag,
                'search': search,
            },
            formData: formData,
            mediaType: 'application/x-www-form-urlencoded',
        });
    }
    /**
     * Retrieve tag edit messages
     * @param p
     * @returns any
     * @returns error_response
     * @throws ApiError
     */
    public static getTagmessages(
        p: pid,
    ): CancelablePromise<(minimal_response & {
        pid: any;
    }) | error_response> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/{p}/tagmessages',
            path: {
                'p': p,
            },
        });
    }
    /**
     * Retrieve vote analysis
     * @param p
     * @param tag
     * @returns any
     * @returns error_response
     * @throws ApiError
     */
    public static getVotereport(
        p: pid,
        tag: tag,
    ): CancelablePromise<(minimal_response & {
        tag: any;
        report: any;
    }) | error_response> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/{p}/votereport',
            path: {
                'p': p,
            },
            query: {
                'tag': tag,
            },
        });
    }
}
