/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */
import { HTMLStencilElement, JSXBase } from "@stencil/core/internal";
export namespace Components {
    interface AloudComments {
        /**
          * Firebase configuration
          * @requires
         */
        "firebase": Record<string, unknown>;
    }
    interface AloudEditor {
        "getValue": () => Promise<string>;
        "value": string;
    }
    interface AloudEntry {
        "author": string;
        "markdown": string;
    }
    interface AloudSubentry {
        "author": string;
        "markdown": string;
        "parent": string;
    }
}
declare global {
    interface HTMLAloudCommentsElement extends Components.AloudComments, HTMLStencilElement {
    }
    var HTMLAloudCommentsElement: {
        prototype: HTMLAloudCommentsElement;
        new (): HTMLAloudCommentsElement;
    };
    interface HTMLAloudEditorElement extends Components.AloudEditor, HTMLStencilElement {
    }
    var HTMLAloudEditorElement: {
        prototype: HTMLAloudEditorElement;
        new (): HTMLAloudEditorElement;
    };
    interface HTMLAloudEntryElement extends Components.AloudEntry, HTMLStencilElement {
    }
    var HTMLAloudEntryElement: {
        prototype: HTMLAloudEntryElement;
        new (): HTMLAloudEntryElement;
    };
    interface HTMLAloudSubentryElement extends Components.AloudSubentry, HTMLStencilElement {
    }
    var HTMLAloudSubentryElement: {
        prototype: HTMLAloudSubentryElement;
        new (): HTMLAloudSubentryElement;
    };
    interface HTMLElementTagNameMap {
        "aloud-comments": HTMLAloudCommentsElement;
        "aloud-editor": HTMLAloudEditorElement;
        "aloud-entry": HTMLAloudEntryElement;
        "aloud-subentry": HTMLAloudSubentryElement;
    }
}
declare namespace LocalJSX {
    interface AloudComments {
        /**
          * Firebase configuration
          * @requires
         */
        "firebase"?: Record<string, unknown>;
    }
    interface AloudEditor {
        "value"?: string;
    }
    interface AloudEntry {
        "author"?: string;
        "markdown"?: string;
    }
    interface AloudSubentry {
        "author"?: string;
        "markdown"?: string;
        "parent"?: string;
    }
    interface IntrinsicElements {
        "aloud-comments": AloudComments;
        "aloud-editor": AloudEditor;
        "aloud-entry": AloudEntry;
        "aloud-subentry": AloudSubentry;
    }
}
export { LocalJSX as JSX };
declare module "@stencil/core" {
    export namespace JSX {
        interface IntrinsicElements {
            "aloud-comments": LocalJSX.AloudComments & JSXBase.HTMLAttributes<HTMLAloudCommentsElement>;
            "aloud-editor": LocalJSX.AloudEditor & JSXBase.HTMLAttributes<HTMLAloudEditorElement>;
            "aloud-entry": LocalJSX.AloudEntry & JSXBase.HTMLAttributes<HTMLAloudEntryElement>;
            "aloud-subentry": LocalJSX.AloudSubentry & JSXBase.HTMLAttributes<HTMLAloudSubentryElement>;
        }
    }
}
