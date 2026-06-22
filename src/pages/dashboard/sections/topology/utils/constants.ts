{/* Représente la hauteur maximale d'une node */}
export const MAX_HEIGHT_NODE = 200;
export const MIN_HEIGHT_NODE = 50;

{/* Représente la largeur maximale d'une node */}
export const MAX_WIDTH_NODE = 500;
export const MIN_WIDTH_NODE = 200;

{/* Représente l'écart minimale entre deux nodes sur x et sur y */}
export const OFFSET_X = 200;
export const OFFSET_Y = 50;

{/* Représente la position x par rapport à 0 des nodes collecteurs, sources et alertes */}
export const COLLECTOR_X = OFFSET_X;
export const SOURCE_X = COLLECTOR_X + MAX_WIDTH_NODE + OFFSET_X;
export const ALERT_X = SOURCE_X + MAX_WIDTH_NODE + OFFSET_X + 300;

{/* Représente l'écart entre deux nodes sur y pour chaque type de node */}
export const ROW_GAP = OFFSET_Y + MAX_HEIGHT_NODE;

{/* Représente les valeurs initiales des filtres */}
export const DEFAULT_MIN_DISTINCT_SOURCE_COUNT = 3;
export const DEFAULT_ALERT_LIMIT = 20;