import * as vscode from "vscode";

export default class Helpers {
    public static throwError(error: string) {
        vscode.window.showErrorMessage(error);
    }

    public static showMessage(message: string) {
        vscode.window.showInformationMessage(message);
    }
}