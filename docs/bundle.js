/* NAMELESS 404: compilado desde TypeScript — WebGL2 nativo + fallback Canvas2D */
(()=>{
"use strict";

// premium/CopyistModel.js
const COPYIST_INK = [.042, .055, .071];
const COPYIST_CLOTH = [.076, .09, .10];
const COPYIST_EDGE = [.17, .20, .21];
const COPYIST_PAPER = [.69, .70, .60];
const COPYIST_BONE = [.48, .52, .45];
const COPYIST_RUST = [.33, .13, .17];
const COPYIST_VOID = [.018, .028, .035];
const COPYIST_STITCH = [.29, .34, .32];
const COPYIST_PALE = [.78, .77, .66];
function buildCopyistModel(time, threat = 0) {
    const parts = [];
    const t = Math.max(0, Number.isFinite(time) ? time : 0);
    const danger = Math.max(0, Math.min(100, Number.isFinite(threat) ? threat : 0)) / 100;
    const step = Math.sin(t * .0053) * (0.08 + danger * .045);
    const breath = Math.sin(t * .00135) * .012;
    const tilt = Math.sin(t * .00093) * .025;
    const put = (id, x, y, z, w, h, d, color, glow = false) => {
        parts.push({ id, x, y, z, width: w, height: h, depth: d, color, glow });
    };
    // Layered, asymmetrical coat. Converging skirt panels break the box silhouette.
    put('spine', tilt, 1.10, 0, .32, 1.13, .27, COPYIST_INK);
    for (let j = 0; j < 7; j++) {
        const k = j - 3;
        const sw = Math.sin(t * .0019 + j * .7) * (.022 + .009 * danger);
        put(`skirt-${j}`, k * .087 + sw, .52 + Math.abs(k) * .025, .08 + Math.abs(k) * .011, .085, .75 - Math.abs(k) * .04, .19, COPYIST_CLOTH);
        put(`hem-${j}`, k * .090 + sw, .16 + Math.abs(k) * .028, .10, .075, .14, .16, j % 3 ? COPYIST_INK : COPYIST_EDGE);
    }
    put('sternum', 0, 1.22, .01, .39, .52, .31, COPYIST_CLOTH);
    put('collar-left', -.14, 1.52, -.085, .17, .17, .20, COPYIST_EDGE);
    put('collar-right', .13, 1.52, -.08, .15, .13, .17, COPYIST_INK);
    for (let j = 0; j < 4; j++)
        put(`coat-fold-${j}`, -.20 + j * .12, 1.12 - j * .07, -.167, .014, .42 - j * .035, .015, j % 2 ? COPYIST_EDGE : COPYIST_VOID);
    // Two unnaturally long arms, animated out of phase, with five fingers each.
    for (const side of [-1, 1]) {
        const id = side < 0 ? 'left' : 'right';
        const offset = side < 0 ? step : -step * .61;
        put(`${id}-shoulder`, side * .265, 1.42, -.015, .24, .23, .26, COPYIST_INK);
        put(`${id}-upperarm`, side * (.31 + Math.abs(offset) * .19), 1.09 + offset, .01, .13, .55, .15, COPYIST_CLOTH);
        put(`${id}-elbow`, side * .34, .80 + offset * .72, .02, .145, .18, .145, COPYIST_EDGE);
        put(`${id}-forearm`, side * (.355 + Math.abs(offset) * .31), .59 + offset * .55, -.07, .108, .47, .14, COPYIST_INK);
        put(`${id}-hand`, side * .38, .34 + offset * .53, -.125, .14, .16, .12, COPYIST_BONE);
        for (let finger = 0; finger < 5; finger++) {
            const fx = side * .38 + (finger - 2) * .026;
            put(`${id}-finger-${finger}`, fx, .205 + offset * .5 + (finger % 2) * .013, -.16, .020, .14 + (finger % 3) * .024, .024, COPYIST_BONE);
        }
    }
    // Legs never march synchronously. The floating step gives a marionette cadence.
    for (const side of [-1, 1]) {
        const swing = side === -1 ? step : -step * .79;
        const id = side === -1 ? 'left' : 'right';
        put(`${id}-thigh`, side * .115, .52 + swing * .18, .0, .16, .52, .19, COPYIST_INK);
        put(`${id}-shin`, side * .125, .21 + swing * .32, swing * .70, .13, .38, .15, COPYIST_VOID);
        put(`${id}-shoe`, side * .13, .065, swing * .84 - .052, .17, .105, .26, COPYIST_INK);
    }
    // Paper-mask with offset plates and rigid face; black openings, no realistic gore.
    put('neck', -.016, 1.62, -.017, .16, .17, .18, COPYIST_BONE);
    put('head-rear', -.023, 1.82 + breath, -.005, .32, .42, .26, COPYIST_INK);
    put('mask-left', -.087, 1.836 + breath, -.151, .215, .34, .025, COPYIST_PAPER);
    put('mask-right', .098, 1.807 + breath, -.157, .163, .36, .025, COPYIST_PALE);
    put('mask-top', .008, 2.014 + breath, -.155, .25, .032, .031, COPYIST_PAPER);
    put('face-split', .010, 1.805 + breath, -.180, .016, .345, .018, COPYIST_STITCH);
    put('eye-left', -.105, 1.857 + breath, -.174, .074, .026, .017, COPYIST_VOID);
    put('eye-right', .101, 1.829 + breath, -.180, .052, .027, .018, COPYIST_VOID);
    put('mouth-thread', -.008, 1.714 + breath, -.182, .168, .013, .014, COPYIST_RUST);
    put('cheek-crack-a', .133, 1.778 + breath, -.178, .012, .113, .016, COPYIST_STITCH);
    put('cheek-crack-b', -.155, 1.742 + breath, -.170, .016, .073, .014, COPYIST_STITCH);
    // Strips of copied handwriting hang behind the silhouette, each with its own phase.
    for (let j = 0; j < 9; j++) {
        const sway = Math.sin(t * .0013 + j * .57) * (.017 + danger * .010);
        const q = j - 4;
        const y = .53 + (j % 3) * .12;
        put(`paper-strip-${j}`, q * .074 + sway, y, .184 + (j % 2) * .014, .046, .34 + (j % 4) * .08, .018, j % 3 ? COPYIST_BONE : COPYIST_STITCH);
        put(`ink-mark-${j}`, q * .074 + sway, y + .07, .198 + (j % 2) * .014, .025, .014, .009, COPYIST_VOID);
    }
    // Uncanny thin hair framing and obscuring the mask.
    for (let j = 0; j < 8; j++) {
        const a = j < 4 ? -1 : 1;
        const k = j % 4;
        const drift = Math.sin(t * .0017 + j) * .012;
        put(`hair-${j}`, a * (.18 + k * .027) + drift, 1.68 - k * .065, -.04, .038, .52 + k * .13, .047, j % 3 ? COPYIST_INK : COPYIST_EDGE);
    }
    return parts;
}

// premium/KibaDoors.js
/** NAMELESS 404 Premium 0.25 — presentation-only sliding fire shutters.
 * The original level geometry and collision are controlled by kibaMap().
 * Once a puzzle removes a wall tile, this visual animation briefly retracts
 * the shutter into its housing. No door ever changes the player's collision.
 */

function kibaDoorStates(map) {
    return Object.entries(KIBA_GATES).map(([gate, p]) => ({ gate,
        open: map[p.y]?.[p.x] !== '#', x: p.x + .5, z: p.y + .5 }));
}
function buildKibaDoorPanels(map, elapsed) {
    const parts = [];
    const place = (id, x, y, z, width, height, depth, color, emissive = false) => {
        parts.push({ id, x, y, z, width, height, depth, color, emissive });
    };
    const steel = [.27, .33, .32], rust = [.43, .28, .20], ink = [.075, .11, .13], warning = [.72, .50, .25];
    for (const gate of kibaDoorStates(map)) {
        if (!gate.open)
            continue;
        const { x, z } = gate;
        // Frame remains behind after the wall has genuinely been removed by the engine.
        for (const side of [-1, 1]) {
            place(`door-${gate.gate}-pillar-${side}`, x, 1.03, z + side * .49, .10, 2.05, .075, steel);
            place(`door-${gate.gate}-weld-${side}`, x, 1.25, z + side * .50, .112, .025, .08, rust);
        }
        place(`door-${gate.gate}-lintel`, x, 2.19, z, .13, .16, 1.04, steel);
        place(`door-${gate.gate}-lamp`, x, 2.13, z, .15, .035, .23, warning, true);
        const t = elapsed[gate.gate];
        if (!Number.isFinite(t) || t >= 1300)
            continue;
        const k = Math.max(0, Math.min(1, t / 1150));
        const ease = 1 - (1 - k) * (1 - k) * (1 - k);
        for (const side of [-1, 1]) {
            // The two leaves split and lift away without occupying the passage after 1.3s.
            const dz = side * (.235 + .38 * ease), height = (1 - ease) * 1.87;
            if (height < .018)
                continue;
            const y = .10 + height / 2 + 1.20 * ease;
            place(`door-${gate.gate}-leaf-${side}`, x, y, z + dz, .085, height, .42, ink);
            place(`door-${gate.gate}-stripe-${side}`, x + .049, y, z + dz, .015, Math.max(.015, height * .07), .39, warning);
        }
    }
    return parts;
}

// premium/KibaSurfaces.js
function buildKibaSurfaces(map) {
    const props = [];
    const oxidized = [.29, .27, .22];
    const grime = [.13, .19, .18];
    const plaster = [.43, .46, .38];
    const wet = [.18, .29, .29];
    const mark = (id, x, y, z, w, h, d, color) => {
        props.push({ id, x, y, z, width: w, height: h, depth: d, color, emissive: false });
    };
    for (let z = 1; z < map.length - 1; z++)
        for (let x = 1; x < (map[z]?.length ?? 0) - 1; x++) {
            if (map[z]?.[x] === '#')
                continue;
            const side = map[z]?.[x - 1] === '#' ? 'W' : map[z]?.[x + 1] === '#' ? 'E' : map[z - 1]?.[x] === '#' ? 'N' : map[z + 1]?.[x] === '#' ? 'S' : null;
            if (side === null)
                continue;
            const seed = (x * 43 + z * 73 + x * z * 11) % 17;
            if (seed > 8)
                continue; // Only ~half the suitable tiles; not a noise carpet.
            const ns = side === 'N' || side === 'S';
            const cx = ns ? x + .35 + (seed % 4) * .105 : (side === 'W' ? x + .022 : x + .978);
            const cz = ns ? (side === 'N' ? z + .022 : z + .978) : z + .35 + (seed % 4) * .105;
            const thick = .009;
            const wide = .15 + (seed % 3) * .04;
            const w = ns ? wide : thick, d = ns ? thick : wide;
            const baseY = .42 + (seed % 4) * .16;
            mark(`surface-${x}-${z}-mold`, cx, baseY, cz, w, .31 + (seed % 3) * .075, d, grime);
            if (seed % 2 === 0)
                mark(`surface-${x}-${z}-drip`, cx + (ns ? .047 : 0), baseY - .19, cz + (ns ? 0 : .04), ns ? .014 : thick, .30, ns ? thick : .014, wet);
            if (seed % 3 === 0)
                mark(`surface-${x}-${z}-plaster`, cx - (ns ? .07 : 0), 1.27, cz - (ns ? 0 : .06), ns ? .11 : thick, .16, ns ? thick : .11, plaster);
            if (seed % 4 === 1)
                mark(`surface-${x}-${z}-rust`, cx, 1.76, cz, w, .042, d, oxidized);
        }
    return props;
}

// premium/KibaVisuals.js
const PALETTE = {
    oxided: [.26, .34, .32],
    dark: [.085, .14, .15],
    pale: [.58, .65, .59],
    paper: [.64, .58, .48],
    warning: [.59, .29, .27],
    light: [.75, .88, .70],
    water: [.16, .29, .31],
    tarnished: [.39, .41, .35],
    tape: [.64, .49, .27]
};
const KIBA_VISUAL_PALETTE = PALETTE;
const isOpen = (map, x, z) => !!map[z]?.[x] && map[z][x] !== '#';
const kibaVisualHash = (x, z, seed = 0) => (((x * 73856093) ^ (z * 19349663) ^ (seed * 83492791)) >>> 0) % 101;
function buildKibaVisuals(map) {
    const p = [];
    const push = (id, x, y, z, width, height, depth, color, emissive = false) => {
        p.push({ id, x, y, z, width, height, depth, color, emissive });
    };
    // Los muros guían la decoración. Nunca hay elementos flotando en un muro cerrado.
    for (let z = 0; z < map.length; z++)
        for (let x = 0; x < (map[z]?.length ?? 0); x++) {
            if (!isOpen(map, x, z))
                continue;
            const midX = x + .5, midZ = z + .5;
            const h = kibaVisualHash(x, z);
            // Suelo: azulejos agrietados y humedad, pegados al pavimento.
            if (h % 5 === 0) {
                push(`water-${x}-${z}`, midX + .08, .035, midZ - .06, .43, .008, .36, PALETTE.water);
                push(`water-glint-${x}-${z}`, midX + .10, .044, midZ - .09, .21, .007, .02, PALETTE.oxided);
            }
            if ((x + z) % 7 === 1)
                push(`joint-${x}-${z}`, midX, .033, midZ, .84, .006, .018, PALETTE.tarnished);
            // Bajo los fluorescentes hay una rejilla de retorno sin volumen de colisión.
            if ((x * 3 + z) % 11 === 1) {
                push(`ceiling-${x}-${z}`, midX, 2.304, midZ, .42, .016, .16, PALETTE.dark);
                push(`tube-${x}-${z}`, midX, 2.283, midZ, .29, .014, .055, PALETTE.light, true);
                push(`tube-broken-${x}-${z}`, midX + .12, 2.277, midZ + .03, .035, .012, .03, PALETTE.warning);
            }
            // Señalética, heridas de pintura y cableado asentados sobre la cara interior del muro.
            const sides = [
                { dx: 0, dz: -1, px: midX, pz: z + .055, vertical: false },
                { dx: 0, dz: 1, px: midX, pz: z + .945, vertical: false },
                { dx: -1, dz: 0, px: x + .055, pz: midZ, vertical: true },
                { dx: 1, dz: 0, px: x + .945, pz: midZ, vertical: true }
            ];
            for (const side of sides) {
                if (isOpen(map, x + side.dx, z + side.dz))
                    continue;
                const r = kibaVisualHash(x, z, side.dx * 7 + side.dz * 13);
                const sx = side.vertical ? .018 : .60, sz = side.vertical ? .60 : .018;
                if (r % 6 === 0) {
                    push(`sconce-${x}-${z}-${side.dx}-${side.dz}`, side.px, 1.95, side.pz, sx, .17, sz, PALETTE.dark);
                    push(`sconce-bulb-${x}-${z}-${side.dx}-${side.dz}`, side.px, 1.96, side.pz, side.vertical ? .024 : .43, .042, side.vertical ? .43 : .024, PALETTE.light, true);
                }
                if (r % 4 === 0) {
                    push(`paint-${x}-${z}-${side.dx}-${side.dz}`, side.px, 1.15, side.pz, side.vertical ? .020 : .34, .29, side.vertical ? .34 : .020, PALETTE.oxided);
                    push(`paint-flake-${x}-${z}-${side.dx}-${side.dz}`, side.px, .97, side.pz, side.vertical ? .023 : .16, .10, side.vertical ? .16 : .023, PALETTE.tarnished);
                }
                if (r % 7 === 0) {
                    push(`cable-${x}-${z}-${side.dx}-${side.dz}`, side.px, 1.26, side.pz, side.vertical ? .027 : .018, .77, side.vertical ? .018 : .027, PALETTE.dark);
                    push(`cable-clamp-${x}-${z}-${side.dx}-${side.dz}`, side.px, 1.62, side.pz, side.vertical ? .030 : .065, .035, side.vertical ? .065 : .030, PALETTE.tarnished);
                }
            }
        }
    // Marcadores físicos diseñados a mano para los lugares esenciales del Día 1.
    // Todos reposan cerca del perímetro de casillas transitables; los objetos
    // interactivos originales siguen dibujándose por separado.
    const markers = [
        { id: 'lobby', x: 2.5, z: 2.5, c: PALETTE.light },
        { id: 'archive', x: 3.5, z: 9.5, c: PALETTE.paper },
        { id: 'tape04', x: 10.5, z: 9.5, c: PALETTE.warning },
        { id: 'locker', x: 12.5, z: 4.5, c: PALETTE.tarnished },
        { id: 'mirror', x: 5.5, z: 4.5, c: PALETTE.pale },
        { id: 'phone', x: 8.5, z: 3.5, c: PALETTE.tape },
        { id: 'photo', x: 13.5, z: 2.5, c: PALETTE.warning }
    ];
    for (const mark of markers) {
        const x = Math.floor(mark.x), z = Math.floor(mark.z);
        if (!isOpen(map, x, z))
            continue;
        // Superficie de navegación pintada, no un pedestal que impida caminar.
        push(`mark-${mark.id}`, mark.x, .040, mark.z, .39, .008, .055, mark.c);
        push(`mark-edge-${mark.id}`, mark.x, .044, mark.z + .09, .19, .006, .018, PALETTE.dark);
    }
    return p;
}

// premium/KibaRooms.js
const KIBA_ROOM_FIXTURES = [
    { id: 'reception', kind: 'reception', x: 2, z: 1, side: 'N', title: 'Recepción cerrada' },
    { id: 'evacuation', kind: 'notice', x: 4, z: 1, side: 'N', title: 'Plano de evacuación adulterado' },
    { id: 'fuse-box', kind: 'electrical', x: 5, z: 2, side: 'E', title: 'Cuadro eléctrico' },
    { id: 'missing-family', kind: 'portrait', x: 1, z: 3, side: 'W', title: 'Retrato familiar borrado' },
    { id: 'vending', kind: 'vending', x: 14, z: 3, side: 'E', title: 'Máquina expendedora desconectada' },
    { id: 'security', kind: 'reception', x: 12, z: 1, side: 'N', title: 'Puesto de vigilancia' },
    { id: 'archive-left', kind: 'archive', x: 1, z: 8, side: 'W', title: 'Archivo 1988' },
    { id: 'archive-right', kind: 'archive', x: 6, z: 8, side: 'E', title: 'Archivadores de desaparecidos' },
    { id: 'archive-torn', kind: 'notice', x: 3, z: 9, side: 'S', title: 'Aviso de desaparición' },
    { id: 'supply', kind: 'locker', x: 14, z: 8, side: 'E', title: 'Armario de mantenimiento' },
    { id: 'reel-station', kind: 'machine', x: 11, z: 9, side: 'N', title: 'Equipo de cinta magnética' },
    { id: 'generator', kind: 'generator', x: 14, z: 11, side: 'E', title: 'Generador de sótano' },
    { id: 'exit-sign', kind: 'exit', x: 8, z: 12, side: 'S', title: 'Salida de emergencia anulada' },
    { id: 'medicine', kind: 'medicine', x: 5, z: 4, side: 'W', title: 'Botiquín abandonado' }
];
const KIBA_ROOM_COLORS = {
    chassis: [.21, .27, .27], steel: [.35, .41, .39], black: [.065, .095, .105],
    dirtyWhite: [.66, .67, .56], brown: [.36, .27, .20], paper: [.75, .69, .54],
    green: [.31, .48, .39], caution: [.69, .47, .20], red: [.61, .18, .17],
    phosphor: [.57, .82, .66], glass: [.23, .39, .43], rust: [.49, .27, .18]
};
function validPlacement(map, f) {
    if (map[f.z]?.[f.x] === '#' || !map[f.z]?.[f.x])
        return false;
    const dx = f.side === 'W' ? -1 : f.side === 'E' ? 1 : 0;
    const dz = f.side === 'N' ? -1 : f.side === 'S' ? 1 : 0;
    return map[f.z + dz]?.[f.x + dx] === '#';
}
function buildKibaRooms(map) {
    const props = [];
    for (const f of KIBA_ROOM_FIXTURES) {
        if (!validPlacement(map, f))
            continue;
        // Local u: across wall, local v: depth into room, positive away from wall.
        // All ground fixtures stop before the tile centre, leaving walking room.
        const ns = f.side === 'N' || f.side === 'S';
        const baseX = f.x + .5, baseZ = f.z + .5;
        const put = (part, u, y, v, w, h, d, color, emissive = false) => {
            const x = ns ? baseX + u : (f.side === 'W' ? f.x + v : f.x + 1 - v);
            const z = ns ? (f.side === 'N' ? f.z + v : f.z + 1 - v) : baseZ + u;
            props.push({ id: `room-${f.id}-${part}`, x, y, z, width: ns ? w : d, height: h, depth: ns ? d : w, color, emissive });
        };
        if (f.kind === 'reception') {
            put('base', 0, .43, .20, .84, .80, .28, KIBA_ROOM_COLORS.brown);
            put('front', 0, .51, .37, .77, .52, .025, KIBA_ROOM_COLORS.steel);
            put('counter', 0, .85, .25, .94, .08, .35, KIBA_ROOM_COLORS.dirtyWhite);
            put('screen', -.19, 1.12, .15, .34, .39, .055, KIBA_ROOM_COLORS.black);
            put('crt-bezel', -.19, 1.13, .115, .26, .27, .02, KIBA_ROOM_COLORS.chassis);
            put('crt-text', -.19, 1.14, .098, .17, .035, .012, KIBA_ROOM_COLORS.phosphor, true);
            put('telephone', .26, .95, .26, .18, .13, .14, KIBA_ROOM_COLORS.black);
            put('telephone-light', .26, 1.02, .19, .06, .025, .012, KIBA_ROOM_COLORS.red, true);
        }
        else if (f.kind === 'notice') {
            put('cork', 0, 1.51, .048, .76, .64, .04, KIBA_ROOM_COLORS.brown);
            put('frame', 0, 1.83, .040, .82, .055, .058, KIBA_ROOM_COLORS.steel);
            put('paper-a', -.17, 1.60, .085, .26, .36, .012, KIBA_ROOM_COLORS.paper);
            put('paper-b', .18, 1.46, .089, .24, .40, .012, KIBA_ROOM_COLORS.dirtyWhite);
            put('redact', .17, 1.53, .099, .15, .027, .012, KIBA_ROOM_COLORS.black);
            put('pin-a', -.16, 1.76, .098, .027, .026, .013, KIBA_ROOM_COLORS.red);
            put('pin-b', .22, 1.64, .101, .025, .022, .013, KIBA_ROOM_COLORS.red);
        }
        else if (f.kind === 'electrical') {
            put('shell', 0, 1.36, .13, .62, 1.03, .20, KIBA_ROOM_COLORS.chassis);
            put('door', 0, 1.36, .242, .54, .92, .02, KIBA_ROOM_COLORS.steel);
            for (let j = 0; j < 4; j++)
                put(`switch-${j}`, -.20 + j * .13, 1.32, .256, .055, .16, .025, j === 2 ? KIBA_ROOM_COLORS.red : KIBA_ROOM_COLORS.black);
            put('warning', 0, 1.72, .257, .23, .10, .012, KIBA_ROOM_COLORS.caution);
            put('led', .18, 1.06, .264, .045, .046, .012, KIBA_ROOM_COLORS.red, true);
        }
        else if (f.kind === 'portrait') {
            put('frame', 0, 1.57, .065, .58, .71, .075, KIBA_ROOM_COLORS.brown);
            put('paper', 0, 1.58, .112, .46, .58, .016, KIBA_ROOM_COLORS.paper);
            put('smear', -.07, 1.57, .124, .21, .47, .012, KIBA_ROOM_COLORS.black);
            put('figure', .17, 1.41, .125, .10, .26, .011, KIBA_ROOM_COLORS.steel);
            put('cross', .16, 1.70, .130, .10, .012, .014, KIBA_ROOM_COLORS.red);
        }
        else if (f.kind === 'vending') {
            put('cabinet', 0, .91, .18, .70, 1.77, .31, KIBA_ROOM_COLORS.steel);
            put('panel', -.085, 1.20, .352, .46, .95, .017, KIBA_ROOM_COLORS.black);
            for (let j = 0; j < 3; j++)
                put(`product-${j}`, -.24 + j * .15, 1.32, .368, .085, .27, .015, j === 1 ? KIBA_ROOM_COLORS.red : KIBA_ROOM_COLORS.dirtyWhite);
            put('button', .265, .93, .363, .075, .25, .024, KIBA_ROOM_COLORS.caution);
            put('slot', 0, .38, .358, .44, .11, .021, KIBA_ROOM_COLORS.black);
            put('toplight', 0, 1.75, .362, .49, .08, .018, KIBA_ROOM_COLORS.phosphor, true);
        }
        else if (f.kind === 'archive') {
            put('cabinet', 0, .95, .17, .71, 1.88, .30, KIBA_ROOM_COLORS.steel);
            for (let j = 0; j < 4; j++) {
                const y = .40 + j * .35;
                put(`drawer-${j}`, 0, y, .338, .62, .30, .018, KIBA_ROOM_COLORS.chassis);
                put(`label-${j}`, -.13, y + .035, .354, .20, .08, .012, KIBA_ROOM_COLORS.paper);
                put(`handle-${j}`, .20, y - .04, .355, .12, .026, .015, KIBA_ROOM_COLORS.black);
            }
            put('dust', 0, 1.91, .15, .70, .012, .30, KIBA_ROOM_COLORS.rust);
        }
        else if (f.kind === 'machine') {
            put('table', 0, .60, .24, .79, .12, .38, KIBA_ROOM_COLORS.brown);
            put('leg-a', -.30, .31, .12, .06, .55, .06, KIBA_ROOM_COLORS.steel);
            put('leg-b', .30, .31, .12, .06, .55, .06, KIBA_ROOM_COLORS.steel);
            put('deck', 0, .81, .21, .63, .30, .28, KIBA_ROOM_COLORS.chassis);
            put('reel-left', -.18, .98, .12, .23, .20, .042, KIBA_ROOM_COLORS.paper);
            put('reel-right', .17, .98, .12, .23, .20, .042, KIBA_ROOM_COLORS.paper);
            put('reel-hub-left', -.18, .985, .094, .06, .065, .015, KIBA_ROOM_COLORS.black);
            put('reel-hub-right', .17, .985, .094, .06, .065, .015, KIBA_ROOM_COLORS.black);
            put('record-led', .30, .78, .373, .035, .035, .015, KIBA_ROOM_COLORS.red, true);
        }
        else if (f.kind === 'generator') {
            put('housing', 0, .71, .17, .79, 1.38, .29, KIBA_ROOM_COLORS.chassis);
            put('grille', 0, .83, .328, .65, .73, .025, KIBA_ROOM_COLORS.black);
            for (let j = 0; j < 5; j++)
                put(`rib-${j}`, 0, .56 + j * .12, .351, .65, .023, .015, KIBA_ROOM_COLORS.steel);
            put('control', .17, 1.32, .336, .22, .14, .026, KIBA_ROOM_COLORS.dirtyWhite);
            put('alarm', .22, 1.35, .354, .035, .045, .015, KIBA_ROOM_COLORS.caution, true);
            put('foot', 0, .08, .18, .80, .13, .32, KIBA_ROOM_COLORS.rust);
        }
        else if (f.kind === 'locker') {
            put('shell', 0, .96, .15, .70, 1.90, .29, KIBA_ROOM_COLORS.steel);
            put('door-a', -.175, .95, .309, .34, 1.81, .017, KIBA_ROOM_COLORS.chassis);
            put('door-b', .175, .95, .309, .34, 1.81, .017, KIBA_ROOM_COLORS.chassis);
            for (let j = 0; j < 3; j++) {
                put(`louvre-a-${j}`, -.16, 1.54 - j * .075, .328, .16, .016, .012, KIBA_ROOM_COLORS.black);
                put(`louvre-b-${j}`, .18, 1.54 - j * .075, .328, .16, .016, .012, KIBA_ROOM_COLORS.black);
            }
            put('lock', .035, .91, .334, .045, .12, .015, KIBA_ROOM_COLORS.caution);
        }
        else if (f.kind === 'exit') {
            put('housing', 0, 2.05, .055, .70, .20, .07, KIBA_ROOM_COLORS.chassis);
            put('screen', 0, 2.05, .10, .63, .14, .013, KIBA_ROOM_COLORS.green, true);
            put('arrow', .21, 2.05, .113, .19, .035, .012, KIBA_ROOM_COLORS.dirtyWhite, true);
            put('fracture', -.18, 2.06, .115, .03, .13, .014, KIBA_ROOM_COLORS.black);
        }
        else if (f.kind === 'medicine') {
            put('shell', 0, 1.40, .10, .57, .71, .16, KIBA_ROOM_COLORS.dirtyWhite);
            put('door', 0, 1.40, .191, .50, .63, .017, KIBA_ROOM_COLORS.steel);
            put('cross-v', 0, 1.40, .210, .10, .35, .012, KIBA_ROOM_COLORS.red);
            put('cross-h', 0, 1.40, .213, .32, .11, .012, KIBA_ROOM_COLORS.red);
            put('lock', .20, 1.28, .213, .035, .09, .015, KIBA_ROOM_COLORS.black);
        }
    }
    return props;
}
/** Low-cost room anchors for the Canvas 2D fallback. Avoids pretending that a
 * textured wall is a modelled 3D scene when WebGL2 is unavailable. */
function getKibaRoomFixtures(map) {
    return KIBA_ROOM_FIXTURES.filter(f => validPlacement(map, f));
}

// premium/KibaLighting.js
const KIBA_LAMPS = [
    { id: 'vestibulo', x: 2.5, y: 2.14, z: 2.5, color: 0xc3d2bf, strength: 1.7, flicker: .04 },
    { id: 'ala-este', x: 8.5, y: 2.14, z: 3.5, color: 0xa4c6bf, strength: 1.35, flicker: .13 },
    { id: 'archivos', x: 3.5, y: 2.14, z: 9.5, color: 0xe0bd92, strength: 1.55, flicker: .07 },
    { id: 'cinta-04', x: 10.5, y: 2.14, z: 9.5, color: 0xb0d2c8, strength: 1.25, flicker: .18 }
];
/** Sin aleatoriedad ni temporizadores propios: reproducible y estable. */
function kibaLampIntensity(lamp, now, threat) {
    const seconds = now * .001;
    const slow = Math.sin(seconds * (1.05 + lamp.flicker * 2) + lamp.x * .71);
    const quick = Math.sin(seconds * 7.17 + lamp.z * 1.93);
    const danger = Math.min(1, Math.max(0, threat / 100));
    return lamp.strength * (1 - lamp.flicker * .45 + lamp.flicker * (slow * .34 + quick * .10) - danger * .10);
}
function activeKibaLamps(day, map) {
    if (day !== 1)
        return [];
    return KIBA_LAMPS.filter(l => map[Math.floor(l.z)]?.[Math.floor(l.x)] !== '#'
        && map[Math.floor(l.z)]?.[Math.floor(l.x)] !== undefined);
}
/** Selección de las 3 fuentes más cercanas; la cuarta queda en reserva. */
function nearestKibaLamps(x, z, lamps, limit = 3) {
    return lamps.slice().sort((a, b) => {
        const da = (a.x - x) ** 2 + (a.z - z) ** 2, db = (b.x - x) ** 2 + (b.z - z) ** 2;
        return da - db || a.id.localeCompare(b.id);
    }).slice(0, limit);
}

// premium/GPUDiagnostics.js
function probeWebGL2() {
    const no = (message) => ({ available: false, shader: false, pixel: false, version: '—', message });
    if (typeof document === 'undefined')
        return no('Sin DOM');
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    let gl = null;
    try {
        gl = canvas.getContext('webgl2', { alpha: false, preserveDrawingBuffer: true });
    }
    catch {
        return no('El navegador bloquea el contexto WebGL2');
    }
    if (!gl)
        return no('WebGL2 no está disponible en este navegador');
    let vert = null, frag = null, program = null, buffer = null;
    let shader = false, pixel = false, version = 'WebGL2';
    try {
        version = String(gl.getParameter(gl.VERSION) || 'WebGL2');
        function compile(type, source) {
            const s = gl.createShader(type);
            if (!s)
                throw Error('No se puede crear un shader');
            gl.shaderSource(s, source);
            gl.compileShader(s);
            if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
                throw Error(String(gl.getShaderInfoLog(s) || 'Shader rechazado'));
            return s;
        }
        vert = compile(gl.VERTEX_SHADER, `#version 300 es\nlayout(location=0) in vec2 a_xy;\nvoid main(){gl_Position=vec4(a_xy,0.,1.);}`);
        frag = compile(gl.FRAGMENT_SHADER, `#version 300 es\nprecision mediump float;\nout vec4 o_color;\nvoid main(){o_color=vec4(0.25,0.75,0.50,1.);}`);
        program = gl.createProgram();
        if (!program)
            throw Error('No se puede crear un programa');
        gl.attachShader(program, vert);
        gl.attachShader(program, frag);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS))
            throw Error(String(gl.getProgramInfoLog(program) || 'Enlace fallido'));
        shader = true;
        buffer = gl.createBuffer();
        if (!buffer)
            throw Error('Buffer no disponible');
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, -1, 1, 1, -1, 1]), gl.STATIC_DRAW);
        gl.useProgram(program);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        gl.viewport(0, 0, 16, 16);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        const rgba = new Uint8Array(4);
        gl.readPixels(8, 8, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, rgba);
        pixel = Math.abs(rgba[0] - 64) < 12 && Math.abs(rgba[1] - 191) < 12 && Math.abs(rgba[2] - 128) < 12 && rgba[3] > 200;
        return { available: true, shader, pixel, version, message: pixel ? 'Shader y píxel RGB verificados' : 'El dibujo no devuelve el píxel esperado' };
    }
    catch (e) {
        return { available: true, shader, pixel, version, message: e instanceof Error ? e.message : String(e) };
    }
    finally {
        if (buffer)
            gl.deleteBuffer(buffer);
        if (program)
            gl.deleteProgram(program);
        if (vert)
            gl.deleteShader(vert);
        if (frag)
            gl.deleteShader(frag);
    }
}

// premium/KibaArchitecture.js
const KIBA_SWITCHES = [
    { x: 5.5, y: 2.5, id: 'kibaBreaker', r: 1.05 },
    { x: 6.5, y: 7.5, id: 'kibaWinch', r: 1.05 },
    { x: 11.5, y: 5.5, id: 'kibaVent', r: 1.05 }
];
const KIBA_HIDEOUTS = [
    { x: 3.5, y: 11.5, id: 'kibaHideArchive', r: .82 },
    { x: 9.5, y: 11.5, id: 'kibaHideBasement', r: .82 }
];
const KIBA_GATES = {
    north: { x: 6, y: 2, flag: 'kibaNorthOpen', label: 'PASO NORTE' },
    archive: { x: 7, y: 7, flag: 'kibaArchiveOpen', label: 'ARCHIVO / TALLER' }
};
function kibaMap(base, flags) {
    const rows = base.map(row => row);
    for (const gate of Object.values(KIBA_GATES)) {
        if (flags?.[gate.flag] === true) {
            if (rows[gate.y]?.[gate.x] !== '#')
                throw Error('La compuerta no pertenece al mapa Kiba');
            const r = rows[gate.y];
            rows[gate.y] = r.slice(0, gate.x) + '.' + r.slice(gate.x + 1);
        }
    }
    return rows;
}
function nearestKibaFeature(x, y, features) {
    let best = null, dist = Infinity;
    for (const f of features) {
        const d = Math.hypot(f.x - x, f.y - y);
        if (d <= f.r && d < dist) {
            best = f;
            dist = d;
        }
    }
    return best;
}
function hideRisk(threat, light, noise) {
    return (Number.isFinite(threat) && threat >= 65) || (light && threat >= 48 && noise > 1.1);
}
function hideMayBeFound(entityDistance, alert, phase) {
    return alert && Number.isFinite(entityDistance) && entityDistance < 1.22 && (phase === 'hunt' || phase === 'investigate' || phase === 'search');
}
function isValidHideSpot(v) {
    return v === 'kibaHideArchive' || v === 'kibaHideBasement';
}

// premium/DayOneFinale.js
const FINALE_OBJECTIVES = {
    1: 'HUIDA · 1/2: REGRESA AL TORNO DE ARCHIVOS (6,7)',
    2: 'HUIDA · 2/2: ALCANZA LA ENTRADA DE KIBA (2,2) SIN SER DESCUBIERTO'
};
function canStartFinale(s) {
    return s.day === 1 && s.mode === 'real' && s.key && s.tape && !s.won && s.flags.kibaFinaleStage !== 3 && !(Number(s.flags.kibaFinaleStage) > 0);
}
function finaleTarget(stage) {
    return stage === 1 ? { x: 6.5, y: 7.5 } : stage === 2 ? { x: 2.5, y: 2.5 } : null;
}
function atFinaleTarget(stage, x, y) {
    const target = finaleTarget(stage);
    return !!target && Math.hypot(x - target.x, y - target.y) < 1.05;
}
function sanitizeFinale(flags, day, key, tape, steps) {
    let stage = Number(flags.kibaFinaleStage);
    if (!Number.isInteger(stage) || stage < 0 || stage > 3 || day !== 1 || !key || !tape)
        stage = 0;
    flags.kibaFinaleStage = stage;
    flags.kibaFinaleFailures = Number.isInteger(flags.kibaFinaleFailures) ? Math.max(0, Math.min(99, Number(flags.kibaFinaleFailures))) : 0;
    const at = Number(flags.kibaFinaleStartedAt);
    if (!Number.isInteger(at) || at < 0 || at > steps)
        delete flags.kibaFinaleStartedAt;
    if (stage === 0 || stage === 3)
        delete flags.kibaFinaleStartedAt;
    if (flags.kibaFinaleDone !== true || stage !== 3)
        flags.kibaFinaleDone = false;
    if (stage === 3)
        flags.kibaFinaleDone = true;
}
function tensionLevel(stage, threat) {
    if (stage !== 1 && stage !== 2)
        return 0;
    return Math.min(1, Math.max(0, .32 + (Number.isFinite(threat) ? threat : 0) / 170 + (stage === 2 ? .16 : 0)));
}

// engine.js
// @ts-nocheck





/* NAMELESS 404 — motor original preservado en la migración v0.9 (tipado progresivo). */
const NamelessEngine = (function () {
    'use strict';
    const VERSION = 15;
    const REAL = [
        '################',
        '#.....#........#',
        '#.....#..##....#',
        '#..............#',
        '#..##........#.#',
        '#.........#....#',
        '##.####.###....#',
        '#......#.......#',
        '#......#..##...#',
        '#..............#',
        '#..##...#......#',
        '#.......#......#',
        '#...#..........#',
        '################'
    ];
    const RPG = [
        '################',
        '#..............#',
        '#.##..###......#',
        '#......#....#..#',
        '#...#.......#..#',
        '###.###....##..#',
        '#..............#',
        '#.####.....#...#',
        '#......#.......#',
        '#..##.......#..#',
        '#......##......#',
        '#..............#',
        '################'
    ];
    // Un segundo edificio y una segunda version corrompida del RPG: mapas originales.
    const REAL_2 = [
        '################',
        '#.....#........#',
        '#.....#........#',
        '#..............#',
        '#..##......#...#',
        '#..............#',
        '##.###..##.....#',
        '#......#.......#',
        '#......#.......#',
        '#.........#....#',
        '#..##........#.#',
        '#..............#',
        '#...#..........#',
        '################'
    ];
    const RPG_2 = [
        '################',
        '#..............#',
        '#..#..###......#',
        '#......#.......#',
        '#...#..........#',
        '###.###....##..#',
        '#..............#',
        '#..###......#..#',
        '#......#.......#',
        '#..##..........#',
        '#......##......#',
        '#..............#',
        '################'
    ];
    // La estación del Día 3: dos recorridos de conexión propios.
    const REAL_3 = [
        '################',
        '#.....#........#',
        '#..............#',
        '#..##...#......#',
        '#..............#',
        '#.###....##....#',
        '#.......#......#',
        '#..............#',
        '#...##...#.....#',
        '#.........#....#',
        '#..............#',
        '#..##.....#....#',
        '#..............#',
        '################'
    ];
    const RPG_3 = [
        '################',
        '#..............#',
        '#...#..##......#',
        '#..............#',
        '#......#.......#',
        '#..#.....##....#',
        '#..............#',
        '#...##.........#',
        '#........#.....#',
        '#..#...........#',
        '#..............#',
        '#..............#',
        '################'
    ];
    // Los dos desvíos se abren en puntos distintos, sin encerrar al jugador.
    // El panel del andén cambia cuál está disponible; la ruta inferior siempre permite volver.
    function day3RealMap(s) {
        const rows = REAL_3.slice();
        const opened = s.d3Signal;
        const y = 6, x = 8;
        rows[y] = rows[y].slice(0, x) + (opened ? '.' : '#') + rows[y].slice(x + 1);
        return rows;
    }
    // Día 4 — Sanatorio de Papel: una planta clínica que se pliega en dos dimensiones.
    // La sala 0 permanece cerrada en la realidad hasta reconstruir el plano del cartucho.
    const REAL_4 = [
        '################',
        '#.....#........#',
        '#.....#..##....#',
        '#..............#',
        '#..##..........#',
        '#.........#....#',
        '##.####.###....#',
        '#......#.......#',
        '#......#..##...#',
        '#..............#',
        '#..##...#......#',
        '#.......#......#',
        '#...#..........#',
        '################'
    ];
    const RPG_4 = [
        '################',
        '#..............#',
        '#..##..##......#',
        '#..............#',
        '#......#.......#',
        '#..#.....##....#',
        '#..............#',
        '#...##.........#',
        '#........#.....#',
        '#..#...........#',
        '#..............#',
        '#..............#',
        '################'
    ];
    function day4RealMap(s) {
        const rows = REAL_4.slice();
        // Pasaje de cirugía detrás del plano plegado: pasa de muro a suelo.
        const x = 8, y = 6;
        rows[y] = rows[y].slice(0, x) + (s.d4Fold ? '.' : '#') + rows[y].slice(x + 1);
        return rows;
    }
    // Día 5: pasaje borrado hasta recuperar la calle del cartucho.
    const REAL_5 = [
        '################', '#..............#', '#.....#........#',
        '#..............#', '#...##.........#', '#.........#....#',
        '##.####.###....#', '#......#.......#', '#......#..##...#',
        '#..............#', '#..##..........#', '#.......#......#',
        '#..............#', '################'
    ];
    const RPG_5 = [
        '################', '#..............#', '#...#..........#',
        '#..............#', '#......##......#', '#..............#',
        '#...##.........#', '#..............#', '#..##.....#....#',
        '#..............#', '#..............#', '#..............#',
        '################'
    ];
    function day5RealMap(s) {
        const rows = REAL_5.slice(), x = 8, y = 6;
        rows[y] = rows[y].slice(0, x) + (s.d5Street ? '.' : '#') + rows[y].slice(x + 1);
        return rows;
    }
    const DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]];
    const RPG_ITEMS = [{ x: 4, y: 3, id: 'note' }, { x: 9, y: 8, id: 'seal' }, { x: 5, y: 10, id: 'child' }, { x: 10, y: 4, id: 'well' }, { x: 13, y: 10, id: 'exit' }];
    const REAL_ITEMS = [{ x: 10.5, y: 9.5, id: 'tape', r: 1.35 }, { x: 3.5, y: 9.5, id: 'cabinet', r: 1.5 }, { x: 12.5, y: 4.5, id: 'locker', r: 1.4 }, { x: 8.5, y: 3.5, id: 'telephone', r: 1.4 }, { x: 5.5, y: 4.5, id: 'mirror', r: 1.3 }, { x: 13.5, y: 2.5, id: 'photo', r: 1.4 }];
    const RPG_ITEMS_2 = [{ x: 4, y: 3, id: 'bell' }, { x: 11, y: 4, id: 'reflection' }, { x: 13, y: 10, id: 'exit2' }];
    const REAL_ITEMS_2 = [
        { x: 3.5, y: 3.5, id: 'register', r: 1.25 },
        { x: 12.5, y: 3.5, id: 'intercom', r: 1.35 },
        { x: 11.5, y: 9.5, id: 'room207', r: 1.3 },
        { x: 6.5, y: 10.5, id: 'locker2', r: 1.3 }
    ];
    const REAL_ITEMS_3 = [
        { x: 4.5, y: 2.5, id: 'ticket', r: 1.35 },
        { x: 12.5, y: 4.5, id: 'schedule', r: 1.4 },
        { x: 10.5, y: 10.5, id: 'booth', r: 1.4 },
        { x: 5.5, y: 10.5, id: 'bench', r: 1.4 }
    ];
    const RPG_ITEMS_3 = [
        { x: 3, y: 4, id: 'clock' }, { x: 10, y: 6, id: 'signal' },
        { x: 5, y: 9, id: 'traveler' }, { x: 13, y: 10, id: 'platform' }
    ];
    const REAL_ITEMS_4 = [
        { x: 4.5, y: 3.5, id: 'patientFile', r: 1.35 },
        { x: 12.5, y: 3.5, id: 'xray', r: 1.4 },
        { x: 11.5, y: 10.5, id: 'reel', r: 1.4 },
        { x: 5.5, y: 10.5, id: 'curtain', r: 1.4 }
    ];
    const RPG_ITEMS_4 = [
        { x: 4, y: 4, id: 'inkLedger' },
        { x: 11, y: 5, id: 'foldedMap' },
        { x: 5, y: 9, id: 'paperNurse' },
        { x: 13, y: 10, id: 'bedZero' }
    ];
    const REAL_ITEMS_5 = [
        { x: 4.5, y: 3.5, id: 'streetSign', r: 1.35 }, { x: 12.5, y: 3.5, id: 'emptyPlot', r: 1.45 },
        { x: 11.5, y: 10.5, id: 'missingHouse', r: 1.45 }, { x: 5.5, y: 10.5, id: 'busShelter', r: 1.35 }
    ];
    const RPG_ITEMS_5 = [
        { x: 4, y: 4, id: 'addressBook' }, { x: 11, y: 5, id: 'streetMemory' },
        { x: 5, y: 9, id: 'facelessNeighbor' }, { x: 13, y: 10, id: 'houseThreshold' }
    ];
    // Día 6. La rueda del RPG abre el pasaje físico del depósito.
    const REAL_6 = [
        '################', '#..............#', '#....#.........#',
        '#..............#', '#...##.........#', '#.........#....#',
        '########.#######', '#......#.......#', '#......#..##...#',
        '#..............#', '#...#..........#', '#.......#......#',
        '#..............#', '################'
    ];
    const RPG_6 = [
        '################', '#..............#', '#..##..##......#',
        '#..............#', '#....#.........#', '#......#.......#',
        '#...##.........#', '#..............#', '#..#......#....#',
        '#..............#', '#..............#', '#..............#',
        '################'
    ];
    function day6RealMap(s) {
        const rows = REAL_6.slice(), x = 8, y = 6;
        rows[y] = rows[y].slice(0, x) + (s.d6Vent ? '.' : '#') + rows[y].slice(x + 1);
        return rows;
    }
    const REAL_ITEMS_6 = [
        { x: 4.5, y: 3.5, id: 'ashLabel', r: 1.35 },
        { x: 12.5, y: 3.5, id: 'furnace', r: 1.4 },
        { x: 11.5, y: 10.5, id: 'negative', r: 1.4 },
        { x: 2.5, y: 4.5, id: 'serviceVent', r: 1.35 }
    ];
    const RPG_ITEMS_6 = [
        { x: 4, y: 4, id: 'cinderIndex' }, { x: 11, y: 5, id: 'temperatureWheel' },
        { x: 5, y: 9, id: 'ashKeeper' }, { x: 13, y: 10, id: 'originCore' }
    ];
    // Día 7 — Cámara de origen: la copia y el original se encuentran.
    // El hueco (8,6) solo se abre al reconstruir el nombre en el cartucho.
    const REAL_7 = [
        '################', '#..............#', '#.....#........#',
        '#..............#', '#...##.........#', '#.........#....#',
        '########.#######', '#......#.......#', '#......#..##...#',
        '#..............#', '#...#..........#', '#.......#......#',
        '#..............#', '################'
    ];
    const RPG_7 = [
        '################', '#..............#', '#..##..##......#',
        '#..............#', '#....#.........#', '#......#.......#',
        '#...##.........#', '#..............#', '#..#......#....#',
        '#..............#', '#..............#', '#..............#',
        '################'
    ];
    function day7RealMap(s) {
        const rows = REAL_7.slice(), x = 8, y = 6;
        rows[y] = rows[y].slice(0, x) + (s.d7Name ? '.' : '#') + rows[y].slice(x + 1);
        return rows;
    }
    const REAL_ITEMS_7 = [
        { x: 4.5, y: 3.5, id: 'originTerminal', r: 1.35 },
        { x: 12.5, y: 3.5, id: 'voiceProof', r: 1.4 },
        { x: 11.5, y: 10.5, id: 'originalPhoto', r: 1.4 },
        { x: 2.5, y: 4.5, id: 'safeCabinet', r: 1.35 }
    ];
    const RPG_ITEMS_7 = [
        { x: 4, y: 4, id: 'blankPortrait' }, { x: 11, y: 5, id: 'writtenName' },
        { x: 5, y: 9, id: 'naoWitness' }, { x: 2, y: 10, id: 'endingKeep' },
        { x: 8, y: 10, id: 'endingFree' }, { x: 12, y: 7, id: 'endingReplace' },
        { x: 13, y: 10, id: 'finalArchive' }
    ];
    const realMap = s => s.day === 7 ? day7RealMap(s) : s.day === 6 ? day6RealMap(s) : s.day === 5 ? day5RealMap(s) : s.day === 4 ? day4RealMap(s) : s.day === 3 ? day3RealMap(s) : s.day === 2 ? REAL_2 : kibaMap(REAL, s.flags);
    const rpgMap = s => s.day === 7 ? RPG_7 : s.day === 6 ? RPG_6 : s.day === 5 ? RPG_5 : s.day === 4 ? RPG_4 : s.day === 3 ? RPG_3 : s.day === 2 ? RPG_2 : RPG;
    const realItems = s => s.day === 7 ? REAL_ITEMS_7 : s.day === 6 ? REAL_ITEMS_6 : s.day === 5 ? REAL_ITEMS_5 : s.day === 4 ? REAL_ITEMS_4 : s.day === 3 ? REAL_ITEMS_3 : s.day === 2 ? REAL_ITEMS_2 : [...REAL_ITEMS, ...KIBA_SWITCHES, ...KIBA_HIDEOUTS];
    const rpgItems = s => s.day === 7 ? RPG_ITEMS_7 : s.day === 6 ? RPG_ITEMS_6 : s.day === 5 ? RPG_ITEMS_5 : s.day === 4 ? RPG_ITEMS_4 : s.day === 3 ? RPG_ITEMS_3 : s.day === 2 ? RPG_ITEMS_2 : RPG_ITEMS;
    function initial() {
        return {
            version: VERSION, day: 1, mode: 'real', rx: 2.5, ry: 2.5, dir: 1, px: 1, py: 1,
            note: false, seal: false, tape: false, key: false, mirror: false, call: false, photo: false, echo: false,
            light: true, hidden: false, crouched: false, entityX: 13.5, entityY: 11.5, threat: 0, chase: false,
            encounter: 0, steps: 0, won: false, eventId: 'intro', eventTick: 0,
            scares: [], journal: [], scene: 'intro', flags: {}, pulse: 0, room: 'VESTIBULO', endingStage: 0,
            d2Register: false, d2Bell: false, d2Frequency: false, d2Reflection: false, d2Door: false,
            d3Ticket: false, d3Clock: false, d3Schedule: false, d3Signal: false, d3Booth: false,
            d4File: false, d4Ledger: false, d4Xray: false, d4Fold: false, d4Reel: false,
            d5Sign: false, d5Address: false, d5Plot: false, d5Street: false, d5House: false,
            d6Label: false, d6Index: false, d6Furnace: false, d6Vent: false, d6Negative: false,
            d7Terminal: false, d7Portrait: false, d7Voice: false, d7Name: false, d7Original: false,
            d7Choice: 'none', endingId: 'none'
        };
    }
    function tile(map, x, y) { return map[Math.floor(y)]?.[Math.floor(x)] || '#'; }
    function wall(map, x, y) { return tile(map, x, y) === '#'; }
    function collision(map, x, y, r = .18) { return [[-r, -r], [-r, r], [r, -r], [r, r]].some(([dx, dy]) => wall(map, x + dx, y + dy)); }
    function distance(x1, y1, x2, y2) { return Math.hypot(x2 - x1, y2 - y1); }
    function roomAt(x, y, day = 1) {
        if (day === 7) {
            if (y < 6 && x < 8)
                return 'ARCHIVO DE ORIGEN';
            if (y < 7)
                return 'SALA DE VOCES';
            if (x < 8)
                return 'GALERIA DE IDENTIDADES';
            return 'CAMARA DEL ORIGINAL';
        }
        if (day === 6) {
            if (y < 6 && x < 8)
                return 'RECEPCION DE CENIZAS';
            if (y < 7)
                return 'HORNO CENTRAL';
            if (x < 8)
                return 'GALERIA DE URNAS';
            return 'ARCHIVO NEGATIVO';
        }
        if (day === 5) {
            if (y < 6 && x < 8)
                return 'CALLE DE LOS AUSENTES';
            if (y < 7)
                return 'SOLAR VACIO';
            if (x < 8)
                return 'PARADA SIN AUTOBUSES';
            return 'CASA AUSENTE';
        }
        if (day === 4) {
            if (y < 6 && x < 8)
                return 'ADMISION';
            if (y < 7)
                return 'RADIOLOGIA';
            if (x < 8)
                return 'ARCHIVO DE PACIENTES';
            return 'QUIROFANO CERO';
        }
        if (day === 3) {
            if (y < 6 && x < 8)
                return 'VESTIBULO DE ESTACION';
            if (y < 7)
                return 'PANEL DE SALIDAS';
            if (x < 8)
                return 'ANDEN CERRADO';
            return 'VIA CERO';
        }
        if (day === 2) {
            if (y < 6 && x < 7)
                return 'RECEPCION';
            if (y < 7)
                return 'PASILLO 200';
            if (x < 8)
                return 'DORMITORIOS';
            return 'HABITACION 207';
        }
        if (y < 6 && x < 7)
            return 'VESTIBULO';
        if (y < 7)
            return 'ALA ESTE';
        if (x < 8)
            return 'ALA DE ARCHIVOS';
        return 'SOTANO TECNICO';
    }
    function objective(s) {
        if (s.won) {
            if (s.day === 1)
                return s.endingStage >= 3 ? 'PULSA E PARA ENTRAR EN EL DIA 2' : 'PULSA E PARA CONTINUAR EL EPILOGO';
            if (s.day === 2)
                return s.endingStage >= 3 ? 'PULSA E PARA ENTRAR EN EL DIA 3' : 'PULSA E PARA CONTINUAR EL EPILOGO';
            if (s.day === 3)
                return s.endingStage >= 3 ? 'PULSA E PARA ENTRAR EN EL DIA 4' : 'PULSA E PARA CONTINUAR EL EPILOGO';
            if (s.day === 4)
                return s.endingStage >= 3 ? 'PULSA E PARA ENTRAR EN EL DIA 5' : 'PULSA E PARA CONTINUAR EL EPILOGO';
            if (s.day === 5)
                return s.endingStage >= 3 ? 'PULSA E PARA ENTRAR EN EL DIA 6' : 'PULSA E PARA CONTINUAR EL EPILOGO';
            if (s.day === 6)
                return s.endingStage >= 3 ? 'PULSA E PARA ENTRAR EN EL DIA 7' : 'PULSA E PARA CONTINUAR EL EPILOGO';
            return s.endingStage >= 3 ? 'FIN DE NAMELESS 404 · LA PARTIDA HA TERMINADO' : 'PULSA E PARA CONTINUAR TU FINAL';
        }
        if (s.day === 7) {
            if (!s.d7Terminal)
                return 'REALIDAD: EXAMINA LA TERMINAL DE ORIGEN (4,3)';
            if (!s.d7Portrait)
                return 'RPG: EXAMINA EL RETRATO EN BLANCO (4,4)';
            if (!s.d7Voice)
                return 'REALIDAD: ESCUCHA LA PRUEBA DE VOZ (12,3)';
            if (!s.d7Name)
                return 'RPG: ESCRIBE EL NOMBRE ORIGINAL (11,5)';
            if (!s.d7Original)
                return 'REALIDAD: RECUPERA LA FOTO ORIGINAL (11,10)';
            if (s.d7Choice === 'none')
                return 'RPG: ELIGE EN UN ALTAR GUARDAR, LIBERAR O SUSTITUIR';
            return 'RPG: CRUZA EL ARCHIVO FINAL (13,10) · ELECCION ' + s.d7Choice.toUpperCase();
        }
        if (s.day === 6) {
            if (!s.d6Label)
                return 'REALIDAD: LEE LA ETIQUETA DE CENIZAS (4,3)';
            if (!s.d6Index)
                return 'RPG: CONSULTA EL INDICE DE CENIZAS (4,4)';
            if (!s.d6Furnace)
                return 'REALIDAD: EXAMINA EL HORNO CENTRAL (12,3)';
            if (!s.d6Vent)
                return 'RPG: AJUSTA LA RUEDA TERMICA (11,5)';
            if (!s.d6Negative)
                return 'REALIDAD: RECUPERA EL NEGATIVO (11,10)';
            return 'RPG: ATRAVIESA EL NUCLEO DEL ARCHIVO (13,10)';
        }
        if (s.day === 5) {
            if (!s.d5Sign)
                return 'REALIDAD: LEE LA PLACA DE LA CALLE (4,3)';
            if (!s.d5Address)
                return 'RPG: CONSULTA EL LIBRO DE DIRECCIONES (4,4)';
            if (!s.d5Plot)
                return 'REALIDAD: INVESTIGA EL SOLAR VACIO (12,3)';
            if (!s.d5Street)
                return 'RPG: RECUERDA LA CALLE BORRADA (11,5)';
            if (!s.d5House)
                return 'REALIDAD: ENTRA EN LA CASA AUSENTE (11,10)';
            return 'RPG: CRUZA LA CASA SIN NUMERO (13,10)';
        }
        if (s.day === 4) {
            if (!s.d4File)
                return 'REALIDAD: LEE EL EXPEDIENTE EN ADMISION (4,3)';
            if (!s.d4Ledger)
                return 'RPG: ABRE EL LIBRO DE TINTA (4,4)';
            if (!s.d4Xray)
                return 'REALIDAD: EXAMINA LAS RADIOGRAFIAS (12,3)';
            if (!s.d4Fold)
                return 'RPG: DESPLIEGA EL PLANO DE SALAS (11,5)';
            if (!s.d4Reel)
                return 'REALIDAD: ESCUCHA LA BOBINA DEL QUIROFANO (11,10)';
            return 'RPG: ENTRA EN LA CAMA CERO (13,10)';
        }
        if (s.day === 3) {
            if (!s.d3Ticket)
                return 'REALIDAD: RECOGE EL BILLETE SIN DESTINO (4,2)';
            if (!s.d3Clock)
                return 'RPG: AJUSTA EL RELOJ INVERTIDO (3,4)';
            if (!s.d3Schedule)
                return 'REALIDAD: CONSULTA EL PANEL DE SALIDAS (12,4)';
            if (!s.d3Signal)
                return 'RPG: CAMBIA LA SENAL DE LAS VIAS (10,6)';
            if (!s.d3Booth)
                return 'REALIDAD: ENTRA EN LA CABINA DE CONTROL (10,10)';
            return 'RPG: ALCANZA EL ANDEN CERO (13,10)';
        }
        if (s.day === 2) {
            if (!s.d2Register)
                return 'REALIDAD: REVISA EL REGISTRO DE RECEPCION (3,3)';
            if (!s.d2Bell)
                return 'RPG: TOCA LA CAMPANA DEL PUEBLO (4,3)';
            if (!s.d2Frequency)
                return 'REALIDAD: ESCUCHA EL INTERFONO (12,3)';
            if (!s.d2Reflection)
                return 'RPG: CONSULTA EL ESPEJO DE AGUA (11,4)';
            if (!s.d2Door)
                return 'REALIDAD: ABRE LA HABITACION 207 (11,9)';
            return 'RPG: ENTRA EN LA PUERTA QUE NO EXISTIA (13,10)';
        }
        if (!s.note)
            return 'EN EL RPG: BUSCA LA NOTA CERCA DE 4,3';
        if (!s.seal)
            return 'EN EL RPG: ROMPE EL SELLO ROJO EN 9,8';
        if (!s.photo)
            return 'EN LA REALIDAD: BUSCA UNA FOTO EN EL ALA ESTE, 13,2';
        if (!s.echo)
            return 'EN EL RPG: EXAMINA EL POZO EN 10,4';
        if (!s.tape)
            return 'EN EL SOTANO: REPRODUCE LA CINTA EN 10,9';
        if (!s.key)
            return 'EN EL ALA DE ARCHIVOS: ABRE EL ARMARIO EN 3,9';
        const stage = s.flags?.kibaFinaleStage || 0;
        if (stage === 1 || stage === 2)
            return FINALE_OBJECTIVES[stage];
        if (stage === 3)
            return 'HUIDA COMPLETADA · EN EL RPG: CRUZA EL UMBRAL EN 13,10';
        return 'EN EL RPG: CRUZA EL UMBRAL EN 13,10';
    }
    function bfs(map, sx, sy, gx, gy) {
        let start = [Math.floor(sx), Math.floor(sy)], goal = [Math.floor(gx), Math.floor(gy)];
        const q = [start], seen = new Set([start.join(',')]), parents = new Map();
        for (let i = 0; i < q.length; i++) {
            let [x, y] = q[i], key = x + ',' + y;
            if (x === goal[0] && y === goal[1]) {
                let path = [[x, y]];
                while (parents.has(key)) {
                    key = parents.get(key);
                    path.push(key.split(',').map(Number));
                }
                return path.reverse();
            }
            for (let [dx, dy] of DIRS) {
                let nx = x + dx, ny = y + dy, k = nx + ',' + ny;
                if (!seen.has(k) && !wall(map, nx, ny)) {
                    seen.add(k);
                    parents.set(k, key);
                    q.push([nx, ny]);
                }
            }
        }
        return [];
    }
    function normalize(v) {
        if (!v || typeof v !== 'object' || ![4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, VERSION].includes(v.version))
            return null;
        const z = initial();
        for (let k of Object.keys(z))
            if (k in v)
                z[k] = v[k];
        z.version = VERSION; // migracion validada desde v0.4; nuevos enigmas sin completar
        if (!['real', 'rpg'].includes(z.mode) || ![z.rx, z.ry, z.entityX, z.entityY].every(Number.isFinite) ||
            !Number.isInteger(z.px) || !Number.isInteger(z.py) || !Number.isInteger(z.dir) || z.dir < 0 || z.dir > 3 ||
            ![1, 2, 3, 4, 5, 6, 7].includes(z.day) || collision(realMap(z), z.rx, z.ry) || wall(rpgMap(z), z.px, z.py) || collision(realMap(z), z.entityX, z.entityY) ||
            typeof z.flags !== 'object' || !z.flags || Array.isArray(z.flags) || !Array.isArray(z.journal) || !Array.isArray(z.scares))
            return null;
        for (let k of ['note', 'seal', 'tape', 'key', 'mirror', 'call', 'light', 'hidden', 'crouched', 'chase', 'won', 'photo', 'echo', 'd2Register', 'd2Bell', 'd2Frequency', 'd2Reflection', 'd2Door', 'd3Ticket', 'd3Clock', 'd3Schedule', 'd3Signal', 'd3Booth', 'd4File', 'd4Ledger', 'd4Xray', 'd4Fold', 'd4Reel', 'd5Sign', 'd5Address', 'd5Plot', 'd5Street', 'd5House', 'd6Label', 'd6Index', 'd6Furnace', 'd6Vent', 'd6Negative', 'd7Terminal', 'd7Portrait', 'd7Voice', 'd7Name', 'd7Original'])
            if (typeof z[k] !== 'boolean')
                return null;
        if (!['none', 'keep', 'free', 'replace'].includes(z.d7Choice) ||
            !['none', 'keep', 'free', 'replace'].includes(z.endingId))
            return null;
        if (z.day === 7 && z.won && (!z.d7Original || z.endingId === 'none'))
            return null;
        z.threat = Math.min(100, Math.max(0, Number(z.threat) || 0));
        z.encounter = Math.min(999, Math.max(0, Number(z.encounter) || 0));
        z.steps = Math.min(999999, Math.max(0, Number(z.steps) || 0));
        z.journal = z.journal.filter(x => typeof x === 'string').slice(-30).map(x => x.slice(0, 240));
        z.scares = z.scares.filter(x => typeof x === 'string').slice(-30);
        z.endingStage = Number.isInteger(z.endingStage) ? Math.min(3, Math.max(0, z.endingStage)) : 0;
        if (z.flags.kibaWitness !== undefined && typeof z.flags.kibaWitness !== 'boolean')
            delete z.flags.kibaWitness;
        for (const key of ['kibaEvidence', 'kibaChaseBeats']) {
            const allowed = key === 'kibaEvidence' ? ['lobby', 'glass', 'archives', 'basement'] : ['first-step', 'crossing', 'escaped'];
            if (z.flags[key] !== undefined) {
                z.flags[key] = Array.isArray(z.flags[key]) ? Array.from(new Set(z.flags[key].filter(v => allowed.includes(v)))).slice(0, allowed.length) : [];
            }
        }
        // El sigilo del Día 1 es opcional. Guardados v0.17 reciben valores por defecto.
        if (z.day !== 1)
            z.crouched = false;
        if (z.flags.kibaDecoysUsed !== undefined) {
            const n = z.flags.kibaDecoysUsed;
            z.flags.kibaDecoysUsed = Number.isInteger(n) ? Math.max(0, Math.min(2, n)) : 0;
        }
        if (z.flags.kibaDecoyStep !== undefined && (!Number.isInteger(z.flags.kibaDecoyStep) || z.flags.kibaDecoyStep < 0 || z.flags.kibaDecoyStep > z.steps))
            delete z.flags.kibaDecoyStep;
        if (z.flags.kibaDecoy && !validNoiseMarker(z.flags.kibaDecoy, realMap(z), z.steps))
            delete z.flags.kibaDecoy;
        if (z.day !== 1) {
            delete z.flags.kibaDecoy;
            delete z.flags.kibaDecoyStep;
            delete z.flags.kibaDecoysUsed;
        }
        for (const key of ['kibaNorthOpen', 'kibaArchiveOpen', 'kibaVentUsed']) {
            if (z.flags[key] !== undefined && typeof z.flags[key] !== 'boolean')
                delete z.flags[key];
        }
        if (z.flags.kibaNorthOpen === true && !z.seal)
            z.flags.kibaNorthOpen = false;
        if (z.flags.kibaArchiveOpen === true && !z.tape)
            z.flags.kibaArchiveOpen = false;
        if (z.flags.kibaHideSpot !== undefined && !isValidHideSpot(z.flags.kibaHideSpot))
            delete z.flags.kibaHideSpot;
        if (z.flags.kibaHideAlert !== undefined && typeof z.flags.kibaHideAlert !== 'boolean')
            delete z.flags.kibaHideAlert;
        if (!z.hidden || z.day !== 1) {
            delete z.flags.kibaHideSpot;
            delete z.flags.kibaHideAlert;
        }
        if (z.flags.kibaHideSpot && !KIBA_HIDEOUTS.some(f => f.id === z.flags.kibaHideSpot && distance(f.x, f.y, z.rx, z.ry) <= f.r)) {
            delete z.flags.kibaHideSpot;
            delete z.flags.kibaHideAlert;
            z.hidden = false;
        }
        if (z.day !== 1) {
            for (const key of ['kibaNorthOpen', 'kibaArchiveOpen', 'kibaVentUsed'])
                delete z.flags[key];
        }
        if (z.flags.copyistMemory) {
            const m = z.flags.copyistMemory;
            if (!m || !Number.isFinite(m.x) || !Number.isFinite(m.y) || !Number.isInteger(m.lastSeenStep) || !['hunt', 'investigate', 'search'].includes(m.phase) || wall(realMap(z), m.x, m.y))
                delete z.flags.copyistMemory;
        }
        sanitizeFinale(z.flags, z.day, z.key, z.tape, z.steps);
        z.room = roomAt(z.rx, z.ry, z.day);
        return z;
    }
    function newGame() {
        let s = initial(), queue = [];
        function signal(kind, message, title = '') { queue.push({ kind, message, title }); if (kind === 'journal')
            s.journal.push(message); }
        function events() { return queue.splice(0); }
        function setScene(id, title, message, duration = 85) { s.scene = id; s.eventId = id; s.eventTick = duration; signal('scene', message, title); }
        function mark(id, title, message) { if (s.scares.includes(id))
            return; s.scares.push(id); setScene(id, title, message); }
        function evidenceFound() {
            if (!Array.isArray(s.flags.kibaEvidence))
                s.flags.kibaEvidence = [];
            return s.flags.kibaEvidence;
        }
        function checkFinaleProgress() {
            if (s.day !== 1 || s.mode !== 'real' || s.hidden || s.won)
                return;
            const stage = s.flags.kibaFinaleStage || 0;
            if (!atFinaleTarget(stage, s.rx, s.ry))
                return;
            if (stage === 1) {
                s.flags.kibaFinaleStage = 2;
                setScene('finale-crossing', 'LOS NOMBRES BAJO EL SUELO', 'Al llegar al archivo, la cinta pronuncia tu nombre desde debajo de la rejilla. Hay una salida en el vestíbulo. No te detengas.', 125);
                signal('journal', 'Huida: he alcanzado los archivos. La puerta de salida está en el vestíbulo.');
                signal('sound', 'finaleCrossing');
            }
            else if (stage === 2) {
                s.flags.kibaFinaleStage = 3;
                s.flags.kibaFinaleDone = true;
                delete s.flags.kibaFinaleStartedAt;
                s.chase = false;
                s.threat = 0;
                setScene('finale-escape', 'LA PUERTA TENÍA TU NOMBRE', 'La entrada se abre antes de que la toques. Fuera no hay calle: solo la luz de la segunda pantalla. Vuelves al cartucho con el corazón todavía golpeando.', 180);
                signal('journal', 'Sobreviví a la huida final de Kiba. Una puerta real me condujo hasta el RPG.');
                signal('sound', 'finaleEscape');
            }
        }
        function checkChaseBeat() {
            if (s.day !== 1 || s.mode !== 'real' || s.won)
                return;
            const done = Array.isArray(s.flags.kibaChaseBeats) ? s.flags.kibaChaseBeats : [];
            const beat = nextChaseBeat({ chase: s.chase, tape: s.tape, steps: s.steps, room: s.room,
                hidden: s.hidden, threat: s.threat, phase: s.flags.copyistMemory?.phase, already: done });
            if (!beat)
                return;
            s.flags.kibaChaseBeats = [...done, beat];
            const story = CHASE_BEATS[beat];
            mark('kiba-chase-' + beat, story.title, story.message);
            signal('sound', story.cue);
        }
        function encounter() {
            if (s.day === 1 && (s.flags.kibaFinaleStage === 1 || s.flags.kibaFinaleStage === 2)) {
                s.flags.kibaFinaleStage = 0;
                delete s.flags.kibaFinaleStartedAt;
                s.flags.kibaFinaleFailures = Math.min(99, (s.flags.kibaFinaleFailures || 0) + 1);
                signal('journal', 'La huida se interrumpió: La Copista me encontró. Puedo volver a la cinta 04 para intentarlo otra vez.');
                signal('sound', 'finaleFail');
            }
            s.rx = 2.5;
            s.ry = 2.5;
            s.dir = 1;
            s.hidden = false;
            s.room = roomAt(s.rx, s.ry, s.day);
            s.entityX = 13.5;
            s.entityY = 11.5;
            s.threat = 23;
            s.encounter++;
            delete s.flags.copyistMemory;
            delete s.flags.kibaDecoy;
            delete s.flags.kibaHideSpot;
            delete s.flags.kibaHideAlert;
            s.crouched = false;
            mark('caught-' + s.encounter, 'NO DEBERÍAS ESTAR AQUÍ', 'La Copista ha copiado tu último movimiento. Despiertas al principio del pasillo.');
            signal('sound', 'caught');
        }
        // Solo Día 1 usa percepción limitada; Días 2–7 preservan su IA anterior.
        function lineOfSight(x1, y1, x2, y2) {
            const length = distance(x1, y1, x2, y2), count = Math.ceil(length / .12);
            for (let i = 1; i < count; i++) {
                const t = i / count;
                if (wall(realMap(s), x1 + (x2 - x1) * t, y1 + (y2 - y1) * t))
                    return false;
            }
            return true;
        }
        function entityStep() {
            if (!s.chase || s.won || s.mode !== 'real')
                return;
            if (s.day === 1) {
                const d = distance(s.rx, s.ry, s.entityX, s.entityY);
                if (d < .8 && !s.hidden) {
                    encounter();
                    return;
                }
                const memory = s.flags.copyistMemory;
                if (s.hidden && isValidHideSpot(s.flags.kibaHideSpot) &&
                    hideMayBeFound(d, Boolean(s.flags.kibaHideAlert), memory?.phase ?? 'search')) {
                    delete s.flags.kibaHideSpot;
                    delete s.flags.kibaHideAlert;
                    encounter();
                    mark('kiba-hide-breached', 'EL ESCONDITE NO ERA SEGURO', 'La Copista abre la puerta: aún escucha el eco de tu respiración.');
                    return;
                }
                const decision = decideCopyist({ playerX: s.rx, playerY: s.ry, entityX: s.entityX, entityY: s.entityY,
                    light: s.light, hidden: s.hidden, steps: s.steps,
                    sneaking: s.crouched, noiseLevel: footstepNoise(s.rx, s.ry, s.crouched),
                    decoy: s.flags.kibaDecoy && s.steps - s.flags.kibaDecoy.atStep <= 10 ? s.flags.kibaDecoy : null,
                    visible: lineOfSight(s.entityX, s.entityY, s.rx, s.ry), memory });
                s.flags.copyistMemory = decision.memory;
                s.threat = Math.max(0, Math.min(100, s.threat + (s.hidden ? -14 : decision.threatDelta)));
                const goalD = distance(s.entityX, s.entityY, decision.goalX, decision.goalY);
                if (goalD > .23) {
                    const path = bfs(realMap(s), s.entityX, s.entityY, decision.goalX, decision.goalY);
                    if (path.length > 1) {
                        const [gx, gy] = path[1], dx = gx + .5 - s.entityX, dy = gy + .5 - s.entityY, len = Math.hypot(dx, dy);
                        if (len > .005) {
                            const finale = s.flags.kibaFinaleStage === 2;
                            const amount = Math.min(len, finale ? Math.min(.40, decision.speed * 1.10) : decision.speed);
                            const nx = s.entityX + dx / len * amount, ny = s.entityY + dy / len * amount;
                            if (!collision(realMap(s), nx, ny)) {
                                s.entityX = nx;
                                s.entityY = ny;
                            }
                        }
                    }
                }
                if (distance(s.rx, s.ry, s.entityX, s.entityY) < .8 && !s.hidden)
                    encounter();
                if (decision.phase === 'search' && s.steps % 9 === 0 && s.threat > 28)
                    mark('copyist-lost', 'SE HA DETENIDO', 'La Copista gira hacia el lugar donde te vio por última vez. No sabe en qué habitación estás.');
                return;
            }
            if (s.hidden) {
                s.threat = Math.max(0, s.threat - 16);
                return;
            }
            const d = distance(s.rx, s.ry, s.entityX, s.entityY);
            if (d < .8) {
                encounter();
                return;
            }
            if (d < 11) {
                s.threat = Math.min(100, s.threat + Math.max(4, 14 - d));
                const path = bfs(realMap(s), s.entityX, s.entityY, s.rx, s.ry);
                if (path.length > 1) {
                    let target = path[1], xx = target[0] + .5, yy = target[1] + .5, dx = xx - s.entityX, dy = yy - s.entityY, l = Math.hypot(dx, dy);
                    const speed = .31;
                    if (l > .005) {
                        let nx = s.entityX + dx / l * Math.min(l, speed), ny = s.entityY + dy / l * Math.min(l, speed);
                        if (!collision(realMap(s), nx, ny)) {
                            s.entityX = nx;
                            s.entityY = ny;
                        }
                    }
                }
            }
            else
                s.threat = Math.max(0, s.threat - 3);
            if (s.threat >= 66 && s.steps % 5 === 0)
                mark('whisper', '¿TE HAS FIJADO EN LA PARED?', 'La figura repite tus pasos un instante después. No todos tus recuerdos son tuyos.');
        }
        function move(k) {
            if (s.won)
                return false;
            if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(k))
                return false;
            if (s.mode === 'rpg') {
                const moves = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
                const [dx, dy] = moves[k], nx = s.px + dx, ny = s.py + dy;
                if (wall(rpgMap(s), nx, ny)) {
                    signal('sound', 'bump');
                    return false;
                }
                s.px = nx;
                s.py = ny;
                s.steps++;
                signal('sound', 'stepRpg');
                if (s.day === 7 && s.px === 13 && s.py === 10 && s.d7Original) {
                    if (s.d7Choice === 'none')
                        signal('message', 'La última puerta no acepta el silencio. Escoge antes uno de los tres altares.');
                    else {
                        s.won = true;
                        s.endingStage = 0;
                        s.chase = false;
                        s.endingId = s.d7Choice;
                        const finale = { keep: ['EL ARCHIVO PERMANECE', 'Los nombres de los olvidados recuperan sus dueños. Sus copias también recuerdan. Nadie puede volver a ser exactamente quien era.'], free: ['LA ULTIMA COPIA', 'La memoria robada regresa a la realidad. Tú la liberas y pierdes todos los recuerdos que te trajeron hasta aquí.'], replace: ['EL NUEVO ESCRIBA', 'Te conviertes en el guardián del archivo. Nao sale por primera vez al amanecer, pero una silla sigue ocupada en la pantalla.'] }[s.endingId];
                        setScene('ending7', finale[0], finale[1] + ' Pulsa E para continuar.', 99999);
                        signal('sound', 'ending');
                        signal('journal', 'FINAL: ' + s.endingId.toUpperCase() + ' — ' + finale[1]);
                    }
                }
                if (s.day === 6 && s.px === 13 && s.py === 10 && s.d6Negative && s.d6Vent) {
                    s.won = true;
                    s.endingStage = 0;
                    s.chase = false;
                    setScene('ending6', 'FIN DEL DIA 6', 'El depósito no contiene restos humanos. Contiene el tiempo que alguien ha borrado de sus vidas. Pulsa E para continuar.', 99999);
                    signal('sound', 'ending');
                }
                if (s.day === 5 && s.px === 13 && s.py === 10 && s.d5House && s.d5Street) {
                    s.won = true;
                    s.endingStage = 0;
                    s.chase = false;
                    setScene('ending5', 'FIN DEL DIA 5', 'La puerta conserva tu dirección. Dentro, alguien vive los recuerdos que has perdido. Pulsa E para continuar.', 99999);
                    signal('sound', 'ending');
                }
                if (s.day === 4 && s.px === 13 && s.py === 10 && s.d4Reel && s.d4Fold) {
                    s.won = true;
                    s.endingStage = 0;
                    s.chase = false;
                    setScene('ending4', 'FIN DEL DIA 4', 'En la cama 0 hay un cuerpo recortado a tu medida. El papel de la sábana empieza a respirar. Pulsa E para continuar.', 99999);
                    signal('sound', 'ending');
                }
                if (s.day === 3 && s.px === 13 && s.py === 10 && s.d3Booth && s.d3Signal) {
                    s.won = true;
                    s.endingStage = 0;
                    s.chase = false;
                    setScene('ending3', 'FIN DEL DIA 3', 'El último tren llega vacío. En cada asiento hay un billete con tu nombre. Pulsa E para continuar.', 99999);
                    signal('sound', 'ending');
                }
                if (s.day === 2 && s.px === 13 && s.py === 10 && s.d2Door && s.d2Reflection) {
                    s.won = true;
                    s.endingStage = 0;
                    s.chase = false;
                    setScene('ending2', 'FIN DEL DIA 2', 'La habitacion 207 se enciende en el cartucho. Donde deberia estar Nao, ahora esta tu cama.', 99999);
                    signal('sound', 'ending');
                }
                if (s.day === 1 && s.px === 13 && s.py === 10 && s.key && s.echo) {
                    s.won = true;
                    s.endingStage = 0;
                    setScene('ending', 'FIN DEL DIA 1', 'La pantalla escribe tu nombre sin que lo hayas tecleado. Pulsa E para continuar.', 99999);
                    signal('sound', 'ending');
                }
            }
            else {
                if (k === 'ArrowLeft') {
                    s.dir = (s.dir + 3) % 4;
                    s.rx = Math.floor(s.rx) + .5;
                    s.ry = Math.floor(s.ry) + .5;
                    signal('sound', 'turn');
                }
                else if (k === 'ArrowRight') {
                    s.dir = (s.dir + 1) % 4;
                    s.rx = Math.floor(s.rx) + .5;
                    s.ry = Math.floor(s.ry) + .5;
                    signal('sound', 'turn');
                }
                else {
                    const [dx, dy] = DIRS[s.dir], m = k === 'ArrowUp' ? 1 : -1, nx = s.rx + dx * m * (s.day === 1 && s.crouched ? .27 : .47), ny = s.ry + dy * m * (s.day === 1 && s.crouched ? .27 : .47);
                    if (collision(realMap(s), nx, ny)) {
                        signal('sound', 'bump');
                        return false;
                    }
                    s.rx = nx;
                    s.ry = ny;
                    s.steps++;
                    s.hidden = false;
                    delete s.flags.kibaHideSpot;
                    delete s.flags.kibaHideAlert;
                    if (s.day === 1) {
                        const surface = floorSurface(s.rx, s.ry);
                        signal('sound', s.crouched ? 'stepQuiet' : surface === 'metal' ? 'stepMetal' : 'stepReal');
                        if (s.chase && surface === 'metal' && !s.crouched && s.steps % 5 === 0)
                            mark('kiba-metal', 'EL SUELO TE DELATA', 'Las rejillas vibran bajo tus pies. El sonido recorre los conductos y algo cambia de dirección.');
                    }
                    else
                        signal('sound', 'stepReal');
                    const nextRoom = roomAt(s.rx, s.ry, s.day);
                    if (s.room !== nextRoom) {
                        s.room = nextRoom;
                        signal('message', 'Has entrado en ' + nextRoom.toLowerCase() + '.');
                        signal('sound', 'room');
                    }
                    if (s.day === 1 && s.room === 'SOTANO TECNICO' && s.steps > 9)
                        mark('basement', 'EN EL CONDUCTO', 'Algo golpea las tuberias desde dentro. Suena como una voz pronunciando silabas al reves.');
                    if (s.day === 1 && s.room === 'ALA ESTE' && s.steps > 4 && !s.photo)
                        mark('window', 'EL OTRO LADO DEL CRISTAL', 'Una silueta observa desde el exterior. Estas en la cuarta planta. No hay balcon.');
                    if (s.day === 2 && s.d2Frequency && s.steps % 4 === 0)
                        mark('breath', 'LA PARED RESPIRA', 'Al otro lado del tabique escuchas una respiracion. Cesa cuando dejas de caminar.');
                    if (s.day === 7 && s.d7Voice && s.steps % 6 === 0)
                        mark('d7double', 'TU VOZ LLEGA ANTES', 'Escuchas tu respuesta antes de formular la pregunta. Dos respiraciones caben en una sola garganta.');
                    if (s.day === 6 && s.d6Furnace && s.steps % 5 === 0)
                        mark('d6hiss', 'CENIZA DETRAS DEL VIDRIO', 'El polvo se adhiere a una ventana desde el lado donde no existe aire. Una figura repasa las palabras con un dedo.');
                    if (s.day === 5 && s.d5Plot && s.steps % 5 === 0)
                        mark('d5silence', 'NO QUEDA NADIE EN ESTA CALLE', 'Las ventanas se encienden una a una. Ninguna casa tiene fachada.');
                    if (s.day === 4 && s.d4Xray && s.steps % 6 === 0)
                        mark('d4seam', 'HAY UNA COSTURA EN LA PARED', 'La pared se dobla hacia dentro como una hoja de papel. Al otro lado, alguien pasa página.');
                    if (s.day === 3 && s.d3Schedule && s.steps > 8 && s.steps % 6 === 0)
                        mark('train', 'EL TREN DE LAS 00:00', 'Se abre una puerta sobre las vías. Del otro lado no hay vagón: hay un pasillo de tu casa.');
                    entityStep();
                    if (s.chase && s.steps % 3 === 0)
                        entityStep();
                    checkFinaleProgress();
                    checkChaseBeat();
                    if (s.day === 1 && !s.mirror && s.steps > 6)
                        mark('behind', 'ALGUIEN CAMINA CONTIGO', 'Una segunda hilera de pasos suena detrás de ti. Al girarte no hay nadie.');
                    if (s.day === 1 && s.steps >= 5 && s.room === 'VESTIBULO')
                        mark('premium-lobby', 'EL EDIFICIO RESPONDE', 'La luz del vestíbulo se apaga detrás de ti, una lámpara tras otra. Al fondo, la puerta de entrada ya no tiene pomo.');
                    if (s.day === 1 && s.photo && s.room === 'ALA DE ARCHIVOS')
                        mark('premium-archives', 'EL RETRATO EN LA PARED', 'Alguien ha clavado una fotografía nueva en el tablón. Apareces de espaldas, mirando exactamente este pasillo.');
                    if (s.day === 1 && s.tape && s.room === 'ALA ESTE' && s.steps % 7 === 0)
                        mark('premium-east', 'UNA PERSONA EN LA VENTANA', 'A través del vidrio se ve el vestíbulo desde fuera. Dentro hay una mujer inmóvil. El lugar donde debería estar su cara es un recorte blanco.');
                }
            }
            return true;
        }
        function startDay2() {
            s.day = 2;
            s.mode = 'real';
            s.rx = 2.5;
            s.ry = 2.5;
            s.dir = 1;
            s.px = 1;
            s.py = 1;
            s.chase = false;
            s.hidden = false;
            s.crouched = false;
            s.threat = 0;
            s.entityX = 13.5;
            s.entityY = 11.5;
            s.won = false;
            s.endingStage = 0;
            s.room = roomAt(s.rx, s.ry, 2);
            s.d2Register = false;
            s.d2Bell = false;
            s.d2Frequency = false;
            s.d2Reflection = false;
            s.d2Door = false;
            setScene('day2', 'DIA 2 — LA VOZ DETRAS DEL MURO', 'Nao dejo tu nombre en el registro de la residencia. Pero el edificio fue demolido hace trece anos.', 145);
            signal('journal', 'Dia 2. Residencia Kiba: en los planos solo existe una planta. El ascensor marca dos.');
            signal('sound', 'swap');
        }
        function startDay3() {
            s.day = 3;
            s.mode = 'real';
            s.rx = 2.5;
            s.ry = 2.5;
            s.dir = 1;
            s.px = 1;
            s.py = 1;
            s.chase = false;
            s.hidden = false;
            s.crouched = false;
            s.threat = 0;
            s.entityX = 13.5;
            s.entityY = 11.5;
            s.won = false;
            s.endingStage = 0;
            s.room = roomAt(s.rx, s.ry, 3);
            s.d3Ticket = false;
            s.d3Clock = false;
            s.d3Schedule = false;
            s.d3Signal = false;
            s.d3Booth = false;
            setScene('day3', 'DIA 3 — LA ESTACION SIN SALIDAS', 'La última línea del registro conduce a una estación cerrada. Los trenes siguen llegando, pero ningún plano recuerda sus vías.', 155);
            signal('journal', 'Día 3. Estación Hatsune: todos los relojes marcan horas diferentes. El mío se ha detenido ayer.');
            signal('sound', 'train');
        }
        function startDay4() {
            s.day = 4;
            s.mode = 'real';
            s.rx = 2.5;
            s.ry = 2.5;
            s.dir = 1;
            s.px = 1;
            s.py = 1;
            s.chase = false;
            s.hidden = false;
            s.crouched = false;
            s.threat = 0;
            s.entityX = 13.5;
            s.entityY = 11.5;
            s.won = false;
            s.endingStage = 0;
            s.room = roomAt(s.rx, s.ry, 4);
            s.d4File = false;
            s.d4Ledger = false;
            s.d4Xray = false;
            s.d4Fold = false;
            s.d4Reel = false;
            setScene('day4', 'DIA 4 — EL HOSPITAL DE PAPEL', 'El tren deja una hoja en tu bolsillo: un alta hospitalaria con la fecha de mañana. Nadie recuerda que el sanatorio haya existido.', 160);
            signal('journal', 'Día 4. Sanatorio de Papel. El registro de pacientes está escrito por el reverso de las hojas.');
            signal('sound', 'hospital');
        }
        function startDay5() {
            s.day = 5;
            s.mode = 'real';
            s.rx = 2.5;
            s.ry = 2.5;
            s.dir = 1;
            s.px = 1;
            s.py = 1;
            s.chase = false;
            s.hidden = false;
            s.crouched = false;
            s.threat = 0;
            s.entityX = 13.5;
            s.entityY = 11.5;
            s.won = false;
            s.endingStage = 0;
            s.room = roomAt(s.rx, s.ry, 5);
            s.d5Sign = false;
            s.d5Address = false;
            s.d5Plot = false;
            s.d5Street = false;
            s.d5House = false;
            setScene('day5', 'DIA 5 — LA CASA QUE FALTA', 'Al salir del hospital, el barrio termina donde debería empezar tu calle. El solar vacío tiene la dirección de tu infancia.', 160);
            signal('journal', 'Día 5. Calle de los Ausentes. Hay números de portal, pero nadie recuerda las casas.');
            signal('sound', 'room');
        }
        function startDay6() {
            s.day = 6;
            s.mode = 'real';
            s.rx = 2.5;
            s.ry = 2.5;
            s.dir = 1;
            s.px = 1;
            s.py = 1;
            s.chase = false;
            s.hidden = false;
            s.crouched = false;
            s.threat = 0;
            s.entityX = 13.5;
            s.entityY = 4.5;
            s.won = false;
            s.endingStage = 0;
            s.room = roomAt(s.rx, s.ry, 6);
            s.d6Label = false;
            s.d6Index = false;
            s.d6Furnace = false;
            s.d6Vent = false;
            s.d6Negative = false;
            setScene('day6', 'DIA 6 — EL DEPOSITO DE CENIZAS', 'La casa borrada tenía un sótano industrial. Allí se quemaban copias de vidas antes de que llegaran a existir.', 170);
            signal('journal', 'Día 6. Depósito de cenizas. Las urnas no tienen nombres: cada una guarda una hora que alguien dejó de vivir.');
            signal('sound', 'furnace');
        }
        function startDay7() {
            s.day = 7;
            s.mode = 'real';
            s.rx = 2.5;
            s.ry = 2.5;
            s.dir = 1;
            s.px = 1;
            s.py = 1;
            s.chase = false;
            s.hidden = false;
            s.crouched = false;
            s.threat = 0;
            s.entityX = 13.5;
            s.entityY = 4.5;
            s.won = false;
            s.endingStage = 0;
            s.room = roomAt(s.rx, s.ry, 7);
            s.d7Terminal = false;
            s.d7Portrait = false;
            s.d7Voice = false;
            s.d7Name = false;
            s.d7Original = false;
            s.d7Choice = 'none';
            s.endingId = 'none';
            setScene('day7', 'DIA 7 — EL NOMBRE ORIGINAL', 'En la cámara de origen hay dos registros con tu nombre. Nao dejó una advertencia: destruir el archivo también destruye algo que todavía vive.', 175);
            signal('journal', 'Día 7. Cámara de origen. Los errores de la Copista tienen nombres y familias. No todos pueden volver sin consecuencias.');
            signal('sound', 'heartbeat');
        }
        function interactDay7() {
            if (s.mode === 'rpg') {
                const near = (x, y) => Math.abs(s.px - x) + Math.abs(s.py - y) <= 1;
                if (near(4, 4)) {
                    if (!s.d7Terminal)
                        signal('message', 'El retrato aún no tiene marco. Consulta primero la terminal de origen.');
                    else if (!s.d7Portrait) {
                        s.d7Portrait = true;
                        signal('journal', 'El retrato en blanco tiene una sombra infantil: Nao registró la primera copia para salvar a alguien del olvido.');
                        setScene('d7portrait', 'UN ROSTRO AL REVES', 'El retrato muestra una infancia que recuerdas, pero que no pudiste vivir. Alguien te escucha por un micrófono de la sala real.');
                        signal('sound', 'paper');
                    }
                    else
                        signal('message', 'Tu cara tarda un instante en aparecer cada vez que apartas la vista.');
                }
                else if (near(11, 5)) {
                    if (!s.d7Voice)
                        signal('message', 'El nombre está en silencio. Falta una prueba de voz del otro lado de la pantalla.');
                    else if (!s.d7Name) {
                        s.d7Name = true;
                        s.chase = false;
                        s.threat = 0;
                        signal('journal', 'El nombre original no es una persona: es el derecho a conservar una vida sin convertirla en archivo. Se abrió la cámara real.');
                        setScene('d7name', 'EL NOMBRE QUE NO SE ESCRIBE', 'Las letras desaparecen. En el edificio real, una puerta aparece donde no había nada. La Copista deja de perseguirte.');
                        signal('sound', 'fold');
                    }
                    else
                        signal('message', 'Lo que escribiste ya no tiene letras. Solo permanece una decisión.');
                }
                else if (near(2, 10)) {
                    chooseEnding('keep', 'CONSERVAR EL ARCHIVO', 'Si guardas el archivo, los olvidados recuperarán sus recuerdos, pero las copias seguirán viviendo. Ninguna vida puede deshacerse sin dejar otra rota.');
                }
                else if (near(8, 10)) {
                    chooseEnding('free', 'ABRIR LAS PUERTAS', 'Si liberas todos los recuerdos, los nombres regresarán. El precio es tu propia memoria: olvidarás incluso por qué entraste aquí.');
                }
                else if (near(12, 7)) {
                    chooseEnding('replace', 'OCUPAR SU LUGAR', 'Si ocupas el puesto de La Copista, Nao podrá salir. Tendrás que vigilar los recuerdos de todos, sin que nadie vuelva a recordar tu nombre.');
                }
                else if (near(5, 9))
                    signal('message', 'NAO: «La Copista quería guardar a quienes habían sido borrados. Pero confundió recordar con poseer».');
                else if (near(13, 10))
                    signal('message', s.d7Choice === 'none' ? 'La puerta exige que elijas uno de los tres altares.' : `Tu elección es ${s.d7Choice.toUpperCase()}. Pisa la casilla final para terminar.`);
                else
                    signal('message', 'En cada casilla hay un nombre distinto. Ninguno parece inventado.');
            }
            else {
                const close = (x, y, r) => distance(s.rx, s.ry, x, y) < r;
                if (close(4.5, 3.5, 1.35)) {
                    if (!s.d7Terminal) {
                        s.d7Terminal = true;
                        signal('journal', 'La terminal contiene la declaración de Nao: «Quise impedir que un recuerdo muriera. Empecé a copiar vidas enteras».');
                        setScene('d7terminal', 'ARCHIVO DE PERSONAS', 'La pantalla muestra una carta de Nao dirigida a ti. Ella no creó la maldición para matar: la creó para recordar, y perdió el control de sus copias.');
                        signal('sound', 'paper');
                    }
                    else
                        signal('message', 'La terminal termina con una frase tachada: NINGUNA COPIA DEBERÍA SUFRIR POR SER COPIA.');
                }
                else if (close(12.5, 3.5, 1.4)) {
                    if (!s.d7Portrait)
                        signal('message', 'La grabación está encriptada. Examina el retrato del RPG antes de reproducirla.');
                    else if (!s.d7Voice) {
                        s.d7Voice = true;
                        s.chase = true;
                        s.threat = 20;
                        signal('journal', 'Tu voz y la de tu copia se solapan en la misma grabación. La entidad solo puede repetir movimientos: no puede elegir.');
                        setScene('d7voice', 'DOS VOCES, UNA BOCA', 'La voz de Nao revela que la Copista no nació malvada. Fue la suma de recuerdos rechazados. Detrás de ti se oye tu propia voz contando hasta siete.');
                        signal('sound', 'intercom');
                    }
                    else
                        signal('message', 'En la cinta, alguien responde a preguntas que todavía no has formulado.');
                }
                else if (close(11.5, 10.5, 1.4)) {
                    if (!s.d7Name)
                        signal('message', 'La cámara está al otro lado de un muro. Solo el nombre del cartucho puede abrirla.');
                    else if (!s.d7Original) {
                        s.d7Original = true;
                        s.chase = false;
                        s.threat = 0;
                        signal('journal', 'Nao y La Copista existen como seres distintos. Romper el archivo destruiría también vidas nuevas. La elección no es inocente.');
                        setScene('d7original', 'DOS PERSONAS EN UNA FOTO', 'La fotografía auténtica contiene a Nao y a su copia. Ambas miran a cámara. Detrás, con la mano sobre el obturador, estás tú.');
                        signal('sound', 'photo');
                    }
                    else
                        signal('message', 'La fotografía no cambia. Es la primera imagen de toda la semana que no intenta corregirte.');
                }
                else if (close(2.5, 4.5, 1.35)) {
                    s.hidden = !s.hidden;
                    s.threat = Math.max(0, s.threat - 45);
                    signal('message', s.hidden ? 'Cierras el archivador y permaneces inmóvil. Una voz pronuncia tu nombre desde muy lejos.' : 'Sales del archivador. La Copista conoce el camino, pero no tu decisión.');
                    signal('sound', 'hide');
                }
                else
                    signal('message', s.chase ? 'Una voz repite cada palabra que todavía no has dicho.' : 'Los estantes contienen fotografías de personas que todavía viven.');
            }
        }
        function chooseEnding(kind, title, message) {
            if (!s.d7Original) {
                signal('message', 'Los tres altares permanecen apagados. Primero recupera la fotografía original.');
                return;
            }
            s.d7Choice = kind;
            signal('journal', 'Has seleccionado ' + title + '. Todavía puedes cambiar de decisión antes de cruzar el archivo.');
            setScene('d7choice', title, message + ' Puedes cambiar tu elección antes de atravesar la puerta final.');
            signal('sound', 'clue');
        }
        function interactDay6() {
            if (s.mode === 'rpg') {
                const near = (x, y) => Math.abs(s.px - x) + Math.abs(s.py - y) <= 1;
                if (near(4, 4)) {
                    if (!s.d6Label)
                        signal('message', 'El índice está cubierto de hollín. Antes debes leer una etiqueta del depósito real.');
                    else if (!s.d6Index) {
                        s.d6Index = true;
                        signal('journal', 'El índice clasifica cenizas por minutos robados. Una urna lleva el número de mi última partida.');
                        setScene('d6index', 'TIEMPO INCINERADO', 'La lista no contiene muertos. Contiene las horas que desaparecieron de sus biografías. En la realidad, el horno empieza a rugir.');
                        signal('sound', 'paper');
                    }
                    else
                        signal('message', 'La columna que llevaba tu nombre ahora dice ORIGINAL: NO ENCONTRADO.');
                }
                else if (near(11, 5)) {
                    if (!s.d6Furnace)
                        signal('message', 'La rueda está bloqueada. Primero debes descubrir qué quemaron realmente en el horno.');
                    else if (!s.d6Vent) {
                        s.d6Vent = true;
                        s.chase = false;
                        s.threat = 0;
                        signal('journal', 'La rueda térmica dejó de girar. La compuerta del horno real se abrió hacia una galería de negativos.');
                        setScene('d6wheel', 'CIEN GRADOS BAJO CERO', 'Giras la rueda hasta -00. El horno se apaga, pero las cenizas flotan hacia arriba. Una puerta antes tapiada aparece en el depósito.');
                        signal('sound', 'fold');
                    }
                    else
                        signal('message', 'La escala no mide calor. Mide cuánto tiempo le queda a cada recuerdo.');
                }
                else if (near(5, 9))
                    signal('message', 'GUARDIÁN DE CENIZA: «Nao no era una víctima. Era quien conservaba los recuerdos que nadie quiso».');
                else if (near(13, 10))
                    signal('message', s.d6Negative ? 'El núcleo reconoce el negativo recuperado. Entra en la casilla.' : 'El núcleo exige una imagen que no haya sido copiada.');
                else
                    signal('message', 'En el suelo hay ceniza que forma letras mientras caminas.');
            }
            else {
                const close = (x, y, r) => distance(s.rx, s.ry, x, y) < r;
                if (close(4.5, 3.5, 1.35)) {
                    if (!s.d6Label) {
                        s.d6Label = true;
                        signal('journal', 'Etiqueta 06: Nao K., 00:13. No hay restos, solo una hora registrada en todas las urnas.');
                        setScene('d6label', 'UNA URNA VACÍA', 'Abres el recipiente. En vez de polvo, un olor a lluvia de infancia. Al fondo hay una instrucción: CONSULTAR ÍNDICE.');
                        signal('sound', 'paper');
                    }
                    else
                        signal('message', 'La urna pesa exactamente lo mismo estando abierta o cerrada.');
                }
                else if (close(12.5, 3.5, 1.4)) {
                    if (!s.d6Index)
                        signal('message', 'El horno no tiene combustible. Sus instrucciones están escritas en un índice que aún no has leído.');
                    else if (!s.d6Furnace) {
                        s.d6Furnace = true;
                        s.chase = true;
                        s.threat = 18;
                        signal('journal', 'El horno quemaba los minutos de quienes habían sido reemplazados. La Copista guardaba las horas descartadas.');
                        setScene('d6furnace', 'EL HORNO SIN FUEGO', 'El interior está frío. Oyes tu voz de niño contando hasta siete. Algo arrastra un saco de cenizas por el pasillo.');
                        signal('sound', 'furnace');
                    }
                    else
                        signal('message', 'Dentro del horno, una fotografía se revela y vuelve a ennegrecerse a cada segundo.');
                }
                else if (close(11.5, 10.5, 1.4)) {
                    if (!s.d6Vent)
                        signal('message', 'El archivo de negativos está tras una compuerta sellada. La rueda del RPG puede abrirla.');
                    else if (!s.d6Negative) {
                        s.d6Negative = true;
                        s.chase = false;
                        s.threat = 0;
                        signal('journal', 'Negativo sin copiar: Nao construyó el archivo para recordar a los sustituidos. La entidad nació de las copias incompletas.');
                        setScene('d6negative', 'EL PRIMER ORIGINAL', 'La imagen muestra a Nao frente a una consola. A su lado hay alguien idéntico a ti, salvo por una cosa: está mirando fuera de la fotografía.');
                        signal('sound', 'photo');
                    }
                    else
                        signal('message', 'El negativo conserva una sombra que no aparece en la copia digital.');
                }
                else if (close(2.5, 4.5, 1.35)) {
                    s.hidden = !s.hidden;
                    s.threat = Math.max(0, s.threat - 45);
                    signal('message', s.hidden ? 'Te ocultas tras el conducto de extracción. Las cenizas se elevan contra la gravedad.' : 'Sales del conducto. Ahora hay huellas debajo del polvo, no sobre él.');
                    signal('sound', 'hide');
                }
                else
                    signal('message', s.chase ? 'La Copista arrastra algo pesado. Una urna golpea cada escalón.' : 'El aire huele a carbón frío y a una habitación que aún no existe.');
            }
        }
        function interactDay5() {
            if (s.mode === 'rpg') {
                const near = (x, y) => Math.abs(s.px - x) + Math.abs(s.py - y) <= 1;
                if (near(4, 4)) {
                    if (!s.d5Sign)
                        signal('message', 'Las calles no tienen nombre. Antes lee una placa en la realidad.');
                    else if (!s.d5Address) {
                        s.d5Address = true;
                        signal('journal', 'Libro de direcciones: una calle entera está escrita con la misma letra que mi diario.');
                        setScene('d5address', 'EL LIBRO SIN VECINOS', 'Los buzones del pueblo muestran fechas, no apellidos. Tu calle aparece subrayada en negro.');
                        signal('sound', 'paper');
                    }
                    else
                        signal('message', 'El libro ahora incluye una dirección que todavía no has visitado.');
                }
                else if (near(11, 5)) {
                    if (!s.d5Plot)
                        signal('message', 'La calle borrada espera una prueba de que existió. Examina el solar real.');
                    else if (!s.d5Street) {
                        s.d5Street = true;
                        s.chase = false;
                        s.threat = 0;
                        signal('journal', 'Has devuelto una calle a la memoria del cartucho. En la realidad se abre un pasaje tapiado.');
                        setScene('d5street', 'LO QUE RECORDAMOS EXISTE', 'Dibujas una calle con el dedo. En el mundo real, un muro retrocede y deja una entrada iluminada.');
                        signal('sound', 'fold');
                    }
                    else
                        signal('message', 'La calle vuelve a tener nombre, pero ninguna casa conserva fotografías.');
                }
                else if (near(5, 9))
                    signal('message', 'VECINO SIN CARA: «Una casa no desaparece. Se la queda quien la recuerda».');
                else if (near(13, 10))
                    signal('message', s.d5House ? 'La puerta acepta tus recuerdos. Pisa la casilla de la casa.' : 'El umbral pregunta por un hogar que ya no está en los mapas.');
                else
                    signal('message', 'Algunas ventanas se iluminan cuando dejas de mirarlas.');
            }
            else {
                const close = (x, y, r) => distance(s.rx, s.ry, x, y) < r;
                if (close(4.5, 3.5, 1.35)) {
                    if (!s.d5Sign) {
                        s.d5Sign = true;
                        signal('journal', 'La placa dice CALLE DE LOS AUSENTES. Debajo: DONDE TÚ VIVÍAS.');
                        setScene('d5sign', 'LA DIRECCION IMPOSIBLE', 'El número de la calle cambia al pestañear. Bajo la placa: «Consulta el libro del otro barrio».');
                        signal('sound', 'photo');
                    }
                    else
                        signal('message', 'La placa señala un portal sin edificio.');
                }
                else if (close(12.5, 3.5, 1.45)) {
                    if (!s.d5Address)
                        signal('message', 'Hay cimientos frescos y ningún rastro de demolición. Falta una dirección en el cartucho.');
                    else if (!s.d5Plot) {
                        s.d5Plot = true;
                        s.chase = true;
                        s.threat = 14;
                        signal('journal', 'En el solar hay una puerta sin pared. Por debajo se mueve la sombra de una persona que se parece a mí.');
                        setScene('d5plot', 'UN SOLAR HABITADO', 'Escuchas platos, una radio y voces familiares bajo un terreno vacío. Algo cruza delante de la linterna.');
                        signal('sound', 'intercom');
                    }
                    else
                        signal('message', 'El solar tiene ventanas. Solo se ven reflejadas en los charcos.');
                }
                else if (close(11.5, 10.5, 1.45)) {
                    if (!s.d5Street)
                        signal('message', 'Donde debería estar la casa hay un muro. Su contorno está dibujado dentro del RPG.');
                    else if (!s.d5House) {
                        s.d5House = true;
                        s.chase = false;
                        s.threat = 0;
                        signal('journal', 'La casa ausente está amueblada con objetos de distintos años. En la mesa hay una silla de más.');
                        setScene('d5house', 'UN HOGAR DE PRESTADO', 'Al entrar, los relojes se detienen. Hay una fotografía tuya tomada antes de que nadie pudiera conocerte.');
                        signal('sound', 'key');
                    }
                    else
                        signal('message', 'La casa conserva tu respiración incluso cuando sales.');
                }
                else if (close(5.5, 10.5, 1.35)) {
                    s.hidden = !s.hidden;
                    s.threat = Math.max(0, s.threat - 42);
                    signal('message', s.hidden ? 'Te escondes tras una marquesina cubierta de periódicos sin fecha.' : 'Sales de la marquesina. Tu silueta sigue en el cristal.');
                    signal('sound', 'hide');
                }
                else
                    signal('message', s.chase ? 'Se oyen pasos detrás de una pared que nunca existió.' : 'Los buzones están llenos de cartas dirigidas a casas vacías.');
            }
        }
        function interactDay4() {
            if (s.mode === 'rpg') {
                const near = (x, y) => Math.abs(s.px - x) + Math.abs(s.py - y) <= 1;
                if (near(4, 4)) {
                    if (!s.d4File)
                        signal('message', 'Las páginas del libro están cosidas. Necesitas el expediente de admisión.');
                    else if (!s.d4Ledger) {
                        s.d4Ledger = true;
                        signal('journal', 'Libro de tinta: PACIENTE 000, SIN ROSTRO. Su imagen aparece en radiología.');
                        setScene('d4ledger', 'DIAGNOSTICO INCOMPLETO', 'El libro escribe tu nombre con letras que brotan del papel. Se oye una impresora en la planta real.');
                        signal('sound', 'paper');
                    }
                    else
                        signal('message', 'Cada página del libro tiene la forma de una huella digital.');
                }
                else if (near(11, 5)) {
                    if (!s.d4Xray)
                        signal('message', 'El plano del hospital está plegado sobre sí mismo. Antes debes mirar a través de sus paredes.');
                    else if (!s.d4Fold) {
                        s.d4Fold = true;
                        s.chase = false;
                        s.threat = 0;
                        signal('journal', 'Al desplegar el plano del RPG se ha abierto una puerta imposible en el pasillo real.');
                        setScene('d4fold', 'LA PLANTA DOBLADA', 'Despliegas el papel. En la realidad, la pared de radiología se separa con un crujido seco.');
                        signal('sound', 'fold');
                    }
                    else
                        signal('message', 'En el plano ahora está dibujada tu posición exacta, incluso cuando no miras.');
                }
                else if (near(5, 9))
                    signal('message', 'ENFERMERA DE PAPEL: «Alguien archivó sus gritos como radiografías».');
                else if (near(13, 10))
                    signal('message', s.d4Reel ? 'La cama cero te espera. Pisa su casilla.' : 'Una pulsera de ingreso te impide acceder a la cama cero.');
                else
                    signal('message', 'Los pasillos dibujados tienen manchas como de dedos húmedos.');
            }
            else {
                const close = (x, y, r) => distance(s.rx, s.ry, x, y) < r;
                if (close(4.5, 3.5, 1.35)) {
                    if (!s.d4File) {
                        s.d4File = true;
                        signal('journal', 'Admisión: PACIENTE 000. No figura su ingreso; únicamente consta que nunca fue dado de alta.');
                        setScene('d4file', 'EL PACIENTE IMPOSIBLE', 'El papel está tibio. Debajo de tu nombre aparece una anotación: CONSULTAR EL LIBRO DE TINTA.');
                        signal('sound', 'paper');
                    }
                    else
                        signal('message', 'El expediente tiene una nueva página cada vez que lo cierras.');
                }
                else if (close(12.5, 3.5, 1.4)) {
                    if (!s.d4Ledger)
                        signal('message', 'Las placas están vacías, salvo por una palabra escrita con tinta. La has visto dentro del cartucho.');
                    else if (!s.d4Xray) {
                        s.d4Xray = true;
                        s.chase = true;
                        s.threat = 14;
                        signal('journal', 'Radiografía 000: huesos en forma de letras. El informe dice: EL PLANO ESTÁ PLEGADO.');
                        setScene('d4xray', 'UN CUERPO ESCRITO', 'La placa muestra tu esqueleto compuesto por páginas. Algo arrastra una camilla por el pasillo.');
                        signal('sound', 'xray');
                    }
                    else
                        signal('message', 'Las placas muestran a la misma persona en distintas edades. Ninguna tiene rostro.');
                }
                else if (close(11.5, 10.5, 1.4)) {
                    if (!s.d4Fold)
                        signal('message', 'El quirófano cero está detrás de una pared sin puerta. El plano del juego puede cambiarla.');
                    else if (!s.d4Reel) {
                        s.d4Reel = true;
                        s.chase = false;
                        s.threat = 0;
                        signal('journal', 'Bobina 000: «El paciente conserva todos los recuerdos que sus copias olvidaron».');
                        setScene('d4reel', 'LA CIRUGIA INVISIBLE', 'Oyes la grabación de una operación. El cirujano eres tú, y lo que estás extrayendo es un recuerdo.');
                        signal('sound', 'heartbeat');
                    }
                    else
                        signal('message', 'La bobina gira aunque la cinta ha terminado. Alguien susurra: CAMA CERO.');
                }
                else if (close(5.5, 10.5, 1.4)) {
                    s.hidden = !s.hidden;
                    s.threat = Math.max(0, s.threat - 45);
                    signal('message', s.hidden ? 'Te escondes tras la cortina quirúrgica. Una sombra se detiene al otro lado.' : 'Sales de la cortina. Por un instante, el suelo parece una página arrugada.');
                    signal('sound', 'hide');
                }
                else
                    signal('message', s.chase ? 'Una camilla rechina detrás de ti. No se ven las ruedas.' : 'Huele a yodo y papel quemado. Las luces parpadean sin ruido.');
            }
        }
        function interactDay3() {
            if (s.mode === 'rpg') {
                const near = (x, y) => Math.abs(s.px - x) + Math.abs(s.py - y) <= 1;
                if (near(3, 4)) {
                    if (!s.d3Ticket)
                        signal('message', 'Falta el billete que lleva impresa la hora imposible.');
                    else if (!s.d3Clock) {
                        s.d3Clock = true;
                        signal('journal', 'El reloj del RPG retrocede hasta las 00:13. La megafonía real repite esa hora.');
                        setScene('d3clock', 'HORA DE NADIE', 'Al mover las agujas hacia atrás, todos los relojes de la estación se detienen. Solo escuchas el tic de tu corazón.');
                        signal('sound', 'clock');
                    }
                    else
                        signal('message', 'Las agujas giran con tu respiración.');
                }
                else if (near(10, 6)) {
                    if (!s.d3Schedule)
                        signal('message', 'El semáforo muestra dos vías. Primero tienes que averiguar cuál de ellas está borrada.');
                    else if (!s.d3Signal) {
                        s.d3Signal = true;
                        s.chase = false;
                        s.threat = 0;
                        signal('journal', 'Al cambiar la señal del RPG se abrió un paso sellado en el andén real.');
                        setScene('d3signal', 'LA VIA IMPOSIBLE', 'Las vías del cartucho se doblan como papel. Un muro de la estación real desaparece sin hacer ruido.');
                        signal('sound', 'switch');
                    }
                    else
                        signal('message', 'La señal no indica verde o rojo. Dice: DENTRO / FUERA.');
                }
                else if (near(5, 9))
                    signal('message', 'VIAJERO SIN OJOS: «No subas al tren que llega. Sube al que recuerdas».');
                else if (near(13, 10))
                    signal('message', s.d3Booth ? 'El andén está abierto. Avanza hasta su casilla.' : 'El andén cero pide una autorización escrita desde la cabina real.');
                else
                    signal('message', 'Los anuncios de la estación solo muestran ciudades que han sido olvidadas.');
            }
            else {
                const close = (x, y, r) => distance(s.rx, s.ry, x, y) < r;
                if (close(4.5, 2.5, 1.35)) {
                    if (!s.d3Ticket) {
                        s.d3Ticket = true;
                        signal('journal', 'Billete para la línea 0. Salida 00:13. Destino: mi propio nombre.');
                        setScene('d3ticket', 'BILLETE SIN DESTINO', 'El revisor estampó un sello con la fecha de mañana. Al darle la vuelta aparece el dibujo de un reloj del juego.');
                        signal('sound', 'ticket');
                    }
                    else
                        signal('message', 'En el billete se han borrado todas las estaciones salvo una.');
                }
                else if (close(12.5, 4.5, 1.4)) {
                    if (!s.d3Clock)
                        signal('message', 'El panel está apagado. Una hora parpadea al ritmo de un reloj de cartucho.');
                    else if (!s.d3Schedule) {
                        s.d3Schedule = true;
                        s.chase = true;
                        s.threat = 12;
                        signal('journal', 'Panel: VÍA 0 — ENTRADA SOLO DESDE EL OTRO MUNDO.');
                        setScene('d3board', 'LLEGADA RETRASADA', 'En el panel aparece TU NOMBRE. De repente, alguien anuncia tu llegada por los altavoces.');
                        signal('sound', 'train');
                    }
                    else
                        signal('message', 'El panel señala hacia una pared donde debería haber una escalera.');
                }
                else if (close(10.5, 10.5, 1.4)) {
                    if (!s.d3Signal)
                        signal('message', 'La cabina está tapiada. Los planos no incluyen la vía cero.');
                    else if (!s.d3Booth) {
                        s.d3Booth = true;
                        s.chase = false;
                        s.threat = 0;
                        signal('journal', 'Dentro de la cabina hay una maqueta del RPG. La salida real está dentro de la pantalla.');
                        setScene('d3booth', 'LA CABINA VACIA', 'La cabina contiene una mesa, dos monitores y un micrófono. Desde el altavoz oyes que alguien repite cada palabra que todavía no has dicho.');
                        signal('sound', 'key');
                    }
                    else
                        signal('message', 'El micrófono transmite una conversación que mantendrás mañana.');
                }
                else if (close(5.5, 10.5, 1.4)) {
                    s.hidden = !s.hidden;
                    s.threat = Math.max(0, s.threat - 42);
                    signal('message', s.hidden ? 'Te agachas bajo el banco del andén. Unos zapatos se detienen frente a ti.' : 'Sales del banco. Una voz anuncia que el tren ha partido hace años.');
                    signal('sound', 'hide');
                }
                else
                    signal('message', s.chase ? 'El eco de tus zapatos llega antes que tus pasos.' : 'La estación huele a lluvia, aunque estás bajo tierra.');
            }
        }
        function interactDay2() {
            if (s.mode === 'rpg') {
                const near = (x, y) => Math.abs(s.px - x) + Math.abs(s.py - y) <= 1;
                if (near(4, 3)) {
                    if (!s.d2Register)
                        signal('message', 'La campana vibra, pero antes debes saber que habitacion estas buscando.');
                    else if (!s.d2Bell) {
                        s.d2Bell = true;
                        signal('journal', 'La campana del cartucho ha sonado en un pasillo real sin altavoces.');
                        setScene('d2bell', 'EL SONIDO DEL HUECO', 'Tocas la campana. En la residencia suena una segunda, mas lenta. Un piso entero responde.');
                        signal('sound', 'bell');
                    }
                    else
                        signal('message', 'La campana ya no tiene badajo. Su eco sigue creciendo.');
                }
                else if (near(11, 4)) {
                    if (!s.d2Frequency)
                        signal('message', 'La superficie del agua devuelve una frecuencia que aun no has escuchado.');
                    else if (!s.d2Reflection) {
                        s.d2Reflection = true;
                        s.chase = false;
                        s.threat = 0;
                        signal('journal', 'El espejo de agua escribio: HABITACION 207. El numero no aparece en los planos.');
                        setScene('d2water', 'EL REFLEJO EQUIVOCADO', 'El agua muestra la puerta 207 desde dentro. Hay una persona al otro lado del ojo de la cerradura.');
                        signal('sound', 'mirror');
                    }
                    else
                        signal('message', 'Tu reflejo permanece mirando la habitacion 207.');
                }
                else if (near(13, 10))
                    signal('message', s.d2Door && s.d2Reflection ? 'La puerta esta abierta: pisa su casilla.' : 'La puerta no tiene numero. Falta recordar que habitacion existia aqui.');
                else
                    signal('message', 'Las casas del pueblo parecen estar escuchando.');
            }
            else {
                const close = (x, y, r) => distance(s.rx, s.ry, x, y) < r;
                if (close(3.5, 3.5, 1.25)) {
                    if (!s.d2Register) {
                        s.d2Register = true;
                        signal('journal', 'Registro de la residencia: Aki Morita asignada a la habitacion 207. Fecha: manana.');
                        setScene('d2register', 'NOMBRE PRESTADO', 'El libro de visitas tiene tu firma fechada para el dia siguiente. Junto a ella: «Haz sonar el pueblo».');
                        signal('sound', 'photo');
                    }
                    else
                        signal('message', 'Los nombres de todas las paginas terminan ahora con tus iniciales.');
                }
                else if (close(12.5, 3.5, 1.35)) {
                    if (!s.d2Bell)
                        signal('message', 'El interfono solo emite una nota sostenida. Una campana parece responder desde el cartucho.');
                    else if (!s.d2Frequency) {
                        s.d2Frequency = true;
                        s.chase = true;
                        s.threat = 12;
                        signal('journal', 'Interfono: «La habitacion sin numero aparece al otro lado del agua».');
                        setScene('d2intercom', 'LA VOZ DETRAS DEL MURO', 'Una voz identica a la de Nao pronuncia tu nombre al reves. Del otro lado alguien empieza a caminar.');
                        signal('sound', 'intercom');
                    }
                    else
                        signal('message', 'El interfono transmite los pasos de otra persona que va un segundo por delante.');
                }
                else if (close(11.5, 9.5, 1.3)) {
                    if (!s.d2Reflection)
                        signal('message', 'La habitacion carece de numero. Solo el cartucho puede decirte lo que falta.');
                    else if (!s.d2Door) {
                        s.d2Door = true;
                        s.chase = false;
                        signal('journal', 'En el cuarto 207 hay un catre sin colchón y una consola con dos pantallas encendidas.');
                        setScene('d2room', 'LA HABITACION IMPOSIBLE', 'Abres la puerta 207. Dentro del armario hay una fotografia tomada desde tu punto de vista, hace un minuto.');
                        signal('sound', 'key');
                    }
                    else
                        signal('message', 'Sobre la cama hay un hueco exacto con la forma de tu cuerpo.');
                }
                else if (close(6.5, 10.5, 1.3)) {
                    s.hidden = !s.hidden;
                    s.threat = Math.max(0, s.threat - 40);
                    signal('message', s.hidden ? 'Te escondes tras un biombo. Los pasos se detienen al otro lado.' : 'Sales del biombo. La residencia esta demasiado silenciosa.');
                    signal('sound', 'hide');
                }
                else
                    signal('message', s.chase ? 'Alguien esta arrastrando muebles en una habitacion que no existe.' : 'Hay marcas de dedos por dentro del papel pintado.');
            }
        }
        function interact() {
            if (s.won) {
                if (s.day === 1 && s.endingStage >= 3) {
                    startDay2();
                    return;
                }
                if (s.day === 2 && s.endingStage >= 3) {
                    startDay3();
                    return;
                }
                if (s.day === 3 && s.endingStage >= 3) {
                    startDay4();
                    return;
                }
                if (s.day === 4 && s.endingStage >= 3) {
                    startDay5();
                    return;
                }
                if (s.day === 5 && s.endingStage >= 3) {
                    startDay6();
                    return;
                }
                if (s.day === 6 && s.endingStage >= 3) {
                    startDay7();
                    return;
                }
                if (s.endingStage < 3) {
                    s.endingStage++;
                    signal('sound', 'ending');
                    if (s.day === 2) {
                        signal('message', ['', 'La voz que te contesta es la tuya, envejecida.', 'El registro marca tu salida para una fecha que todavia no existe.', 'FIN DEL DIA 2. Pulsa E para bajar a la estación.'][s.endingStage]);
                        return;
                    }
                    if (s.day === 6) {
                        signal('message', ['', 'Las urnas conservan segundos de vidas enteras. Ninguna guarda un cuerpo.', 'El negativo tiene tu rostro, pero la sombra de quien te acompaña no es humana.', 'FIN DEL DIA 6. Pulsa E otra vez para entrar en la cámara de origen.'][s.endingStage]);
                        return;
                    }
                    if (s.day === 7) {
                        const endings = { keep: ['', 'Los nombres regresan al archivo, pero esta vez pueden salir cuando quieran.', 'Nao descubre a su copia junto al amanecer. No son la misma persona, ni quieren serlo.', 'FIN: CONSERVAR. Los recuerdos pertenecen a quienes los vivieron.'], free: ['', 'Los recuerdos vuelven a las personas y los edificios recuperan sus paredes.', 'Nao pregunta tu nombre. No sabes responder. Es la primera pregunta que nadie te obliga a contestar.', 'FIN: LIBERAR. El cartucho se apaga y tú empiezas de nuevo.'], replace: ['', 'Nao cruza la puerta y respira el aire de la mañana.', 'En la pantalla, tus manos escriben nombres que nadie olvidará. Al otro lado del cristal, alguien toca una vez.', 'FIN: EL RELEVO. No todas las puertas llevan fuera.'] }[s.endingId] || [];
                        signal('message', endings[s.endingStage] || 'FIN.');
                        return;
                    }
                    if (s.day === 5) {
                        signal('message', ['', 'La puerta da a un comedor donde alguien acaba de levantarse.', 'En la mesa hay cinco fotografías. En todas falta la misma persona.', 'FIN DEL DIA 5. El siguiente archivo es el depósito de cenizas.'][s.endingStage]);
                        return;
                    }
                    if (s.day === 4) {
                        signal('message', ['', 'El cirujano no tiene manos. Tiene dos hojas en blanco.', 'Encuentras una firma en tu informe médico: la escribiste antes de nacer.', 'FIN DEL DIA 4. La siguiente página está en el archivo de cenizas.'][s.endingStage]);
                        return;
                    }
                    if (s.day === 3) {
                        signal('message', ['', 'En el andén vacío, todos los asientos llevan tu nombre.', 'El conductor te devuelve una fotografía donde aún no apareces.', 'FIN DEL DIA 3. La próxima parada es el hospital de papel.'][s.endingStage]);
                        return;
                    }
                    signal('message', ['', 'La fotografia ahora muestra una silla ocupada por tu sombra.', 'La voz de Nao llega desde el otro lado de la pantalla.', 'DIA 1 COMPLETADO. Las preguntas siguen abiertas.'][s.endingStage]);
                }
                else
                    signal('message', s.day === 7 ? 'El final está cerrado. Puedes exportar la partida o iniciar una nueva.' : 'Pulsa E para continuar.');
                return;
            }
            if (s.day === 7) {
                interactDay7();
                return;
            }
            if (s.day === 6) {
                interactDay6();
                return;
            }
            if (s.day === 5) {
                interactDay5();
                return;
            }
            if (s.day === 4) {
                interactDay4();
                return;
            }
            if (s.day === 3) {
                interactDay3();
                return;
            }
            if (s.day === 2) {
                interactDay2();
                return;
            }
            if (s.mode === 'rpg') {
                const near = (x, y) => Math.abs(s.px - x) + Math.abs(s.py - y) <= 1;
                if (near(4, 3)) {
                    if (!s.note) {
                        s.note = true;
                        signal('journal', 'La pared que respira no existe en los planos. Tiene dos manchas de humedad.');
                        setScene('note', 'EL NIÑO DE TIZA', '«No busques a la persona. Busca el hueco que dejó cuando la olvidaron».');
                        signal('sound', 'clue');
                    }
                    else
                        signal('message', 'La nota está en blanco. Ya has leído lo que había antes.');
                }
                else if (near(9, 8)) {
                    if (!s.note)
                        signal('message', 'Un sello rojo. Debes encontrar la pista escrita en el pueblo.');
                    else if (!s.seal) {
                        s.seal = true;
                        signal('journal', 'El sello ha desaparecido del pueblo, y un armario real ha quedado sin cerrojo.');
                        setScene('seal', 'EL SELLO SE ROMPE', 'La superficie de la pantalla se agrieta. Algo se ha abierto en el edificio real.');
                        signal('sound', 'clue');
                    }
                    else
                        signal('message', 'Solo queda un surco en el suelo.');
                }
                else if (near(10, 4)) {
                    if (!s.photo)
                        signal('message', 'El pozo devuelve el rostro borroso de una mujer. Primero debes descubrir quien es.');
                    else if (!s.echo) {
                        s.echo = true;
                        signal('journal', 'El pozo escribe NAO en el agua. Esa palabra abre el umbral final del RPG.');
                        setScene('well', 'EL NOMBRE BAJO EL AGUA', 'El pozo refleja una habitacion real. Una voz pronuncia: «Nao no desaparecio. La guardaron».');
                        signal('sound', 'well');
                    }
                    else
                        signal('message', 'No hay agua, pero tu reflejo sigue mirando hacia arriba.');
                }
                else if (near(5, 10)) {
                    if (evidenceFound().length === 4 && !s.flags.kibaWitness) {
                        s.flags.kibaWitness = true;
                        signal('journal', 'Los cuatro testimonios de Kiba encajan: La Copista no nació allí. Fue encerrada para recordar lo que otros negaron.');
                        setScene('kiba-witness', 'EL TESTIGO DE TIZA', '«Los cuatro lo sabían. La Copista no quiere matarte: quiere que ocupes su lugar. Nao fue la primera en negarse».', 150);
                        signal('sound', 'paper');
                    }
                    else
                        signal('message', 'NINO DE TIZA: «Si oyes tus pasos dos veces, el segundo no es tuyo».');
                }
                else if (near(13, 10))
                    signal('message', s.key && s.echo ? 'El umbral está abierto. Entra en la casilla de la puerta.' : 'El umbral necesita una llave de papel y un nombre rescatado del pozo.');
                else
                    signal('message', 'Una casa sin habitantes. Las ventanas reflejan el cielo equivocado.');
            }
            else {
                const close = (x, y, r) => distance(s.rx, s.ry, x, y) < r;
                const feature = nearestKibaFeature(s.rx, s.ry, KIBA_SWITCHES);
                const hideout = nearestKibaFeature(s.rx, s.ry, KIBA_HIDEOUTS);
                if (feature?.id === 'kibaBreaker') {
                    if (!s.seal)
                        signal('message', 'CUADRO NORTE: el diferencial tiene un sello rojo. El cartucho debe romperlo primero.');
                    else if (!s.flags.kibaNorthOpen) {
                        s.flags.kibaNorthOpen = true;
                        signal('journal', 'Abierto un paso eléctrico entre el vestíbulo y el ala este. Ahora puedo rodear la zona norte.');
                        setScene('kiba-north', 'EL PASILLO ERA MAS LARGO', 'Al restablecer la corriente, un panel se desliza hacia la pared. Has abierto una ruta nueva por el norte.');
                        signal('sound', 'gate');
                    }
                    else
                        signal('message', 'El paso norte sigue abierto. Puedes evitar el corredor central.');
                }
                else if (feature?.id === 'kibaWinch') {
                    if (!s.tape)
                        signal('message', 'TORNO DE ARCHIVOS: la rueda está bloqueada. Parece necesitar una vibración sostenida.');
                    else if (!s.flags.kibaArchiveOpen) {
                        s.flags.kibaArchiveOpen = true;
                        signal('journal', 'Abierto el atajo entre archivos y sótano. El torno hizo un ruido que escuchó todo el edificio.');
                        setScene('kiba-winch', 'LA PARED SE DESPLAZA', 'Tiras del torno y la pared cede. El estruendo despierta algo al fondo del corredor. Ahora existe una segunda vía de escape.');
                        signal('sound', 'gate');
                        s.flags.kibaDecoy = { x: 6.5, y: 7.5, atStep: s.steps };
                        s.flags.kibaHideAlert = true;
                    }
                    else
                        signal('message', 'El atajo de archivos permanece abierto, pero el torno aún vibra.');
                }
                else if (feature?.id === 'kibaVent') {
                    if (!s.chase)
                        signal('message', 'CONDUCTO DE PRESION: una válvula oxidada. Al golpearla, el sonido recorrería toda el ala.');
                    else if (s.flags.kibaVentUsed)
                        signal('message', 'El conducto está roto. No podrás usarlo de nuevo.');
                    else {
                        s.flags.kibaVentUsed = true;
                        s.flags.kibaDecoy = { x: 11.5, y: 5.5, atStep: s.steps };
                        signal('journal', 'Golpeé el conducto del ala este para atraer a La Copista. La válvula se partió y no puedo repetirlo.');
                        mark('kiba-vent', 'GOLPE EN EL CONDUCTO', 'La chapa resuena hacia una habitación vacía. Ahora debes moverte antes de que descubra el engaño.');
                        signal('sound', 'vent');
                    }
                }
                else if (hideout) {
                    if (s.hidden && s.flags.kibaHideSpot === hideout.id) {
                        s.hidden = false;
                        delete s.flags.kibaHideSpot;
                        delete s.flags.kibaHideAlert;
                        signal('message', 'Sales del escondite improvisado. La madera cruje bajo tu peso.');
                        signal('sound', 'hide');
                    }
                    else {
                        s.hidden = true;
                        s.crouched = false;
                        s.flags.kibaHideSpot = hideout.id;
                        s.flags.kibaHideAlert = hideRisk(s.threat, s.light, footstepNoise(s.rx, s.ry, false));
                        signal('message', s.flags.kibaHideAlert ? 'Te ocultas, pero has hecho ruido. Si se acerca, podría abrir el escondite.' : 'Te ocultas entre cajas. No te muevas: la madera está podrida.');
                        signal('sound', 'hide');
                    }
                }
                else if (close(13.5, 2.5, 1.4)) {
                    if (!s.seal)
                        signal('message', 'Una fotografia velada. Hay una mancha roja con forma de sello en el marco.');
                    else if (!s.photo) {
                        s.photo = true;
                        signal('journal', 'Foto de 2003: Aki, Nao y una tercera silueta sin rostro. En el reverso: EL POZO NO ESTA VACIO.');
                        setScene('photo', 'LA TERCERA PERSONA', 'En la fotografia la amiga desaparecida tiene la cara tachada. El reverso dice: «Busca su nombre donde no hay agua».');
                        signal('sound', 'photo');
                    }
                    else
                        signal('message', 'La fotografia muestra a tres personas. Cuando parpadeas, hay cuatro.');
                }
                else if (close(10.5, 9.5, 1.35)) {
                    if (!s.echo) {
                        signal('message', 'La cinta 04 no se mueve. En la etiqueta alguien escribio: «Primero recupera su nombre».');
                    }
                    else if (!s.tape) {
                        s.tape = true;
                        s.chase = true;
                        s.flags.copyistMemory = { x: s.rx, y: s.ry, lastSeenStep: s.steps - 5, phase: 'investigate' };
                        signal('journal', 'Cinta 04: alguien recita los nombres de personas que nunca han nacido.');
                        setScene('tape', 'CINTA 04', '«Cuando la oigas respirar, NO MIRES ATRÁS». La grabadora sigue encendida aunque le quites las pilas.');
                        signal('sound', 'tape');
                    }
                    else if (canStartFinale(s)) {
                        s.flags.kibaFinaleStage = 1;
                        s.flags.kibaFinaleStartedAt = s.steps;
                        s.chase = true;
                        s.hidden = false;
                        s.threat = Math.max(s.threat, 26);
                        s.flags.copyistMemory = { x: s.rx, y: s.ry, lastSeenStep: s.steps - 5, phase: 'investigate' };
                        setScene('finale-windup', 'LA CINTA SE REBOBINA SOLA', 'La grabadora pronuncia tu nombre, luego el de Nao. Dos golpes responden desde el conducto. Debes cruzar el archivo y llegar al vestíbulo: no hay tiempo para escuchar el resto.', 175);
                        signal('journal', 'La cinta 04 ha empezado una segunda grabación. Huida de Kiba: primero archivos (6,7), después vestíbulo (2,2).');
                        signal('sound', 'finaleStart');
                    }
                    else if (s.flags.kibaFinaleStage === 1 || s.flags.kibaFinaleStage === 2)
                        signal('message', 'La grabadora sigue rebobinando. No te quedes aquí; consulta el objetivo de huida.');
                    else if (s.flags.kibaFinaleStage === 3)
                        signal('message', 'La cinta ya no tiene voz. He conseguido salir del edificio.');
                    else
                        signal('message', 'La cinta continúa girando. No hace ningún sonido.');
                }
                else if (close(3.5, 9.5, 1.5)) {
                    if (!s.seal)
                        signal('message', 'Armario cerrado. El pestillo tiene un símbolo rojo pixelado.');
                    else if (!s.tape)
                        signal('message', 'El armario se abre unos centímetros. En su interior alguien susurra: «Escucha primero la cinta 04».');
                    else if (!s.key) {
                        s.key = true;
                        signal('journal', 'La llave de papel apareció en la realidad y abre un umbral del RPG.');
                        setScene('key', 'LA LLAVE IMPOSIBLE', 'Dentro del armario hay una llave doblada en papel de periódico. El texto cambia cuando parpadeas. La cinta 04 acaba de rebobinarse: puedes volver a escucharla para intentar la huida final.');
                        signal('sound', 'clue');
                    }
                    else
                        signal('message', 'El armario está vacío. En el fondo hay arañazos desde dentro.');
                }
                else if (close(12.5, 4.5, 1.4)) {
                    s.hidden = !s.hidden;
                    delete s.flags.kibaHideSpot;
                    delete s.flags.kibaHideAlert;
                    s.crouched = false;
                    s.threat = Math.max(0, s.threat - 35);
                    signal('message', s.hidden ? 'Te escondes. La Copista pasa arrastrando los pies.' : 'Abres la puerta del escondite. Huele a tierra mojada.');
                    signal('sound', 'hide');
                    checkChaseBeat();
                }
                else if (close(8.5, 3.5, 1.4)) {
                    if (!s.call) {
                        s.call = true;
                        signal('journal', 'Un teléfono sin cable recibió una llamada desde mi número de mañana.');
                        mark('phone', 'LLAMADA ENTRANTE', 'Una voz idéntica a la tuya susurra: «No vuelvas a guardar la partida».');
                        signal('sound', 'phone');
                    }
                    else
                        signal('message', 'El auricular está caliente. La línea lleva horas cortada.');
                }
                else if (close(5.5, 4.5, 1.3)) {
                    if (!s.mirror) {
                        s.mirror = true;
                        signal('journal', 'Mi reflejo tarda en imitarme.');
                        mark('mirror', 'EL RETRASO', 'Durante un instante, tu reflejo permanece inmóvil mientras tú te mueves.');
                        signal('sound', 'mirror');
                    }
                    else
                        signal('message', 'El espejo devuelve tu imagen con un segundo de retraso.');
                }
                else {
                    const evidence = nearestEvidence(s.rx, s.ry, evidenceFound());
                    if (evidence) {
                        evidenceFound().push(evidence.id);
                        signal('journal', evidence.journal);
                        setScene('kiba-evidence-' + evidence.id, evidence.title, evidence.message, 115);
                        signal('sound', evidence.cue);
                    }
                    else
                        signal('message', s.chase ? 'Un arañazo nuevo acaba de aparecer en la pared.' : 'Un pasillo vacío. El edificio parece contener la respiración.');
                }
            }
        }
        function swap() { if (s.won)
            return; s.mode = s.mode === 'real' ? 'rpg' : 'real'; s.hidden = false; delete s.flags.kibaHideSpot; delete s.flags.kibaHideAlert; s.crouched = false; signal('message', s.mode === 'real' ? 'La pantalla se apaga. Vuelves al edificio.' : 'El cartucho se inicia solo. Una partida que no recuerdas te espera.'); signal('sound', 'swap'); }
        /** Agacharse afecta al ruido y al avance, pero no vuelve invisible al jugador. */
        function toggleCrouch() {
            if (s.day !== 1 || s.mode !== 'real' || s.won)
                return false;
            if (s.hidden) {
                signal('message', 'Estás dentro del armario; sal antes de avanzar agachado.');
                return false;
            }
            s.crouched = !s.crouched;
            signal('message', s.crouched ? 'Te agachas. Los pasos apenas resuenan; avanzarás más despacio. La luz sigue delatándote.' : 'Te incorporas. Ahora avanzas más rápido, pero tus pasos se oyen.');
            signal('sound', 'sneak');
            return true;
        }
        /** Dos tuercas abandonadas junto a la cinta permiten desviar a la Copista. */
        function throwDecoy() {
            if (s.day !== 1 || s.mode !== 'real' || s.won || !s.chase || !s.tape) {
                signal('message', 'No llevas nada útil que lanzar.');
                return false;
            }
            const used = s.flags.kibaDecoysUsed || 0;
            if (used >= 2) {
                signal('message', 'No quedan tuercas. Tendrás que usar la oscuridad o esconderte.');
                return false;
            }
            if (s.flags.kibaDecoyStep !== undefined && s.steps - s.flags.kibaDecoyStep < 7) {
                signal('message', 'Aún oyes el eco de la última tuerca. Espera un poco.');
                return false;
            }
            const pos = decoyDestination(realMap(s), s.rx, s.ry, s.dir);
            if (!pos) {
                signal('message', 'No hay espacio libre para lanzar la tuerca. Gira hacia el pasillo.');
                return false;
            }
            s.flags.kibaDecoy = { ...pos, atStep: s.steps };
            s.flags.kibaDecoyStep = s.steps;
            s.flags.kibaDecoysUsed = used + 1;
            s.hidden = false;
            signal('sound', 'decoy');
            signal('message', `Una tuerca rebota al fondo del pasillo. Te quedan ${2 - s.flags.kibaDecoysUsed}. Si te ve, ignorará el ruido.`);
            return true;
        }
        function toggleLight() { s.light = !s.light; signal('message', s.light ? 'Linterna encendida.' : 'Linterna apagada.'); signal('sound', 'light'); }
        function tick() {
            if (s.eventTick > 0)
                s.eventTick--;
            s.pulse++;
            // Mientras el jugador se esconde el mundo no se congela: a ritmo fijo,
            // independiente de FPS y sin convertir cada fotograma en un paso del monstruo.
            if (s.day === 1 && s.mode === 'real' && s.chase && !s.won && s.pulse % 9 === 0 &&
                (s.hidden || s.flags.kibaFinaleStage === 1 || s.flags.kibaFinaleStage === 2)) {
                // El clímax no se congela al soltar el teclado; la IA respeta el mismo
                // modelo de percepción y colisión y avanza a una cadencia reproducible.
                entityStep();
                checkFinaleProgress();
                checkChaseBeat();
                return true;
            }
            return false;
        }
        function reset() { s = initial(); events(); signal('message', 'Comienza el Día 1. Busca una pista en el cartucho.'); }
        function load(v) { const x = normalize(v); if (!x)
            return false; s = x; events(); signal('message', 'Partida restaurada.'); return true; }
        function state() { return s; }
        return { state, move, interact, swap, toggleLight, toggleCrouch, throwDecoy, tick, reset, load, events, signal };
    }
    return { VERSION, REAL, RPG, REAL_2, RPG_2, REAL_3, RPG_3, REAL_4, RPG_4, REAL_5, RPG_5, REAL_6, RPG_6, REAL_7, RPG_7, DIRS, RPG_ITEMS, REAL_ITEMS, RPG_ITEMS_2, REAL_ITEMS_2, REAL_ITEMS_3, RPG_ITEMS_3, REAL_ITEMS_4, RPG_ITEMS_4, REAL_ITEMS_5, RPG_ITEMS_5, REAL_ITEMS_6, RPG_ITEMS_6, REAL_ITEMS_7, RPG_ITEMS_7, realMap, rpgMap, realItems, rpgItems, initial, normalize, bfs, wall, collision, distance, roomAt, objective, newGame };
})();

// premium/CopyistBrain.js
function decideCopyist(input) {
    const d = Math.hypot(input.playerX - input.entityX, input.playerY - input.entityY);
    const spotted = !input.hidden && input.visible && d <= (input.light ? 7 : 2.3);
    const prior = input.memory && Number.isFinite(input.memory.x) && Number.isFinite(input.memory.y) && Number.isInteger(input.memory.lastSeenStep) ? input.memory : null;
    let phase, x, y, lastSeenStep;
    if (spotted) {
        phase = 'hunt';
        x = input.playerX;
        y = input.playerY;
        lastSeenStep = input.steps;
    }
    else if (input.decoy && input.steps - input.decoy.atStep <= 10 && input.steps >= input.decoy.atStep &&
        Math.hypot(input.entityX - input.decoy.x, input.entityY - input.decoy.y) < 12) {
        // Un señuelo acústico legítimo atrae a la Copista hasta una posición fija.
        // La visión directa tiene prioridad, así que lanzarlo delante de ella es arriesgado.
        phase = 'investigate';
        x = input.decoy.x;
        y = input.decoy.y;
        lastSeenStep = prior?.lastSeenStep ?? input.steps - 6;
    }
    else if (!input.hidden && !input.sneaking && d < Math.min(8, 3.3 + (input.noiseLevel ?? 1) * 2.2) && input.steps % 3 === 0) {
        // Un paso fuerte delata la zona, pero nunca la posición exacta.
        phase = 'investigate';
        x = Math.floor(input.playerX) + .5;
        y = Math.floor(input.playerY) + .5;
        lastSeenStep = prior?.lastSeenStep ?? input.steps - 6;
    }
    else if (prior && input.steps - prior.lastSeenStep < 18) {
        phase = 'search';
        x = prior.x;
        y = prior.y;
        lastSeenStep = prior.lastSeenStep;
    }
    else {
        phase = 'search';
        x = prior?.x ?? input.entityX;
        y = prior?.y ?? input.entityY;
        lastSeenStep = prior?.lastSeenStep ?? input.steps - 20;
    }
    const speed = phase === 'hunt' ? .36 : phase === 'investigate' ? .26 : .18;
    return { phase, goalX: x, goalY: y, speed, threatDelta: phase === 'hunt' ? Math.max(5, 12 - d) : phase === 'investigate' ? 3 : -5,
        memory: { x, y, lastSeenStep, phase } };
}

// premium/KibaStealth.js
function floorSurface(x, y) {
    const tx = Math.floor(x), ty = Math.floor(y);
    // Corredores metálicos y un ala alfombrada: información acústica que se aprende al explorar.
    if ((ty === 9 && tx >= 8 && tx <= 13) || (tx === 7 && ty >= 3 && ty <= 5))
        return 'metal';
    if (ty >= 7 && tx <= 6)
        return 'carpet';
    return 'concrete';
}
function footstepNoise(x, y, sneaking) {
    if (sneaking)
        return .12;
    const surface = floorSurface(x, y);
    return surface === 'metal' ? 2.2 : surface === 'carpet' ? .45 : 1;
}
function decoyDestination(map, x, y, dir) {
    const dirs = [[0, -1], [1, 0], [0, 1], [-1, 0]];
    if (!Number.isInteger(dir) || dir < 0 || dir > 3)
        return null;
    const [dx, dy] = dirs[dir];
    let found = null;
    for (let i = 1; i <= 4; i++) {
        const xx = Math.floor(x) + dx * i, yy = Math.floor(y) + dy * i;
        if (map[yy]?.[xx] !== '.')
            break;
        found = { x: xx + .5, y: yy + .5 };
    }
    return found;
}
function validNoiseMarker(v, map, currentStep) {
    if (!v || typeof v !== 'object')
        return false;
    const q = v;
    return typeof q.x === 'number' && typeof q.y === 'number' && Number.isFinite(q.x) && Number.isFinite(q.y) &&
        typeof q.atStep === 'number' && Number.isInteger(q.atStep) && q.atStep >= 0 && q.atStep <= currentStep &&
        map[Math.floor(q.y)]?.[Math.floor(q.x)] === '.';
}

// premium/DayOneStory.js
const DAY_ONE_EVIDENCE = [
    { id: 'lobby', x: 2.5, y: 3.5, title: 'EL LIBRO DE VISITAS',
        message: 'Hay treinta y siete firmas. La ultima es tuya, fechada mañana. En la pagina anterior todos escribieron la misma frase: «HE VENIDO A BUSCARME».',
        journal: 'Kiba, libro de visitas: mi firma figura con fecha de mañana. Los anteriores visitantes vinieron a buscarse a sí mismos.', cue: 'paper' },
    { id: 'glass', x: 14.5, y: 5.5, title: 'EL CRISTAL DOBLE',
        message: 'Una ventana mira hacia un edificio idéntico. Al otro lado, alguien apaga una linterna al mismo tiempo que tu mano se acerca al cristal.',
        journal: 'Ventana del ala este: existe un segundo Kiba reflejado donde debería haber aire. Allí alguien lleva mi misma linterna.', cue: 'glass' },
    { id: 'archives', x: 6.5, y: 8.5, title: 'REGISTRO DE AUSENCIAS',
        message: 'Una ficha dice: NAO KISARAGI — DEVUELTA. Debajo se lee: «LA COPIA SOLO SABE BUSCAR LO QUE ESCUCHA».',
        journal: 'Archivo de ausencias: Nao figura como DEVUELTA. La Copista investiga sonidos, no puede adivinar dónde me escondo.', cue: 'paper' },
    { id: 'basement', x: 12.5, y: 11.5, title: 'LA PUERTA SIN MANILLA',
        message: 'Detrás de una puerta soldada oyes una grabación de tu voz: «No corras hacia la luz. Apágala cuando empiece a buscarte».',
        journal: 'Sótano: mi propia voz advierte que apagar la linterna rompe la persecución visual de La Copista.', cue: 'breath' }
];
function nearestEvidence(x, y, found) {
    let nearest = null, best = 1.3;
    for (const item of DAY_ONE_EVIDENCE) {
        const d = Math.hypot(x - item.x, y - item.y);
        if (!found.includes(item.id) && d < best) {
            nearest = item;
            best = d;
        }
    }
    return nearest;
}
function evidenceCount(found) {
    return DAY_ONE_EVIDENCE.filter(item => found.includes(item.id)).length;
}
/** Order matters; each authored event may trigger once, without teleporting the monster. */
function nextChaseBeat(s) {
    if (!s.chase || !s.tape)
        return null;
    if (!s.already.includes('first-step') && s.steps > 0)
        return 'first-step';
    if (!s.already.includes('crossing') && s.already.includes('first-step') && s.room === 'ALA DE ARCHIVOS')
        return 'crossing';
    if (!s.already.includes('escaped') && s.already.includes('first-step') && s.hidden && s.phase === 'search')
        return 'escaped';
    return null;
}
const CHASE_BEATS = {
    'first-step': { title: 'LA CINTA SIGUE GRABANDO', message: 'La grabadora reproduce el ruido de tus siguientes pasos un instante antes de que los des. La luz ya no revela todo lo que tienes delante.', cue: 'tape' },
    crossing: { title: 'ESTA AL OTRO LADO', message: 'Los fluorescentes se apagan uno por uno hacia el sótano. La Copista toca la pared desde el otro lado; sus nudillos marcan el ritmo de tu respiración.', cue: 'heartbeat' },
    escaped: { title: 'NO HA ENTRADO', message: 'La presencia se detiene frente al escondite. Cuenta hasta cuatro con una voz que reconoces. Después se aleja hacia el último lugar donde te oyó.', cue: 'breath' }
};

// premium/DayOneArt.js

const DECORS = [
    { x: 4.5, y: 2.5, kind: 'placard', text: 'KIBA / 04' },
    { x: 3.5, y: 4.5, kind: 'fluorescent' },
    { x: 5.5, y: 3.5, kind: 'portrait' },
    { x: 8.5, y: 2.5, kind: 'warning', text: 'NO SALIR' },
    { x: 10.5, y: 3.5, kind: 'window' },
    { x: 12.5, y: 5.5, kind: 'window' },
    { x: 6.5, y: 9.5, kind: 'placard', text: 'A / 017' },
    { x: 4.5, y: 10.5, kind: 'pipes' },
    { x: 10.5, y: 10.5, kind: 'warning', text: 'CINTA 04' },
    { x: 12.5, y: 10.5, kind: 'moth' },
    { x: 3.5, y: 11.5, kind: 'portrait' },
    { x: 9.5, y: 5.5, kind: 'exit', text: 'SALIDA' },
    { x: 5.5, y: 2.5, kind: 'warning', text: 'BREAKER' },
    { x: 6.5, y: 7.5, kind: 'pipes' },
    { x: 11.5, y: 5.5, kind: 'pipes' },
    { x: 3.5, y: 11.5, kind: 'portrait' },
    { x: 9.5, y: 11.5, kind: 'warning', text: 'ARCHIVO' }
];
function hash(n) { const v = Math.sin(n * 127.171) * 43758.5453; return v - Math.floor(v); }
function rect(c, x, y, w, h, col) {
    c.fillStyle = col;
    c.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h)));
}
function label(c, t, x, y, size, col) {
    c.fillStyle = col;
    c.font = `bold ${size}px monospace`;
    c.fillText(t, x, y);
}
function projectedDecoration(s, decor, map) {
    const dx = decor.x - s.rx, dy = decor.y - s.ry, dist = Math.hypot(dx, dy);
    if (dist < .45 || dist > 9)
        return null;
    const facing = s.dir * Math.PI / 2, angle = Math.atan2(dx, -dy) - facing;
    const delta = Math.atan2(Math.sin(angle), Math.cos(angle));
    if (Math.abs(delta) > .72)
        return null;
    // Visibility trace: no decoration may be drawn through a wall.
    for (let t = .15; t < dist - .12; t += .10) {
        const x = s.rx + dx * t / dist, y = s.ry + dy * t / dist;
        if (map[Math.floor(y)]?.[Math.floor(x)] === '#')
            return null;
    }
    const depth = dist * Math.cos(delta), x = 128 + 153 * Math.tan(delta);
    if (x < -24 || x > 280)
        return null;
    return { x, size: Math.min(90, 115 / Math.max(.6, depth)), distance: dist };
}
function decoration(c, s, o, p, now) {
    const h = p.size, w = Math.max(5, h * .54), x = p.x - w / 2, y = 94 - h * .52;
    switch (o.kind) {
        case 'placard':
            rect(c, x - 2, y + h * .20, w + 4, h * .26, '#101c1d');
            rect(c, x, y + h * .23, w, h * .20, '#647a6d');
            label(c, o.text ?? 'KIBA', x + 2, y + h * .35, Math.max(5, Math.min(8, h * .09)), '#dce5c9');
            break;
        case 'warning':
            rect(c, x - 2, y + h * .22, w + 4, h * .30, '#2d2b2b');
            rect(c, x, y + h * .25, w, h * .23, '#ab8d75');
            rect(c, x + 2, y + h * .27, Math.max(2, w * .16), h * .17, '#783945');
            label(c, o.text ?? '04', x + 3, y + h * .42, Math.max(5, Math.min(8, h * .08)), '#202b2b');
            break;
        case 'window': {
            rect(c, x, y, w, h * .87, '#192a2d');
            rect(c, x + 2, y + 2, w - 4, h * .83, '#5a706e');
            rect(c, x + 4, y + 4, w - 8, h * .77, '#18272e');
            rect(c, x + w * .47, y + 3, 2, h * .8, '#87938b');
            rect(c, x + 4, y + h * .51, w - 8, 2, '#687f7e');
            const show = s.photo || ((Math.floor(now / 2900) + Math.floor(o.x)) % 9 === 0);
            if (show) {
                rect(c, x + w * .58, y + h * .40, w * .14, h * .18, '#b0b7a657');
                rect(c, x + w * .54, y + h * .55, w * .23, h * .26, '#0b1418');
            }
            break;
        }
        case 'portrait': {
            rect(c, x, y + h * .19, w, h * .58, '#463d36');
            rect(c, x + 2, y + h * .22, w - 4, h * .51, '#abb1a1');
            rect(c, x + 4, y + h * .26, w - 8, h * .43, '#25383b');
            rect(c, x + w * .37, y + h * .31, w * .28, h * .22, '#bcc1ac');
            rect(c, x + w * .27, y + h * .53, w * .47, h * .14, '#485952');
            if (s.photo)
                rect(c, x + w * .40, y + h * .34, w * .14, h * .14, '#7a353f');
            break;
        }
        case 'pipes':
            for (let k = 0; k < 3; k++) {
                rect(c, x + k * w * .28, y, w * .11, h * .95, k === 1 ? '#6b746a' : '#485b58');
                rect(c, x + k * w * .28 - 2, y + h * .43, w * .17, 2, '#a0a797');
            }
            break;
        case 'exit':
            rect(c, x, y + h * .12, w, h * .25, '#304941');
            label(c, o.text ?? 'SALIR', x + 2, y + h * .28, Math.max(5, h * .09), '#a9c4a4');
            if (s.tape)
                rect(c, x + w * .41, y + h * .55, w * .18, h * .34, '#040d0f');
            break;
        case 'fluorescent':
            rect(c, x, y + h * .12, w, h * .12, '#b1c3ad');
            rect(c, x + 2, y + h * .14, w - 4, 2, '#e7efdc');
            rect(c, x + w * .28, y + h * .23, 2, h * .65, '#566964');
            break;
        case 'moth':
            for (let k = 0; k < 5; k++) {
                const t = now * .001 + k * 1.73;
                rect(c, x + Math.sin(t) * w * .3 + w * .5, y + h * .22 + k * h * .12, 2, 2, '#b9a9a05a');
            }
            break;
    }
}
function drawDayOneArt(c, s, now, map, reduceEffects) {
    if (s.day !== 1 || s.won)
        return;
    if (s.mode === 'real') {
        // Projected environmental fixtures are aligned with world cells and occluded.
        const visible = DECORS.map(o => ({ o, p: projectedDecoration(s, o, map) })).filter((v) => v.p !== null);
        visible.sort((a, b) => b.p.distance - a.p.distance);
        for (const { o, p } of visible)
            decoration(c, s, o, p, now);
        // Four discoverable traces have a restrained, physical presence in the world;
        // their markers disappear after inspection. No floating quest beacons.
        const found = Array.isArray(s.flags?.kibaEvidence) ? s.flags.kibaEvidence : [];
        for (const clue of DAY_ONE_EVIDENCE) {
            if (found.includes(clue.id))
                continue;
            const p = projectedDecoration(s, { x: clue.x, y: clue.y, kind: 'placard' }, map);
            if (!p)
                continue;
            const h = Math.min(15, Math.max(3, p.size * .21));
            rect(c, p.x - h * .5, 99 - p.size * .18, h, Math.max(2, h * .65), clue.id === 'glass' ? '#779d9d' : '#a49a82');
            rect(c, p.x - h * .3, 100 - p.size * .16, h * .55, 1, '#dde0bd');
        }
        // Las nuevas conexiones también se anuncian en el escenario (señales de pintura).
        const gates = [{ active: s.flags?.kibaNorthOpen, x: 6.5, y: 2.5 }, { active: s.flags?.kibaArchiveOpen, x: 7.5, y: 7.5 }];
        for (const gate of gates) {
            if (!gate.active)
                continue;
            const p = projectedDecoration(s, { x: gate.x, y: gate.y, kind: 'warning' }, map);
            if (p) {
                rect(c, p.x - 6, 101 - p.size * .21, 12, 4, '#a9b8a0');
                rect(c, p.x - 2, 102 - p.size * .20, 4, 2, '#273d3a');
            }
        }
        // Investigation changes the texture of the building: its history is visible.
        if (found.length >= 2) {
            c.save();
            c.globalAlpha = .12;
            for (let x = 9; x < 247; x += 31) {
                rect(c, x, 100 + (x % 17), 2, 35, '#6b3939');
            }
            c.restore();
        }
        // Ceiling contamination and gentle illumination, never a full-screen flash.
        c.save();
        c.globalAlpha = s.light ? .24 : .10;
        const pool = c.createRadialGradient(128, 72, 3, 128, 78, 115);
        pool.addColorStop(0, '#b4d9b82b');
        pool.addColorStop(1, '#14242d00');
        rect(c, 0, 0, 256, 192, pool);
        c.restore();
        // Presence at the far end only on dramatic beats, not every fixed number of frames.
        const phase = s.flags?.copyistMemory;
        if (s.chase && phase?.phase === 'search' && s.threat >= 26 && s.threat < 52) {
            const breath = .5 + .5 * Math.sin(now * .0012);
            rect(c, 237, 69, 6, 43, `rgba(7,12,16,${(.10 + breath * .11).toFixed(3)})`);
        }
        if (s.tape) {
            label(c, 'REC 04  //  SEÑAL INESTABLE', 9, 60, 7, '#b79889');
        }
        // Feedback legible y discreto: acústica del suelo y decisiones tácticas.
        if (s.chase) {
            const tileX = Math.floor(s.rx), tileY = Math.floor(s.ry);
            const metal = (tileY === 9 && tileX >= 8 && tileX <= 13) || (tileX === 7 && tileY >= 3 && tileY <= 5);
            rect(c, 4, 166, 118, 17, '#071011c9');
            label(c, s.crouched ? 'SIGILO · SILENCIOSO' : metal ? 'REJILLA · RUIDO ALTO' : 'PASOS · AUDIBLES', 8, 176, 7, s.crouched ? '#acc3ad' : metal ? '#df9b90' : '#b7ad9e');
            label(c, 'TUERCAS ' + Math.max(0, 2 - (Number(s.flags?.kibaDecoysUsed) || 0)) + '/2', 169, 176, 7, '#c2b89e');
            const decoy = s.flags?.kibaDecoy;
            if (decoy && typeof decoy.atStep === 'number' && s.steps - decoy.atStep < 11) {
                rect(c, 6, 158, 4, 4, '#b7a580');
                label(c, 'ECO', 13, 162, 7, '#b7a580');
            }
        }
        // Tension is communicated by stable environmental cues, not a full-screen flash.
        const beats = Array.isArray(s.flags?.kibaChaseBeats) ? s.flags.kibaChaseBeats : [];
        if (s.chase && beats.includes('first-step')) {
            const pulse = (Math.sin(now * .003) + 1) * .5;
            c.save();
            c.globalAlpha = reduceEffects ? .06 : .10 + pulse * .07;
            rect(c, 4, 72, 248, 2, '#c1aca0');
            rect(c, 4, 76, 248, 1, '#70484b');
            c.restore();
        }
        const count = evidenceCount(found);
        label(c, `DOCS ${count}/4`, 197, 12, 7, '#b6b5a0');
    }
    else {
        // The cursed cartridge receives its own limited palette and environmental lore.
        for (let j = 0; j < 6; j++) {
            const x = 12 + ((j * 41 + 13) % 214), y = 119 + ((j * 23) % 26);
            rect(c, x, y, 9, 2, j % 2 ? '#91756b68' : '#324b506a');
        }
        label(c, 'KIBA OS / MEMORY COPY', 10, 154, 7, '#9fa89b');
    }
    // Film emulation: spatially stable grain rather than random flashes.
    if (!reduceEffects) {
        for (let i = 0; i < 26; i++) {
            const x = Math.floor(hash(i * 19 + Math.floor(now / 160)) * 255), y = Math.floor(hash(i * 41 + Math.floor(now / 180)) * 190);
            rect(c, x, y, 1, 1, i % 3 === 0 ? '#d0c6b538' : '#04090850');
        }
    }
}

// premium/DayOneAudio.js

class DayOneSoundscape {
    ctx = null;
    bus = null;
    voices = [];
    pan = null;
    noise = null;
    noiseGain = null;
    active = false;
    lastCue = 0;
    start(ctx) {
        if (this.active)
            return;
        this.ctx = ctx;
        this.bus = ctx.createGain();
        this.bus.gain.value = 0;
        this.pan = typeof ctx.createStereoPanner === 'function' ? ctx.createStereoPanner() : null;
        if (this.pan) {
            this.bus.connect(this.pan);
            this.pan.connect(ctx.destination);
        }
        else
            this.bus.connect(ctx.destination);
        for (const [wave, freq] of [['sine', 38], ['triangle', 53.4], ['sine', 91.7]]) {
            const node = ctx.createOscillator(), gain = ctx.createGain(), filter = ctx.createBiquadFilter();
            node.type = wave;
            node.frequency.value = freq;
            gain.gain.value = .1;
            filter.type = 'lowpass';
            filter.frequency.value = 240;
            node.connect(gain);
            gain.connect(filter);
            filter.connect(this.bus);
            node.start();
            this.voices.push({ node, gain, filter });
        }
        // Stable seed, audible as distant ventilation rather than a loud synthetic sting.
        const buffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate), data = buffer.getChannelData(0);
        let seed = 4042006;
        for (let i = 0; i < data.length; i++) {
            seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
            data[i] = (seed / 2147483648 - 1) * .18;
        }
        this.noise = ctx.createBufferSource();
        this.noise.buffer = buffer;
        this.noise.loop = true;
        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.value = 290;
        this.noiseGain = ctx.createGain();
        this.noiseGain.gain.value = .12;
        this.noise.connect(noiseFilter);
        noiseFilter.connect(this.noiseGain);
        this.noiseGain.connect(this.bus);
        this.noise.start();
        this.active = true;
    }
    update(s, now) {
        if (!this.active || !this.ctx || !this.bus)
            return;
        const t = this.ctx.currentTime, playing = s.day === 1 && s.mode === 'real' && !s.won;
        const near = Math.hypot(s.rx - s.entityX, s.ry - s.entityY);
        const terror = s.chase ? Math.max(0, 1 - near / 10) : 0;
        const finale = (s.flags?.kibaFinaleStage === 1 || s.flags?.kibaFinaleStage === 2) ? 1 : 0;
        const room = s.room === 'SOTANO TECNICO' ? 1.38 : s.room === 'ALA ESTE' ? 1.16 : s.room === 'ALA DE ARCHIVOS' ? .8 : .9;
        // Overall gain <= 0.018, quieter than notification effects.
        this.bus.gain.setTargetAtTime(playing ? (s.hidden ? .003 : s.crouched ? .0045 : .008 + terror * .006 + finale * .0025) * room : 0, t, .28);
        // El zumbido eléctrico responde a la cercanía de luminarias reales del mapa.
        const nearest = nearestKibaLamps(s.rx, s.ry, s.day === 1 ? KIBA_LAMPS : []);
        // El mapa no se reconstruye desde Web Audio: la lista autoral permanece fija.
        const lamp = nearest[0];
        const electric = lamp ? Math.max(0, 1 - Math.hypot(s.rx - lamp.x, s.ry - lamp.z) / 5) : 0;
        const baseline = s.room === 'SOTANO TECNICO' ? 34 : s.room === 'ALA ESTE' ? 41 : 38;
        this.voices.forEach((v, i) => {
            v.node.frequency.setTargetAtTime((i === 0 ? baseline : i === 1 ? baseline * 1.406 : baseline * 2.413) + (terror * 3.1) + (Math.sin(now * .00027 + i) * .7) + (finale * (i === 1 ? -1.35 : 1.9)), t, .35);
            v.filter.frequency.setTargetAtTime(playing ? 170 + (s.threat * 1.75) + i * 50 + electric * 25 : 110, t, .35);
            v.gain.gain.setTargetAtTime(i === 0 ? .32 : i === 1 ? .10 + electric * .025 : .052, t, .4);
        });
        this.noiseGain?.gain.setTargetAtTime(playing ? (s.room === 'ALA DE ARCHIVOS' ? .23 + finale * .04 : .12 + finale * .04) : 0, t, .35);
        const ang = s.dir * Math.PI / 2;
        const toRight = (s.entityX - s.rx) * Math.cos(ang) + (s.entityY - s.ry) * Math.sin(ang);
        this.pan?.pan.setTargetAtTime(s.chase ? Math.max(-.7, Math.min(.7, toRight / Math.max(1, near))) : Math.sin(now * .00024) * .12, t, .3);
    }
    /** Authored cues: brief, deliberately quiet, never autoplayed. */
    cue(kind, s) {
        if (!this.active || !this.ctx || s.day !== 1)
            return false;
        const profiles = {
            paper: [290, .28, 'triangle', .006], glass: [610, .45, 'sine', .005], light: [115, .23, 'triangle', .004],
            breath: [66, .74, 'sine', .009], tape: [71, .6, 'sawtooth', .006],
            heartbeat: [52, .24, 'sine', .008], hide: [86, .3, 'sine', .005],
            gate: [130, .8, 'sawtooth', .006], vent: [320, .55, 'square', .005], decoy: [580, .42, 'triangle', .009], stepMetal: [140, .085, 'square', .004], stepQuiet: [47, .040, 'sine', .001], sneak: [84, .09, 'sine', .003], finaleStart: [81, 1.3, 'triangle', .005], finaleCrossing: [108, 1.1, 'sine', .006], finaleEscape: [260, 1.8, 'triangle', .007], finaleFail: [51, .9, 'sine', .004]
        };
        const profile = profiles[kind];
        if (!profile)
            return false;
        const [freq, duration, wave, volume] = profile;
        const node = this.ctx.createOscillator(), gain = this.ctx.createGain(), t = this.ctx.currentTime;
        node.type = wave;
        node.frequency.value = freq;
        gain.gain.value = 0;
        gain.gain.setTargetAtTime(volume, t, .02);
        gain.gain.setTargetAtTime(0, t + duration * .42, .11);
        node.connect(gain);
        gain.connect(this.bus ?? this.ctx.destination);
        node.start();
        node.stop(t + duration);
        // Disconnect after node ends, without keeping the soundscape alive on shutdown.
        node.onended = () => { node.disconnect(); gain.disconnect(); };
        this.lastCue = t;
        return true;
    }
    stop() {
        if (!this.active)
            return;
        for (const v of this.voices) {
            try {
                v.node.stop();
            }
            catch { }
            v.node.disconnect();
            v.gain.disconnect();
            v.filter.disconnect();
        }
        try {
            this.noise?.stop();
        }
        catch { }
        this.noise?.disconnect();
        this.noiseGain?.disconnect();
        this.bus?.disconnect();
        this.pan?.disconnect();
        this.voices = [];
        this.noise = null;
        this.noiseGain = null;
        this.bus = null;
        this.pan = null;
        this.ctx = null;
        this.active = false;
    }
    isRunning() { return this.active; }
}

// premium/FastRaycaster.js
function castGridRay(map, px, py, angle, maxDist = 16.81) {
    const dx = Math.sin(angle), dy = -Math.cos(angle);
    let tileX = Math.floor(px), tileY = Math.floor(py);
    const sx = dx >= 0 ? 1 : -1, sy = dy >= 0 ? 1 : -1;
    const invX = Math.abs(dx) > 1e-12 ? 1 / Math.abs(dx) : Infinity;
    const invY = Math.abs(dy) > 1e-12 ? 1 / Math.abs(dy) : Infinity;
    let tx = (dx >= 0 ? tileX + 1 - px : px - tileX) * invX;
    let ty = (dy >= 0 ? tileY + 1 - py : py - tileY) * invY;
    for (let i = 0; i < 128; i++) {
        const vertical = tx < ty;
        const dist = vertical ? tx : ty;
        if (!Number.isFinite(dist) || dist > maxDist)
            break;
        if (vertical) {
            tileX += sx;
            tx += invX;
        }
        else {
            tileY += sy;
            ty += invY;
        }
        const row = map[tileY];
        if (!row || row[tileX] !== '#' && row[tileX] !== undefined)
            continue;
        const x = px + dx * dist, y = py + dy * dist;
        const t = vertical ? y : x;
        return { dist, x, y, u: t - Math.floor(t), vertical };
    }
    return { dist: maxDist, x: px + dx * maxDist, y: py + dy * maxDist, u: 0, vertical: false };
}
/** Permite reutilizar geometría estacionaria sin cachear personajes o UI. */
function sceneGeometryKey(s) {
    const f = s.flags || {};
    return [s.day, s.rx, s.ry, s.dir, Number.isFinite(s.cameraYaw) ? s.cameraYaw.toFixed(3) : '', Number.isFinite(s.cameraPitch) ? s.cameraPitch.toFixed(3) : '', s.light ? 1 : 0, f.kibaNorthOpen ? 1 : 0, f.kibaArchiveOpen ? 1 : 0].join('/');
}

// premium/AnalogMaterials.js
/** NAMELESS 404 v0.28: materiales analógicos originales, sin assets extraídos.
 * Pintura dañada, papel húmedo, azulejo, hormigón y compuertas.
 * Las texturas se hornean una sola vez en 128×192 y después se proyectan en
 * el raycaster. No hay ruido aleatorio dependiente del tiempo.
 */
const MATERIAL_WIDTH = 128;
const MATERIAL_HEIGHT = 192;
const MATERIAL_NAMES = ['yeso descascarillado', 'azulejo verdoso', 'hormigón húmedo', 'puerta industrial', 'papel floral desvaído'];
const atlas = new Map();
function rand(x, y, s) {
    let n = (Math.imul(x + 13, 73856093) ^ Math.imul(y + 71, 19349663) ^ Math.imul(s + 17, 83492791)) | 0;
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
}
function clampByte(n) { return Math.max(0, Math.min(255, n | 0)); }
function shadePixel(kind, x, y, seed) {
    const grain = (rand(x, y, seed) - .5) * 26, cell = rand(x >> 3, y >> 3, seed + 2), drip = rand(x >> 2, 0, seed + 19);
    const stain = rand(x >> 4, y >> 4, seed + 44) > .74 && y > 45 ? .65 : 1;
    const high = kind === 0 ? (y < 115 ? [128, 140, 121] : [60, 83, 73]) :
        kind === 1 ? [120, 139, 124] : kind === 2 ? [101, 107, 100] : kind === 3 ? [74, 91, 88] : [155, 142, 117];
    let scale = (.87 + cell * .21) * stain;
    if (kind === 0) {
        if (y > 111 && y < 118)
            scale = .34;
        if (y > 171)
            scale = .43;
        if (y < 110 && drip > .83 && y > 65 + (1 - drip) * 110)
            scale *= .53;
        if (rand(x >> 4, y >> 4, seed + 3) > .9 && y < 110)
            scale *= .66;
    }
    if (kind === 1) {
        if ((x % 32 <= 1) || (y % 32 <= 1))
            scale *= .37;
        if (y > 175)
            scale *= .64;
        if (x % 32 > 3 && x % 32 < 7 && y % 32 > 2 && y % 32 < 8)
            scale *= .83;
    }
    if (kind === 2) {
        if (y > 172)
            scale *= .61;
        if (rand(x >> 2, y >> 2, seed + 4) > .92)
            scale *= .47;
        if (drip > .90 && y > 25 + (1 - drip) * 300)
            scale *= .49;
    }
    if (kind === 3) {
        if (x < 7 || x > 120 || y < 7 || y > 183)
            scale *= .48;
        if (x > 12 && x < 116 && y > 12 && y < 181)
            scale *= .89;
        if (x % 11 === 0 && y > 18 && y < 172)
            scale *= .85;
        if (drip > .9 && y > 70)
            scale *= .54;
    }
    if (kind === 4) {
        if (y > 150)
            scale *= .55;
        const motif = Math.abs(((x + y * 2) % 29) - 14);
        if (motif < 2 && y > 15 && y < 152)
            scale *= .67;
        if (((x >> 3) + (y >> 4)) % 9 === 0)
            scale *= .71;
    }
    return [clampByte(high[0] * scale + grain + 3), clampByte(high[1] * scale + grain), clampByte(high[2] * scale + grain - 2)];
}
function analogMaterial(kind, day = 1) {
    const k = ((kind % 5) + 5) % 5, cacheKey = `${day}/${k}`;
    const cached = atlas.get(cacheKey);
    if (cached)
        return cached;
    const c = document.createElement('canvas');
    c.width = MATERIAL_WIDTH;
    c.height = MATERIAL_HEIGHT;
    const ctx = c.getContext('2d');
    const id = ctx.createImageData(MATERIAL_WIDTH, MATERIAL_HEIGHT);
    for (let y = 0; y < MATERIAL_HEIGHT; y++)
        for (let x = 0; x < MATERIAL_WIDTH; x++) {
            const [r, g, b] = shadePixel(k, x, y, day * 37 + k * 103);
            const i = (y * MATERIAL_WIDTH + x) * 4;
            id.data[i] = r;
            id.data[i + 1] = g;
            id.data[i + 2] = b;
            id.data[i + 3] = 255;
        }
    ctx.putImageData(id, 0, 0);
    const band = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };
    // Hendiduras y grietas pintadas a mano sobre el bitmap, NO recursos de terceros.
    ctx.lineWidth = 1;
    for (let i = 0; i < (k === 3 ? 9 : 24); i++) {
        const x = 5 + Math.floor(rand(i, 3, day * 21 + k) * 116);
        const y = 8 + Math.floor(rand(i, 7, day * 3 + k) * 155);
        ctx.strokeStyle = i % 3 === 0 ? 'rgba(9,26,23,.48)' : 'rgba(18,35,33,.28)';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + (i % 3 - 1) * 3, y + 7);
        ctx.lineTo(x + ((i + 2) % 5 - 2) * 4, y + 12 + i % 8);
        ctx.stroke();
    }
    if (k === 0) {
        // Desprendimientos de pintura que dejan ver la capa de yeso y ladrillo.
        for (let i = 0; i < 16; i++) {
            const x = 3 + ((i * 47 + 21) % 111), y = 12 + ((i * 71 + 13) % 125);
            const w = 4 + i % 5 * 3, h = 2 + (i * 3) % 7;
            band(x, y, w, h, 'rgba(40,65,56,.48)');
            band(x + 2, y + 1, Math.max(1, w - 5), Math.max(1, h - 2), 'rgba(170,159,127,.37)');
        }
        band(0, 112, 128, 3, '#324a40');
        band(0, 173, 128, 7, '#273d38');
        band(0, 181, 128, 11, '#162822');
    }
    else if (k === 1) {
        for (let y = 0; y < 192; y += 32) {
            band(0, y, 128, 2, 'rgba(28,53,49,.7)');
            for (let x = 0; x < 128; x += 32)
                band(x, y, 2, 32, 'rgba(24,48,44,.65)');
        }
        band(0, 174, 128, 5, '#2e5652');
    }
    else if (k === 3) {
        // Puerta con visor, placa, bisagras y pomo a la altura natural.
        band(10, 15, 108, 161, 'rgba(13,27,27,.18)');
        band(17, 28, 94, 36, '#1c3434');
        band(23, 34, 82, 24, '#2b5050');
        band(23, 52, 82, 2, '#557575');
        band(19, 72, 88, 3, '#293f3f');
        band(19, 161, 88, 4, '#223f3a');
        band(92, 105, 7, 23, '#b4aa7b');
        band(85, 112, 19, 5, '#dac9a1');
        for (const y of [28, 156]) {
            band(11, y, 6, 15, '#8d947e');
            band(12, y + 3, 4, 5, '#293b39');
        }
        band(43, 78, 38, 14, '#d6c7a4');
        band(47, 83, 31, 2, '#403d33');
        band(47, 87, 24, 1, '#655345');
    }
    else if (k === 4) {
        band(0, 153, 128, 6, '#465e52');
        band(0, 174, 128, 18, '#2c433d');
    }
    atlas.set(cacheKey, c);
    return c;
}
function materialAtlasStats() { return { kinds: MATERIAL_NAMES.length, width: MATERIAL_WIDTH, height: MATERIAL_HEIGHT, generated: atlas.size }; }

// premium/KibaSetpieces.js
const KIBA_SETPIECES = [
    { id: 'lobby', cellX: 4, cellZ: 1, side: 'N', name: 'Vestíbulo — recepción de la ausencia' },
    { id: 'east', cellX: 14, cellZ: 3, side: 'E', name: 'Ala este — galería de correspondencia' },
    { id: 'archive', cellX: 1, cellZ: 8, side: 'W', name: 'Archivo — nombres cancelados' },
    { id: 'basement', cellX: 14, cellZ: 11, side: 'E', name: 'Sótano — contador de horas' }
];
function validKibaSetpiece(map, p) {
    const { cellX: x, cellZ: z, side } = p;
    const dx = side === 'W' ? -1 : side === 'E' ? 1 : 0;
    const dz = side === 'N' ? -1 : side === 'S' ? 1 : 0;
    return map[z]?.[x] !== undefined && map[z][x] !== '#' && map[z + dz]?.[x + dx] === '#';
}
function visibleKibaSetpieces(map) {
    return KIBA_SETPIECES.filter(p => validKibaSetpiece(map, p));
}
const SETPIECE_COLORS = {
    iron: [.24, .31, .30], ironLight: [.44, .49, .43], aged: [.45, .42, .34], paper: [.70, .66, .52],
    dark: [.055, .090, .095], fog: [.24, .41, .37], wood: [.28, .20, .15], red: [.54, .20, .18],
    brass: [.55, .44, .23], glass: [.16, .32, .34], green: [.39, .57, .45], bulb: [.71, .79, .58]
};
function buildKibaSetpieces(map) {
    const result = [];
    for (const p of visibleKibaSetpieces(map)) {
        const ns = p.side === 'N' || p.side === 'S';
        const ax = p.cellX + .5, az = p.cellZ + .5;
        // u across the wall; v is distance from the wall INTO the walkable cell.
        const put = (name, u, y, v, w, h, d, color, emissive = false) => {
            const x = ns ? ax + u : (p.side === 'W' ? p.cellX + v : p.cellX + 1 - v);
            const z = ns ? (p.side === 'N' ? p.cellZ + v : p.cellZ + 1 - v) : az + u;
            result.push({ id: `set-${p.id}-${name}`, x, y, z, width: ns ? w : d, height: h, depth: ns ? d : w, color, emissive });
        };
        // Wall trim and architecture: the same silhouette for both real 3D backends.
        put('foundation', 0, .13, .06, .97, .26, .085, SETPIECE_COLORS.dark);
        put('cornice', 0, 2.12, .052, .96, .12, .075, SETPIECE_COLORS.aged);
        for (const u of [-.47, .47]) {
            put('pillar' + u, u, 1.10, .045, .055, 2.04, .07, SETPIECE_COLORS.iron);
            put('pillar-inlay' + u, u, 1.34, .090, .025, .79, .015, SETPIECE_COLORS.ironLight);
        }
        put('backing', 0, 1.20, .072, .86, 1.76, .05, SETPIECE_COLORS.dark);
        put('upper-sconce', 0, 2.06, .115, .65, .09, .07, SETPIECE_COLORS.iron);
        put('fluorescent', 0, 2.07, .157, .53, .035, .025, SETPIECE_COLORS.bulb, true);
        if (p.id === 'lobby') {
            put('noticeboard', 0, 1.56, .116, .78, .73, .035, SETPIECE_COLORS.wood);
            put('paper-1', -.23, 1.56, .14, .23, .53, .012, SETPIECE_COLORS.paper);
            put('paper-2', .10, 1.50, .14, .35, .40, .012, SETPIECE_COLORS.aged);
            put('reception-counter', 0, .78, .29, .86, .12, .28, SETPIECE_COLORS.wood);
            put('counter-trim', 0, .84, .30, .91, .02, .29, SETPIECE_COLORS.brass);
            put('speaker', .32, 1.07, .18, .16, .21, .10, SETPIECE_COLORS.iron);
            for (let i = 0; i < 4; i++)
                put('speaker-grille-' + i, .30, 1.02 + i * .045, .24, .10, .012, .01, SETPIECE_COLORS.dark);
            put('bell', -.29, .92, .33, .10, .11, .12, SETPIECE_COLORS.brass);
            put('bell-button', -.29, .98, .33, .047, .02, .04, SETPIECE_COLORS.red);
        }
        else if (p.id === 'east') {
            for (let i = 0; i < 3; i++) {
                const u = -.27 + i * .27;
                put('mailbox-' + i, u, 1.28, .15, .24, .69, .15, SETPIECE_COLORS.iron);
                put('slot-' + i, u, 1.48, .24, .17, .045, .012, SETPIECE_COLORS.dark);
                put('label-' + i, u, 1.32, .241, .16, .08, .012, SETPIECE_COLORS.paper);
                put('handle-' + i, u, 1.04, .25, .08, .022, .018, SETPIECE_COLORS.brass);
            }
            put('broken-clock', .04, 1.92, .16, .33, .32, .04, SETPIECE_COLORS.aged);
            put('clock-hand', .06, 1.91, .19, .017, .18, .015, SETPIECE_COLORS.red);
        }
        else if (p.id === 'archive') {
            for (let i = 0; i < 4; i++) {
                const y = .42 + i * .38;
                put('drawer-' + i, 0, y, .20, .76, .35, .23, i % 2 ? SETPIECE_COLORS.iron : SETPIECE_COLORS.ironLight);
                put('drawer-face-' + i, 0, y, .327, .68, .29, .02, SETPIECE_COLORS.iron);
                put('drawer-slip-' + i, -.17, y, .345, .22, .075, .012, SETPIECE_COLORS.paper);
                put('drawer-handle-' + i, .18, y - .04, .349, .16, .025, .016, SETPIECE_COLORS.brass);
            }
            put('ragged-archives', .32, 1.93, .17, .15, .25, .20, SETPIECE_COLORS.paper);
        }
        else {
            put('meter-back', 0, 1.42, .18, .69, 1.16, .22, SETPIECE_COLORS.iron);
            for (let i = 0; i < 3; i++) {
                const u = -.22 + i * .22;
                put('meter-frame-' + i, u, 1.60, .312, .19, .24, .025, SETPIECE_COLORS.aged);
                put('meter-glass-' + i, u, 1.61, .331, .13, .13, .014, SETPIECE_COLORS.glass, true);
                put('meter-needle-' + i, u + .03, 1.60, .341, .011, .095, .012, SETPIECE_COLORS.red);
            }
            for (let i = 0; i < 4; i++)
                put('pipe-' + i, -.36 + i * .24, .74, .20, .045, .52, .043, i % 2 ? SETPIECE_COLORS.brass : SETPIECE_COLORS.ironLight);
            put('alarm', .32, 1.13, .342, .09, .08, .024, SETPIECE_COLORS.red, true);
            put('sticker', 0, .93, .34, .47, .08, .015, SETPIECE_COLORS.paper);
        }
    }
    return result;
}
const setpieceAtlas = new Map();
/** Hand-authored bitmap at DS scale, for the Canvas2D compatibility renderer. */
function kibaSetpieceTexture(kind) {
    const existing = setpieceAtlas.get(kind);
    if (existing)
        return existing;
    const canvas = document.createElement('canvas');
    canvas.width = 240;
    canvas.height = 320;
    const g = canvas.getContext('2d');
    g.imageSmoothingEnabled = false;
    const fill = (x, y, w, h, color) => { g.fillStyle = color; g.fillRect(x, y, w, h); };
    const stroke = (x, y, w, h, color) => { g.strokeStyle = color; g.lineWidth = 2; g.strokeRect(x, y, w, h); };
    const ink = (t, x, y, size = 10, c = '#c5c4ad') => { g.fillStyle = c; g.font = `bold ${size}px monospace`; g.fillText(t, x, y); };
    fill(0, 0, 240, 320, kind === 'basement' ? '#252827' : '#29332f');
    for (let y = 0; y < 320; y += 5)
        fill(0, y, 240, 1, `rgba(13,19,17,${.18 + (y % 25) * .006})`);
    for (let i = 0; i < 130; i++) {
        const x = (i * 137 + 53) % 239, y = (i * i * 19 + i * 41) % 318;
        fill(x, y, 2 + i % 4, 1, i % 3 ? '#111a1938' : '#a1a18b24');
    }
    fill(5, 5, 230, 39, '#101a1a');
    stroke(5, 5, 230, 39, '#8b9280');
    fill(7, 48, 8, 255, '#59675e');
    fill(225, 48, 8, 255, '#58675e');
    fill(12, 303, 216, 12, '#121c1b');
    const heading = { lobby: 'KIBA / REGISTRO', east: 'CORREO / ALA E', archive: 'ARCHIVO / 1988', basement: 'HORAS / 04:04' }[kind];
    ink(heading, 17, 25, 16, '#d6d0b2');
    ink('ESTA PLANTA NO FIGURA', 17, 37, 8, '#a49e88');
    if (kind === 'lobby') {
        fill(17, 58, 206, 145, '#594c3e');
        stroke(19, 60, 202, 141, '#ad9a74');
        for (let i = 0; i < 4; i++) {
            const x = 25 + i * 48;
            fill(x, 69, 43, 109, i % 2 ? '#b3af95' : '#ccc2a2');
            stroke(x, 69, 43, 109, '#4c5145');
            fill(x + 7, 81, 29, 4, '#555548');
            for (let q = 0; q < 6; q++)
                fill(x + 7, 94 + q * 11, 26 - (q % 3) * 3, 2, '#696a57');
            fill(x + 6, 153, 31, 15, i % 3 ? '#716d5d' : '#513435');
        }
        fill(20, 214, 198, 64, '#3b312b');
        fill(20, 214, 198, 7, '#aa9977');
        ink('REGISTRO DE ENTRADAS', 31, 240, 12, '#d4c6a2');
        ink('04:04   /  SIN NOMBRE', 31, 262, 11, '#b78c79');
        fill(192, 241, 13, 9, '#9c4c49');
    }
    else if (kind === 'east') {
        for (let i = 0; i < 3; i++) {
            const x = 19 + i * 72;
            fill(x, 65, 65, 155, '#51625c');
            stroke(x, 65, 65, 155, '#87938a');
            fill(x + 6, 75, 53, 39, '#253935');
            fill(x + 11, 87, 40, 7, '#b1a48a');
            fill(x + 9, 126, 47, 75, '#34423e');
            stroke(x + 9, 126, 47, 75, '#6c796d');
            fill(x + 15, 140, 32, 18, '#b3ad92');
            ink('SIN', x + 20, 151, 10, '#343b35');
            fill(x + 17, 179, 27, 4, '#b1a17b');
        }
        fill(15, 233, 210, 42, '#131f1f');
        ink('BUZONES CLAUSURADOS', 20, 250, 13);
        ink('DEVOLVER AL REMITENTE', 20, 266, 9, '#b89186');
    }
    else if (kind === 'archive') {
        for (let i = 0; i < 5; i++) {
            const y = 59 + i * 43;
            fill(20, y, 200, 38, '#4e625b');
            stroke(20, y, 200, 38, '#82948a');
            fill(28, y + 5, 184, 25, '#273932');
            fill(39, y + 12, 67, 10, '#c8bda0');
            fill(152, y + 14, 42, 5, '#c5aa7d');
            ink(('0' + (i + 1) + ' / XXXX'), 42, y + 21, 8, '#47483e');
        }
        fill(17, 287, 207, 17, '#3d211f');
        ink('NO EXISTE EL EXPEDIENTE', 25, 299, 9, '#cfb29c');
    }
    else {
        fill(19, 61, 202, 199, '#3f514c');
        stroke(19, 61, 202, 199, '#8f9888');
        for (let i = 0; i < 3; i++) {
            const x = 30 + i * 66;
            fill(x, 83, 57, 71, '#181f21');
            stroke(x, 83, 57, 71, '#9c9b85');
            fill(x + 7, 94, 43, 47, '#2c514b');
            g.strokeStyle = '#b0bc9e';
            g.lineWidth = 3;
            g.beginPath();
            g.arc(x + 28, 115, 16, Math.PI, 0);
            g.stroke();
            fill(x + 27, 99, 2, 18, '#ba5145');
            ink('00' + (i + 1), x + 12, 147, 9, '#b5bd9f');
        }
        for (let i = 0; i < 4; i++) {
            fill(37 + i * 47, 177, 21, 50, '#758278');
            fill(42 + i * 47, 181, 11, 41, '#2f4644');
        }
        fill(31, 236, 177, 13, '#a9a38c');
        ink('NO REBOBINAR', 61, 246, 11, '#4a3932');
        fill(20, 272, 199, 22, '#221d1e');
        ink('EL TIEMPO NO SE DEVUELVE', 28, 286, 10, '#c59d8e');
    }
    setpieceAtlas.set(kind, canvas);
    return canvas;
}
/** Prevent the old generic room fixture from occupying the same wall as a
 * new authored setpiece. Explicit IDs keep every other room fixture intact. */
function legacyRoomFixtureShadowed(id) {
    return /^(?:room-)?(?:evacuation|vending|archive-left|generator)(?:-|$)/.test(id);
}

// premium/KibaSignatureRoom.js
const KIBA_SIGNATURE = { x: 2.5, z: 1.07, cellX: 2, cellZ: 1 };
const SIGNATURE_COLORS = {
    metal: [.25, .31, .30], dark: [.055, .085, .09], wood: [.28, .22, .17], paper: [.73, .69, .54],
    glow: [.34, .72, .60], rubber: [.12, .16, .17], red: [.65, .22, .16], brass: [.51, .43, .25],
    dust: [.43, .43, .37], blue: [.19, .39, .44]
};
function isSignatureRoomValid(map) {
    return map[1]?.[2] !== undefined && map[1][2] !== '#' && map[0]?.[2] === '#';
}
function buildSignatureRoom(map) {
    if (!isSignatureRoomValid(map))
        return [];
    const parts = [];
    const put = (id, x, y, depth, w, h, d, color, emissive = false) => {
        parts.push({ id: 'signature-' + id, x: KIBA_SIGNATURE.x + x, y, z: 1 + depth, width: w, height: h, depth: d, color, emissive });
    };
    // The depth of every component stays within 0.44 m of the north wall.
    put('backplate', 0, 1.28, .017, .89, 1.66, .035, SIGNATURE_COLORS.metal);
    put('backboard', 0, 1.43, .039, .83, 1.25, .03, SIGNATURE_COLORS.dark);
    put('header', 0, 2.02, .059, .86, .14, .035, SIGNATURE_COLORS.paper);
    put('undersign', 0, 1.89, .068, .79, .033, .018, SIGNATURE_COLORS.red);
    for (let i = 0; i < 3; i++) {
        const x = -.29 + i * .29;
        put('screen-case-' + i, x, 1.57, .111, .26, .34, .115, SIGNATURE_COLORS.metal);
        put('screen-glass-' + i, x, 1.57, .176, .215, .258, .016, i === 1 ? SIGNATURE_COLORS.blue : SIGNATURE_COLORS.glow, true);
        put('screen-sweep-' + i, x, 1.59, .186, .17, .02, .009, SIGNATURE_COLORS.paper, true);
        for (let j = 0; j < 3; j++)
            put(`screen-signal-${i}-${j}`, x - .06 + j * .048, 1.50 + j * .025, .189, .033, .009, .008, SIGNATURE_COLORS.dark);
        put('screen-led-' + i, x + .10, 1.39, .186, .027, .023, .012, i === 2 ? SIGNATURE_COLORS.red : SIGNATURE_COLORS.brass, true);
    }
    put('desk', 0, .82, .268, .92, .09, .34, SIGNATURE_COLORS.wood);
    put('desk-edging', 0, .87, .276, .92, .018, .36, SIGNATURE_COLORS.brass);
    for (const x of [-.38, .38]) {
        put('desk-leg-' + x, x, .42, .30, .064, .78, .11, SIGNATURE_COLORS.metal);
        for (let j = 0; j < 2; j++)
            put('drawer-' + x + '-' + j, x, .48 + j * .23, .405, .17, .20, .016, SIGNATURE_COLORS.metal);
    }
    put('cassette-deck', -.10, 1.02, .29, .40, .18, .20, SIGNATURE_COLORS.dark);
    put('cassette-window', -.10, 1.05, .395, .26, .075, .011, SIGNATURE_COLORS.blue);
    for (let i = 0; i < 2; i++) {
        const x = -.20 + i * .20;
        put('cassette-hub-' + i, x, 1.07, .402, .048, .045, .013, SIGNATURE_COLORS.paper);
    }
    put('deck-led', -.27, 1.00, .405, .027, .022, .01, SIGNATURE_COLORS.red, true);
    put('log-book', .28, .93, .29, .24, .018, .15, SIGNATURE_COLORS.paper);
    put('pen', .30, .946, .29, .013, .02, .19, SIGNATURE_COLORS.brass);
    put('cable-trunk', -.43, 1.18, .20, .026, .75, .025, SIGNATURE_COLORS.rubber);
    put('cable-hub', .41, 1.19, .21, .031, .70, .035, SIGNATURE_COLORS.rubber);
    for (let j = 0; j < 5; j++) {
        const x = -.4 + j * .19;
        put('vent-' + j, x, .21, .035, .13, .036, .02, SIGNATURE_COLORS.dark);
    }
    return parts;
}
/** One prerendered canvas texture for the fallback: detailed paintwork is
 * authored once, then projected and depth-checked each visible frame. */
let signatureArtCache = null;
function signatureTexture() {
    if (signatureArtCache)
        return signatureArtCache;
    signatureArtCache = document.createElement('canvas');
    signatureArtCache.width = 256;
    signatureArtCache.height = 336;
    const c = signatureArtCache.getContext('2d');
    c.imageSmoothingEnabled = false;
    const box = (x, y, w, h, color) => { c.fillStyle = color; c.fillRect(x, y, w, h); };
    const stroke = (x, y, w, h, color) => { c.strokeStyle = color; c.lineWidth = 2; c.strokeRect(x, y, w, h); };
    const txt = (s, x, y, size = 10, col = '#c6c9aa') => { c.fillStyle = col; c.font = `bold ${size}px monospace`; c.fillText(s, x, y); };
    // Scuffed steel behind the monitors, weathering is fixed—not frame-noise.
    box(0, 0, 256, 336, '#202a27');
    for (let y = 0; y < 336; y += 3) {
        const v = ((y * 17 + 79) % 31);
        box(0, y, 256, 1, `rgba(107,120,101,${.025 + v / 900})`);
    }
    for (let i = 0; i < 170; i++) {
        const x = (i * 139 + 37) % 256, y = (i * 71 + i * i * 13) % 336;
        box(x, y, 2 + i % 5, 1, i % 4 === 0 ? '#8e917324' : '#060e112c');
    }
    box(8, 8, 240, 47, '#0c1718');
    stroke(8, 8, 240, 47, '#73847b');
    box(13, 13, 230, 4, '#70857a');
    txt('KIBA  /  SEGURIDAD', 18, 34, 17, '#d5d2ad');
    txt('ESTACION 01     04:04', 18, 48, 10, '#9eaf9b');
    for (let i = 0; i < 3; i++) {
        const x = 12 + i * 79;
        box(x, 67, 75, 123, '#0d1315');
        stroke(x, 67, 75, 123, '#87938a');
        box(x + 5, 73, 65, 101, i === 1 ? '#102b31' : '#0a2924');
        // CCTV-like geometric corridors, decreasing trapezoid lines and doors.
        for (let k = 0; k < 6; k++) {
            const inset = k * 4;
            stroke(x + 9 + inset, 82 + inset, 57 - inset * 2, 68 - inset * 2, `rgba(103,190,157,${.21 + k * .042})`);
        }
        box(x + 9, 133, 55, 2, i === 1 ? '#69898b' : '#65a58a');
        box(x + 9, 145 + (i % 2) * 11, 30, 1, '#c0b39a');
        box(x + 7, 177, 61, 10, '#172321');
        txt('CAM ' + (i + 1), x + 13, 185, 9, '#a5a98c');
        box(x + 68, 177, 3, 3, i === 2 ? '#ba453d' : '#96b678');
    }
    // Deck, twin reels, moving-image illusion from fixed layers.
    box(6, 200, 244, 120, '#3c3027');
    box(6, 200, 244, 5, '#9d8a65');
    box(10, 210, 158, 98, '#0c191b');
    stroke(10, 210, 158, 98, '#6a766d');
    box(18, 219, 142, 53, '#284247');
    for (const [cx, cy] of [[60, 244], [119, 244]]) {
        c.strokeStyle = '#ccc9a7';
        c.lineWidth = 4;
        c.beginPath();
        c.arc(cx, cy, 19, 0, Math.PI * 2);
        c.stroke();
        c.fillStyle = '#181d1f';
        c.beginPath();
        c.arc(cx, cy, 6, 0, Math.PI * 2);
        c.fill();
        for (let a = 0; a < 6; a++) {
            const t = a * Math.PI / 3;
            c.strokeStyle = '#6b7971';
            c.lineWidth = 2;
            c.beginPath();
            c.moveTo(cx + Math.cos(t) * 9, cy + Math.sin(t) * 9);
            c.lineTo(cx + Math.cos(t) * 17, cy + Math.sin(t) * 17);
            c.stroke();
        }
    }
    txt('PLAY >  REC 04', 19, 290, 11, '#c6d2ba');
    box(140, 280, 8, 7, '#ba4d46');
    // Handwritten evidence sheet and smeared pencil strokes.
    box(176, 209, 69, 98, '#b4b09a');
    box(178, 214, 65, 4, '#d4d0b6');
    txt('NOMBRE:', 181, 233, 9, '#333e3b');
    txt('________', 181, 245, 10, '#404945');
    txt('04/04', 183, 263, 10, '#604843');
    for (let j = 0; j < 5; j++)
        box(182, 272 + j * 5, 36 + j % 2 * 11, 1, '#5f6560');
    box(0, 323, 256, 13, '#141c1b');
    txt('NO REBOBINAR', 67, 333, 10, '#9b6b5b');
    return signatureArtCache;
}

// premium/KibaAtrium.js
const KIBA_ATRIUM_PANELS = [
    { id: 'directory', x: 1, z: 1, side: 'N', title: 'PLANO DEL EDIFICIO / 1996' },
    { id: 'clock', x: 5, z: 1, side: 'N', title: 'RELOJ DETENIDO' },
    { id: 'switchboard', x: 1, z: 2, side: 'W', title: 'CUADRO DE LLAMADAS' },
    { id: 'memorial', x: 4, z: 3, side: 'S', title: 'LISTA DE AUSENTES' }
];
const KIBA_ATRIUM_CELLS = [
    [1, 1], [2, 1], [3, 1], [4, 1], [5, 1],
    [1, 2], [2, 2], [3, 2], [4, 2], [5, 2],
    [1, 3], [2, 3], [3, 3], [4, 3], [5, 3]
];
const ATRIUM_COLORS = {
    floor: [.20, .29, .26], seam: [.10, .15, .15], ceramic: [.43, .49, .39], dark: [.065, .105, .11],
    concrete: [.30, .37, .34], marble: [.48, .47, .37], rust: [.38, .24, .18], brass: [.66, .54, .29],
    green: [.27, .46, .38], glass: [.17, .30, .30], paper: [.73, .68, .52], light: [.84, .85, .61],
    paint: [.48, .52, .42], wood: [.27, .20, .15], red: [.58, .23, .18]
};
const atriumIsOpen = (map, x, z) => map[z]?.[x] !== undefined && map[z][x] !== '#';
function isAtriumCell(map, x, z) {
    return x >= 1 && x <= 5 && z >= 1 && z <= 3 && atriumIsOpen(map, x, z);
}
function validAtriumPanel(map, p) {
    const dx = p.side === 'E' ? 1 : p.side === 'W' ? -1 : 0;
    const dz = p.side === 'S' ? 1 : p.side === 'N' ? -1 : 0;
    return isAtriumCell(map, p.x, p.z) && map[p.z + dz]?.[p.x + dx] === '#';
}
function buildKibaAtrium(map) {
    const a = [];
    const box = (id, x, y, z, width, height, depth, color, emissive = false) => {
        if (![x, y, z, width, height, depth].every(Number.isFinite) || width <= 0 || height <= 0 || depth <= 0)
            throw Error('Atrium geometry invalid: ' + id);
        a.push({ id: 'atrium-' + id, x, y, z, width, height, depth, color, emissive });
    };
    for (const [x, z] of KIBA_ATRIUM_CELLS) {
        if (!isAtriumCell(map, x, z))
            continue;
        const cx = x + .5, cz = z + .5;
        // Conjuntos completos de suelo, techo y borde de baldosas; las ranuras
        // se recortan dentro de la casilla, no crean física ni paredes invisibles.
        box(`tile-${x}-${z}`, cx, .023, cz, .973, .014, .973, ((x + z) % 4 === 0) ? ATRIUM_COLORS.ceramic : ATRIUM_COLORS.floor);
        box(`joint-long-${x}-${z}`, cx, .034, z + .965, .971, .004, .018, ATRIUM_COLORS.seam);
        box(`joint-cross-${x}-${z}`, x + .965, .035, cz, .018, .004, .970, ATRIUM_COLORS.seam);
        if ((x * 5 + z * 7) % 4 === 0) {
            box(`repair-${x}-${z}`, cx + .21, .037, cz - .14, .22, .004, .16, ATRIUM_COLORS.rust);
            box(`repair-border-${x}-${z}`, cx + .21, .041, cz - .14, .18, .003, .018, ATRIUM_COLORS.marble);
        }
        box(`ceiling-${x}-${z}`, cx, 2.345, cz, .975, .028, .975, ATRIUM_COLORS.concrete);
        box(`coffer-${x}-${z}`, cx, 2.315, cz, .82, .026, .82, ATRIUM_COLORS.dark);
        box(`inner-ceiling-${x}-${z}`, cx, 2.305, cz, .74, .018, .74, ATRIUM_COLORS.concrete);
        if ((x + z) % 3 === 0) {
            box(`luminance-${x}-${z}`, cx, 2.290, cz, .44, .018, .11, ATRIUM_COLORS.light, true);
            box(`light-case-${x}-${z}`, cx, 2.300, cz, .50, .038, .18, ATRIUM_COLORS.brass);
        }
        // Rodapiés y molduras solo en caras interiores de muros reales.
        for (const [side, dx, dz] of [['N', 0, -1], ['S', 0, 1], ['W', -1, 0], ['E', 1, 0]]) {
            if (atriumIsOpen(map, x + dx, z + dz))
                continue;
            const ns = side === 'N' || side === 'S';
            const wx = ns ? cx : (side === 'W' ? x + .045 : x + .955);
            const wz = ns ? (side === 'N' ? z + .045 : z + .955) : cz;
            box(`base-${x}-${z}-${side}`, wx, .15, wz, ns ? .90 : .042, .28, ns ? .042 : .90, ATRIUM_COLORS.marble);
            box(`upper-${x}-${z}-${side}`, wx, 2.16, wz, ns ? .90 : .04, .12, ns ? .04 : .90, ATRIUM_COLORS.brass);
            box(`wall-wainscot-${x}-${z}-${side}`, wx, .79, wz, ns ? .87 : .025, 1.03, ns ? .025 : .87, ATRIUM_COLORS.paint);
            box(`wainscot-line-${x}-${z}-${side}`, wx, 1.33, wz, ns ? .87 : .034, .028, ns ? .034 : .87, ATRIUM_COLORS.dark);
            if ((x + z) % 2 === 0) {
                box(`rust-stain-${x}-${z}-${side}`, wx, .70, wz + (ns ? .012 : 0), ns ? .22 : .028, .24, ns ? .028 : .22, ATRIUM_COLORS.rust);
            }
        }
    }
    for (const p of KIBA_ATRIUM_PANELS) {
        if (!validAtriumPanel(map, p))
            continue;
        const ns = p.side === 'N' || p.side === 'S';
        const px = p.x + .5, pz = p.z + .5;
        const wall = (v) => ({ x: ns ? px : (p.side === 'W' ? p.x + v : p.x + 1 - v), z: ns ? (p.side === 'N' ? p.z + v : p.z + 1 - v) : pz });
        const b = (name, u, y, v, w, h, d, color, emissive = false) => {
            const q = wall(v);
            box(`panel-${p.id}-${name}`, ns ? q.x + u : q.x, y, ns ? q.z : q.z + u, ns ? w : d, h, ns ? d : w, color, emissive);
        };
        b('surround', 0, 1.35, .075, .88, 1.48, .09, ATRIUM_COLORS.dark);
        b('frame', 0, 1.39, .126, .82, 1.35, .05, ATRIUM_COLORS.brass);
        b('face', 0, 1.39, .157, .73, 1.22, .019, ATRIUM_COLORS.concrete);
        b('header', 0, 2.03, .175, .71, .12, .02, ATRIUM_COLORS.paper);
        b('sconce', 0, 2.15, .183, .40, .035, .045, ATRIUM_COLORS.light, true);
        if (p.id === 'directory') {
            for (let i = 0; i < 5; i++) {
                b('list-' + i, -.04, 1.76 - i * .17, .18, .52, .035, .014, i === 4 ? ATRIUM_COLORS.red : ATRIUM_COLORS.paper);
                b('node-' + i, -.31, 1.76 - i * .17, .182, .038, .045, .014, ATRIUM_COLORS.brass);
            }
            b('floorplan', .22, .91, .19, .23, .25, .016, ATRIUM_COLORS.green);
            b('floorplan-route', .24, .92, .205, .038, .18, .01, ATRIUM_COLORS.paper);
        }
        else if (p.id === 'clock') {
            b('blackclock', 0, 1.56, .20, .53, .53, .05, ATRIUM_COLORS.dark);
            b('dial', 0, 1.56, .24, .43, .43, .02, ATRIUM_COLORS.paper);
            b('clockhand', -.045, 1.61, .26, .022, .19, .012, ATRIUM_COLORS.red);
            b('clockminute', .06, 1.54, .268, .16, .020, .012, ATRIUM_COLORS.rust);
            b('certificate', 0, .94, .20, .60, .17, .014, ATRIUM_COLORS.paper);
            b('bloodmark', .21, .94, .212, .12, .042, .014, ATRIUM_COLORS.red);
        }
        else if (p.id === 'switchboard') {
            for (let i = 0; i < 4; i++)
                for (let j = 0; j < 3; j++) {
                    b(`jack-${i}-${j}`, -.24 + j * .23, 1.86 - i * .21, .194, .12, .11, .025, (i === 3 && j === 1) ? ATRIUM_COLORS.red : ATRIUM_COLORS.green);
                    b(`jack-center-${i}-${j}`, -.24 + j * .23, 1.86 - i * .21, .210, .043, .046, .012, ATRIUM_COLORS.dark);
                }
            b('handset', .22, .86, .23, .37, .12, .11, ATRIUM_COLORS.wood);
        }
        else {
            for (let i = 0; i < 5; i++) {
                b('name-slip-' + i, 0, 1.82 - i * .20, .187, .61, .12, .015, i % 2 ? ATRIUM_COLORS.marble : ATRIUM_COLORS.paper);
                b('redact-' + i, (i % 2 ? -.05 : .12), 1.82 - i * .20, .203, .20, .03, .012, ATRIUM_COLORS.dark);
            }
            b('unlisted', 0, .76, .20, .50, .12, .018, ATRIUM_COLORS.red);
        }
    }
    return a;
}
const atriumTextureCache = new Map();
function kibaAtriumTexture(kind) {
    const cached = atriumTextureCache.get(kind);
    if (cached)
        return cached;
    const c = document.createElement('canvas');
    c.width = 224;
    c.height = 288;
    const g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    const box = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
    const ink = (s, x, y, size = 11, col = '#d6d0ac') => { g.fillStyle = col; g.font = `bold ${size}px monospace`; g.fillText(s, x, y); };
    box(0, 0, 224, 288, '#26302a');
    for (let i = 0; i < 160; i++) {
        const x = (i * 47 + i * i * 13) % 224, y = (i * 97 + i * i * 3) % 288;
        box(x, y, 1 + i % 3, 1, i % 4 ? '#73806b35' : '#121d1c49');
    }
    box(4, 4, 216, 280, '#1c2525');
    box(7, 7, 210, 274, '#617061');
    box(12, 12, 200, 264, '#27332f');
    box(12, 12, 200, 40, '#121b1c');
    ink('KIBA / ACCESO 01', 19, 28, 17, '#d4c89f');
    ink('NO MIRE A LA CAMARA', 19, 44, 9, '#b58678');
    if (kind === 'directory') {
        ink('DIRECTORIO', 24, 74, 18);
        box(24, 84, 177, 3, '#8b926c');
        for (let i = 0; i < 6; i++) {
            const y = 103 + i * 23;
            box(28, y, 168, 17, i % 2 ? '#354c43' : '#485b4e');
            ink('0' + i + '   ' + ['VESTIBULO', 'ARCHIVO', 'DESPACHOS', 'VIGILANCIA', 'SOTANO', 'SIN REGISTRO'][i], 34, y + 12, 10, i === 5 ? '#d7a19a' : '#d0d0b7');
        }
        box(40, 249, 144, 16, '#492a29');
        ink('PLANTA INEXISTENTE', 45, 260, 10, '#e1b4aa');
    }
    else if (kind === 'clock') {
        ink('HORA OFICIAL', 28, 74, 16);
        g.strokeStyle = '#a3a78a';
        g.lineWidth = 7;
        g.beginPath();
        g.arc(112, 151, 67, 0, Math.PI * 2);
        g.stroke();
        g.strokeStyle = '#e3d3ae';
        g.lineWidth = 2;
        g.beginPath();
        g.arc(112, 151, 54, 0, Math.PI * 2);
        g.stroke();
        for (let i = 0; i < 12; i++) {
            const a = i * Math.PI / 6;
            box(108 + Math.sin(a) * 47, 147 - Math.cos(a) * 47, 5, 6, '#bbbba0');
        }
        g.strokeStyle = '#a84e43';
        g.lineWidth = 5;
        g.beginPath();
        g.moveTo(112, 151);
        g.lineTo(112, 113);
        g.moveTo(112, 151);
        g.lineTo(140, 154);
        g.stroke();
        ink('04 : 04', 73, 253, 18, '#d7b5a6');
    }
    else if (kind === 'switchboard') {
        ink('CENTRALITA / 0', 23, 75, 16);
        for (let i = 0; i < 4; i++)
            for (let j = 0; j < 3; j++) {
                const x = 30 + j * 61, y = 96 + i * 35;
                box(x, y, 49, 27, '#46584f');
                box(x + 6, y + 5, 36, 17, '#102123');
                box(x + 15, y + 10, 12, 8, i === 3 && j === 1 ? '#a95547' : '#6ca083');
            }
        box(34, 247, 151, 22, '#1a1b1d');
        ink('LLAMADA: 04:04', 41, 263, 12, '#d0b997');
    }
    else {
        ink('NO CONSTA / 2006', 20, 75, 16);
        for (let i = 0; i < 5; i++) {
            const y = 96 + i * 32;
            box(23, y, 180, 24, '#b7b29c');
            ink('K-' + String(40 + i) + ' / ' + (i === 3 ? '________' : 'NOMBRE BORRADO'), 30, y + 16, 10, '#343a35');
            box(72, y + 10, 110, 6, '#24302c');
        }
        box(28, 260, 168, 15, '#673633');
        ink('FALTAN DOS PERSONAS', 34, 271, 10, '#e0baab');
    }
    atriumTextureCache.set(kind, c);
    return c;
}

// premium/BookMode.js







/* NAMELESS 404 — modo libro original. Dos pantallas 192x256 componen un
   único paisaje 384x256. Gráficos generados de cero; sin recursos externos. */

const BW = 384, BH = 256;
const cache = document.createElement('canvas');
cache.width = BW;
cache.height = BH;
const scene = cache.getContext('2d');
const PALETTES = {
    1: { wall: [91, 102, 83], floor: [49, 58, 49], fog: [16, 21, 21] },
    2: { wall: [110, 104, 92], floor: [64, 61, 53], fog: [24, 23, 24] },
    3: { wall: [79, 98, 101], floor: [52, 63, 70], fog: [13, 23, 30] },
    4: { wall: [111, 126, 115], floor: [75, 87, 82], fog: [19, 32, 32] },
    5: { wall: [102, 97, 82], floor: [74, 69, 57], fog: [25, 25, 22] },
    6: { wall: [93, 88, 77], floor: [65, 63, 57], fog: [22, 21, 22] },
    7: { wall: [76, 99, 108], floor: [49, 65, 70], fog: [11, 23, 31] }
};
function noise(x, y, seed = 0) {
    let n = Math.sin(x * 127.13 + y * 311.7 + seed * 79.21) * 43758.5453;
    return n - Math.floor(n);
}
function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }
function rgb(r, g, b) { return `rgb(${clamp(r | 0, 0, 255)},${clamp(g | 0, 0, 255)},${clamp(b | 0, 0, 255)})`; }
function cast(map, px, py, angle) {
    return castGridRay(map, px, py, angle);
}
// Projection vectors depend only on the four cardinal directions, not on the
// frame timestamp. This removes thousands of trigonometric operations/frame.
// La cámara puede mirar entre los cuatro rumbos discretos del motor.
// Solo se calculan los rayos una vez por fotograma; antes se precalculaban 4 rumbos.
const cameraAngle = (s) => Number.isFinite(s.cameraYaw) ? s.cameraYaw : s.dir * Math.PI / 2;
const cameraPitch = (s) => clamp(Number(s.cameraPitch) || 0, -.25, .25);
const cameraHorizon = (s) => 122 + cameraPitch(s) * 108;
function put(x, y, w, h, color) { scene.fillStyle = color; scene.fillRect(x, y, w, h); }
function rect(x, y, w, h, fill, stroke) {
    put(x, y, w, h, fill);
    if (stroke) {
        scene.strokeStyle = stroke;
        scene.lineWidth = 1;
        scene.strokeRect(x + .5, y + .5, w - 1, h - 1);
    }
}
function text(str, x, y, color, size = 9) { scene.fillStyle = color; scene.font = `${size}px monospace`; scene.fillText(str, x, y); }
function roomMaterial(day, x, y) {
    return (Math.floor(x) * 17 + Math.floor(y) * 13 + day * 7) % 5;
}
function drawFloor(state, time, map, p) {
    const cx = state.rx, cy = state.ry, rotation = cameraAngle(state);
    const gradient = scene.createLinearGradient(0, 0, 0, BH);
    gradient.addColorStop(0, '#0b1114');
    gradient.addColorStop(.48, '#1b2423');
    gradient.addColorStop(.51, '#171d1d');
    gradient.addColorStop(1, rgb(...p.floor));
    put(0, 0, BW, BH, gradient);
    const horizon = cameraHorizon(state);
    const rays = Array.from({ length: Math.ceil(BW / 3) }, (_, i) => { const a = rotation + Math.atan((i * 3 + 1.5 - BW / 2) / (BW * .76)); return { dx: Math.sin(a), dy: -Math.cos(a) }; });
    for (let y = Math.ceil(horizon) + 2; y < BH; y += 3) {
        const depth = BH * .57 / Math.max(1, y - horizon);
        for (let x = 0; x < BW; x += 3) {
            const v = rays[Math.floor(x / 3)];
            const wx = cx + v.dx * depth, wy = cy + v.dy * depth;
            const tx = wx - Math.floor(wx), ty = wy - Math.floor(wy);
            const grout = Math.min(tx, ty, 1 - tx, 1 - ty) < .035;
            const texture = noise(Math.floor(wx * 7), Math.floor(wy * 7), state.day);
            const rust = noise(Math.floor(wx * 2), Math.floor(wy * 3), 5) > .79;
            const bright = (1 - 1 / (1 + depth * .25)) * .47 + .24 + (state.light ? .18 : -.01);
            const lightCone = .55 + (.45 * clamp(1 - Math.abs(x - BW / 2) / (BW * .55), 0, 1));
            const atrium = state.day === 1 && isAtriumCell(map, Math.floor(wx), Math.floor(wy));
            const seam = atrium && (Math.min(tx, ty, 1 - tx, 1 - ty) < .045 || Math.abs(tx - .5) < .015);
            const shade = (grout ? .45 : 1) * (rust ? .67 : 1) * bright * lightCone * (.84 + texture * .25) * (atrium ? 1.25 : 1);
            const c = atrium ? (seam ? [31, 40, 38] : ((Math.floor(wx) + Math.floor(wy)) % 4 === 0 ? [103, 109, 88] : [57, 83, 72])) : p.floor;
            put(x, y, 3, 3, rgb(c[0] * shade, c[1] * shade, c[2] * shade));
        }
    }
    // Fugas del techo, tuberías y cables en perspectiva.
    scene.strokeStyle = 'rgba(161,168,138,.14)';
    scene.lineWidth = 2;
    for (const scale of [1, 2, 4, 7]) {
        const yy = horizon - 100 / scale;
        scene.beginPath();
        scene.moveTo(0, yy);
        scene.lineTo(BW, yy);
        scene.stroke();
    }
    scene.strokeStyle = 'rgba(114,132,111,.22)';
    scene.lineWidth = 1;
    scene.beginPath();
    scene.moveTo(0, 9);
    scene.lineTo(BW * .25, 115);
    scene.moveTo(BW, 9);
    scene.lineTo(BW * .75, 115);
    scene.stroke();
    if (state.day === 1) {
        // Pérdida del fluorescente: las lámparas existen en la profundidad, no en una HUD.
        for (let i = 0; i < 3; i++) {
            const y = 35 + i * 30, w = 85 / (i + 1);
            put(BW / 2 - w / 2, y, w, 1, `rgba(192,194,153,${(.26 / (i + 1)).toFixed(2)})`);
        }
    }
}
function castWalls(state, map, p, time) {
    const pixels = new Float32Array(BW);
    const rotation = cameraAngle(state);
    const horizonShift = cameraPitch(state) * 108;
    for (let x = 0; x < BW; x += 2) {
        const diff = Math.atan((x - BW / 2) / (BW * .76));
        const hit = cast(map, state.rx, state.ry, rotation + diff);
        const d = hit.dist * Math.cos(diff), height = Math.min(640, BH * .87 / Math.max(.16, d));
        const top = Math.round((BH - height) / 2 + horizonShift);
        const bottom = Math.min(BH, Math.ceil(top + height));
        pixels[x] = pixels[x + 1] = d;
        const u = hit.u;
        const mat = roomMaterial(state.day, hit.x, hit.y);
        const layer = hit.vertical ? .82 : 1;
        const bx = Math.floor(hit.x), by = Math.floor(hit.y);
        const speck = noise(bx * 9 + Math.floor(u * 24), by * 7, 17);
        // Portones visibles solo donde existen puertas físicas en el mapa.
        // No presentar como "puerta" un muro decorativo sin interacción.
        const gateDoor = state.day === 1 && (Math.hypot(hit.x - 6.5, hit.y - 2.5) < .8 || Math.hypot(hit.x - 7.5, hit.y - 7.5) < .8);
        const door = (state.day === 1 ? gateDoor : mat === 3) && Math.abs(u - .5) < .42;
        const visualMat = state.day === 1 && !gateDoor && mat === 3 ? 0 : (gateDoor ? 3 : mat);
        const beam = (u < .065 || u > .935);
        const cone = Math.pow(Math.max(0, 1 - Math.abs(x - BW / 2) / (BW * .72)), 2);
        const flicker = (state.day === 1 && state.chase) ? .96 + Math.sin(time * .003 + bx * 2 + by) * .04 : 1;
        const depthLight = clamp(.83 / (1 + d * .15), .12, .86);
        const light = (state.light ? .47 + .45 * cone : .32) * (depthLight + .10) * layer * flicker;
        const fog = clamp((d - 4) / 14, 0, .77);
        const material = door ? .55 : (mat === 4 ? .79 : mat === 2 ? 1.12 : mat === 1 ? .90 : 1);
        const c = p.wall;
        if (state.day === 1) {
            // Original bitmap materials projected onto the ray-hit UV. Each column
            // samples a real texture, not flat procedural rectangles.
            const tex = analogMaterial(visualMat, state.day);
            const texX = Math.max(0, Math.min(126, Math.floor(u * 126)));
            scene.drawImage(tex, texX, 0, 2, 192, x, top, 2, height);
            const darkness = clamp(1 - (light * (1 - fog) * 1.27), .08, .86);
            put(x, Math.max(0, top), 2, Math.min(BH, bottom) - Math.max(0, top), `rgba(3,13,14,${darkness.toFixed(3)})`);
            if (fog > .025)
                put(x, Math.max(0, top), 2, Math.min(BH, bottom) - Math.max(0, top), `rgba(${p.fog.map(v => Math.round(v)).join(',')},${(fog * .30).toFixed(3)})`);
            if (beam)
                put(x, Math.max(0, top), 2, Math.min(BH, bottom) - Math.max(0, top), 'rgba(3,9,8,.21)');
        }
        else {
            for (let y = Math.max(0, top); y < bottom; y += 3) {
                const v = (y - top) / height;
                const groove = (Math.abs((v * 3.4) % 1) < .018 || Math.abs((u * 2.5) % 1) < .017);
                const panel = door && (u < .29 || u > .71 || v < .11 || v > .92);
                const lower = v > .83;
                const mold = v > .68 && speck > .51;
                const edge = beam ? .58 : 1;
                const filth = mold ? .55 : lower ? .78 : groove ? .62 : 1;
                const tex = noise(Math.floor(u * 67) + bx * 9, Math.floor(v * 71) + by * 7, state.day);
                const fissure = tex > .957 ? .43 : 1;
                const shade = light * material * edge * filth * fissure * (.88 + tex * .22) * (panel ? .74 : 1);
                const col = [c[0] * shade, c[1] * shade, c[2] * shade];
                if (door && !panel) {
                    col[0] *= .7;
                    col[1] *= .71;
                    col[2] *= .68;
                }
                if (mat === 1 && v > .39 && v < .45) {
                    col[0] *= .48;
                    col[1] *= .48;
                    col[2] *= .48;
                }
                for (let i = 0; i < 3; i++)
                    col[i] = col[i] * (1 - fog) + p.fog[i] * fog;
                put(x, y, 2, 3, rgb(col[0], col[1], col[2]));
                if (door && v > .48 && v < .53 && Math.abs(u - .63) < .03 && d < 4) {
                    put(x, y, 2, 2, '#8c8160');
                }
            }
        }
        if (d < 6) {
            const moldAnchor = Math.abs(u - .34) < .014 && (bx * 13 + by) % 4 === 1;
            if (moldAnchor) {
                put(x, top + height * .15, 2, Math.max(2, height * .27), 'rgba(17,25,22,.35)');
            }
        }
    }
    return pixels;
}
function lineOfSight(map, x, y, ox, oy) {
    const dx = ox - x, dy = oy - y, dist = Math.hypot(dx, dy), st = Math.max(1, Math.ceil(dist * 13));
    for (let i = 1; i < st; i++)
        if (E.wall(map, x + dx * i / st, y + dy * i / st))
            return false;
    return true;
}
function drawItem(o, s, dist, sx, now) {
    const scale = Math.min(2.6, 1.35 / Math.max(.4, dist));
    const w = Math.max(10, Math.floor(40 * scale)), h = Math.max(17, Math.floor(73 * scale));
    const x = sx - w / 2, y = BH / 2 + cameraPitch(s) * 108 - h * .41;
    const cabinet = /locker|cabinet|safe|archive|winch|breaker/i.test(o.id);
    const document = /tape|register|file|label|photo|negative|ticket|proof/i.test(o.id);
    if (cabinet) {
        rect(x, y, w, h, '#252a27', '#707c6d');
        rect(x + 3, y + 4, w - 6, h - 8, '#3d453d', '#1a2220');
        rect(x + w * .55, y + h * .37, Math.max(2, w * .08), Math.max(2, h * .1), '#958c70');
        if (w > 28)
            for (let k = 1; k < 4; k++)
                put(x + 5, y + k * h * .2, w - 10, 1, '#7e817143');
    }
    else if (document) {
        rect(x + w * .21, y + h * .43, w * .58, h * .42, '#b6ad8d', '#5d5a4a');
        for (let n = 0; n < 4; n++)
            put(x + w * .28, y + h * (.5 + n * .064), w * .37, 1, '#4b4c40');
        put(x + w * .71, y + h * .52, w * .05, h * .18, '#873e43');
    }
    else {
        rect(x + w * .1, y + h * .14, w * .8, h * .7, '#384542', '#a1a18a');
        rect(x + w * .2, y + h * .27, w * .6, h * .37, '#121c1b');
        put(x + w * .25, y + h * .36, w * .1, Math.max(1, h * .025), '#b8a88b');
    }
    if (dist < 2.3 && s.day === 1 && o.id === 'tape') {
        scene.fillStyle = 'rgba(213,200,154,.14)';
        scene.fillRect(x - 3, y - 3, w + 6, h + 6);
    }
}
function drawCopist(s, map, pixels, time) {
    if (!s.chase || s.hidden)
        return;
    const dx = s.entityX - s.rx, dy = s.entityY - s.ry;
    const distance = Math.hypot(dx, dy);
    if (distance > .2 && distance < 9 && lineOfSight(map, s.rx, s.ry, s.entityX, s.entityY)) {
        const worldAngle = Math.atan2(dx, -dy);
        let diff = worldAngle - cameraAngle(s);
        while (diff > Math.PI)
            diff -= Math.PI * 2;
        while (diff < -Math.PI)
            diff += Math.PI * 2;
        if (Math.abs(diff) > .65)
            return;
        const cx = BW / 2 + Math.tan(diff) * BW * .76;
        if (cx < 10 || cx > BW - 10 || distance > pixels[clamp(Math.floor(cx), 0, BW - 1)] + .16)
            return;
        const h = Math.min(230, BH * 1.42 / Math.max(.55, distance));
        const scale = h / 2.08, bottom = BH / 2 + cameraPitch(s) * 108 + h * .50;
        const fog = clamp(1 - distance / 15, .46, .96);
        const rig = buildCopyistModel(time, s.threat).slice().sort((a, b) => b.z - a.z);
        // Original model projected as a billboard in the CPU fallback, while WebGL2
        // and Three.js retain real-world geometry. Shared pose + facial construction.
        scene.save();
        scene.globalAlpha = fog;
        // Contact shadow grounds the character without an overlay jumpscare.
        scene.fillStyle = 'rgba(1,4,8,.38)';
        scene.beginPath();
        scene.ellipse(cx, bottom, Math.max(3, h * .25), Math.max(1, h * .028), 0, 0, Math.PI * 2);
        scene.fill();
        const v = (n) => Math.max(1, Math.round(n * scale));
        for (const part of rig) {
            const px = cx + part.x * scale - v(part.width) / 2;
            const py = bottom - (part.y + part.height / 2) * scale;
            const rgb = part.color.map(x => Math.round(255 * Math.min(1, x * (1.05 + Math.max(0, 2.5 - distance) * .08))));
            scene.fillStyle = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
            scene.fillRect(Math.round(px), Math.round(py), v(part.width), v(part.height));
        }
        scene.restore();
        if (distance < 2.15 && s.threat > 50) {
            // Thin analog separation, never a full-screen flash.
            put(cx - h * .19, bottom - h * .82, h * .38, 1, 'rgba(191,203,184,.17)');
        }
    }
}
/** Perspective billboard fallback for authored 3D room props. Important: this
 * is a distinct sprite representation, not a claim that Canvas2D draws meshes. */
function drawKibaRoomDressing(s, map, depth) {
    if (s.day !== 1)
        return;
    const elements = getKibaRoomFixtures(map).filter(f => !legacyRoomFixtureShadowed(f.id)).map(f => ({ ...f, dist: Math.hypot(f.x + .5 - s.rx, f.z + .5 - s.ry) }))
        .sort((a, b) => b.dist - a.dist);
    for (const f of elements) {
        const wx = f.x + .5, wy = f.z + .5, dx = wx - s.rx, dy = wy - s.ry;
        if (f.dist < .3 || f.dist > 8.0 || !lineOfSight(map, s.rx, s.ry, wx, wy))
            continue;
        let theta = Math.atan2(dx, -dy) - cameraAngle(s);
        while (theta > Math.PI)
            theta -= 2 * Math.PI;
        while (theta < -Math.PI)
            theta += 2 * Math.PI;
        if (Math.abs(theta) > .65)
            continue;
        const center = BW / 2 + Math.tan(theta) * BW * .76;
        if (center < 0 || center >= BW || f.dist > depth[clamp(center | 0, 0, BW - 1)] + .23)
            continue;
        // Fixture is flush with the wall: use a smaller projected footprint.
        const h = Math.min(216, BH * 1.0 / Math.max(.7, f.dist));
        const w = h * .55, x = center - w / 2, y = BH * .51 + cameraPitch(s) * 108 - h * .52;
        const r = (nx, ny, nw, nh, col) => {
            rect(Math.round(x + nx * w), Math.round(y + ny * h), Math.max(1, Math.ceil(nw * w)), Math.max(1, Math.ceil(nh * h)), col);
        };
        scene.save();
        scene.globalAlpha = clamp((s.light ? .93 : .63) * (1 - f.dist / 16), .34, .95);
        if (f.kind === 'reception') {
            r(.05, .46, .9, .47, '#302e29');
            r(.0, .47, 1, .09, '#888779');
            r(.09, .22, .42, .28, '#101f1d');
            r(.14, .27, .32, .17, '#3b5a55');
            r(.19, .34, .22, .025, '#a0c3a0');
            r(.62, .45, .24, .1, '#141e1a');
            r(.13, .66, .72, .035, '#747469');
            r(.13, .81, .72, .025, '#747469');
            r(.73, .50, .04, .02, '#aa4841');
        }
        else if (f.kind === 'archive') {
            r(.03, .05, .94, .94, '#4b5b56');
            for (let i = 0; i < 4; i++) {
                r(.07, .09 + i * .225, .86, .19, '#273534');
                r(.18, .15 + i * .225, .25, .055, '#beb7a0');
                r(.66, .18 + i * .225, .15, .02, '#b3ae8c');
            }
        }
        else if (f.kind === 'electrical') {
            r(.14, .10, .72, .82, '#405552');
            r(.20, .16, .60, .70, '#273735');
            for (let i = 0; i < 4; i++)
                r(.26 + i * .13, .48, .055, .16, i === 2 ? '#9e3e3d' : '#121b1d');
            r(.39, .25, .24, .10, '#bd995d');
            r(.72, .80, .045, .04, '#e65345');
        }
        else if (f.kind === 'vending') {
            r(.03, .03, .94, .96, '#4b605d');
            r(.09, .12, .61, .58, '#102629');
            for (let i = 0; i < 3; i++)
                r(.14 + i * .17, .20, .10, .30, i === 1 ? '#9f4e41' : '#a0a393');
            r(.76, .41, .09, .25, '#d3b070');
            r(.10, .79, .65, .08, '#152727');
            r(.12, .05, .68, .065, '#b4cb9b');
        }
        else if (f.kind === 'portrait') {
            r(.10, .10, .80, .84, '#523d32');
            r(.18, .18, .64, .68, '#a1a28d');
            r(.31, .22, .25, .43, '#282e30');
            r(.55, .35, .20, .36, '#626b64');
            r(.16, .60, .70, .06, '#1c2023');
            r(.63, .23, .06, .60, '#a74942');
        }
        else if (f.kind === 'machine') {
            r(.01, .42, .98, .12, '#786654');
            r(.13, .12, .74, .44, '#34433f');
            for (let i = 0; i < 2; i++) {
                const xx = .19 + i * .38;
                r(xx, .16, .26, .27, '#aaa78d');
                r(xx + .08, .21, .11, .16, '#172326');
            }
            r(.18, .62, .05, .33, '#444b44');
            r(.77, .62, .05, .33, '#444b44');
            r(.76, .46, .055, .04, '#d45449');
        }
        else if (f.kind === 'generator') {
            r(.02, .17, .96, .72, '#334340');
            r(.10, .25, .80, .48, '#121e20');
            for (let i = 0; i < 5; i++)
                r(.15, .29 + i * .078, .70, .025, '#65736d');
            r(.57, .19, .25, .10, '#c7bc98');
            r(.78, .21, .045, .038, '#cc8e3e');
        }
        else if (f.kind === 'locker') {
            r(.07, .04, .86, .93, '#556763');
            r(.11, .07, .37, .85, '#2b3d3c');
            r(.52, .07, .37, .85, '#314241');
            for (let i = 0; i < 3; i++) {
                r(.18, .22 + i * .05, .22, .017, '#171f20');
                r(.59, .22 + i * .05, .22, .017, '#171f20');
            }
            r(.48, .54, .05, .09, '#b7a37d');
        }
        else if (f.kind === 'notice') {
            r(.04, .08, .92, .85, '#654e39');
            r(.10, .13, .40, .55, '#bdb4a0');
            r(.54, .22, .33, .55, '#a8ac9c');
            r(.58, .39, .26, .045, '#292f30');
            r(.22, .22, .24, .03, '#303a36');
            r(.21, .32, .24, .02, '#46514a');
        }
        else if (f.kind === 'medicine') {
            r(.08, .09, .84, .81, '#acb2a5');
            r(.14, .15, .72, .70, '#4e675f');
            r(.46, .31, .10, .37, '#a85145');
            r(.32, .44, .36, .10, '#a85145');
        }
        else if (f.kind === 'exit') {
            r(.05, .34, .90, .36, '#263e35');
            r(.10, .40, .80, .24, '#5d9270');
            r(.25, .49, .49, .055, '#c5d1a9');
            r(.63, .43, .15, .19, '#c5d1a9');
        }
        // Perspective distress, not a full-screen filter.
        r(.06, .94, .88, .013, 'rgba(9,17,16,.66)');
        scene.restore();
    }
}
/** Original, physically situated story panels in four different wings of Kiba.
 * Walls, angle and the raycast depth buffer determine whether they are visible.
 * Their pixels are part of the world, not HUD/UI decorations. */
/** Four author-designed architectural installations, projected into the world.
 * Every bitmap has a genuine wall behind it; the raycast z-buffer rejects
 * objects occluded by geometry. This is not a UI overlay. */
function drawKibaAtrium(s, map, depth) {
    if (s.day !== 1)
        return;
    for (const p of KIBA_ATRIUM_PANELS) {
        if (!validAtriumPanel(map, p))
            continue;
        const wx = p.x + .5, wy = p.z + .5, dx = wx - s.rx, dy = wy - s.ry;
        const dist = Math.hypot(dx, dy);
        if (dist < .28 || dist > 7.8 || !lineOfSight(map, s.rx, s.ry, wx, wy))
            continue;
        let angle = Math.atan2(dx, -dy) - cameraAngle(s);
        angle = Math.atan2(Math.sin(angle), Math.cos(angle));
        if (Math.abs(angle) > .67)
            continue;
        const sx = BW * .5 + Math.tan(angle) * BW * .76;
        if (sx < 0 || sx >= BW || dist > depth[clamp(sx | 0, 0, BW - 1)] + .2)
            continue;
        const h = Math.min(235, 170 / Math.max(.88, dist)), w = h * .78;
        scene.save();
        scene.globalAlpha = clamp((s.light ? .96 : .60) * (1 - dist / 19), .38, .96);
        scene.drawImage(kibaAtriumTexture(p.id), sx - w * .5, BH * .51 + cameraPitch(s) * 108 - h * .58, w, h);
        scene.restore();
    }
}
function drawKibaSetpieces(s, map, depth) {
    if (s.day !== 1)
        return;
    const fixtures = visibleKibaSetpieces(map);
    for (const p of fixtures) {
        const wx = p.cellX + .5, wy = p.cellZ + .5;
        const dx = wx - s.rx, dy = wy - s.ry, dist = Math.hypot(dx, dy);
        if (dist < .3 || dist > 8 || !lineOfSight(map, s.rx, s.ry, wx, wy))
            continue;
        let angle = Math.atan2(dx, -dy) - cameraAngle(s);
        angle = Math.atan2(Math.sin(angle), Math.cos(angle));
        if (Math.abs(angle) > .69)
            continue;
        const sx = BW * .5 + Math.tan(angle) * BW * .76;
        if (sx < 0 || sx >= BW || dist > depth[clamp(Math.floor(sx), 0, BW - 1)] + .26)
            continue;
        const h = Math.min(336, 230 / Math.max(.60, dist));
        const w = h * .77;
        scene.save();
        scene.globalAlpha = clamp((s.light ? .98 : .66) * (1 - dist / 19), .35, .96);
        scene.drawImage(kibaSetpieceTexture(p.id), sx - w * .5, BH * .51 + cameraPitch(s) * 108 - h * .59, w, h);
        scene.restore();
    }
}
/** Physical surveillance station, placed at the northern wall (2,1).
 * Occluded by the same ray-depth buffer as gameplay objects. No HUD overlay. */
function drawSignatureRoom(s, map, depth) {
    if (s.day !== 1 || !isSignatureRoomValid(map))
        return;
    const dx = KIBA_SIGNATURE.x - s.rx, dy = KIBA_SIGNATURE.z - s.ry;
    const d = Math.hypot(dx, dy);
    if (d < .28 || d > 7.5 || !lineOfSight(map, s.rx, s.ry, KIBA_SIGNATURE.x, KIBA_SIGNATURE.z))
        return;
    let angle = Math.atan2(dx, -dy) - cameraAngle(s);
    angle = Math.atan2(Math.sin(angle), Math.cos(angle));
    if (Math.abs(angle) > .68)
        return;
    const sx = BW * .5 + Math.tan(angle) * BW * .76;
    const column = clamp(Math.round(sx), 0, BW - 1);
    if (d > depth[column] + .15)
        return;
    const h = Math.min(335, 232 / Math.max(.62, d));
    const w = h * .77;
    scene.save();
    scene.globalAlpha = clamp((s.light ? .97 : .68) * (1 - d / 19), .36, .96);
    scene.drawImage(signatureTexture(), sx - w * .5, BH * .51 + cameraPitch(s) * 108 - h * .59, w, h);
    // A physically situated monitor glow; no photosensitivity hazard.
    if (d < 4.5) {
        const glow = scene.createRadialGradient(sx, BH * .47, 4, sx, BH * .47, w * .85);
        glow.addColorStop(0, 'rgba(53,139,113,.14)');
        glow.addColorStop(1, 'rgba(53,139,113,0)');
        scene.fillStyle = glow;
        scene.fillRect(sx - w, BH * .47 + cameraPitch(s) * 108 - h * .5, w * 2, h);
    }
    scene.restore();
}
function drawObjects(s, map, depth, now) {
    const items = E.realItems(s).map(o => ({ ...o, dist: Math.hypot(o.x - s.rx, o.y - s.ry) })).sort((a, b) => b.dist - a.dist);
    for (const o of items) {
        const dx = o.x - s.rx, dy = o.y - s.ry;
        if (o.dist < .25 || o.dist > 9 || !lineOfSight(map, s.rx, s.ry, o.x, o.y))
            continue;
        let diff = Math.atan2(dx, -dy) - cameraAngle(s);
        while (diff > Math.PI)
            diff -= 2 * Math.PI;
        while (diff < -Math.PI)
            diff += 2 * Math.PI;
        if (Math.abs(diff) > .64)
            continue;
        const sx = BW / 2 + Math.tan(diff) * BW * .76;
        if (sx < 0 || sx >= BW || o.dist > depth[clamp(sx | 0, 0, BW - 1)] + .35)
            continue;
        drawItem(o, s, o.dist, sx, now);
    }
    drawKibaSetpieces(s, map, depth);
    drawKibaAtrium(s, map, depth);
    drawKibaRoomDressing(s, map, depth);
    drawSignatureRoom(s, map, depth);
    drawCopist(s, map, depth, now);
}
function atmosphere(s, now, reduced = true) {
    const g = scene.createRadialGradient(BW * .5, BH * .51, BH * .09, BW * .5, BH * .51, BH * .83);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(.57, 'rgba(4,6,10,.16)');
    g.addColorStop(1, s.light ? 'rgba(0,2,5,.55)' : 'rgba(0,1,5,.85)');
    scene.fillStyle = g;
    scene.fillRect(0, 0, BW, BH);
    // Ruido cinematográfico estable, reproducible y sin flashes.
    for (let n = 0; n < 210; n++) {
        const x = (noise(n, 29, 41) * BW) | 0, y = (noise(n, 71, 17) * BH) | 0;
        put(x, y, 1, 1, n % 3 ? '#03060821' : '#d8dfc01a');
    }
    if (s.day === 1 && s.chase) {
        scene.fillStyle = `rgba(64,9,17,${clamp(s.threat / 900, 0, .12)})`;
        scene.fillRect(0, 0, BW, BH);
    }
    // Una interfaz mínima y diegética, sin información de depuración dentro de la escena.
    if (s.day === 1) {
        const prox = E.realItems(s).filter(o => Math.hypot(o.x - s.rx, o.y - s.ry) < (o.r || 1.3));
        if (prox.length) {
            rect(BW / 2 - 79, BH - 27, 158, 17, 'rgba(5,12,11,.84)', 'rgba(135,154,128,.50)');
            text('E  EXAMINAR', BW / 2 - 39, BH - 15, '#d2d8c0', 9);
        }
    }
    put(BW / 2 - 2, BH / 2, 5, 1, '#c9cfad7d');
    put(BW / 2, BH / 2 - 2, 1, 5, '#c9cfad7d');
    if (s.day === 1 && s.flags?.kibaFinaleStage >= 1 && s.flags?.kibaFinaleStage <= 2) {
        rect(BW / 2 - 91, 11, 182, 22, 'rgba(7,13,13,.82)', 'rgba(175,151,117,.58)');
        text(s.flags.kibaFinaleStage === 1 ? 'HUYE A LOS ARCHIVOS' : 'REGRESA AL VESTÍBULO', BW / 2 - 78, 25, '#d2c2a3', 10);
    }
}
const background = document.createElement('canvas');
background.width = BW;
background.height = BH;
const backdrop = background.getContext('2d');
let backgroundKey = '';
let backgroundMap = [];
let backgroundDepth = new Float32Array(BW);
const BookPerformance = {
    get key() { return backgroundKey; },
    invalidate() { backgroundKey = ''; }
};
function drawFull(s, now, frame) {
    scene.imageSmoothingEnabled = false;
    scene.clearRect(0, 0, BW, BH);
    const map = E.realMap(s);
    if (frame) {
        scene.drawImage(frame, 0, 0, BW, BH);
    }
    else {
        const p = PALETTES[s.day] || PALETTES[1];
        const key = sceneGeometryKey(s);
        if (key !== backgroundKey || s.chase) {
            drawFloor(s, now, map, p);
            backgroundDepth = castWalls(s, map, p, now);
            backdrop.clearRect(0, 0, BW, BH);
            backdrop.drawImage(cache, 0, 0);
            backgroundKey = s.chase ? '' : key; // persecuciones mantienen parpadeo
        }
        else
            scene.drawImage(background, 0, 0);
        drawObjects(s, map, backgroundDepth, now);
    }
    atmosphere(s, now, true);
}
const BookMode = {
    width: BW, height: BH,
    render(left, right, s, time, frame) {
        drawFull(s, time, frame);
        left.clearRect(0, 0, 192, 256);
        right.clearRect(0, 0, 192, 256);
        left.imageSmoothingEnabled = false;
        right.imageSmoothingEnabled = false;
        left.drawImage(cache, 0, 0, 192, 256, 0, 0, 192, 256);
        right.drawImage(cache, 192, 0, 192, 256, 0, 0, 192, 256);
    }
};

// premium/RetroRpg.js
/* NAMELESS 404 — juego maldito de 8 bits. Paletas e iconos dibujados desde
   cero. Apariencia aparentemente amable que se corrompe con el progreso. */

const RW = 256, RH = 192, TILE = 12, OFFSET_X = 32, OFFSET_Y = 18;
const C = { sea: '#347c9b', sea2: '#64acb7', grass: '#57984d', grassLight: '#84bd68', grassDark: '#356e4d', soil: '#a99a67', stone: '#b4b0a0', stoneDark: '#6c786d', wood: '#987455', red: '#b54853', cream: '#f3e5b8', sky: '#142c35', shadow: '#233638', roof: '#ab756b' };
function pixel(c, x, y, w, h, fill) { c.fillStyle = fill; c.fillRect(x | 0, y | 0, Math.max(1, w | 0), Math.max(1, h | 0)); }
function rr(x, y, seed) { let v = Math.sin(x * 73.127 + y * 197.31 + seed * 32.73) * 41728.148; return v - Math.floor(v); }
function write(c, s, x, y, col = '#dcd1a9', size = 8) { c.font = `${size}px monospace`; c.fillStyle = col; c.fillText(s, x, y); }
function wallTile(c, x, y, gx, gy, day) {
    const kind = (gx * 11 + gy * 17 + day * 5) % 6;
    if (kind === 0 || kind === 3) {
        // Piedra tallada, junta sombreada, musgo.
        pixel(c, x, y, TILE, TILE, '#77796a');
        pixel(c, x + 1, y + 1, 10, 10, C.stone);
        pixel(c, x + 1, y + 6, 10, 1, '#6d7972');
        pixel(c, x + 6, y + 1, 1, 5, C.stoneDark);
        pixel(c, x + 3, y + 7, 1, 3, '#5b7361');
    }
    else if (kind === 1) {
        pixel(c, x, y, TILE, TILE, '#5b755f');
        pixel(c, x + 1, y + 1, 10, 10, '#6d9067');
        pixel(c, x + 3, y + 3, 4, 4, '#4e6e54');
        pixel(c, x + 8, y + 2, 2, 7, '#89a77c');
    }
    else if (kind === 2) {
        pixel(c, x, y, TILE, TILE, '#a47a66');
        pixel(c, x + 1, y + 1, 10, 10, C.roof);
        for (let j = 0; j < 3; j++)
            pixel(c, x + 1, y + 2 + j * 3, 10, 1, '#5e5c4d');
    }
    else if (kind === 4) {
        pixel(c, x, y, TILE, TILE, '#506850');
        pixel(c, x + 1, y + 1, 10, 10, '#4e7b55');
        pixel(c, x + 3, y + 2, 7, 2, '#8aa970');
        pixel(c, x + 5, y + 7, 5, 3, '#315a48');
    }
    else {
        pixel(c, x, y, TILE, TILE, '#6b675d');
        pixel(c, x + 1, y + 1, 10, 10, '#8a826e');
        pixel(c, x + 2, y + 2, 3, 3, '#c2b597');
        pixel(c, x + 7, y + 6, 3, 3, '#514f4d');
    }
}
function groundTile(c, x, y, gx, gy, day, corruption) {
    let k = rr(gx, gy, day), desat = corruption && rr(gx + 4, gy, day) > .68;
    const base = day === 1 ? C.grassLight : day === 4 ? '#73998e' : day === 6 ? '#aaa28b' : C.grass;
    pixel(c, x, y, TILE, TILE, desat ? '#56686a' : base);
    pixel(c, x + 1, y + 1, 10, 10, desat ? '#53676a' : (k > .66 ? C.grass : day === 1 ? '#8ec16c' : '#709f70'));
    if (k > .76) {
        pixel(c, x + 3, y + 3, 2, 1, '#286951');
        pixel(c, x + 5, y + 2, 1, 4, '#347c52');
        pixel(c, x + 8, y + 5, 2, 2, '#d2be8a');
    }
    else if (k < .14) {
        pixel(c, x + 1, y + 5, 9, 2, C.soil);
        pixel(c, x + 5, y + 1, 2, 10, '#bfaa77');
    }
    else {
        pixel(c, x + 6, y + 5, 2, 2, '#609c56');
        pixel(c, x + 2, y + 8, 2, 1, '#3c854f');
    }
    if (day === 1 && (gx + gy) % 9 === 0) {
        pixel(c, x + 2, y + 2, 4, 1, '#d8ba85');
        pixel(c, x + 4, y + 6, 2, 1, '#ecdb9f');
    }
}
function portrait(c, x, y, kind, corrupt) {
    // 10×12: cabeza, cabello, torso y pies. Los personajes no son clones externos.
    const skin = corrupt ? '#c7c8bc' : '#e4c8a1';
    pixel(c, x + 3, y + 1, 6, 5, skin);
    pixel(c, x + 2, y, 8, 2, kind === 'child' ? '#38556b' : '#344451');
    pixel(c, x + 3, y + 4, 1, 1, '#27383e');
    pixel(c, x + 8, y + 4, 1, 1, '#27383e');
    const shirt = kind === 'child' ? '#507eaf' : kind === 'naoWitness' ? '#99616e' : '#a34d58';
    pixel(c, x + 2, y + 6, 8, 4, shirt);
    pixel(c, x + 1, y + 7, 2, 3, '#b3ab92');
    pixel(c, x + 9, y + 7, 2, 3, '#b3ab92');
    pixel(c, x + 3, y + 10, 2, 2, '#33405e');
    pixel(c, x + 7, y + 10, 2, 2, '#33405e');
}
function special(c, px, py, type, corrupt, s) {
    // Sprite de objeto basado en su tipo, con indicadores visuales sin números de depuración.
    const x = OFFSET_X + px * TILE, y = OFFSET_Y + py * TILE;
    if (type === 'child' || type === 'naoWitness' || type === 'traveler' || type === 'paperNurse' || type === 'facelessNeighbor' || type === 'ashKeeper') {
        portrait(c, x, y, type, corrupt);
        return;
    }
    if (/well|originCore|cinderIndex|clock|reflection|finalArchive/i.test(type)) {
        pixel(c, x, y + 3, 12, 9, '#536c6e');
        pixel(c, x + 1, y + 4, 10, 7, '#b7b1a0');
        pixel(c, x + 3, y + 5, 6, 5, '#203d46');
        pixel(c, x + 5, y + 4, 2, 1, '#d4c5ad');
        return;
    }
    if (/seal|ending|exit|threshold|platform|bedZero/i.test(type)) {
        pixel(c, x + 1, y + 1, 10, 11, '#513e50');
        pixel(c, x + 2, y + 2, 8, 10, corrupt ? '#8a495d' : '#b07c5f');
        pixel(c, x + 4, y + 4, 4, 6, '#1d2638');
        pixel(c, x + 7, y + 6, 1, 2, '#f1db9c');
        return;
    }
    if (/note|book|ledger|address|portrait|file|map|name|signal|photo|letter/i.test(type)) {
        pixel(c, x + 1, y + 2, 10, 9, '#413d46');
        pixel(c, x + 2, y + 1, 8, 9, '#f0d7a0');
        for (let j = 0; j < 3; j++)
            pixel(c, x + 3, y + 3 + j * 2, 5, 1, '#866956');
        return;
    }
    pixel(c, x + 1, y + 2, 10, 10, C.stoneDark);
    pixel(c, x + 3, y + 3, 6, 7, '#b9ad82');
    pixel(c, x + 5, y + 4, 2, 4, '#9c554d');
}
function corruptScan(c, s, now) {
    if (!s.seal && s.day === 1)
        return;
    const ticks = Math.floor(now / 800);
    for (let j = 0; j < 6; j++) {
        const y = 20 + Math.floor(rr(j, ticks, s.day) * 140);
        const x = 34 + Math.floor(rr(j + 9, ticks, s.day) * 185);
        pixel(c, x, y, 4 + (j % 3) * 7, 1, j % 2 ? '#ad536c' : '#2f6e79');
    }
}
const RetroRpg = {
    render(c, s, now) {
        c.imageSmoothingEnabled = false;
        pixel(c, 0, 0, RW, RH, C.sky);
        pixel(c, 5, 5, 246, 182, '#131e27');
        pixel(c, 8, 8, 240, 175, '#2c3b35');
        pixel(c, 10, 10, 236, 172, '#172b2b');
        write(c, 'T S / 0 4     UNA PARTIDA VACÍA', 28, 15, '#dfd9b1', 8);
        const map = E.rpgMap(s);
        const corrupt = s.day > 1 || !!s.seal;
        for (let y = 0; y < map.length; y++)
            for (let x = 0; x < map[y].length; x++) {
                const px = OFFSET_X + x * TILE, py = OFFSET_Y + y * TILE;
                if (E.wall(map, x, y))
                    wallTile(c, px, py, x, y, s.day);
                else
                    groundTile(c, px, py, x, y, s.day, corrupt);
            }
        // Un marco de RPG portátil de 2006 y referencias a un pueblo que ya no existe.
        c.strokeStyle = '#667c6b';
        c.strokeRect(OFFSET_X - .5, OFFSET_Y - .5, 192 + 1, 156 + 1);
        for (const item of E.rpgItems(s))
            special(c, item.x, item.y, item.id, corrupt, s);
        const px = OFFSET_X + s.px * TILE, py = OFFSET_Y + s.py * TILE;
        portrait(c, px, py, 'protagonist', corrupt);
        pixel(c, px + 3, py + 12, 7, 1, '#172b2a');
        corruptScan(c, s, now);
        pixel(c, 14, 177, 228, 12, '#142125');
        write(c, s.day === 1 ? 'NO BORRES LA PARTIDA' : `ARCHIVO MALDITO   DÍA ${s.day}`, 53, 186, corrupt ? '#d597a0' : '#dfd1a2', 8);
        const found = E.rpgItems(s).filter(o => Math.abs(o.x - s.px) + Math.abs(o.y - s.py) <= 1);
        if (found.length) {
            pixel(c, 49, 147, 157, 17, '#17222be0');
            write(c, 'E · HABLAR / EXAMINAR', 62, 159, '#f0e1b3', 8);
        }
    }
};

// premium/ResponsiveInput.js
/**
 * NAMELESS 404 — controlador de entrada de baja latencia.
 * No depende de DOM ni de un FPS concreto: las pulsaciones son inmediatas;
 * las repeticiones, una por intervalo; liberar siempre detiene la acción.
 */
const INPUT_FIRST_REPEAT_MS = 185;
const INPUT_REPEAT_MS = 92;
const INPUT_DIRECTIONS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);
class ResponsiveInput {
    held = new Map();
    press(source, action, now) {
        const current = this.held.get(source);
        if (current?.action === action)
            return null; // ignorar repeticiones del SO y del DOM
        this.held.set(source, { action, nextAt: now + INPUT_FIRST_REPEAT_MS });
        return action; // pulsación inicial sin bloqueo global
    }
    release(source) { this.held.delete(source); }
    clear() { this.held.clear(); }
    /** Todos los dispositivos usan exactamente la misma cadencia sostenida. */
    repeat(now) {
        const result = [];
        for (const held of this.held.values()) {
            if (INPUT_DIRECTIONS.has(held.action) && now >= held.nextAt) {
                result.push(held.action);
                held.nextAt = now + INPUT_REPEAT_MS; // no acumular acciones si se bloquea un fotograma
            }
        }
        return result;
    }
    get activeCount() { return this.held.size; }
}

// premium/CinematicCamera.js
const limit = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const PI2 = Math.PI * 2;
const CAMERA_LIMITS = { yaw: .68, pitch: .25 };
const CAMERA_EASE_MS = 90;
class CinematicCamera {
    current = { cameraYaw: 0, cameraPitch: 0, cameraHeight: 1.35, rx: 0, ry: 0 };
    active = false;
    targetYaw = 0;
    targetPitch = 0;
    lastTime = 0;
    lastDir = 0;
    lastDay = 0;
    lastMode = '';
    lastSteps = 0;
    walkingUntil = 0;
    enabled = true;
    get isEnabled() { return this.enabled; }
    setEnabled(value) { this.enabled = !!value; this.active = false; this.targetYaw = 0; this.targetPitch = 0; }
    reset() { this.active = false; this.targetYaw = 0; this.targetPitch = 0; this.walkingUntil = 0; }
    look(dx, dy) {
        if (!this.enabled)
            return;
        this.targetYaw = limit(this.targetYaw + limit(dx, -2, 2), -CAMERA_LIMITS.yaw, CAMERA_LIMITS.yaw);
        this.targetPitch = limit(this.targetPitch + limit(dy, -2, 2), -CAMERA_LIMITS.pitch, CAMERA_LIMITS.pitch);
    }
    center() { this.targetYaw = 0; this.targetPitch = 0; }
    get offsets() { return { yaw: this.targetYaw, pitch: this.targetPitch }; }
    sample(source, now, reducedMotion = false) {
        const yaw = source.dir * Math.PI / 2;
        const worldChanged = !this.active || source.day !== this.lastDay || source.mode !== this.lastMode;
        if (worldChanged) {
            this.current = { cameraYaw: yaw, cameraPitch: 0, cameraHeight: 1.35, rx: source.rx, ry: source.ry };
            this.targetYaw = 0;
            this.targetPitch = 0;
            this.walkingUntil = 0;
            this.active = true;
            this.lastSteps = source.steps ?? 0;
        }
        if (!worldChanged && source.dir !== this.lastDir) {
            this.targetYaw = 0;
        }
        if (source.steps !== undefined && source.steps !== this.lastSteps) {
            this.walkingUntil = now + 165;
            this.lastSteps = source.steps;
        }
        const elapsed = this.lastTime ? limit(now - this.lastTime, 0, 80) : 16;
        const amount = !this.enabled || reducedMotion ? 1 : 1 - Math.exp(-elapsed / CAMERA_EASE_MS);
        const desired = yaw + (this.enabled ? this.targetYaw : 0);
        let delta = ((desired - this.current.cameraYaw + Math.PI) % PI2 + PI2) % PI2 - Math.PI;
        this.current.cameraYaw += delta * amount;
        const pitchGoal = this.enabled ? this.targetPitch : 0;
        this.current.cameraPitch += (pitchGoal - this.current.cameraPitch) * amount;
        this.current.rx += (source.rx - this.current.rx) * amount;
        this.current.ry += (source.ry - this.current.ry) * amount;
        const walking = now < this.walkingUntil && !source.won && source.mode === 'real';
        const bob = walking && this.enabled && !reducedMotion ? Math.sin(now * .028) * .014 : 0;
        const height = 1.35 + (source.crouched ? -.14 : 0) + bob;
        this.current.cameraHeight += (height - this.current.cameraHeight) * amount;
        this.lastTime = now;
        this.lastDir = source.dir;
        this.lastDay = source.day;
        this.lastMode = source.mode;
        return { ...this.current };
    }
}

const E=NamelessEngine;

// render.js
// @ts-nocheck


/* NAMELESS 404: doble pantalla 256x192, gráficos propios dibujados en Canvas. */
const NamelessRender = (function () {
    'use strict';
    const W = 256, H = 192, PI = Math.PI;
    const PALETTE = { ink: '#071017', stone: '#374447', leaf: '#45564d', cream: '#d8d7b7', red: '#b96470', sand: '#cba780' };
    const CHAR = {
        'A': ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
    };
    function box(c, x, y, w, h, color) { c.fillStyle = color; c.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h))); }
    function txt(c, str, x, y, color = '#d8e0d2', size = 8) { c.fillStyle = color; c.font = `${size}px monospace`; c.fillText(str, x, y); }
    function line(c, x, y, xx, yy, color = '#ffffff') { c.strokeStyle = color; c.beginPath(); c.moveTo(x, y); c.lineTo(xx, yy); c.stroke(); }
    function rand(x, y, seed = 0) { let n = Math.sin(x * 127.1 + y * 311.7 + seed * 89.13) * 43758.5453; return n - Math.floor(n); }
    function crack(c, x, y, wide, col) { line(c, x, y, x + wide * .4, y + wide * .3, col); line(c, x + wide * .4, y + wide * .3, x + wide, y + wide * .2, col); }
    function noise(c, seconds, amount = 20) { for (let i = 0; i < amount; i++) {
        let x = (rand(i, seconds | 0, 10) * W) | 0, y = (rand(i, seconds | 0, 20) * H) | 0;
        box(c, x, y, 1 + (i % 13 === 0 ? 9 : 1), 1, i % 3 === 0 ? '#e2e5e316' : '#02070866');
    } }
    function sky(c) {
        box(c, 0, 0, W, 94, '#111b20');
        box(c, 0, 93, W, 99, '#172025');
        for (let i = 0; i < 97; i += 2) {
            box(c, 0, i, W, 2, `rgba(39,54,58,${(i / 180).toFixed(3)})`);
        }
        for (let y = 96; y < 192; y += 5)
            box(c, 0, y, W, 1, '#2b303327');
    }
    function sight(map, x, y, ang) {
        const dx = Math.sin(ang), dy = -Math.cos(ang);
        let t = 0, px = x, py = y;
        for (let i = 0; i < 300; i++) {
            t += .055;
            px = x + t * dx;
            py = y + t * dy;
            if (E.wall(map, px, py))
                return { d: t, x: px, y: py, side: Math.min((px % 1 + 1) % 1, 1 - (px % 1 + 1) % 1) < .045 ? 1 : 0 };
        }
        return { d: 16, x: px, y: py, side: 0 };
    }
    function shadow(c, light) { let v = c.createRadialGradient(128, 92, 8, 128, 92, light ? 159 : 76); v.addColorStop(0, '#00000000'); v.addColorStop(1, light ? '#000000bd' : '#000000f3'); box(c, 0, 0, W, H, v); }
    function sprite(c, screenX, distance, kind, t) {
        if (distance < .12 || distance > 12)
            return;
        const h = Math.min(182, 148 / distance), w = h * (kind === 'copist' ? .43 : .40), x = screenX - w / 2, y = 96 - h / 2 + (kind === 'copist' ? Math.sin(t * .012) * Math.max(.3, 3 / distance) : 0);
        if (x > W + 30 || x + w < -30)
            return;
        if (kind === 'copist') {
            box(c, x + w * .2, y + h * .2, w * .6, h * .68, '#080d11');
            box(c, x + w * .27, y + h * .04, w * .47, h * .26, '#b5baa9');
            box(c, x + w * .35, y + h * .10, w * .07, h * .035, '#0b1014');
            box(c, x + w * .58, y + h * .10, w * .07, h * .035, '#0b1014');
            const stride = Math.sin(t * .017) * h * .045;
            box(c, x + w * .36, y + h * .64 + stride, w * .10, h * .35, '#0b0c0e');
            box(c, x + w * .57, y + h * .64 - stride, w * .10, h * .35, '#0b0c0e');
            box(c, x - w * .04, y + h * .34, w * .29, h * .37, '#0d1115');
            box(c, x + w * .75, y + h * .35, w * .27, h * .39, '#0d1115');
            box(c, x + w * .32, y + h * .22, w * .4, h * .03, '#6d313d');
            // Paper-mask seams and slightly asynchronous edges. The face never blinks.
            box(c, x + w * .3, y + h * .06, w * .43, Math.max(1, h * .013), '#d4d2bf70');
            line(c, x + w * .55, y + h * .05, x + w * .52, y + h * .22, '#313b3d');
            box(c, x + w * .18, y + h * .20, w * .11, h * .19, '#060b0e');
            box(c, x + w * .71, y + h * .26, w * .08, h * .21, '#050b0c');
            const paperSway = Math.sin(t * .0014) * Math.min(4, w * .16);
            box(c, x + w * .10 + paperSway, y + h * .57, w * .10, h * .35, '#c1c0ad36');
            box(c, x + w * .78 - paperSway, y + h * .61, w * .09, h * .27, '#c1c0ad24');
            if (distance < 2.3) {
                // Hands extend unnaturally toward the ground as the entity closes in.
                box(c, x - w * .035, y + h * .61, w * .11, h * .19, '#9a9c8b');
                box(c, x + w * .91, y + h * .62, w * .10, h * .19, '#999c8c');
            }
        }
        else if (kind === 'shadow') {
            box(c, x + w * .25, y + h * .12, w * .5, h * .6, '#030809');
            box(c, x + w * .34, y, w * .3, h * .26, '#1e2927');
            box(c, x + w * .22, y + h * .68, w * .2, h * .3, '#101717');
            box(c, x + w * .58, y + h * .68, w * .2, h * .3, '#101717');
        }
        if (t % 3 === 0)
            box(c, x, y + h * .44, w, 1, '#c8c8c821');
    }
    function paintObjects(c, s, zBuffer, now) {
        const ang0 = s.dir * PI / 2;
        let things = E.realItems(s).map(o => ({ ...o, d: E.distance(s.rx, s.ry, o.x, o.y) }));
        if (s.chase)
            things.push({ x: s.entityX, y: s.entityY, id: 'copist', d: E.distance(s.rx, s.ry, s.entityX, s.entityY) });
        things.sort((a, b) => b.d - a.d);
        for (const o of things) {
            if (o.d > 10 || o.d < .2)
                continue;
            let angle = Math.atan2(o.x - s.rx, -(o.y - s.ry)) - ang0;
            angle = Math.atan2(Math.sin(angle), Math.cos(angle));
            if (Math.abs(angle) > .78)
                continue;
            let sx = 128 + 153 * Math.tan(angle), col = Math.floor(sx / 2);
            if (col < 0 || col >= zBuffer.length || o.d > zBuffer[col] + .28)
                continue;
            if (o.id === 'copist') {
                sprite(c, sx, o.d, 'copist', now | 0);
                continue;
            }
            const h = Math.min(150, 100 / o.d), w = h * .52, x = sx - w / 2, y = 98 - h / 2;
            if (o.id === 'kibaBreaker') {
                box(c, x, y + h * .31, w, h * .50, '#546a63');
                box(c, x + 3, y + h * .36, w - 6, h * .33, '#1f3437');
                box(c, x + w * .43, y + h * .43, w * .15, h * .13, s.flags?.kibaNorthOpen ? '#afd3a3' : '#a35e53');
            }
            if (o.id === 'kibaWinch') {
                box(c, x + w * .30, y + h * .23, w * .37, h * .60, '#57635c');
                box(c, x + w * .15, y + h * .38, w * .72, h * .13, '#b1aaa0');
                box(c, x + w * .41, y + h * .36, w * .15, h * .33, s.flags?.kibaArchiveOpen ? '#829d7c' : '#743e48');
            }
            if (o.id === 'kibaVent') {
                box(c, x - w * .08, y + h * .23, w * 1.16, h * .47, '#4c6667');
                for (let n = 0; n < 5; n++)
                    box(c, x + 2, y + h * (.30 + n * .06), w - 4, 2, '#1e3035');
            }
            if (o.id === 'kibaHideArchive' || o.id === 'kibaHideBasement') {
                box(c, x - w * .08, y + h * .16, w * 1.16, h * .73, '#54534b');
                for (let n = 0; n < 4; n++) {
                    box(c, x, y + h * (.24 + n * .16), w, h * .08, n % 2 ? '#353b36' : '#6a6758');
                }
                box(c, x + w * .12, y + h * .57, w * .27, h * .22, '#1b2526');
            }
            if (o.id === 'tape') {
                box(c, x, y + h * .68, w, h * .28, '#343a3a');
                box(c, x + w * .13, y + h * .64, w * .74, h * .18, '#a8aca0');
                box(c, x + w * .28, y + h * .69, w * .16, h * .11, '#101619');
                box(c, x + w * .62, y + h * .69, w * .16, h * .11, '#101619');
            }
            if (o.id === 'cabinet') {
                box(c, x, y + h * .06, w, h * .9, '#4d4e48');
                box(c, x + 2, y + h * .1, w - 4, h * .8, '#303b3a');
                box(c, x + w * .66, y + h * .48, 2, 3, '#a9a687');
                line(c, x + w * .48, y + h * .08, x + w * .48, y + h * .86, '#64706b');
            }
            if (o.id === 'locker') {
                box(c, x, y, w, h, '#3e4947');
                box(c, x + 3, y + 3, w - 6, h - 6, '#293936');
                for (let j = 0; j < 3; j++)
                    box(c, x + 6, y + h * .15 + j * 3, w - 12, 1, '#74807c');
                box(c, x + w * .75, y + h * .43, 2, 3, '#b2af90');
            }
            if (o.id === 'telephone') {
                box(c, x, y + h * .45, w, h * .4, '#303a3c');
                box(c, x + w * .13, y + h * .56, w * .72, h * .12, '#73867b');
                box(c, x + w * .14, y + h * .43, w * .72, h * .09, '#121f22');
            }
            if (o.id === 'mirror') {
                box(c, x, y + h * .05, w, h * .83, '#655d52');
                box(c, x + 3, y + h * .08, w - 6, h * .74, '#273f42');
                box(c, x + w * .45, y + h * .12, w * .12, h * .58, '#b1baaf36');
            }
            if (o.id === 'register') {
                box(c, x, y + h * .36, w, h * .45, '#746953');
                box(c, x + 3, y + h * .35, w - 6, h * .16, '#c1b69c');
                box(c, x + w * .22, y + h * .41, w * .56, 2, '#5a4f48');
                box(c, x + w * .2, y + h * .49, w * .49, 2, '#5a4f48');
            }
            if (o.id === 'intercom') {
                box(c, x + w * .16, y + h * .10, w * .68, h * .70, '#3f5659');
                box(c, x + w * .24, y + h * .23, w * .50, h * .16, '#acb8ad');
                for (let k = 0; k < 4; k++)
                    box(c, x + w * .23 + k * 3, y + h * .48, 2, 2, '#152629');
                box(c, x + w * .67, y + h * .64, 3, 3, '#a96572');
            }
            if (o.id === 'room207') {
                box(c, x + w * .07, y + h * .02, w * .86, h * .94, '#4e393c');
                box(c, x + w * .17, y + h * .10, w * .65, h * .81, '#241e25');
                box(c, x + w * .27, y + h * .39, w * .31, h * .12, '#ad8580');
                box(c, x + w * .72, y + h * .48, 2, 2, '#c8ab87');
            }
            if (o.id === 'locker2') {
                box(c, x, y + h * .06, w, h * .89, '#53615c');
                for (let k = 0; k < 3; k++)
                    box(c, x + 4, y + h * .16 + k * h * .2, w - 8, 2, '#273b3b');
            }
            if (o.id === 'ticket') {
                box(c, x + w * .13, y + h * .47, w * .75, h * .29, '#c7b793');
                box(c, x + w * .19, y + h * .50, w * .60, h * .06, '#7b7473');
                box(c, x + w * .19, y + h * .60, w * .29, 2, '#5e5c55');
            }
            if (o.id === 'schedule') {
                box(c, x - w * .18, y + h * .05, w * 1.35, h * .70, '#111c24');
                box(c, x - w * .11, y + h * .12, w * 1.18, h * .52, '#263f40');
                for (let a = 0; a < 3; a++) {
                    box(c, x - w * .03, y + h * (.19 + a * .13), w * .78, 2, '#bbbe99');
                    box(c, x + w * .80, y + h * (.19 + a * .13), w * .11, 2, '#d49f71');
                }
            }
            if (o.id === 'booth') {
                box(c, x - w * .16, y, w * 1.32, h, '#344c4b');
                box(c, x, y + h * .16, w, h * .72, '#1b292d');
                box(c, x + w * .16, y + h * .28, w * .52, h * .20, '#768a88');
                box(c, x + w * .73, y + h * .55, 3, 3, '#c5a76b');
            }
            if (o.id === 'bench') {
                box(c, x - w * .10, y + h * .51, w * 1.2, h * .15, '#566c69');
                box(c, x - w * .05, y + h * .28, w * 1.1, h * .22, '#344746');
                box(c, x, y + h * .62, 2, h * .3, '#6d7e73');
                box(c, x + w * .86, y + h * .62, 2, h * .3, '#6d7e73');
            }
            if (o.id === 'patientFile') {
                box(c, x, y + h * .31, w, h * .48, '#c7c2a9');
                box(c, x + 3, y + h * .34, w - 6, h * .04, '#735b5c');
                for (let q = 0; q < 3; q++)
                    box(c, x + 4, y + h * (.43 + q * .09), w * .64, 1, '#656f68');
                box(c, x + w * .68, y + h * .59, w * .18, h * .18, '#a25b65');
            }
            if (o.id === 'xray') {
                box(c, x - w * .09, y + h * .05, w * 1.18, h * .84, '#5a6e6c');
                box(c, x + 2, y + h * .12, w - 4, h * .66, '#102e35');
                box(c, x + w * .37, y + h * .18, w * .25, h * .16, '#a0b8aa');
                box(c, x + w * .45, y + h * .35, w * .08, h * .34, '#a0b8aa');
                for (let q = 0; q < 4; q++)
                    box(c, x + w * .21, y + h * (.41 + q * .055), w * .59, 1, '#a8bcb3');
            }
            if (o.id === 'reel') {
                box(c, x - w * .15, y + h * .45, w * 1.3, h * .32, '#4a4e51');
                for (let k of [0.26, 0.74]) {
                    box(c, x + w * k - w * .16, y + h * .40, w * .31, h * .31, '#b4a88f');
                    box(c, x + w * k - w * .07, y + h * .49, w * .13, h * .12, '#293538');
                }
                box(c, x + w * .34, y + h * .56, w * .33, 2, '#111d23');
            }
            if (o.id === 'curtain') {
                box(c, x - w * .18, y + h * .02, w * 1.35, h * .92, '#8aaba3');
                for (let k = 0; k < 5; k++)
                    box(c, x + w * (-.12 + k * .25), y + h * .05, w * .11, h * .82, '#527671');
                box(c, x - w * .2, y + h * .04, w * 1.4, 2, '#b2b6a6');
            }
            if (o.id === 'originTerminal') {
                box(c, x - w * .1, y + h * .1, w * 1.2, h * .75, '#415359');
                box(c, x + 2, y + h * .17, w - 4, h * .43, '#101e2b');
                box(c, x + w * .25, y + h * .3, w * .45, 2, '#a7b7a8');
                box(c, x + w * .39, y + h * .66, w * .24, h * .09, '#9a8874');
            }
            if (o.id === 'voiceProof') {
                box(c, x, y + h * .18, w, h * .64, '#60565e');
                box(c, x + w * .22, y + h * .27, w * .53, h * .18, '#1e2f39');
                for (let i = 0; i < 5; i++)
                    box(c, x + w * .23 + i * w * .1, y + h * .52, w * .05, h * .12, '#b2ad9f');
            }
            if (o.id === 'originalPhoto') {
                box(c, x - w * .05, y + h * .19, w * 1.1, h * .65, '#b4ac90');
                box(c, x + w * .10, y + h * .27, w * .83, h * .49, '#253941');
                for (let i = 0; i < 2; i++) {
                    box(c, x + w * (.2 + i * .45), y + h * .34, w * .20, h * .20, '#b9bda9');
                    box(c, x + w * (.18 + i * .45), y + h * .53, w * .25, h * .20, '#697e79');
                }
            }
            if (o.id === 'safeCabinet') {
                box(c, x, y + h * .1, w, h * .8, '#586767');
                for (let i = 0; i < 4; i++)
                    box(c, x + 3, y + h * (.21 + i * .16), w - 6, 2, '#26383c');
            }
            if (o.id === 'ashLabel') {
                box(c, x + w * .13, y + h * .32, w * .75, h * .46, '#8b8c79');
                box(c, x + w * .21, y + h * .32, w * .58, h * .17, '#c1b9a1');
                box(c, x + w * .32, y + h * .51, w * .32, h * .16, '#4b4d4a');
            }
            if (o.id === 'furnace') {
                box(c, x - w * .14, y + h * .05, w * 1.3, h * .87, '#55514a');
                box(c, x - w * .02, y + h * .18, w * 1.05, h * .60, '#202528');
                box(c, x + w * .10, y + h * .30, w * .76, h * .37, '#4a3933');
            }
            if (o.id === 'negative') {
                box(c, x - w * .02, y + h * .22, w * 1.05, h * .63, '#aea48e');
                box(c, x + w * .12, y + h * .29, w * .73, h * .47, '#253439');
                box(c, x + w * .36, y + h * .36, w * .23, h * .18, '#84978f');
            }
            if (o.id === 'serviceVent') {
                box(c, x - w * .08, y + h * .18, w * 1.16, h * .65, '#68665d');
                for (let k = 0; k < 5; k++)
                    box(c, x, y + h * (.26 + k * .1), w, 2, '#252d30');
            }
            if (o.id === 'streetSign') {
                box(c, x + w * .40, y + h * .12, w * .15, h * .82, '#58625d');
                box(c, x - w * .08, y + h * .06, w * 1.16, h * .24, '#b3b8a0');
                box(c, x + 2, y + h * .12, w * .75, 2, '#3d4548');
            }
            if (o.id === 'emptyPlot') {
                box(c, x - w * .13, y + h * .65, w * 1.24, h * .12, '#515d55');
                for (let j = 0; j < 4; j++)
                    box(c, x + w * (j * .22), y + h * .42 + (j % 2) * 3, w * .04, h * .22, '#6a685e');
            }
            if (o.id === 'missingHouse') {
                box(c, x - w * .15, y + h * .05, w * 1.30, h * .92, '#5b5c51');
                box(c, x - w * .02, y + h * .12, w * 1.04, h * .79, '#222b2c');
                box(c, x + w * .60, y + h * .47, w * .09, h * .13, s.d5Street ? '#b8a786' : '#5b3e42');
            }
            if (o.id === 'busShelter') {
                box(c, x - w * .14, y + h * .14, w * 1.29, h * .08, '#9a9a83');
                box(c, x - w * .09, y + h * .17, w * .10, h * .70, '#55665f');
                box(c, x + w * .94, y + h * .17, w * .10, h * .70, '#55665f');
                box(c, x + w * .12, y + h * .61, w * .75, h * .08, '#aaa38c');
            }
            if (o.id === 'photo') {
                box(c, x, y + h * .12, w, h * .6, '#6f6857');
                box(c, x + 3, y + h * .15, w - 6, h * .53, '#b7b29c');
                box(c, x + w * .12, y + h * .41, w * .18, h * .22, '#343f42');
                box(c, x + w * .38, y + h * .30, w * .21, h * .32, '#59655d');
                box(c, x + w * .68, y + h * .36, w * .2, h * .26, '#20262b');
                box(c, x + w * .64, y + h * .25, w * .16, h * .18, '#090e13');
            }
            // Mancha de ocre, polvo y roturas estilizadas en los objetos interactivos.
            if (o.d < 2.6 && ((now / 900) | 0) % 2 === 0)
                box(c, x + w * .43, y + h * .07, Math.max(2, w * .12), 1, '#cfceae66');
        }
    }
    function real(c, s, now) {
        sky(c);
        const room = E.roomAt(s.rx, s.ry, s.day), basement = room === 'SOTANO TECNICO', archives = room === 'ALA DE ARCHIVOS', east = room === 'ALA ESTE', residence = s.day === 2, station = s.day === 3, hospital = s.day === 4, neighborhood = s.day === 5, ashes = s.day === 6, origin = s.day === 7;
        const tint = origin ? (room === 'CAMARA DEL ORIGINAL' ? [.57, .73, .76] : room === 'SALA DE VOCES' ? [.73, .52, .64] : [.55, .69, .72]) : ashes ? (room === 'ARCHIVO NEGATIVO' ? [.62, .60, .56] : room === 'HORNO CENTRAL' ? [.74, .57, .50] : [.67, .65, .60]) : neighborhood ? (room === 'CASA AUSENTE' ? [.58, .53, .47] : room === 'SOLAR VACIO' ? [.67, .61, .51] : [.70, .67, .58]) : hospital ? (room === 'QUIROFANO CERO' ? [.59, .78, .71] : room === 'RADIOLOGIA' ? [.63, .81, .78] : [.72, .80, .72]) : station ? (room === 'VIA CERO' ? [.49, .63, .68] : room === 'PANEL DE SALIDAS' ? [.72, .72, .61] : [.58, .68, .66]) : residence ? (room === 'HABITACION 207' ? [.76, .56, .59] : room === 'DORMITORIOS' ? [.66, .71, .65] : [.64, .72, .70]) : basement ? [.60, .69, .73] : archives ? [.71, .65, .59] : east ? [.62, .74, .77] : [.78, .81, .75];
        // Suelo en falso 3D, baldosas irregulares y luminarias rotas.
        for (let y = 98; y < H; y++) {
            let k = (y - 96) / (H - 96), floorShade = (17 + Math.floor(k * 19));
            box(c, 0, y, W, 1, `rgb(${Math.round(floorShade * tint[0])},${Math.round(floorShade * tint[1])},${Math.round(floorShade * tint[2])})`);
            if (y % Math.max(3, Math.round(17 / (k + .16))) === 0)
                box(c, 0, y, W, 1, '#888e8760');
        }
        for (let n = -4; n <= 4; n++) {
            let a = 128 + n * 43;
            line(c, 128, 96, a, 191, '#101b1c45');
        }
        box(c, 91, 4, 74, 3, '#9caa9360');
        box(c, 108, 7, 40, 2, '#b5bea160');
        if (basement) {
            box(c, 0, 70, W, 2, '#43505222');
            box(c, 0, 75, W, 2, '#171b2233');
        }
        if (archives) {
            box(c, 0, 19, W, 2, '#5c473a25');
        }
        if (residence) {
            box(c, 0, 41, W, 1, '#89948727');
            box(c, 15, 3, 17, 2, '#bbab9150');
            box(c, 224, 3, 17, 2, '#bbab9150');
        }
        if (ashes) {
            box(c, 36, 4, 184, 13, '#242627');
            box(c, 40, 6, 176, 9, '#5d6259');
            txt(c, s.d6Vent ? 'ARCHIVO: ABIERTO' : 'ARCHIVO DE CENIZAS — 06', 45, 13, '#d8d0b1', 7);
            for (let j = 0; j < 7; j++)
                box(c, j * 37 + (j % 2) * 11, 130 + (j % 3) * 8, 2, 2, '#b0ada353');
        }
        if (neighborhood) {
            // Fachadas ausentes: marcas de suelo y letreros apenas legibles.
            for (let y = 105; y < 192; y += 18)
                box(c, 0, y, W, 1, '#b3a68a44');
            box(c, 46, 4, 164, 12, '#1a2827');
            box(c, 48, 6, 160, 8, '#58665c');
            txt(c, s.d5Street ? 'CALLE RESTAURADA / CASA 0' : 'CALLE DE LOS AUSENTES', 56, 12, '#e3d4b5', 8);
            for (let i = 0; i < 3; i++) {
                const k = 20 + i * 87;
                box(c, k, 55 + i * 7, 19, 55, '#131d1f33');
            }
        }
        if (hospital) {
            // Baldosas azuladas, fluorescentes, cartel de admisión y una línea de monitor.
            for (let y = 100; y < 192; y += 15)
                box(c, 0, y, W, 1, '#b2d0c251');
            for (let x = 0; x < 256; x += 27)
                line(c, x, 192, 128 + (x - 128) * .09, 96, '#788c8258');
            box(c, 44, 4, 168, 12, '#142b2c');
            box(c, 46, 6, 164, 8, '#466762');
            txt(c, s.d4Fold ? 'SALA 0  /  ACCESO ABIERTO' : 'SALA 0  /  SIN ACCESO', 56, 12, '#dce7c7', 8);
            if (room === 'QUIROFANO CERO') {
                box(c, 9, 155, 238, 2, '#8ec8b078');
                box(c, 9, 164, 238, 1, '#8ec8b03e');
            }
        }
        if (station) {
            // Andén de azulejos, tubos fluorescentes, marcas de seguridad y rieles de fondo.
            for (let y = 99; y < 192; y += 13) {
                box(c, 0, y, W, 1, '#a9aa7850');
            }
            for (let x = 6; x < 256; x += 20)
                line(c, x, 192, 128 + (x - 128) * .12, 98, '#61747752');
            box(c, 49, 4, 158, 12, '#0b1418');
            box(c, 51, 6, 154, 8, '#45605b');
            txt(c, s.d3Signal ? 'PLATAFORMA 0  /  ABIERTA' : 'PLATAFORMA 0  /  CERRADA', 61, 12, '#d8c99a', 8);
            if (room === 'VIA CERO') {
                box(c, 12, 157, 232, 2, '#c7ad5f80');
                box(c, 16, 161, 224, 1, '#c7ad5f60');
            }
        }
        const zBuffer = [];
        for (let i = 0; i < 128; i++) {
            let ang = s.dir * PI / 2 + Math.atan((i * 2 - 128) / 153), r = sight(E.realMap(s), s.rx, s.ry, ang), d = r.d * Math.cos(ang - s.dir * PI / 2);
            zBuffer[i] = d;
            const ht = Math.min(290, 167 / Math.max(.1, d)), yy = 96 - ht / 2;
            const tileX = Math.abs((r.x % 1 + 1) % 1), tileY = Math.abs((r.y % 1 + 1) % 1);
            const fx = Math.min(tileX, 1 - tileX, tileY, 1 - tileY), isSeam = fx < .08;
            const base = Math.max(17, Math.floor(138 / (1 + d * .22))), shade = s.light ? 1 : .34;
            let rr = Math.round(base * tint[0] * shade), gg = Math.round(base * tint[1] * shade), bb = Math.round(base * tint[2] * shade);
            if (isSeam) {
                rr *= .48;
                gg *= .48;
                bb *= .48;
            }
            if (r.side) {
                rr *= .84;
                gg *= .84;
                bb *= .84;
            }
            box(c, i * 2, yy, 2, ht, `rgb(${rr | 0},${gg | 0},${bb | 0})`);
            if (d < 9) {
                let stitch = ht * .19;
                for (let y = 1; y < 5; y++)
                    box(c, i * 2, yy + y * stitch, 2, 1, '#0c121540');
                let pattern = (Math.floor(r.x * 7) + Math.floor(r.y * 7)) % 7;
                if (pattern === 1)
                    box(c, i * 2, yy + ht * .72, 2, 2, '#070c0f50');
                // Desconchones, zócalos y tuberias procedurales con variacion por estancia.
                if (pattern === 3 && ht > 28)
                    box(c, i * 2, yy + ht * .3, 2, Math.min(6, ht * .07), '#181d213b');
                if (archives && ht > 28)
                    box(c, i * 2, yy + ht * .76, 2, Math.max(1, ht * .09), '#352c2b77');
                if (basement && ht > 20)
                    box(c, i * 2, yy + ht * .24, 2, 2, '#77807640');
                if (residence && ht > 35) {
                    if (pattern === 4)
                        box(c, i * 2, yy + ht * .31, 2, 3, '#9c9e8873');
                    if (pattern === 6)
                        box(c, i * 2, yy + ht * .72, 2, Math.max(2, ht * .08), '#47333687');
                }
                if (hospital && ht > 25) {
                    if (pattern === 2)
                        box(c, i * 2, yy + ht * .26, 2, Math.max(2, ht * .05), '#b2c4ba70');
                    if (pattern === 6)
                        box(c, i * 2, yy + ht * .69, 2, Math.max(2, ht * .06), '#344f4b99');
                }
                if (station && ht > 25) {
                    if (pattern === 2)
                        box(c, i * 2, yy + ht * .32, 2, Math.max(2, ht * .10), '#c3c0a07d');
                    if (pattern === 5)
                        box(c, i * 2, yy + ht * .70, 2, Math.max(1, ht * .04), '#d4ac597c');
                }
                if (east && pattern === 5 && ht > 35)
                    box(c, i * 2, yy + ht * .13, 2, 3, '#202e3c58');
            }
        }
        paintObjects(c, s, zBuffer, now);
        if (!s.light) {
            box(c, 0, 0, W, H, '#00071148');
        }
        shadow(c, s.light);
        if (s.chase) {
            const d = E.distance(s.rx, s.ry, s.entityX, s.entityY);
            if (d < 5)
                box(c, 0, 0, W, H, `rgba(87,12,22,${(0.03 + (5 - d) * .013).toFixed(3)})`);
        }
        box(c, 125, 96, 7, 1, '#e2e3d3a6');
        box(c, 128, 93, 1, 7, '#e2e3d3a6');
        txt(c, s.day === 7 ? '07 / ARCHIVO DE ORIGEN' : s.day === 6 ? '06 / DEPOSITO DE CENIZAS' : s.day === 5 ? '05 / CALLE DE LOS AUSENTES' : s.day === 4 ? '04 / SANATORIO DE PAPEL' : s.day === 3 ? '03 / ESTACION HATSUNE' : s.day === 2 ? '02 / RESIDENCIA KIBA' : '01 / EDIFICIO KIBA', 9, 28, '#b6c6bd', 8);
        txt(c, room, 9, 39, '#92afa6', 8);
        txt(c, `POS ${Math.floor(s.rx)}:${Math.floor(s.ry)} ${['N', 'E', 'S', 'O'][s.dir]}  ${s.hidden ? 'OCULTO' : ''}`, 9, 181, '#b7c5bb', 8);
        if (s.day === 1 && s.flags?.kibaFinaleStage === 1 || s.day === 1 && s.flags?.kibaFinaleStage === 2) {
            const second = s.flags.kibaFinaleStage === 2;
            box(c, 33, 68, 190, 22, '#111b1bdc');
            box(c, 33, 68, 190, 1, '#b28b6b');
            txt(c, second ? 'HUYE AL VESTIBULO   2/2' : 'LLEGA A LOS ARCHIVOS 1/2', 44, 77, '#e2ceb0', 8);
            txt(c, 'LA CINTA SIGUE GRABANDO', 54, 86, '#a6b7ad', 7);
        }
        if (s.day === 1 && s.flags?.kibaFinaleStage === 3) {
            txt(c, 'KIBA / HUIDA COMPLETA', 57, 160, '#d9c7a4', 8);
        }
        if (s.chase && s.threat > 38) {
            txt(c, 'NO ES TU SOMBRA', 78, 160, '#e5a0a2', 9);
        }
        if (room === 'SOTANO TECNICO' && s.tape && !s.hidden && s.threat > 57) {
            // Aparicion breve en zona de alto peligro, sin destellos necesarios.
            const shimmer = Math.floor(now / 650) % 7;
            if (shimmer === 2 || shimmer === 3)
                sprite(c, 172, 3.2, 'shadow', now);
        }
        const prox = E.realItems(s).filter(o => E.distance(o.x, o.y, s.rx, s.ry) < o.r).sort((a, b) => E.distance(a.x, a.y, s.rx, s.ry) - E.distance(b.x, b.y, s.rx, s.ry));
        if (prox.length) {
            const label = { kibaBreaker: 'CUADRO NORTE', kibaWinch: 'TORNO DE ARCHIVOS', kibaVent: 'GOLPEAR CONDUCTO', kibaHideArchive: 'ESCONDERSE (RIESGO)', kibaHideBasement: 'ESCONDERSE (RIESGO)', tape: 'CINTA 04', cabinet: 'ARMARIO', locker: 'ESCONDERSE', telephone: 'TELEFONO', mirror: 'ESPEJO', photo: 'FOTOGRAFIA', register: 'REGISTRO', intercom: 'INTERFONO', room207: 'PUERTA 207', locker2: 'BIOMBO', ticket: 'BILLETE', schedule: 'PANEL DE SALIDAS', booth: 'CABINA', bench: 'BANCO', patientFile: 'EXPEDIENTE', xray: 'RADIOGRAFIA', reel: 'BOBINA', curtain: 'CORTINA', ashLabel: 'URNA 06', furnace: 'HORNO', negative: 'NEGATIVO', serviceVent: 'CONDUCTO', originTerminal: 'TERMINAL', voiceProof: 'PRUEBA DE VOZ', originalPhoto: 'FOTO ORIGINAL', safeCabinet: 'ARCHIVADOR' };
            box(c, 49, 145, 158, 15, '#071013bf');
            txt(c, 'E: ' + (label[prox[0].id] || 'EXAMINAR'), 61, 155, '#cdd4ba', 9);
        }
    }
    function drawTiles(c, s, now) {
        box(c, 0, 0, W, H, '#0c1618');
        // marco y fondo del juego maldito: 16x13 casillas de 11px.
        txt(c, 'ARCHIVO / VERSION ??.??', 34, 14, '#b4c8b0', 9);
        const T = 11, OX = 40, OY = 23, map = E.rpgMap(s);
        for (let y = 0; y < map.length; y++)
            for (let x = 0; x < map[0].length; x++) {
                const xx = OX + x * T, yy = OY + y * T, wall = E.wall(map, x, y), rnd = rand(x, y, s.day * 19);
                box(c, xx, yy, T, T, wall ? (s.day === 7 ? '#444e55' : s.day === 6 ? '#4a4a48' : s.day === 5 ? '#57544a' : s.day === 4 ? '#53625c' : s.day === 3 ? '#414750' : s.day === 2 ? '#4a4552' : '#39474a') : (s.day === 7 ? '#4d6670' : s.day === 6 ? '#686358' : s.day === 5 ? '#6b6a56' : s.day === 4 ? '#4f6560' : s.day === 3 ? '#4a5b61' : s.day === 2 ? '#505249' : '#415347'));
                box(c, xx, yy, T, 1, wall ? '#657171' : '#5d7260');
                if (wall) {
                    box(c, xx + 2, yy + 3, 7, 6, '#243236');
                    box(c, xx + 2, yy + 3, 2, 2, '#5c6963');
                }
                else {
                    if (rnd > .73)
                        box(c, xx + 3, yy + 5, 2, 2, '#677b67');
                    if (rnd < .10)
                        box(c, xx + 7, yy + 7, 1, 3, '#2b4037');
                }
            }
        function icon(x, y, type) {
            const xx = OX + x * T, yy = OY + y * T;
            if (['blankPortrait', 'writtenName', 'naoWitness', 'endingKeep', 'endingFree', 'endingReplace', 'finalArchive'].includes(type)) {
                const color = { blankPortrait: '#a9b4b8', writtenName: '#b0a38d', naoWitness: '#c7b6a4', endingKeep: '#6d9aa1', endingFree: '#c4b38e', endingReplace: '#a46e86', finalArchive: '#bfb7a2' }[type];
                box(c, xx + 1, yy + 1, 9, 9, color);
                box(c, xx + 3, yy + 3, 5, 6, '#1d2931');
                if (type.startsWith('ending')) {
                    box(c, xx + 4, yy + 2, 3, 3, s.d7Choice === type.slice(6).toLowerCase() ? '#eef1d2' : '#30464a');
                }
                if (type === 'writtenName')
                    box(c, xx + 4, yy + 4, 4, 1, s.d7Name ? '#85f1b1' : '#d79a9e');
                if (type === 'finalArchive')
                    box(c, xx + 5, yy + 3, 1, 6, '#e9cdb0');
            }
            if (type === 'cinderIndex') {
                box(c, xx + 1, yy + 1, 9, 9, '#8f8877');
                box(c, xx + 3, yy + 2, 6, 7, s.d6Index ? '#769080' : '#22272a');
                box(c, xx + 5, yy + 3, 1, 5, '#d3c6a4');
            }
            if (type === 'temperatureWheel') {
                box(c, xx + 1, yy + 1, 9, 9, '#69655e');
                box(c, xx + 2, yy + 2, 7, 7, s.d6Vent ? '#789888' : '#a46a5e');
                box(c, xx + 4, yy + 3, 3, 3, '#242b2d');
            }
            if (type === 'ashKeeper') {
                box(c, xx + 3, yy + 1, 5, 4, '#a69f8c');
                box(c, xx + 2, yy + 5, 7, 5, '#454746');
                box(c, xx + 4, yy + 2, 1, 1, '#222728');
            }
            if (type === 'originCore') {
                box(c, xx + 1, yy + 1, 9, 9, s.d6Negative ? '#9db49e' : '#875960');
                box(c, xx + 3, yy + 2, 5, 7, '#1b282c');
                box(c, xx + 5, yy + 4, 1, 3, '#c6b89c');
            }
            if (type === 'addressBook') {
                box(c, xx + 1, yy + 1, 9, 9, '#aa9b79');
                box(c, xx + 3, yy + 2, 6, 7, s.d5Address ? '#587465' : '#242e37');
                box(c, xx + 5, yy + 3, 1, 6, '#ddcbae');
            }
            if (type === 'streetMemory') {
                box(c, xx + 1, yy + 1, 9, 9, '#4c5e5a');
                box(c, xx + 2, yy + 4, 8, 2, s.d5Street ? '#a7bb92' : '#a45862');
                box(c, xx + 5, yy + 2, 1, 7, '#9faaa0');
            }
            if (type === 'facelessNeighbor') {
                box(c, xx + 3, yy + 1, 5, 4, '#beb9a6');
                box(c, xx + 3, yy + 5, 5, 5, '#424d4b');
            }
            if (type === 'houseThreshold') {
                box(c, xx + 1, yy + 1, 9, 10, s.d5House ? '#8da887' : '#865969');
                box(c, xx + 3, yy + 3, 5, 7, '#202c2d');
                box(c, xx + 7, yy + 5, 1, 2, '#b8ae8c');
            }
            if (type === 'inkLedger') {
                box(c, xx + 1, yy + 1, 9, 9, '#a6a093');
                box(c, xx + 2, yy + 2, 7, 7, s.d4Ledger ? '#577b72' : '#222a36');
                box(c, xx + 5, yy + 2, 1, 7, '#b2c0aa');
                box(c, xx + 3, yy + 5, 2, 1, '#b47a7f');
            }
            if (type === 'foldedMap') {
                box(c, xx + 1, yy + 2, 9, 8, '#cad3b6');
                box(c, xx + 4, yy + 2, 1, 8, '#5c7e78');
                box(c, xx + 7, yy + 2, 1, 8, '#5c7e78');
                box(c, xx + 3, yy + 6, 5, 1, s.d4Fold ? '#3a9277' : '#ae626b');
            }
            if (type === 'paperNurse') {
                box(c, xx + 3, yy + 1, 5, 3, '#d1dfca');
                box(c, xx + 2, yy + 4, 7, 6, '#d7cdb6');
                box(c, xx + 4, yy + 1, 3, 1, '#a45a65');
                box(c, xx + 4, yy + 6, 3, 1, '#2d3c40');
            }
            if (type === 'bedZero') {
                box(c, xx + 1, yy + 3, 9, 7, s.d4Reel ? '#b7d7c9' : '#866a71');
                box(c, xx + 2, yy + 5, 7, 3, '#24373c');
                box(c, xx + 3, yy + 1, 5, 2, '#d3e2cb');
            }
            if (type === 'clock') {
                box(c, xx + 1, yy + 1, 9, 9, '#a7a18a');
                box(c, xx + 2, yy + 2, 7, 7, s.d3Clock ? '#576970' : '#142933');
                box(c, xx + 5, yy + 3, 1, 4, '#ddc89a');
                box(c, xx + 5, yy + 5, 3, 1, '#ddc89a');
            }
            if (type === 'signal') {
                box(c, xx + 4, yy + 1, 3, 9, '#74817b');
                box(c, xx + 2, yy + 2, 7, 5, '#19272a');
                box(c, xx + 3, yy + 3, 2, 2, s.d3Signal ? '#4fbf8f' : '#c87572');
                box(c, xx + 6, yy + 3, 2, 2, '#d9c689');
            }
            if (type === 'traveler') {
                box(c, xx + 4, yy + 1, 3, 3, '#a0aba5');
                box(c, xx + 3, yy + 4, 5, 6, '#253039');
                box(c, xx + 2, yy + 7, 1, 2, '#94a5a7');
            }
            if (type === 'platform') {
                box(c, xx + 1, yy + 1, 9, 10, s.d3Booth ? '#91aba5' : '#6a4049');
                box(c, xx + 3, yy + 3, 5, 6, '#1d2c32');
                box(c, xx + 5, yy + 4, 1, 5, '#a8aa82');
            }
            if (type === 'bell') {
                box(c, xx + 3, yy + 2, 5, 7, s.d2Bell ? '#746e6b' : '#d4bd81');
                box(c, xx + 2, yy + 8, 7, 2, '#846251');
                box(c, xx + 4, yy + 1, 3, 2, '#d5b992');
            }
            if (type === 'reflection') {
                box(c, xx + 1, yy + 1, 9, 9, '#867e79');
                box(c, xx + 2, yy + 2, 7, 7, s.d2Reflection ? '#4e7270' : '#152b39');
                box(c, xx + 3, yy + 5, 5, 1, '#bcc8b8');
            }
            if (type === 'exit2') {
                box(c, xx + 1, yy + 1, 9, 10, s.d2Door ? '#7ba3a0' : '#8a5260');
                box(c, xx + 3, yy + 3, 5, 5, '#182a35');
                box(c, xx + 7, yy + 5, 1, 2, '#d7b68a');
            }
            if (type === 'note') {
                box(c, xx + 2, yy + 2, 7, 7, s.note ? '#6d7970' : '#d6bd86');
                box(c, xx + 3, yy + 4, 4, 1, '#635448');
            }
            if (type === 'seal') {
                box(c, xx + 2, yy + 2, 7, 7, s.seal ? '#46544a' : '#b3515c');
                box(c, xx + 3, yy + 3, 5, 5, '#66323b');
            }
            if (type === 'well') {
                box(c, xx + 1, yy + 1, 9, 9, '#6a6967');
                box(c, xx + 2, yy + 2, 7, 7, s.echo ? '#203935' : '#18292d');
                box(c, xx + 3, yy + 4, 5, 2, s.photo ? '#9ca69c' : '#2c383b');
                box(c, xx + 3, yy + 1, 5, 1, '#c2b9a3');
            }
            if (type === 'child') {
                box(c, xx + 3, yy + 1, 5, 4, '#d1cbb2');
                box(c, xx + 2, yy + 5, 7, 5, '#668ca1');
                box(c, xx + 3, yy + 9, 2, 2, '#27384f');
            }
            if (type === 'exit') {
                box(c, xx + 1, yy + 1, 9, 10, s.key ? '#779d82' : '#7d3a45');
                box(c, xx + 4, yy + 3, 2, 5, '#1d2f35');
            }
        }
        for (let o of E.rpgItems(s))
            icon(o.x, o.y, o.id);
        let xp = OX + s.px * T, yp = OY + s.py * T;
        box(c, xp + 2, yp + 2, 7, 8, '#d2d6c4');
        box(c, xp + 3, yp + 1, 5, 4, '#29353f');
        box(c, xp + 3, yp + 8, 2, 2, '#586d83');
        box(c, xp + 7, yp + 8, 2, 2, '#586d83');
        if (s.seal) {
            for (let i = 0; i < 8; i++) {
                let x = rand(i, now | 0) * W | 0;
                box(c, x, 130 + rand(i, 18) * 60, 1, 4, '#a34d585c');
            }
        }
        txt(c, s.day === 7 ? 'EL NOMBRE ES UNA DECISION' : s.day === 6 ? 'EL TIEMPO TAMBIEN ARDE' : s.day === 5 ? 'TU CASA YA NO FIGURA' : s.day === 4 ? 'EL CUERPO ESTA ESCRITO' : s.day === 3 ? 'EL TREN YA HA LLEGADO' : s.day === 2 ? 'LA HABITACION NO EXISTE' : 'NO BORRES ESTA PARTIDA', 38, 181, '#b99a9b', 8);
        const near = E.rpgItems(s).filter(o => Math.abs(s.px - o.x) + Math.abs(s.py - o.y) <= 1);
        if (near.length) {
            const label = { blankPortrait: 'RETRATO VACIO', writtenName: 'NOMBRE ORIGINAL', naoWitness: 'NAO', endingKeep: 'ALTAR CONSERVAR', endingFree: 'ALTAR LIBERAR', endingReplace: 'ALTAR RELEVO', finalArchive: 'ULTIMA PUERTA', cinderIndex: 'INDICE DE CENIZAS', temperatureWheel: 'RUEDA TERMICA', ashKeeper: 'GUARDIAN', originCore: 'NUCLEO ORIGINAL', addressBook: 'LIBRO DE DIRECCIONES', streetMemory: 'CALLE BORRADA', facelessNeighbor: 'VECINO', houseThreshold: 'CASA SIN NUMERO', note: 'NOTA', seal: 'SELLO', child: 'NINO DE TIZA', well: 'POZO', exit: 'UMBRAL', bell: 'CAMPANA', reflection: 'ESPEJO DE AGUA', exit2: 'PUERTA', clock: 'RELOJ', signal: 'SENAL', traveler: 'VIAJERO', platform: 'ANDEN CERO', inkLedger: 'LIBRO DE TINTA', foldedMap: 'PLANO PLEGADO', paperNurse: 'ENFERMERA', bedZero: 'CAMA CERO' };
            box(c, 68, 155, 142, 14, '#091317e9');
            txt(c, 'E: ' + (label[near[0].id] || 'HABLAR'), 79, 165, '#dde3cc', 8);
        }
    }
    function endingFrame(c, s, now) {
        box(c, 0, 0, W, H, '#050809');
        const stages = s.day === 7 ? ({ keep: [['TODOS LOS NOMBRES', 'NINGUNO DESAPARECE', 'Las copias también están vivas.'], ['ARCHIVO ABIERTO', 'LOS OLVIDADOS DECIDEN', 'Ya no son prisioneros.'], ['NAO Y LA COPIA', 'DOS PERSONAS, DOS VIDAS', 'El amanecer no las confunde.'], ['FINAL: CONSERVAR', 'RECORDAR SIN POSEER', 'Gracias por no borrar a nadie.']], free: [['LA PUERTA ABIERTA', 'LOS RECUERDOS REGRESAN', 'El archivo empieza a apagarse.'], ['UN PRECIO EXACTO', 'TU MEMORIA SE DESHACE', 'Las calles recuperan sus nombres.'], ['EL AMANECER', 'NAO PREGUNTA QUIEN ERES', 'No recuerdas la respuesta.'], ['FINAL: LIBERAR', 'UN COMIENZO SIN PASADO', 'El silencio ya no amenaza.']], replace: [['EL PACTO', 'NAO ATRAVIESA EL UMBRAL', 'La Copista se inclina.'], ['LOS NOMBRES', 'TOMAS SU LUGAR', 'La pantalla conoce tu letra.'], ['NAO EN EL EXTERIOR', 'EL SOL NO LA RECONOCE', 'Pero por primera vez es libre.'], ['FINAL: EL RELEVO', 'ALGUIEN DEBE RECORDAR', 'Tu silla seguirá ocupada.']] })[s.endingId] || [['DIA 7', 'ARCHIVO ORIGINAL', 'Fin de la historia.']] : s.day === 6 ? [
            ['URNA NUMERO SEIS', 'TODAS GUARDAN LA MISMA HORA', 'Una fecha que no ha ocurrido.'],
            ['EL HORNO APAGADO', 'ALGUIEN QUEMO MINUTOS DE VIDA', 'No queda fuego, solo el eco.'],
            ['EL NEGATIVO ORIGINAL', 'NAO CONSERVO A LOS OLVIDADOS', 'La Copista es la suma de sus errores.'],
            ['FIN DEL DIA 6', 'TU NOMBRE NO APARECE', 'CONTINUARA · DIA 7']
        ] : s.day === 5 ? [
            ['EL NUMERO QUE FALTA', 'TU CALLE NO EXISTE', 'Pero alguien ha vivido allí.'],
            ['VECINOS SIN ROSTRO', 'LOS RECUERDOS CAMBIAN DE DUEÑO', 'Una familia te reconoce desde su ventana.'],
            ['FOTOGRAFIA 05', 'HAY UN LUGAR PARA TI EN LA MESA', 'La quinta silla está tibia.'],
            ['FIN DEL DIA 5', 'TU CASA ES UN ARCHIVO', 'CONTINUARA · DIA 6']
        ] : s.day === 4 ? [
            ['PACIENTE 000', 'EL HOSPITAL TIENE TU FORMA', 'No hay ningún médico al otro lado.'],
            ['HOJA DE ALTA', 'TODAS LAS CAMAS ESTAN VACIAS', 'Menos una que todavía respira.'],
            ['CIRUJANO INVISIBLE', 'TE HAN EXTRAIDO UN RECUERDO', 'El hueco tiene forma de una puerta.'],
            ['FIN DEL DIA 4', 'EL ARCHIVO SE HA CONVERTIDO EN CENIZA', 'CONTINUARA · DIA 5']
        ] : s.day === 3 ? [
            ['LA HORA 00:13', 'LA ESTACION SE HA DOBLADO', 'El pasillo termina en tu dormitorio.'],
            ['VIA CERO', 'EL TREN NO SE DETIENE', 'Los asientos llevan tu nombre.'],
            ['VOZ DE MEGAFONIA', 'EL CONDUCTOR SE PARECE A TI', 'Y te saluda desde otra edad.'],
            ['FIN DEL DIA 3', 'PROXIMA PARADA: EL HOSPITAL', 'CONTINUARA · DIA 4']
        ] : s.day === 2 ? [
            ['LA PUERTA 207', 'LA RESIDENCIA NO EXISTE', 'Y sin embargo estas dentro.'],
            ['NO ME OYES', 'LA VOZ VIENE DE LA PARED', 'Pide que le devuelvas una fecha.'],
            ['ARCHIVO INCOMPLETO', 'TU COPIA SE HA DESPERTADO', 'La cama tiene tu forma.'],
            ['FIN DEL DIA 2', 'EL PROXIMO DESTINO ES LA ESTACION', 'CONTINUARA · DIA 3']
        ] : [
            ['LA SILLA VACIA', 'EL ARCHIVO ENTRA EN TU CASA', 'Alguien pulsa CONTINUAR.'],
            ['FOTOGRAFIA 03', 'UN ROSTRO HA SIDO BORRADO', 'No consigues recordar de quien.'],
            ['NAO KISARAGI', 'NO ME BUSQUES AHI DENTRO', 'Yo nunca abandone la habitacion.'],
            ['FIN DEL DIA 1', 'EL JUEGO YA SABE QUIEN ERES', 'CONTINUARA · DIA 2']
        ];
        const z = stages[Math.min(3, s.endingStage)];
        // Tres marcos de foto, cuyos ocupantes desaparecen progresivamente.
        for (let i = 0; i < 3; i++) {
            const x = 31 + i * 71;
            box(c, x, 34, 53, 73, '#6c6559');
            box(c, x + 4, 38, 45, 65, '#4c5754');
            if (i === 0 || s.endingStage === 0) {
                box(c, x + 20, 46, 13, 15, '#c1c0a9');
                box(c, x + 17, 60, 19, 32, '#262c32');
            }
            if (i === 1 && s.endingStage >= 1) {
                for (let j = 0; j < 5; j++)
                    box(c, x + 6 + j * 7, 44, 3, 52, '#0c171aa8');
            }
            if (i === 2 && s.endingStage === 2) {
                box(c, x + 18, 47, 16, 15, '#a6b4a6');
                box(c, x + 18, 64, 18, 27, '#a0aaaa');
            }
        }
        txt(c, z[0], 37, 21, '#bb8a89', 12);
        txt(c, z[1], 17, 129, '#c8d2c4', 9);
        txt(c, z[2], 17, 147, '#8fa89d', 8);
        txt(c, s.endingStage >= 3 ? (s.day === 7 ? 'FIN · EXPORTA TU PARTIDA' : s.day === 6 ? 'FIN DEL DIA 6' : s.day === 5 ? 'E / A: COMENZAR DIA 6' : s.day === 4 ? 'E / A: COMENZAR DIA 5' : s.day === 3 ? 'E / A: COMENZAR DIA 4' : s.day === 2 ? 'E / A: COMENZAR DIA 3' : 'E / A: COMENZAR DIA 2') : 'PULSA E / A PARA SEGUIR', 30, 178, '#c9bb91', 9);
        if (Math.floor(now / 700) % 2 === 0)
            box(c, 225, 174, 6, 5, '#ad5c62');
    }
    function topUI(c, s) {
        if (s.scene === 'intro' && s.eventTick === 0) {
            return;
        }
        if (s.eventTick <= 0)
            return;
        let id = s.eventId;
        if (id === 'ending' || id === 'ending2' || id === 'ending3' || id === 'ending4' || id === 'ending5' || id === 'ending6' || id === 'ending7') {
            box(c, 0, 0, W, H, '#05090be9');
            txt(c, `DIA ${s.day} / TERMINADO`, 48, 69, '#d1d2be', 12);
            txt(c, 'AHORA EL JUEGO SABE TU NOMBRE', 13, 100, '#be8186', 9);
            txt(c, (s.day === 7 ? 'FIN DE LA HISTORIA' : 'CONTINUARA'), 87, 133, '#9faaa5', 10);
            return;
        }
        const danger = ['tape', 'behind', 'mirror', 'phone', 'whisper'].includes(id) || id.startsWith('caught-');
        if (danger) {
            const power = Math.min(0.48, s.eventTick / 200 + .07);
            box(c, 0, 0, W, H, `rgba(2,2,5,${power})`);
            for (let i = 0; i < 8; i++) {
                let y = rand(i, s.pulse | 0) * H | 0;
                box(c, 0, y, W, 1, '#b9c0bc33');
            }
            if (id === 'mirror' || id === 'behind')
                sprite(c, 128, 1.7, 'shadow', s.pulse);
            if (id === 'tape' || id === 'phone') {
                box(c, 90, 51, 76, 86, '#0b0c0dc0');
                box(c, 113, 65, 29, 27, '#bec4b7');
                box(c, 117, 76, 6, 2, '#182225');
                box(c, 133, 76, 5, 2, '#182225');
            }
        }
        else
            box(c, 8, 72, 240, 48, '#08151dc7');
        if (id !== 'intro')
            txt(c, id === 'seal' ? 'UNA PUERTA CAMBIO DE LUGAR' : id === 'note' ? 'EL CARTUCHO TE RECUERDA' : id === 'key' ? 'LLAVE DE PAPEL' : id === 'day2' ? 'DIA 2: LA VOZ DETRAS DEL MURO' : id === 'd2register' ? 'EL LIBRO TE CONOCE' : id === 'd2bell' ? 'UNA SEGUNDA CAMPANA' : id === 'd2intercom' ? 'LA PARED CONTESTA' : id === 'd2water' ? 'EL REFLEJO ES UNA PUERTA' : id === 'd2room' ? 'LA HABITACION 207' : id === 'day7' ? 'DIA 7: EL NOMBRE ORIGINAL' : id === 'd7terminal' ? 'UN ERROR HUMANO' : id === 'd7portrait' ? 'UN ROSTRO DUPLICADO' : id === 'd7voice' ? 'DOS VOCES' : id === 'd7name' ? 'LA PUERTA SE ABRE' : id === 'd7original' ? 'LA FOTO NO MIENTE' : id === 'd7choice' ? 'TU DECISION' : id === 'd7double' ? 'ALGUIEN HABLA POR TI' : id === 'day6' ? 'DIA 6: DEPOSITO DE CENIZAS' : id === 'd6label' ? 'LA URNA ESTA VACIA' : id === 'd6index' ? 'TIEMPO INCINERADO' : id === 'd6furnace' ? 'EL HORNO SIN FUEGO' : id === 'd6wheel' ? 'LA RUEDA TERMICA' : id === 'd6negative' ? 'EL NEGATIVO ORIGINAL' : id === 'd6hiss' ? 'LAS CENIZAS RECUERDAN' : id === 'day5' ? 'DIA 5: LA CASA QUE FALTA' : id === 'd5sign' ? 'LA CALLE TIENE TU NOMBRE' : id === 'd5address' ? 'NO HAY VECINOS' : id === 'd5plot' ? 'UN SOLAR HABITADO' : id === 'd5street' ? 'RECUERDA LA CALLE' : id === 'd5house' ? 'LA CASA AUSENTE' : id === 'd5silence' ? 'LAS VENTANAS TE MIRAN' : id === 'day4' ? 'DIA 4: HOSPITAL DE PAPEL' : id === 'd4file' ? 'EXPEDIENTE 000' : id === 'd4ledger' ? 'EL LIBRO TE ESCRIBE' : id === 'd4xray' ? 'HUESOS DE LETRAS' : id === 'd4fold' ? 'EL PLANO SE ABRE' : id === 'd4reel' ? 'OPERACION SIN CIRUJANO' : id === 'd4seam' ? 'LA PARED RESPIRA' : id === 'day3' ? 'DIA 3: ESTACION HATSUNE' : id === 'd3ticket' ? 'BILLETE SIN DESTINO' : id === 'd3clock' ? 'LA HORA INVERTIDA' : id === 'd3board' ? 'EL PANEL TE ESPERA' : id === 'd3signal' ? 'CAMBIO DE VIAS' : id === 'd3booth' ? 'LA CABINA VACIA' : id === 'train' ? 'EL TREN DE NADIE' : danger ? 'ALGUIEN TE HA VISTO' : 'NO HAY NADIE', 16, 101, '#e1bfbb', 9);
    }
    function bottom(c, s, now, showMap) {
        box(c, 0, 0, W, H, '#081217');
        box(c, 8, 8, 240, 176, '#26383c');
        box(c, 11, 11, 234, 170, '#0d1c21');
        txt(c, 'SIN_NOMBRE.NDS', 19, 28, '#c6d5b5', 12);
        box(c, 19, 35, 216, 1, '#52655e');
        txt(c, `DIA ${s.day}/7    ${s.mode === 'real' ? 'MUNDO REAL' : 'ARCHIVO MALDITO'}`, 19, 49, '#d9ba8f', 9);
        if (s.won) {
            txt(c, `EXPEDIENTE 0${s.day} / CERRADO`, 19, 75, '#cbb8a1', 10);
            txt(c, s.day === 7 ? `FINAL: ${s.endingId.toUpperCase()}` : `ESCENA FINAL ${s.endingStage + 1}/4`, 19, 95, '#afbfae', 10);
            txt(c, 'Las personas no desaparecen.', 19, 120, '#9eafac', 8);
            txt(c, 'Se convierten en partidas.', 19, 133, '#9eafac', 8);
            txt(c, 'E / A: SEGUIR', 19, 165, '#d2b78d', 10);
            return;
        }
        if (showMap && s.mode === 'real') {
            // Mapa esquemático desbloqueado como ayuda opcional (no revela a la entidad).
            const scale = 9, ox = 52, oy = 55;
            for (let y = 0; y < E.realMap(s).length; y++)
                for (let x = 0; x < E.realMap(s)[0].length; x++) {
                    box(c, ox + x * scale, oy + y * scale, scale - 1, scale - 1, E.wall(E.realMap(s), x, y) ? '#2f4449' : '#657a72');
                }
            box(c, ox + s.rx * scale - 2, oy + s.ry * scale - 2, 5, 5, '#e6cd90');
            txt(c, 'MAPA / TU POSICION', 80, 178, '#a3b3a9', 8);
        }
        else {
            if (s.day === 7) {
                txt(c, `CONSOLA ${s.d7Terminal ? '[X]' : '[ ]'}  RETRATO ${s.d7Portrait ? '[X]' : '[ ]'}`, 19, 68, '#b4c7b9', 8);
                txt(c, `VOZ     ${s.d7Voice ? '[X]' : '[ ]'}  NOMBRE  ${s.d7Name ? '[X]' : '[ ]'}`, 19, 83, '#b4c7b9', 8);
                txt(c, `FOTO    ${s.d7Original ? '[X]' : '[ ]'}  ELECCION ${s.d7Choice.toUpperCase()}`, 19, 98, '#b4c7b9', 8);
            }
            else if (s.day === 6) {
                txt(c, `URNA   ${s.d6Label ? '[X]' : '[ ]'}  INDICE ${s.d6Index ? '[X]' : '[ ]'}`, 19, 68, '#b4c7b9', 9);
                txt(c, `HORNO  ${s.d6Furnace ? '[X]' : '[ ]'}  RUEDA  ${s.d6Vent ? '[X]' : '[ ]'}`, 19, 83, '#b4c7b9', 9);
                txt(c, `NEGAT. ${s.d6Negative ? '[X]' : '[ ]'}  NUCLEO [ ]`, 19, 98, '#b4c7b9', 9);
            }
            else if (s.day === 5) {
                txt(c, `PLACA  ${s.d5Sign ? '[X]' : '[ ]'}  LIBRO   ${s.d5Address ? '[X]' : '[ ]'}`, 19, 68, '#b4c7b9', 9);
                txt(c, `SOLAR  ${s.d5Plot ? '[X]' : '[ ]'}  CALLE   ${s.d5Street ? '[X]' : '[ ]'}`, 19, 83, '#b4c7b9', 9);
                txt(c, `CASA   ${s.d5House ? '[X]' : '[ ]'}  PUERTA  [ ]`, 19, 98, '#b4c7b9', 9);
            }
            else if (s.day === 4) {
                txt(c, `FICHA   ${s.d4File ? '[X]' : '[ ]'}  LIBRO   ${s.d4Ledger ? '[X]' : '[ ]'}`, 19, 68, '#b4c7b9', 9);
                txt(c, `PLACAS  ${s.d4Xray ? '[X]' : '[ ]'}  PLANO   ${s.d4Fold ? '[X]' : '[ ]'}`, 19, 83, '#b4c7b9', 9);
                txt(c, `BOBINA  ${s.d4Reel ? '[X]' : '[ ]'}  CAMA 0  [ ]`, 19, 98, '#b4c7b9', 9);
            }
            else if (s.day === 3) {
                txt(c, `BILLETE ${s.d3Ticket ? '[X]' : '[ ]'}  RELOJ   ${s.d3Clock ? '[X]' : '[ ]'}`, 19, 68, '#b4c7b9', 9);
                txt(c, `PANEL   ${s.d3Schedule ? '[X]' : '[ ]'}  SENAL   ${s.d3Signal ? '[X]' : '[ ]'}`, 19, 83, '#b4c7b9', 9);
                txt(c, `CABINA  ${s.d3Booth ? '[X]' : '[ ]'}  ANDEN   [ ]`, 19, 98, '#b4c7b9', 9);
            }
            else if (s.day === 2) {
                txt(c, `REGISTRO  ${s.d2Register ? '[X]' : '[ ]'}  CAMPANA ${s.d2Bell ? '[X]' : '[ ]'}`, 19, 68, '#b4c7b9', 9);
                txt(c, `INTERFONO ${s.d2Frequency ? '[X]' : '[ ]'}  ESPEJO ${s.d2Reflection ? '[X]' : '[ ]'}`, 19, 83, '#b4c7b9', 9);
                txt(c, `CUARTO 207 ${s.d2Door ? '[X]' : '[ ]'}  UMBRAL [ ]`, 19, 98, '#b4c7b9', 9);
            }
            else {
                txt(c, `NOTA   ${s.note ? '[X]' : '[ ]'}     SELLO   ${s.seal ? '[X]' : '[ ]'}`, 19, 68, '#b4c7b9', 9);
                txt(c, `FOTO   ${s.photo ? '[X]' : '[ ]'}     ECO     ${s.echo ? '[X]' : '[ ]'}`, 19, 83, '#b4c7b9', 9);
                txt(c, `CINTA  ${s.tape ? '[X]' : '[ ]'}     LLAVE   ${s.key ? '[X]' : '[ ]'}`, 19, 98, '#b4c7b9', 9);
            }
            box(c, 19, 107, 216, 1, '#35474a');
            let lines = s.journal.length ? s.journal[s.journal.length - 1] : 'Una presencia ha abierto la partida. Los registros están incompletos.';
            txt(c, 'REGISTRO / ULTIMA ENTRADA', 19, 119, '#c1ad91', 8);
            const chunks = wrap(c, lines, 208, 8).slice(0, 3);
            chunks.forEach((t, i) => txt(c, t, 19, 132 + i * 10, '#b2c1bc', 8));
            box(c, 19, 160, 216, 1, '#35474a');
            if (s.mode === 'real') {
                txt(c, `PRESENCIA ${Math.floor(s.threat)}%   MARCAS: ${s.encounter}`, 19, 174, s.threat > 60 ? '#d68d93' : '#a9baad', 9);
            }
            else
                txt(c, `PUERTA: ${(s.day === 7 ? s.d7Original && s.d7Choice !== 'none' : s.day === 6 ? s.d6Negative : s.day === 5 ? s.d5House : s.day === 4 ? s.d4Reel : s.day === 3 ? s.d3Booth : s.day === 2 ? s.d2Door : s.key && s.echo) ? 'ABIERTA' : 'CERRADA'} / MEMORIA: INESTABLE`, 19, 174, '#b9a1a3', 8);
        }
        for (let y = 0; y < H; y += 3)
            box(c, 0, y, W, 1, '#000a0d28');
    }
    function wrap(c, str, maxWidth, size) { c.font = `${size}px monospace`; let parts = str.split(' '), line = '', output = []; for (let w of parts) {
        if (c.measureText(line + ' ' + w).width > maxWidth && line) {
            output.push(line);
            line = w;
        }
        else
            line += (line ? ' ' : '') + w;
    } if (line)
        output.push(line); return output; }
    function opticalAtmosphere(c, s, now, reduceEffects) {
        // Uneven glass and a very subtle peripheral vignette. Never an intense
        // flash: the player must be able to interpret the scene at all times.
        const vignette = c.createRadialGradient(128, 90, 34, 128, 94, 159);
        vignette.addColorStop(0, 'rgba(0,0,0,0)');
        vignette.addColorStop(.68, 'rgba(0,5,7,.07)');
        vignette.addColorStop(1, 'rgba(0,3,8,.44)');
        c.fillStyle = vignette;
        c.fillRect(0, 0, W, H);
        const tick = reduceEffects ? 0 : Math.floor(now / 170);
        for (let i = 0; i < 11; i++) {
            const x = (19 + i * 71 + (i * i * 13)) % 246 + 4;
            const y = (27 + i * 43 + (tick * (i % 3 + 1))) % 174 + 6;
            const a = i % 3 === 0 ? '#c5c4ad35' : '#a2b6ad25';
            box(c, x, y, i % 4 === 0 ? 2 : 1, 1, a);
        }
        if (s.chase && s.threat >= 70) {
            const alpha = Math.min(.19, (s.threat - 70) / 170);
            c.fillStyle = `rgba(73,14,26,${alpha})`;
            c.fillRect(0, 0, 5, H);
            c.fillRect(W - 5, 0, 5, H);
        }
    }
    /** Quiet, diegetic hallucinations: rendered OVER any 3D backend, no engine mutation.
     * In reduced effects mode overlays stay static; no full-screen flashes or shake.
     */
    function presage(c, omen, now, reduced) {
        if (!omen)
            return;
        const left = Math.max(0, Math.min(1, (omen.ends - now) / 2600));
        if (!left)
            return;
        const alpha = Math.min(.47, (omen.intensity || .4) * left);
        const a = (v) => Math.min(1, alpha * v).toFixed(3);
        c.save();
        if (omen.kind === 'reflection') {
            // A second face printed on the glass appears only in peripheral vision.
            box(c, 190, 43, 25, 62, `rgba(7,16,20,${a(1)})`);
            box(c, 196, 42, 13, 18, `rgba(173,187,173,${a(.9)})`);
            box(c, 196, 49, 3, 2, `rgba(8,18,23,${a(1.6)})`);
            box(c, 205, 49, 3, 2, `rgba(8,18,23,${a(1.6)})`);
            box(c, 194, 62, 17, 41, `rgba(14,24,27,${a(1.4)})`);
            line(c, 178, 32, 178, 133, `rgba(196,207,187,${a(.4)})`);
        }
        else if (omen.kind === 'hollow' || omen.kind === 'absence') {
            // Doorway whose geometry is deliberately wrong: a negative, not an enemy.
            box(c, 30, 45, 39, 85, `rgba(0,5,9,${a(1.5)})`);
            box(c, 30, 45, 39, 3, `rgba(166,174,154,${a(.8)})`);
            box(c, 30, 45, 3, 85, `rgba(166,174,154,${a(.6)})`);
            box(c, 67, 45, 3, 85, `rgba(166,174,154,${a(.6)})`);
        }
        else if (omen.kind === 'double') {
            // A trailing set of footsteps projects onto the corridor floor.
            for (let i = 0; i < 4; i++) {
                let x = 107 + i * 11, y = 157 + i * 6;
                box(c, x, y, 5, 2, `rgba(171,159,149,${a(.8)})`);
                box(c, x + 7, y - 3, 4, 2, `rgba(171,159,149,${a(.7)})`);
            }
        }
        else if (omen.kind === 'negative' || omen.kind === 'film') {
            // An ephemeral thin-film inversion, never a stroboscopic change.
            for (let j = 0; j < 7; j++) {
                const y = (17 + j * 23 + omen.seed % 11) % 192;
                box(c, 0, y, W, 1, `rgba(188,193,184,${a(.43)})`);
            }
            box(c, 8, 13, 26, 16, `rgba(13,21,23,${a(.8)})`);
            txt(c, '00', 12, 23, `rgba(191,201,187,${a(.9)})`, 8);
        }
        else if (omen.kind === 'breath') {
            // Thin condensation on the glass, no camera shake.
            c.strokeStyle = `rgba(193,210,196,${a(.33)})`;
            c.lineWidth = 5;
            c.beginPath();
            c.ellipse(199, 86, 19, 38, -.2, 0, Math.PI * 2);
            c.stroke();
        }
        if (!reduced && omen.kind === 'film') {
            const y = 23 + Math.floor((now - omen.started) / 220) % 8 * 16;
            box(c, 0, y, W, 1, `rgba(201,184,173,${a(.35)})`);
        }
        // Very small optional subtitle; objectives remain untouched.
        if (alpha > .07) {
            const w = Math.min(245, 14 + omen.text.length * 4.6);
            box(c, Math.floor((W - w) / 2), 166, w, 15, `rgba(4,12,15,${a(1.3)})`);
            txt(c, omen.text, Math.max(6, 128 - omen.text.length * 2.3), 176, `rgba(215,204,188,${a(1.9)})`, 7);
        }
        c.restore();
    }
    function render(c1, c2, s, now, opts = {}) {
        c1.imageSmoothingEnabled = c2.imageSmoothingEnabled = false;
        c1.clearRect(0, 0, W, H);
        c2.clearRect(0, 0, W, H);
        if (s.won)
            endingFrame(c1, s, now);
        else if (s.mode === 'real') {
            if (opts.webglFrame)
                c1.drawImage(opts.webglFrame, 0, 0, W, H);
            else
                real(c1, s, now);
        }
        else
            drawTiles(c1, s, now);
        if (!s.won) {
            drawDayOneArt(c1, s, now, E.realMap(s), opts.reduceEffects);
            if (s.mode === 'real') {
                opticalAtmosphere(c1, s, now, opts.reduceEffects);
                presage(c1, opts.horror, now, opts.reduceEffects);
            }
            topUI(c1, s);
        }
        bottom(c2, s, now, opts.map);
        if (opts.brightness === 'alto') {
            c1.save();
            c1.globalCompositeOperation = 'screen';
            c1.fillStyle = 'rgba(135,155,142,.16)';
            c1.fillRect(0, 0, W, H);
            c1.restore();
        }
        if (opts.reduceEffects !== true) {
            noise(c1, Math.floor(now * .017), s.threat > 35 ? 65 : 24);
            if (s.chase && s.threat > 65) {
                let n = Math.min(6, (s.threat - 65) / 5);
                for (let i = 0; i < n; i++)
                    box(c1, rand(i, now | 0) * W, rand(i, 31 + now | 0) * H, 25, 1, '#d088914b');
            }
        }
    }
    return { render };
})();

// gfx/RetroWebGL.js









const VERTEX = `#version 300 es
precision highp float;
in vec3 a_position;
in vec3 a_normal;
in vec3 a_color;
uniform vec3 u_eye;
uniform vec2 u_heading;
uniform float u_pitch;
uniform float u_aspect;
uniform float u_tanfov;
uniform float u_light;
uniform float u_threat;
uniform float u_time;
out vec3 v_color;
out vec3 v_world;
out float v_depth;
out float v_shade;
out vec3 v_normal;
void main(){
  vec3 delta=a_position-u_eye;
  vec2 forward=vec2(u_heading.x,-u_heading.y);
  vec2 right=vec2(u_heading.y,u_heading.x);
  float depth=dot(delta.xz,forward);
  float horizontal=dot(delta.xz,right);
  float nearZ=0.075;
  float farZ=28.0;
  // The browser performs the homogeneous perspective divide.
  gl_Position=vec4(horizontal/(u_aspect*u_tanfov),(delta.y-depth*tan(u_pitch))/u_tanfov,
    depth*(farZ+nearZ)/(farZ-nearZ)-(2.0*farZ*nearZ)/(farZ-nearZ),depth);
  float directional=max(0.0,dot(normalize(a_normal),normalize(vec3(0.35,0.9,0.55))));
  float spot=pow(max(0.0,dot(normalize(delta.xz),forward)),4.0);
  float distanceFalloff=1.0/(1.0+max(0.0,depth)*0.17);
  v_shade=(0.21+0.34*directional+0.48*u_light*spot)*distanceFalloff;
  v_depth=max(depth,0.0);
  v_color=a_color;
  v_world=a_position;
  v_normal=a_normal;
}
`;
const FRAGMENT = `#version 300 es
precision highp float;
in vec3 v_color;
in vec3 v_world;
in vec3 v_normal;
in float v_depth;
in float v_shade;
uniform float u_time;
uniform float u_threat;
uniform float u_light;
uniform vec3 u_fog;
uniform vec2 u_resolution;
uniform vec3 u_kibaLamp0;
uniform vec3 u_kibaLamp1;
uniform vec3 u_kibaLamp2;
uniform vec3 u_kibaPower;
out vec4 outColor;
float hash(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,41.123)))*43758.5453);}
float nearLight(vec3 point,vec3 source,float power){
  vec3 delta=point-source;
  float d2=dot(delta,delta);
  return power/(1.0+d2*1.7);
}
void main(){
  // Material: joints, local oxidation, floor microdetail and stable grain.
  float panel=step(.87,fract(v_world.y*1.8));
  float cracks=step(.981,hash(floor(v_world*vec3(4.,2.,4.))));
  float surfaceGrain=(hash(floor(v_world*24.))-.5)*.12;
  // Kiba's material language: half-painted plaster, moisture blooms,
  // baseboard oxidation and fine cracks in world space.
  float painted=step(.46,fract(v_world.y*.49));
  float water=hash(floor(v_world.xzz*vec3(5.,3.,5.)+v_world.y*.65));
  float drip=step(.84,hash(floor(v_world.xz*19.)))*(1.-smoothstep(.15,2.05,v_world.y));
  float tileJoin=step(.973,fract(v_world.x*2.25))+step(.979,fract(v_world.y*2.25));
  float baseboard=1.-smoothstep(.15,.34,v_world.y);
  float age=clamp(water*.19+drip*.25+baseboard*.20,0.,.6);
  float material=1.0-panel*.09-cracks*.18+surfaceGrain-age-tileJoin*.065;
  vec3 albedo=v_color*material;
  float luminous=step(.71,max(v_color.r,max(v_color.g,v_color.b)))*.12;
  float flood=nearLight(v_world,u_kibaLamp0,u_kibaPower.x)
    +nearLight(v_world,u_kibaLamp1,u_kibaPower.y)
    +nearLight(v_world,u_kibaLamp2,u_kibaPower.z);
  float bounce=flood*(.42+.58*max(0.,v_normal.y));
  vec3 rgb=albedo*clamp(v_shade+bounce+luminous,.09,1.23);
  float fog=1.-exp(-max(v_depth-1.6,0.)*.095);
  rgb=mix(rgb,u_fog,clamp(fog,0.,.88));
  // Narrow, readable flashlight core with smooth peripheral falloff.
  vec2 screenUV=gl_FragCoord.xy/u_resolution;
  float radial=length((screenUV-.5)*vec2(1.24,1.03));
  float cone=1.0-smoothstep(.10,.68,radial);
  float flashlight=mix(.68,1.13,cone)*(u_light>.5?1.:.68);
  rgb*=flashlight;
  // Film noise is in screen coordinates, with a very subtle time component.
  float filmGrain=(hash(vec3(floor(gl_FragCoord.xy/2.),floor(u_time/150.)))-.5)*.028;
  rgb+=filmGrain;
  float dread=clamp(u_threat/100.,0.,1.);
  rgb.r+=dread*.012*(1.-cone);
  rgb=floor(clamp(rgb,vec3(0.),vec3(1.))*32.+.5)/32.;
  outColor=vec4(rgb,1.);
}
`;
const PAL = {
    1: { wall: [.35, .42, .39], floor: [.19, .23, .22], ceiling: [.20, .26, .27], fog: [.055, .085, .095], metal: [.52, .48, .38] },
    2: { wall: [.38, .44, .40], floor: [.17, .24, .22], ceiling: [.20, .27, .26], fog: [.075, .085, .082], metal: [.59, .51, .44] },
    3: { wall: [.33, .45, .46], floor: [.19, .26, .27], ceiling: [.17, .23, .26], fog: [.055, .080, .10], metal: [.55, .62, .57] },
    4: { wall: [.47, .57, .52], floor: [.23, .33, .31], ceiling: [.29, .37, .34], fog: [.070, .110, .108], metal: [.62, .70, .61] },
    5: { wall: [.43, .43, .35], floor: [.29, .30, .24], ceiling: [.23, .25, .22], fog: [.075, .082, .070], metal: [.64, .61, .47] },
    6: { wall: [.43, .41, .39], floor: [.24, .25, .24], ceiling: [.26, .26, .24], fog: [.065, .064, .061], metal: [.59, .53, .47] },
    7: { wall: [.35, .48, .53], floor: [.19, .28, .32], ceiling: [.24, .30, .35], fog: [.046, .067, .094], metal: [.68, .60, .65] }
};
class Geometry {
    data = [];
    vertex(p, normal, color) {
        this.data.push(p[0], p[1], p[2], normal[0], normal[1], normal[2], color[0], color[1], color[2]);
    }
    quad(a, b, c, d, normal, color) {
        this.vertex(a, normal, color);
        this.vertex(b, normal, color);
        this.vertex(c, normal, color);
        this.vertex(a, normal, color);
        this.vertex(c, normal, color);
        this.vertex(d, normal, color);
    }
    box(x, y, z, sx, sy, sz, color) {
        const xa = x - sx / 2, xb = x + sx / 2, ya = y - sy / 2, yb = y + sy / 2, za = z - sz / 2, zb = z + sz / 2;
        this.quad([xa, ya, zb], [xb, ya, zb], [xb, yb, zb], [xa, yb, zb], [0, 0, 1], color);
        this.quad([xb, ya, za], [xa, ya, za], [xa, yb, za], [xb, yb, za], [0, 0, -1], color);
        this.quad([xa, ya, za], [xa, ya, zb], [xa, yb, zb], [xa, yb, za], [-1, 0, 0], color);
        this.quad([xb, ya, zb], [xb, ya, za], [xb, yb, za], [xb, yb, zb], [1, 0, 0], color);
        this.quad([xa, yb, zb], [xb, yb, zb], [xb, yb, za], [xa, yb, za], [0, 1, 0], color);
        this.quad([xa, ya, za], [xb, ya, za], [xb, ya, zb], [xa, ya, zb], [0, -1, 0], color);
    }
}
function shader(gl, type, src) {
    const sh = gl.createShader(type);
    if (!sh)
        throw new Error('No se ha podido crear shader');
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS))
        throw new Error('Shader: ' + gl.getShaderInfoLog(sh));
    return sh;
}
function program(gl) {
    const p = gl.createProgram();
    if (!p)
        throw new Error('No se ha podido crear el programa WebGL');
    gl.attachShader(p, shader(gl, gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(p, shader(gl, gl.FRAGMENT_SHADER, FRAGMENT));
    gl.bindAttribLocation(p, 0, 'a_position');
    gl.bindAttribLocation(p, 1, 'a_normal');
    gl.bindAttribLocation(p, 2, 'a_color');
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS))
        throw new Error('Enlace WebGL: ' + gl.getProgramInfoLog(p));
    return p;
}
function itemColor(id, day) {
    if (/xray|mirror|photo|fold|paper|file|ledger|map|clock/i.test(id))
        return [.65, .71, .63];
    if (/tape|reel|intercom|booth|telephone|schedule/i.test(id))
        return [.52, .61, .64];
    if (/curtain|locker|cabinet|room/i.test(id))
        return [.50, .54, .49];
    if (/ticket|bell/i.test(id))
        return [.74, .62, .42];
    return day === 4 ? [.66, .74, .65] : [.63, .55, .51];
}
class RetroWebGL {
    canvas;
    gl;
    shader;
    vao;
    staticMesh = null;
    dynamicBuffer;
    mapKey = '';
    gateOpenedAt = {};
    mapLamps = [];
    rendered = false;
    uniforms;
    lost = false;
    constructor(canvas, gl) {
        this.canvas = canvas;
        this.gl = gl;
        this.shader = program(gl);
        const vao = gl.createVertexArray();
        const dyn = gl.createBuffer();
        if (!vao || !dyn)
            throw new Error('No se pudieron crear los buffers');
        this.vao = vao;
        this.dynamicBuffer = dyn;
        this.uniforms = {};
        for (const n of ['u_eye', 'u_heading', 'u_pitch', 'u_aspect', 'u_tanfov', 'u_light', 'u_threat', 'u_time', 'u_fog', 'u_resolution', 'u_kibaLamp0', 'u_kibaLamp1', 'u_kibaLamp2', 'u_kibaPower']) {
            this.uniforms[n] = gl.getUniformLocation(this.shader, n);
        }
        canvas.addEventListener('webglcontextlost', ev => { ev.preventDefault(); this.lost = true; });
        canvas.addEventListener('webglcontextrestored', () => { this.lost = true; });
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.disable(gl.CULL_FACE);
    }
    static create(width = 256, height = 192) {
        try {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const gl = canvas.getContext('webgl2', { alpha: false, antialias: false, depth: true, preserveDrawingBuffer: true, powerPreference: 'low-power' });
            if (!gl)
                return null;
            return new RetroWebGL(canvas, gl);
        }
        catch (e) {
            console.warn('WebGL2 no disponible; se usará Canvas 2D', e);
            return null;
        }
    }
    /** Probe the actual in-game scene and framebuffer, not a toy shader. */
    checkFrame() {
        if (this.lost || !this.rendered)
            return { ok: false, message: 'No existe un fotograma WebGL2 válido', rgba: [] };
        try {
            const gl = this.gl, rgba = new Uint8Array(4);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.readPixels(Math.floor(this.canvas.width / 2), Math.floor(this.canvas.height / 2), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, rgba);
            const error = gl.getError();
            return { ok: error === gl.NO_ERROR, message: error === gl.NO_ERROR ? 'Framebuffer de la escena leído sin error GL' : 'Error GL ' + error, rgba: Array.from(rgba) };
        }
        catch (e) {
            return { ok: false, message: String(e), rgba: [] };
        }
    }
    status() { return this.lost ? 'webgl-context-lost' : 'webgl2-native'; }
    bindMesh(mesh) {
        const gl = this.gl;
        gl.bindVertexArray(this.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, mesh.buffer);
        for (let i = 0; i < 3; i++) {
            gl.enableVertexAttribArray(i);
            gl.vertexAttribPointer(i, 3, gl.FLOAT, false, 36, i * 12);
        }
    }
    upload(geo, existing) {
        const gl = this.gl;
        const buf = existing ?? gl.createBuffer();
        if (!buf)
            throw new Error('Buffer no disponible');
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geo.data), existing ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW);
        return { buffer: buf, vertices: geo.data.length / 9 };
    }
    createMap(map, day) {
        const g = new Geometry(), pal = PAL[day] ?? PAL[1];
        const solid = (x, z) => map[z]?.[x] === '#';
        const trim = day === 7 ? [.31, .46, .53] : day === 6 ? [.47, .42, .39] : day === 5 ? [.48, .42, .33] : day === 4 ? [.31, .52, .47] : day === 3 ? [.48, .46, .28] : day === 2 ? [.40, .28, .31] : [.33, .37, .34];
        const luminous = day === 7 ? [.62, .77, .82] : day === 6 ? [.72, .58, .49] : day === 5 ? [.67, .61, .44] : day === 4 ? [.60, .79, .67] : day === 3 ? [.72, .68, .47] : [.53, .61, .55];
        const wallPlate = (x, z, normalX, normalZ) => {
            // Each exposed wall gets a physical skirting board and a restrained
            // mid-wall panel, rather than a single flat-colored rectangle.
            const px = x + .5 + normalX * .505, pz = z + .5 + normalZ * .505;
            const sx = normalX !== 0 ? .025 : .94, sz = normalZ !== 0 ? .025 : .94;
            g.box(px, .21, pz, sx, .24, sz, trim);
            if ((x * 3 + z * 7 + day) % 4 === 0) {
                g.box(px, 1.65, pz, sx, .035, sz, luminous);
                g.box(px, .95, pz, sx, .015, sz, [.15, .20, .21]);
            }
            if ((x * 11 + z * 17 + day) % 13 === 0) {
                g.box(px, 1.13, pz, normalX !== 0 ? .035 : .36, .44, normalZ !== 0 ? .035 : .36, [.23, .29, .28]);
            }
        };
        for (let z = 0; z < map.length; z++)
            for (let x = 0; x < map[z].length; x++) {
                const xa = x, xb = x + 1, za = z, zb = z + 1;
                if (!solid(x, z)) {
                    g.quad([xa, .015, za], [xa, .015, zb], [xb, .015, zb], [xb, .015, za], [0, 1, 0], pal.floor);
                    g.quad([xa, 2.35, zb], [xa, 2.35, za], [xb, 2.35, za], [xb, 2.35, zb], [0, -1, 0], pal.ceiling);
                    // Corridor join lines, rails and ceiling fixtures, every fourth tile.
                    if ((x + z) % 4 === 1) {
                        g.box(x + .5, 2.29, z + .5, .40, .055, .20, luminous);
                        g.box(x + .5, 2.25, z + .5, .28, .010, .13, [.82, .85, .69]);
                    }
                    if ((x * 17 + z * 13) % 13 === 0) {
                        g.box(x + .5, .021, z + .5, .66, .01, .04, [.29, .37, .36]);
                    }
                    if (day === 7 && (x + z) % 3 === 0)
                        g.box(x + .5, .022, z + .5, .36, .01, .12, [.35, .48, .54]);
                    if (day === 6 && (x + z) % 3 === 0)
                        g.box(x + .5, .032, z + .5, .40, .012, .24, [.42, .40, .38]);
                    if (day === 5 && (x + z) % 4 === 0)
                        g.box(x + .5, .027, z + .5, .60, .012, .04, [.42, .39, .28]);
                    if (day === 3 && z % 4 === 2)
                        g.box(x + .5, .026, z + .48, .93, .01, .05, [.66, .53, .28]);
                    if (day === 4 && (x + z) % 3 === 0)
                        g.box(x + .5, .023, z + .5, .88, .008, .026, [.37, .52, .47]);
                    if (day === 2 && (x + z) % 9 === 2)
                        g.box(x + .19, .026, z + .20, .15, .012, .10, [.26, .20, .23]);
                    if (day === 1) {
                        // Modelado ambiental real del edificio Kiba: conductos, luminarias,
                        // charcos, cables y archivadores de pared sin alterar colisiones.
                        if ((x * 11 + z * 5) % 7 === 0) {
                            g.box(x + .07, 1.46, z + .5, .10, 1.54, .09, [.26, .39, .37]);
                            g.box(x + .07, 1.94, z + .5, .13, .035, .13, [.63, .66, .57]);
                        }
                        if ((x + z) % 6 === 0) {
                            g.box(x + .5, .024, z + .5, .37, .013, .46, [.12, .23, .26]);
                            g.box(x + .51, .028, z + .43, .24, .006, .17, [.24, .35, .34]);
                        }
                        if ((x * 3 + z) % 8 === 2) {
                            g.box(x + .52, 2.24, z + .51, .11, .12, .42, [.43, .47, .39]);
                            g.box(x + .52, 2.16, z + .51, .09, .009, .38, [.83, .86, .69]);
                        }
                        if (x < 7 && z > 7 && (x + z) % 5 === 1) {
                            g.box(x + .08, .76, z + .51, .14, 1.43, .48, [.22, .30, .29]);
                            for (let i = 0; i < 3; i++)
                                g.box(x + .16, .47 + i * .32, z + .51, .018, .015, .34, [.53, .55, .50]);
                        }
                    }
                }
                else {
                    // Only visible faces of wall blocks are generated.
                    if (!solid(x - 1, z)) {
                        g.quad([xa, 0, zb], [xa, 0, za], [xa, 2.35, za], [xa, 2.35, zb], [-1, 0, 0], pal.wall);
                        wallPlate(x, z, -1, 0);
                    }
                    if (!solid(x + 1, z)) {
                        g.quad([xb, 0, za], [xb, 0, zb], [xb, 2.35, zb], [xb, 2.35, za], [1, 0, 0], pal.wall);
                        wallPlate(x, z, 1, 0);
                    }
                    if (!solid(x, z - 1)) {
                        g.quad([xa, 0, za], [xb, 0, za], [xb, 2.35, za], [xa, 2.35, za], [0, 0, -1], pal.wall);
                        wallPlate(x, z, 0, -1);
                    }
                    if (!solid(x, z + 1)) {
                        g.quad([xb, 0, zb], [xa, 0, zb], [xa, 2.35, zb], [xb, 2.35, zb], [0, 0, 1], pal.wall);
                        wallPlate(x, z, 0, 1);
                    }
                }
            }
        if (day === 1) {
            for (const prop of buildKibaVisuals(map)) {
                g.box(prop.x, prop.y, prop.z, prop.width, prop.height, prop.depth, prop.color);
            }
            for (const prop of buildKibaSurfaces(map)) {
                g.box(prop.x, prop.y, prop.z, prop.width, prop.height, prop.depth, prop.color);
            }
            for (const prop of [...buildKibaRooms(map).filter(v => !legacyRoomFixtureShadowed(v.id)), ...buildSignatureRoom(map), ...buildKibaSetpieces(map), ...buildKibaAtrium(map)]) {
                g.box(prop.x, prop.y, prop.z, prop.width, prop.height, prop.depth, prop.color);
            }
        }
        return this.upload(g);
    }
    createObjects(s, items, now, map) {
        const g = new Geometry(), pal = PAL[s.day] ?? PAL[1];
        for (const item of items) {
            const c = itemColor(item.id, s.day);
            const x = item.x, z = item.y;
            if (/curtain|locker|cabinet|room207|booth|schedule|mirror|xray/i.test(item.id)) {
                g.box(x, 1.03, z, .58, 1.82, .23, [.16, .22, .23]);
                g.box(x, 1.10, z - .132, .46, 1.48, .018, c);
                if (/mirror|xray/i.test(item.id)) {
                    g.box(x, 1.13, z - .148, .37, 1.25, .014, [.45, .60, .58]);
                    g.box(x, .77, z - .169, .28, .035, .016, [.71, .74, .60]);
                }
                else if (/locker|cabinet|room207/i.test(item.id)) {
                    g.box(x + .18, 1.05, z - .152, .026, .12, .026, pal.metal);
                    for (let k = 0; k < 3; k++)
                        g.box(x - .08, 1.37 + k * .09, z - .155, .19, .014, .014, [.20, .27, .28]);
                }
                else if (/curtain/i.test(item.id)) {
                    for (let k = -2; k <= 2; k++)
                        g.box(x + k * .09, 1.04, z - .15, .031, 1.38, .028, [.31, .49, .46]);
                }
            }
            else if (/reel|tape|phone|telephone|intercom|ticket|bell/i.test(item.id)) {
                g.box(x, .29, z, .69, .58, .48, [.22, .26, .27]);
                g.box(x, .60, z, .48, .10, .38, c);
                const pulse = .025 * Math.sin(now * .002 + x);
                g.box(x, .73 + pulse, z, .26, .12, .27, [.75, .61, .41]);
                g.box(x, .88, z, .045, .22, .04, [.13, .17, .19]);
            }
            else {
                g.box(x, .35, z, .55, .70, .43, [.25, .31, .30]);
                g.box(x, .74, z, .43, .11, .32, c);
                g.box(x, .87 + Math.sin(now * .0012 + x) * .025, z, .13, .08, .13, [.71, .45, .40]);
            }
        }
        if (s.day === 1) {
            const elapsed = {};
            for (const g of kibaDoorStates(map)) {
                if (!g.open)
                    delete this.gateOpenedAt[g.gate];
                else {
                    if (this.gateOpenedAt[g.gate] === undefined)
                        this.gateOpenedAt[g.gate] = now;
                    elapsed[g.gate] = Math.max(0, now - this.gateOpenedAt[g.gate]);
                }
            }
            for (const part of buildKibaDoorPanels(map, elapsed))
                g.box(part.x, part.y, part.z, part.width, part.height, part.depth, part.color);
        }
        if (s.chase && !s.won) {
            // The same animated character geometry is consumed by WebGL2 and Three.js.
            for (const part of buildCopyistModel(now, s.threat)) {
                g.box(s.entityX + part.x, part.y, s.entityY + part.z, part.width, part.height, part.depth, part.color);
            }
        }
        return this.upload(g, this.dynamicBuffer);
    }
    render(s, now, map, items) {
        if (this.lost)
            return null;
        const gl = this.gl;
        try {
            const key = s.day + '|' + map.join('|');
            if (this.mapKey !== key) {
                if (this.staticMesh)
                    gl.deleteBuffer(this.staticMesh.buffer);
                this.staticMesh = this.createMap(map, s.day);
                this.mapLamps = activeKibaLamps(s.day, map);
                this.mapKey = key;
            }
            const pal = PAL[s.day] ?? PAL[1];
            gl.viewport(0, 0, this.canvas.width, this.canvas.height);
            gl.clearColor(pal.fog[0], pal.fog[1], pal.fog[2], 1);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.useProgram(this.shader);
            const angle = Number.isFinite(s.cameraYaw) ? s.cameraYaw : s.dir * Math.PI / 2;
            gl.uniform3f(this.uniforms.u_eye, s.rx, s.cameraHeight ?? 1.35, s.ry);
            gl.uniform1f(this.uniforms.u_pitch, s.cameraPitch ?? 0);
            gl.uniform2f(this.uniforms.u_heading, Math.sin(angle), Math.cos(angle));
            gl.uniform1f(this.uniforms.u_aspect, this.canvas.width / this.canvas.height);
            gl.uniform1f(this.uniforms.u_tanfov, Math.tan(69 * Math.PI / 360));
            gl.uniform1f(this.uniforms.u_light, s.light ? 1 : .19);
            gl.uniform1f(this.uniforms.u_threat, s.threat);
            gl.uniform1f(this.uniforms.u_time, now);
            gl.uniform2f(this.uniforms.u_resolution, this.canvas.width, this.canvas.height);
            gl.uniform3f(this.uniforms.u_fog, ...pal.fog);
            const chosen = nearestKibaLamps(s.rx, s.ry, this.mapLamps);
            const gains = [0, 0, 0];
            for (let i = 0; i < 3; i++) {
                const lamp = chosen[i];
                gl.uniform3f(this.uniforms['u_kibaLamp' + i], lamp?.x ?? -99, lamp?.y ?? -99, lamp?.z ?? -99);
                gains[i] = lamp ? kibaLampIntensity(lamp, now, s.threat) * .72 : 0;
            }
            gl.uniform3f(this.uniforms.u_kibaPower, gains[0], gains[1], gains[2]);
            if (this.staticMesh) {
                this.bindMesh(this.staticMesh);
                gl.drawArrays(gl.TRIANGLES, 0, this.staticMesh.vertices);
            }
            const dynamic = this.createObjects(s, items, now, map);
            this.bindMesh(dynamic);
            gl.drawArrays(gl.TRIANGLES, 0, dynamic.vertices);
            gl.bindVertexArray(null);
            this.rendered = true;
            return this.canvas;
        }
        catch (e) {
            console.warn('Se activa el renderer Canvas 2D de emergencia', e);
            return null;
        }
    }
}

// horror/HorrorDirector.js
const LINES = {
    1: [['double', 'LOS PASOS NO SON TUYOS'], ['reflection', 'LA FIGURA SIGUE EN EL CRISTAL'], ['hollow', 'ALGUIEN HA APAGADO EL PASILLO']],
    2: [['breath', 'RESPIRA AL OTRO LADO'], ['double', 'DOS PISADAS. UNA SOLA PERSONA'], ['hollow', 'LA HABITACIÓN SE HA DESPLAZADO']],
    3: [['absence', 'EL ANDÉN NO FIGURA EN EL PLANO'], ['film', 'PRÓXIMA PARADA: NINGUNA'], ['double', 'LOS PASOS VIENEN DE LAS VÍAS']],
    4: [['negative', 'LA SOMBRA TIENE RADIOGRAFÍA'], ['breath', 'UN PACIENTE ESTÁ DESPIERTO'], ['reflection', 'EL CRISTAL GUARDA TU CARA']],
    5: [['absence', 'ALGUIEN VIVE DONDE NO HAY CASA'], ['hollow', 'UNA VENTANA HA CAMBIADO DE SITIO'], ['double', 'PISADAS SOBRE UN SUELO VACÍO']],
    6: [['film', 'LA CINTA SE ESTÁ REBOBINANDO'], ['negative', 'UNA SILUETA ENTRE LAS CENIZAS'], ['breath', 'LA URNA TIENE PULSO']],
    7: [['reflection', 'TU REFLEJO TARDA EN GIRARSE'], ['negative', 'LA COPIA ES MÁS ANTIGUA'], ['hollow', 'EL ARCHIVO ESTÁ RESPIRANDO']]
};
function hash(...values) {
    let v = 2166136261;
    for (const n of values) {
        v = Math.imul(v ^ (n | 0), 16777619) >>> 0;
    }
    return v >>> 0;
}
class HorrorDirector {
    enabled = true;
    active = null;
    lastStep = -100;
    lastDay = 0;
    lastKind = null;
    setEnabled(value) { this.enabled = value; if (!value)
        this.active = null; }
    getEnabled() { return this.enabled; }
    clear() { this.active = null; this.lastStep = -100; this.lastDay = 0; this.lastKind = null; }
    /** Receives the previous and next snapshots after player input, never during the render loop. */
    observe(before, after, now) {
        if (before.day !== after.day) {
            this.active = null;
            this.lastStep = -100;
            this.lastDay = after.day;
            this.lastKind = null;
        }
        if (!this.enabled || after.mode !== 'real' || after.won || after.hidden || after.steps === before.steps) {
            if (after.mode !== 'real' || after.won)
                this.active = null;
            return null;
        }
        if (after.chase && after.threat >= 52)
            return null; // the actual pursuer takes precedence
        if (after.steps < 7 || after.steps - this.lastStep < 8)
            return null;
        const a = hash(after.day, after.steps, Math.floor(after.rx), Math.floor(after.ry), 0);
        if (a % 5 === 0)
            return null; // deliberate irregularity and long quiet intervals
        const choices = LINES[after.day] ?? LINES[1];
        let idx = a % choices.length;
        if (choices[idx][0] === this.lastKind)
            idx = (idx + 1) % choices.length;
        const [kind, text] = choices[idx];
        this.lastKind = kind;
        this.lastStep = after.steps;
        this.lastDay = after.day;
        const intensity = Math.min(.85, .38 + (after.chase ? .14 : 0) + after.threat / 350);
        this.active = { kind, day: after.day, text, seed: a, intensity, started: now, ends: now + 2600 };
        return this.active;
    }
    current(now) {
        if (!this.enabled || !this.active)
            return null;
        if (now >= this.active.ends) {
            this.active = null;
            return null;
        }
        return this.active;
    }
}

// bootstrap.js
// @ts-nocheck









/* NAMELESS 404 — UI, controles, guardados y audio original generado por osciladores. */
function bootGame(GraphicsBackend) {
    'use strict';
    const $ = x => document.getElementById(x), top = $('top').getContext('2d'), bottom = $('bottom').getContext('2d');
    const KEY = 'nameless404_save_v09', AUTO_KEY = 'nameless404_autosave_v014', MANUAL_TIME_KEY = 'nameless404_manual_saved_at_v014', PREVIOUS_KEYS = ['nameless404_save_v08', 'nameless404_save_v07', 'nameless404_save_v06', 'nameless404_save_v05', 'nameless404_save_v04'];
    const game = E.newGame();
    const director = new HorrorDirector();
    const premiumAudio = new DayOneSoundscape();
    let brightness = 'normal', map = false, audio = false, ctx = null, osc = null, hum = null, master = null, hiss = null, filter = null, noise = null, reduceEffects = true, lastMsg = '';
    const inputs = new ResponsiveInput();
    const camera = new CinematicCamera();
    let lastCameraView = null;
    const prefersLessMotion = !!window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    let pointerHandled = new WeakMap();
    let t0 = performance.now(), lastFrame = 0, counterStart = performance.now(), frames = 0, measuredFps = 0, lastHeartbeat = 0;
    let autoTimer = null, lastAutoSignature = '', immersive = false, gamepadActive = false, padPollAt = 0;
    const gfx = GraphicsBackend.create(384, 256);
    const gfxTag = $('graphicsBackend');
    if (gfxTag)
        gfxTag.textContent = gfx ? (gfx.status().includes('three') ? 'THREE.JS / WEBGL2' : 'WEBGL2 NATIVO') : 'CANVAS 2D (COMPATIBILIDAD)';
    function notify(message) { lastMsg = message; $('message').textContent = message; }
    function tone(f = 130, d = .12, type = 'triangle', vol = .035, pan = 0) {
        if (!audio)
            return;
        try {
            ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
            ctx.resume();
            const o = ctx.createOscillator(), g = ctx.createGain();
            o.type = type;
            o.frequency.value = f;
            g.gain.setValueAtTime(vol, ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + d);
            if (typeof ctx.createStereoPanner === 'function') {
                const stereo = ctx.createStereoPanner();
                stereo.pan.value = Math.max(-.8, Math.min(.8, pan));
                o.connect(g).connect(stereo).connect(ctx.destination);
            }
            else
                o.connect(g).connect(ctx.destination);
            o.start();
            o.stop(ctx.currentTime + d);
        }
        catch (err) {
            console.warn('Web Audio no disponible', err);
        }
    }
    function sound(type) {
        const sounds = { finalChoice: [180, .8, 'sine'], furnace: [49, 1.2, 'sawtooth'], room: [95, .24, 'sine'], photo: [460, .5, 'triangle'], bell: [327, .66, 'sine'], intercom: [212, .7, 'triangle'], well: [61, .76, 'sawtooth'], stepReal: [76, .07, 'triangle'], stepQuiet: [51, .035, 'sine'], stepMetal: [188, .085, 'square'], decoy: [430, .31, 'triangle'], sneak: [120, .045, 'sine'], stepRpg: [214, .06, 'square'], turn: [106, .025, 'triangle'], bump: [55, .08, 'triangle'], clue: [380, .27, 'sine'], swap: [205, .35, 'triangle'], tape: [73, .6, 'sawtooth'], hide: [90, .15, 'sine'], caught: [40, .9, 'sawtooth'], ending: [490, .6, 'sine'], phone: [670, .15, 'sine'], mirror: [85, .5, 'sawtooth'], light: [235, .09, 'triangle'], ticket: [590, .28, 'triangle'], clock: [155, .65, 'triangle'], train: [55, 1.2, 'sawtooth'], switch: [305, .48, 'square'], paper: [390, .32, 'triangle'], glass: [510, .4, 'sine'], breath: [75, .5, 'sine'], xray: [87, .7, 'sawtooth'], fold: [250, .56, 'square'], heartbeat: [53, 1.0, 'triangle'], hospital: [140, .65, 'sine'], gate: [127, .76, 'sawtooth'], vent: [330, .42, 'square'], finaleStart: [82, 1.35, 'triangle'], finaleCrossing: [137, .9, 'sine'], finaleEscape: [415, 1.2, 'sine'], finaleFail: [67, .5, 'sine'] };
        if (sounds[type]) {
            const st = game.state();
            const angle = st.dir * Math.PI / 2;
            const dx = st.entityX - st.rx, dz = st.entityY - st.ry;
            const decoyPosition = type === 'decoy' ? st.flags?.kibaDecoy : null;
            const pan = decoyPosition ? Math.max(-.8, Math.min(.8, ((decoyPosition.x - st.rx) * Math.cos(angle) + (decoyPosition.y - st.ry) * Math.sin(angle)) / Math.max(1, Math.hypot(decoyPosition.x - st.rx, decoyPosition.y - st.ry)))) : st.chase && (type === 'caught' || type === 'stepReal' || type === 'heartbeat')
                ? (dx * Math.cos(angle) + dz * Math.sin(angle)) / Math.max(1, Math.hypot(dx, dz)) : 0;
            if (premiumAudio.cue(type, st))
                return;
            tone(...sounds[type], type === 'heartbeat' ? .020 : .035, pan);
        }
    }
    function playOmen(cue) {
        // Never a loud stinger. Omen voices are short, low-volume procedural sounds.
        const types = { reflection: [77, .52, 'sine', .013], hollow: [43, .76, 'triangle', .012], double: [97, .23, 'triangle', .011], film: [171, .33, 'square', .006], negative: [64, .61, 'sine', .014], breath: [88, .83, 'sine', .008], absence: [50, .58, 'triangle', .012] };
        const [freq, duration, wave, gain] = types[cue.kind] || types.hollow;
        tone(freq, duration, wave, gain, (cue.seed % 200) / 100 - 1);
    }
    function flush() {
        for (const event of game.events()) {
            if (event.kind === 'sound') {
                sound(event.message);
                continue;
            }
            if (event.kind === 'journal') {
                notify(event.message);
                continue;
            }
            if (event.kind === 'scene') {
                notify(event.title + ' — ' + event.message);
                tone(63, .25, 'sawtooth', .015);
                continue;
            }
            if (event.kind === 'message')
                notify(event.message);
        }
        const s = game.state();
        $('status').textContent = s.day === 7
            ? `DÍA 7 · ${s.mode === 'real' ? 'REALIDAD' : 'RPG'} · TERMINAL ${s.d7Terminal ? '✓' : '–'} · RETRATO ${s.d7Portrait ? '✓' : '–'} · VOZ ${s.d7Voice ? '✓' : '–'} · NOMBRE ${s.d7Name ? '✓' : '–'} · FOTO ${s.d7Original ? '✓' : '–'} · DECISIÓN ${s.d7Choice.toUpperCase()}`
            : s.day === 6
                ? `DÍA 6 · ${s.mode === 'real' ? 'REALIDAD' : 'RPG'} · URNA ${s.d6Label ? '✓' : '–'} · ÍNDICE ${s.d6Index ? '✓' : '–'} · HORNO ${s.d6Furnace ? '✓' : '–'} · RUEDA ${s.d6Vent ? '✓' : '–'} · NEGATIVO ${s.d6Negative ? '✓' : '–'}`
                : s.day === 5
                    ? `DÍA 5 · ${s.mode === 'real' ? 'REALIDAD' : 'RPG'} · PLACA ${s.d5Sign ? '✓' : '–'} · LIBRO ${s.d5Address ? '✓' : '–'} · SOLAR ${s.d5Plot ? '✓' : '–'} · CALLE ${s.d5Street ? '✓' : '–'} · CASA ${s.d5House ? '✓' : '–'}`
                    : s.day === 4
                        ? `DÍA 4 · ${s.mode === 'real' ? 'REALIDAD' : 'RPG'} · FICHA ${s.d4File ? '✓' : '–'} · LIBRO ${s.d4Ledger ? '✓' : '–'} · PLACA ${s.d4Xray ? '✓' : '–'} · PLANO ${s.d4Fold ? '✓' : '–'} · BOBINA ${s.d4Reel ? '✓' : '–'}`
                        : s.day === 3
                            ? `DÍA 3 · ${s.mode === 'real' ? 'REALIDAD' : 'RPG'} · BILLETE ${s.d3Ticket ? '✓' : '–'} · RELOJ ${s.d3Clock ? '✓' : '–'} · PANEL ${s.d3Schedule ? '✓' : '–'} · SEÑAL ${s.d3Signal ? '✓' : '–'} · CABINA ${s.d3Booth ? '✓' : '–'}`
                            : s.day === 2
                                ? `DÍA 2 · ${s.mode === 'real' ? 'REALIDAD' : 'RPG'} · REGISTRO ${s.d2Register ? '✓' : '–'} · CAMPANA ${s.d2Bell ? '✓' : '–'} · INTERFONO ${s.d2Frequency ? '✓' : '–'} · ESPEJO ${s.d2Reflection ? '✓' : '–'} · 207 ${s.d2Door ? '✓' : '–'}`
                                : `DÍA 1 · ${s.mode === 'real' ? 'REALIDAD' : 'RPG'} · NOTA ${s.note ? '✓' : '–'} · SELLO ${s.seal ? '✓' : '–'} · FOTO ${s.photo ? '✓' : '–'} · NOMBRE ${s.echo ? '✓' : '–'} · CINTA ${s.tape ? '✓' : '–'} · LLAVE ${s.key ? '✓' : '–'}`;
        const ai = s.day === 1 && s.chase && s.mode === 'real' ? s.flags.copyistMemory?.phase : null;
        $('aiStatus').textContent = ai === 'hunt' ? 'LA COPISTA · TE HA VISTO' : ai === 'investigate' ? 'LA COPISTA · INVESTIGA UN RUIDO' : ai === 'search' ? 'LA COPISTA · BUSCA TU ÚLTIMO RASTRO' : s.day === 1 ? 'EDIFICIO KIBA · LA PRESENCIA ESCUCHA' : 'ARCHIVO · LA PRESENCIA PERMANECE';
        $('objective').textContent = E.objective(s);
        const evidence = Array.isArray(s.flags?.kibaEvidence) ? s.flags.kibaEvidence : [];
        if (s.day === 1) {
            $('aiStatus').textContent += ' · ARCHIVOS ' + evidence.length + '/4' + ' · ATAJOS ' + (Number(!!s.flags.kibaNorthOpen) + Number(!!s.flags.kibaArchiveOpen)) + '/2';
            const sneak = $('sneak'), decoy = $('decoy'), remaining = 2 - (s.flags.kibaDecoysUsed || 0);
            sneak.textContent = 'C · Sigilo ' + (s.crouched ? 'ACTIVO' : 'INACTIVO');
            sneak.setAttribute('aria-pressed', String(!!s.crouched));
            decoy.textContent = 'V · Tuercas ' + remaining + '/2';
            sneak.disabled = s.mode !== 'real' || s.won;
            decoy.disabled = s.mode !== 'real' || s.won || !s.tape || !s.chase || remaining <= 0;
            $('aiStatus').textContent += ' · ' + (s.flags.kibaFinaleStage === 1 ? 'HUIDA · ARCHIVOS' : s.flags.kibaFinaleStage === 2 ? 'HUIDA · VESTÍBULO' : s.flags.kibaFinaleStage === 3 ? 'HUIDA COMPLETADA' : 'RUTAS ABIERTAS') + ' · ' + (s.crouched ? 'SIGILO' : 'PASO NORMAL') +
                (s.chase ? ' · SUELO ' + (s.room === 'SOTANO TECNICO' ? 'RESONANTE' : 'VARIABLE') : '');
        }
        else {
            $('sneak').disabled = true;
            $('decoy').disabled = true;
        }
        $('light').textContent = s.light ? 'L · Linterna ON' : 'L · Linterna OFF';
        const entries = s.journal;
        $('journal').replaceChildren(...(entries.length ? entries : ['Todavía no has encontrado ninguna pista.']).map(t => { const li = document.createElement('li'); li.textContent = t; return li; }));
    }
    function autoWrite(force = false) {
        try {
            const state = game.state();
            const signature = [state.day, state.mode, state.rx, state.ry, state.px, state.py, state.steps, state.endingStage, state.endingId, state.journal.length, state.d7Choice, state.crouched, state.flags.kibaDecoysUsed, state.flags.kibaDecoyStep, state.flags.kibaNorthOpen, state.flags.kibaArchiveOpen, state.flags.kibaVentUsed, state.flags.kibaHideSpot, state.flags.kibaHideAlert, state.flags.kibaFinaleStage, state.flags.kibaFinaleFailures, state.flags.kibaFinaleDone, state.hidden, state.encounter].join('|');
            if (force || signature !== lastAutoSignature) {
                localStorage.setItem(AUTO_KEY, JSON.stringify({ savedAt: Date.now(), state }));
                lastAutoSignature = signature;
                $('autoStatus').textContent = 'AUTOGUARDADO · Día ' + state.day + ' · Guardado';
            }
        }
        catch (e) {
            $('autoStatus').textContent = 'AUTOGUARDADO · No disponible';
        }
    }
    function requestAuto() {
        if (autoTimer !== null)
            clearTimeout(autoTimer);
        $('autoStatus').textContent = 'AUTOGUARDADO · Pendiente';
        autoTimer = setTimeout(() => { autoTimer = null; autoWrite(); }, 550);
    }
    function recoverAuto() {
        try {
            const item = JSON.parse(localStorage.getItem(AUTO_KEY) || 'null');
            if (!item || typeof item.savedAt !== 'number' || !item.state || !game.load(item.state)) {
                notify('No hay un autoguardado válido. El progreso actual no ha cambiado.');
                return false;
            }
            lastAutoSignature = '';
            director.clear();
            flush();
            render();
            notify('Autoguardado restaurado (Día ' + game.state().day + ').');
            return true;
        }
        catch (e) {
            notify('El autoguardado no se puede leer. La partida actual permanece intacta.');
            return false;
        }
    }
    function act(fn) {
        const before = { ...game.state() };
        fn();
        const cue = director.observe(before, game.state(), performance.now());
        if (cue) {
            $('omenStatus').textContent = 'PRESAGIO · ' + cue.text;
            if (audio)
                playOmen(cue);
        }
        else if (game.state().mode !== 'real' || game.state().won) {
            $('omenStatus').textContent = 'PRESAGIO · EN ESPERA';
        }
        flush();
        render();
        requestAuto();
    }
    function render(t = performance.now()) {
        const state = game.state();
        const cameraView = camera.sample(state, t, prefersLessMotion);
        lastCameraView = cameraView;
        const visual = state.mode === 'real' && !state.won ? { ...state, ...cameraView } : state;
        // El mundo real es una escena continua entre dos pantallas verticales (modo libro).
        // El RPG maldito vuelve a la orientación horizontal y se presenta aparte.
        const isBook = state.mode === 'real' && !state.won;
        const device = document.querySelector('.device');
        device?.classList.toggle('book-mode', isBook);
        device?.classList.toggle('rpg-mode', !isBook);
        const width = isBook ? 192 : 256, height = isBook ? 256 : 192;
        if (top.canvas.width !== width || top.canvas.height !== height) {
            top.canvas.width = width;
            top.canvas.height = height;
        }
        if (bottom.canvas.width !== width || bottom.canvas.height !== height) {
            bottom.canvas.width = width;
            bottom.canvas.height = height;
        }
        const webglFrame = gfx && isBook ? gfx.render(visual, t, E.realMap(state), E.realItems(state)) : null;
        if (isBook) {
            BookMode.render(top, bottom, visual, t, webglFrame);
        }
        else {
            R.render(top, bottom, state, t, { map, reduceEffects, brightness, horror: director.current(t) });
            if (state.mode === 'rpg' && !state.won)
                RetroRpg.render(top, state, t);
        }
        if (gfxTag && gfxTag.textContent !== 'CANVAS 2D (COMPATIBILIDAD)' && !webglFrame && isBook)
            gfxTag.textContent = 'CANVAS 2D (RESPALDO 3D)';
    }
    function doKey(key) { act(() => game.move(key)); } // no descartar pulsaciones por reloj global
    const ARROWS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);
    const DIRECTION_KEYS = { w: 'ArrowUp', a: 'ArrowLeft', s: 'ArrowDown', d: 'ArrowRight' };
    const CONTROL_KEYS = { e: 'interact', x: 'swap', l: 'light', c: 'sneak', v: 'decoy', m: 'map' };
    function isInputBlocked(ev) {
        return !!document.querySelector('dialog[open]') || ev?.target instanceof HTMLInputElement || ev?.target instanceof HTMLTextAreaElement;
    }
    function dispatchInput(action) {
        if (ARROWS.has(action)) {
            doKey(action);
            return;
        }
        if (action === 'interact')
            act(() => game.interact());
        else if (action === 'swap')
            act(() => game.swap());
        else if (action === 'light')
            act(() => game.toggleLight());
        else if (action === 'sneak')
            act(() => game.toggleCrouch());
        else if (action === 'decoy')
            act(() => game.throwDecoy());
        else if (action === 'map') {
            map = !map;
            $('map').textContent = map ? 'M · Ocultar mapa' : 'M · Mapa';
            render();
        }
    }
    function keyAction(key) {
        if (key === 'Enter' || key === ' ')
            return 'interact';
        if (ARROWS.has(key))
            return key;
        const normalized = key.toLowerCase();
        return DIRECTION_KEYS[normalized] || CONTROL_KEYS[normalized] || null;
    }
    document.addEventListener('keydown', ev => {
        if (isInputBlocked(ev))
            return;
        if (ev.target instanceof HTMLButtonElement && ['Enter', ' '].includes(ev.key))
            return;
        const action = keyAction(ev.key);
        if (action) {
            ev.preventDefault();
            const first = inputs.press('kbd:' + ev.code, action, performance.now());
            if (first)
                dispatchInput(first);
        }
        else if (ev.key.toLowerCase() === 'g' && !ev.repeat) {
            save();
        }
    });
    document.addEventListener('keyup', ev => inputs.release('kbd:' + ev.code));
    window.addEventListener('blur', () => inputs.clear());
    function bindInstantButton(btn, action, repeat) {
        // pointerdown = respuesta inmediata (ratón y táctil), sin esperar al clic de liberación.
        // El click posterior no repite una acción ya enviada; click de teclado sí funciona.
        btn.addEventListener('pointerdown', ev => {
            if (ev.button !== 0 || btn.disabled || isInputBlocked(ev))
                return;
            pointerHandled.set(btn, true);
            if (repeat) {
                const source = 'pointer:' + (btn.id || btn.dataset.dir);
                const first = inputs.press(source, action, performance.now());
                if (first)
                    dispatchInput(first);
                try {
                    btn.setPointerCapture(ev.pointerId);
                }
                catch { }
            }
            else
                dispatchInput(action);
        });
        if (repeat) {
            const end = () => inputs.release('pointer:' + (btn.id || btn.dataset.dir));
            btn.addEventListener('pointerup', end);
            btn.addEventListener('pointercancel', () => { end(); pointerHandled.delete(btn); });
            btn.addEventListener('lostpointercapture', end);
        }
        btn.addEventListener('click', ev => {
            if (pointerHandled.get(btn)) {
                pointerHandled.delete(btn);
                return;
            }
            if (!btn.disabled && !isInputBlocked(ev))
                dispatchInput(action);
        });
    }
    document.querySelectorAll('[data-dir]').forEach(btn => bindInstantButton(btn, btn.dataset.dir, true));
    for (const [id, action] of [['interact', 'interact'], ['swap', 'swap'], ['light', 'light'], ['sneak', 'sneak'], ['decoy', 'decoy'], ['map', 'map']]) {
        bindInstantButton($(id), action, false);
    }
    $('cameraMode').addEventListener('click', () => { camera.setEnabled(!camera.isEnabled); $('cameraMode').textContent = 'Cámara: ' + (camera.isEnabled ? 'fluida' : 'clásica'); $('cameraMode').setAttribute('aria-pressed', String(camera.isEnabled)); render(); });
    for (const [id, delta] of [['lookLeft', -.21], ['lookRight', .21]])
        $('' + id).addEventListener('click', () => { if (game.state().mode === 'real' && !game.state().won) {
            camera.look(delta, 0);
            render();
        } });
    $('lookCenter').addEventListener('click', () => { camera.center(); render(); });
    // Arrastrar dentro de las pantallas modifica SOLO el ángulo visual.
    // Nunca mueve la partida ni captura los botones de la interfaz.
    let drag = null;
    for (const screen of [top.canvas, bottom.canvas]) {
        screen.style.touchAction = 'none';
        screen.addEventListener('pointerdown', ev => { if (ev.button !== 0 || game.state().mode !== 'real' || game.state().won)
            return; drag = { id: ev.pointerId, x: ev.clientX, y: ev.clientY }; try {
            screen.setPointerCapture(ev.pointerId);
        }
        catch { } });
        screen.addEventListener('pointermove', ev => { if (!drag || drag.id !== ev.pointerId)
            return; camera.look((ev.clientX - drag.x) * .0055, -(ev.clientY - drag.y) * .0035); drag.x = ev.clientX; drag.y = ev.clientY; render(); });
        const end = ev => { if (drag?.id === ev.pointerId)
            drag = null; };
        screen.addEventListener('pointerup', end);
        screen.addEventListener('pointercancel', end);
        screen.addEventListener('lostpointercapture', end);
    }
    function save() { try {
        localStorage.setItem(KEY, JSON.stringify(game.state()));
        localStorage.setItem(MANUAL_TIME_KEY, String(Date.now()));
        notify('Partida guardada manualmente.');
    }
    catch (e) {
        notify('No se pudo guardar: almacenamiento no disponible.');
    } render(); }
    function load() {
        try {
            const current = localStorage.getItem(KEY), old = !current && PREVIOUS_KEYS.map(k => localStorage.getItem(k)).find(Boolean), raw = current || old;
            if (!raw) {
                notify('No hay partida guardada.');
                return false;
            }
            if (game.load(JSON.parse(raw))) {
                director.clear();
                if (old) {
                    localStorage.setItem(KEY, JSON.stringify(game.state()));
                    notify('Partida anterior importada a v0.9. El Día 4 está disponible tras completar el Día 3.');
                }
                else
                    notify('Partida restaurada.');
                flush();
                render();
                return true;
            }
            notify('El guardado es incompatible o esta danado.');
            return false;
        }
        catch (e) {
            notify('No se pudo abrir la partida guardada.');
            return false;
        }
    }
    $('save').addEventListener('click', save);
    $('load').addEventListener('click', load);
    $('recoverAuto').addEventListener('click', recoverAuto);
    // Copias portables. Nunca se envían datos a un servidor.
    function exportSave() {
        try {
            const data = JSON.stringify(game.state(), null, 2);
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'NAMELESS-404-dia-' + game.state().day + '-partida.json';
            document.body.appendChild(link);
            link.click();
            link.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            notify('Copia JSON descargada. Guárdala en un lugar seguro.');
        }
        catch (e) {
            notify('No se pudo exportar la partida.');
        }
    }
    async function importSaveFile(file) {
        if (!file) {
            return false;
        }
        if (file.size > 131072) {
            notify('Archivo rechazado: supera 128 KiB.');
            return false;
        }
        try {
            const data = JSON.parse(await file.text());
            if (!game.load(data)) {
                notify('Partida inválida o incompatible. No se ha modificado el progreso.');
                return false;
            }
            director.clear();
            $('omenStatus').textContent = 'PRESAGIO · EN ESPERA';
            flush();
            render();
            requestAuto();
            notify('Partida importada. Pulsa Guardar para conservarla manualmente.');
            return true;
        }
        catch (e) {
            notify('No se pudo leer el JSON. El progreso actual permanece intacto.');
            return false;
        }
    }
    $('exportSave').addEventListener('click', exportSave);
    $('importSave').addEventListener('click', () => $('importFile').click());
    $('importFile').addEventListener('change', async (ev) => {
        const input = ev.currentTarget;
        await importSaveFile(input.files?.[0]);
        input.value = '';
    });
    $('restart').addEventListener('click', () => { if (window.confirm('¿Empezar una partida nueva? El guardado anterior se conservará hasta que vuelvas a guardar.')) {
        director.clear();
        act(() => game.reset());
    } });
    $('audio').addEventListener('click', () => {
        audio = !audio;
        $('audio').textContent = 'Audio: ' + (audio ? 'sí' : 'no');
        if (audio) {
            try {
                ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
                ctx.resume();
                osc = ctx.createOscillator();
                hum = ctx.createOscillator();
                master = ctx.createGain();
                filter = ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.value = 450;
                osc.type = 'sine';
                hum.type = 'triangle';
                osc.frequency.value = 44;
                hum.frequency.value = 59;
                master.gain.value = .007;
                osc.connect(filter);
                hum.connect(filter);
                filter.connect(master);
                master.connect(ctx.destination);
                // Ruido de cinta de baja intensidad, sintetizado localmente y sin archivos de terceros.
                const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate), data = buffer.getChannelData(0);
                let seed = 8844;
                for (let i = 0; i < data.length; i++) {
                    seed = (1664525 * seed + 1013904223) >>> 0;
                    data[i] = (seed / 2147483648 - 1) * .17;
                }
                noise = ctx.createBufferSource();
                noise.buffer = buffer;
                noise.loop = true;
                hiss = ctx.createGain();
                hiss.gain.value = .003;
                noise.connect(hiss).connect(master);
                osc.start();
                hum.start();
                noise.start();
                premiumAudio.start(ctx);
                tone(400, .14);
            }
            catch {
                notify('Este dispositivo no admite audio Web Audio.');
                audio = false;
                $('audio').textContent = 'Audio: no';
            }
        }
        else {
            premiumAudio.stop();
            try {
                osc?.stop();
                hum?.stop();
                noise?.stop();
                osc?.disconnect();
                hum?.disconnect();
                noise?.disconnect();
                hiss?.disconnect();
                filter?.disconnect();
                master?.disconnect();
            }
            catch { }
            osc = null;
            hum = null;
            noise = null;
            hiss = null;
            filter = null;
            master = null;
        }
    });
    let gpuProbeResult = null;
    $('diagnostics').addEventListener('click', () => { const box = $('diagnosticsPanel'); box.hidden = !box.hidden; if (!box.hidden)
        gpuProbeResult = probeWebGL2(); updateDiagnostics(); });
    function updateDiagnostics() {
        const d = $('diagnosticsText');
        if (!d || $('diagnosticsPanel').hidden)
            return;
        let webgl2 = false;
        try {
            const sample = document.createElement('canvas');
            webgl2 = !!sample.getContext('webgl2');
        }
        catch (e) { }
        d.textContent = 'Versión: 0.31.0 · Cinematic Camera · Entrada: inmediata\n' + 'Renderer: ' + (gfxTag?.textContent || 'DESCONOCIDO') + '\n'
            + 'WebGL2 disponible: ' + (webgl2 ? 'SÍ' : 'NO') + '\n'
            + 'Resolución interna: ' + (game.state().mode === 'real' && !game.state().won ? '384 × 256 (192 × 256 por pantalla)' : '256 × 192') + '\n'
            + 'FPS presentación: ' + (measuredFps || 'calculando…') + ' (objetivo 30)\n'
            + 'Modo: ' + game.state().mode + ' · Día: ' + game.state().day + '\nPresagios: ' + (director.getEnabled() ? 'ACTIVOS' : 'DESACTIVADOS')
            + (gfx?.checkFrame && game.state().mode === 'real' && !game.state().won ? (() => { const frame = gfx.checkFrame(); return '\nLectura framebuffer WebGL2: ' + (frame.ok ? 'PASS' : 'NO') + ' · ' + frame.message + (frame.rgba.length ? ' · RGB ' + frame.rgba.slice(0, 3).join(',') : ''); })() : '')
            + (gpuProbeResult ? '\nPrueba GPU local: ' + (gpuProbeResult.available ? 'WebGL2' : 'NO DISPONIBLE') + ' · shader ' + (gpuProbeResult.shader ? 'PASS' : 'NO') + ' · píxel ' + (gpuProbeResult.pixel ? 'PASS' : 'NO') + '\n' + gpuProbeResult.message : '');
    }
    $('focusMode').addEventListener('click', () => { immersive = !immersive; document.body.classList.toggle('focus-mode', immersive); $('focusMode').textContent = 'Modo inmersivo: ' + (immersive ? 'sí' : 'no'); $('focusMode').setAttribute('aria-pressed', String(immersive)); });
    $('omens').addEventListener('click', () => { director.setEnabled(!director.getEnabled()); $('omens').textContent = 'Presagios: ' + (director.getEnabled() ? 'sí' : 'no'); $('omens').setAttribute('aria-pressed', String(director.getEnabled())); $('omenStatus').textContent = 'PRESAGIO · ' + (director.getEnabled() ? 'EN ESPERA' : 'DESACTIVADOS'); render(); });
    $('effects').addEventListener('click', () => { reduceEffects = !reduceEffects; $('effects').textContent = 'Destellos: ' + (reduceEffects ? 'no' : 'sí'); render(); });
    $('brightness').addEventListener('click', () => { brightness = brightness === 'normal' ? 'alto' : 'normal'; $('brightness').textContent = 'Brillo: ' + brightness; $('brightness').setAttribute('aria-pressed', String(brightness === 'alto')); render(); });
    $('help').addEventListener('click', () => { $('helpDialog').showModal(); });
    $('helpClose').addEventListener('click', () => $('helpDialog').close());
    $('start').addEventListener('click', () => { $('introDialog').close(); director.clear(); act(() => game.reset()); });
    $('continue').addEventListener('click', () => {
        $('introDialog').close();
        let savedAt = 0, manualAt = 0;
        try {
            savedAt = JSON.parse(localStorage.getItem(AUTO_KEY) || 'null')?.savedAt || 0;
            manualAt = Number(localStorage.getItem(MANUAL_TIME_KEY) || 0);
        }
        catch (e) { }
        if (savedAt > manualAt && recoverAuto())
            return;
        if (!load() && !recoverAuto())
            act(() => game.reset());
    });
    const canModal = typeof HTMLDialogElement !== 'undefined' && typeof $('introDialog').showModal === 'function';
    if (canModal)
        $('introDialog').showModal();
    else
        notify('DÍA 1: explora el cartucho con X.');
    const motionReduce = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (!motionReduce) {
        reduceEffects = true;
    }
    // Controles de mando: cruceta o stick, botones estándar y prevención de repetición involuntaria.
    function pollGamepad(now) {
        // El estado se comprueba a 30-60 Hz; no se espera 85 ms para responder.
        if (now - padPollAt < 22)
            return;
        padPollAt = now;
        let pad;
        try {
            pad = Array.from(navigator.getGamepads?.() || []).find(p => p && p.connected !== false);
        }
        catch (e) {
            pad = null;
        }
        if (!pad) {
            if (gamepadActive) {
                gamepadActive = false;
                $('gamepadStatus').textContent = 'MANDO · Desconectado';
            }
            inputs.release('gamepad');
            return;
        }
        if (!gamepadActive) {
            gamepadActive = true;
            $('gamepadStatus').textContent = 'MANDO · Conectado';
        }
        const pressed = i => !!pad.buttons?.[i]?.pressed;
        let action = '';
        if (pressed(12) || pad.axes?.[1] < -.55)
            action = 'ArrowUp';
        else if (pressed(13) || pad.axes?.[1] > .55)
            action = 'ArrowDown';
        else if (pressed(14) || pad.axes?.[0] < -.55)
            action = 'ArrowLeft';
        else if (pressed(15) || pad.axes?.[0] > .55)
            action = 'ArrowRight';
        else if (pressed(0))
            action = 'interact';
        else if (pressed(2))
            action = 'swap';
        else if (pressed(3))
            action = 'light';
        else if (pressed(9))
            action = 'map';
        else if (pressed(4))
            action = 'sneak';
        else if (pressed(5))
            action = 'decoy';
        if (action) {
            const first = inputs.press('gamepad', action, now);
            if (first)
                dispatchInput(first);
        }
        else
            inputs.release('gamepad');
    }
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') {
        inputs.clear();
        if (autoTimer !== null) {
            clearTimeout(autoTimer);
            autoTimer = null;
        }
        autoWrite(true);
    } });
    window.addEventListener('pagehide', () => autoWrite(true));
    function animate(now) {
        // Estética y efectos visuales independientes del avance de la simulación.
        if (document.visibilityState === 'visible') {
            if (document.querySelector('dialog[open]'))
                inputs.clear();
            else {
                pollGamepad(now);
                for (const action of inputs.repeat(now))
                    dispatchInput(action);
            }
            if (now - t0 > 100) {
                t0 = now;
                if (game.tick()) {
                    flush();
                    requestAuto();
                }
                if (audio && ctx && master && hum && osc) {
                    const st = game.state();
                    const k = st.mode === 'real' ? (st.room === 'SOTANO TECNICO' || st.day >= 2 ? 1.3 : 1) : .42;
                    const o = director.current(now);
                    const silence = o && (o.kind === 'hollow' || o.kind === 'absence') ? .27 : 1;
                    master.gain.setTargetAtTime((.004 + st.threat / 18000) * k * silence, ctx.currentTime, .19);
                    hum.frequency.setTargetAtTime((st.day === 5 ? 39 : st.day === 4 ? 43 : st.day === 3 ? 47 : st.day === 2 ? 52 : 59) + (st.threat / 8) + (st.room === 'ALA ESTE' ? 2 : 0), ctx.currentTime, .24);
                    filter?.frequency.setTargetAtTime(st.mode === 'rpg' ? 290 : (240 + st.threat * 5), ctx.currentTime, .3);
                    hiss?.gain.setTargetAtTime(st.day === 5 ? .016 : st.day === 4 ? .015 : st.day === 3 ? .013 : st.day === 2 ? .010 : .004, ctx.currentTime, .4);
                    osc.frequency.setTargetAtTime(st.mode === 'rpg' ? 49 : 42, ctx.currentTime, .3);
                    // A slow heartbeat is perceived as a warning instead of a jump scare;
                    // its cadence follows the danger level, never the render FPS.
                    premiumAudio.update(st, now);
                    if (st.mode === 'real' && st.chase && st.threat > 55 && now - lastHeartbeat > Math.max(460, 980 - st.threat * 4)) {
                        sound('heartbeat');
                        lastHeartbeat = now;
                    }
                }
            }
            // Render independiente de la simulación (10 Hz); limitador a ~30 FPS.
            if (now - lastFrame >= 33) {
                lastFrame = now;
                render(now);
                frames++;
            }
            if (now - counterStart >= 1000) {
                measuredFps = Math.round(frames * 1000 / (now - counterStart));
                counterStart = now;
                frames = 0;
                updateDiagnostics();
            }
        }
        requestAnimationFrame(animate);
    }
    flush();
    render();
    requestAnimationFrame(animate);
    globalThis.__namelessDebug = { state: () => game.state(), game, render, save, load, autoWrite, recoverAuto, exportSave, importSaveFile, renderer: () => gfx?.status() ?? 'canvas-fallback', director, premiumAudio, inputs, camera, view: () => lastCameraView }; // pruebas automatizadas locales
}

const R=NamelessRender;

// main.js


bootGame(RetroWebGL);

})();
