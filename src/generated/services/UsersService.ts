/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { error_response } from '../models/error_response';
import type { minimal_response } from '../models/minimal_response';
import type { pid } from '../models/pid';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UsersService {
    /**
     * @param email
     * @param p
     * @param potentialConflict
     * @returns any
     * @returns error_response
     * @throws ApiError
     */
    public static getUser(
        email: any,
        p?: pid,
        potentialConflict?: any,
    ): CancelablePromise<(minimal_response & {
        found: any;
        email?: any;
        given_name?: any;
        family_name?: any;
        affiliation?: any;
        potential_conflict?: any;
        orcid?: any;
        country?: any;
    }) | error_response> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/user',
            query: {
                'p': p,
                'email': email,
                'potential_conflict': potentialConflict,
            },
        });
    }
    /**
     * @param ui
     * @returns any
     * @returns error_response
     * @throws ApiError
     */
    public static getPc(
        ui?: any,
    ): CancelablePromise<(minimal_response & {
        pc: any;
        tags?: any;
        sort?: any;
        'p'?: any;
    }) | error_response> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/pc',
            query: {
                'ui': ui,
            },
        });
    }
}
