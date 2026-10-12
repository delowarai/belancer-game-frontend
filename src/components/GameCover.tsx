import {useState} from 'react';
import {defaultGames} from '../games/catalog';
import {additionalPracticeGames} from '../games/practiceGames';
const covers=new Set([...defaultGames,...additionalPracticeGames].map(game=>game.slug));
export default function GameCover({slug,icon,className='catalog-art'}:{slug:string;icon?:string;className?:string}){
 const [failed,setFailed]=useState(false);
 return <div className={`${className} game-cover`} aria-hidden="true">{covers.has(slug)&&!failed?<img src={`/game-covers/${slug}.svg`} alt="" loading="lazy" decoding="async" onError={()=>setFailed(true)}/>:<span className="catalog-art-mark">{icon||'✦'}</span>}</div>;
}
