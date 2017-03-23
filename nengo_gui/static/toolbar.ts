/**
 * Toolbar for the top of the GUI.
 *
 * Toolbar constructor is written into HTML file by python and called
 * upon page load.
 *
 * @constructor
 * @param {string} filename - The name of the file opened
 */

import * as interact from "interact.js";
import * as $ from "jquery";

import { config, ConfigDialog } from "./config";
import { Editor } from "./editor";
import * as menu from "./menu";
import { SimControl } from "./sim-control";
import "./toolbar.css";
import * as utils from "./utils";
import { AlertDialogView, InputDialogView } from "./views/modal";

export class Toolbar {
    configDialog: ConfigDialog = new ConfigDialog();
    editor: Editor;
    hotkeys;
    menu;
    netgraph;
    sim: SimControl;
    toolbar;

    constructor(filename: string, sim: SimControl) {
        this.sim = sim;
        // this.netgraph = this.modal.netgraph;
        // this.hotkeys = this.modal.hotkeys;
        // this.editor = this.modal.editor;

        $("#Reset_layout_button")[0].addEventListener("click", () => {
            this.askResetLayout();
        });

        $("#Undo_last_button")[0].addEventListener("click", () => {
            this.netgraph.notify({undo: "1"});
        });
        $("#Redo_last_button")[0].addEventListener("click", () => {
            this.netgraph.notify({undo: "0"});
        });
        $("#Config_button")[0].addEventListener("click", () => {
            this.configModal();
        });
        $("#Sync_editor_button")[0].addEventListener("click", () => {
            // this.editor.updateTrigger = true;
        });
        $("#Help_button")[0].addEventListener("click", () => {
            this.hotkeys.callMenu();
        });
        $("#filename")[0].addEventListener("click", () => {
            this.saveAs();
        });

        $("#filename")[0].textContent = filename;

        // Update the URL so reload and bookmarks work as expected
        history.pushState({}, filename, "/?filename=" + filename);

        this.toolbar = $("#toolbar_object")[0];

        this.menu = new menu.Menu(this.toolbar);

        interact(this.toolbar).on("tap", () => {
            menu.hideAny();
        });
    }

    askResetLayout() {
        const modal = new AlertDialogView(
            "This operation cannot be undone!", "danger"
        );
        modal.title = "Are you sure you wish to reset this layout, " +
            "removing all the graphs and resetting the position of all items?";
        const resetButton = modal.addFooterButton("Reset");
        modal.addCloseButton();
        resetButton.addEventListener("click", () => {
            this.resetModelLayout();
        });
        modal.show();
    }

    /**
     * Trims the filename and sends it to the server.
     */
    fileName() {
        const openEl = <HTMLInputElement> document.getElementById("openFile");
        console.assert(openEl.hasOwnProperty("value"));
        let filename = openEl.value;
        filename = filename.replace("C:\\fakepath\\", "");
        this.sim.ws.send("open" + filename);
    }

    /**
     * Reset the model layout to the default.
     *
     * This is done by deleting the config file and reloading the script.
     */
    resetModelLayout() {
        window.location.assign(
            "/?reset=True&filename=" + $("#filename")[0].innerHTML);
    }

    /**
     * Launch the config modal.
     *
     * This is done by calling the server to call configModalShow with config
     * data.
     */
    configModal() {
        // Doing it this way in case we need to save options to a file later
        this.sim.ws.send("config");
    }

    configModalShow() {
        // TODO: this should be called by the server
        this.configDialog.show();
    }

    saveAs() {
        // TODO: get without jqeury
        const filename =$("#filename")[0].innerHTML;

        const modal = new InputDialogView(null, null);
        modal.title = "Save file as...";
        modal.input.value = filename;

        modal.ok.addEventListener("click", () => {
            const newFilename = modal.input.value;
            if (newFilename !== filename) {
                const editorCode = this.editor.editor.getValue();
                this.editor.ws.send(JSON.stringify(
                    {code: editorCode, save: true, saveAs: newFilename}
                ));
            }
            $(modal).modal("hide");
        });
        modal.ok.addEventListener("keypress", (event: KeyboardEvent) => {
            if (event.which === 13) {
                event.preventDefault();
                modal.ok.click();
            }
        });
        modal.show();
    }
}
