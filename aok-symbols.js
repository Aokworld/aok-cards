/* ==========================================================================
   AOK SYMBOLS — drop-in module for the A²OK Kindness Card builder
   PUBLIC API
     AOKSymbols.mount()                 inject the <defs>. Call once, on load.
     AOKSymbols.list(fieldId)           -> array of the 8 categories
     AOKSymbols.get(fieldId, catId)     -> one category object
     AOKSymbols.medal(fieldId, catId)   -> markup for one medallion
     AOKSymbols.picker(fieldId, state)  -> markup for the picker control
     AOKSymbols.defaultFor(fieldId)     -> the pre-selected category id
   STATE SHAPE: { symbol: "on-the-house", also: ["the-extra"] }
   RUNGS: 1-2 inline SVG. 3+ <img src="/symbols/<fieldId>/<catId>.webp">.
   ========================================================================== */
(function (root) {
'use strict';
/* RASTER_FROM: first rung that swaps inline SVG for generated .webp artwork.
   Held at 99 (= never) until the 48 Rung 3 images exist in RASTER_PATH.
   Set it to 3 the day they land, or at runtime: AOKSymbols.config({rasterFrom:3}). */
var RASTER_FROM = 99, RASTER_PATH = '/symbols';
/* SPARK_MARK: 'ring'  the anonymous ring - ANONYMOUS over the top, A SPARK
                      ACCRUES under the bottom, a struck bolt each side (default)
              'bolt'  the bolt alone, for wherever the ring is too small to read */
var SPARK_MARK = 'ring';

var DEFS = '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>' +
'<linearGradient id="aokAu" x1=".12" y1="0" x2=".88" y2="1"><stop offset="0" stop-color="#FFFCEE"/><stop offset=".08" stop-color="#F9E1A6"/><stop offset=".2" stop-color="#DCA93E"/><stop offset=".3" stop-color="#A0700C"/><stop offset=".42" stop-color="#EFCE7E"/><stop offset=".52" stop-color="#FFF8E2"/><stop offset=".64" stop-color="#E3B44E"/><stop offset=".76" stop-color="#8C6109"/><stop offset=".88" stop-color="#DCA93E"/><stop offset="1" stop-color="#FDF2CE"/></linearGradient>' +
'<linearGradient id="aokBv" x1=".85" y1="0" x2=".15" y2="1"><stop offset="0" stop-color="#FFFDF2" stop-opacity=".95"/><stop offset=".45" stop-color="#C89323" stop-opacity=".2"/><stop offset="1" stop-color="#6B4A05" stop-opacity=".85"/></linearGradient>' +
'<linearGradient id="aokG" x1=".2" y1="0" x2=".8" y2="1"><stop offset="0" stop-color="#FFF9E0"/><stop offset=".35" stop-color="#F0C868"/><stop offset=".62" stop-color="#C08A2E"/><stop offset="1" stop-color="#8A5E14"/></linearGradient>' +
'<radialGradient id="aokR" cx=".36" cy=".3" r=".85"><stop offset="0" stop-color="#F2515A"/><stop offset=".6" stop-color="#C8121C"/><stop offset="1" stop-color="#73060F"/></radialGradient>' +
'<radialGradient id="nav" cx=".34" cy=".26" r=".95"><stop offset="0" stop-color="#2E67A8"/><stop offset=".5" stop-color="#143B70"/><stop offset="1" stop-color="#050E28"/></radialGradient>' +
'<radialGradient id="ox" cx=".34" cy=".26" r=".95"><stop offset="0" stop-color="#8A2418"/><stop offset=".5" stop-color="#521108"/><stop offset="1" stop-color="#240502"/></radialGradient>' +
'<radialGradient id="mar" cx=".34" cy=".26" r=".95"><stop offset="0" stop-color="#96202C"/><stop offset=".5" stop-color="#5E0D16"/><stop offset="1" stop-color="#2A0308"/></radialGradient>' +
'<radialGradient id="for" cx=".34" cy=".26" r=".95"><stop offset="0" stop-color="#26794A"/><stop offset=".5" stop-color="#11512C"/><stop offset="1" stop-color="#04220F"/></radialGradient>' +
'<radialGradient id="plum" cx=".34" cy=".26" r=".95"><stop offset="0" stop-color="#6E2AA0"/><stop offset=".5" stop-color="#3C126A"/><stop offset="1" stop-color="#170424"/></radialGradient>' +
'<radialGradient id="teal" cx=".34" cy=".26" r=".95"><stop offset="0" stop-color="#13767F"/><stop offset=".5" stop-color="#0A4A53"/><stop offset="1" stop-color="#02191D"/></radialGradient>' +
'<radialGradient id="ind" cx=".34" cy=".26" r=".95"><stop offset="0" stop-color="#3A3B96"/><stop offset=".5" stop-color="#232468"/><stop offset="1" stop-color="#0A0922"/></radialGradient>' +
'<radialGradient id="sie" cx=".34" cy=".26" r=".95"><stop offset="0" stop-color="#A5441A"/><stop offset=".5" stop-color="#6E2A0C"/><stop offset="1" stop-color="#2A0D00"/></radialGradient>' +
'<filter id="aokSf" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="3.4"/></filter>' +
'<filter id="aokD" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="1.8" stdDeviation="1.4" flood-color="#0A0600" flood-opacity=".6"/></filter>' +
'<clipPath id="aokC"><circle cx="50" cy="50" r="41.5"/></clipPath>' +
'<g id="aokF"><circle cx="50" cy="51.5" r="49" fill="#2A1C06" opacity=".28" filter="url(#aokSf)"/><circle cx="50" cy="50" r="49" fill="url(#aokAu)"/><circle cx="50" cy="50" r="46" fill="none" stroke="url(#aokBv)" stroke-width="4.4"/></g>' +
'<circle id="aokS" cx="50" cy="45" r="41.5" fill="none" stroke="#000" stroke-width="12" opacity=".46" filter="url(#aokSf)"/>' +
'<ellipse id="aokDM" cx="36" cy="29" rx="27" ry="17" fill="#fff" opacity=".13" filter="url(#aokSf)" transform="rotate(-22 36 29)"/>' +
'<g id="aokE"><circle cx="50" cy="50" r="41.5" fill="none" stroke="#3A2600" stroke-width="1.8" opacity=".75"/><circle cx="50" cy="50" r="48.4" fill="none" stroke="#6B4A05" stroke-width="1.1" opacity=".45"/></g>' +
'<path id="aokRIMTOP" d="M16.5,50 a33.5,33.5 0 0,1 67,0"/>' +
'<path id="aokRIMBOT" d="M11.5,50 a38.5,38.5 0 0,0 77,0"/>' +
'<path id="aokBOLT" d="M68 6 L24 54 L47 54 L34 94 L78 44 L55 44 Z"/>' +
'</defs></svg>';

var G = {
heart_rays:'<g stroke="url(#aokG)" stroke-width="3.2" stroke-linecap="round"><path d="M50 11v9"/><path d="M50 11v9" transform="rotate(40 50 50)"/><path d="M50 11v9" transform="rotate(80 50 50)"/><path d="M50 11v9" transform="rotate(-40 50 50)"/><path d="M50 11v9" transform="rotate(-80 50 50)"/></g><g filter="url(#aokD)"><path d="M50 78L28 56a15.56 15.56 0 0 1 22-22 15.56 15.56 0 0 1 22 22z" fill="url(#aokR)" stroke="url(#aokG)" stroke-width="2.8"/></g>',
bulb_heart:'<g filter="url(#aokD)"><path d="M50 14a22 22 0 0 1 13 39.7V62H37v-8.3A22 22 0 0 1 50 14z" fill="url(#aokG)"/><path d="M37 66h26v6H37zM41 76h18v5H41z" fill="url(#aokG)"/><path d="M50 50L43 43a4.95 4.95 0 0 1 7-7 4.95 4.95 0 0 1 7 7z" fill="url(#aokR)"/></g>',
bubble_heart:'<g filter="url(#aokD)"><path d="M13 21h74v40H53L35 79V61H13z" fill="url(#aokG)"/><path d="M50 55L38 43a8.49 8.49 0 0 1 12-12 8.49 8.49 0 0 1 12 12z" fill="url(#aokR)"/></g>',
gift:'<g filter="url(#aokD)"><path d="M20 36h60v12H20z" fill="url(#aokG)"/><path d="M24 48h52v34H24z" fill="url(#aokG)"/><path d="M44 36h12v46H44z" fill="url(#aokR)"/><path d="M45 36c-13-2-16-14-6-16 6-1 9 8 6 16z" fill="url(#aokR)"/><path d="M55 36c13-2 16-14 6-16-6-1-9 8-6 16z" fill="url(#aokR)"/></g>',
globe_heart:'<g filter="url(#aokD)"><circle cx="50" cy="50" r="28" fill="none" stroke="url(#aokG)" stroke-width="5"/><path d="M50 22c-9 8-9 48 0 56M50 22c9 8 9 48 0 56M22 50h56M25 36h50M25 64h50" fill="none" stroke="url(#aokG)" stroke-width="2.6"/><path d="M50 68L37 55a9.2 9.2 0 0 1 13-13 9.2 9.2 0 0 1 13 13z" fill="url(#aokR)" stroke="url(#aokG)" stroke-width="2.4"/></g>',
sunrise:'<g stroke="url(#aokG)" stroke-width="3" stroke-linecap="round"><path d="M50 34V22"/><path d="M50 34V22" transform="rotate(30 50 62)"/><path d="M50 34V22" transform="rotate(-30 50 62)"/><path d="M50 34V22" transform="rotate(62 50 62)"/><path d="M50 34V22" transform="rotate(-62 50 62)"/></g><g filter="url(#aokD)"><path d="M30 62a20 20 0 0 1 40 0z" fill="url(#aokG)"/><path d="M12 62h76" stroke="url(#aokG)" stroke-width="4" stroke-linecap="round"/></g>',
sprout:'<path d="M12.5 70A42.5 42.5 0 0 0 87.5 70z" fill="#2B1A0C"/><g filter="url(#aokD)"><path d="M50 72V40" stroke="url(#aokG)" stroke-width="4" stroke-linecap="round"/><path d="M49 57c-13 .4-20.5-5.4-22-15 11.6-2.6 20.6 3.4 22 15z" fill="url(#aokG)"/><path d="M51 57c13 .4 20.5-5.4 22-15-11.6-2.6-20.6 3.4-22 15z" fill="url(#aokG)"/><path d="M50 41L41 32a6.36 6.36 0 0 1 9-9 6.36 6.36 0 0 1 9 9z" fill="url(#aokR)"/></g>',
nib:'<g filter="url(#aokD)"><path d="M62 20l12 12-36 36-15 3 3-15z" fill="url(#aokG)"/><path d="M62 20l12 12 7-7-12-12z" fill="url(#aokR)"/><path d="M24 82h52" stroke="url(#aokG)" stroke-width="3.4" stroke-linecap="round" opacity=".85"/></g>',
banknote:'<g filter="url(#aokD)"><path d="M16 32h68v36H16z" fill="url(#aokG)"/><circle cx="50" cy="50" r="12" fill="#000" opacity=".35"/><path d="M50 57l-6-6a3.4 3.4 0 0 1 6-3.4 3.4 3.4 0 0 1 6 3.4z" fill="url(#aokR)"/><path d="M24 40h6M70 60h6" stroke="#000" stroke-width="2.6" opacity=".35"/></g>',
bubble_star:'<g filter="url(#aokD)"><path d="M14 24h72v40H52L34 82V64H14z" fill="url(#aokG)"/><path d="M50 30l5 11 12 1.6-8.8 8.2 2.4 12L50 57l-10.6 5.8 2.4-12L33 42.6 45 41z" fill="url(#aokR)"/></g>',
hourglass:'<g filter="url(#aokD)"><path d="M26 14h48v7H26zM26 79h48v7H26z" fill="url(#aokG)"/><path d="M32 21h36L50 50l18 29H32l18-29z" fill="none" stroke="url(#aokG)" stroke-width="4"/><path d="M37 25h26L50 46z" fill="url(#aokR)"/><path d="M40 74h20l-10-12z" fill="url(#aokR)"/></g>',
toolbox:'<g filter="url(#aokD)"><path d="M16 40h68v40H16z" fill="url(#aokG)"/><path d="M38 40V30a12 12 0 0 1 24 0v10" fill="none" stroke="url(#aokG)" stroke-width="5"/><path d="M16 56h68" stroke="#000" stroke-width="3" opacity=".35"/><path d="M50 54L44 48a3.4 3.4 0 0 1 6-3.4 3.4 3.4 0 0 1 6 3.4z" fill="url(#aokR)"/></g>',
umbrella:'<g filter="url(#aokD)"><path d="M14 52a36 36 0 0 1 72 0z" fill="url(#aokG)"/><path d="M50 52v22a8 8 0 0 1-16 0" fill="none" stroke="url(#aokG)" stroke-width="5" stroke-linecap="round"/><path d="M50 12v8" stroke="url(#aokG)" stroke-width="4" stroke-linecap="round"/><path d="M14 52c6-8 12-8 18 0s12 8 18 0 12-8 18 0 12 8 18 0" fill="none" stroke="#000" stroke-width="3" opacity=".4"/></g>',
envelope_seal:'<g filter="url(#aokD)"><path d="M22 32h56v36H22z" fill="url(#aokG)"/><path d="M22 32l28 21 28-21" fill="none" stroke="#000" stroke-width="3.2" opacity=".5"/><circle cx="50" cy="62" r="9" fill="url(#aokR)"/></g>',
stool_worn:'<g filter="url(#aokD)"><path d="M32 86V52h10v34zM58 86V52h10v34z" fill="url(#aokG)"/><path d="M26 44h48v10H26z" fill="url(#aokG)"/><path d="M30 44V20h40v24z" fill="url(#aokG)"/><path d="M36 26h28v12H36z" fill="#000" opacity=".35"/></g>',
tag_struck:'<g filter="url(#aokD)"><path d="M52 14h30v30L46 80 16 50z" fill="url(#aokG)"/><circle cx="69" cy="27" r="6" fill="#000" opacity=".5"/><path d="M18 20l64 62" stroke="url(#aokR)" stroke-width="9" stroke-linecap="round"/></g>',
cup_heart:'<g filter="url(#aokD)"><path d="M26 44h44v22a14 14 0 0 1-14 14H40a14 14 0 0 1-14-14z" fill="url(#aokG)"/><path d="M70 50h7a8 8 0 0 1 0 16h-7" fill="none" stroke="url(#aokG)" stroke-width="4.6"/><path d="M44 34c6-5 6-9 0-14M56 34c6-5 6-9 0-14" fill="none" stroke="url(#aokR)" stroke-width="4" stroke-linecap="round"/></g>',
box_string:'<g filter="url(#aokD)"><path d="M20 32h60v12H20z" fill="url(#aokG)"/><path d="M24 44h52v38H24z" fill="url(#aokG)"/><path d="M45 32h10v50H45z" fill="url(#aokR)"/><path d="M46 32c-13-2-15-13-6-15 6-1 9 7 6 15z" fill="url(#aokR)"/><path d="M54 32c13-2 15-13 6-15-6-1-9 7-6 15z" fill="url(#aokR)"/></g>',
clock_late:'<g filter="url(#aokD)"><circle cx="50" cy="46" r="24" fill="none" stroke="url(#aokG)" stroke-width="7"/><path d="M50 46V30M50 46l12 8" stroke="url(#aokG)" stroke-width="4" stroke-linecap="round"/><path d="M28 82h44l-6-14H34z" fill="url(#aokR)"/></g>',
two_chairs:'<g filter="url(#aokD)"><path d="M14 84V56h8v28zM38 84V56h8v28z" fill="url(#aokG)"/><path d="M10 48h40v9H10z" fill="url(#aokG)"/><path d="M14 48V24h32v24z" fill="url(#aokG)"/><path d="M54 84V56h8v28zM78 84V56h8v28z" fill="url(#aokG)"/><path d="M50 48h40v9H50z" fill="url(#aokG)"/><path d="M54 48V24h32v24z" fill="url(#aokG)"/></g>',
knot_untied:'<g filter="url(#aokD)" fill="none" stroke="url(#aokG)" stroke-width="7" stroke-linecap="round"><path d="M18 62c12-16 22 12 34-4"/><path d="M56 56c8-11 18 4 26-6"/></g><path d="M50 22l3.4 8.4 8.4 3.4-8.4 3.4L50 46l-3.4-8.8-8.4-3.4 8.4-3.4z" fill="url(#aokR)"/>',
ledger_closed:'<g filter="url(#aokD)"><path d="M22 20h56v56H22z" fill="url(#aokG)"/><path d="M28 26h44v44H28z" fill="#000" opacity=".45"/><path d="M22 20h56v8H22z" fill="url(#aokG)"/><path d="M46 20h8v16l-4-4-4 4z" fill="url(#aokR)"/></g>',
door_light:'<g filter="url(#aokD)"><path d="M34 18h34v66H34z" fill="#FBEFC8"/><path d="M74 50h14M72 38l14-8M72 62l14 8" stroke="url(#aokG)" stroke-width="3.4" stroke-linecap="round"/><path d="M30 14h42v70H30z" fill="none" stroke="url(#aokG)" stroke-width="4"/><path d="M30 84V14L14 8v82z" fill="url(#aokG)"/><circle cx="25" cy="50" r="2.6" fill="#000" opacity=".6"/></g>',
gap_filled:'<g filter="url(#aokD)"><path d="M8 84V52h16v32zM76 84V52h16v32z" fill="url(#aokG)" opacity=".5"/><path d="M30 84V34h40v50z" fill="url(#aokG)"/><path d="M38 44h10v12H38zM52 44h10v12H52z" fill="#000" opacity=".4"/><path d="M44 84V66h12v18z" fill="#000" opacity=".4"/><path d="M50 24L48 34h4z" fill="url(#aokR)"/></g>',
key_fob:'<g filter="url(#aokD)" transform="rotate(-30 50 50)"><path d="M44 46h38v9H44z" fill="url(#aokG)"/><path d="M70 55h6v10h-6zM79 55h5v7h-5z" fill="url(#aokG)"/><path d="M32 66L18.6 52.6a9.48 9.48 0 0 1 13.4-13.4 9.48 9.48 0 0 1 13.4 13.4z" fill="url(#aokR)" stroke="url(#aokG)" stroke-width="2.6"/><circle cx="32" cy="48" r="4.6" fill="#000" opacity=".55"/></g>',
tools_crossed:'<g filter="url(#aokD)"><path d="M22 78L62 26" stroke="url(#aokG)" stroke-width="8" stroke-linecap="round"/><path d="M60 20l10 8-8 10-10-8z" fill="url(#aokG)"/><path d="M78 78L38 26" stroke="url(#aokG)" stroke-width="8" stroke-linecap="round"/><circle cx="38" cy="22" r="9" fill="none" stroke="url(#aokG)" stroke-width="6"/><circle cx="50" cy="60" r="7" fill="url(#aokR)"/></g>',
match:'<g filter="url(#aokD)" transform="rotate(20 50 56)"><path d="M45 86V36h10v50z" fill="url(#aokG)"/><path d="M56 36C64 26 63 18 56 10c-7 8-8 16 0 26z" fill="url(#aokR)" transform="translate(-6,0)"/></g><path d="M18 84h64" stroke="url(#aokG)" stroke-width="3.4" stroke-linecap="round"/>',
punchcard:'<g filter="url(#aokD)"><path d="M24 16h52v68H24z" fill="url(#aokG)"/><path d="M32 28h36M32 40h36M32 52h24" stroke="#000" stroke-width="3" stroke-linecap="round" opacity=".4"/><path d="M36 66l8 9 18-19" fill="none" stroke="url(#aokR)" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></g>',
sunrise_building:'<g stroke="url(#aokG)" stroke-width="2.6" stroke-linecap="round" opacity=".85"><path d="M50 30V18"/><path d="M50 30V18" transform="rotate(38 50 58)"/><path d="M50 30V18" transform="rotate(-38 50 58)"/></g><g filter="url(#aokD)"><circle cx="50" cy="46" r="15" fill="url(#aokR)"/><path d="M30 84V56h40v28z" fill="url(#aokG)"/><path d="M26 56L50 40l24 16z" fill="url(#aokG)"/><path d="M44 84V70h12v14z" fill="#000" opacity=".4"/></g><path d="M12 84h76" stroke="url(#aokG)" stroke-width="3.4" stroke-linecap="round"/>',
table_set:'<g filter="url(#aokD)"><path d="M14 58h72v8H14z" fill="url(#aokG)"/><path d="M22 66v18M78 66v18" stroke="url(#aokG)" stroke-width="5" stroke-linecap="round"/><circle cx="34" cy="48" r="8" fill="url(#aokG)"/><circle cx="66" cy="48" r="8" fill="url(#aokG)"/><path d="M50 52L42 44a5.66 5.66 0 0 1 8-8 5.66 5.66 0 0 1 8 8z" fill="url(#aokR)"/></g>',
key_pass:'<g filter="url(#aokD)"><circle cx="26" cy="50" r="14" fill="none" stroke="url(#aokG)" stroke-width="7"/><path d="M38 46h34v9H38z" fill="url(#aokG)"/><path d="M60 55h6v10h-6zM70 55h5v7h-5z" fill="url(#aokG)"/><circle cx="80" cy="50" r="9" fill="none" stroke="url(#aokR)" stroke-width="5"/></g>',
book_heart:'<g filter="url(#aokD)"><path d="M50 34c-8-8-20-10-32-8v44c12-2 24 0 32 8z" fill="url(#aokG)"/><path d="M50 34c8-8 20-10 32-8v44c-12-2-24 0-32 8z" fill="url(#aokG)"/><path d="M50 34v44" stroke="#000" stroke-width="2.6" opacity=".4"/><path d="M50 28L42 20a5.66 5.66 0 0 1 8-8 5.66 5.66 0 0 1 8 8z" fill="url(#aokR)"/></g>',
candles_two:'<g filter="url(#aokD)"><path d="M14 80h60" stroke="url(#aokG)" stroke-width="4" stroke-linecap="round"/><path d="M20 80V44h13v36zM54 80V56h13v24z" fill="url(#aokG)"/><path d="M26.5 22c7 10 7 15.5 0 18.5-7-3-7-8.5 0-18.5z" fill="url(#aokR)"/><path d="M60.5 40c5 7 5 11 0 13-5-2-5-6 0-13z" fill="url(#aokR)"/><path d="M34 32q10-6 18 4" fill="none" stroke="url(#aokG)" stroke-width="2.6" stroke-linecap="round"/></g>',
mountain_path:'<g filter="url(#aokD)"><path d="M8 84L40 30l14 23 9-13 29 44z" fill="url(#aokG)"/><path d="M40 30l8 13-5 2-4-4-5 3z" fill="#FFF9E6"/><path d="M44 84c2-14 8-22 4-34" fill="none" stroke="url(#aokR)" stroke-width="4" stroke-linecap="round" stroke-dasharray="5 6"/></g>',
counter_till:'<g filter="url(#aokD)"><path d="M16 56h68v28H16z" fill="url(#aokG)"/><path d="M26 40h48v16H26z" fill="url(#aokG)"/><path d="M32 46h16v6H32z" fill="#000" opacity=".45"/><path d="M24 66h30v10H24z" fill="#000" opacity=".3"/><path d="M66 26l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="url(#aokR)"/></g>',
chair_empty:'<g filter="url(#aokD)"><path d="M30 86V50h9v36zM61 86V50h9v36z" fill="url(#aokG)"/><path d="M24 42h52v9H24z" fill="url(#aokG)"/><path d="M28 42V16h44v26z" fill="none" stroke="url(#aokG)" stroke-width="5"/><path d="M36 24h28M36 32h28" stroke="url(#aokG)" stroke-width="3.4"/></g>',
cup_name:'<g filter="url(#aokD)"><path d="M26 44h44v22a14 14 0 0 1-14 14H40a14 14 0 0 1-14-14z" fill="url(#aokG)"/><path d="M70 50h7a8 8 0 0 1 0 16h-7" fill="none" stroke="url(#aokG)" stroke-width="4.6"/><path d="M28 20h34v16H28z" fill="url(#aokR)"/><path d="M34 28h22" stroke="#FBEFC8" stroke-width="2.6" stroke-linecap="round"/></g>',
stool_one:'<g filter="url(#aokD)"><path d="M36 84V54h8v30zM56 84V54h8v30z" fill="url(#aokG)"/><path d="M30 84h40" stroke="url(#aokG)" stroke-width="4" stroke-linecap="round"/><ellipse cx="50" cy="46" rx="24" ry="9" fill="url(#aokG)"/><path d="M32 62h36" stroke="url(#aokG)" stroke-width="4"/></g>',
cal_ticked:'<g stroke="url(#aokG)" stroke-width="3.2" stroke-linecap="round"><path d="M34 16v10"/><path d="M66 16v10"/></g><g filter="url(#aokD)"><path d="M18 26h64v56H18z" fill="url(#aokG)"/><path d="M18 26h64v12H18z" fill="url(#aokR)"/><g stroke="#000" stroke-width="3" stroke-linecap="round" opacity=".45"><path d="M27 47l4 4 7-8M45 47l4 4 7-8M63 47l4 4 7-8M27 64l4 4 7-8M45 64l4 4 7-8M63 64l4 4 7-8"/></g></g>',
parcel_small:'<g filter="url(#aokD)"><path d="M26 46h48v34H26z" fill="url(#aokG)"/><path d="M46 46h8v34h-8z" fill="url(#aokR)"/><path d="M47 46c-10-2-12-11-4-13 5-1 7 6 4 13z" fill="url(#aokR)"/><path d="M53 46c10-2 12-11 4-13-5-1-7 6-4 13z" fill="url(#aokR)"/><path d="M16 80h68" stroke="url(#aokG)" stroke-width="3.4" stroke-linecap="round"/></g>',
lamp_on:'<g stroke="url(#aokG)" stroke-width="2.8" stroke-linecap="round" opacity=".8"><path d="M22 34l-8-8M78 34l8-8M50 20V10"/></g><g filter="url(#aokD)"><path d="M30 30h40l10 26H20z" fill="url(#aokG)"/><path d="M46 56h8v22h-8z" fill="url(#aokG)"/><path d="M34 78h32v6H34z" fill="url(#aokG)"/><circle cx="50" cy="44" r="7" fill="url(#aokR)"/></g>',
window_lit:'<g filter="url(#aokD)"><path d="M22 20h56v58H22z" fill="#FBEFC8"/><path d="M22 20h56v58H22z" fill="none" stroke="url(#aokG)" stroke-width="6"/><path d="M50 20v58M22 49h56" stroke="url(#aokG)" stroke-width="5"/><path d="M16 82h68" stroke="url(#aokG)" stroke-width="4" stroke-linecap="round"/><path d="M50 64L42 56a5.66 5.66 0 0 1 8-8 5.66 5.66 0 0 1 8 8z" fill="url(#aokR)"/></g>',
cups_tray:'<g filter="url(#aokD)"><ellipse cx="50" cy="66" rx="36" ry="13" fill="url(#aokG)"/><ellipse cx="50" cy="63" rx="30" ry="9" fill="#000" opacity=".3"/><path d="M26 44h16v12a8 8 0 0 1-16 0z" fill="url(#aokG)"/><path d="M42 44h16v12a8 8 0 0 1-16 0z" fill="url(#aokG)"/><path d="M58 44h16v12a8 8 0 0 1-16 0z" fill="url(#aokG)"/><path d="M50 34l2.6 6 6 2.6-6 2.6L50 51l-2.6-5.8-6-2.6 6-2.6z" fill="url(#aokR)"/></g>',
phone_bolt:'<g filter="url(#aokD)"><rect x="30" y="12" width="40" height="76" rx="7" fill="url(#aokG)"/><rect x="35" y="20" width="30" height="56" rx="3" fill="#000" opacity=".55"/><path d="M53 28l-12 20h8l-4 16 14-22h-9z" fill="url(#aokR)"/></g>',
restroom_door:'<g filter="url(#aokD)"><path d="M24 12h52v76H24z" fill="url(#aokG)"/><path d="M30 18h40v64H30z" fill="#000" opacity=".45"/><circle cx="40" cy="34" r="6" fill="url(#aokG)"/><path d="M40 42h3l5 18h-5v18h-6V60h-5l5-18z" fill="url(#aokG)"/><circle cx="62" cy="34" r="6" fill="url(#aokG)"/><path d="M62 42h4l6 18h-6v18h-8V60h-6l6-18z" fill="url(#aokG)"/></g>',
wifi:'<g filter="url(#aokD)"><circle cx="50" cy="76" r="7" fill="url(#aokG)"/><path d="M32 58a26 26 0 0 1 36 0" fill="none" stroke="url(#aokG)" stroke-width="8" stroke-linecap="round"/><path d="M22 44a40 40 0 0 1 56 0" fill="none" stroke="url(#aokG)" stroke-width="8" stroke-linecap="round"/><path d="M13 31a54 54 0 0 1 74 0" fill="none" stroke="url(#aokG)" stroke-width="8" stroke-linecap="round"/></g>',
tap_glass:'<g filter="url(#aokD)"><path d="M34 18h10v26H34z" fill="url(#aokG)"/><path d="M38 24h30v10H38z" fill="url(#aokG)"/><path d="M60 24h9v22h-9z" fill="url(#aokG)"/><path d="M56 50c0 10 8 13 8 21a8 8 0 0 1-16 0c0-8 8-11 8-21z" fill="#7BD4E8"/><path d="M18 86h64" stroke="url(#aokG)" stroke-width="4" stroke-linecap="round"/></g>',
chair_alone:'<g filter="url(#aokD)"><path d="M30 88V52h9v36zM61 88V52h9v36z" fill="url(#aokG)"/><path d="M24 44h52v9H24z" fill="url(#aokG)"/><path d="M28 44V14h44v30z" fill="url(#aokG)"/><path d="M34 22h32v14H34z" fill="#000" opacity=".4"/></g>',
umbrella_door:'<g filter="url(#aokD)"><path d="M52 16h34v72H52z" fill="url(#aokG)"/><path d="M58 22h22v60H58z" fill="#000" opacity=".45"/><path d="M6 50a20 20 0 0 1 40 0z" fill="url(#aokG)"/><path d="M26 50v26a7 7 0 0 1-14 0" fill="none" stroke="url(#aokG)" stroke-width="4.6" stroke-linecap="round"/><path d="M26 18v10" stroke="url(#aokG)" stroke-width="3.4" stroke-linecap="round"/></g>',
bell_ask:'<g filter="url(#aokD)"><path d="M20 70h60v9H20z" fill="url(#aokG)"/><path d="M50 26a26 26 0 0 1 26 26v18H24V52a26 26 0 0 1 26-26z" fill="url(#aokG)"/><circle cx="50" cy="20" r="6" fill="url(#aokR)"/><path d="M32 56h36" stroke="#000" stroke-width="2.6" opacity=".3"/></g>',
namecards_wall:'<g filter="url(#aokD)"><rect x="12" y="18" width="34" height="22" rx="3" fill="url(#aokG)"/><rect x="54" y="18" width="34" height="22" rx="3" fill="url(#aokG)"/><rect x="12" y="48" width="34" height="22" rx="3" fill="url(#aokG)"/><rect x="54" y="48" width="34" height="22" rx="3" fill="url(#aokR)"/><g stroke="#000" stroke-width="2.6" stroke-linecap="round" opacity=".4"><path d="M18 28h20M60 28h20M18 58h20"/></g><g stroke="#FBEFC8" stroke-width="2.6" stroke-linecap="round"><path d="M60 58h20"/></g></g>',
door_nolock:'<g filter="url(#aokD)"><path d="M24 88V26a16 16 0 0 1 16-16h20a16 16 0 0 1 16 16v62" fill="none" stroke="url(#aokG)" stroke-width="6"/><path d="M24 88L8 94V32l16-6z" fill="url(#aokG)"/><path d="M52 62l4-14h-8z" fill="url(#aokR)"/></g>',
house_lit:'<g filter="url(#aokD)"><path d="M50 14L88 46H12z" fill="url(#aokG)"/><path d="M22 46h56v38H22z" fill="url(#aokG)"/><path d="M34 54h14v14H34zM58 54h14v14H58z" fill="#FBEFC8"/><path d="M44 84V70h12v14z" fill="#000" opacity=".45"/></g>',
bridge:'<g filter="url(#aokD)"><path d="M14 56a36 18 0 0 1 72 0" fill="none" stroke="url(#aokG)" stroke-width="3"/><g stroke="url(#aokG)" stroke-width="2"><path d="M26 56v-7"/><path d="M38 56v-11"/><path d="M50 56v-13"/><path d="M62 56v-11"/><path d="M74 56v-7"/></g><path d="M8 56h84" stroke="url(#aokG)" stroke-width="4.4" stroke-linecap="round"/><g stroke="url(#aokG)" stroke-width="3.6" stroke-linecap="round"><path d="M16 56v20"/><path d="M84 56v20"/></g><path d="M50 40L44 34a3.96 3.96 0 0 1 6-6 3.96 3.96 0 0 1 6 6z" fill="url(#aokR)"/></g>',
tree_rings:'<g filter="url(#aokD)"><circle cx="50" cy="50" r="36" fill="none" stroke="url(#aokR)" stroke-width="5"/><circle cx="50" cy="50" r="28" fill="none" stroke="url(#aokG)" stroke-width="3.6" opacity=".9"/><circle cx="50" cy="50" r="20" fill="none" stroke="url(#aokG)" stroke-width="3.4" opacity=".75"/><circle cx="50" cy="50" r="12" fill="none" stroke="url(#aokG)" stroke-width="3.2" opacity=".6"/><circle cx="50" cy="50" r="5" fill="url(#aokG)"/></g>',
lamps_four:'<g filter="url(#aokD)">' +
  '<g transform="translate(34,36)"><path d="M-9-10h18l4 10h-26z" fill="url(#aokG)"/><circle cx="0" cy="-4" r="3.4" fill="url(#aokR)"/><path d="M-2 0h4v12h-4z" fill="url(#aokG)"/><path d="M-8 12h16v4h-16z" fill="url(#aokG)"/></g>' +
  '<g transform="translate(66,36)"><path d="M-9-10h18l4 10h-26z" fill="url(#aokG)"/><circle cx="0" cy="-4" r="3.4" fill="url(#aokR)"/><path d="M-2 0h4v12h-4z" fill="url(#aokG)"/><path d="M-8 12h16v4h-16z" fill="url(#aokG)"/></g>' +
  '<g transform="translate(34,64)"><path d="M-9-10h18l4 10h-26z" fill="url(#aokG)"/><circle cx="0" cy="-4" r="3.4" fill="url(#aokR)"/><path d="M-2 0h4v12h-4z" fill="url(#aokG)"/><path d="M-8 12h16v4h-16z" fill="url(#aokG)"/></g>' +
  '<g transform="translate(66,64)"><path d="M-9-10h18l4 10h-26z" fill="url(#aokG)"/><circle cx="0" cy="-4" r="3.4" fill="url(#aokR)"/><path d="M-2 0h4v12h-4z" fill="url(#aokG)"/><path d="M-8 12h16v4h-16z" fill="url(#aokG)"/></g>' +
'</g>',
scales:'<g filter="url(#aokD)">' +
  '<path d="M46 24h8v52h-8z" fill="url(#aokG)"/><path d="M30 76h40v6H30z" fill="url(#aokG)"/>' +
  '<path d="M20 30h60" stroke="url(#aokG)" stroke-width="4.6" stroke-linecap="round"/>' +
  '<g stroke="url(#aokG)" stroke-width="2"><path d="M26 31v10"/><path d="M74 31v10"/></g>' +
  '<path d="M14 41h24a12 12 0 0 1-24 0z" fill="url(#aokG)"/><path d="M62 41h24a12 12 0 0 1-24 0z" fill="url(#aokG)"/>' +
  '<circle cx="50" cy="26" r="6" fill="url(#aokR)"/></g>',
badge_till:'<g filter="url(#aokD)"><path d="M52 40h34v34H52z" fill="url(#aokG)" opacity=".45"/><rect x="14" y="26" width="48" height="34" rx="4" fill="url(#aokG)"/><path d="M14 26h48v11H14z" fill="url(#aokR)"/><g stroke="#000" stroke-width="3" stroke-linecap="round" opacity=".4"><path d="M22 46h26M22 54h16"/></g><path d="M32 18h12v8H32z" fill="url(#aokG)"/></g>',
aprons_two:'<g filter="url(#aokD)"><path d="M16 26h68v6H16z" fill="url(#aokG)"/><path d="M22 32c0 4 14 4 14 0 6 2 8 6 8 12v32a7 7 0 0 1-7 7H21a7 7 0 0 1-7-7V44c0-6 2-10 8-12z" fill="url(#aokG)"/><path d="M62 32c0 4 14 4 14 0 6 2 8 6 8 12v32a7 7 0 0 1-7 7H61a7 7 0 0 1-7-7V44c0-6 2-10 8-12z" fill="url(#aokG)" opacity=".75"/><path d="M22 58h16v12H22z" fill="#000" opacity=".35"/></g>',
padlock_open:'<g filter="url(#aokD)"><path d="M24 46h52v38H24z" fill="url(#aokG)"/><path d="M34 46V32a16 16 0 0 1 32 0" fill="none" stroke="url(#aokG)" stroke-width="7" stroke-linecap="round"/><circle cx="50" cy="62" r="7" fill="url(#aokR)"/><path d="M50 68v8" stroke="url(#aokR)" stroke-width="5" stroke-linecap="round"/></g>',
ear_arcs:'<g filter="url(#aokD)">' +
  '<path d="M57 20a21 21 0 0 0-21 21c0 8 2 11 2 17a9.5 9.5 0 0 0 19 0c0-5 4-6 8-9a19 19 0 0 0-8-29z" fill="url(#aokG)"/>' +
  '<path d="M55 33a10 10 0 0 0-10 10c0 5 3 6 3 10" fill="none" stroke="#000" stroke-width="3.4" stroke-linecap="round" opacity=".45"/>' +
'</g><g fill="none" stroke="url(#aokG)" stroke-width="3.2" stroke-linecap="round">' +
  '<path d="M25 40a16 16 0 0 0 0 20"/><path d="M17 33a26 26 0 0 0 0 34"/></g>',
floorplan_ring:'<g filter="url(#aokD)"><circle cx="50" cy="50" r="32" fill="none" stroke="url(#aokG)" stroke-width="4"/><circle cx="50" cy="22" r="7" fill="url(#aokG)"/><circle cx="70" cy="30" r="7" fill="url(#aokG)"/><circle cx="78" cy="50" r="7" fill="url(#aokG)"/><circle cx="70" cy="70" r="7" fill="url(#aokG)"/><circle cx="50" cy="78" r="7" fill="url(#aokG)"/><circle cx="30" cy="70" r="7" fill="url(#aokG)"/><circle cx="22" cy="50" r="7" fill="url(#aokG)"/><circle cx="30" cy="30" r="7" fill="url(#aokG)"/><circle cx="50" cy="50" r="8" fill="url(#aokR)"/></g>',
cup_mended:'<g filter="url(#aokD)"><path d="M26 40h44v26a14 14 0 0 1-14 14H40a14 14 0 0 1-14-14z" fill="url(#aokG)"/><path d="M70 46h7a8 8 0 0 1 0 16h-7" fill="none" stroke="url(#aokG)" stroke-width="4.6"/><path d="M44 40l6 14-5 12 8 14" fill="none" stroke="url(#aokR)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></g>',
blank_page:'<g filter="url(#aokD)"><path d="M26 12h38l12 12v64H26z" fill="url(#aokG)"/><path d="M64 12v12h12z" fill="#000" opacity=".35"/><path d="M50 62l2.8 6.6 6.6 2.8-6.6 2.8L50 81l-2.8-6.8-6.6-2.8 6.6-2.8z" fill="url(#aokR)"/></g>',
urn_tap:'<g filter="url(#aokD)"><path d="M30 24h40v10H30z" fill="url(#aokG)"/><path d="M34 34h32v40a10 10 0 0 1-10 10H44a10 10 0 0 1-10-10z" fill="url(#aokG)"/><path d="M66 52h10v8H66z" fill="url(#aokG)"/><path d="M50 62L43 55a4.95 4.95 0 0 1 7-7 4.95 4.95 0 0 1 7 7z" fill="url(#aokR)"/><path d="M20 88h60" stroke="url(#aokG)" stroke-width="3.4" stroke-linecap="round"/></g>',
arrows_heart:'<g filter="url(#aokD)" fill="none" stroke="url(#aokG)" stroke-width="6"><path d="M21.8 39.7A30 30 0 0 1 78.2 39.7"/><path d="M78.2 60.3A30 30 0 0 1 21.8 60.3"/></g><path d="M84 38l-4 14-12-7zM16 62l4-14 12 7z" fill="url(#aokG)"/><path d="M50 62L39 51a7.78 7.78 0 0 1 11-11 7.78 7.78 0 0 1 11 11z" fill="url(#aokR)"/>',
clock_nohands:'<g filter="url(#aokD)"><circle cx="50" cy="50" r="32" fill="none" stroke="url(#aokG)" stroke-width="7"/><g stroke="url(#aokG)" stroke-width="3.4" stroke-linecap="round"><path d="M50 22v6"/><path d="M78 50h-6"/><path d="M50 78v-6"/><path d="M22 50h6"/></g><circle cx="50" cy="50" r="6" fill="url(#aokR)"/></g>',
rota_heart:'<g filter="url(#aokD)"><path d="M20 14h60v72H20z" fill="url(#aokG)"/><g stroke="#000" stroke-width="2.6" opacity=".35"><path d="M20 32h60M20 50h60M20 68h60M50 14v72"/></g><path d="M65 62L57 54a5.66 5.66 0 0 1 8-8 5.66 5.66 0 0 1 8 8z" fill="url(#aokR)"/></g>',
noticeboard:'<g filter="url(#aokD)"><path d="M14 18h72v62H14z" fill="url(#aokG)"/><path d="M20 24h60v50H20z" fill="#000" opacity=".38"/><rect x="26" y="30" width="22" height="18" fill="url(#aokG)"/><rect x="54" y="34" width="22" height="18" fill="url(#aokG)"/><rect x="34" y="54" width="22" height="16" fill="url(#aokR)"/><circle cx="37" cy="30" r="2.6" fill="url(#aokR)"/><circle cx="65" cy="34" r="2.6" fill="url(#aokR)"/></g>',
bench_lamp:'<g filter="url(#aokD)"><path d="M70 84V28h5v56z" fill="url(#aokG)"/><path d="M62 28h21l-4-10H66z" fill="url(#aokG)"/><rect x="10" y="52" width="46" height="7" rx="2" fill="url(#aokG)"/><rect x="10" y="42" width="46" height="7" rx="2" fill="url(#aokG)"/><rect x="8" y="62" width="50" height="8" rx="2.5" fill="url(#aokG)"/><g stroke="url(#aokG)" stroke-width="4" stroke-linecap="round"><path d="M16 42v28M50 42v28"/></g><path d="M72 20l2.4 5.6 5.6 2.4-5.6 2.4L72 36l-2.4-5.6-5.6-2.4 5.6-2.4z" fill="url(#aokR)" opacity=".9"/></g>',
jar_coins:'<g filter="url(#aokD)"><path d="M32 26h36v8H32z" fill="url(#aokG)"/><path d="M34 34h32v40a10 10 0 0 1-10 10H44a10 10 0 0 1-10-10z" fill="none" stroke="url(#aokG)" stroke-width="4"/><circle cx="44" cy="62" r="7" fill="url(#aokG)"/><circle cx="58" cy="66" r="7" fill="url(#aokG)"/><circle cx="50" cy="74" r="7" fill="url(#aokG)"/><path d="M50 20l2.6 6 6 2.6-6 2.6L50 37l-2.6-5.8-6-2.6 6-2.6z" fill="url(#aokR)"/></g>',
till_open:'<g filter="url(#aokD)"><path d="M18 44h64v34H18z" fill="url(#aokG)"/><path d="M22 20h56v24H22z" fill="url(#aokG)" opacity=".8"/><path d="M28 26h44v12H28z" fill="#000" opacity=".45"/><path d="M30 54h40v14H30z" fill="#000" opacity=".3"/><path d="M44 58h12v6H44z" fill="url(#aokR)"/></g>',
festoon:'<g filter="url(#aokD)"><path d="M8 22c20 26 64 26 84 0" fill="none" stroke="url(#aokG)" stroke-width="3"/><g fill="url(#aokR)"><circle cx="20" cy="34" r="7"/><circle cx="38" cy="42" r="7"/><circle cx="56" cy="42" r="7"/><circle cx="74" cy="33" r="7"/></g><g fill="url(#aokG)"><circle cx="29" cy="56" r="6"/><circle cx="50" cy="60" r="6"/><circle cx="68" cy="55" r="6"/></g></g>',
rosette:'<g filter="url(#aokD)"><path d="M40 60h20l-4 30-6-5-6 5z" fill="url(#aokR)"/><circle cx="50" cy="40" r="26" fill="url(#aokG)"/><circle cx="50" cy="40" r="17" fill="#000" opacity=".35"/><path d="M50 28l3 7.4 7.4 3-7.4 3L50 52l-3-7.6-7.4-3 7.4-3z" fill="url(#aokG)"/></g>',
tin_heart:'<g filter="url(#aokD)"><path d="M26 36h48v48H26z" fill="url(#aokG)"/><path d="M22 26h56v10H22z" fill="url(#aokG)"/><path d="M40 30h20v3H40z" fill="#000" opacity=".55"/><path d="M50 68L40 58a7.07 7.07 0 0 1 10-10 7.07 7.07 0 0 1 10 10z" fill="url(#aokR)"/></g>',
wreath:'<g filter="url(#aokD)"><circle cx="50" cy="50" r="30" fill="none" stroke="url(#aokG)" stroke-width="9" stroke-dasharray="9 5" stroke-linecap="round"/><path d="M42 74h16l-3 18-5-4-5 4z" fill="url(#aokR)"/><path d="M50 56L42 48a5.66 5.66 0 0 1 8-8 5.66 5.66 0 0 1 8 8z" fill="url(#aokR)"/></g>',
closed_sign:'<g filter="url(#aokD)"><path d="M18 30h64v40H18z" fill="url(#aokG)"/><path d="M24 36h52v28H24z" fill="#000" opacity=".45"/><path d="M50 62L40 52a7.07 7.07 0 0 1 10-10 7.07 7.07 0 0 1 10 10z" fill="url(#aokR)"/><path d="M34 20l16 10 16-10" fill="none" stroke="url(#aokG)" stroke-width="3.4" stroke-linecap="round"/></g>',
trestle_long:'<g filter="url(#aokD)"><path d="M6 48h88v9H6z" fill="url(#aokG)"/><g stroke="url(#aokG)" stroke-width="5" stroke-linecap="round"><path d="M16 57v26M50 57v26M84 57v26"/></g><g fill="url(#aokG)"><rect x="16" y="34" width="14" height="10" rx="2"/><rect x="43" y="34" width="14" height="10" rx="2"/><rect x="70" y="34" width="14" height="10" rx="2"/></g><path d="M50 28l2.4 5.6 5.6 2.4-5.6 2.4L50 44l-2.4-5.6-5.6-2.4 5.6-2.4z" fill="url(#aokR)"/></g>',
room_empty:'<g filter="url(#aokD)"><path d="M10 24h80v52H10z" fill="url(#aokG)" opacity=".35"/><path d="M10 24h80v52H10z" fill="none" stroke="url(#aokG)" stroke-width="4"/><path d="M56 76V32h26v44z" fill="#FBEFC8"/><path d="M56 76V32h26v44z" fill="none" stroke="url(#aokG)" stroke-width="4"/><path d="M10 82h80" stroke="url(#aokG)" stroke-width="4" stroke-linecap="round"/></g>',
chairs_ring:'<g filter="url(#aokD)"><ellipse cx="50" cy="52" rx="34" ry="20" fill="none" stroke="url(#aokG)" stroke-width="3" stroke-dasharray="4 6"/><g fill="url(#aokG)"><rect x="44" y="22" width="12" height="12" rx="2"/><rect x="68" y="32" width="12" height="12" rx="2"/><rect x="76" y="52" width="12" height="12" rx="2"/><rect x="62" y="66" width="12" height="12" rx="2"/><rect x="44" y="72" width="12" height="12" rx="2"/><rect x="26" y="66" width="12" height="12" rx="2"/><rect x="12" y="52" width="12" height="12" rx="2"/><rect x="20" y="32" width="12" height="12" rx="2"/></g><path d="M50 46l2.6 6 6 2.6-6 2.6L50 63l-2.6-5.8-6-2.6 6-2.6z" fill="url(#aokR)"/></g>',
platter:'<g filter="url(#aokD)"><ellipse cx="50" cy="70" rx="38" ry="10" fill="url(#aokG)"/><path d="M16 68a34 26 0 0 1 68 0z" fill="url(#aokG)"/><path d="M16 68a34 26 0 0 1 68 0z" fill="#000" opacity=".18"/><circle cx="50" cy="38" r="6" fill="url(#aokR)"/></g>',
awning:'<g filter="url(#aokD)"><path d="M12 42h76l-8-20H20z" fill="url(#aokG)"/><path d="M30 22l-4 20M46 22l-2 20M62 22l2 20M78 22l4 20" stroke="#000" stroke-width="4" opacity=".3"/><path d="M12 42c6 8 12 8 19 0s13 8 19 0 13 8 19 0 13 8 19 0" fill="none" stroke="url(#aokG)" stroke-width="4"/><g stroke="url(#aokG)" stroke-width="5" stroke-linecap="round"><path d="M18 48v34M82 48v34"/></g><path d="M50 56L44 50a3.96 3.96 0 0 1 6-6 3.96 3.96 0 0 1 6 6z" fill="url(#aokR)"/></g>',
ribbon_pin:'<g filter="url(#aokD)"><path d="M50 26c14 14 22 30 22 40a22 22 0 0 1-44 0c0-10 8-26 22-40z" fill="none" stroke="url(#aokR)" stroke-width="10" stroke-linejoin="round"/><path d="M50 26c14 14 22 30 22 40a22 22 0 0 1-44 0c0-10 8-26 22-40z" fill="none" stroke="url(#aokG)" stroke-width="3.4" stroke-linejoin="round"/></g>',
music_stand:'<g filter="url(#aokD)"><path d="M22 24h56v30H22z" fill="url(#aokG)" transform="rotate(-8 50 39)"/><path d="M47 50h6v30h-6z" fill="url(#aokG)"/><path d="M30 86h40" stroke="url(#aokG)" stroke-width="5" stroke-linecap="round"/><path d="M38 78l24 8M62 78l-24 8" stroke="url(#aokG)" stroke-width="3.4" stroke-linecap="round"/><circle cx="50" cy="36" r="7" fill="url(#aokR)" transform="rotate(-8 50 39)"/></g>',
bookmark:'<g filter="url(#aokD)"><path d="M24 14h52v72H24z" fill="url(#aokG)"/><path d="M30 20h40v60H30z" fill="#000" opacity=".35"/><path d="M46 14h14v44l-7-6-7 6z" fill="url(#aokR)"/></g>',
shopfronts_two:'<g filter="url(#aokD)"><path d="M8 84V44h36v40z" fill="url(#aokG)" opacity=".4"/><path d="M14 54h10v12H14zM30 54h10v12H30z" fill="#000" opacity=".3"/><path d="M52 84V36h40v48z" fill="url(#aokG)"/><path d="M58 46h12v14H58zM76 46h12v14H76z" fill="#FBEFC8"/><path d="M66 84V68h12v16z" fill="#000" opacity=".4"/><path d="M72 26l2.4 5.6 5.6 2.4-5.6 2.4L72 42l-2.4-5.6-5.6-2.4 5.6-2.4z" fill="url(#aokR)"/></g>',
clipboard:'<g filter="url(#aokD)"><path d="M22 18h56v68H22z" fill="url(#aokG)"/><path d="M38 12h24v12H38z" fill="url(#aokG)"/><path d="M38 12h24v12H38z" fill="#000" opacity=".3"/><g stroke="#000" stroke-width="3" stroke-linecap="round" opacity=".4"><path d="M32 40h36M32 52h36M32 64h22"/></g><path d="M62 70L56 64a3.96 3.96 0 0 1 6-6 3.96 3.96 0 0 1 6 6z" fill="url(#aokR)"/></g>',
schoolhouse:'<g filter="url(#aokD)"><path d="M50 20L86 48H14z" fill="url(#aokG)"/><path d="M22 48h56v36H22z" fill="url(#aokG)"/><path d="M30 56h14v14H30zM56 56h14v14H56z" fill="#000" opacity=".4"/><path d="M44 84V70h12v14z" fill="#000" opacity=".4"/><path d="M46 6h8v14h-8z" fill="url(#aokG)"/><circle cx="50" cy="10" r="5" fill="url(#aokR)"/></g>',
doors_plain:'<g filter="url(#aokD)"><path d="M22 26h56v52H22z" fill="url(#aokG)"/>' +
  '<path d="M36 78V46a14 14 0 0 1 28 0v32z" fill="#FBEFC8"/>' +
  '<path d="M36 78V46a14 14 0 0 1 28 0v32z" fill="none" stroke="#3A2600" stroke-width="2.6" opacity=".55"/>' +
  '<path d="M50 46v32" stroke="#3A2600" stroke-width="2.6" opacity=".55"/>' +
  '<path d="M22 20h56v6H22z" fill="url(#aokG)"/></g>',
map_pin:'<g filter="url(#aokD)"><path d="M50 88C50 66 70 58 70 42a20 20 0 1 0-40 0c0 16 20 24 20 46z" fill="url(#aokG)"/><circle cx="50" cy="42" r="10" fill="url(#aokR)"/></g>',
wrench:'<g filter="url(#aokD)" transform="rotate(-38 50 50)"><path d="M44 34h12v50H44z" fill="url(#aokG)"/><path d="M50 12a16 16 0 0 1 12 26l-4 4H42l-4-4A16 16 0 0 1 50 12z" fill="url(#aokG)"/><circle cx="50" cy="26" r="7" fill="#000" opacity=".5"/></g>',
street_row:'<g filter="url(#aokD)"><path d="M6 84V50h18v34z" fill="url(#aokG)"/><path d="M26 84V38h20v46z" fill="url(#aokG)"/><path d="M48 84V56h18v28z" fill="url(#aokG)"/><path d="M68 84V44h22v40z" fill="url(#aokG)"/><g fill="#FBEFC8"><rect x="10" y="58" width="8" height="9"/><rect x="31" y="46" width="8" height="9"/><rect x="52" y="64" width="8" height="9"/><rect x="74" y="52" width="8" height="9"/></g><path d="M4 86h92" stroke="url(#aokG)" stroke-width="3.4" stroke-linecap="round"/></g>'
};

var OTHER = ['Other', 'None of these. Tell us in your own words.', 'Free text', 0, 'nav', 'nib'];
var RAW = {
kindness_meaning: [1, [
['Heart & Light',"Kindness as feeling. It starts in the chest, and it doesn't stay there.",'Addition',0,'mar','heart_rays'],
['Open Mind',"Kindness as a way of thinking - a default we already have, not a mood we're in.",'Example',0,'ind','bulb_heart'],
['Kind Words','Kindness as language. What we say to people, and how we say it.','Attention',0,'plum','bubble_heart'],
['What We Do','Kindness as action. Not a feeling at all - a thing you hand over.','Addition',0,'sie','gift'],
['A Better World','Kindness as something bigger than one address. What we do here reaches past here.','Propagation',0,'teal','globe_heart'],
['Brighter Tomorrow',"Kindness as direction. About what comes next, not what's already done.",'Example',0,'ind','sunrise'],
['Growth','Kindness as something that compounds. One turn becomes ten without us doing anything.','Propagation',0,'for','sprout'], OTHER]],
k_helped: [2, [
['Someone Paid','Money arrived when it was needed. A bill, a tab, an invoice, quietly settled.','Addition',0,'for','banknote'],
['They Told Everyone','Somebody talked us up. Word of mouth, a review, a recommendation we never asked for.','Propagation',0,'plum','bubble_star'],
['We Got Time','Patience instead of money. A deadline moved, rent deferred, credit extended.','Subtraction',1,'teal','hourglass'],
['Free Hands',"Unpaid labour. Somebody did the work for us and wouldn't take money for it.",'Addition',0,'sie','toolbox'],
['When It Was Bad','Help that arrived during a crisis - a flood, a fire, an illness, a closure.','Interruption',0,'ox','umbrella'],
['No Name On It',"Anonymous. We still don't know who it was, and not knowing was the whole point.",'Addition',1,'nav','envelope_seal'],
['They Kept Coming','Simple loyalty. Nothing dramatic happened - people just never stopped showing up.','Attention',1,'mar','stool_worn'], OTHER]],
k_gave: [2, [
['On the House',"We didn't charge. The most common kindness a business gives, and the least mentioned.",'Subtraction',0,'ox','tag_struck'],
['The Extra','More than they paid for. A top-up, a second one, a bigger portion, no mention of it.','Addition',0,'nav','cup_heart'],
['We Kept It Back',"Held, reserved, set aside for one particular person who'd never have asked.",'Attention',0,'for','box_string'],
['We Stayed','Time given outside our hours. Opened early, closed late, came back in for someone.','Addition',0,'sie','clock_late'],
['We Listened','The kindness was attention, not a product. We gave them the time instead.','Attention',1,'teal','two_chairs'],
['We Sorted It','A problem fixed that was never ours to fix, and nobody else was going to.','Subtraction',0,'plum','knot_untied'],
['We Never Said','Done, and deliberately never mentioned to anyone - including the person it was for.','Release',1,'ind','ledger_closed'], OTHER]],
why_open: [2, [
['Somewhere to Belong',"To make a place where people feel they're allowed to be, whoever they are.",'Addition',0,'ind','door_light'],
['Nobody Else Would','The neighbourhood needed it and no one was providing it, so we did.','Addition',0,'sie','gap_filled'],
['For the Family',"Built for, or handed down by, the people closest to us. We weren't letting it close.",'Propagation',0,'nav','key_fob'],
['We Loved the Craft','The work itself was the reason. We wanted to make the thing properly.','Example',0,'ox','tools_crossed'],
['To Fix Something','Anger or loss started it. Something was wrong somewhere and we answered it.','Interruption',0,'mar','match'],
['To Give Work','Jobs. We opened so that people would have somewhere to be employed.','Addition',0,'teal','punchcard'],
['A Second Start','This was a fresh beginning after something in our lives ended.','Example',0,'plum','sunrise_building'], OTHER]],
who_taught: [2, [
['At Her Table','Family. A parent or grandparent who fed and housed everyone who turned up.','Addition',0,'sie','table_set'],
['A Good Boss','Work. Somebody ran a place well, and we copied what they did.','Example',0,'nav','key_pass'],
['A Teacher','Formal teaching - a school, a mentor, a text, a faith we were raised in.','Example',0,'for','book_heart'],
['A Stranger','Someone we never saw again, who set the whole thing off without knowing it.','Propagation',1,'ox','candles_two'],
['The Hard Years','Not a person at all. Difficulty itself did the teaching, and it stuck.','Attention',0,'plum','mountain_path'],
['Our Customers','The people who walk in taught us, not the other way round. We just paid attention.','Attention',0,'mar','counter_till'],
['Nobody Did',"It wasn't modelled for us. We chose it against the example we were given.",'Interruption',1,'ind','chair_empty'], OTHER]],
regular_miss: [2, [
['Their Usual',"We start making it before they reach the counter. We've never had to ask.",'Attention',0,'nav','cup_name'],
['Their Seat','They have a spot, and everyone here knows not to take it.','Attention',0,'ox','stool_one'],
['Every Single Day','Reliability. Same time, same door, without fail, for years.','Example',0,'for','cal_ticked'],
['They Bring Things','They give to us - cards, cake, cuttings, things nobody asked them for.','Addition',0,'plum','parcel_small'],
['They Fix the Room',"The place is different when they're in it. It's mood, not transaction.",'Interruption',0,'sie','lamp_on'],
['We Worry About Them',"They're alone, or unwell, and we watch the door for them without saying so.",'Attention',1,'teal','window_lit'],
['All of Them',"We won't single one out, and that refusal is the actual answer.",'Attention',0,'mar','cups_tray'], OTHER]],
house_move: [2, [
['Charge Your Phone','Power, a socket, a cable behind the counter. No purchase, no asking.','Addition',1,'teal','phone_bolt'],
['Use the Restroom','The one thing everybody else makes you buy something for first.','Subtraction',1,'nav','restroom_door'],
['Free Wifi','Connection, no password, no time limit, no minimum spend.','Addition',1,'ind','wifi'],
['Free Water','Water, ice, a bowl for the dog, out front where nobody has to ask.','Addition',1,'teal','tap_glass'],
['Sit as Long as You Like','Space and time. Nobody will ever move you on, however long you stay.','Release',1,'mar','chair_alone'],
['Come In Out of It',"Shelter - warmth, cool, somewhere to stand that isn't the weather.",'Addition',1,'ox','umbrella_door'],
['Just Ask',"Directions, a pen, a plaster, a phone call, the time. Worst case we haven't got it.",'Attention',0,'sie','bell_ask'], OTHER]],
vision: [3, [
['Everyone Is Known','Recognition. Nobody comes in and leaves again still a stranger.','Attention',0,'nav','namecards_wall'],
['Nobody Is Turned Away',"Access. What's in your pocket stops mattering at the threshold.",'Subtraction',1,'plum','door_nolock'],
['A Second Home',"Belonging. People treat it as theirs, and come on days they don't need anything.",'Addition',0,'mar','house_lit'],
['The Street Is Better',"Outward. The whole neighbourhood is different because we're in it.",'Propagation',0,'teal','bridge'],
['It Outlives Us','Permanence. Still standing and still like this when none of us are here.','Propagation',0,'sie','tree_rings'],
['Others Copy It','Spread. The model matters more than this one building ever will.','Example',0,'ind','lamps_four'],
['Good Work, Fairly Paid','Staff first. The people behind the counter can afford to live near it.','Addition',0,'for','scales'], OTHER]],
teach_new: [3, [
['Names First','Learn the person before the process. The register can wait.','Attention',0,'nav','badge_till'],
['Watch, Then Do','Apprenticeship. Nobody learns this from a document or a slide.','Example',0,'sie','aprons_two'],
['You Can Say Yes','Authority. Staff can fix things without checking upward first.','Release',0,'for','padlock_open'],
['Listen First','Attention as the actual core skill of the job. Let people finish.','Attention',1,'plum','ear_arcs'],
['No One Is Beneath It','No sections, no hierarchy, nobody passing a problem along to someone else.','Example',0,'teal','floorplan_ring'],
["You'll Get It Wrong",'Mistakes are expected and safe here. Nobody gets shouted at for one.','Release',1,'ox','cup_mended'],
['Assume the Best','Give people the benefit of the doubt as the default, every time.','Release',1,'ind','blank_page'], OTHER]],
regular_kindness: [3, [
['We Feed People','Food and drink given away on a standing basis, not as an occasional gesture.','Addition',0,'ox','urn_tap'],
['We Pay It Forward','A suspended system. Customers fund the next person through the door.','Propagation',1,'for','arrows_heart'],
['We Make Time','The kindness is time and attention rather than goods. We stop and talk.','Attention',1,'teal','clock_nohands'],
['We Look After Our Own','Inward. The regular kindness is aimed at the people who work here.','Addition',0,'plum','rota_heart'],
['We Give Space','The room itself is the gift - meetings, groups, study, shelter, storage.','Addition',0,'nav','noticeboard'],
['We Keep the Street','Outward and civic. Litter, planting, lighting, watching out for people.','Example',0,'ind','bench_lamp'],
['We Give a Cut','A standing share of what we take goes somewhere else, every week.','Addition',1,'sie','jar_coins'], OTHER]],
annual_event: [3, [
['The Free Day','One day a year, the till stays shut and everything is on us.','Addition',0,'for','till_open'],
['The Party',"A gathering. Food, music, the doors open late and nobody's counting.",'Addition',0,'ind','festoon'],
['We Give an Award','Somebody gets named and honoured publicly, the same time every year.','Attention',0,'mar','rosette'],
['The Big Collection','A yearly fundraise, drive or appeal that we run ourselves.','Propagation',0,'ox','tin_heart'],
['We Remember','A memorial or anniversary for somebody we lost, marked the same way each time.','Attention',1,'plum','wreath'],
['Staff Day','We close, and the whole thank-you is aimed at the people who work here.','Subtraction',0,'teal','closed_sign'],
['The Long Table','A shared meal. One table, and whoever turns up eats at it.','Addition',0,'sie','trestle_long'], OTHER]],
host_small: [3, [
['A Room to Borrow','Space is what we have. Somebody else brings the actual content.','Addition',0,'nav','room_empty'],
['Coffee and Chairs','Small, regular, conversational. No stage, no programme, no head of the table.','Attention',0,'ox','chairs_ring'],
['Something to Eat',"We'd feed it. Catering is our contribution and somebody else organises it.",'Addition',0,'for','platter'],
['For the Neighbours','Outward and local. A street thing rather than an invite list.','Propagation',0,'sie','awning'],
['For a Cause','Fundraising or awareness for something specific and usually local.','Propagation',0,'mar','ribbon_pin'],
['Something Creative','Music, readings, exhibitions, workshops, walls for local artists.','Example',0,'plum','music_stand'],
['Not Yet',"An honest no that isn't a never. Ask us again when we've got the staff.",'Release',0,'ind','bookmark'], OTHER]],
who_else: [3, [
['Another Shop','A business on the same street doing the same quiet thing we do.','Propagation',0,'nav','shopfronts_two'],
['A Charity','An organised cause - a food bank, a shelter, a hospice, a rescue.','Propagation',0,'for','clipboard'],
['A School','Education - a school, a college, a youth club, a library.','Propagation',0,'sie','schoolhouse'],
['A Faith Group','A congregation of any kind, doing community work beyond its own doors.','Propagation',0,'plum','doors_plain'],
['One Person','Not an organization at all. An individual who simply does it, alone.','Propagation',0,'mar','map_pin'],
['A Service','Trades and services - a garage, a barber, a repair cafe.','Propagation',0,'teal','wrench'],
['A Whole Street','Not one organization. The area itself is the answer to this question.','Propagation',0,'ox','street_row'], OTHER]]
};

var M = {};
Object.keys(RAW).forEach(function (fid) {
  M[fid] = { rung: RAW[fid][0], cats: RAW[fid][1].map(function (a) {
    return { id: a[0].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
             name: a[0], category: a[1], form: a[2], spark: !!a[3], bg: a[4], glyph: a[5] };
  })};
});

var mounted = false;
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
  return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function mount() {
  if (mounted || typeof document === 'undefined') return;
  var d = document.createElement('div');
  d.innerHTML = DEFS;
  document.body.insertBefore(d.firstChild, document.body.firstChild);
  mounted = true;
}
function list(fid)      { return M[fid] ? M[fid].cats : []; }
function get(fid, cid)  { var c = list(fid); for (var i = 0; i < c.length; i++) if (c[i].id === cid) return c[i]; return c[0]; }
/* Q1 is the only question the organization does not answer - its flag is
   fixed. Naming it here means a reorder of the rows can no longer change it
   silently. Any field absent from FLAG falls back to its first row. */
var FLAG = { kindness_meaning: 'heart-light' };
function defaultFor(fid){
  if (FLAG[fid] && get(fid, FLAG[fid]).id === FLAG[fid]) return FLAG[fid];
  var c = list(fid); return c.length ? c[0].id : '';
}
function rungOf(fid)    { return M[fid] ? M[fid].rung : 1; }

function medal(fid, cid) {
  var c = get(fid, cid);
  if (!c) return '';
  if (rungOf(fid) >= RASTER_FROM) {
    return '<img class="aok-sym" src="' + RASTER_PATH + '/' + fid + '/' + c.id +
           '.webp" alt="' + esc(c.name) + '" loading="lazy">';
  }
  /* The rim legend ran the full circle, so its lower half rendered upside
     down, and at 22px it was mud. The bolt is what the physical tablet
     carries anyway. 'legend' keeps lettering, but only across the top arc
     where it stays upright and fits. */
  /* THE ANONYMOUS RING
     An act nobody signed gets a ring that says so. The organization never
     chooses this - it follows from the answer, which is how the anonymity
     doctrine reaches a card without anybody being sold it.
     Two arcs, not one: a single full circle renders its lower half upside
     down, which is what broke the first version. ANONYMOUS reads across the
     top, A SPARK ACCRUES across the bottom, both upright, a struck bolt each
     side.                                                                   */
  var rim = '';
  if (c.spark) {
    if (SPARK_MARK === 'bolt') {
      rim = '<g><circle cx="68" cy="68" r="14" fill="#160F04" opacity=".94"/>' +
        '<circle cx="68" cy="68" r="14" fill="none" stroke="url(#aokG)" stroke-width="2.2"/>' +
        '<g transform="translate(68,68) scale(.215) translate(-51,-50)">' +
        '<use href="#aokBOLT" fill="url(#aokG)"/></g></g>';
    } else {
      var bolt = function (x) {
        return '<g transform="translate(' + x + ',50) scale(.115) translate(-51,-50)">' +
               '<use href="#aokBOLT" fill="#F7E7BC" opacity=".95"/></g>';
      };
      rim =
        '<circle cx="50" cy="50" r="29.5" fill="none" stroke="#E0B559" stroke-width=".9" opacity=".55"/>' +
        '<text font-family="IBM Plex Mono,ui-monospace,monospace" font-size="6.4" letter-spacing="2.6" fill="#F7E7BC" opacity=".92">' +
        '<textPath href="#aokRIMTOP" startOffset="50%" text-anchor="middle">ANONYMOUS</textPath></text>' +
        '<text font-family="IBM Plex Mono,ui-monospace,monospace" font-size="5.6" letter-spacing="2.2" fill="#F7E7BC" opacity=".8">' +
        '<textPath href="#aokRIMBOT" startOffset="50%" text-anchor="middle">A SPARK ACCRUES</textPath></text>' +
        bolt(16) + bolt(84);
    }
  }
  var gl = c.spark
    ? '<g transform="translate(50,50) scale(' + (SPARK_MARK === 'ring' ? '.60' : '.78') + ') translate(-50,-50)">' + G[c.glyph] + '</g>'
    : G[c.glyph];
  return '<svg class="aok-sym" viewBox="0 0 100 100" role="img" aria-label="' + esc(c.name) + '">' +
    '<use href="#aokF"/><g clip-path="url(#aokC)"><circle cx="50" cy="50" r="41.5" fill="url(#' + c.bg + ')"/>' +
    '<use href="#aokS"/>' + rim + gl + '<use href="#aokDM"/></g><use href="#aokE"/></svg>';
}

function picker(fid, state) {
  state = state || {};
  var sym = state.symbol || defaultFor(fid), also = state.also || [];
  return '<div class="aok-picker" data-field="' + fid + '">' + list(fid).map(function (c) {
    var isP = sym === c.id, isA = also.indexOf(c.id) > -1;
    return '<div class="aok-tile' + (isP ? ' is-answer' : '') + (isA ? ' is-also' : '') + '">' +
      (isP ? '<span class="aok-badge">YOUR ANSWER</span>' : isA ? '<span class="aok-badge">ALSO TRUE</span>' : '') +
      '<button type="button" class="aok-hit" data-pick="' + c.id + '" aria-label="Choose ' + esc(c.name) + '">' +
        medal(fid, c.id) +
        '<span class="aok-name">' + esc(c.name) + '</span>' +
        '<span class="aok-cat">' + esc(c.category) + '</span>' +
      '</button>' +
      '<div class="aok-foot"><span class="aok-form' + (c.spark ? ' is-spark' : '') + '">' +
        esc(c.form) + (c.spark ? ' &#183; Spark' : '') + '</span>' +
        (isP ? '' : '<button type="button" class="aok-also' + (isA ? ' on' : '') +
          '" data-also="' + c.id + '">' + (isA ? '&#10003; also' : '+ also') + '</button>') +
      '</div></div>';
  }).join('') + '</div>';
}

root.AOKSymbols = {
  mount: mount, list: list, get: get, medal: medal, picker: picker,
  defaultFor: defaultFor, rungOf: rungOf, flags: FLAG,
  fields: Object.keys(M),
  config: function (o) {
    if (o) {
      if (typeof o.rasterFrom === 'number') RASTER_FROM = o.rasterFrom;
      if (typeof o.rasterPath === 'string') RASTER_PATH = o.rasterPath;
      if (o.sparkMark === 'ring' || o.sparkMark === 'bolt') SPARK_MARK = o.sparkMark;
      else if (o.sparkMark) throw new Error('AOKSymbols: sparkMark must be "ring" or "bolt", got ' + o.sparkMark);
    }
    return { rasterFrom: RASTER_FROM, rasterPath: RASTER_PATH, sparkMark: SPARK_MARK };
  }
};
})(typeof window !== 'undefined' ? window : this);
