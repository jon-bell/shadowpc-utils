/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { pid } from './pid';
import type { style_classes } from './style_classes';
import type { tag_value_list } from './tag_value_list';
export type tag_response = {
    pid: pid;
    tags: tag_value_list;
    /**
     * Textual representation for editing
     */
    tags_edit_text: string;
    /**
     * HTML representation for display
     */
    tags_view_html: string;
    /**
     * HTML representation of badges and emoji
     */
    tag_decoration_html: string;
    color_classes: style_classes;
    tags_conflicted?: tag_value_list;
    color_classes_conflicted?: style_classes;
};

