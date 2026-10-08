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
  const categories=Object.keys(categoryInfo).filter(category=>games.some(game=>game.category===category));

  return <section className="games-catalog">
    <div className="catalog-intro"><div className="eyebrow">FIND YOUR NEXT FAVORITE</div><h1>Explore games by skill.</h1><p>Pick a skill, find a game and play at your own pace.</p></div>
    <nav className="skill-filter" aria-label="Filter games by skill">
      {categories.map(category=><a key={category} href={`#${categorySlug(category)}-games`}>{category}</a>)}
    </nav>
    {categories.map(category=>{
      const categoryGames=games.filter(game=>game.category===category&&game.available!==false);
      if(!categoryGames.length)return null;
      return <section className="skill-section" id={`${categorySlug(category)}-games`} key={category}>
        <div className="section-heading"><div><h2>{category} Games</h2><p>{categoryInfo[category]}</p></div></div>
        <div className="catalog-cards">{categoryGames.map(game=><a href={`/games/${game.slug}`} className="catalog-card" key={game.slug}>
          <div className="catalog-art" style={{background:game.color,color:game.ink}} aria-hidden="true">
            <span className="catalog-art-mark">{game.icon}</span><span className="catalog-art-spark">✦</span>
          </div>
          <div className="catalog-copy"><span className="tag">{game.practiceOnly?'Free practice':category}</span><h3>{game.name}</h3><p>{game.description}</p><span className="catalog-play">Play now <span aria-hidden="true">↗</span></span></div>
        </a>)}</div>
      </section>;
    })}
  </section>;
}
