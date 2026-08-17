/**
 * name: Croppen — export plates
 * description: Exports the current document (or builds plate documents) as PNG into art/affinity/out.
 * version: 1.0.1
 * author: Croppen
 */

/*
  This is an Affinity *script*, not an Affinity *document*.

  Affinity will say "The file type is not supported" if you File > Open it.

  Run it from:
    Window → General → Scripts → Croppen — export plates

  To open the plates as a document instead:
    File → Open → art/affinity/croppen-female.svg
    (or croppen-male.svg)
*/

'use strict';

const { app } = require('/application.js');
const { Document, NewDocumentOptions, FileExportOptions, FileExportArea } = require('/document.js');
const { ImageNodeDefinition } = require('/nodes.js');
const { Bitmap, RasterFormat } = require('/rasterobject.js');
const { UnitType } = require('/units.js');
const { FileSystem } = require('/fs.js');

const ROOT = '/Users/lindau/codex/croppen';
const SRC_KRITA = ROOT + '/art/krita/out';
const SRC_BLEND = ROOT + '/art/blender/renders';
const DEST = ROOT + '/art/affinity/out';

const PLATES = [
    'female-skin.png',
    'female-skin-light.png',
    'female-muscles.png',
    'female-organs.png',
    'female-skeleton.png',
    'male-skin.png',
    'male-skin-light.png',
    'male-muscles.png',
    'male-organs.png',
    'male-skeleton.png',
];

function pickPreset(names) {
    return (
        names.find((n) => /PNG/i.test(n) && !/8-?bit/i.test(n) && !/palette/i.test(n)) ||
        names.find((n) => /PNG/i.test(n)) ||
        names[0]
    );
}

function exportCurrent(doc, destPath) {
    const names = FileExportOptions.allPresetNames || [];
    const preset = pickPreset(names);
    if (!preset) {
        app.alert('No PNG export preset is available.', 'Croppen');
        return false;
    }
    const opts = FileExportOptions.createWithPresetName(preset);
    const area = FileExportArea.createForWholeDocument();
    doc.export(destPath, opts, area, null);
    return true;
}

function srcFor(name) {
    const a = SRC_KRITA + '/' + name;
    const b = SRC_BLEND + '/' + name;
    // exists() is async in the SDK; try load and fall back.
    try {
        return Bitmap.loadFromFile(a, RasterFormat.RGBA8) ? a : b;
    } catch (e) {
        return b;
    }
}

function buildFromRenders() {
    let count = 0;
    try {
        FileSystem.createDirectories(DEST);
    } catch (e) {
        /* already there */
    }

    for (const name of PLATES) {
        let bitmap;
        try {
            bitmap = Bitmap.loadFromFile(srcFor(name), RasterFormat.RGBA8);
        } catch (e) {
            continue;
        }
        if (!bitmap) continue;

        const opts = NewDocumentOptions.createDefault();
        opts.units = UnitType.Pixels;
        opts.width = bitmap.width;
        opts.height = bitmap.height;
        opts.dpi = 144;
        opts.isTransparentBackground = true;

        const doc = Document.create(opts);
        const def = ImageNodeDefinition.create(RasterFormat.RGBA8);
        def.bitmap = bitmap;
        doc.addNode(def);
        if (exportCurrent(doc, DEST + '/' + name)) count += 1;
        try {
            doc.closeAsync(function () {});
        } catch (e) {
            /* ignore */
        }
    }
    return count;
}

function main() {
    const current = Document.current;
    if (current) {
        try {
            FileSystem.createDirectories(DEST);
        } catch (e) {
            /* already there */
        }
        const dest = DEST + '/current-export.png';
        if (exportCurrent(current, dest)) {
            app.alert('Exported the open document to\n' + dest, 'Croppen');
        }
        return;
    }

    const n = buildFromRenders();
    app.alert(
        n
            ? 'Exported ' + n + ' plates to art/affinity/out.\n\nTo edit the stack, File → Open art/affinity/croppen-female.svg'
            : 'No plate PNGs found. Render with npm run graphics:full first.',
        'Croppen',
    );
}

module.exports.main = main;
