import * as vs from "vscode";

export type RockDocument = vs.TextDocument & { languageId: "rock" };
export type RockEditor = vs.TextEditor & { document: RockDocument };

export function is_rock_editor(editor: vs.TextEditor): editor is RockEditor {
    return is_rock_document(editor.document);
}

export function is_rock_document(document: vs.TextDocument): document is RockDocument {
    return document.languageId === "rock" && document.uri.scheme === "file";
}

export function active_rock_editor(): RockEditor | undefined {
    const editor = vs.window.activeTextEditor;
    return editor && (is_rock_editor(editor) ? editor : undefined)
}

export function sleep_ms(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
