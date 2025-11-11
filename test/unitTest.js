import {emotionColorMap} from '../data/emotionColorMap.js';
import {stopwords} from '../data/stopwords.js';
import {aliasByKey} from '../data/aliasByKey.js';


let i = 0;
const group = emotionColorMap[0];
for (i = 0; i < 3; i++) {
    console.log(group.examples[i]);
}
//h \n i \n ! 이렇게 잘 나옴