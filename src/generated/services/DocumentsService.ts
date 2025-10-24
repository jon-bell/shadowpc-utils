/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { document_id } from '../models/document_id';
import type { document_name } from '../models/document_name';
import type { document_type } from '../models/document_type';
import type { error_response } from '../models/error_response';
import type { mimetype } from '../models/mimetype';
import type { minimal_response } from '../models/minimal_response';
import type { offset_range } from '../models/offset_range';
import type { pid } from '../models/pid';
import type { upload_token } from '../models/upload_token';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DocumentsService {
    /**
     * Check PDF format
     * @param p
     * @param doc
     * @param dt
     * @param docid
     * @param soft
     * @returns any
     * @returns error_response
     * @throws ApiError
     */
    public static getFormatcheck(
        p?: pid,
        doc?: document_name,
        dt?: document_type,
        docid?: document_id,
        soft?: boolean,
    ): CancelablePromise<(minimal_response & {
        npages: any;
        nwords: any;
        problem_fields: any;
        has_error: any;
        docid: any;
    }) | error_response> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/formatcheck',
            query: {
                'p': p,
                'doc': doc,
                'dt': dt,
                'docid': docid,
                'soft': soft,
            },
        });
    }
    /**
     * Upload file
     * Upload large files to HotCRP for later use.
     *
     * Servers limit how much data they will accept in a single request. The upload
     * API uploads larger files over multiple requests. When an upload is complete,
     * later requests can refer to that file using an *upload token*.
     *
     * The lifecycle of an upload is as follows.
     *
     * 1. A request with `start=1` begins a new upload. This request should also
     * include a `size` parameter to define the size of the uploaded file, if that
     * is known.
     * 2. The response to this request will include the upload token for the uploaded
     * file in its `token` field. This is a string like `hcupwhvGDVmHNYyDKdqeqA`.
     * All subsequent requests relating to the upload must include this token as a
     * `token` parameter.
     * 3. Subsequent requests upload the contents of the file in chunks. The `blob`
     * parameter (which can be an attached file) contains the chunk itself; the
     * `offset` parameter defines the offset of chunk relative to the file.
     * 4. A request with `finish=1` completes the upload. The server seals the upload
     * and responds with the file’s content hash. A `finish=1` request will fail
     * unless all expected chunks have been received.
     *
     * `start=1` and `finish=1` requests can also include a chunk. The `ranges`
     * response field represents the ranges of bytes received so far.
     *
     * The upload API is only available on sites that have enabled the document
     * store.
     *
     * @param p
     * @param start
     * @param finish
     * @param cancel
     * @param token
     * @param offset Offset of `blob` in uploaded file
     * @param length Length of `blob` in bytes (must match
     * actual length of `blob`)
     * @param size Size of uploaded file in bytes
     * @param dtype (start only) Purpose of uploaded document;
     * typically corresponds to a submission field ID
     * @param temp (start only) If true, the uploaded file is
     * expected to be temporary
     * @param formData
     * @returns any
     * @returns error_response
     * @throws ApiError
     */
    public static postUpload(
        p?: pid,
        start?: boolean,
        finish?: boolean,
        cancel?: boolean,
        token?: upload_token,
        offset?: number,
        length?: number,
        size?: number,
        dtype?: document_type,
        temp?: boolean,
        formData?: {
            blob?: any;
            mimetype?: mimetype;
            /**
             * (start only) Name of uploaded file
             */
            filename?: string;
        },
    ): CancelablePromise<(minimal_response & {
        token: upload_token;
        dtype?: document_type;
        filename?: string;
        mimetype?: mimetype;
        size?: number;
        ranges?: Array<offset_range>;
        hash?: string;
        crc32?: string;
        server_progress_loaded?: number;
        server_progress_max?: number;
    }) | error_response> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/upload',
            query: {
                'p': p,
                'start': start,
                'finish': finish,
                'cancel': cancel,
                'token': token,
                'offset': offset,
                'length': length,
                'size': size,
                'dtype': dtype,
                'temp': temp,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
}
