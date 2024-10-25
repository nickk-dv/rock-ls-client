import * as vs from "vscode";
import { Ctx } from "./context";

export type Command = (...args: any[]) => unknown;

export type CommandImpl = {
    enabled: (ctx: Ctx) => Command;
    disabled?: (ctx: Ctx) => Command;
};

export function show_syntax_tree(ctx: Ctx): Command {
    return async () => {
        const editor = vs.window.activeTextEditor;
        if (!editor) return;
        const document = editor.document;
        const params = { text_document: { uri: document.uri.toString() } };
        const response = await ctx.client.sendRequest<{ tree_display: string }>("custom/show_syntax_tree", params);
        const tree_document = await vs.workspace.openTextDocument({ language: "rock_syn", content: response.tree_display });
        void (await vs.window.showTextDocument(tree_document, vs.ViewColumn.Two, true));
    }
}
