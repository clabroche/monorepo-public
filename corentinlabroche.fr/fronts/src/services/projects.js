
export default {
  fractalsProjects: {
    label: 'Fractales',
    values: [{
    img: '/img/fern.webp',
    header: 'Fougère de Barnsley',
    description: 'La fougère de Barnsley est une fractale nommée d\'après le mathématicien Michael Barnsley qui l\'a décrite pour la première fois dans son livre Fractals Everywhere.',
    links: [
      { type: 'github', url: 'https://github.com/clabroche/barnsleyFern' },
      { type: 'globe', url: 'https://clabroche.github.io/barnsleyFern' },
    ]
  }, {
    img: '/img/sierpinski.webp',
    header: 'Triangle de Sierpiński',
    description: 'Le triangle de Sierpiński, ou tamis de Sierpińsky, également appelé par Mandelbrot le joint de culasse de Sierpiński1, est une fractale, du nom de Wacław Sierpiński qui l\'a décrit en 19152.',
    links: [
      { type: 'github', url: 'https://github.com/clabroche/sierpinski' },
      { type: 'globe', url: 'https://clabroche.github.io/sierpinski' },
    ]
  }, {
    img: '/img/sandpile.webp',
    header: 'Abelian sandpile model',
    description: 'La pente s\'accumule lorsque des «grains de sable» (ou «copeaux») sont placés au hasard sur le tas, jusqu\'à ce que la pente dépasse une valeur seuil spécifique, moment auquel ce site s\'effondre, transférant du sable dans les sites adjacents, augmentant leur pente.',
    links: [
      { type: 'github', url: 'https://github.com/clabroche/SandPile' },
    ]
  }]},
  
  android: {
    label: 'Applications mobiles',
    values: [{
    img: '/img/rhea.webp',
    header: 'Rhea',
    description: 'Faites votre liste de courses, gérez votre inventaire, planifiez vos repas pour la semaine, importez une recette.',
    links: [
      { type: 'github', url: 'https://github.com/clabroche/rhea' },
      { type: 'globe', url: 'https://rhea.corentinlabroche.fr/' },
      { type: 'android', url: 'https://rhea.corentinlabroche.fr/rhea.apk' },
    ]
  }, {
    img: '/img/dice.webp',
    header: 'Random app',
    description: 'Randomisez un ensemble de mots ou cliquez sur un dé pour obtenir un nombre. Conçu pour une utilisation sur mobile.',
    links: [
      { type: 'github', url: 'https://github.com/clabroche/randomapp/' },
      { type: 'globe', url: 'https://randomapp.corentinlabroche.fr' },
      { type: 'android', url: 'https://randomapp.corentinlabroche.fr/randomapp.apk' },
    ]
  }]},
  
  cli: {
    label: 'Ligne de commande ou librairies',
    values: [{
    img: '/img/objectvalidity.webp',
    header: 'Object-validity',
    description: 'Valider un objet JS ou json par rapport à un schéma',
    links: [
      { type: 'github', url: 'https://github.com/clabroche/object-validity' },
      { type: 'npm', url: 'https://www.npmjs.com/package/@iryu54/object-validity' },
    ]
  }, {
    img: '/img/gitmanagerjs.webp',
    header: 'Gitmanagerjs',
    description: 'Ce module vise à utiliser git programmatiquement car la ligne de commande renvoie certains succès dans stderr.',
    links: [
      { type: 'github', url: 'https://github.com/clabroche/GitManager.js' },
      { type: 'npm', url: 'https://www.npmjs.com/package/gitmanagerjs' },
    ]
  }, {
    img: '/img/pdffigureextractor.webp',
    header: 'Pdf-figure-extractor',
    description: 'Extraire des figures d\'un pdf sans texte',
    links: [
      { type: 'github', url: 'https://github.com/Inist-CNRS/pdf-figure-extractor' },
      { type: 'npm', url: 'https://www.npmjs.com/package/pdf-figure-extractor' },
    ]
  }, {
    img: '/img/fbterm.webp',
    header: 'Fbterm',
    description: 'Utiliser Facebook Messenger dans un terminal',
    links: [
      { type: 'github', url: 'https://github.com/clabroche/fbTerm' },
      { type: 'npm', url: 'https://www.npmjs.com/package/@iryu54/fbterm' },
    ]
  }, {
    img: '/img/nmsjs.webp',
    header: 'Nms-js',
    description: 'Décrypter toutes les commandes non cryptés',
    links: [
      { type: 'github', url: 'https://github.com/clabroche/nms-js' },
      { type: 'npm', url: 'https://www.npmjs.com/package/@iryu54/nmsjs' },
    ]
  }]},
  
  games: {
    label: 'Jeux',
    values: [{
    img: '/img/minesweeper.webp',
    header: 'Minesweeper',
    description: 'L\'objectif du jeu est de désamorcer un plateau rectangulaire contenant des «mines» cachées sans faire exploser aucune d\'entre elles, à l\'aide d\'indices sur le nombre de mines voisines dans chaque champ',
    links: [
      { type: 'github', url: 'https://github.com/clabroche/minesweeper' },
      { type: 'globe', url: 'http://corentinlabroche.fr:9090/games' },
    ]
  }, {
    img: '/img/motsMeles.webp',
    header: 'MotsMeles',
    description: 'Trouvez tous les mots dans une grille pleine de lettres.',
    links: [
      { type: 'github', url: 'https://clabroche.github.io/motsMeles/' },
      { type: 'globe', url: 'https://clabroche.github.io/motsMeles/' },
    ]
  }]},
  
  webPOC: {
    label: 'Preuves de concept',
    values: [{
    img: '/img/particles.webp',
    header: 'Particle',
    description: 'Affichez des particules dans un canvas.',
    links: [
      { type: 'github', url: 'https://github.com/clabroche/particle' },
      { type: 'globe', url: 'https://clabroche.github.io/particle' },
    ]
  }, {
    img: '/img/rain.webp',
    header: 'Rain',
    description: 'Affichez de la pluie dans un canvas.',
    links: [
      { type: 'github', url: 'https://github.com/clabroche/rain' },
      { type: 'globe', url: 'https://clabroche.github.io/rain/' },
    ]
  }]},
  
  web: {
    label: 'Web',
    values: [{
    img: '/img/stackmonitor.webp',
    header: 'Stack monitor',
    description: 'Gérez et assemblez vos microservices à un seul et même endroit. Il vous suffit de décrire votre stack avec une config et de lancer ce package pour les lancer en parrallèle',
    links: [
      { type: 'github', url: 'https://github.com/clabroche/stack-monitor' },
      { type: 'npm', url: 'https://www.npmjs.com/package/@iryu54/stack-monitor' },
    ]
  }]},
}