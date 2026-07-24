/**
 * One switch for whether the Tamdid venture appears on this site.
 *
 *     showTamdid = true   → the product, the co-founder role and the work are shown
 *     showTamdid = false  → none of it appears anywhere, named or unnamed
 *
 * Flip this one boolean and rebuild. Nothing else needs editing.
 *
 * WHY IT HIDES MORE THAN THE NAME
 * -------------------------------
 * Removing the project card and the CV entry is not enough. The venture was
 * also the subject of sentences that never named it — "co-founder and sole
 * engineer of a fintech product", "1 fintech product built solo", "I built an
 * entire fintech product in evenings and weekends around a full-time job".
 * Anyone with a reason to recognise it would recognise it from those just as
 * easily as from the name, so a half-hide would protect nothing while still
 * costing the CV its strongest material.
 *
 * So `false` removes the venture entirely, and every place that referred to it
 * obliquely switches to wording that stands on the Ragham and Pishgaman work
 * instead. Both versions of that copy sit side by side in the data files, so
 * turning it back on restores the original text rather than something rewritten
 * from memory. Search for `showTamdid` to find all of them.
 *
 * If you edit the visible copy, check whether its counterpart needs the same
 * edit — that is the one maintenance cost this arrangement has.
 */
export const showTamdid = false;
