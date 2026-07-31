const STATUS = {
  BROUILLON: 'brouillon',
  EN_ATTENTE: 'en_attente',
  PREPAREE: 'preparee',
  LIVREE: 'livree',
};

const permissionsStatus = {
  accueil: {
    [STATUS.BROUILLON]: [STATUS.EN_ATTENTE],
    [STATUS.PREPAREE]: [STATUS.LIVREE],
  },
  preparateur: {
    [STATUS.EN_ATTENTE]: [STATUS.PREPAREE],
    [STATUS.PREPAREE]: [], // ne peut rien faire d'autre
  },
}

module.exports = {STATUS, permissionsStatus};