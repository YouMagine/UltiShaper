var LANG;
var LANG_EN_EN = {
    assembly: 'assembly',
    cursor: 'cursor',
    inputField: 'input field',
    polygons: 'polygons',
    math: 'math',
    logic: 'logic',
    control: 'control',
    lists: 'lists',
    text: 'text',
    variables: 'variables',
    procedures: 'procedures',
    subtract: 'subtract',
    combine: 'combine',
    overlapping: 'overlapping',
    shape: 'shape',
    part: 'part',
    diameter: 'diameter',
    width: 'width',
    depth: 'depth',
    height: 'height',
    center: 'center',
    cube: 'cube',
    sphere: 'sphere',
    cylinder: 'cylinder',
    radius: 'radius',
    cone: 'cone',
    move: 'move',
    moveTo: 'move to (absolute)',
    rotateTo: 'rotate to (absolute)',
    moveBy: 'move by',
    rotateBy: 'rotate by',
    rotate: 'rotate',
    switchLangResets: "Switching languages will reset your current design. Are you sure you want to switch?"

  };
var LANG_NL_NL = {
    assembly: 'samenstelling',
    cursor: 'cursor',
    inputField: 'invoerveld',
    polygons: 'polygonen',
    math: 'wiskunde',
    logic: 'logica',
    control: 'besturing',
    lists: 'lijsten',
    text: 'tekst',
    variables: 'variabelen',
    procedures: 'procedures',
    subtract: 'aftrekken',
    combine: 'combineren',
    overlapping: 'overlappend',
    shape: 'vorm',
    part: 'onderdeel',
    diameter: 'diameter',
    width: 'breedte',
    depth: 'diepte',
    height: 'hoogte',
    center: 'centreren',
    hoogte: 'hoogte',
    cube: 'kubus',
    sphere: 'bol',
    cylinder: 'cylinder',
    radius: 'straal',
    cone: 'conus',
    move: 'verplaatsen',
    moveTo: 'verplaats naar (absoluut)',
    rotateTo: 'roteer naar (absoluut)',
    moveBy: 'verplaats met (relatief)',
    rotateBy: 'roteer met (relatief)',
    rotate: 'roteren',
    switchLangResets: "Wisselen van taal wist je huidige ontwerp. Weet je zeker dat je op Nederlands wilt overschakelen?"
  };
var LANG_DE_DE = {
    switchLangResets: "Your current design will be lost. Are you sure you want to switch languages?"
};

function getLang(string){
    if(typeof LANG[string] === 'string') return LANG[string];
    console.log("Could not translate",string);
    $.post('translations.json', { translation: {fromtext: string, translation: string, language: urlLang } })
    .done(function(data) {
    console.log("Data Loaded: " , data);
    });

    return string;
}
function ucfirst(string)
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}
