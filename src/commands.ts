import * as vs from "vscode";
import * as util from "./util";
import { Ctx } from "./context";

export type Command = (...args: any[]) => unknown;

export type CommandImpl = {
    enabled: (ctx: Ctx) => Command;
    disabled?: (ctx: Ctx) => Command;
};

export function show_syntax_tree(ctx: Ctx): Command {
    const tdcp = new (class implements vs.TextDocumentContentProvider {
        readonly uri = vs.Uri.parse("rock-ls-syntax-tree://syntax_tree/syntax_tree.rock_syn");
        readonly event_emitter = new vs.EventEmitter<vs.Uri>();

        constructor() {
            vs.workspace.onDidChangeTextDocument(
                this.onDidChangeTextDocument,
                this,
                ctx.ext.subscriptions,
            );
            vs.window.onDidChangeActiveTextEditor(
                this.onDidChangeActiveTextEditor,
                this,
                ctx.ext.subscriptions,
            );
        }

        private onDidChangeTextDocument(event: vs.TextDocumentChangeEvent) {
            if (util.is_rock_document(event.document)) {
                void util.sleep_ms(10).then(() => this.event_emitter.fire(this.uri));
            }
        }

        private onDidChangeActiveTextEditor(editor: vs.TextEditor | undefined) {
            if (editor && util.is_rock_editor(editor)) {
                this.event_emitter.fire(this.uri);
            }
        }

        async provideTextDocumentContent(
            _uri: vs.Uri,
            ct: vs.CancellationToken,
        ): Promise<string> {
            const rock_editor = util.active_rock_editor();
            if (!rock_editor) return "";
            const client = ctx.client;
            const params = { textDocument: { uri: rock_editor.document.uri.toString() } };
            return client.sendRequest("custom/show_syntax_tree", params, ct);
        }

        get onDidChange(): vs.Event<vs.Uri> {
            return this.event_emitter.event;
        }
    })();

    ctx.ext.subscriptions.push(vs.workspace.registerTextDocumentContentProvider("rock-ls-syntax-tree", tdcp));

    return async () => {
        const document = await vs.workspace.openTextDocument(tdcp.uri);
        tdcp.event_emitter.fire(tdcp.uri);
        void (await vs.window.showTextDocument(document, vs.ViewColumn.Two, true));
    }
}
