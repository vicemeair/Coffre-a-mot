// ============================================
// CONFIGURATION DU COFFRE À MOTS
// Modifie les valeurs ci-dessous, c'est tout.
// ============================================

const CONFIG = {
  players: {
    // Emery : coffre toujours déverrouillé (alwaysUnlocked: true).
    j1: { name: "Emery", code: "0629", alwaysUnlocked: true },

    // Alana : coffre verrouillé de 9h à 17h, déverrouillé de 17h à 9h du matin.
    j2: { name: "Alana", code: "3926", alwaysUnlocked: false, revealStartHour: 17, revealEndHour: 9 },
  },

  // Identifiants JSONBin.io (voir INSTRUCTIONS.md pour savoir comment les obtenir).
  jsonbin: {
    binId: "6a6277cdf5f4af5e29b82f87",
    masterKey: "$2a$10$QysTW46SWdDuSbQnfvfPnOkKrQ.w9uS38bhC9QOL4Xd5r7XsTep9G",
  },
};
