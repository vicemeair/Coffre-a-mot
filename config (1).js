// ============================================
// CONFIGURATION DU COFFRE À MOTS
// Modifie les valeurs ci-dessous, c'est tout.
// ============================================

const CONFIG = {
  // Les deux joueurs. "code" est le code secret que CHACUN garde pour lui
  // (pour prouver que c'est bien lui qui se connecte).
  players: {
    j1: { name: "Joueur 1", code: "1234" },
    j2: { name: "Joueur 2", code: "5678" },
  },

  // Fenêtre horaire (0-23) pendant laquelle chacun a le droit de voir SES mots.
  // Ici : ouvert de 18h à 7h du matin, reverrouillé de 7h à 18h.
  revealStartHour: 18,
  revealEndHour: 7,

  // Identifiants JSONBin.io (voir INSTRUCTIONS.md pour savoir comment les obtenir).
  jsonbin: {
    binId: "6a6277cdf5f4af5e29b82f87",
    masterKey: "$2a$10$QysTW46SWdDuSbQnfvfPnOkKrQ.w9uS38bhC9QOL4Xd5r7XsTep9G",
  },
};
