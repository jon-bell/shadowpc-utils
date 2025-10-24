/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { cid } from '../models/cid';
import type { comment } from '../models/comment';
import type { comment_topic } from '../models/comment_topic';
import type { comment_visibility } from '../models/comment_visibility';
import type { error_response } from '../models/error_response';
import type { minimal_response } from '../models/minimal_response';
import type { pid } from '../models/pid';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CommentsService {
    /**
     * Retrieve comment
     * Return a comment object specified by ID.
     *
     * The `c` parameter specifies the comment to return. If the comment exists and
     * the user can view it, it will be returned in the `comment` component of the
     * response. Otherwise, an error response is returned.
     *
     * If `c` is omitted, all viewable comments are returned in a `comments` list.
     *
     * @param p
     * @param content False omits comment content from response
     * @param c
     * @returns any
     * @returns error_response
     * @throws ApiError
     */
    public static getComment(
        p: pid,
        content?: boolean,
        c?: cid,
    ): CancelablePromise<(minimal_response & {
        comment?: comment;
        comments?: Array<comment>;
    }) | error_response> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/{p}/comment',
            path: {
                'p': p,
            },
            query: {
                'content': content,
                'c': c,
            },
        });
    }
    /**
     * Create, modify, or delete comment
     * Create, modify, or delete a comment specified by ID.
     *
     * The `c` parameter specifies the comment to modify. It can be a numeric comment
     * ID; `new`, to create a new comment; or `response` (or a compound like
     * `R2response`), to create or modify a named response.
     *
     * Setting `delete=1` deletes the specified comment, and the response does not
     * contain a `comment` component. Otherwise the comment is created or modified,
     * and the response `comment` component contains the new comment.
     *
     * Comment attachments may be uploaded as files (requiring a request body in
     * `multipart/form-data` encoding), or using the [upload API](#operation/upload).
     * To upload a single new attachment:
     *
     * * Set the `attachment:1` body parameter to `new`
     * * Either:
     * * Set `attachment:1:file` as a uploaded file containing the relevant data
     * * Or use the [upload API](#operation/upload) to upload the file,
     * and supply the upload token in the `attachment:1:upload` body parameter
     *
     * To upload multiple attachments, number them sequentially (`attachment:2`,
     * `attachment:3`, and so forth). To delete an existing attachment, supply its
     * `docid` as an `attachment:N` parameter, and set `attachment:N:delete` to 1.
     *
     * @param p
     * @param c
     * @param override
     * @param _delete
     * @param formData
     * @returns any
     * @returns error_response
     * @throws ApiError
     */
    public static postComment(
        p: pid,
        c: cid,
        override?: boolean,
        _delete?: boolean,
        formData?: {
            text?: string;
            tags?: string;
            topic?: comment_topic;
            visibility?: comment_visibility;
            response?: string;
            ready?: boolean;
            draft?: boolean;
            blind?: boolean;
            by_author?: boolean;
            review_token?: string;
            attachment?: any;
        },
    ): CancelablePromise<(minimal_response & {
        comment?: comment;
        conflict?: any;
    }) | error_response> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/{p}/comment',
            path: {
                'p': p,
            },
            query: {
                'override': override,
                'delete': _delete,
                'c': c,
            },
            formData: formData,
            mediaType: 'application/x-www-form-urlencoded',
        });
    }
    /**
     * @param p
     * @returns any
     * @returns error_response
     * @throws ApiError
     */
    public static getMentioncompletion(
        p?: pid,
    ): CancelablePromise<(minimal_response & {
        mentioncompletion: any;
    }) | error_response> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/mentioncompletion',
            query: {
                'p': p,
            },
        });
    }
}
