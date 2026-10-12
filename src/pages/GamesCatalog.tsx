import GameCover from '../components/GameCover';
import {useState} from 'react';

const categoryInfo:Record<string,string>={
  Memory:'Train recall by remembering patterns, positions and sequences.',
  Speed:'Think quickly and make confident choices under pressure.',
  Attention:'Spot important details and ignore visual distractions.',
  Flexibility:'Switch between rules and see familiar things in a new way.',
  'Problem Solving':'Plan ahead, recognize patterns and find a winning move.',
  Word:'Exercise your vocabulary by finding words in a new order.',
  Math:'Build number fluency with quick, bite-sized challenges.',
};
const categorySlug=(category:string)=>category.toLowerCase().replaceAll(' ','-');

export default function GamesCatalog({games}:{games:any[]}){
  const [expanded,setExpanded]=useState<Record<string,boolean>>({});
  const categories=Object.keys(categoryInfo).filter(category=>games.some(game=>game.category===category));

  return <section className="games-catalog">
    <div className="catalog-intro"><div className="eyebrow">FIND YOUR NEXT FAVORITE</div><h1>Find your next challenge.</h1><p>Choose a skill, discover a game, and enjoy a little time for your mind.</p></div>
    <nav className="skill-filter" aria-label="Filter games by skill">
      {categories.map(category=><a key={category} href={`#${categorySlug(category)}-games`}>{category}</a>)}
    </nav>
    {categories.map(category=>{
      const categoryGames=games.filter(game=>game.category===category&&game.available!==false);
      if(!categoryGames.length)return null;
      return <section className="skill-section" id={`${categorySlug(category)}-games`} key={category}>
        <div className="section-heading"><div><h2>{category} Games</h2><p>{categoryInfo[category]}</p></div></div>
        <div className="catalog-cards" id={`${categorySlug(category)}-cards`}>{(expanded[category]?categoryGames:categoryGames.slice(0,4)).map(game=><a href={`/play/${game.slug}`} className="catalog-card" key={game.slug}>
          <GameCover slug={game.slug} icon={game.icon}/>
          <div className="catalog-copy"><span className="tag">{game.access==='premium'?'Premium':game.practiceOnly?'Free practice':category}</span><h3>{game.name}</h3><p>{game.description}</p><span className="catalog-play">{game.access==='premium'?'View access':'Play now'} <span aria-hidden="true">↗</span></span></div>
        </a>)}</div>
        {categoryGames.length>4&&<div className="catalog-more"><button className="secondary" aria-expanded={!!expanded[category]} aria-controls={`${categorySlug(category)}-cards`} onClick={()=>setExpanded(previous=>({...previous,[category]:!previous[category]}))}>{expanded[category]?'Show less ↑':`More games (${categoryGames.length-4}) ↓`}</button></div>}
      </section>;
    })}
  </section>;
}
