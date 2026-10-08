import React from 'react';

const skills=[
  {icon:'✦',title:'Memory practice',description:'Remember patterns and card positions, then try to recall them when the game asks.'},
  {icon:'◎',title:'Focused attention',description:'Look for a particular detail while ignoring other symbols and distractions.'},
  {icon:'ϟ',title:'Quick decisions',description:'Make a choice, see the result and move on to the next short round.'},
  {icon:'↗',title:'Flexible thinking',description:'Switch between different tasks and try a fresh way to approach a puzzle.'},
  {icon:'◇',title:'Problem solving',description:'Compare your options, spot patterns and plan a few steps ahead.'},
];

const fallbackFaq=[
  {question:'Can I play for free?',answer:'Yes. Free practice games can be played without an account. Sign in when you want to enter a ranked daily challenge.'},
  {question:'What do game scores mean?',answer:'Scores describe your result in that specific game and challenge. They are not a measure of intelligence or a health assessment.'},
  {question:'How do daily challenges work?',answer:'Published challenges have fixed rules and limited attempts. Sign in to start one; validated results can appear on that game’s leaderboard.'},
  {question:'Are practice games ranked?',answer:'No. Locally hosted practice games are for fun and do not submit results to ranked leaderboards.'},
];

const additionalFaq=[
  {question:'Can I play on my phone?',answer:'Yes. The games and catalog are designed to adapt to smaller screens, so you can play in a mobile browser.'},
  {question:'How can I get better at a game?',answer:'Play at a comfortable pace, learn each game’s rules and try a few practice rounds. Results can vary from one round to another.'},
];

export default function BrainGamesInfo({faq=[]}:{faq?:any[]}){
  const questions=[...(faq.length?faq:fallbackFaq),...additionalFaq];
  return <div className="brain-info">
    <section className="brain-info-intro"><div className="brain-info-copy"><div className="eyebrow">A LITTLE CONTEXT</div><h2>What are brain games?</h2><p>Brain games are short puzzles and activities built around tasks like remembering a pattern, spotting a detail or solving a problem. Each game gives you a simple way to practise that activity and see how you did.</p><p>They’re meant for play and practice—not to diagnose a condition or promise changes to your health or intelligence.</p><a className="text-link" href="/games">Explore the games <span aria-hidden="true">↗</span></a></div><div className="brain-info-note"><span aria-hidden="true">✦</span><strong>Pick a game. Take a few minutes. Enjoy the challenge.</strong></div></section>

    <section className="brain-info-skills"><div className="brain-info-heading"><div className="eyebrow">A MIX OF WAYS TO PLAY</div><h2>Different games, different skills.</h2><p>Choose what sounds fun today; you can always try another kind tomorrow.</p></div><div className="skill-cards">{skills.map((skill,index)=><article className="skill-card" key={skill.title}><span className={`skill-icon skill-icon-${index+1}`} aria-hidden="true">{skill.icon}</span><h3>{skill.title}</h3><p>{skill.description}</p></article>)}</div></section>

    <section className="brain-info-tips"><div><div className="eyebrow">MAKE IT YOUR OWN</div><h2>A few easy ways to play</h2></div><div className="tip-list"><article><span>01</span><div><h3>Start with a game you enjoy</h3><p>Try a short practice round first. There’s no need to rush into a ranked challenge.</p></div></article><article><span>02</span><div><h3>Take breaks when you need them</h3><p>Play at a comfortable pace and stop whenever you’re ready.</p></div></article><article><span>03</span><div><h3>Compare like with like</h3><p>Scores from different games or challenge settings are not directly comparable.</p></div></article></div></section>

    <section className="brain-info-faq"><div className="brain-info-heading"><div className="eyebrow">GOOD TO KNOW</div><h2>Frequently asked questions</h2></div><div className="brain-faq-list">{questions.map((item:any,index:number)=><details key={`${item.question}-${index}`}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div></section>

    <section className="brain-info-about"><div className="brain-info-heading"><div className="eyebrow">MADE FOR A MOMENT OF PLAY</div><h2>How Belancer games work</h2><p>Pick how you want to play. Every game makes its rules clear before you start.</p></div><div className="about-cards"><article><span aria-hidden="true">◈</span><h3>Practice on your terms</h3><p>Try available games at your own pace. Practice results stay separate from ranked scores.</p></article><article><span aria-hidden="true">✦</span><h3>Know the rules</h3><p>Ranked challenges use published rules, and the game checks submitted answers before recording a result.</p></article><article><span aria-hidden="true">↗</span><h3>See how you did</h3><p>Review your result and, for supported ranked games, compare it on the matching leaderboard.</p></article></div></section>

    <section className="brain-info-cta"><div className="eyebrow">READY WHEN YOU ARE</div><h2>Find a game that fits your mood.</h2><p>Try a quick practice round or explore today’s challenges.</p><div className="actions"><a className="button" href="/games">Browse games ↗</a><a href="/challenges">See daily challenges →</a></div></section>
  </div>;
}
