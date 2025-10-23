# Syntax Highlighter and Formatter

JavaScript toolkit that formats and colorises code snippets for HTML pages, with per-language theming and rich animations.

## Fonctionnalités

- mise en forme automatique des blocs JS, CSS, HTML et Python
- colorisation configurable par type de jeton et par langage
- génération de numéros de ligne et thèmes animés prêts à l'emploi
- API simple pour rendre dans n'importe quel conteneur HTML

## Prise en main rapide

1. ouvrir `index.html` dans un navigateur moderne
2. choisir un langage et coller un extrait dans la zone de texte
3. cliquer sur **Formatter et coloriser** pour afficher le rendu

Pour intégrer l'outil dans un projet existant, importer `assets/formatter.js` puis instancier le formateur :

```html
<div id="preview"></div>
<script src="assets/formatter.js"></script>
<script>
    const formatter = new SyntaxFormatter();
    const block = document.getElementById("preview");
    const code = "const hello = name => `Bonjour ${name}`;";
    formatter.render(block, code, "js");
</script>
```

## Personnalisation des thèmes

Chaque langage possède sa configuration indépendante. Fusionnez une nouvelle configuration avec `updateConfig` pour ajuster couleurs, italique ou gras :

```js
const formatter = new SyntaxFormatter();
formatter.updateConfig({
    languages: {
        python: {
            indentSize: 2,
            theme: {
                keyword: { color: "#ff7a59", fontWeight: "700" },
                string: { color: "#ffe066", fontStyle: "italic" },
                comment: { color: "#94a3b8", fontStyle: "italic" }
            }
        }
    }
});
```

Les propriétés acceptées dans une règle de thème correspondent à toute propriété CSS valide (`color`, `fontWeight`, `fontStyle`, etc.). Seules les valeurs définies sont ajoutées à la feuille de style générée.

## API

- `format(code, language)` : renvoie la chaîne formatée sans colorisation
- `highlight(code, language)` : renvoie le HTML colorisé sans reformater
- `formatAndHighlight(code, language)` : combine formatage et colorisation
- `render(targetElement, code, language)` : injecte un bloc complet avec numéros de ligne
- `updateConfig(partialConfig)` : fusionne la configuration fournie avec les valeurs par défaut

## Tests rapides

Ouvrez `index.html`, jouez avec le bouton **Appliquer un thème alternatif** puis alternez les langages pour vérifier que chaque configuration agit indépendamment.
