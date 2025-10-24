/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { error_response } from '../models/error_response';
import type { minimal_response } from '../models/minimal_response';
import type { pid } from '../models/pid';
import type { rid } from '../models/rid';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SiteInformationService {
    /**
     * @param p
     * @param template
     * @param r
     * @param email
     * @param givenName
     * @param familyName
     * @param affiliation
     * @param reason
     * @param width
     * @param text
     * @param subject
     * @param body
     * @returns any
     * @returns error_response
     * @throws ApiError
     */
    public static getMailtext(
        p?: pid,
        template?: any,
        r?: rid,
        email?: any,
        givenName?: any,
        familyName?: any,
        affiliation?: any,
        reason?: any,
        width?: any,
        text?: any,
        subject?: any,
        body?: any,
    ): CancelablePromise<(minimal_response & {
        templates?: any;
        subject?: any;
        body?: any;
    }) | error_response> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/mailtext',
            query: {
                'p': p,
                'template': template,
                'r': r,
                'email': email,
                'given_name': givenName,
                'family_name': familyName,
                'affiliation': affiliation,
                'reason': reason,
                'width': width,
                'text': text,
                'subject': subject,
                'body': body,
            },
        });
    }
}
